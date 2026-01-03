/**
 * Automated Skin Color Extraction Script
 *
 * Fetches all CS2 skins from CSGO-API, analyzes their images,
 * and extracts dominant HSL colors for the matching algorithm.
 *
 * Usage: node scripts/extractSkinColors.js
 *
 * Output: lib/skinColors/generatedColors.js
 */

const https = require('https');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Existing manually-defined colors (to preserve) - we'll skip these
const EXISTING_COLORS = new Set([
  // AK-47
  'Asiimov', 'Fire Serpent', 'Vulcan', 'Redline', 'Bloodsport', 'Neon Rider',
  'Neon Revolution', 'The Empress', 'Phantom Disruptor', 'Hydroponic',
  'Aquamarine Revenge', 'Fuel Injector', 'Wasteland Rebel', 'Point Disarray',
  'Frontside Misty', 'Ice Coaled', 'Jet Set', 'Blue Laminate', 'Slate',
  'Elite Build', 'Rat Rod', 'Nightwish', 'Legion of Anubis', 'Gold Arabesque',
  'Head Shot', 'Inheritance',
  // M4A4
  'Howl', 'Poseidon', 'Neo-Noir', 'Desolate Space', 'The Emperor', 'Royal Paladin',
  'Buzz Kill', 'Hellfire', 'Temukau', 'In Living Color', 'Spider Lily',
  'Tooth Fairy', 'Zirka', 'Daybreak', 'Griffin', 'Cyber Security',
  'Global Offensive', 'Mainframe',
  // M4A1-S
  'Printstream', 'Hyper Beast', 'Knight', 'Hot Rod', 'Golden Coil',
  "Chantico's Fire", 'Mecha Industries', 'Nightmare', 'Decimator', 'Leaded Glass',
  'Cyrex', 'Master Piece', 'Imminent Danger', 'Blue Phosphor', 'Player Two',
  'Atomic Alloy', 'Icarus Fell', 'Flashback',
  // AWP
  'Dragon Lore', 'Gungnir', 'Medusa', 'The Prince', 'Containment Breach',
  'Lightning Strike', 'Oni Taiji', 'Wildfire', 'Fever Dream', 'Electric Hive',
  'Graphite', 'Corticera', "Man-o'-war", 'Atheris', 'Chromatic Aberration',
  'Exoskeleton', 'Desert Hydra', 'Silk Tiger', 'Mortis', 'Duality', 'BOOM',
  // Desert Eagle
  'Blaze', 'Code Red', 'Golden Koi', 'Kumicho Dragon', 'Conspiracy', 'Hypnotic',
  'Cobalt Disruption', 'Sunset Storm', 'Ocean Drive', 'Trigger Discipline',
  'Light Rail', 'Fennec Fox', 'Crimson Web', 'Pilot', 'Directive',
  'Midnight Storm', 'Hand Cannon',
  // Glock
  'Fade', 'Water Elemental', 'Wasteland Rebel', 'Twilight Galaxy', 'Bullet Queen',
  'Vogue', 'Neo-Noir', 'Dragon Tattoo', 'Brass', 'Synth Leaf', 'Off World',
  'Snack Attack', 'Moonrise', 'Blue Fissure', 'Weasel',
  // USP-S
  'Kill Confirmed', 'Cortex', 'Caiman', 'Orion', 'Monster Mashup', 'Whiteout',
  'Serum', 'Ticket to Hell', 'The Traitor', 'Check Engine', 'Flashback',
  'Purple DDPAT', 'Dark Water', 'Black Lotus', 'Cyrex', 'Blueprint', 'Overgrowth',
  // P250
  'See Ya Later', 'Muertos', 'Cartel', 'Asiimov', 'Undertow', 'Vino Primo',
  // Five-SeveN
  'Hyper Beast', 'Angry Mob', 'Fairy Tale', 'Monkey Business', 'Case Hardened', 'Fowl Play',
  // SMG
  'Primal Saber', 'Blaze', 'Exposure', 'Neon Rider', 'Stalker', 'Hypnotic',
  'Rose Iron', 'Death by Kitty', 'Asiimov', 'Emerald Dragon',
  // Knife/Glove skins from styleMatcher
  'Slaughter', 'Crimson Web', 'Autotronic', 'Ruby', 'Scarlet Shamagh',
  'Rezan the Red', 'Blood Pressure', 'Fade', 'Vice', "Pandora's Box",
  'Doppler', 'Doppler Phase 1', 'Doppler Phase 2', 'Doppler Phase 3', 'Doppler Phase 4',
  'Ultraviolet', 'Freehand', 'Imperial Plaid', 'Sapphire', 'Blue Steel',
  'Bright Water', 'Cobalt Skulls', 'Amphibious', 'Polygon', 'Mogul',
  'Gamma Doppler', 'Gamma Doppler Emerald', 'Superconductor', 'Cool Mint', 'Mint Kimono',
  'Emerald', 'Emerald Web', 'Boreal Forest', 'Forest DDPAT', 'Hedge Maze',
  'Turtle', 'Hydra', 'Rattler', 'Mangrove', 'Spruce DDPAT',
  'Tiger Tooth', 'Lore', 'Gold Arabesque', 'Case Hardened', 'Yellow-banded',
  'Big Game', 'Badlands', 'Pow!', 'Foundation', 'Marble Fade', 'Fire & Ice',
  'Rust Coat', 'Leather', 'Bronzed', 'Arid', 'Overtake', 'Safari Mesh', 'Convoy',
  'Black Laminate', 'Night', 'Nocts', 'Slate', 'Eclipse', 'Unhinged', 'Black Tie', 'Charred',
  'Vanilla', 'Stained', 'Damascus Steel', 'King Snake', 'Snow Leopard',
  'Urban Masked', 'Smoke Out', 'Broken Fang', 'Giraffe', 'Slingshot',
  'Transport', 'Diamondback', 'Overprint', 'Finish Line', 'Guerrilla',
  '3rd Commando', 'Stitched', 'Snakebite', 'Buckshot', 'Needle Point', 'Jaguar Queen',
]);

