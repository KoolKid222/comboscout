'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, DollarSign, Loader2, X, ChevronRight } from 'lucide-react';
import { getStyleScore } from '@/lib/styleMatcher';

// Knife types with display info
const KNIFE_TYPES = [
  { id: 'Karambit', label: 'Karambit', popular: true },
  { id: 'M9 Bayonet', label: 'M9 Bayonet', popular: true },
  { id: 'Butterfly', label: 'Butterfly', popular: true },
  { id: 'Bayonet', label: 'Bayonet', popular: true },
  { id: 'Talon', label: 'Talon', popular: true },
  { id: 'Skeleton', label: 'Skeleton' },
  { id: 'Stiletto', label: 'Stiletto' },
  { id: 'Ursus', label: 'Ursus' },
  { id: 'Navaja', label: 'Navaja' },
  { id: 'Huntsman', label: 'Huntsman' },
  { id: 'Bowie', label: 'Bowie' },
  { id: 'Falchion', label: 'Falchion' },
  { id: 'Flip', label: 'Flip' },
  { id: 'Gut', label: 'Gut' },
  { id: 'Shadow Daggers', label: 'Shadow Daggers' },
  { id: 'Paracord', label: 'Paracord' },
  { id: 'Survival', label: 'Survival' },
  { id: 'Nomad', label: 'Nomad' },
  { id: 'Classic', label: 'Classic' },
  { id: 'Kukri', label: 'Kukri' },
];

// Glove types with display info
const GLOVE_TYPES = [
  { id: 'Sport Gloves', label: 'Sport Gloves', popular: true },
  { id: 'Driver Gloves', label: 'Driver Gloves', popular: true },
  { id: 'Moto Gloves', label: 'Moto Gloves', popular: true },
  { id: 'Specialist Gloves', label: 'Specialist Gloves', popular: true },
  { id: 'Hand Wraps', label: 'Hand Wraps' },
  { id: 'Hydra Gloves', label: 'Hydra Gloves' },
  { id: 'Broken Fang', label: 'Broken Fang' },
];

// Score-based rarity colors
const getScoreRarity = (score) => {
  if (score >= 90) return { border: 'border-yellow-500/50', text: 'text-yellow-400' };
  if (score >= 80) return { border: 'border-pink-500/50', text: 'text-pink-400' };
  if (score >= 70) return { border: 'border-purple-500/50', text: 'text-purple-400' };
  if (score >= 60) return { border: 'border-blue-500/50', text: 'text-blue-400' };
  return { border: 'border-gray-700/50', text: 'text-gray-400' };
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

// Extract skin pattern from full name
const extractSkinPattern = (name) => {
  if (!name) return '';
  const parts = name.split('|');
  if (parts.length > 1) {
    return parts[1].replace(/\(.*\)/, '').trim();
  }
  return 'Vanilla';
};

// Extract item type from full name
const extractItemType = (name) => {
  if (!name) return '';
  const parts = name.split('|');
  return parts[0].replace('★ ', '').trim();
};

// Type selection card with vanilla image
function TypeCard({ type, onClick, itemCount, vanillaItemName }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // Fetch image for the vanilla/representative item
  useEffect(() => {
    if (!vanillaItemName) return;

    fetch(`/api/image?name=${encodeURIComponent(vanillaItemName)}`)
      .then(res => res.json())
      .then(data => {
        if (data.url) setImageUrl(data.url);
      })
      .catch(() => {});
  }, [vanillaItemName]);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl border-2
        bg-gray-900/95 backdrop-blur-sm transition-all duration-200 text-left
        ${isHovered ? 'border-purple-500/50' : 'border-gray-700/50'}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90" />

      {/* Vanilla image */}
      <div className="relative h-20 flex items-center justify-center p-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={type.label}
            className="max-w-full max-h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-12 bg-gray-800/30 rounded-lg animate-pulse" />
        )}
      </div>

      {/* Info */}
      <div className="relative px-3 pb-3 pt-1">
        <p className="text-sm font-bold text-white truncate">{type.label}</p>
        {itemCount !== undefined && (
          <p className="text-[10px] text-gray-500">{itemCount} skins</p>
        )}
      </div>

      {type.popular && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold
          bg-purple-500/20 text-purple-400 border border-purple-500/30">
          Popular
        </div>
      )}
    </motion.button>
  );
}

