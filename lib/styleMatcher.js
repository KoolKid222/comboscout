/**
 * Professional CS2 Knife + Glove Aesthetic Scoring System
 *
 * Uses HSL color theory, texture analysis, and knife prestige weighting
 * to produce discriminating scores with proper distribution.
 *
 * Score Distribution Target:
 * - 30-50: Poor match (clashing or no synergy)
 * - 50-65: Acceptable (safe but uninspired)
 * - 65-75: Good (solid color harmony)
 * - 75-85: Great (excellent synergy)
 * - 85-95: Elite (curated/iconic combos)
 * - 95+: God tier (legendary pairings)
 */

import { weaponSkinColors } from './skinColors/weaponColors';

// =============================================================================
// HSL COLOR DATABASE
// Each skin mapped to HSL values: [Hue (0-360), Saturation (0-100), Lightness (0-100)]
// Plus secondary color, texture style, and visual weight
// =============================================================================

const knifeGloveSkinColors = {
  // === REDS (Hue ~0-15, 345-360) ===
  'Slaughter': { hsl: [355, 75, 45], secondary: [355, 20, 25], texture: 'organic', weight: 'bold' },
  'Crimson Web': { hsl: [0, 85, 35], secondary: [0, 0, 10], texture: 'web', weight: 'bold' },
  'Autotronic': { hsl: [5, 80, 40], secondary: [0, 0, 70], texture: 'tech', weight: 'bold' },
  'Ruby': { hsl: [350, 90, 45], secondary: [350, 90, 35], texture: 'gem', weight: 'bold' },
  'Scarlet Shamagh': { hsl: [355, 70, 40], secondary: [0, 0, 15], texture: 'fabric', weight: 'medium' },
  'Rezan the Red': { hsl: [5, 60, 35], secondary: [25, 40, 30], texture: 'fabric', weight: 'medium' },
  'Blood Pressure': { hsl: [355, 65, 40], secondary: [0, 0, 90], texture: 'organic', weight: 'medium' },

  // === PINKS / MAGENTAS (Hue ~300-345) ===
  'Fade': { hsl: [320, 85, 60], secondary: [45, 90, 55], texture: 'gradient', weight: 'bold' },
  'Vice': { hsl: [330, 80, 55], secondary: [185, 80, 50], texture: 'sport', weight: 'bold' },
  'Pandora\'s Box': { hsl: [290, 60, 50], secondary: [200, 50, 40], texture: 'pattern', weight: 'medium' },

  // === PURPLES / VIOLETS (Hue ~260-300) ===
  'Doppler': { hsl: [280, 70, 40], secondary: [220, 60, 45], texture: 'galaxy', weight: 'bold' },
  'Doppler Phase 1': { hsl: [280, 75, 35], secondary: [0, 0, 15], texture: 'galaxy', weight: 'bold' },
  'Doppler Phase 2': { hsl: [300, 70, 45], secondary: [280, 60, 40], texture: 'galaxy', weight: 'bold' },
  'Doppler Phase 3': { hsl: [200, 50, 35], secondary: [280, 40, 30], texture: 'galaxy', weight: 'medium' },
  'Doppler Phase 4': { hsl: [220, 65, 45], secondary: [280, 55, 40], texture: 'galaxy', weight: 'bold' },
  'Ultraviolet': { hsl: [275, 60, 25], secondary: [0, 0, 10], texture: 'clean', weight: 'subtle' },
  'Freehand': { hsl: [270, 50, 45], secondary: [0, 0, 70], texture: 'art', weight: 'medium' },
  'Imperial Plaid': { hsl: [280, 45, 35], secondary: [280, 30, 25], texture: 'fabric', weight: 'medium' },

  // === BLUES (Hue ~200-260) ===
  'Sapphire': { hsl: [220, 90, 50], secondary: [220, 85, 40], texture: 'gem', weight: 'bold' },
  'Blue Steel': { hsl: [225, 30, 45], secondary: [270, 20, 40], texture: 'metallic', weight: 'medium' },
  'Bright Water': { hsl: [200, 50, 55], secondary: [0, 0, 60], texture: 'camo', weight: 'subtle' },
  'Cobalt Skulls': { hsl: [215, 70, 45], secondary: [0, 0, 15], texture: 'pattern', weight: 'medium' },
  'Amphibious': { hsl: [210, 60, 50], secondary: [0, 0, 90], texture: 'sport', weight: 'medium' },
  'Polygon': { hsl: [220, 55, 40], secondary: [230, 45, 30], texture: 'geometric', weight: 'medium' },
  'Mogul': { hsl: [215, 40, 45], secondary: [0, 0, 50], texture: 'fabric', weight: 'subtle' },

  // === CYANS / TEALS (Hue ~170-200) ===
  'Gamma Doppler': { hsl: [165, 75, 45], secondary: [140, 60, 40], texture: 'galaxy', weight: 'bold' },
  'Gamma Doppler Emerald': { hsl: [145, 85, 45], secondary: [145, 80, 35], texture: 'gem', weight: 'bold' },
  'Superconductor': { hsl: [185, 50, 50], secondary: [0, 0, 55], texture: 'tech', weight: 'medium' },
  'Cool Mint': { hsl: [175, 45, 55], secondary: [0, 0, 60], texture: 'geometric', weight: 'subtle' },
  'Mint Kimono': { hsl: [160, 55, 50], secondary: [160, 40, 40], texture: 'fabric', weight: 'medium' },

  // === GREENS (Hue ~80-170) ===
  'Emerald': { hsl: [140, 80, 40], secondary: [140, 75, 30], texture: 'gem', weight: 'bold' },
  'Emerald Web': { hsl: [145, 70, 35], secondary: [0, 0, 10], texture: 'web', weight: 'medium' },
  'Boreal Forest': { hsl: [120, 35, 30], secondary: [30, 30, 25], texture: 'camo', weight: 'subtle' },
  'Forest DDPAT': { hsl: [110, 30, 35], secondary: [0, 0, 40], texture: 'camo', weight: 'subtle' },
  'Hedge Maze': { hsl: [130, 50, 45], secondary: [0, 0, 85], texture: 'pattern', weight: 'medium' },
  'Turtle': { hsl: [150, 55, 35], secondary: [0, 0, 15], texture: 'reptile', weight: 'medium' },
  'Hydra': { hsl: [140, 60, 30], secondary: [0, 0, 12], texture: 'reptile', weight: 'medium' },
  'Rattler': { hsl: [95, 45, 40], secondary: [40, 35, 30], texture: 'reptile', weight: 'medium' },
  'Mangrove': { hsl: [155, 40, 35], secondary: [120, 30, 30], texture: 'nature', weight: 'subtle' },
  'Spruce DDPAT': { hsl: [150, 25, 35], secondary: [0, 0, 45], texture: 'camo', weight: 'subtle' },

  // === YELLOWS / GOLDS (Hue ~45-65) ===
  'Tiger Tooth': { hsl: [50, 90, 50], secondary: [35, 85, 45], texture: 'stripe', weight: 'bold' },
  'Lore': { hsl: [48, 75, 45], secondary: [90, 40, 35], texture: 'ancient', weight: 'bold' },
  'Gold Arabesque': { hsl: [45, 80, 50], secondary: [45, 70, 40], texture: 'ornate', weight: 'bold' },
  'Case Hardened': { hsl: [210, 50, 45], secondary: [45, 70, 50], texture: 'patina', weight: 'medium' },
  'Yellow-banded': { hsl: [50, 70, 50], secondary: [0, 0, 15], texture: 'fabric', weight: 'medium' },

  // === ORANGES (Hue ~15-45) ===
  'Autotronic': { hsl: [15, 80, 45], secondary: [0, 0, 65], texture: 'tech', weight: 'bold' },
  'Big Game': { hsl: [25, 70, 45], secondary: [45, 65, 50], texture: 'sport', weight: 'medium' },
  'Badlands': { hsl: [25, 55, 40], secondary: [30, 45, 30], texture: 'camo', weight: 'subtle' },
  'Pow!': { hsl: [25, 85, 55], secondary: [0, 0, 90], texture: 'comic', weight: 'bold' },
  'Foundation': { hsl: [20, 70, 55], secondary: [0, 0, 85], texture: 'tech', weight: 'medium' },
  'Marble Fade': { hsl: [350, 70, 50], secondary: [55, 90, 55], texture: 'gradient', weight: 'bold' },
  'Fire & Ice': { hsl: [0, 85, 50], secondary: [210, 85, 50], texture: 'gradient', weight: 'bold' },

  // === BROWNS / EARTH TONES (Hue ~20-40, low saturation) ===
  'Rust Coat': { hsl: [25, 60, 35], secondary: [15, 50, 28], texture: 'rust', weight: 'subtle' },
  'Leather': { hsl: [30, 45, 35], secondary: [35, 35, 30], texture: 'leather', weight: 'subtle' },
  'Bronzed': { hsl: [32, 50, 40], secondary: [0, 0, 15], texture: 'metallic', weight: 'medium' },
  'Arid': { hsl: [38, 50, 45], secondary: [30, 40, 35], texture: 'camo', weight: 'subtle' },
  'Overtake': { hsl: [28, 40, 35], secondary: [45, 55, 45], texture: 'retro', weight: 'medium' },
  'Safari Mesh': { hsl: [35, 25, 40], secondary: [35, 20, 35], texture: 'camo', weight: 'subtle' },
  'Convoy': { hsl: [35, 20, 45], secondary: [0, 0, 50], texture: 'fabric', weight: 'subtle' },

  // === BLACKS / DARK (Lightness < 25) ===
  'Black Laminate': { hsl: [0, 0, 12], secondary: [30, 20, 20], texture: 'wood', weight: 'subtle' },
  'Night': { hsl: [230, 30, 15], secondary: [230, 20, 10], texture: 'clean', weight: 'subtle' },
  'Nocts': { hsl: [0, 0, 8], secondary: [0, 0, 12], texture: 'stealth', weight: 'subtle' },
  'Slate': { hsl: [210, 10, 18], secondary: [0, 0, 30], texture: 'clean', weight: 'subtle' },
  'Eclipse': { hsl: [0, 0, 10], secondary: [55, 80, 50], texture: 'contrast', weight: 'medium' },
  'Unhinged': { hsl: [0, 0, 15], secondary: [0, 0, 35], texture: 'metallic', weight: 'subtle' },
  'Black Tie': { hsl: [0, 0, 10], secondary: [0, 0, 85], texture: 'formal', weight: 'medium' },
  'Charred': { hsl: [15, 20, 12], secondary: [0, 0, 8], texture: 'burnt', weight: 'subtle' },

  // === WHITES / LIGHTS (Lightness > 70) ===
  'Vanilla': { hsl: [35, 10, 65], secondary: [0, 0, 55], texture: 'clean', weight: 'subtle' },
  'Stained': { hsl: [40, 15, 60], secondary: [0, 0, 75], texture: 'patina', weight: 'subtle' },
  'Damascus Steel': { hsl: [0, 0, 70], secondary: [0, 0, 55], texture: 'ripple', weight: 'medium' },
  'King Snake': { hsl: [0, 0, 85], secondary: [45, 70, 50], texture: 'reptile', weight: 'medium' },
  'Snow Leopard': { hsl: [0, 0, 88], secondary: [0, 0, 15], texture: 'animal', weight: 'medium' },

  // === GREYS / NEUTRALS ===
  'Urban Masked': { hsl: [0, 0, 50], secondary: [0, 0, 70], texture: 'camo', weight: 'subtle' },
  'Smoke Out': { hsl: [0, 0, 40], secondary: [0, 0, 20], texture: 'smoke', weight: 'subtle' },
  'Marble Fade': { hsl: [350, 60, 50], secondary: [55, 85, 55], texture: 'gradient', weight: 'bold' },
  'Broken Fang': { hsl: [355, 50, 35], secondary: [0, 0, 20], texture: 'pattern', weight: 'medium' },
  'Giraffe': { hsl: [35, 40, 55], secondary: [30, 30, 35], texture: 'animal', weight: 'medium' },
  'Slingshot': { hsl: [35, 35, 50], secondary: [0, 0, 30], texture: 'sport', weight: 'subtle' },
  'Transport': { hsl: [0, 0, 55], secondary: [200, 30, 45], texture: 'industrial', weight: 'subtle' },
  'Diamondback': { hsl: [30, 30, 40], secondary: [0, 0, 25], texture: 'reptile', weight: 'medium' },
  'Overprint': { hsl: [45, 50, 50], secondary: [200, 40, 45], texture: 'pattern', weight: 'medium' },
  'Finish Line': { hsl: [0, 80, 50], secondary: [0, 0, 10], texture: 'sport', weight: 'bold' },
  'Case Hardened': { hsl: [210, 55, 50], secondary: [45, 75, 50], texture: 'patina', weight: 'medium' },
  'Guerrilla': { hsl: [100, 30, 35], secondary: [30, 25, 30], texture: 'camo', weight: 'subtle' },
  '3rd Commando': { hsl: [35, 30, 40], secondary: [110, 25, 35], texture: 'military', weight: 'subtle' },
  'Stitched': { hsl: [0, 0, 45], secondary: [200, 30, 40], texture: 'fabric', weight: 'subtle' },
  'Snakebite': { hsl: [95, 40, 35], secondary: [0, 0, 20], texture: 'reptile', weight: 'medium' },
  'Buckshot': { hsl: [25, 30, 40], secondary: [0, 0, 30], texture: 'worn', weight: 'subtle' },
  'Needle Point': { hsl: [350, 45, 35], secondary: [0, 0, 25], texture: 'pattern', weight: 'medium' },
  'Jaguar Queen': { hsl: [45, 60, 50], secondary: [0, 0, 15], texture: 'animal', weight: 'bold' },
};

