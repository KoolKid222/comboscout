/**
 * Weapon Skin Colors Database
 *
 * HSL color data for popular weapon skins.
 * Structure matches the existing skinColors in styleMatcher.js:
 * { hsl: [H, S, L], secondary: [H, S, L], texture: string, weight: string }
 *
 * Priority 1: AK-47, M4A4, M4A1-S, AWP, Desert Eagle
 * Priority 2: Glock, USP-S, P250, Five-SeveN
 * Priority 3: SMGs, Shotguns
 */

export const weaponSkinColors = {
  // ============================================================================
  // AK-47 SKINS
  // ============================================================================
  'Asiimov': { hsl: [30, 10, 90], secondary: [200, 50, 20], texture: 'tech', weight: 'bold' },
  'Fire Serpent': { hsl: [25, 80, 45], secondary: [140, 50, 35], texture: 'ancient', weight: 'bold' },
  'Vulcan': { hsl: [200, 75, 50], secondary: [45, 70, 55], texture: 'tech', weight: 'bold' },
  'Redline': { hsl: [0, 70, 35], secondary: [0, 0, 15], texture: 'stripe', weight: 'medium' },
  'Bloodsport': { hsl: [355, 80, 50], secondary: [0, 0, 90], texture: 'sport', weight: 'bold' },
  'Neon Rider': { hsl: [300, 85, 55], secondary: [180, 80, 50], texture: 'neon', weight: 'bold' },
  'Neon Revolution': { hsl: [310, 85, 50], secondary: [55, 90, 50], texture: 'neon', weight: 'bold' },
  'The Empress': { hsl: [280, 50, 40], secondary: [45, 60, 50], texture: 'ornate', weight: 'bold' },
  'Phantom Disruptor': { hsl: [270, 60, 45], secondary: [0, 0, 70], texture: 'tech', weight: 'medium' },
  'Hydroponic': { hsl: [100, 70, 45], secondary: [140, 60, 40], texture: 'organic', weight: 'medium' },
  'Aquamarine Revenge': { hsl: [175, 70, 50], secondary: [280, 50, 45], texture: 'aquatic', weight: 'bold' },
  'Fuel Injector': { hsl: [45, 90, 55], secondary: [0, 80, 50], texture: 'tech', weight: 'bold' },
  'Wasteland Rebel': { hsl: [35, 40, 35], secondary: [355, 50, 40], texture: 'worn', weight: 'medium' },
  'Point Disarray': { hsl: [25, 60, 45], secondary: [0, 0, 30], texture: 'geometric', weight: 'medium' },
  'Frontside Misty': { hsl: [200, 45, 50], secondary: [0, 0, 40], texture: 'nature', weight: 'medium' },
  'Ice Coaled': { hsl: [195, 80, 60], secondary: [0, 0, 90], texture: 'clean', weight: 'medium' },
  'Jet Set': { hsl: [35, 50, 45], secondary: [0, 0, 30], texture: 'retro', weight: 'medium' },
  'Blue Laminate': { hsl: [210, 60, 45], secondary: [0, 0, 30], texture: 'metallic', weight: 'subtle' },
  'Slate': { hsl: [210, 15, 35], secondary: [0, 0, 25], texture: 'clean', weight: 'subtle' },
  'Elite Build': { hsl: [40, 25, 40], secondary: [0, 0, 35], texture: 'industrial', weight: 'subtle' },
  'Rat Rod': { hsl: [25, 50, 40], secondary: [0, 60, 45], texture: 'retro', weight: 'medium' },
  'Nightwish': { hsl: [270, 50, 35], secondary: [300, 40, 45], texture: 'fantasy', weight: 'medium' },
  'Legion of Anubis': { hsl: [45, 70, 50], secondary: [200, 50, 40], texture: 'ancient', weight: 'bold' },
  'Gold Arabesque': { hsl: [45, 75, 50], secondary: [45, 60, 40], texture: 'ornate', weight: 'bold' },
  'Head Shot': { hsl: [0, 0, 30], secondary: [0, 80, 50], texture: 'military', weight: 'medium' },
  'Inheritance': { hsl: [280, 40, 40], secondary: [45, 50, 45], texture: 'ornate', weight: 'bold' },

  // ============================================================================
  // M4A4 SKINS
  // ============================================================================
  'Howl': { hsl: [10, 85, 50], secondary: [30, 70, 45], texture: 'animal', weight: 'bold' },
  'Poseidon': { hsl: [195, 70, 50], secondary: [200, 60, 40], texture: 'aquatic', weight: 'bold' },
  'Neo-Noir': { hsl: [35, 20, 30], secondary: [355, 60, 45], texture: 'noir', weight: 'medium' },
  'Desolate Space': { hsl: [265, 55, 40], secondary: [0, 0, 15], texture: 'space', weight: 'medium' },
  'The Emperor': { hsl: [275, 50, 45], secondary: [45, 60, 50], texture: 'ornate', weight: 'bold' },
  'Royal Paladin': { hsl: [40, 50, 50], secondary: [210, 45, 45], texture: 'medieval', weight: 'medium' },
  'Buzz Kill': { hsl: [55, 80, 55], secondary: [0, 0, 15], texture: 'industrial', weight: 'bold' },
  'Hellfire': { hsl: [15, 90, 50], secondary: [0, 0, 10], texture: 'fire', weight: 'bold' },
  'Temukau': { hsl: [195, 65, 45], secondary: [175, 50, 40], texture: 'tribal', weight: 'medium' },
  'In Living Color': { hsl: [340, 70, 55], secondary: [200, 60, 50], texture: 'art', weight: 'bold' },
  'Spider Lily': { hsl: [350, 65, 45], secondary: [0, 0, 20], texture: 'floral', weight: 'medium' },
  'Tooth Fairy': { hsl: [320, 50, 55], secondary: [45, 40, 50], texture: 'fantasy', weight: 'medium' },
  'Zirka': { hsl: [200, 50, 45], secondary: [0, 0, 70], texture: 'tech', weight: 'medium' },
  'Daybreak': { hsl: [30, 80, 55], secondary: [45, 70, 50], texture: 'gradient', weight: 'bold' },
  'Griffin': { hsl: [40, 40, 45], secondary: [0, 0, 60], texture: 'mythic', weight: 'medium' },
  'Cyber Security': { hsl: [180, 60, 45], secondary: [0, 0, 20], texture: 'tech', weight: 'medium' },
  'Global Offensive': { hsl: [210, 50, 40], secondary: [0, 0, 50], texture: 'military', weight: 'subtle' },
  'Mainframe': { hsl: [270, 40, 40], secondary: [180, 40, 45], texture: 'tech', weight: 'medium' },

  // ============================================================================
  // M4A1-S SKINS
  // ============================================================================
  'Printstream': { hsl: [0, 0, 90], secondary: [0, 0, 10], texture: 'clean', weight: 'bold' },
  'Hyper Beast': { hsl: [180, 75, 50], secondary: [300, 65, 50], texture: 'beast', weight: 'bold' },
  'Knight': { hsl: [45, 30, 55], secondary: [0, 0, 60], texture: 'metallic', weight: 'medium' },
  'Hot Rod': { hsl: [0, 90, 50], secondary: [0, 85, 45], texture: 'clean', weight: 'bold' },
  'Golden Coil': { hsl: [45, 80, 50], secondary: [0, 0, 20], texture: 'ornate', weight: 'bold' },
  'Chantico\'s Fire': { hsl: [15, 85, 50], secondary: [45, 75, 50], texture: 'ancient', weight: 'bold' },
  'Mecha Industries': { hsl: [0, 0, 60], secondary: [200, 40, 45], texture: 'tech', weight: 'medium' },
  'Nightmare': { hsl: [350, 60, 35], secondary: [0, 0, 15], texture: 'horror', weight: 'medium' },
  'Decimator': { hsl: [355, 70, 45], secondary: [0, 0, 30], texture: 'tech', weight: 'medium' },
  'Leaded Glass': { hsl: [200, 50, 50], secondary: [280, 40, 45], texture: 'art', weight: 'medium' },
  'Cyrex': { hsl: [0, 70, 50], secondary: [0, 0, 80], texture: 'tech', weight: 'medium' },
  'Master Piece': { hsl: [35, 45, 45], secondary: [200, 35, 40], texture: 'art', weight: 'medium' },
  'Imminent Danger': { hsl: [45, 85, 55], secondary: [0, 0, 15], texture: 'industrial', weight: 'bold' },
  'Blue Phosphor': { hsl: [200, 80, 50], secondary: [210, 70, 40], texture: 'tech', weight: 'medium' },
  'Player Two': { hsl: [300, 60, 50], secondary: [180, 50, 45], texture: 'retro', weight: 'medium' },
  'Atomic Alloy': { hsl: [30, 60, 50], secondary: [0, 0, 40], texture: 'metallic', weight: 'medium' },
  'Icarus Fell': { hsl: [200, 70, 55], secondary: [280, 50, 50], texture: 'gradient', weight: 'bold' },
  'Flashback': { hsl: [340, 55, 50], secondary: [200, 45, 45], texture: 'retro', weight: 'medium' },

  // ============================================================================
  // AWP SKINS
  // ============================================================================
  'Dragon Lore': { hsl: [45, 65, 45], secondary: [140, 45, 35], texture: 'ancient', weight: 'bold' },
  'Gungnir': { hsl: [210, 75, 50], secondary: [45, 55, 45], texture: 'ancient', weight: 'bold' },
  'Medusa': { hsl: [150, 45, 40], secondary: [45, 35, 40], texture: 'mythic', weight: 'bold' },
  'The Prince': { hsl: [280, 55, 45], secondary: [45, 65, 50], texture: 'ornate', weight: 'bold' },
  'Containment Breach': { hsl: [100, 70, 45], secondary: [0, 0, 20], texture: 'tech', weight: 'bold' },
  'Lightning Strike': { hsl: [55, 90, 55], secondary: [280, 70, 50], texture: 'electric', weight: 'bold' },
  'Oni Taiji': { hsl: [355, 60, 45], secondary: [200, 45, 40], texture: 'japanese', weight: 'bold' },
  'Wildfire': { hsl: [25, 85, 50], secondary: [0, 80, 45], texture: 'fire', weight: 'bold' },
  'Fever Dream': { hsl: [310, 65, 50], secondary: [180, 55, 50], texture: 'psychedelic', weight: 'bold' },
  'Electric Hive': { hsl: [55, 80, 55], secondary: [200, 65, 45], texture: 'tech', weight: 'medium' },
  'Graphite': { hsl: [0, 0, 35], secondary: [0, 0, 50], texture: 'clean', weight: 'subtle' },
  'Corticera': { hsl: [355, 50, 40], secondary: [0, 0, 25], texture: 'organic', weight: 'medium' },
  'Man-o\'-war': { hsl: [25, 50, 40], secondary: [0, 0, 30], texture: 'nautical', weight: 'medium' },
  'Atheris': { hsl: [150, 60, 40], secondary: [0, 0, 15], texture: 'reptile', weight: 'medium' },
  'Chromatic Aberration': { hsl: [280, 60, 50], secondary: [180, 55, 50], texture: 'glitch', weight: 'bold' },
  'Exoskeleton': { hsl: [50, 50, 45], secondary: [0, 0, 30], texture: 'tech', weight: 'medium' },
  'Desert Hydra': { hsl: [35, 55, 45], secondary: [140, 40, 35], texture: 'desert', weight: 'medium' },
  'Silk Tiger': { hsl: [30, 70, 50], secondary: [0, 0, 20], texture: 'animal', weight: 'bold' },
  'Mortis': { hsl: [0, 0, 20], secondary: [355, 50, 35], texture: 'dark', weight: 'medium' },
  'Duality': { hsl: [200, 50, 50], secondary: [30, 60, 50], texture: 'contrast', weight: 'medium' },
  'BOOM': { hsl: [30, 70, 50], secondary: [0, 0, 90], texture: 'comic', weight: 'bold' },

  // ============================================================================
  // DESERT EAGLE SKINS
  // ============================================================================
  'Blaze': { hsl: [25, 95, 55], secondary: [45, 90, 50], texture: 'fire', weight: 'bold' },
  'Code Red': { hsl: [355, 85, 50], secondary: [0, 0, 20], texture: 'tech', weight: 'bold' },
  'Golden Koi': { hsl: [45, 80, 55], secondary: [355, 60, 50], texture: 'aquatic', weight: 'bold' },
  'Kumicho Dragon': { hsl: [355, 55, 40], secondary: [0, 0, 15], texture: 'japanese', weight: 'medium' },
  'Conspiracy': { hsl: [45, 70, 50], secondary: [0, 0, 25], texture: 'mysterious', weight: 'medium' },
  'Hypnotic': { hsl: [0, 0, 70], secondary: [0, 0, 30], texture: 'hypnotic', weight: 'medium' },
  'Cobalt Disruption': { hsl: [215, 75, 50], secondary: [0, 0, 20], texture: 'tech', weight: 'medium' },
  'Sunset Storm': { hsl: [25, 80, 55], secondary: [280, 50, 45], texture: 'gradient', weight: 'bold' },
  'Ocean Drive': { hsl: [320, 60, 55], secondary: [180, 55, 50], texture: 'retro', weight: 'medium' },
  'Trigger Discipline': { hsl: [280, 50, 45], secondary: [45, 50, 50], texture: 'ornate', weight: 'medium' },
  'Light Rail': { hsl: [200, 60, 50], secondary: [0, 0, 70], texture: 'tech', weight: 'medium' },
  'Fennec Fox': { hsl: [35, 65, 55], secondary: [0, 0, 30], texture: 'animal', weight: 'medium' },
  'Crimson Web': { hsl: [0, 80, 40], secondary: [0, 0, 10], texture: 'web', weight: 'bold' },
  'Pilot': { hsl: [200, 50, 45], secondary: [0, 0, 60], texture: 'retro', weight: 'medium' },
  'Directive': { hsl: [0, 0, 50], secondary: [0, 70, 50], texture: 'tech', weight: 'medium' },
  'Midnight Storm': { hsl: [270, 50, 35], secondary: [0, 0, 20], texture: 'storm', weight: 'medium' },
  'Hand Cannon': { hsl: [0, 0, 40], secondary: [0, 0, 60], texture: 'industrial', weight: 'subtle' },

  // ============================================================================
  // GLOCK-18 SKINS
  // ============================================================================
  'Fade': { hsl: [320, 85, 60], secondary: [45, 90, 55], texture: 'gradient', weight: 'bold' },
  'Water Elemental': { hsl: [200, 70, 50], secondary: [180, 60, 45], texture: 'elemental', weight: 'bold' },
  'Wasteland Rebel': { hsl: [35, 45, 35], secondary: [355, 45, 40], texture: 'worn', weight: 'medium' },
  'Twilight Galaxy': { hsl: [270, 60, 45], secondary: [200, 50, 50], texture: 'galaxy', weight: 'medium' },
  'Bullet Queen': { hsl: [340, 65, 50], secondary: [45, 55, 50], texture: 'ornate', weight: 'bold' },
  'Vogue': { hsl: [330, 55, 50], secondary: [0, 0, 80], texture: 'fashion', weight: 'medium' },
  'Neo-Noir': { hsl: [35, 20, 30], secondary: [355, 60, 45], texture: 'noir', weight: 'medium' },
  'Dragon Tattoo': { hsl: [0, 0, 35], secondary: [355, 50, 40], texture: 'tattoo', weight: 'medium' },
  'Brass': { hsl: [45, 60, 50], secondary: [40, 50, 40], texture: 'metallic', weight: 'medium' },
  'Synth Leaf': { hsl: [150, 65, 45], secondary: [180, 50, 50], texture: 'organic', weight: 'medium' },
  'Off World': { hsl: [200, 55, 45], secondary: [0, 0, 60], texture: 'space', weight: 'medium' },
  'Snack Attack': { hsl: [50, 70, 55], secondary: [355, 60, 50], texture: 'fun', weight: 'medium' },
  'Moonrise': { hsl: [45, 50, 45], secondary: [270, 40, 40], texture: 'mystical', weight: 'medium' },
  'Blue Fissure': { hsl: [210, 60, 45], secondary: [0, 0, 30], texture: 'cracked', weight: 'subtle' },
  'Weasel': { hsl: [30, 50, 45], secondary: [0, 0, 35], texture: 'animal', weight: 'subtle' },

  // ============================================================================
  // USP-S SKINS
  // ============================================================================
  'Kill Confirmed': { hsl: [0, 75, 45], secondary: [0, 0, 20], texture: 'military', weight: 'bold' },
  'Cortex': { hsl: [200, 60, 50], secondary: [320, 50, 50], texture: 'organic', weight: 'medium' },
  'Caiman': { hsl: [150, 50, 40], secondary: [0, 0, 30], texture: 'reptile', weight: 'medium' },
  'Orion': { hsl: [35, 80, 55], secondary: [200, 60, 45], texture: 'space', weight: 'bold' },
  'Monster Mashup': { hsl: [280, 55, 45], secondary: [120, 50, 45], texture: 'monster', weight: 'medium' },
  'Whiteout': { hsl: [0, 0, 95], secondary: [0, 0, 85], texture: 'clean', weight: 'subtle' },
  'Serum': { hsl: [120, 70, 45], secondary: [0, 0, 20], texture: 'tech', weight: 'medium' },
  'Ticket to Hell': { hsl: [355, 70, 45], secondary: [0, 0, 15], texture: 'horror', weight: 'bold' },
  'The Traitor': { hsl: [355, 60, 40], secondary: [45, 50, 45], texture: 'ornate', weight: 'medium' },
  'Check Engine': { hsl: [45, 70, 50], secondary: [0, 0, 30], texture: 'industrial', weight: 'medium' },
  'Flashback': { hsl: [340, 50, 50], secondary: [200, 40, 45], texture: 'retro', weight: 'medium' },
  'Purple DDPAT': { hsl: [280, 45, 40], secondary: [270, 35, 35], texture: 'camo', weight: 'subtle' },
  'Dark Water': { hsl: [200, 40, 35], secondary: [0, 0, 25], texture: 'aquatic', weight: 'subtle' },
  'Black Lotus': { hsl: [0, 0, 15], secondary: [270, 50, 40], texture: 'floral', weight: 'medium' },
  'Cyrex': { hsl: [355, 65, 50], secondary: [0, 0, 80], texture: 'tech', weight: 'medium' },
  'Blueprint': { hsl: [210, 70, 45], secondary: [0, 0, 60], texture: 'tech', weight: 'medium' },
  'Overgrowth': { hsl: [130, 55, 40], secondary: [0, 0, 25], texture: 'organic', weight: 'medium' },

  // ============================================================================
  // P250 SKINS
  // ============================================================================
  'See Ya Later': { hsl: [280, 60, 50], secondary: [180, 55, 50], texture: 'psychedelic', weight: 'bold' },
  'Muertos': { hsl: [280, 50, 45], secondary: [45, 60, 50], texture: 'skull', weight: 'medium' },
  'Cartel': { hsl: [0, 0, 30], secondary: [45, 50, 40], texture: 'ornate', weight: 'medium' },
  'Asiimov': { hsl: [30, 10, 90], secondary: [200, 50, 20], texture: 'tech', weight: 'bold' },
  'Undertow': { hsl: [200, 65, 45], secondary: [0, 0, 25], texture: 'aquatic', weight: 'medium' },
  'Vino Primo': { hsl: [355, 50, 35], secondary: [45, 40, 40], texture: 'elegant', weight: 'medium' },

  // ============================================================================
  // FIVE-SEVEN SKINS
  // ============================================================================
  'Hyper Beast': { hsl: [180, 75, 50], secondary: [300, 65, 50], texture: 'beast', weight: 'bold' },
  'Angry Mob': { hsl: [355, 65, 45], secondary: [0, 0, 20], texture: 'art', weight: 'medium' },
  'Fairy Tale': { hsl: [280, 50, 50], secondary: [45, 50, 50], texture: 'fantasy', weight: 'medium' },
  'Monkey Business': { hsl: [45, 70, 50], secondary: [30, 60, 45], texture: 'fun', weight: 'medium' },
  'Case Hardened': { hsl: [210, 55, 50], secondary: [45, 75, 50], texture: 'patina', weight: 'medium' },
  'Fowl Play': { hsl: [45, 65, 50], secondary: [355, 55, 45], texture: 'animal', weight: 'medium' },

  // ============================================================================
  // SMG SKINS (Popular ones)
  // ============================================================================
  // UMP-45
  'Primal Saber': { hsl: [120, 70, 45], secondary: [45, 60, 50], texture: 'tribal', weight: 'bold' },
  'Blaze': { hsl: [25, 90, 55], secondary: [45, 85, 50], texture: 'fire', weight: 'bold' },
  'Exposure': { hsl: [200, 60, 50], secondary: [0, 0, 70], texture: 'photo', weight: 'medium' },

  // MAC-10
  'Neon Rider': { hsl: [300, 80, 55], secondary: [180, 75, 50], texture: 'neon', weight: 'bold' },
  'Stalker': { hsl: [100, 50, 40], secondary: [0, 0, 20], texture: 'organic', weight: 'medium' },

  // MP9
  'Hypnotic': { hsl: [0, 0, 70], secondary: [0, 0, 30], texture: 'hypnotic', weight: 'medium' },
  'Rose Iron': { hsl: [340, 45, 45], secondary: [0, 0, 50], texture: 'metallic', weight: 'medium' },

  // P90
  'Death by Kitty': { hsl: [330, 60, 55], secondary: [0, 0, 20], texture: 'cute', weight: 'bold' },
  'Asiimov': { hsl: [30, 10, 90], secondary: [200, 50, 20], texture: 'tech', weight: 'bold' },
  'Emerald Dragon': { hsl: [150, 70, 40], secondary: [45, 50, 45], texture: 'ancient', weight: 'bold' },
};

export default weaponSkinColors;
