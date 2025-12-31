import https from 'https';
import { createBrotliDecompress } from 'zlib';

export const revalidate = 300; // Cache for 5 minutes

// In-memory cache that persists across requests (works in dev too)
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

const KNIFE_PATTERNS = [
  'Knife', 'Bayonet', 'Karambit', 'Daggers', 'Butterfly', 'Huntsman',
  'Falchion', 'Shadow', 'Bowie', 'Gut', 'Flip', 'M9 Bayonet', 'Navaja',
  'Stiletto', 'Talon', 'Ursus', 'Skeleton', 'Survival', 'Paracord',
  'Classic', 'Nomad', 'Kukri'
];

const EXCLUDED_PATTERNS = [
  'Sealed Graffiti', 'Graffiti', 'Sticker', 'Patch', 'Music Kit',
  'Pin', 'Key', 'Case', 'Capsule', 'Package', 'Tag', 'Tool', 'Pass',
  'Medal', 'Coin'
];

function isKnife(name) {
  if (!name.startsWith('★')) return false;
  return KNIFE_PATTERNS.some(pattern => name.includes(pattern));
}

function isGlove(name) {
  if (!name.startsWith('★')) return false;
  return name.includes('Gloves') || name.includes('Wraps');
}

function isExcluded(name) {
  if (name.includes('Souvenir')) return true;
  return EXCLUDED_PATTERNS.some(pattern => name.includes(pattern));
}

function getBaseName(marketHashName) {
  return marketHashName
    .replace(/StatTrak™\s*/g, '')
    .replace(/\s*\([^)]+\)\s*$/g, '')
    .trim();
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

export async function GET() {
  // Return cached data if still valid
  const now = Date.now();
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Returning cached price data');
    return Response.json(cachedData);
  }

  try {
    const data = await fetchSkinportData();

    if (!Array.isArray(data)) {
      throw new Error('API returned non-array data');
    }

    const filtered = data.filter(item => {
      const name = item.market_hash_name || '';
      if (isExcluded(name)) return false;
      if (!item.suggested_price) return false;
      return isKnife(name) || isGlove(name);
    });

    const knives = filtered.filter(item => isKnife(item.market_hash_name));
    const gloves = filtered.filter(item => isGlove(item.market_hash_name));

    const processedKnives = processItems(knives);
    const processedGloves = processItems(gloves);

    console.log(`Processed ${processedKnives.length} knives and ${processedGloves.length} gloves`);

    // Cache the result
    cachedData = {
      knives: processedKnives,
      gloves: processedGloves,
    };
    cacheTimestamp = now;

    return Response.json(cachedData);
  } catch (error) {
    console.error('Error fetching prices:', error.message);

    // If we have stale cache, return it instead of erroring
    if (cachedData) {
      console.log('Returning stale cache due to error');
      return Response.json(cachedData);
    }

    return Response.json(
      {
        error: 'Failed to fetch prices',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