// Merge knife/glove colors with weapon colors
const skinColors = {
  ...knifeGloveSkinColors,
  ...weaponSkinColors,
};

// =============================================================================
// KNIFE PRESTIGE TIERS
// Based on community perception, rarity, and typical market value
// =============================================================================

const knifePrestige = {
  // Tier S - Most sought after
  'Karambit': 1.0,
  'Butterfly': 0.95,
  'M9 Bayonet': 0.90,

  // Tier A - High prestige
  'Talon': 0.85,
  'Skeleton': 0.85,
  'Bayonet': 0.80,
  'Flip': 0.75,

  // Tier B - Solid choices
  'Huntsman': 0.70,
  'Bowie': 0.70,
  'Stiletto': 0.70,
  'Ursus': 0.70,
  'Kukri': 0.70,

  // Tier C - Budget-friendly
  'Falchion': 0.60,
  'Shadow Daggers': 0.55,
  'Gut': 0.55,
  'Navaja': 0.50,
  'Paracord': 0.55,
  'Survival': 0.50,
  'Nomad': 0.55,
  'Classic': 0.60,
};

// =============================================================================
// CURATED ICONIC COMBOS
// Community-recognized pairings that transcend pure color theory
// =============================================================================

const iconicCombos = [
  // Creative high-tier matches (NOT obvious same-name pairings)
  { knife: 'Doppler', glove: 'Imperial Plaid', score: 94, reason: 'Purple galaxy harmony' },
  { knife: 'Tiger Tooth', glove: 'Omega', score: 93, reason: 'Gold accent synergy' },
  { knife: 'Lore', glove: 'Arid', score: 92, reason: 'Ancient gold harmony' },
  { knife: 'Black Laminate', glove: 'Nocts', score: 91, reason: 'Stealth perfection' },
  { knife: 'Autotronic', glove: 'Crimson Web', score: 90, reason: 'Tech red fusion' },
  { knife: 'Sapphire', glove: 'Superconductor', score: 90, reason: 'Blue gem harmony' },
  { knife: 'Ruby', glove: 'Crimson Web', score: 89, reason: 'Deep red unity' },
  { knife: 'Gamma Doppler', glove: 'Hedge Maze', score: 88, reason: 'Cyan-green synergy' },
  { knife: 'Damascus Steel', glove: 'King Snake', score: 87, reason: 'Elegant contrast' },
  { knife: 'Marble Fade', glove: 'Vice', score: 86, reason: 'Fire & Ice synergy' },
  { knife: 'Blue Steel', glove: 'Superconductor', score: 85, reason: 'Industrial cool' },
  { knife: 'Ultraviolet', glove: 'Imperial Plaid', score: 85, reason: 'Dark purple unity' },
  { knife: 'Night', glove: 'Nocts', score: 84, reason: 'Midnight stealth' },
  { knife: 'Slaughter', glove: 'Blood Pressure', score: 84, reason: 'Organic red theme' },
  { knife: 'Fade', glove: 'Vice', score: 83, reason: 'Pink gradient harmony' },
  { knife: 'Crimson Web', glove: 'Blood Pressure', score: 82, reason: 'Web meets organic red' },
  { knife: 'Tiger Tooth', glove: 'Big Game', score: 82, reason: 'Safari gold theme' },
  { knife: 'Doppler', glove: 'Cool Mint', score: 81, reason: 'Phase contrast' },
  { knife: 'Gamma Doppler', glove: 'Superconductor', score: 81, reason: 'Cyan tech fusion' },
];