// Texture inference from keywords in skin names
const TEXTURE_KEYWORDS = {
  tech: ['asiimov', 'mecha', 'cyber', 'circuit', 'mainframe', 'electron', 'phosphor', 'blueprint', 'industries', 'module', 'processor', 'core'],
  neon: ['neon', 'glow', 'synth', 'electric', 'laser'],
  organic: ['hydroponic', 'overgrowth', 'moss', 'leaf', 'flora', 'bloom', 'vine', 'forest', 'garden'],
  animal: ['serpent', 'dragon', 'tiger', 'wolf', 'beast', 'panther', 'jaguar', 'fox', 'snake', 'spider', 'scorpion', 'hawk', 'eagle', 'owl'],
  reptile: ['caiman', 'rattler', 'python', 'cobra', 'viper', 'lizard', 'gator', 'croc'],
  aquatic: ['koi', 'poseidon', 'ocean', 'wave', 'aqua', 'water', 'hydra', 'coral', 'sea', 'fish', 'shark', 'whale'],
  floral: ['rose', 'lotus', 'lily', 'flower', 'bloom', 'petal', 'blossom', 'cherry'],
  camo: ['ddpat', 'camo', 'safari', 'urban masked', 'guerrilla', 'woodland', 'jungle', 'desert'],
  military: ['commando', 'army', 'soldier', 'battle', 'tactical', 'ops', 'recon', 'squad'],
  industrial: ['rust', 'oxide', 'factory', 'industrial', 'construct', 'build', 'iron', 'steel'],
  worn: ['wasteland', 'rebel', 'worn', 'battle-scarred', 'torn', 'distressed'],
  ornate: ['arabesque', 'empress', 'emperor', 'royal', 'imperial', 'paladin', 'dynasty', 'baroque', 'filigree'],
  ancient: ['lore', 'anubis', 'pharaoh', 'ancient', 'artifact', 'relic', 'temple', 'aztec', 'mayan'],
  gem: ['ruby', 'sapphire', 'emerald', 'diamond', 'crystal', 'opal', 'amethyst', 'quartz'],
  gradient: ['fade', 'marble', 'doppler', 'gamma', 'spectrum', 'chromatic', 'prism', 'aurora'],
  metallic: ['steel', 'iron', 'brass', 'bronze', 'copper', 'silver', 'gold', 'chrome', 'alloy', 'titanium'],
  art: ['graffiti', 'paint', 'canvas', 'art', 'artistic', 'abstract', 'splash', 'ink'],
  pattern: ['plaid', 'stripe', 'check', 'geometric', 'polygon', 'mosaic', 'hex', 'grid'],
  tattoo: ['tattoo', 'ink', 'tribal'],
  japanese: ['oni', 'samurai', 'kimono', 'tatsu', 'kanji', 'shogun', 'yakuza', 'bamboo'],
  psychedelic: ['fever', 'dream', 'trip', 'acid', 'hyper', 'neon'],
  retro: ['retro', 'vintage', 'classic', 'old school', 'arcade', 'pixel', '80s', '90s'],
  stealth: ['night', 'shadow', 'noir', 'black', 'dark', 'stealth', 'covert', 'midnight'],
  horror: ['nightmare', 'hell', 'death', 'skull', 'bone', 'horror', 'demon', 'evil', 'blood'],
  web: ['web', 'spider'],
  fire: ['blaze', 'fire', 'flame', 'inferno', 'burn', 'magma', 'lava', 'hellfire', 'wildfire', 'ember'],
  storm: ['storm', 'lightning', 'thunder', 'electric', 'volt', 'tempest'],
  sport: ['sport', 'race', 'finish', 'champion', 'game', 'play', 'ball'],
  comic: ['boom', 'pow', 'comic', 'cartoon', 'pop'],
  fun: ['kitty', 'candy', 'snack', 'party', 'fun', 'cute', 'bunny'],
  clean: ['printstream', 'whiteout', 'clean', 'minimal', 'pure', 'simple'],
  space: ['galaxy', 'cosmic', 'star', 'nebula', 'astro', 'space', 'orbit', 'comet', 'nova'],
  galaxy: ['doppler', 'twilight', 'aurora', 'constellation'],
  wood: ['wood', 'walnut', 'oak', 'birch', 'maple', 'timber', 'lumber'],
  ice: ['ice', 'frost', 'frozen', 'arctic', 'cold', 'winter', 'snow', 'blizzard'],
};

