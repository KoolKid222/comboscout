'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Loader2 } from 'lucide-react';
import { useInventory } from '@/lib/InventoryContext';
import { getSlotsByCategory, SLOT_CATEGORIES, PREMIUM_SLOTS, WEAPON_SLOTS } from '@/lib/weaponSlots';
import { getStyleScore, getWeaponMatchScore } from '@/lib/styleMatcher';
import WeaponSlot from './WeaponSlot';
import WeaponBrowser from './WeaponBrowser';

// Get rarity info for the knife+glove match score
const getMatchRarity = (score) => {
  if (score >= 90) return { name: 'LEGENDARY', color: 'text-yellow-400', gradient: 'from-yellow-500 to-amber-600' };
  if (score >= 80) return { name: 'EXOTIC', color: 'text-pink-400', gradient: 'from-pink-500 to-rose-600' };
  if (score >= 70) return { name: 'RARE', color: 'text-purple-400', gradient: 'from-purple-500 to-violet-600' };
  if (score >= 60) return { name: 'UNCOMMON', color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-600' };
  return { name: 'COMMON', color: 'text-gray-400', gradient: 'from-gray-500 to-zinc-600' };
};

export default function InventoryOverlay({ isOpen, onClose }) {
  const { inventory, stats, removeItem, clearAll, getItem, setItem, totalSlots } = useInventory();
  const [browsingSlot, setBrowsingSlot] = useState(null);
  const [autoFilling, setAutoFilling] = useState(false);

  const slotsByCategory = getSlotsByCategory();

  // Get inventory as a simple object for the browser (knife and gloves for scoring)
  const inventoryForBrowser = {
    knife: getItem('knife'),
    gloves: getItem('gloves'),
  };

  // Handle selecting a skin from the browser
  const handleSkinSelect = (item) => {
    if (browsingSlot && item) {
      setItem(browsingSlot, item);
      setBrowsingSlot(null);
    }
  };

  // Get knife and gloves for match score
  const knifeItem = getItem('knife');
  const glovesItem = getItem('gloves');
  const hasKnifeAndGloves = knifeItem && glovesItem;
  const hasKnifeOrGloves = knifeItem || glovesItem;
  const knifeName = knifeItem?.name || null;
  const gloveName = glovesItem?.name || null;

  // Auto fill all empty weapon slots with best matching skins
  const handleAutoFill = async () => {
    if (!hasKnifeOrGloves) return;

    setAutoFilling(true);

    try {
      // Get all empty non-premium slots
      const emptySlots = Object.keys(WEAPON_SLOTS)
        .filter(id => !PREMIUM_SLOTS.includes(id) && !getItem(id));

      // For each empty slot, fetch skins and pick the best
      for (const slotId of emptySlots) {
        try {
          const res = await fetch(`/api/weapons?type=${slotId}`);
          const data = await res.json();

          if (data.skins && data.skins.length > 0) {
            // Score each skin and find the best
            const scored = data.skins.map(skin => ({
              ...skin,
              score: getWeaponMatchScore(skin.name, knifeName, gloveName).score
            }));
            scored.sort((a, b) => b.score - a.score);

            // Add best skin to inventory (use cheapest variant)
            const best = scored[0];
            const variant = best.variants[0];
            setItem(slotId, {
              name: variant.fullName,
              price: variant.price,
              condition: variant.condition,
              image: null, // will load lazily
            });
          }
        } catch (err) {
          console.error(`Error fetching skins for ${slotId}:`, err);
        }
      }
    } finally {
      setAutoFilling(false);
    }
  };
  const matchScore = hasKnifeAndGloves
    ? getStyleScore(knifeItem.name, glovesItem.name)
    : null;
  const matchRarity = matchScore ? getMatchRarity(matchScore) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

          {/* Content */}
          <div className="relative min-h-screen py-8 px-4 md:px-8">
            {/* Close button */}
            <motion.button
              onClick={() => {
                if (browsingSlot) {
                  setBrowsingSlot(null);
                } else {
                  onClose();
                }
              }}
              className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md
                border border-white/10 flex items-center justify-center text-white/70 hover:text-white
                hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Weapon Browser View */}
            {browsingSlot && (
              <motion.div
                className="max-w-6xl mx-auto h-[calc(100vh-4rem)]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <WeaponBrowser
                  slotId={browsingSlot}
                  inventory={inventoryForBrowser}
                  onSelect={handleSkinSelect}
                  onBack={() => setBrowsingSlot(null)}
                />
              </motion.div>
            )}

            {/* Main Inventory View */}
            {!browsingSlot && (
              <>
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                YOUR CS2 LOADOUT
              </h1>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="text-white/60 text-sm font-medium">
                  {stats.filledSlots}/{totalSlots} slots filled
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/60 text-sm font-mono">
                  Total: <span className="text-purple-400 font-bold">${stats.totalValue.toFixed(2)}</span>
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {/* Auto Fill button */}
                <button
                  onClick={handleAutoFill}
                  disabled={!hasKnifeOrGloves || autoFilling}
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                    flex items-center gap-2 transition-colors
                    ${hasKnifeOrGloves
                      ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30'
                      : 'bg-gray-500/10 border border-gray-500/20 text-gray-500 cursor-not-allowed'
                    }`}
                  title={!hasKnifeOrGloves ? 'Add knife or gloves first' : 'Auto fill all empty slots with best matching skins'}
                >
                  {autoFilling && <Loader2 className="w-4 h-4 animate-spin" />}
                  {autoFilling ? 'Filling...' : 'Auto Fill'}
                </button>

                {/* Clear all button */}
                {stats.filledSlots > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all items from your inventory?')) {
                        clearAll();
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30
                      text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors
                      flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </motion.div>

            {/* Premium Section - Knife & Gloves */}
            <motion.div
              className="max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-4 md:gap-8">
                {/* Knife */}
                <div className="flex flex-col items-center">
                  <p className="text-white/40 text-xs font-medium tracking-wider uppercase mb-2">Knife</p>
                  <WeaponSlot
                    slotId="knife"
                    item={getItem('knife')}
                    isPremium
                    onRemove={removeItem}
                  />
                </div>

                {/* Match Score (if both equipped) */}
                {hasKnifeAndGloves && matchRarity && (
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${matchRarity.gradient}
                      flex flex-col items-center justify-center shadow-lg`}>
                      <span className="text-white font-black text-xl">{matchScore}</span>
                    </div>
                    <p className={`text-xs font-bold mt-2 ${matchRarity.color}`}>
                      {matchRarity.name}
                    </p>
                  </div>
                )}

                {/* Gloves */}
                <div className="flex flex-col items-center">
                  <p className="text-white/40 text-xs font-medium tracking-wider uppercase mb-2">Gloves</p>
                  <WeaponSlot
                    slotId="gloves"
                    item={getItem('gloves')}
                    isPremium
                    onRemove={removeItem}
                  />
                </div>
              </div>
            </motion.div>

            {/* Weapon Categories */}
            <motion.div
              className="max-w-5xl mx-auto space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {Object.entries(slotsByCategory).map(([categoryId, slots]) => {
                // Skip premium (knife/gloves) as they're displayed above
                if (categoryId === 'premium') return null;

                const categoryInfo = SLOT_CATEGORIES[categoryId];

                return (
                  <div key={categoryId}>
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
                      <h2 className="text-white/80 text-lg font-bold tracking-wide uppercase">
                        {categoryInfo.label}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    {/* Slots Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
                      {slots.map((slot) => (
                        <WeaponSlot
                          key={slot.id}
                          slotId={slot.id}
                          item={getItem(slot.id)}
                          onRemove={removeItem}
                          onBrowse={setBrowsingSlot}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Footer */}
            <motion.div
              className="text-center mt-12 pb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-white/30 text-xs">
                Click empty slots to browse and add skins
              </p>
            </motion.div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
