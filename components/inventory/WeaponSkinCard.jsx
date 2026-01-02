'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';

// Score-based rarity colors (matching WeaponSlot style)
const getScoreRarity = (score) => {
  if (score >= 90) return {
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    label: 'Perfect'
  };
  if (score >= 80) return {
    border: 'border-pink-500/50',
    text: 'text-pink-400',
    label: 'Excellent'
  };
  if (score >= 70) return {
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    label: 'Great'
  };
  if (score >= 60) return {
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    label: 'Good'
  };
  return {
    border: 'border-gray-700/50',
    text: 'text-gray-400',
    label: 'Match'
  };
};

// Condition abbreviations
const getConditionAbbrev = (condition) => {
  const abbrevs = {
    'Factory New': 'FN',
    'Minimal Wear': 'MW',
    'Field-Tested': 'FT',
    'Well-Worn': 'WW',
    'Battle-Scarred': 'BS',
    'Vanilla': 'VN',
  };
  return abbrevs[condition] || condition?.substring(0, 2) || '';
};

export default function WeaponSkinCard({
  skin,
  matchScore = null,
  onAdd,
  isInInventory = false,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const variant = skin.variants[selectedVariant];
  const rarity = matchScore !== null ? getScoreRarity(matchScore) : getScoreRarity(0);

  // Fetch image
  useEffect(() => {
    if (!skin.name) return;

    setImageLoading(true);
    fetch(`/api/image?name=${encodeURIComponent(skin.name)}`)
      .then(res => res.json())
      .then(data => {
        setImageUrl(data.url);
        setImageLoading(false);
      })
      .catch(() => {
        setImageLoading(false);
      });
  }, [skin.name]);

  const handleAdd = () => {
    if (onAdd && variant) {
      onAdd({
        name: variant.fullName,
        price: variant.price,
        condition: variant.condition,
        image: imageUrl,
      });
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border-2
        bg-gray-900/95 backdrop-blur-sm transition-all duration-200
        ${isHovered ? rarity.border : 'border-gray-700/50'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Background gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90" />

      {/* Match score badge */}
      {matchScore !== null && (
        <div className={`absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full
          font-bold text-[10px] ${rarity.text} bg-black/50 backdrop-blur-sm border border-gray-700/50`}>
          {matchScore}
        </div>
      )}

      {/* Image container */}
      <div className="relative h-28 flex items-center justify-center p-3">
        {imageLoading ? (
          <div className="w-20 h-20 bg-gray-800/50 rounded-xl animate-pulse" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={skin.skinName}
            className="max-w-full max-h-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-800/50 rounded-xl flex items-center justify-center">
            <span className="text-gray-600 text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />

      {/* Info Panel - Frosted glass style */}
      <div className="relative p-3 bg-gray-900/80 border-t border-gray-700/50">
        {/* Skin name */}
        <p className={`text-xs font-bold truncate ${rarity.text}`} title={skin.skinName}>
          {skin.skinName}
        </p>

        {/* Condition selector */}
        {skin.variants.length > 1 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {skin.variants.map((v, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setSelectedVariant(idx); }}
                className={`px-1.5 py-0.5 text-[9px] font-medium rounded transition-all
                  ${selectedVariant === idx
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-gray-800/50 text-gray-500 border border-transparent hover:text-gray-400'
                  }`}
              >
                {getConditionAbbrev(v.condition)}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-2">
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-medium rounded
              bg-gray-800/50 text-gray-500">
              {getConditionAbbrev(variant?.condition)}
            </span>
          </div>
        )}

        {/* Price and add button */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50">
          <span className="text-green-400 font-mono text-[11px] font-bold">
            ${variant?.price?.toFixed(2) || '0.00'}
          </span>

          {isInInventory ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-green-400">
              <Check className="w-3 h-3" />
              Added
            </span>
          ) : (
            <motion.button
              onClick={(e) => { e.stopPropagation(); handleAdd(); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg
                bg-white/5 hover:bg-white/10 text-white/80 hover:text-white
                border border-white/10 hover:border-white/20
                text-[10px] font-medium transition-all"
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-3 h-3" />
              Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
