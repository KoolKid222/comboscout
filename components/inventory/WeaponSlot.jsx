'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ExternalLink } from 'lucide-react';
import { WEAPON_SLOTS, getSkinportSearchUrl } from '@/lib/weaponSlots';

// Rarity colors based on price (simplified version)
const getRarityColor = (price) => {
  if (!price) return { border: 'border-gray-600', bg: 'bg-gray-500/10', text: 'text-gray-400' };
  if (price >= 500) return { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-400' };
  if (price >= 200) return { border: 'border-pink-500/50', bg: 'bg-pink-500/10', text: 'text-pink-400' };
  if (price >= 50) return { border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400' };
  if (price >= 10) return { border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400' };
  return { border: 'border-gray-500/50', bg: 'bg-gray-500/10', text: 'text-gray-400' };
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
          if (data.url) {
            setFetchedImage(data.url);
          }
        })
        .catch(() => {});
    } else {
      setFetchedImage(null);
    }
  }, [item?.name, item?.image]);

  // Use provided image or fetched image
  const imageUrl = item?.image || fetchedImage;

  if (!slot) return null;

  const isEmpty = !item;
  const rarity = getRarityColor(item?.price);
  const sideBadge = getSideBadge(slot.side);

  // Premium slots are larger
  const sizeClasses = isPremium
    ? 'w-40 h-44 md:w-48 md:h-52'
    : 'w-28 h-32 md:w-32 md:h-36';

  const imageSize = isPremium ? 'w-24 h-24 md:w-28 md:h-28' : 'w-16 h-16 md:w-20 md:h-20';

  // Handle click on empty slot
  const handleEmptyClick = () => {
    // Premium items (knife/gloves) go to Skinport (too many variants)
    // Regular weapons open in-app browser
    if (isPremium || !onBrowse) {
      const url = getSkinportSearchUrl(slotId);
      window.open(url, '_blank');
    } else {
      onBrowse(slotId);
    }
  };

  return (
    <motion.div
      className={`relative rounded-xl transition-all duration-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      {isEmpty ? (
        // Empty slot
        <button
          onClick={handleEmptyClick}
          className={`${sizeClasses} flex flex-col items-center justify-center gap-2
            rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-500
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

          {/* Side badge */}
          {sideBadge && (
            <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold
              ${sideBadge.bg} ${sideBadge.text}`}>
              {sideBadge.label}
            </div>
          )}
        </button>
      ) : (
        // Filled slot
        <div
          className={`${sizeClasses} flex flex-col items-center justify-between p-3
            rounded-xl border ${rarity.border} ${rarity.bg}
            bg-gray-800/50 backdrop-blur-sm transition-all`}
        >
          {/* Image */}
          <div className={`${imageSize} relative flex items-center justify-center`}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-700/50 rounded-lg flex items-center justify-center animate-pulse">
                <span className="text-gray-500 text-xs">Loading...</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full text-center mt-1">
            <p className={`text-xs font-semibold ${rarity.text} truncate`}>
              {extractSkinName(item.name)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[10px] text-gray-400 font-mono">
                ${item.price?.toFixed(2) || '0.00'}
              </span>
              {item.condition && (
                <span className="text-[10px] text-gray-500">
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
                onClick={() => onRemove(slotId)}
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500
                  flex items-center justify-center text-white transition-colors"
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

// Extract skin name from full item name (e.g., "AK-47 | Redline" -> "Redline")
function extractSkinName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split('|');
  if (parts.length > 1) {
    // Remove condition from skin name
    return parts[1].replace(/\(.*\)/, '').trim();
  }
  // For knives/gloves, extract the skin part
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