// Obvious/boring combos that get PENALIZED (same skin on both = lazy)
const boringCombos = [
  { knife: 'Fade', glove: 'Fade' },
  { knife: 'Marble Fade', glove: 'Fade' },
  { knife: 'Tiger Tooth', glove: 'Tiger Tooth' },
  { knife: 'Crimson Web', glove: 'Crimson Web' },
  { knife: 'Case Hardened', glove: 'Case Hardened' },
  { knife: 'Emerald', glove: 'Emerald Web' },
];

// =============================================================================
// SKIN QUALITY TIERS
// Budget/ugly skins get penalized, premium skins get a small boost
// =============================================================================

const skinQuality = {
  // Premium tier (small boost) - desirable finishes
  'Doppler': 1.0,
  'Gamma Doppler': 1.0,
  'Marble Fade': 1.0,
  'Fade': 1.0,
  'Tiger Tooth': 1.0,
  'Autotronic': 1.0,
  'Lore': 1.0,
  'Crimson Web': 0.95,
  'Slaughter': 0.95,
  'Ruby': 1.0,
  'Sapphire': 1.0,
  'Emerald': 1.0,
  'Black Pearl': 1.0,

  // Good tier (neutral)
  'Black Laminate': 0.9,
  'Blue Steel': 0.85,
  'Damascus Steel': 0.85,
  'Case Hardened': 0.85,
  'Ultraviolet': 0.85,
  'Night': 0.8,
  'Vanilla': 0.8,
  'Stained': 0.75,
  'Bright Water': 0.8,

  // Budget tier (penalty) - cheap/ugly finishes
  'Rust Coat': 0.55,
  'Safari Mesh': 0.5,
  'Forest DDPAT': 0.55,
  'Boreal Forest': 0.55,
  'Urban Masked': 0.55,
  'Scorched': 0.5,
  'Snake Camo': 0.55,
  'Convoy': 0.6,
  'Guerrilla': 0.55,
};

// =============================================================================
// NEW SCORING WEIGHTS (Rebalanced for better matching)
// =============================================================================

const SCORE_WEIGHTS = {
  primaryColor: 30,    // Reduced from 50 - still important but not dominant
  secondaryColor: 15,  // Increased - accent colors matter visually
  crossHarmony: 10,    // Primary↔Secondary matching
  texture: 25,         // MAJOR increase - "vibe" is critical!
  theme: 15,           // NEW - style family cohesion bonus
  prestige: 5,         // Reduced - shouldn't override aesthetics
  base: 25,            // Keep minimum floor
};

// =============================================================================
// EXPANDED TEXTURE TAXONOMY
// =============================================================================

const TEXTURE_TAXONOMY = {
  families: {
    organic: ['organic', 'nature', 'animal', 'reptile', 'web', 'floral', 'beast', 'aquatic'],
    tactical: ['camo', 'military', 'industrial', 'worn', 'desert', 'arctic'],
    elegant: ['gem', 'gradient', 'ornate', 'formal', 'clean', 'ancient', 'mythic', 'ripple'],
    tech: ['tech', 'metallic', 'geometric', 'neon', 'glitch', 'space', 'electric'],
    casual: ['sport', 'fabric', 'leather', 'retro', 'comic', 'fun', 'fashion'],
    dark: ['stealth', 'burnt', 'smoke', 'noir', 'horror', 'skull', 'contrast'],
    artistic: ['art', 'pattern', 'tattoo', 'japanese', 'tribal', 'psychedelic', 'stripe'],
    elemental: ['fire', 'storm', 'elemental', 'cracked', 'rust', 'patina', 'galaxy', 'wood'],
  },
  // Which families work well together
  compatibility: {
    organic: ['tactical', 'elegant', 'elemental'],
    tactical: ['organic', 'tech', 'dark'],
    elegant: ['organic', 'tech', 'artistic'],
    tech: ['elegant', 'tactical', 'elemental', 'dark'],
    casual: ['organic', 'artistic', 'elemental'],
    dark: ['tactical', 'tech', 'elemental'],
    artistic: ['elegant', 'casual', 'dark'],
    elemental: ['organic', 'tech', 'dark', 'casual'],
  },
};

// Direct texture-to-texture compatibility scores for common pairings
const TEXTURE_COMPATIBILITY = {
  // Perfect pairings (0.9+)
  'tech-neon': 0.95,
  'tech-geometric': 0.92,
  'tech-metallic': 0.90,
  'galaxy-gradient': 0.93,
  'galaxy-gem': 0.90,
  'ancient-ornate': 0.92,
  'ancient-mythic': 0.95,
  'gem-gradient': 0.88,
  'gem-ornate': 0.85,
  'web-organic': 0.90,
  'reptile-animal': 0.92,
  'reptile-organic': 0.88,
  'camo-military': 0.95,
  'camo-worn': 0.85,
  'stealth-dark': 0.95,
  'stealth-noir': 0.90,
  'fire-gradient': 0.85,
  'stripe-pattern': 0.80,
  'sport-fabric': 0.85,
  'retro-comic': 0.82,
  'leather-fabric': 0.80,
  'metallic-industrial': 0.82,
  'burnt-smoke': 0.88,

  // Good pairings (0.7-0.85)
  'tech-clean': 0.75,
  'neon-gradient': 0.78,
  'pattern-art': 0.80,
  'japanese-ancient': 0.82,
  'japanese-ornate': 0.78,

  // Clash pairings (< 0.4)
  'neon-camo': 0.30,
  'tech-camo': 0.35,
  'comic-stealth': 0.25,
  'fun-horror': 0.20,
  'ornate-industrial': 0.28,
  'gem-worn': 0.30,
  'glitch-organic': 0.32,
  'neon-ancient': 0.35,
};

// =============================================================================
// STYLE THEMES (for theme-based matching)
// =============================================================================