// Weight inference from keywords
const WEIGHT_KEYWORDS = {
  bold: ['hyper', 'neon', 'fire', 'blaze', 'dragon', 'howl', 'beast', 'fade', 'doppler',
         'ruby', 'sapphire', 'emerald', 'marble', 'lightning', 'boom', 'hot rod', 'blood',
         'lore', 'slaughter', 'tiger', 'crimson', 'inferno', 'hellfire', 'vulcan'],
  subtle: ['ddpat', 'safari', 'urban', 'forest', 'slate', 'vanilla', 'whiteout', 'sand',
           'dust', 'grey', 'gray', 'muted', 'faded', 'worn', 'night', 'dark', 'black'],
};

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100)
  ];
}

// Infer texture from skin name
function inferTexture(skinName) {
  const nameLower = skinName.toLowerCase();

  for (const [texture, keywords] of Object.entries(TEXTURE_KEYWORDS)) {
    if (keywords.some(kw => nameLower.includes(kw))) {
      return texture;
    }
  }

  return 'clean';
}

// Infer weight from skin name
function inferWeight(skinName) {
  const nameLower = skinName.toLowerCase();

  for (const [weight, keywords] of Object.entries(WEIGHT_KEYWORDS)) {
    if (keywords.some(kw => nameLower.includes(kw))) {
      return weight;
    }
  }

  return 'medium';
}

