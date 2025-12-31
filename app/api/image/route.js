const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

let skinDatabase = null;
let skinDbTimestamp = 0;
const SKIN_DB_TTL = 1000 * 60 * 30; // 30 minutes

function getFromCache(name) {
  const entry = cache.get(name);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(name);
    return null;
  }
  return entry.url;
}

function setCache(name, url) {
  cache.set(name, { url, timestamp: Date.now() });
}

function normalizeName(name) {
  return name
    .replace(/★\s*/g, '')
    .replace(/StatTrak™\s*/g, '')
    .replace(/\s*\([^)]+\)\s*$/g, '') // Remove (Factory New) etc
    .trim()
    .toLowerCase();
}

async function getSkinDatabase() {
  if (skinDatabase && Date.now() - skinDbTimestamp < SKIN_DB_TTL) {
    return skinDatabase;
  }

  try {
    // Use raw.githubusercontent.com - the github.io URLs redirect/fail
    // skins.json contains ALL skins including knives and gloves
    const response = await fetch(
      'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json',
      {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ComboScout/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch CSGO-API:', response.status);
      return null;
    }

    const skins = await response.json();
    const db = new Map();

    // Process all skins (includes knives, gloves, and weapon skins)
    for (const skin of skins) {
      if (skin.image && skin.name) {
        const normalized = normalizeName(skin.name);
        db.set(normalized, skin.image);

        // Also store with weapon category for better matching
        // e.g., "karambit | crimson web" from "★ Karambit | Crimson Web"
        if (skin.weapon?.name) {
          const weaponKey = `${skin.weapon.name.toLowerCase()} | ${skin.pattern?.name?.toLowerCase() || ''}`.trim();
          if (weaponKey && !db.has(weaponKey)) {
            db.set(weaponKey, skin.image);
          }
        }
      }
    }

    skinDatabase = db;
    skinDbTimestamp = Date.now();
    console.log(`Loaded ${db.size} skin images from CSGO-API`);

    return db;
  } catch (err) {
    console.error('Error fetching CSGO-API:', err.message);
    return null;
  }
}

async function findImage(marketHashName) {
  const db = await getSkinDatabase();
  if (!db) return null;

  const normalized = normalizeName(marketHashName);

  // Direct match
  if (db.has(normalized)) {
    return db.get(normalized);
  }

  // Try without the star symbol in different ways
  const variants = [
    normalized,
    normalized.replace('★ ', ''),
    normalized.replace('★', ''),
  ];

  for (const variant of variants) {
    if (db.has(variant)) {
      return db.get(variant);
    }
  }

  // Partial match - check if database key contains our search term
  for (const [key, url] of db) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return url;
    }
  }

  // Fuzzy match for "weapon | skin" pattern
  const nameParts = normalized.split('|').map(p => p.trim());
  if (nameParts.length === 2) {
    const [weapon, skin] = nameParts;
    for (const [key, url] of db) {
      if (key.includes(weapon) && key.includes(skin)) {
        return url;
      }
    }

    // Try just the skin name for knives (e.g., "crimson web" matches "karambit | crimson web")
    for (const [key, url] of db) {
      if (key.includes(skin) && (
        key.includes('karambit') ||
        key.includes('bayonet') ||
        key.includes('butterfly') ||
        key.includes('knife') ||
        key.includes('daggers') ||
        key.includes('gloves') ||
        key.includes('wraps')
      )) {
        // Make sure weapon type also matches loosely
        const keyWeapon = key.split('|')[0]?.trim();
        if (keyWeapon && weapon.includes(keyWeapon.split(' ').pop())) {
          return url;
        }
      }
    }
  }

  return null;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return Response.json({ error: 'name required' }, { status: 400 });
  }

  const cached = getFromCache(name);
  if (cached !== null) {
    return Response.json({ url: cached });
  }

  const url = await findImage(name);
  setCache(name, url);

  return Response.json({ url: url || null });
}
