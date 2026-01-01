/**
 * Inventory localStorage Utilities
 *
 * Handles persistence of user inventory with debouncing,
 * error handling, and schema version migration support.
 */

const STORAGE_KEY = 'comboscout_inventory_v1';
const SCHEMA_VERSION = 1;

// Default empty inventory state
export function createEmptyInventory() {
  return {
    version: SCHEMA_VERSION,
    lastUpdated: null,
    slots: {},
  };
}

/**
 * Check if we're in a browser environment
 */
function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Load inventory from localStorage
 * @returns {Object|null} Inventory object or null if not found/error
 */
export function loadInventory() {
  if (!isBrowser()) {
    return null;
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);

    // Validate structure
    if (!parsed || typeof parsed !== 'object') {
      console.warn('Invalid inventory data structure, resetting');
      return null;
    }

    // Check for version migration
    if (parsed.version !== SCHEMA_VERSION) {
      console.log(`Migrating inventory from v${parsed.version} to v${SCHEMA_VERSION}`);
      return migrateInventory(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load inventory from localStorage:', error);
    return null;
  }
}

/**
 * Save inventory to localStorage
 * @param {Object} inventory - The inventory object to save
 * @returns {boolean} Success status
 */
export function saveInventory(inventory) {
  if (!isBrowser()) {
    return false;
  }

  try {
    const data = {
      ...inventory,
      version: SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    // Handle quota exceeded
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Cannot save inventory.');
    } else {
      console.error('Failed to save inventory to localStorage:', error);
    }
    return false;
  }
}

/**
 * Clear inventory from localStorage
 */
export function clearInventory() {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear inventory from localStorage:', error);
  }
}

/**
 * Migrate inventory from older schema versions
 * @param {Object} oldInventory - Inventory with older schema
 * @returns {Object} Migrated inventory
 */
function migrateInventory(oldInventory) {
  // For now, we only have v1, so any old data gets reset
  // Future migrations would go here:
  // if (oldInventory.version === 1) { ... migrate to v2 ... }

  console.warn('Unknown inventory version, creating fresh inventory');
  return createEmptyInventory();
}

// Debounce utility for save operations
let saveTimeout = null;
const DEBOUNCE_MS = 300;

/**
 * Debounced save - waits 300ms after last call before saving
 * @param {Object} inventory - The inventory object to save
 */
export function debouncedSave(inventory) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveInventory(inventory);
    saveTimeout = null;
  }, DEBOUNCE_MS);
}

/**
 * Get inventory statistics
 * @param {Object} inventory - The inventory object
 * @returns {Object} Stats object with counts and totals
 */
export function getInventoryStats(inventory) {
  if (!inventory || !inventory.slots) {
    return {
      filledSlots: 0,
      totalValue: 0,
      items: [],
    };
  }

  const items = Object.entries(inventory.slots)
    .filter(([_, data]) => data && data.item)
    .map(([slotId, data]) => ({
      slotId,
      ...data.item,
    }));

  const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return {
    filledSlots: items.length,
    totalValue,
    items,
  };
}

/**
 * Check if a slot has an item
 * @param {Object} inventory - The inventory object
 * @param {string} slotId - The slot ID to check
 * @returns {boolean}
 */
export function hasItem(inventory, slotId) {
  return !!(inventory?.slots?.[slotId]?.item);
}

/**
 * Get item from a slot
 * @param {Object} inventory - The inventory object
 * @param {string} slotId - The slot ID
 * @returns {Object|null} Item data or null
 */
export function getItem(inventory, slotId) {
  return inventory?.slots?.[slotId]?.item || null;
}
