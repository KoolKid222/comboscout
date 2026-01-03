'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Loader2, Share2, Check, ChevronDown } from 'lucide-react';
import { useInventory } from '@/lib/InventoryContext';
import { getSlotsByCategory, SLOT_CATEGORIES, PREMIUM_SLOTS, WEAPON_SLOTS } from '@/lib/weaponSlots';
import { getStyleScore, getWeaponMatchScore, getSkinData } from '@/lib/styleMatcher';
import { generateShareUrl } from '@/lib/shareUrl';
import WeaponSlot from './WeaponSlot';
import WeaponBrowser from './WeaponBrowser';
import PremiumBrowser from './PremiumBrowser';
import WeaponShowroom from './WeaponShowroom';

// Get rarity info for the knife+glove match score
const getMatchRarity = (score) => {
  if (score >= 90) return { name: 'LEGENDARY', color: 'text-yellow-400', gradient: 'from-yellow-500 to-amber-600' };
  if (score >= 80) return { name: 'EXOTIC', color: 'text-pink-400', gradient: 'from-pink-500 to-rose-600' };
  if (score >= 70) return { name: 'RARE', color: 'text-purple-400', gradient: 'from-purple-500 to-violet-600' };
  if (score >= 60) return { name: 'UNCOMMON', color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-600' };
  return { name: 'COMMON', color: 'text-gray-400', gradient: 'from-gray-500 to-zinc-600' };
};

// Get the inventory profile for diversity calculations
const getInventoryProfile = (filledItems) => {
  const profile = {
    textures: {},
    weights: {},
    hueBalance: { warm: 0, cool: 0, neutral: 0 },
  };

  for (const item of filledItems) {
    if (!item?.name) continue;
    const skinData = getSkinData(item.name);
    if (!skinData) continue;

    // Count textures
    const texture = skinData.texture || 'unknown';
    profile.textures[texture] = (profile.textures[texture] || 0) + 1;

    // Count weights
    const weight = skinData.weight || 'medium';
    profile.weights[weight] = (profile.weights[weight] || 0) + 1;

    // Categorize hue (warm: red/orange/yellow, cool: blue/green/purple, neutral: gray/black/white)
    const [hue, sat] = skinData.hsl;
    if (sat < 15) {
      profile.hueBalance.neutral++;
    } else if (hue < 60 || hue > 300) {
      profile.hueBalance.warm++;
    } else {
      profile.hueBalance.cool++;
    }
  }

  return profile;
};

// Texture families for cohesion matching
const TEXTURE_FAMILIES = {
  organic: ['organic', 'nature', 'animal', 'reptile', 'web', 'floral', 'beast', 'aquatic'],
  tactical: ['camo', 'military', 'industrial', 'worn', 'desert', 'arctic'],
  elegant: ['gem', 'gradient', 'ornate', 'formal', 'clean', 'ancient', 'mythic', 'ripple'],
  tech: ['tech', 'metallic', 'geometric', 'neon', 'glitch', 'space', 'electric'],
  casual: ['sport', 'fabric', 'leather', 'retro', 'comic', 'fun', 'fashion'],
  dark: ['stealth', 'burnt', 'smoke', 'noir', 'horror', 'skull', 'contrast'],
  artistic: ['art', 'pattern', 'tattoo', 'japanese', 'tribal', 'psychedelic', 'stripe'],
  elemental: ['fire', 'storm', 'elemental', 'cracked', 'rust', 'patina', 'galaxy', 'wood'],
};

// "Safe/boring" textures that shouldn't be prioritized
const SAFE_TEXTURES = ['clean', 'stealth', 'unknown'];

// Get the texture family for a texture
const getTextureFamily = (texture) => {
  for (const [family, textures] of Object.entries(TEXTURE_FAMILIES)) {
    if (textures.includes(texture)) return family;
  }
  return null;
};

// Calculate bonus for auto-fill selection (boldness + cohesion)
const calculateAutoFillBonus = (skinName, profile, totalItems, knifeData, gloveData) => {
  const skinData = getSkinData(skinName);
  if (!skinData) return 0;

  let bonus = 0;
  const texture = skinData.texture || 'unknown';
  const [, sat, light] = skinData.hsl;
  const weight = skinData.weight || 'medium';

  // === COHESION BONUS: Match knife/glove texture family ===
  const skinFamily = getTextureFamily(texture);
  const knifeFamily = knifeData ? getTextureFamily(knifeData.texture) : null;
  const gloveFamily = gloveData ? getTextureFamily(gloveData.texture) : null;

  if (skinFamily) {
    // Strong bonus for matching knife's texture family
    if (knifeFamily && skinFamily === knifeFamily) {
      bonus += 12;
    }
    // Bonus for matching glove's texture family
    if (gloveFamily && skinFamily === gloveFamily) {
      bonus += 8;
    }
  }

  // === BOLDNESS BONUS: Prefer colorful, interesting skins ===
  // Bonus for colorful skins (higher saturation)
  if (sat >= 50) {
    bonus += 8; // Vibrant colors
  } else if (sat >= 30) {
    bonus += 4; // Moderate color
  } else if (sat < 15) {
    bonus -= 6; // Penalize very desaturated/gray skins
  }

  // Bonus for bold visual weight
  if (weight === 'bold') {
    bonus += 5;
  } else if (weight === 'subtle') {
    bonus -= 3; // Slight penalty for subtle skins
  }

  // Penalize "safe" boring textures
  if (SAFE_TEXTURES.includes(texture)) {
    bonus -= 8;
  }

  // Penalize very dark or very light (washed out) skins
  if (light < 20 || light > 75) {
    bonus -= 4;
  }

  // === DIVERSITY: Don't pick too many of the same texture ===
  const sameTextureCount = profile.textures[texture] || 0;
  if (sameTextureCount >= 3) {
    bonus -= 8 * (sameTextureCount - 2);
  }

  // Small bonus for introducing variety (but less than cohesion)
  if (sameTextureCount === 0 && !SAFE_TEXTURES.includes(texture)) {
    bonus += 3;
  }

  // === HUE BALANCE ===
  if (totalItems >= 3) {
    const total = profile.hueBalance.warm + profile.hueBalance.cool + profile.hueBalance.neutral;
    if (total > 0) {
      const [hue] = skinData.hsl;
      let skinTemp = 'neutral';
      if (sat >= 15) {
        skinTemp = (hue < 60 || hue > 300) ? 'warm' : 'cool';
      }

      const currentRatio = profile.hueBalance[skinTemp] / total;
      if (currentRatio >= 0.7) {
        bonus -= 4; // Too much of same temperature
      }
    }
  }

  return bonus;
};

// =============================================================================
// STRICT HUE CLAMP FOR AUTO-FILL
// Ensures monotone, cohesive loadouts by filtering skins outside anchor hue range
// =============================================================================

const HUE_CLAMP_RANGE = 45; // Maximum hue difference allowed (degrees)
const NEUTRAL_SAT_THRESHOLD = 15; // Skins below this saturation are considered neutral

/**
 * Calculate hue difference accounting for circular nature of hue (0-360)
 */
const hueDifference = (h1, h2) => {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
};

/**
 * Calculate the anchor hue from knife and/or gloves
 * Uses weighted average if both are present, favoring knife
 */
const calculateAnchorHue = (knifeData, gloveData) => {
  // If neither has data, return null (no filtering)
  if (!knifeData && !gloveData) return null;

  const knifeHue = knifeData?.hsl?.[0];
  const knifeSat = knifeData?.hsl?.[1] ?? 0;
  const gloveHue = gloveData?.hsl?.[0];
  const gloveSat = gloveData?.hsl?.[1] ?? 0;

  // If knife is neutral (low saturation), use glove's hue
  const knifeIsNeutral = knifeSat < NEUTRAL_SAT_THRESHOLD;
  // If glove is neutral, use knife's hue
  const gloveIsNeutral = gloveSat < NEUTRAL_SAT_THRESHOLD;

  // Both neutral = no hue anchor (allow all)
  if (knifeIsNeutral && gloveIsNeutral) return null;

  // Only knife has color
  if (gloveIsNeutral || gloveHue === undefined) return knifeHue;

  // Only glove has color
  if (knifeIsNeutral || knifeHue === undefined) return gloveHue;

  // Both have color - calculate weighted average (favor knife 60/40)
  // Handle hue wrapping (e.g., 350° and 10° should average to 0°, not 180°)
  let diff = gloveHue - knifeHue;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  let anchor = knifeHue + (diff * 0.4); // 60% knife, 40% glove
  if (anchor < 0) anchor += 360;
  if (anchor >= 360) anchor -= 360;

  return anchor;
};

/**
 * Filter skins by anchor hue - STRICT filter for Auto-Fill
 * Returns only skins within HUE_CLAMP_RANGE of anchor, plus neutrals
 *
 * @param {Array} skins - Array of skin objects with 'name' property
 * @param {number|null} anchorHue - The anchor hue to filter by (null = no filter)
 * @returns {Array} Filtered array of skins
 */
const filterSkinsByAnchorHue = (skins, anchorHue) => {
  // No anchor = no filtering (both knife/glove are neutral or missing)
  if (anchorHue === null || anchorHue === undefined) {
    return skins;
  }

  return skins.filter(skin => {
    const skinData = getSkinData(skin.name);
    if (!skinData) return false;

    const [skinHue, skinSat] = skinData.hsl;

    // RULE 1: Always allow neutral skins (black/grey/white)
    if (skinSat < NEUTRAL_SAT_THRESHOLD) {
      return true;
    }

    // RULE 2: Check if skin hue is within the clamp range
    const diff = hueDifference(skinHue, anchorHue);

    // Strict clamp: must be within 45 degrees
    // This automatically blocks complementary colors (180° apart)
    return diff <= HUE_CLAMP_RANGE;
  });
};

export default function InventoryOverlay({ isOpen, onClose }) {
  const { inventory, stats, removeItem, clearAll, getItem, setItem, totalSlots } = useInventory();
  const [browsingSlot, setBrowsingSlot] = useState(null);
  const [autoFilling, setAutoFilling] = useState(false);
  const [inspectingWeapon, setInspectingWeapon] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [showAutoFillSettings, setShowAutoFillSettings] = useState(false);
  const [autoFillMode, setAutoFillMode] = useState('bestMatch');

  // Auto-fill mode definitions
  const AUTO_FILL_MODES = {
    bestMatch: {
      label: 'Best Match',
      description: 'Highest scoring skin per slot',
    },
    complimentary: {
      label: 'Complimentary',
      description: 'Similar or complimentary colors',
    },
  };

  const autoFillRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (autoFillRef.current && !autoFillRef.current.contains(e.target)) {
        setShowAutoFillSettings(false);
      }
    };

    if (showAutoFillSettings) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAutoFillSettings]);

  const slotsByCategory = getSlotsByCategory();

  // Handle weapon inspection
  const handleInspect = ({ item, slotId, imageUrl }) => {
    setInspectingWeapon({ item, slotId, imageUrl });
  };

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
    setShowAutoFillSettings(false);

    try {
      // Get all empty non-premium slots
      const emptySlots = Object.keys(WEAPON_SLOTS)
        .filter(id => !PREMIUM_SLOTS.includes(id) && !getItem(id));

      // Get knife/glove skin data
      const knifeData = knifeName ? getSkinData(knifeName) : null;
      const gloveData = gloveName ? getSkinData(gloveName) : null;

      // For complimentary mode, calculate anchor hue for color matching
      const anchorHue = autoFillMode === 'complimentary' ? calculateAnchorHue(knifeData, gloveData) : null;

      // Build inventory profile for complimentary mode
      const existingItems = [];
      if (autoFillMode === 'complimentary') {
        if (knifeItem) existingItems.push(knifeItem);
        if (glovesItem) existingItems.push(glovesItem);

        Object.keys(WEAPON_SLOTS).forEach(slotId => {
          if (!PREMIUM_SLOTS.includes(slotId)) {
            const item = getItem(slotId);
            if (item) existingItems.push(item);
          }
        });
      }

      let currentProfile = autoFillMode === 'complimentary' ? getInventoryProfile(existingItems) : null;
      let totalItems = existingItems.length;

      // For each empty slot, fetch skins and pick the best
      for (const slotId of emptySlots) {
        try {
          const res = await fetch(`/api/weapons?type=${slotId}`);
          const data = await res.json();

          if (data.skins && data.skins.length > 0) {
            let scored;

            if (autoFillMode === 'bestMatch') {
              // BEST MATCH: Pure match score, no color filtering
              scored = data.skins.map(skin => ({
                ...skin,
                score: getWeaponMatchScore(skin.name, knifeName, gloveName).score,
              }));
            } else {
              // COMPLIMENTARY: Apply hue filtering and cohesion bonuses
              const filteredSkins = filterSkinsByAnchorHue(data.skins, anchorHue);
              const skinsToScore = filteredSkins.length > 0 ? filteredSkins : data.skins;

              scored = skinsToScore.map(skin => {
                const baseScore = getWeaponMatchScore(skin.name, knifeName, gloveName).score;
                const cohesionBonus = calculateAutoFillBonus(skin.name, currentProfile, totalItems, knifeData, gloveData);
                return {
                  ...skin,
                  score: baseScore + cohesionBonus,
                };
              });
            }

            scored.sort((a, b) => b.score - a.score);

            // Add best skin to inventory (use cheapest variant)
            const best = scored[0];
            const variant = best.variants[0];
            const newItem = {
              name: variant.fullName,
              price: variant.price,
              condition: variant.condition,
              image: null,
            };

            setItem(slotId, newItem);

            // Update profile for next iteration (complimentary mode only)
            if (autoFillMode === 'complimentary') {
              existingItems.push(newItem);
              currentProfile = getInventoryProfile(existingItems);
              totalItems++;
            }
          }
        } catch (err) {
          console.error(`Error fetching skins for ${slotId}:`, err);
        }
      }
    } finally {
      setAutoFilling(false);
    }
  };

  // Handle sharing inventory
  const handleShare = async () => {
    const shareUrl = generateShareUrl(inventory);
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share URL:', err);
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

            {/* Browser View - Premium (knife/gloves) or Weapon */}
            {browsingSlot && (
              <motion.div
                className="max-w-6xl mx-auto h-[calc(100vh-4rem)]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {PREMIUM_SLOTS.includes(browsingSlot) ? (
                  <PremiumBrowser
                    slotId={browsingSlot}
                    inventory={inventoryForBrowser}
                    onSelect={handleSkinSelect}
                    onBack={() => setBrowsingSlot(null)}
                  />
                ) : (
                  <WeaponBrowser
                    slotId={browsingSlot}
                    inventory={inventoryForBrowser}
                    onSelect={handleSkinSelect}
                    onBack={() => setBrowsingSlot(null)}
                  />
                )}
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
                {/* Auto Fill with settings dropdown */}
                <div className="relative" ref={autoFillRef}>
                  <div className="flex items-center">
                    <button
                      onClick={handleAutoFill}
                      disabled={!hasKnifeOrGloves || autoFilling}
                      className={`px-4 py-2 rounded-l-lg text-sm font-medium
                        flex items-center gap-2 transition-colors
                        ${hasKnifeOrGloves
                          ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30'
                          : 'bg-gray-500/10 border border-gray-500/20 text-gray-500 cursor-not-allowed'
                        }`}
                      title={!hasKnifeOrGloves ? 'Add knife or gloves first' : `Auto fill (${AUTO_FILL_MODES[autoFillMode].label})`}
                    >
                      {autoFilling && <Loader2 className="w-4 h-4 animate-spin" />}
                      {autoFilling ? 'Filling...' : 'Auto Fill'}
                    </button>
                    <button
                      onClick={() => setShowAutoFillSettings(!showAutoFillSettings)}
                      disabled={autoFilling}
                      className={`px-2 py-2 rounded-r-lg text-sm font-medium
                        flex items-center transition-colors border-l-0
                        ${hasKnifeOrGloves
                          ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30'
                          : 'bg-gray-500/10 border border-gray-500/20 text-gray-500'
                        }`}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAutoFillSettings ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Settings Dropdown */}
                  <AnimatePresence>
                    {showAutoFillSettings && (
                      <motion.div
                        className="absolute top-full left-0 mt-1 min-w-full bg-gray-900/95 backdrop-blur-md
                          border border-purple-500/30 rounded-lg shadow-xl overflow-hidden z-50"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        <div className="p-1">
                          {Object.entries(AUTO_FILL_MODES).map(([modeId, mode]) => (
                            <button
                              key={modeId}
                              onClick={() => {
                                setAutoFillMode(modeId);
                                setShowAutoFillSettings(false);
                              }}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors
                                ${autoFillMode === modeId
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'text-gray-300 hover:bg-white/5'
                                }`}
                            >
                              <div className="text-left">
                                <p className="text-sm font-medium whitespace-nowrap">{mode.label}</p>
                                <p className="text-[10px] text-gray-500 whitespace-nowrap">{mode.description}</p>
                              </div>
                              {autoFillMode === modeId && (
                                <Check className="w-4 h-4 flex-shrink-0 text-purple-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Share button */}
                {stats.filledSlots > 0 && (
                  <button
                    onClick={handleShare}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      flex items-center gap-2
                      ${shareCopied
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                      }`}
                  >
                    {shareCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Share
                      </>
                    )}
                  </button>
                )}

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
                    onBrowse={setBrowsingSlot}
                    onInspect={handleInspect}
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
                    onBrowse={setBrowsingSlot}
                    onInspect={handleInspect}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {slots.map((slot) => (
                        <WeaponSlot
                          key={slot.id}
                          slotId={slot.id}
                          item={getItem(slot.id)}
                          onRemove={removeItem}
                          onBrowse={setBrowsingSlot}
                          onInspect={handleInspect}
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

      {/* Weapon Showroom */}
      <WeaponShowroom
        item={inspectingWeapon?.item}
        slotId={inspectingWeapon?.slotId}
        imageUrl={inspectingWeapon?.imageUrl}
        gloveItem={glovesItem}
        gloveImageUrl={glovesItem?.image}
        isOpen={inspectingWeapon !== null}
        onClose={() => setInspectingWeapon(null)}
      />
    </AnimatePresence>
  );
}
