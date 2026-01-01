import https from 'https';
import { createBrotliDecompress } from 'zlib';
import { WEAPON_SLOTS } from '@/lib/weaponSlots';

export const revalidate = 300; // Cache for 5 minutes

// In-memory cache that persists across requests
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

const EXCLUDED_PATTERNS = [
  'Sealed Graffiti', 'Graffiti', 'Sticker', 'Patch', 'Music Kit',
  'Pin', 'Key', 'Case', 'Capsule', 'Package', 'Tag', 'Tool', 'Pass',
  'Medal', 'Coin'
];

function isExcluded(name) {
  if (name.includes('Souvenir')) return true;
  return EXCLUDED_PATTERNS.some(pattern => name.includes(pattern));
}

function matchesWeaponSlot(itemName, slotId) {
  const slot = WEAPON_SLOTS[slotId];
  if (!slot) return false;

  // Premium items (knives/gloves) require star prefix
  if (slot.starPrefix) {
    if (!itemName.startsWith('★')) return false;
  } else {
    // Regular weapons should NOT have star prefix
    if (itemName.startsWith('★')) return false;
  }

  return slot.patterns.some(pattern => itemName.includes(pattern));
}

function getBaseName(marketHashName) {
  return marketHashName
    .replace(/StatTrak™\s*/g, '')
    .replace(/\s*\([^)]+\)\s*$/g, '')
    .trim();
}

function getSkinName(baseName) {
  // Extract just the skin name from "Weapon | Skin Name"
  const parts = baseName.split(' | ');
  return parts.length > 1 ? parts[1] : baseName;
}

function extractCondition(name) {
  if (name.includes('(Minimal Wear)')) return 'Minimal Wear';
  if (name.includes('(Field-Tested)')) return 'Field-Tested';
  if (name.includes('(Well-Worn)')) return 'Well-Worn';
  if (name.includes('(Battle-Scarred)')) return 'Battle-Scarred';
  if (name.includes('(Factory New)')) return 'Factory New';
  if (name.includes('Vanilla') || !name.includes('|')) return 'Vanilla';
  return 'Factory New';
}

function processItems(items) {
  const groups = new Map();

  for (const item of items) {
    const baseName = getBaseName(item.market_hash_name);

    if (!groups.has(baseName)) {
      groups.set(baseName, {
        name: baseName,
        skinName: getSkinName(baseName),
        baseName: baseName,
        image: null,
        variants: []
      });
    }

    const group = groups.get(baseName);

    group.variants.push({
      fullName: item.market_hash_name,
      condition: extractCondition(item.market_hash_name),
      price: item.suggested_price
    });
  }

  const result = [];
  for (const group of groups.values()) {
    group.variants.sort((a, b) => a.price - b.price);
    group.min_price = group.variants[0].price;
    result.push(group);
  }

  // Sort by price (cheapest first)
  result.sort((a, b) => a.min_price - b.min_price);

  return result;
}

async function fetchSkinportData() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.skinport.com',
      path: '/v1/items?currency=USD',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'br',
        'User-Agent': 'ComboScout/1.0',
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errorData = '';
        res.on('data', chunk => errorData += chunk.toString());
        res.on('end', () => {
          reject(new Error(`Skinport API error: ${res.statusCode}`));
        });
        return;
      }

      const chunks = [];
      const contentEncoding = res.headers['content-encoding'];

      if (contentEncoding === 'br') {
        const decompressor = createBrotliDecompress();
        decompressor.on('data', chunk => chunks.push(chunk));
        decompressor.on('end', () => {
          try {
            const rawData = Buffer.concat(chunks).toString();
            resolve(JSON.parse(rawData));
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
        decompressor.on('error', error => {
          reject(new Error(`Decompression error: ${error.message}`));
        });
        res.pipe(decompressor);
      } else {
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          try {
            const rawData = Buffer.concat(chunks).toString();
            resolve(JSON.parse(rawData));
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
        res.on('error', error => {
          reject(new Error(`Response error: ${error.message}`));
        });
      }
    });

    req.on('error', error => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.end();
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slotId = searchParams.get('type');

  // Validate slot ID
  if (!slotId || !WEAPON_SLOTS[slotId]) {
    return Response.json(
      { error: 'Invalid weapon type', validTypes: Object.keys(WEAPON_SLOTS) },
      { status: 400 }
    );
  }

  const slot = WEAPON_SLOTS[slotId];

  // Return cached data if still valid
  const now = Date.now();
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    // Filter cached data for this weapon type
    const filtered = cachedData.filter(item => {
      const name = item.market_hash_name || '';
      if (isExcluded(name)) return false;
      if (!item.suggested_price) return false;
      return matchesWeaponSlot(name, slotId);
    });

    const processed = processItems(filtered);
    console.log(`Returning cached ${slot.label} data: ${processed.length} skins`);

    return Response.json({
      weapon: slot.label,
      slotId: slotId,
      skins: processed,
    });
  }

  try {
    const data = await fetchSkinportData();

    if (!Array.isArray(data)) {
      throw new Error('API returned non-array data');
    }

    // Cache the raw data
    cachedData = data;
    cacheTimestamp = now;

    // Filter for requested weapon type
    const filtered = data.filter(item => {
      const name = item.market_hash_name || '';
      if (isExcluded(name)) return false;
      if (!item.suggested_price) return false;
      return matchesWeaponSlot(name, slotId);
    });

    const processed = processItems(filtered);
    console.log(`Processed ${processed.length} ${slot.label} skins`);

    return Response.json({
      weapon: slot.label,
      slotId: slotId,
      skins: processed,
    });
  } catch (error) {
    console.error('Error fetching weapon skins:', error.message);

    // If we have stale cache, try to use it
    if (cachedData) {
      const filtered = cachedData.filter(item => {
        const name = item.market_hash_name || '';
        if (isExcluded(name)) return false;
        if (!item.suggested_price) return false;
        return matchesWeaponSlot(name, slotId);
      });

      const processed = processItems(filtered);
      console.log('Returning stale cache due to error');

      return Response.json({
        weapon: slot.label,
        slotId: slotId,
        skins: processed,
      });
    }

    return Response.json(
      {
        error: 'Failed to fetch weapon skins',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