// Skin card component
function SkinCard({ skin, matchScore, onAdd, otherItemName }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const variant = skin.variants[selectedVariant];
  const rarity = matchScore !== null ? getScoreRarity(matchScore) : getScoreRarity(0);
  const skinPattern = extractSkinPattern(skin.name);

  useEffect(() => {
    if (!skin.name) return;
    setImageLoading(true);
    fetch(`/api/image?name=${encodeURIComponent(skin.name)}`)
      .then(res => res.json())
      .then(data => {
        setImageUrl(data.url);
        setImageLoading(false);
      })
      .catch(() => setImageLoading(false));
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
        bg-gray-900/95 backdrop-blur-sm transition-all duration-200 cursor-pointer
        ${isHovered ? rarity.border : 'border-gray-700/50'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleAdd}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90" />

      {matchScore !== null && (
        <div className={`absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full
          font-bold text-[10px] ${rarity.text} bg-black/50 backdrop-blur-sm border border-gray-700/50`}>
          {matchScore}
        </div>
      )}

      <div className="relative h-28 flex items-center justify-center p-3">
        {imageLoading ? (
          <div className="w-20 h-20 bg-gray-800/50 rounded-xl animate-pulse" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={skin.name}
            className="max-w-full max-h-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-800/50 rounded-xl flex items-center justify-center">
            <span className="text-gray-600 text-xs">No Image</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />

      <div className="relative p-3 bg-gray-900/80 border-t border-gray-700/50">
        <p className={`text-xs font-bold truncate ${rarity.text}`} title={skinPattern}>
          {skinPattern}
        </p>

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
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-medium rounded bg-gray-800/50 text-gray-500">
              {getConditionAbbrev(variant?.condition)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50">
          <span className="text-green-400 font-mono text-[11px] font-bold">
            ${variant?.price?.toFixed(2) || '0.00'}
          </span>
          <span className="text-[10px] text-gray-500">Click to add</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PremiumBrowser({
  slotId,
  inventory,
  onSelect,
  onBack,
}) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('compatibility');

  const isKnife = slotId === 'knife';
  const types = isKnife ? KNIFE_TYPES : GLOVE_TYPES;
  const otherSlotId = isKnife ? 'gloves' : 'knife';
  const otherItem = inventory?.[otherSlotId];
  const otherItemName = otherItem?.name || null;

  // Fetch all items once
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('/api/prices')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load items');
        return res.json();
      })
      .then(data => {
        const itemList = isKnife ? data.knives : data.gloves;

        const scoredItems = itemList.map(item => {
          let matchScore = null;
          if (otherItemName) {
            if (isKnife) {
              matchScore = getStyleScore(item.name, otherItemName);
            } else {
              matchScore = getStyleScore(otherItemName, item.name);
            }
          }
          return { ...item, matchScore };
        });

        setAllItems(scoredItems);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching items:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [slotId, otherItemName, isKnife]);

  // Count items per type and find vanilla items
  const { typeCounts, vanillaItems } = useMemo(() => {
    const counts = {};
    const vanillas = {};

    allItems.forEach(item => {
      const itemType = extractItemType(item.name);
      types.forEach(type => {
        if (itemType.includes(type.id)) {
          counts[type.id] = (counts[type.id] || 0) + 1;

          // Check if this is a vanilla item (no "|" means no skin pattern)
          if (!item.name.includes('|')) {
            vanillas[type.id] = item.name;
          }
        }
      });
    });

    return { typeCounts: counts, vanillaItems: vanillas };
  }, [allItems, types]);

  // Filter items for selected type
  const filteredItems = useMemo(() => {
    if (!selectedType) return [];

    let result = allItems.filter(item => {
      const itemType = extractItemType(item.name);
      return itemType.includes(selectedType);
    });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        extractSkinPattern(item.name).toLowerCase().includes(query)
      );
    }

    if (sortBy === 'compatibility' && otherItemName) {
      result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else {
      result.sort((a, b) => a.min_price - b.min_price);
    }

    return result;
  }, [allItems, selectedType, searchQuery, sortBy, otherItemName]);

  const handleSelect = (item) => {
    onSelect(item);
  };

  const handleBack = () => {
    if (selectedType) {
      setSelectedType(null);
      setSearchQuery('');
    } else {
      onBack();
    }
  };

  // Get selected type info
  const selectedTypeInfo = types.find(t => t.id === selectedType);

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
            onClick={handleBack}
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
              {selectedType ? selectedTypeInfo?.label : `Choose ${isKnife ? 'Knife' : 'Gloves'}`}
            </h2>
            <p className="text-sm text-gray-400">
              {loading ? 'Loading...' :
                selectedType ? `${filteredItems.length} skins available` :
                `Select a ${isKnife ? 'knife' : 'glove'} type`}
            </p>
          </div>
        </div>

        {/* Sort toggle - only show when viewing skins */}
        {selectedType && (
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setSortBy('compatibility')}
              disabled={!otherItemName}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                transition-colors ${sortBy === 'compatibility' && otherItemName
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
                } ${!otherItemName ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
          <p className="text-gray-400">Loading {isKnife ? 'knives' : 'gloves'}...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-red-400 mb-2">Failed to load items</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      ) : !selectedType ? (
        /* Type Selection Grid */
        <div className="flex-1 overflow-y-auto">
          {/* Match info banner */}
          {otherItemName ? (
            <div className="mb-6 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-300">
                Skins will be scored based on compatibility with your{' '}
                <span className="font-semibold text-purple-200">
                  {extractSkinPattern(otherItemName)} {isKnife ? 'Gloves' : 'Knife'}
                </span>
              </p>
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <p className="text-sm text-gray-400">
                Add {isKnife ? 'gloves' : 'a knife'} first to see match scores
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {types.map((type) => (
              <TypeCard
                key={type.id}
                type={type}
                itemCount={typeCounts[type.id] || 0}
                onClick={() => setSelectedType(type.id)}
                vanillaItemName={vanillaItems[type.id]}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Skin Browser for Selected Type */
        <>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${selectedTypeInfo?.label} skins...`}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50
                text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50
                transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Match info */}
          {otherItemName && (
            <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-300">
                Matching to your{' '}
                <span className="font-semibold text-purple-200">
                  {extractSkinPattern(otherItemName)} {isKnife ? 'Gloves' : 'Knife'}
                </span>
              </p>
            </div>
          )}

          {/* Skins Grid */}
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-gray-400">No skins found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-purple-400 text-sm hover:text-purple-300"
                  >
                    Clear search
                  </button>
                )}
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
                    transition: { staggerChildren: 0.02 },
                  },
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <SkinCard
                      key={item.baseName}
                      skin={item}
                      matchScore={otherItemName ? item.matchScore : null}
                      onAdd={handleSelect}
                      otherItemName={otherItemName}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