const STYLE_THEMES = {
  cyberpunk: {
    keywords: ['neon', 'tech', 'cyber', 'mecha', 'glitch', 'asiimov', 'hyper', 'neo', 'circuit', 'mainframe'],
    textures: ['neon', 'tech', 'geometric', 'glitch', 'electric'],
    compatibleThemes: ['vibrant', 'dark'],
  },
  military: {
    keywords: ['camo', 'tactical', 'desert', 'forest', 'ddpat', 'guerrilla', 'commando', 'army', 'battle'],
    textures: ['camo', 'military', 'industrial', 'worn'],
    compatibleThemes: ['dark', 'nature'],
  },
  royal: {
    keywords: ['emperor', 'empress', 'lore', 'dragon', 'gold', 'prince', 'king', 'queen', 'royal', 'imperial'],
    textures: ['ornate', 'ancient', 'mythic', 'gem'],
    compatibleThemes: ['vibrant', 'japanese'],
  },
  dark: {
    keywords: ['night', 'shadow', 'black', 'charred', 'noir', 'dark', 'noct', 'midnight', 'obsidian', 'slate'],
    textures: ['stealth', 'dark', 'burnt', 'smoke', 'noir'],
    compatibleThemes: ['military', 'cyberpunk'],
  },
  vibrant: {
    keywords: ['fade', 'marble', 'doppler', 'gamma', 'tiger', 'ruby', 'sapphire', 'emerald', 'fire', 'ice'],
    textures: ['gradient', 'galaxy', 'gem', 'fire'],
    compatibleThemes: ['cyberpunk', 'royal'],
  },
  nature: {
    keywords: ['serpent', 'emerald', 'web', 'beast', 'hydra', 'snake', 'forest', 'turtle', 'animal', 'boreal'],
    textures: ['reptile', 'animal', 'organic', 'web', 'nature'],
    compatibleThemes: ['military', 'casual'],
  },
  japanese: {
    keywords: ['oni', 'kumicho', 'kimono', 'tatsu', 'dragon', 'samurai', 'bamboo', 'lotus'],
    textures: ['japanese', 'ancient', 'tattoo', 'pattern'],
    compatibleThemes: ['royal', 'nature'],
  },
  casual: {
    keywords: ['sport', 'vice', 'game', 'retro', 'boom', 'fun', 'play', 'race', 'finish'],
    textures: ['sport', 'retro', 'comic', 'fun', 'fashion', 'fabric'],
    compatibleThemes: ['nature', 'artistic'],
  },
  artistic: {
    keywords: ['art', 'graffiti', 'paint', 'canvas', 'hand', 'drawn', 'sketch', 'abstract'],
    textures: ['art', 'pattern', 'psychedelic', 'tattoo'],
    compatibleThemes: ['casual', 'cyberpunk'],
  },
};

// =============================================================================
// KEYWORD-BASED COLOR INFERENCE (for unknown skins)
// =============================================================================

const COLOR_KEYWORDS = {
  // Reds
  'crimson|blood|scarlet|ruby|red|inferno|blaze|magma|lava': {
    hsl: [355, 70, 45], secondary: [355, 50, 35], texture: 'organic', weight: 'bold'
  },
  // Blues
  'cobalt|sapphire|blue|azure|ocean|navy|cyan|ice|frost|arctic': {
    hsl: [210, 60, 50], secondary: [210, 40, 40], texture: 'clean', weight: 'medium'
  },
  // Greens
  'emerald|forest|jungle|green|mint|jade|serpent|venom': {
    hsl: [140, 55, 40], secondary: [140, 40, 30], texture: 'organic', weight: 'medium'
  },
  // Purples
  'violet|purple|ultraviolet|imperial|grape|plum': {
    hsl: [275, 55, 45], secondary: [275, 40, 35], texture: 'clean', weight: 'medium'
  },
  // Golds/Yellows
  'gold|amber|yellow|tiger|brass|lore|sun|honey': {
    hsl: [45, 70, 50], secondary: [45, 50, 40], texture: 'ornate', weight: 'bold'
  },
  // Oranges
  'orange|fire|flame|sunset|copper|rust|autumn': {
    hsl: [25, 70, 50], secondary: [25, 50, 40], texture: 'elemental', weight: 'bold'
  },
  // Blacks/Darks
  'night|black|dark|shadow|noir|charred|slate|obsidian|noct': {
    hsl: [0, 0, 15], secondary: [0, 0, 25], texture: 'stealth', weight: 'subtle'
  },
  // Whites
  'white|arctic|snow|vanilla|ivory|pearl|ghost': {
    hsl: [0, 0, 85], secondary: [0, 0, 75], texture: 'clean', weight: 'subtle'
  },
  // Camo/Military
  'camo|ddpat|safari|urban|guerrilla|desert|woodland': {
    hsl: [100, 30, 35], secondary: [100, 20, 30], texture: 'camo', weight: 'subtle'
  },
  // Tech/Cyber
  'asiimov|mecha|cyber|neo|tech|circuit|electron|neon|mainframe': {
    hsl: [200, 50, 50], secondary: [30, 80, 55], texture: 'tech', weight: 'bold'
  },
  // Gradient/Fade
  'fade|marble|doppler|gamma|chromatic': {
    hsl: [320, 75, 55], secondary: [200, 70, 50], texture: 'gradient', weight: 'bold'
  },
  // Pink
  'pink|rose|cherry|magenta|blush': {
    hsl: [330, 60, 55], secondary: [330, 40, 45], texture: 'clean', weight: 'medium'
  },
};

// =============================================================================
// COLOR THEORY FUNCTIONS
// =============================================================================

/**
 * Calculate hue difference accounting for circular nature of hue
 */
