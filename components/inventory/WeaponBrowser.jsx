'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, DollarSign, Loader2 } from 'lucide-react';
import { WEAPON_SLOTS } from '@/lib/weaponSlots';
import { getWeaponMatchScore } from '@/lib/styleMatcher';
import WeaponSkinCard from './WeaponSkinCard';

export default function WeaponBrowser({
  slotId,
  inventory,
  onSelect,
  onBack,
}) {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('compatibility'); // 'compatibility' or 'price'

  const slot = WEAPON_SLOTS[slotId];

  // Get knife and gloves for scoring
  const knifeName = inventory?.knife?.name || null;
  const gloveName = inventory?.gloves?.name || null;
  const hasKnifeOrGloves = knifeName || gloveName;

  // Fetch skins for this weapon
  useEffect(() => {
    if (!slotId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/weapons?type=${slotId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load skins');
        return res.json();
      })
      .then(data => {
        // Score each skin against knife/gloves combo
        const scoredSkins = data.skins.map(skin => {
          const matchResult = getWeaponMatchScore(skin.name, knifeName, gloveName);
          return {
            ...skin,
            matchScore: matchResult.score,
            knifeScore: matchResult.knifeScore,
            gloveScore: matchResult.gloveScore,
            matchSummary: matchResult.summary,
          };
        });
        setSkins(scoredSkins);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching skins:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [slotId, knifeName, gloveName]);

  // Sort skins based on selected method
  const sortedSkins = useMemo(() => {
    const sorted = [...skins];
    if (sortBy === 'compatibility') {
      sorted.sort((a, b) => b.matchScore - a.matchScore);
    } else {
      sorted.sort((a, b) => a.min_price - b.min_price);
    }
    return sorted;
  }, [skins, sortBy]);

  // Check if a skin is already in inventory
  const isInInventory = (skinName) => {
    const currentItem = inventory?.[slotId];
    if (!currentItem) return false;
    // Check if base name matches
    return currentItem.name?.includes(skinName.split(' | ')[1] || skinName);
  };

  const handleSelect = (item) => {
    onSelect(item);
  };

  if (!slot) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg
              bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-gray-200
              transition-colors"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          <div>
            <h2 className="text-xl font-bold text-gray-100">
              Choose {slot.label} Skin
            </h2>
            <p className="text-sm text-gray-400">
              {loading ? 'Loading...' : `${skins.length} skins available`}
            </p>
          </div>
        </div>

        {/* Sort toggle */}
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setSortBy('compatibility')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors ${sortBy === 'compatibility'
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            Match
          </button>
          <button
            onClick={() => setSortBy('price')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors ${sortBy === 'price'
                ? 'bg-green-500/20 text-green-400'
                : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Price
          </button>
        </div>
      </div>

      {/* Knife/Gloves matching banner */}
      {hasKnifeOrGloves ? (
        <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-sm text-purple-300">
            Matching skins to your{' '}
            {knifeName && gloveName ? (
              <span className="font-semibold text-purple-200">knife & gloves combo</span>
            ) : knifeName ? (
              <span className="font-semibold text-purple-200">knife</span>
            ) : (
              <span className="font-semibold text-purple-200">gloves</span>
            )}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-sm text-yellow-300">
            Add a knife or gloves to your inventory to see match scores
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading {slot.label} skins...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-red-400 mb-2">Failed to load skins</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700
                text-gray-300 text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        ) : skins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-400">No skins found for {slot.label}</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.03 },
              },
            }}
          >
            <AnimatePresence mode="popLayout">
              {sortedSkins.map((skin, index) => (
                <WeaponSkinCard
                  key={skin.baseName}
                  skin={skin}
                  matchScore={hasKnifeOrGloves ? skin.matchScore : null}
                  onAdd={handleSelect}
                  isInInventory={isInInventory(skin.baseName)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
