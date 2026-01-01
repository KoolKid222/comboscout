'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';

// Score-based rarity colors (matching ComboCard pattern)
const getScoreRarity = (score) => {
  if (score >= 90) return { border: 'border-yellow-500/60', glow: 'shadow-yellow-500/20', text: 'text-yellow-400', label: 'Perfect' };
  if (score >= 80) return { border: 'border-pink-500/60', glow: 'shadow-pink-500/20', text: 'text-pink-400', label: 'Excellent' };
  if (score >= 70) return { border: 'border-purple-500/60', glow: 'shadow-purple-500/20', text: 'text-purple-400', label: 'Great' };
  if (score >= 60) return { border: 'border-blue-500/60', glow: 'shadow-blue-500/20', text: 'text-blue-400', label: 'Good' };
  return { border: 'border-gray-600/60', glow: 'shadow-gray-500/20', text: 'text-gray-400', label: 'Match' };
};

// Condition badge colors
const getConditionStyle = (condition) => {
  const styles = {
    'Factory New': { bg: 'bg-green-500/20', text: 'text-green-400' },
    'Minimal Wear': { bg: 'bg-lime-500/20', text: 'text-lime-400' },
    'Field-Tested': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    'Well-Worn': { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    'Battle-Scarred': { bg: 'bg-red-500/20', text: 'text-red-400' },
  };
  return styles[condition] || { bg: 'bg-gray-500/20', text: 'text-gray-400' };
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
  const rarity = matchScore !== null ? getScoreRarity(matchScore) : { border: 'border-gray-600/60', glow: 'shadow-gray-500/20', text: 'text-gray-400', label: 'Match' };
  const conditionStyle = getConditionStyle(variant?.condition);

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
      className={`relative rounded-xl border ${rarity.border} bg-gray-800/60 backdrop-blur-sm
        overflow-hidden transition-all duration-200 hover:shadow-lg ${rarity.glow}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Match score badge */}
      {matchScore !== null && (
        <div className={`absolute top-2 right-2 z-10 px-2 py-1
          rounded-full ${rarity.border} bg-gray-900/80 backdrop-blur-sm`}>
          <span className={`text-xs font-bold ${rarity.text}`}>{matchScore}</span>
        </div>
      )}

      {/* Image container */}
      <div className="relative h-32 flex items-center justify-center p-4 bg-gradient-to-b from-gray-700/20 to-transparent">
        {imageLoading ? (
          <div className="w-24 h-24 bg-gray-700/50 rounded-lg animate-pulse" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={skin.skinName}
            className="max-w-full max-h-full object-contain drop-shadow-lg"
            loading="lazy"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-700/30 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Skin name */}
        <h3 className="text-sm font-semibold text-gray-100 truncate" title={skin.skinName}>
          {skin.skinName}
        </h3>

        {/* Condition selector (if multiple variants) */}
        {skin.variants.length > 1 ? (
          <div className="flex flex-wrap gap-1">
            {skin.variants.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariant(idx)}
                className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors
                  ${selectedVariant === idx
                    ? `${conditionStyle.bg} ${conditionStyle.text} ring-1 ring-current`
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {getConditionAbbrev(v.condition)}
              </button>
            ))}
          </div>
        ) : (
          <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded
            ${conditionStyle.bg} ${conditionStyle.text}`}>
            {getConditionAbbrev(variant?.condition)}
          </span>
        )}

        {/* Price and add button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-mono text-green-400">
            ${variant?.price?.toFixed(2) || '0.00'}
          </span>

          {isInInventory ? (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <Check className="w-3.5 h-3.5" />
              Added
            </span>
          ) : (
            <motion.button
              onClick={handleAdd}
              className="flex items-center gap-1 px-2 py-1 rounded-lg
                bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300
                text-xs font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