function hueDifference(h1, h2) {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

/**
 * Check if colors are complementary (opposite on color wheel, ~180° apart)
 */
function isComplementary(h1, h2) {
  const diff = hueDifference(h1, h2);
  return diff >= 150 && diff <= 210;
}

/**
 * Check if colors are analogous (adjacent on wheel, within 30°)
 */
function isAnalogous(h1, h2) {
  return hueDifference(h1, h2) <= 40;
}

/**
 * Check if colors are triadic (120° apart)
 */
function isTriadic(h1, h2) {
  const diff = hueDifference(h1, h2);
  return diff >= 100 && diff <= 140;
}

/**
 * Check if colors are split-complementary (~150° apart)
 */
function isSplitComplementary(h1, h2) {
  const diff = hueDifference(h1, h2);
  return (diff >= 130 && diff <= 160) || (diff >= 200 && diff <= 230);
}

/**
 * Calculate overall color harmony score between two HSL colors
 * Returns 0-1 score
 */
function calculateColorHarmony(hsl1, hsl2) {
  const [h1, s1, l1] = hsl1;
  const [h2, s2, l2] = hsl2;

  let harmonyScore = 0;

  // Both neutral/achromatic (low saturation) - always compatible
  if (s1 < 15 && s2 < 15) {
    // Lightness contrast matters more
    const lightContrast = Math.abs(l1 - l2);
    return lightContrast > 30 ? 0.7 : 0.5; // Contrast is better than same-same
  }

  // One neutral, one chromatic - usually safe
  if (s1 < 15 || s2 < 15) {
    return 0.65; // Neutral + any color is decent
  }

  // Both chromatic - apply color theory
  if (isAnalogous(h1, h2)) {
    harmonyScore = 0.85; // Analogous is very harmonious
  } else if (isComplementary(h1, h2)) {
    harmonyScore = 0.75; // Complementary is bold but works
  } else if (isTriadic(h1, h2)) {
    harmonyScore = 0.70; // Triadic is vibrant
  } else if (isSplitComplementary(h1, h2)) {
    harmonyScore = 0.72; // Split-complementary is balanced
  } else {
    // Non-harmonic colors
    const hueDiff = hueDifference(h1, h2);
    if (hueDiff < 60 || hueDiff > 300) {
      harmonyScore = 0.55; // Close-ish hues
    } else {
      harmonyScore = 0.35; // Clashing colors
    }
  }

  // Saturation similarity bonus
  const satDiff = Math.abs(s1 - s2);
  if (satDiff < 20) harmonyScore += 0.05;

  // Lightness contrast can be good or bad
  const lightDiff = Math.abs(l1 - l2);
  if (lightDiff > 20 && lightDiff < 50) {
    harmonyScore += 0.05; // Good contrast
  } else if (lightDiff > 60) {
    harmonyScore -= 0.05; // Too much contrast can look off
  }

  return Math.min(1, Math.max(0, harmonyScore));
}

/**
 * Get the texture family for a texture type
 */
function getTextureFamily(texture) {
  for (const [family, textures] of Object.entries(TEXTURE_TAXONOMY.families)) {
    if (textures.includes(texture)) {
      return family;
    }
  }
  return null;
}

/**
 * Calculate texture/style compatibility (ENHANCED)
 * Returns 0-1 score
 */
function calculateTextureMatch(style1, style2, weight1, weight2) {
  // Handle unknown textures
  if (style1 === 'unknown' || style2 === 'unknown') {
    return 0.4;
  }

  // Exact style match is best
  if (style1 === style2) return 1.0;

  // Check direct compatibility matrix (both directions)
  const key1 = `${style1}-${style2}`;
  const key2 = `${style2}-${style1}`;
  if (TEXTURE_COMPATIBILITY[key1] !== undefined) {
    return TEXTURE_COMPATIBILITY[key1];
  }
  if (TEXTURE_COMPATIBILITY[key2] !== undefined) {
    return TEXTURE_COMPATIBILITY[key2];
  }

  // Check same family
  const family1 = getTextureFamily(style1);
  const family2 = getTextureFamily(style2);

  if (family1 && family2) {
    if (family1 === family2) {
      return 0.85; // Same family = good match
    }

    // Check if families are compatible
    const compatibleFamilies = TEXTURE_TAXONOMY.compatibility[family1] || [];
    if (compatibleFamilies.includes(family2)) {
      return 0.6; // Compatible families
    }
  }

  // Visual weight compatibility (fallback)
  if (weight1 === weight2) {
    return 0.45;
  }
  if ((weight1 === 'bold' && weight2 === 'subtle') ||
      (weight1 === 'subtle' && weight2 === 'bold')) {
    return 0.25; // Stark visual weight contrast is jarring
  }

  return 0.35; // Default incompatibility
}

/**
 * Detect themes that match a skin based on name and texture
 * Returns array of matching theme names sorted by confidence
 */
function detectSkinTheme(skinName, skinData) {
  if (!skinName) return [];

  const nameLower = skinName.toLowerCase();
  const scores = {};

  for (const [themeName, theme] of Object.entries(STYLE_THEMES)) {
    let score = 0;

    // Keyword matching (strongest signal)
    for (const keyword of theme.keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        score += 25;
      }
    }

    // Texture matching
    if (skinData && theme.textures.includes(skinData.texture)) {
      score += 15;
    }

    scores[themeName] = score;
  }

  // Return themes with score > 20, sorted by score descending
  return Object.entries(scores)
    .filter(([, score]) => score > 20)
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme);
}

/**
 * Calculate theme bonus between two items
 * Returns 0-1 score
 */
function calculateThemeBonus(skin1Name, skin1Data, skin2Name, skin2Data) {
  const themes1 = detectSkinTheme(skin1Name, skin1Data);
  const themes2 = detectSkinTheme(skin2Name, skin2Data);

  if (!themes1.length || !themes2.length) return 0;

  // Check for direct theme match
  const sharedThemes = themes1.filter(t => themes2.includes(t));
  if (sharedThemes.length > 0) {
    // Both primary themes match = big bonus
    if (sharedThemes.includes(themes1[0]) && sharedThemes.includes(themes2[0])) {
      return 1.0;
    }
    return 0.7; // At least one theme matches
  }

  // Check for compatible themes
  for (const theme1 of themes1) {
    const themeData = STYLE_THEMES[theme1];
    if (themeData?.compatibleThemes) {
      for (const theme2 of themes2) {
        if (themeData.compatibleThemes.includes(theme2)) {
          return 0.4; // Compatible but not matching
        }
      }
    }
  }

  return 0; // No theme synergy
}

/**
 * Calculate how important secondary colors are for these skins
 * Returns multiplier 1.0-2.0
 */
function calculateSecondaryImportance(skin1, skin2) {
  let importance = 1.0;

  const [, s1] = skin1.hsl;
  const [, s2] = skin2.hsl;
  const [, ss1] = skin1.secondary;
  const [, ss2] = skin2.secondary;

  // If primaries are neutral (low saturation), secondaries matter more
  if (s1 < 25 || s2 < 25) {
    importance *= 1.5;
  }

  // If secondaries are vibrant, they're more visible
  if (ss1 > 60 || ss2 > 60) {
    importance *= 1.3;
  }

  // Pattern/gradient textures show more color variation
  const multiColorTextures = ['pattern', 'gradient', 'patina', 'galaxy', 'fire', 'contrast', 'stripe'];
  if (multiColorTextures.includes(skin1.texture) || multiColorTextures.includes(skin2.texture)) {
    importance *= 1.3;
  }

  return Math.min(2.0, importance);
}

/**
 * Calculate cross-harmony between primary and secondary colors
 * Checks if skin1's primary matches skin2's secondary (creates visual "bridge")
 * Returns 0-1 score
 */
function calculateCrossHarmony(skin1, skin2) {
  const cross1 = calculateColorHarmony(skin1.hsl, skin2.secondary);
  const cross2 = calculateColorHarmony(skin1.secondary, skin2.hsl);

  // The higher cross-match indicates one skin "echoes" the other's accent
  const maxCross = Math.max(cross1, cross2);
  const avgCross = (cross1 + cross2) / 2;

  // Reward when there's a strong bridge connection
  return maxCross * 0.6 + avgCross * 0.4;
}

/**
 * Infer skin data from name keywords when not in database
 */
function inferSkinData(skinName) {
  if (!skinName) return null;

  const nameLower = skinName.toLowerCase();

  // Try keyword-based color inference
  for (const [pattern, data] of Object.entries(COLOR_KEYWORDS)) {
    const keywords = pattern.split('|');
    if (keywords.some(kw => nameLower.includes(kw))) {
      return {
        name: 'Inferred',
        ...data,
      };
    }
  }

  // Fallback to neutral
  return {
    name: 'Neutral',
    hsl: [0, 5, 50],
    secondary: [0, 0, 45],
    texture: 'clean',
    weight: 'medium',
  };
}

// =============================================================================
// MAIN SCORING FUNCTION
// =============================================================================

function getSkinData(itemName) {
  const name = itemName.toLowerCase();

  // Sort keys by length desc to match "Gamma Doppler Emerald" before "Gamma Doppler" before "Doppler"
  const keys = Object.keys(skinColors).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    if (name.includes(key.toLowerCase())) {
      return { name: key, ...skinColors[key] };
    }
  }

  // Try to extract pattern name and match (e.g., "AK-47 | Redline" -> "Redline")
  const parts = itemName.split('|');
  if (parts.length > 1) {
    const patternName = parts[1].replace(/\(.*\)/, '').trim().toLowerCase();
    for (const key of keys) {
      if (patternName.includes(key.toLowerCase()) || key.toLowerCase().includes(patternName)) {
        return { name: key, ...skinColors[key] };
      }
    }
  }

  // Try keyword-based inference
  const inferred = inferSkinData(itemName);
  if (inferred && inferred.name !== 'Neutral') {
    return inferred;
  }

  // Default for truly unknown skins - neutral grey
  return inferred || {
    name: 'Unknown',
    hsl: [0, 0, 50],
    secondary: [0, 0, 45],
    texture: 'unknown',
    weight: 'medium'
  };
}

function getKnifePrestige(knifeName) {
  const name = knifeName.toLowerCase();

  for (const [knife, prestige] of Object.entries(knifePrestige)) {
    if (name.includes(knife.toLowerCase())) {
      return prestige;
    }
  }

  return 0.5; // Default prestige for unknown knives
}

