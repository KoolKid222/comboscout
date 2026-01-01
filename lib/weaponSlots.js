/**
 * CS2 Weapon Slot Definitions
 *
 * Defines all weapon slots for the inventory system,
 * including pattern matching for API filtering and visibility weights for scoring.
 */

// Visibility weights for color matching (higher = more important)
export const VISIBILITY_WEIGHTS = {
  premium: 1.0,    // Knife, gloves - always visible
  primary: 0.7,    // Main rifles - frequently seen
  secondary: 0.5,  // Pistols, SMGs
  utility: 0.3,    // Shotguns, machine guns - rarely seen
};

// All weapon slots organized by category
export const WEAPON_SLOTS = {
  // Premium items (special display in inventory)
  knife: {
    id: 'knife',
    label: 'Knife',
    category: 'premium',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.premium,
    patterns: [
      'Knife', 'Bayonet', 'Karambit', 'Daggers', 'Butterfly', 'Huntsman',
      'Falchion', 'Shadow', 'Bowie', 'Gut', 'Flip', 'M9 Bayonet', 'Navaja',
      'Stiletto', 'Talon', 'Ursus', 'Skeleton', 'Survival', 'Paracord',
      'Classic', 'Nomad', 'Kukri'
    ],
    starPrefix: true,
    skinportSearch: 'knife',
  },
  gloves: {
    id: 'gloves',
    label: 'Gloves',
    category: 'premium',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.premium,
    patterns: ['Gloves', 'Wraps'],
    starPrefix: true,
    skinportSearch: 'gloves',
  },

  // Pistols
  pistol_glock: {
    id: 'pistol_glock',
    label: 'Glock-18',
    category: 'pistols',
    side: 'T',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['Glock-18'],
    skinportSearch: 'glock',
  },
  pistol_usps: {
    id: 'pistol_usps',
    label: 'USP-S',
    category: 'pistols',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['USP-S'],
    skinportSearch: 'usp-s',
  },
  pistol_p2000: {
    id: 'pistol_p2000',
    label: 'P2000',
    category: 'pistols',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['P2000'],
    skinportSearch: 'p2000',
  },
  pistol_deagle: {
    id: 'pistol_deagle',
    label: 'Desert Eagle',
    category: 'pistols',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['Desert Eagle'],
    skinportSearch: 'desert-eagle',
  },
  pistol_fiveseven: {
    id: 'pistol_fiveseven',
    label: 'Five-SeveN',
    category: 'pistols',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['Five-SeveN'],
    skinportSearch: 'five-seven',
  },
  pistol_tec9: {
    id: 'pistol_tec9',
    label: 'Tec-9',
    category: 'pistols',
    side: 'T',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['Tec-9'],
    skinportSearch: 'tec-9',
  },
  pistol_cz75: {
    id: 'pistol_cz75',
    label: 'CZ75-Auto',
    category: 'pistols',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['CZ75-Auto'],
    skinportSearch: 'cz75-auto',
  },
  pistol_dualies: {
    id: 'pistol_dualies',
    label: 'Dual Berettas',
    category: 'pistols',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['Dual Berettas'],
    skinportSearch: 'dual-berettas',
  },
  pistol_p250: {
    id: 'pistol_p250',
    label: 'P250',
    category: 'pistols',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['P250'],
    skinportSearch: 'p250',
  },
  pistol_r8: {
    id: 'pistol_r8',
    label: 'R8 Revolver',
    category: 'pistols',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['R8 Revolver'],
    skinportSearch: 'r8-revolver',
  },

  // Rifles
  rifle_ak47: {
    id: 'rifle_ak47',
    label: 'AK-47',
    category: 'rifles',
    side: 'T',
    visibility: VISIBILITY_WEIGHTS.primary,
    patterns: ['AK-47'],
    skinportSearch: 'ak-47',
  },
  rifle_m4a4: {
    id: 'rifle_m4a4',
    label: 'M4A4',
    category: 'rifles',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.primary,
    patterns: ['M4A4'],
    skinportSearch: 'm4a4',
  },
  rifle_m4a1s: {
    id: 'rifle_m4a1s',
    label: 'M4A1-S',
    category: 'rifles',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.primary,
    patterns: ['M4A1-S'],
    skinportSearch: 'm4a1-s',
  },
  rifle_awp: {
    id: 'rifle_awp',
    label: 'AWP',
    category: 'rifles',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.primary,
    patterns: ['AWP'],
    skinportSearch: 'awp',
  },
  rifle_aug: {
    id: 'rifle_aug',
    label: 'AUG',
    category: 'rifles',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['AUG'],
    skinportSearch: 'aug',
  },
  rifle_sg553: {
    id: 'rifle_sg553',
    label: 'SG 553',
    category: 'rifles',
    side: 'T',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['SG 553'],
    skinportSearch: 'sg-553',
  },
  rifle_famas: {
    id: 'rifle_famas',
    label: 'FAMAS',
    category: 'rifles',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['FAMAS'],
    skinportSearch: 'famas',
  },
  rifle_galil: {
    id: 'rifle_galil',
    label: 'Galil AR',
    category: 'rifles',
    side: 'T',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['Galil AR'],
    skinportSearch: 'galil-ar',
  },
  rifle_ssg08: {
    id: 'rifle_ssg08',
    label: 'SSG 08',
    category: 'rifles',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['SSG 08'],
    skinportSearch: 'ssg-08',
  },
  rifle_scar20: {
    id: 'rifle_scar20',
    label: 'SCAR-20',
    category: 'rifles',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.utility,
    patterns: ['SCAR-20'],
    skinportSearch: 'scar-20',
  },
  rifle_g3sg1: {
    id: 'rifle_g3sg1',
    label: 'G3SG1',
    category: 'rifles',
    side: 'T',
    visibility: VISIBILITY_WEIGHTS.utility,
    patterns: ['G3SG1'],
    skinportSearch: 'g3sg1',
  },

  // SMGs
  smg_mp9: {
    id: 'smg_mp9',
    label: 'MP9',
    category: 'smgs',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['MP9'],
    skinportSearch: 'mp9',
  },
  smg_mac10: {
    id: 'smg_mac10',
    label: 'MAC-10',
    category: 'smgs',
    side: 'T',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['MAC-10'],
    skinportSearch: 'mac-10',
  },
  smg_mp7: {
    id: 'smg_mp7',
    label: 'MP7',
    category: 'smgs',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['MP7'],
    skinportSearch: 'mp7',
  },
  smg_mp5sd: {
    id: 'smg_mp5sd',
    label: 'MP5-SD',
    category: 'smgs',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['MP5-SD'],
    skinportSearch: 'mp5-sd',
  },
  smg_ump45: {
    id: 'smg_ump45',
    label: 'UMP-45',
    category: 'smgs',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['UMP-45'],
    skinportSearch: 'ump-45',
  },
  smg_p90: {
    id: 'smg_p90',
    label: 'P90',
    category: 'smgs',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.secondary,
    patterns: ['P90'],
    skinportSearch: 'p90',
  },
  smg_bizon: {
    id: 'smg_bizon',
    label: 'PP-Bizon',
    category: 'smgs',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.utility,
    patterns: ['PP-Bizon'],
    skinportSearch: 'pp-bizon',
  },

  // Heavy - Shotguns
  heavy_nova: {
    id: 'heavy_nova',
    label: 'Nova',
    category: 'heavy',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.utility,
    patterns: ['Nova'],
    skinportSearch: 'nova',
  },
  heavy_xm1014: {
    id: 'heavy_xm1014',
    label: 'XM1014',
    category: 'heavy',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.utility,
    patterns: ['XM1014'],
    skinportSearch: 'xm1014',
  },
  heavy_mag7: {
    id: 'heavy_mag7',
    label: 'MAG-7',
    category: 'heavy',
    side: 'CT',
    visibility: VISIBILITY_WEIGHTS.utility,
    patterns: ['MAG-7'],
    skinportSearch: 'mag-7',
  },
  heavy_sawedoff: {
    id: 'heavy_sawedoff',
    label: 'Sawed-Off',
    category: 'heavy',
    side: 'T',
    visibility: VISIBILITY_WEIGHTS.utility,
    patterns: ['Sawed-Off'],
    skinportSearch: 'sawed-off',
  },

  // Heavy - Machine Guns
  heavy_m249: {
    id: 'heavy_m249',
    label: 'M249',
    category: 'heavy',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.utility,
    patterns: ['M249'],
    skinportSearch: 'm249',
  },
  heavy_negev: {
    id: 'heavy_negev',
    label: 'Negev',
    category: 'heavy',
    side: 'both',
    visibility: VISIBILITY_WEIGHTS.utility,
    patterns: ['Negev'],
    skinportSearch: 'negev',
  },
};

