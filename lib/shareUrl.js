/**
 * Share URL Encoding/Decoding Utilities
 *
 * Encodes inventory data into compact, URL-safe format for sharing.
 * Uses base64url encoding with abbreviated keys for minimal URL length.
 */

import { WEAPON_SLOTS } from './weaponSlots';

// Condition abbreviations for compact encoding
const CONDITION_TO_ABBREV = {
  'Factory New': 'FN',
  'Minimal Wear': 'MW',
  'Field-Tested': 'FT',
  'Well-Worn': 'WW',
  'Battle-Scarred': 'BS',
  'Vanilla': 'VN',
};

const ABBREV_TO_CONDITION = {
  'FN': 'Factory New',
  'MW': 'Minimal Wear',
  'FT': 'Field-Tested',
  'WW': 'Well-Worn',
  'BS': 'Battle-Scarred',
  'VN': 'Vanilla',
};

// Slot ID abbreviations for even more compact URLs
const SLOT_TO_ABBREV = {
  'knife': 'k',
  'gloves': 'g',
  'pistol_glock': 'pg',
  'pistol_usps': 'pu',
  'pistol_p2000': 'pp',
  'pistol_dualies': 'pd',
  'pistol_p250': 'p2',
  'pistol_fiveseven': 'p5',
  'pistol_tec9': 'pt',
  'pistol_cz': 'pc',
  'pistol_deagle': 'de',
  'pistol_r8': 'pr',
  'rifle_ak47': 'ak',
  'rifle_m4a4': 'm4',
  'rifle_m4a1s': 'ms',
  'rifle_galil': 'ga',
  'rifle_famas': 'fa',
  'rifle_sg553': 'sg',
  'rifle_aug': 'au',
  'rifle_awp': 'aw',
  'rifle_ssg08': 'sc',
  'rifle_scar20': 's2',
  'rifle_g3sg1': 'g3',
  'smg_mp9': 's9',
  'smg_mac10': 'ma',
  'smg_mp7': 's7',
  'smg_mp5': 's5',
  'smg_ump': 'um',
  'smg_p90': 'p9',
  'smg_bizon': 'bi',
  'heavy_nova': 'no',
  'heavy_xm1014': 'xm',
  'heavy_sawedoff': 'so',
  'heavy_mag7': 'm7',
  'heavy_m249': '49',
  'heavy_negev': 'ne',
};

const ABBREV_TO_SLOT = Object.fromEntries(
  Object.entries(SLOT_TO_ABBREV).map(([k, v]) => [v, k])
);

/**
 * Encode inventory data to a compact URL-safe string
 */
export function encodeInventory(inventory) {
  if (!inventory?.slots) return null;

  const compact = {
    v: 1, // Version for future compatibility
    s: {}, // Slots
  };

  Object.entries(inventory.slots).forEach(([slotId, slotData]) => {
    if (slotData?.item) {
      const abbrevSlot = SLOT_TO_ABBREV[slotId] || slotId;
      compact.s[abbrevSlot] = {
        n: slotData.item.name,
        p: slotData.item.price ? Math.round(slotData.item.price * 100) / 100 : 0,
      };

      // Only include condition if present
      if (slotData.item.condition) {
        compact.s[abbrevSlot].c = CONDITION_TO_ABBREV[slotData.item.condition] || slotData.item.condition;
      }
    }
  });

  // Only encode if there are items
  if (Object.keys(compact.s).length === 0) return null;

  try {
    const json = JSON.stringify(compact);
    // Use base64url encoding (URL-safe)
    const base64 = btoa(json)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } catch (err) {
    console.error('Failed to encode inventory:', err);
    return null;
  }
}

/**
 * Decode share data from URL parameter
 */
export function decodeShareData(encoded) {
  if (!encoded) return null;

  try {
    // Restore base64 padding and characters
    let base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = atob(base64);
    const data = JSON.parse(json);

    // Validate version
    if (data.v !== 1) {
      console.error('Unsupported share data version:', data.v);
      return null;
    }

    // Expand abbreviated data back to full format
    const expanded = {
      slots: {},
    };

    Object.entries(data.s || {}).forEach(([abbrevSlot, itemData]) => {
      const fullSlotId = ABBREV_TO_SLOT[abbrevSlot] || abbrevSlot;

      // Validate slot exists
      if (!WEAPON_SLOTS[fullSlotId]) {
        console.warn('Unknown slot ID:', fullSlotId);
        return;
      }

      expanded.slots[fullSlotId] = {
        item: {
          name: itemData.n,
          price: itemData.p || 0,
          condition: itemData.c ? (ABBREV_TO_CONDITION[itemData.c] || itemData.c) : null,
          image: null, // Will be fetched on-demand
        },
      };
    });

    return expanded;
  } catch (err) {
    console.error('Failed to decode share data:', err);
    return null;
  }
}

/**
 * Generate full share URL for the current inventory
 */
export function generateShareUrl(inventory) {
  const encoded = encodeInventory(inventory);
  if (!encoded) return null;

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : '';

  return `${baseUrl}/share?d=${encoded}`;
}

/**
 * Validate decoded share data
 */
export function isValidShareData(data) {
  if (!data?.slots) return false;
  if (Object.keys(data.slots).length === 0) return false;

  // Check that all slots are valid
  for (const slotId of Object.keys(data.slots)) {
    if (!WEAPON_SLOTS[slotId]) return false;
    if (!data.slots[slotId]?.item?.name) return false;
  }

  return true;
}

/**
 * Get share data from URL search params
 */
export function getShareDataFromUrl() {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('d');

  if (!encoded) return null;

  return decodeShareData(encoded);
}