function getSkinQuality(skinName) {
  const name = skinName.toLowerCase();

  // Sort by length to match longer names first (e.g., "Gamma Doppler" before "Doppler")
  const sortedKeys = Object.keys(skinQuality).sort((a, b) => b.length - a.length);

  for (const skin of sortedKeys) {
    if (name.includes(skin.toLowerCase())) {
      return skinQuality[skin];
    }
  }

  return 0.75; // Default quality for unknown skins
}

function checkIconicCombo(knifeName, gloveName) {
  const knifeL = knifeName.toLowerCase();
  const gloveL = gloveName.toLowerCase();

  for (const combo of iconicCombos) {
    const knifeMatch = knifeL.includes(combo.knife.toLowerCase());
    const gloveMatch = gloveL.includes(combo.glove.toLowerCase());

    if (knifeMatch && gloveMatch) {
      return combo;
    }
  }

  return null;
}

function isBoringCombo(knifeName, gloveName) {
  const knifeL = knifeName.toLowerCase();
  const gloveL = gloveName.toLowerCase();

  for (const combo of boringCombos) {
    const knifeMatch = knifeL.includes(combo.knife.toLowerCase());
    const gloveMatch = gloveL.includes(combo.glove.toLowerCase());

    if (knifeMatch && gloveMatch) {
      return true;
    }
  }

  return false;
}

export function getStyleScore(knifeName, gloveName) {
  // Check for boring/obvious combos first - cap their score
  if (isBoringCombo(knifeName, gloveName)) {
    // These are "lazy" matches - technically they work but everyone does them
    // Cap at 65 to push them down the rankings
    return 65;
  }

  // Check for iconic/curated combos
  const iconic = checkIconicCombo(knifeName, gloveName);
  if (iconic) {
    return iconic.score;
  }

  // Get skin color data
  const knife = getSkinData(knifeName);
  const glove = getSkinData(gloveName);

  // Calculate component scores
  const primaryHarmony = calculateColorHarmony(knife.hsl, glove.hsl);
  const secondaryHarmony = calculateColorHarmony(knife.secondary, glove.secondary);
  const crossHarmony = (
    calculateColorHarmony(knife.hsl, glove.secondary) +
    calculateColorHarmony(knife.secondary, glove.hsl)
  ) / 2;

  const textureScore = calculateTextureMatch(
    knife.texture, glove.texture,
    knife.weight, glove.weight
  );

  const knifePrestigeScore = getKnifePrestige(knifeName);
  const knifeSkinQuality = getSkinQuality(knifeName);

  // Weighted combination
  // Primary color harmony is most important
  // Secondary/accent harmony adds depth
  // Texture matching is a bonus
  // Knife prestige is a small bonus

  const colorScore = (
    primaryHarmony * 0.50 +
    secondaryHarmony * 0.20 +
    crossHarmony * 0.30
  );

  // Base score calculation (0-100 scale)
  // Color: 0-50 points
  // Texture: 0-15 points
  // Prestige bonus: 0-10 points
  // Base: 25 points (so worst case is ~25)

  const baseScore = 25;
  const colorPoints = colorScore * 50;
  const texturePoints = textureScore * 15;
  const prestigeBonus = knifePrestigeScore * 10;

  let finalScore = baseScore + colorPoints + texturePoints + prestigeBonus;

  // Apply skin quality modifier - budget skins get penalized
  // This scales the score above the base (so a 0.5 quality skin loses ~half the earned points)
  if (knifeSkinQuality < 0.75) {
    const earnedPoints = finalScore - baseScore;
    const qualityPenalty = earnedPoints * (1 - knifeSkinQuality);
    finalScore -= qualityPenalty;
  }

  // Penalty for unknown skins (both being unknown is bad)
  if (knife.name === 'Unknown' && glove.name === 'Unknown') {
    finalScore -= 15;
  } else if (knife.name === 'Unknown' || glove.name === 'Unknown') {
    finalScore -= 5;
  }

  // Exact same skin name - depends on the skin
  if (knife.name === glove.name && knife.name !== 'Unknown') {
    // Some skins look great as sets, others are boring
    const boringSetSkins = ['Urban Masked', 'Forest DDPAT', 'Safari Mesh', 'Boreal Forest'];
    if (boringSetSkins.some(s => knife.name.includes(s))) {
      finalScore = Math.min(finalScore, 55); // Cap boring sets
    } else {
      finalScore = Math.min(finalScore + 10, 85); // Good set bonus, but not as high as curated
    }
  }

  // Clamp final score
  return Math.round(Math.min(100, Math.max(0, finalScore)));
}

/**
 * Get detailed breakdown of how a combo's style score was calculated
 * Returns an object with all scoring factors for tooltip display
 */
export function getStyleScoreBreakdown(knifeName, gloveName) {
  const breakdown = {
    finalScore: 0,
    factors: [],
    summary: '',
  };

  // Check for boring/obvious combos first
  if (isBoringCombo(knifeName, gloveName)) {
    breakdown.finalScore = 65;
    breakdown.summary = 'Common Match';
    breakdown.factors = [
      { label: 'Matching Pattern', value: 'Same skin on both items', impact: 'Capped at 65' },
    ];
    return breakdown;
  }

  // Check for iconic/curated combos
  const iconic = checkIconicCombo(knifeName, gloveName);
  if (iconic) {
    breakdown.finalScore = iconic.score;
    breakdown.summary = 'Curated Combo';
    breakdown.factors = [
      { label: 'Iconic Pairing', value: iconic.reason, impact: `+${iconic.score} pts` },
    ];
    return breakdown;
  }

  // Get skin color data
  const knife = getSkinData(knifeName);
  const glove = getSkinData(gloveName);

  // Calculate component scores
  const primaryHarmony = calculateColorHarmony(knife.hsl, glove.hsl);
  const secondaryHarmony = calculateColorHarmony(knife.secondary, glove.secondary);
  const crossHarmony = (
    calculateColorHarmony(knife.hsl, glove.secondary) +
    calculateColorHarmony(knife.secondary, glove.hsl)
  ) / 2;

  const textureScore = calculateTextureMatch(
    knife.texture, glove.texture,
    knife.weight, glove.weight
  );

  const knifePrestigeScore = getKnifePrestige(knifeName);
  const knifeSkinQuality = getSkinQuality(knifeName);

  // Weighted color score
  const colorScore = (
    primaryHarmony * 0.50 +
    secondaryHarmony * 0.20 +
    crossHarmony * 0.30
  );

  // Score calculation
  const baseScore = 25;
  const colorPoints = colorScore * 50;
  const texturePoints = textureScore * 15;
  const prestigeBonus = knifePrestigeScore * 10;

  let finalScore = baseScore + colorPoints + texturePoints + prestigeBonus;

  // Build factors array
  breakdown.factors.push({
    label: 'Color Harmony',
    value: getColorHarmonyDescription(primaryHarmony),
    impact: `+${Math.round(colorPoints)} pts`,
    detail: `Primary: ${Math.round(primaryHarmony * 100)}%`,
  });

  breakdown.factors.push({
    label: 'Texture Match',
    value: getTextureMatchDescription(knife.texture, glove.texture, textureScore),
    impact: `+${Math.round(texturePoints)} pts`,
  });

  breakdown.factors.push({
    label: 'Knife Prestige',
    value: getPrestigeDescription(knifePrestigeScore),
    impact: `+${Math.round(prestigeBonus)} pts`,
  });

  // Skin quality modifier
  if (knifeSkinQuality < 0.75) {
    const earnedPoints = finalScore - baseScore;
    const qualityPenalty = earnedPoints * (1 - knifeSkinQuality);
    finalScore -= qualityPenalty;
    breakdown.factors.push({
      label: 'Skin Quality',
      value: 'Budget finish',
      impact: `-${Math.round(qualityPenalty)} pts`,
    });
  }

  // Unknown skin penalty
  if (knife.name === 'Unknown' && glove.name === 'Unknown') {
    finalScore -= 15;
    breakdown.factors.push({
      label: 'Unknown Skins',
      value: 'Both skins unrecognized',
      impact: '-15 pts',
    });
  } else if (knife.name === 'Unknown' || glove.name === 'Unknown') {
    finalScore -= 5;
    breakdown.factors.push({
      label: 'Unknown Skin',
      value: 'One skin unrecognized',
      impact: '-5 pts',
    });
  }

  // Same skin name bonus/penalty
  if (knife.name === glove.name && knife.name !== 'Unknown') {
    const boringSetSkins = ['Urban Masked', 'Forest DDPAT', 'Safari Mesh', 'Boreal Forest'];
    if (boringSetSkins.some(s => knife.name.includes(s))) {
      const prevScore = finalScore;
      finalScore = Math.min(finalScore, 55);
      if (prevScore > 55) {
        breakdown.factors.push({
          label: 'Set Skin',
          value: 'Common camo set',
          impact: `Capped at 55`,
        });
      }
    } else {
      breakdown.factors.push({
        label: 'Set Bonus',
        value: 'Matching skin set',
        impact: '+10 pts (max 85)',
      });
      finalScore = Math.min(finalScore + 10, 85);
    }
  }

  // Clamp and round
  breakdown.finalScore = Math.round(Math.min(100, Math.max(0, finalScore)));
  breakdown.summary = getOverallSummary(breakdown.finalScore);

  return breakdown;
}