// Category display order and labels
export const SLOT_CATEGORIES = {
  premium: { label: 'Premium', order: 0 },
  pistols: { label: 'Pistols', order: 1 },
  rifles: { label: 'Rifles', order: 2 },
  smgs: { label: 'SMGs', order: 3 },
  heavy: { label: 'Heavy', order: 4 },
};

// Get slots grouped by category
export function getSlotsByCategory() {
  const grouped = {};

  for (const [id, slot] of Object.entries(WEAPON_SLOTS)) {
    const category = slot.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ ...slot, id });
  }

  // Sort categories by order
  const sorted = {};
  Object.keys(SLOT_CATEGORIES)
    .sort((a, b) => SLOT_CATEGORIES[a].order - SLOT_CATEGORIES[b].order)
    .forEach(cat => {
      if (grouped[cat]) {
        sorted[cat] = grouped[cat];
      }
    });

  return sorted;
}

// Detect weapon slot from item name
export function detectWeaponSlot(itemName) {
  if (!itemName) return null;

  const name = itemName.toLowerCase();

  for (const [slotId, slot] of Object.entries(WEAPON_SLOTS)) {
    // Check for star prefix requirement (knives/gloves)
    if (slot.starPrefix && !itemName.startsWith('★')) {
      continue;
    }

    // Check patterns
    for (const pattern of slot.patterns) {
      if (name.includes(pattern.toLowerCase())) {
        return slotId;
      }
    }
  }

  return null;
}

// Get all weapon patterns for API filtering
export function getAllWeaponPatterns() {
  const patterns = [];

  for (const slot of Object.values(WEAPON_SLOTS)) {
    patterns.push(...slot.patterns);
  }

  return patterns;
}

// Get slot count
export const TOTAL_SLOTS = Object.keys(WEAPON_SLOTS).length;

// Premium slot IDs for special display
export const PREMIUM_SLOTS = ['knife', 'gloves'];

// Get Skinport search URL for a slot
export function getSkinportSearchUrl(slotId) {
  const slot = WEAPON_SLOTS[slotId];
  if (!slot) return 'https://skinport.com/cs2';

  return `https://skinport.com/cs2?search=${encodeURIComponent(slot.label)}&sort=price&order=desc`;
}