// Fetch image and extract dominant colors
async function extractColorsFromImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(imageUrl);

    const req = https.get(imageUrl, { timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        extractColorsFromImage(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);

          // Use sharp to resize and get raw pixel data
          const { data, info } = await sharp(buffer)
            .resize(50, 50, { fit: 'cover' })
            .flatten({ background: { r: 30, g: 30, b: 30 } }) // Flatten transparency with dark bg
            .raw()
            .toBuffer({ resolveWithObject: true });

          // Sample colors from the image
          const colorBuckets = {};

          for (let i = 0; i < data.length; i += 3) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Skip very dark pixels (likely background)
            if (r < 35 && g < 35 && b < 35) continue;

            const [h, s, l] = rgbToHsl(r, g, b);

            // Create bucket key
            let bucketKey;
            if (s < 12) {
              // Neutral colors - bucket by lightness
              bucketKey = `neutral-${Math.round(l / 20) * 20}`;
            } else {
              // Chromatic colors - bucket by hue (30-degree buckets)
              bucketKey = `hue-${Math.round(h / 30) * 30}`;
            }

            if (!colorBuckets[bucketKey]) {
              colorBuckets[bucketKey] = { count: 0, totalR: 0, totalG: 0, totalB: 0 };
            }
            colorBuckets[bucketKey].count++;
            colorBuckets[bucketKey].totalR += r;
            colorBuckets[bucketKey].totalG += g;
            colorBuckets[bucketKey].totalB += b;
          }

          // Sort buckets by count
          const sortedBuckets = Object.entries(colorBuckets)
            .sort((a, b) => b[1].count - a[1].count);

          if (sortedBuckets.length === 0) {
            resolve(null);
            return;
          }

          // Get primary color
          const primary = sortedBuckets[0][1];
          const primaryR = Math.round(primary.totalR / primary.count);
          const primaryG = Math.round(primary.totalG / primary.count);
          const primaryB = Math.round(primary.totalB / primary.count);
          const primaryHsl = rgbToHsl(primaryR, primaryG, primaryB);

          // Get secondary color
          let secondaryHsl;
          if (sortedBuckets.length > 1) {
            const secondary = sortedBuckets[1][1];
            const secondaryR = Math.round(secondary.totalR / secondary.count);
            const secondaryG = Math.round(secondary.totalG / secondary.count);
            const secondaryB = Math.round(secondary.totalB / secondary.count);
            secondaryHsl = rgbToHsl(secondaryR, secondaryG, secondaryB);
          } else {
            // Create secondary from primary (darker version)
            secondaryHsl = [
              primaryHsl[0],
              Math.max(0, primaryHsl[1] - 15),
              Math.max(0, primaryHsl[2] - 20)
            ];
          }

          resolve({
            primary: primaryHsl,
            secondary: secondaryHsl,
          });

        } catch (err) {
          reject(err);
        }
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Fetch all skins from CSGO-API
async function fetchSkinsFromAPI() {
  return new Promise((resolve, reject) => {
    const url = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';

    https.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`API error: ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          resolve(data);
        } catch (err) {
          reject(err);
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Extract skin pattern name from full name
function extractPatternName(fullName) {
  // "AK-47 | Redline" -> "Redline"
  // "★ Karambit | Doppler" -> "Doppler"
  const parts = fullName.split('|');
  if (parts.length > 1) {
    return parts[1].trim();
  }
  return fullName;
}

// Main
async function main() {
  console.log('Fetching all skins from CSGO-API...');

  const skins = await fetchSkinsFromAPI();
  console.log(`Fetched ${skins.length} total skins`);

  // Group by pattern name to avoid duplicates (same skin on different weapons)
  const skinMap = new Map();

  for (const skin of skins) {
    if (!skin.image || !skin.name) continue;

    const patternName = skin.pattern?.name || extractPatternName(skin.name);

    // Skip if already in manual database
    if (EXISTING_COLORS.has(patternName)) continue;

    // Skip if we already processed this pattern
    if (skinMap.has(patternName)) continue;

    skinMap.set(patternName, {
      name: patternName,
      fullName: skin.name,
      image: skin.image,
    });
  }

  console.log(`Found ${skinMap.size} unique patterns to process (excluding ${EXISTING_COLORS.size} existing)`);

  const results = {};
  let processed = 0;
  let errors = 0;

  const skins_to_process = Array.from(skinMap.values());

  // Process in batches
  const BATCH_SIZE = 5;
  const DELAY_BETWEEN_BATCHES = 500;

  for (let i = 0; i < skins_to_process.length; i += BATCH_SIZE) {
    const batch = skins_to_process.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (skin) => {
      try {
        const colors = await extractColorsFromImage(skin.image);

        if (colors) {
          results[skin.name] = {
            hsl: colors.primary,
            secondary: colors.secondary,
            texture: inferTexture(skin.name),
            weight: inferWeight(skin.name),
          };
          processed++;
          console.log(`  [OK] ${skin.name}`);
        } else {
          console.log(`  [SKIP] ${skin.name} - no colors`);
        }
      } catch (err) {
        errors++;
        console.log(`  [ERR] ${skin.name}: ${err.message}`);
      }
    }));

    // Progress
    const progress = Math.min(i + BATCH_SIZE, skins_to_process.length);
    console.log(`Progress: ${progress}/${skins_to_process.length} (${processed} OK, ${errors} errors)`);

    // Delay
    if (i + BATCH_SIZE < skins_to_process.length) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  console.log(`\nExtraction complete! ${processed} skins processed, ${errors} errors`);

  // Generate output file
  const outputPath = path.join(__dirname, '..', 'lib', 'skinColors', 'generatedColors.js');

  // Compact format - one line per skin for smaller file size
  const skinEntries = Object.entries(results).map(([name, data]) => {
    const hsl = `[${data.hsl.join(',')}]`;
    const secondary = `[${data.secondary.join(',')}]`;
    return `  '${name.replace(/'/g, "\\'")}': { hsl: ${hsl}, secondary: ${secondary}, texture: '${data.texture}', weight: '${data.weight}' }`;
  });

  const output = `/**
 * Auto-Generated Weapon Skin Colors (${Object.keys(results).length} skins)
 * Generated: ${new Date().toISOString()}
 */
export const generatedSkinColors = {
${skinEntries.join(',\n')}
};
`;

  fs.writeFileSync(outputPath, output);
  console.log(`\nOutput written to: ${outputPath}`);
  console.log(`Total skins in generated database: ${Object.keys(results).length}`);
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
