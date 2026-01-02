'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ExternalLink } from 'lucide-react';
import { WEAPON_SLOTS, getSkinportSearchUrl } from '@/lib/weaponSlots';

// Rarity colors based on price
const getRarityColor = (price) => {
  if (!price) return { border: 'border-gray-700/50', text: 'text-gray-400' };
  if (price >= 500) return { border: 'border-yellow-500/50', text: 'text-yellow-400' };
  if (price >= 200) return { border: 'border-pink-500/50', text: 'text-pink-400' };
  if (price >= 50) return { border: 'border-purple-500/50', text: 'text-purple-400' };
  if (price >= 10) return { border: 'border-blue-500/50', text: 'text-blue-400' };
  return { border: 'border-gray-600/50', text: 'text-gray-400' };
};

// Side badge colors
const getSideBadge = (side) => {
  if (side === 'T') return { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'T' };
  if (side === 'CT') return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'CT' };
  return null;
};

export default function WeaponSlot({
  slotId,
  item,
  isPremium = false,
  onRemove,
  onBrowse,
  onInspect,
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [fetchedImage, setFetchedImage] = useState(null);
  const slot = WEAPON_SLOTS[slotId];

  // Fetch image if item exists but has no image
  useEffect(() => {
    if (item?.name && !item.image) {
      fetch(`/api/image?name=${encodeURIComponent(item.name)}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) setFetchedImage(data.url);
        })
        .catch(() => {});
    } else {
      setFetchedImage(null);
    }
  }, [item?.name, item?.image]);

  const imageUrl = item?.image || fetchedImage;

  if (!slot) return null;

  const isEmpty = !item;
  const rarity = getRarityColor(item?.price);
  const sideBadge = getSideBadge(slot.side);

  // Sizes - prominent weapons without overlap
  const sizeClasses = isPremium
    ? 'w-44 h-52 md:w-52 md:h-60'
    : 'w-full h-44 md:h-48';

  // Large images - weapons are the focus
  const imageSize = isPremium ? 'w-32 h-32 md:w-40 md:h-40' : 'w-24 h-24 md:w-28 md:h-28';

  const handleEmptyClick = () => {
    if (isPremium || !onBrowse) {
      window.open(getSkinportSearchUrl(slotId), '_blank');
    } else {
      onBrowse(slotId);
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {isEmpty ? (
        // ═══════════════════════════════════════════════════════════════
        // EMPTY STATE
        // ═══════════════════════════════════════════════════════════════
        <button
          onClick={handleEmptyClick}
          className={`${sizeClasses} flex flex-col items-center justify-center gap-2
            rounded-2xl border-2 border-dashed border-gray-700 hover:border-gray-500
            bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer group`}
        >
          <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center
            group-hover:bg-gray-600/50 transition-colors">
            <Plus className="w-5 h-5 text-gray-500 group-hover:text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 group-hover:text-gray-400 font-medium">
              {slot.label}
            </p>
            <p className="text-[10px] text-gray-600 group-hover:text-gray-500 mt-0.5 flex items-center gap-1 justify-center">
              {(isPremium || !onBrowse) && <ExternalLink className="w-3 h-3" />}
              Browse
            </p>
          </div>

          {sideBadge && (
            <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold
              ${sideBadge.bg} ${sideBadge.text}`}>
              {sideBadge.label}
            </div>
          )}
        </button>
      ) : (
        // ═══════════════════════════════════════════════════════════════
        // FILLED STATE - Clean glass pane style like ComboCard
        // ═══════════════════════════════════════════════════════════════
        <div
          onClick={() => onInspect?.({ item, slotId, imageUrl })}
          className={`${sizeClasses} relative overflow-hidden rounded-2xl border-2
            bg-gray-900/95 backdrop-blur-sm transition-all duration-200 cursor-pointer
            ${isHovered ? rarity.border : 'border-gray-700/50'}`}
        >
          {/* Background gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90" />

          {/* Weapon Image - Large and prominent */}
          <div className="relative h-[70%] flex items-center justify-center overflow-hidden">
            <div className={`${imageSize} relative`}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-800/50 rounded-xl flex items-center justify-center animate-pulse">
                  <span className="text-gray-600 text-xs">Loading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent" />

          {/* Info Panel - Frosted glass style */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-900/80 border-t border-gray-700/50">
            <p className={`text-xs font-bold truncate ${rarity.text}`}>
              {extractSkinName(item.name)}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-green-400 font-mono text-[11px] font-bold">
                ${item.price?.toFixed(2) || '0.00'}
              </span>
              {item.condition && (
                <span className="text-[10px] text-gray-500 font-medium">
                  {getConditionAbbrev(item.condition)}
                </span>
              )}
            </div>
          </div>

          {/* Side badge */}
          {sideBadge && (
            <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold
              ${sideBadge.bg} ${sideBadge.text}`}>
              {sideBadge.label}
            </div>
          )}

          {/* Remove button on hover */}
          <AnimatePresence>
            {isHovered && onRemove && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(slotId);
                }}
                className="absolute top-2 left-2 w-6 h-6 rounded-full
                  bg-red-500/80 hover:bg-red-500 flex items-center justify-center
                  text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// Extract skin name from full item name
function extractSkinName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split('|');
  if (parts.length > 1) {
    return parts[1].replace(/\(.*\)/, '').trim();
  }
  const skinMatch = fullName.match(/\| (.+?)(?:\(|$)/);
  return skinMatch ? skinMatch[1].trim() : fullName.replace('★ ', '').split('|')[0].trim();
}

// Get condition abbreviation
function getConditionAbbrev(condition) {
  const abbrevs = {
    'Factory New': 'FN',
    'Minimal Wear': 'MW',
    'Field-Tested': 'FT',
    'Well-Worn': 'WW',
    'Battle-Scarred': 'BS',
  };
  return abbrevs[condition] || condition?.substring(0, 2) || '';
}