function getColorHarmonyDescription(score) {
  if (score >= 0.8) return 'Excellent harmony';
  if (score >= 0.7) return 'Strong harmony';
  if (score >= 0.6) return 'Good compatibility';
  if (score >= 0.5) return 'Decent match';
  if (score >= 0.4) return 'Weak harmony';
  return 'Clashing colors';
}

function getTextureMatchDescription(tex1, tex2, score) {
  if (score >= 0.9) return `Perfect: ${tex1}`;
  if (score >= 0.7) return `Compatible styles`;
  if (score >= 0.5) return 'Neutral pairing';
  return 'Mismatched styles';
}

function getPrestigeDescription(score) {
  if (score >= 0.9) return 'Elite tier knife';
  if (score >= 0.75) return 'High tier knife';
  if (score >= 0.6) return 'Mid tier knife';
  return 'Budget knife';
}

function getOverallSummary(score) {
  if (score >= 90) return 'Legendary combo';
  if (score >= 80) return 'Elite pairing';
  if (score >= 70) return 'Great synergy';
  if (score >= 60) return 'Solid match';
  if (score >= 50) return 'Acceptable';
  return 'Poor match';
}

// =============================================================================
// INVENTORY SCORING FUNCTIONS
// Functions for scoring items against a full inventory loadout
// =============================================================================

// Visibility weights for different weapon categories
const VISIBILITY_WEIGHTS = {
  knife: 1.0,
  gloves: 0.9,
  rifle_ak47: 0.7,
  rifle_m4a4: 0.7,
  rifle_m4a1s: 0.7,
  rifle_awp: 0.7,
  default: 0.5,
};

/**
 * Get visibility weight for a slot
 */
function getSlotWeight(slotId) {
  return VISIBILITY_WEIGHTS[slotId] || VISIBILITY_WEIGHTS.default;
}

/**
 * Calculate how well a weapon skin matches a knife/glove combo
 * Uses the same color theory algorithm as getStyleScore
 * @param {string} weaponSkinName - Full name of the weapon skin
 * @param {string|null} knifeName - Full name of the knife (optional)
 * @param {string|null} gloveName - Full name of the gloves (optional)
 * @returns {Object} { score: 0-100, knifeScore, gloveScore, summary }
 */
export function getWeaponMatchScore(weaponSkinName, knifeName, gloveName) {
  // If no knife or gloves, return neutral score
  if (!knifeName && !gloveName) {
    return {
      score: 50,
      knifeScore: null,
      gloveScore: null,
      summary: 'Add knife/gloves to see match scores',
    };
  }

  const weapon = getSkinData(weaponSkinName);

  // PRIMARY COLOR GATE THRESHOLD
  // Colors below this harmony level are considered "clashing" and won't get bonus points
  const PRIMARY_HARMONY_GATE = 0.5;
  const COLOR_CLASH_CAP = 35;

  // Helper function to calculate match score with PRIMARY COLOR GATE
  const calculateMatchScore = (weaponData, targetData, targetName) => {
    // STEP 1: Calculate primary color harmony FIRST
    const primaryHarmony = calculateColorHarmony(weaponData.hsl, targetData.hsl);

    // STEP 2: PRIMARY COLOR GATE - If colors clash, cap the score immediately
    if (primaryHarmony < PRIMARY_HARMONY_GATE) {
      // Colors are clashing - don't let texture/theme override this
      // Return a low score based on how bad the clash is
      const clashScore = Math.round(COLOR_CLASH_CAP * (primaryHarmony / PRIMARY_HARMONY_GATE));
      return {
        score: Math.max(15, clashScore), // Minimum 15, max 35
        isClash: true,
      };
    }

    // STEP 3: Primary passed the gate - now calculate bonuses
    const secondaryHarmony = calculateColorHarmony(weaponData.secondary, targetData.secondary);
    const crossHarmony = calculateCrossHarmony(weaponData, targetData);
    const secondaryImportance = calculateSecondaryImportance(weaponData, targetData);

    const textureScore = calculateTextureMatch(
      weaponData.texture, targetData.texture,
      weaponData.weight, targetData.weight
    );

    const themeBonus = calculateThemeBonus(weaponSkinName, weaponData, targetName, targetData);

    // Calculate points using SCORE_WEIGHTS
    const primaryPoints = primaryHarmony * SCORE_WEIGHTS.primaryColor;
    const secondaryPoints = secondaryHarmony * SCORE_WEIGHTS.secondaryColor * Math.min(secondaryImportance, 1.5);
    const crossPoints = crossHarmony * SCORE_WEIGHTS.crossHarmony;
    const texturePoints = textureScore * SCORE_WEIGHTS.texture;
    const themePoints = themeBonus * SCORE_WEIGHTS.theme;

    let score = SCORE_WEIGHTS.base + primaryPoints + secondaryPoints + crossPoints +
                texturePoints + themePoints;

    // Gradual penalty for unknown/inferred skins
    if (weaponData.name === 'Unknown' || targetData.name === 'Unknown') {
      score -= 10;
    } else if (weaponData.name === 'Inferred' || targetData.name === 'Inferred') {
      score -= 3;
    } else if (weaponData.name === 'Neutral' || targetData.name === 'Neutral') {
      score -= 2;
    }

    return {
      score: Math.round(Math.min(100, Math.max(0, score))),
      isClash: false,
    };
  };

  // Score against knife
  let knifeScore = null;
  let knifeClash = false;
  if (knifeName) {
    const knife = getSkinData(knifeName);
    const result = calculateMatchScore(weapon, knife, knifeName);
    knifeScore = result.score;
    knifeClash = result.isClash;
  }

  // Score against gloves
  let gloveScore = null;
  let gloveClash = false;
  if (gloveName) {
    const glove = getSkinData(gloveName);
    const result = calculateMatchScore(weapon, glove, gloveName);
    gloveScore = result.score;
    gloveClash = result.isClash;
  }

  // Final score is weighted average (if both, slightly favor knife as it's more visible)
  let finalScore;
  if (knifeScore !== null && gloveScore !== null) {
    finalScore = Math.round(knifeScore * 0.55 + gloveScore * 0.45);
  } else {
    finalScore = knifeScore ?? gloveScore;
  }

  // Generate summary - check for color clash
  let summary;
  const hasClash = knifeClash || gloveClash;

  if (hasClash) {
    summary = 'Color clash';
  } else if (finalScore >= 85) {
    summary = 'Perfect match';
  } else if (finalScore >= 75) {
    summary = 'Excellent fit';
  } else if (finalScore >= 65) {
    summary = 'Great match';
  } else if (finalScore >= 55) {
    summary = 'Good match';
  } else if (finalScore >= 45) {
    summary = 'Decent match';
  } else {
    summary = 'Poor match';
  }

  return {
    score: finalScore,
    knifeScore,
    gloveScore,
    summary,
  };
}

