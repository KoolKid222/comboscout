'use client';

/**
 * Inventory Context
 *
 * Global state management for the inventory system using React Context + useReducer.
 * Automatically syncs to localStorage on changes.
 */

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import {
  loadInventory,
  debouncedSave,
  createEmptyInventory,
  getInventoryStats,
  clearInventory as clearStoredInventory,
} from './inventoryStorage';
import { WEAPON_SLOTS, TOTAL_SLOTS, detectWeaponSlot } from './weaponSlots';

// Action types
const ACTIONS = {
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
  SET_ITEM: 'SET_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_ALL: 'CLEAR_ALL',
  BULK_SET: 'BULK_SET',
};

// Reducer function
function inventoryReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_FROM_STORAGE:
      return action.payload || createEmptyInventory();

    case ACTIONS.SET_ITEM: {
      const { slotId, item } = action.payload;
      return {
        ...state,
        slots: {
          ...state.slots,
          [slotId]: {
            item: {
              ...item,
              addedAt: new Date().toISOString(),
            },
          },
        },
      };
    }

    case ACTIONS.REMOVE_ITEM: {
      const { slotId } = action.payload;
      const newSlots = { ...state.slots };
      delete newSlots[slotId];
      return {
        ...state,
        slots: newSlots,
      };
    }

    case ACTIONS.CLEAR_ALL:
      return createEmptyInventory();

    case ACTIONS.BULK_SET: {
      const { slots } = action.payload;
      const newSlots = {};

      // Process each slot from the payload
      Object.entries(slots).forEach(([slotId, slotData]) => {
        if (WEAPON_SLOTS[slotId] && slotData?.item) {
          newSlots[slotId] = {
            item: {
              ...slotData.item,
              addedAt: new Date().toISOString(),
            },
          };
        }
      });

      return {
        ...state,
        slots: newSlots,
        lastUpdated: new Date().toISOString(),
      };
    }

    default:
      return state;
  }
}

// Create context
const InventoryContext = createContext(null);

// Provider component
export function InventoryProvider({ children }) {
  const [inventory, dispatch] = useReducer(inventoryReducer, createEmptyInventory());

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadInventory();
    if (stored) {
      dispatch({ type: ACTIONS.LOAD_FROM_STORAGE, payload: stored });
    }
  }, []);

  // Save to localStorage on changes (debounced)
  useEffect(() => {
    // Skip initial empty state
    if (inventory.lastUpdated !== null || Object.keys(inventory.slots).length > 0) {
      debouncedSave(inventory);
    }
  }, [inventory]);

  // Action: Set an item in a slot
  const setItem = useCallback((slotId, item) => {
    // Validate slot exists
    if (!WEAPON_SLOTS[slotId]) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    dispatch({
      type: ACTIONS.SET_ITEM,
      payload: { slotId, item },
    });
    return true;
  }, []);

  // Action: Add item and auto-detect slot
  const addItem = useCallback((item) => {
    const slotId = detectWeaponSlot(item.name);
    if (!slotId) {
      console.error(`Could not detect weapon slot for: ${item.name}`);
      return false;
    }

    return setItem(slotId, item);
  }, [setItem]);

  // Action: Remove an item from a slot
  const removeItem = useCallback((slotId) => {
    dispatch({
      type: ACTIONS.REMOVE_ITEM,
      payload: { slotId },
    });
  }, []);

  // Action: Clear all items
  const clearAll = useCallback(() => {
    clearStoredInventory();
    dispatch({ type: ACTIONS.CLEAR_ALL });
  }, []);

  // Action: Bulk set items (for importing shared loadouts)
  const bulkSetItems = useCallback((slots) => {
    dispatch({
      type: ACTIONS.BULK_SET,
      payload: { slots },
    });
  }, []);

  // Check if an item (by name) is in inventory
  const isInInventory = useCallback((itemName) => {
    const slotId = detectWeaponSlot(itemName);
    if (!slotId) return false;

    const currentItem = inventory.slots[slotId]?.item;
    if (!currentItem) return false;

    // Check if it's the same item (by name)
    return currentItem.name === itemName;
  }, [inventory.slots]);

  // Get item from a slot
  const getItem = useCallback((slotId) => {
    return inventory.slots[slotId]?.item || null;
  }, [inventory.slots]);

  // Check if a slot has an item
  const hasItem = useCallback((slotId) => {
    return !!inventory.slots[slotId]?.item;
  }, [inventory.slots]);

  // Computed stats
  const stats = useMemo(() => {
    return getInventoryStats(inventory);
  }, [inventory]);

  // Context value
  const value = useMemo(() => ({
    inventory,
    stats,
    totalSlots: TOTAL_SLOTS,

    // Actions
    setItem,
    addItem,
    removeItem,
    clearAll,
    bulkSetItems,

    // Queries
    isInInventory,
    getItem,
    hasItem,
  }), [inventory, stats, setItem, addItem, removeItem, clearAll, bulkSetItems, isInInventory, getItem, hasItem]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

// Hook to use inventory context
export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

export default InventoryContext;