/**
 * Calculate how well a new item matches existing inventory
 * @param {string} newItemName - Full name of the potential new item
 * @param {Object[]} inventoryItems - Array of existing inventory items with { name, slotId }
 * @returns {Object} { score: 0-100, bestMatches: [...], conflicts: [...] }
 */
export function getInventoryCompatibilityScore(newItemName, inventoryItems) {
  if (!inventoryItems || inventoryItems.length === 0) {
    return {
      score: 75, // Neutral score when inventory is empty
      bestMatches: [],
      conflicts: [],
      summary: 'No items to compare',
    };
  }

  const newSkin = getSkinData(newItemName);

  // Calculate pairwise scores with each inventory item
  const pairScores = inventoryItems.map(invItem => {
    const invSkin = getSkinData(invItem.name);
    const slotWeight = getSlotWeight(invItem.slotId);

    // Calculate color harmony
    const colorScore = calculateColorHarmony(newSkin.hsl, invSkin.hsl);

    // Calculate texture compatibility
    const textureScore = calculateTextureMatch(
      newSkin.texture, invSkin.texture,
      newSkin.weight, invSkin.weight
    );

    // Combined score weighted by slot importance
    const combinedScore = (colorScore * 0.7 + textureScore * 0.3);

    return {
      item: invItem.name,
      slotId: invItem.slotId,
      colorScore,
      textureScore,
      weight: slotWeight,
      combinedScore: combinedScore * slotWeight,
    };
  });

  // Weighted average of all pairwise scores
  const totalWeight = pairScores.reduce((sum, p) => sum + p.weight, 0);
  const weightedSum = pairScores.reduce((sum, p) => sum + p.combinedScore, 0);
  const averageScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 50;

  // Identify best matches and conflicts
  const sorted = [...pairScores].sort((a, b) => b.combinedScore - a.combinedScore);
  const bestMatches = sorted.slice(0, 3).filter(p => p.combinedScore > 0.5);
  const conflicts = sorted.filter(p => p.combinedScore < 0.35).slice(-3);

  // Apply bonuses/penalties
  let finalScore = averageScore;

  // Bonus for high harmony with knife/gloves
  const premiumMatches = pairScores.filter(p =>
    (p.slotId === 'knife' || p.slotId === 'gloves') && p.combinedScore > 0.6
  );
  if (premiumMatches.length > 0) {
    finalScore += 5;
  }

  // Penalty for severe clashes with visible items
  const severeClashes = pairScores.filter(p => p.colorScore < 0.3 && p.weight > 0.6);
  finalScore -= severeClashes.length * 3;

  const score = Math.round(Math.min(100, Math.max(0, finalScore)));

  return {
    score,
    bestMatches: bestMatches.map(m => ({ name: m.item, score: Math.round(m.combinedScore * 100) })),
    conflicts: conflicts.map(c => ({ name: c.item, score: Math.round(c.combinedScore * 100) })),
    summary: getCompatibilitySummary(score),
  };
}

function getCompatibilitySummary(score) {
  if (score >= 85) return 'Perfect match';
  if (score >= 70) return 'Great fit';
  if (score >= 55) return 'Good match';
  if (score >= 40) return 'Acceptable';
  return 'Poor match';
}

/**
 * Calculate overall loadout cohesion score
 * @param {Object[]} inventoryItems - Array of items with { name, slotId }
 * @returns {Object} { overallScore, categoryScores, dominantTheme, recommendations }
 */
export function getLoadoutCohesionScore(inventoryItems) {
  if (!inventoryItems || inventoryItems.length < 2) {
    return {
      overallScore: 100,
      categoryScores: {},
      dominantTheme: null,
      recommendations: [],
      summary: 'Add more items to calculate cohesion',
    };
  }

  // Calculate all pairwise scores
  const allPairs = [];
  for (let i = 0; i < inventoryItems.length; i++) {
    for (let j = i + 1; j < inventoryItems.length; j++) {
      const skin1 = getSkinData(inventoryItems[i].name);
      const skin2 = getSkinData(inventoryItems[j].name);

      const colorScore = calculateColorHarmony(skin1.hsl, skin2.hsl);
      const textureScore = calculateTextureMatch(
        skin1.texture, skin2.texture,
        skin1.weight, skin2.weight
      );

      const weight1 = getSlotWeight(inventoryItems[i].slotId);
      const weight2 = getSlotWeight(inventoryItems[j].slotId);
      const combinedWeight = Math.sqrt(weight1 * weight2);

      allPairs.push({
        item1: inventoryItems[i].name,
        item2: inventoryItems[j].name,
        colorScore,
        textureScore,
        score: (colorScore * 0.7 + textureScore * 0.3),
        weight: combinedWeight,
      });
    }
  }

  // Weighted average
  const totalWeight = allPairs.reduce((s, p) => s + p.weight, 0);
  const weightedSum = allPairs.reduce((s, p) => s + p.score * p.weight, 0);
  const baseScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 50;

  // Analyze dominant theme
  const themeAnalysis = analyzeInventoryThemes(inventoryItems);

  // Final score with adjustments
  let finalScore = baseScore;

  // Bonus for consistent theme
  if (themeAnalysis.themeAdherence > 0.6) {
    finalScore += 5;
  }

  // Find worst pairs for recommendations
  const worstPairs = [...allPairs]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .filter(p => p.score < 0.4);

  const recommendations = worstPairs.map(p => ({
    issue: `${extractSkinName(p.item1)} clashes with ${extractSkinName(p.item2)}`,
    severity: p.score < 0.3 ? 'high' : 'medium',
  }));

  return {
    overallScore: Math.round(Math.min(100, Math.max(0, finalScore))),
    dominantTheme: themeAnalysis.dominantTexture,
    dominantTone: themeAnalysis.dominantTone,
    themeAdherence: Math.round(themeAnalysis.themeAdherence * 100),
    recommendations,
    summary: getCohesionSummary(finalScore),
  };
}

function analyzeInventoryThemes(inventoryItems) {
  const textureCounts = {};
  const hueRanges = { warm: 0, cool: 0, neutral: 0 };

  for (const item of inventoryItems) {
    const skin = getSkinData(item.name);

    // Count textures
    textureCounts[skin.texture] = (textureCounts[skin.texture] || 0) + 1;

    // Categorize hue
    const [hue, sat] = skin.hsl;
    if (sat < 15) {
      hueRanges.neutral++;
    } else if (hue < 60 || hue > 300) {
      hueRanges.warm++;
    } else {
      hueRanges.cool++;
    }
  }

  // Find dominant
  const topTexture = Object.entries(textureCounts)
    .sort((a, b) => b[1] - a[1])[0];
  const topTone = Object.entries(hueRanges)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    dominantTexture: topTexture ? topTexture[0] : null,
    dominantTone: topTone ? topTone[0] : null,
    themeAdherence: topTexture ? topTexture[1] / inventoryItems.length : 0,
  };
}

function extractSkinName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split('|');
  if (parts.length > 1) {
    return parts[1].replace(/\(.*\)/, '').trim();
  }
  return fullName.replace('★ ', '').split('|')[0].trim();
}

function getCohesionSummary(score) {
  if (score >= 85) return 'Perfectly coordinated';
  if (score >= 70) return 'Well matched';
  if (score >= 55) return 'Decent cohesion';
  if (score >= 40) return 'Mixed styles';
  return 'Needs improvement';
}

export { getSkinData, getKnifePrestige, skinColors, calculateColorHarmony, calculateTextureMatch };
