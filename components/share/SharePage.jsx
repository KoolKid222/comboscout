'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Copy, Check, ArrowRight, Link2, Home, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { decodeShareData, isValidShareData } from '@/lib/shareUrl';
import { getStyleScore } from '@/lib/styleMatcher';
import { useInventory } from '@/lib/InventoryContext';
import { WEAPON_SLOTS, SLOT_CATEGORIES, getSlotsByCategory } from '@/lib/weaponSlots';

// Map atmospheres with color grading
const mapAtmospheres = [
  {
    id: 'studio',
    name: 'STUDIO',
    bg: 'bg-gradient-to-br from-zinc-900 via-neutral-900 to-black',
    overlay: 'bg-transparent',
    blendMode: 'normal',
    particleColor: 'rgba(255,255,255,0.03)',
  },
  {
    id: 'dust2',
    name: 'DUST II',
    bg: 'bg-gradient-to-br from-amber-950 via-orange-950 to-yellow-950',
    overlay: 'bg-amber-500/10',
    blendMode: 'overlay',
    particleColor: 'rgba(251,191,36,0.06)',
  },
  {
    id: 'mirage',
    name: 'MIRAGE',
    bg: 'bg-gradient-to-br from-stone-800 via-neutral-900 to-stone-950',
    overlay: 'bg-orange-400/5',
    blendMode: 'soft-light',
    particleColor: 'rgba(214,211,209,0.04)',
  },
  {
    id: 'nuke',
    name: 'NUKE',
    bg: 'bg-gradient-to-br from-slate-900 via-cyan-950 to-blue-950',
    overlay: 'bg-cyan-400/10',
    blendMode: 'overlay',
    particleColor: 'rgba(34,211,238,0.05)',
  },
  {
    id: 'vertigo',
    name: 'VERTIGO',
    bg: 'bg-gradient-to-br from-slate-800 via-gray-900 to-zinc-950',
    overlay: 'bg-white/5',
    blendMode: 'soft-light',
    particleColor: 'rgba(255,255,255,0.04)',
  },
];

// Rarity system
const getRarity = (score) => {
  if (score >= 90) return {
    name: 'LEGENDARY',
    color: 'text-yellow-400',
    border: 'border-yellow-500/50',
    gradient: 'from-yellow-500 to-amber-600',
    bg: 'bg-yellow-500/10'
  };
  if (score >= 80) return {
    name: 'EXOTIC',
    color: 'text-pink-400',
    border: 'border-pink-500/50',
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-500/10'
  };
  if (score >= 70) return {
    name: 'RARE',
    color: 'text-purple-400',
    border: 'border-purple-500/50',
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-500/10'
  };
  if (score >= 60) return {
    name: 'UNCOMMON',
    color: 'text-blue-400',
    border: 'border-blue-500/50',
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-500/10'
  };
  return {
    name: 'COMMON',
    color: 'text-gray-400',
    border: 'border-gray-500/50',
    gradient: 'from-gray-500 to-zinc-600',
    bg: 'bg-gray-500/10'
  };
};

// Floating Particles
function FloatingParticles({ color }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float-particle"
          style={{
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 15 + 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// Extract skin name from full item name
function extractSkinName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split('|');
  if (parts.length > 1) {
    return parts[1].replace(/\(.*\)/, '').trim();
  }
  return fullName.replace('★ ', '').split('|')[0].trim();
}

// Weapon card for the grid
function WeaponCard({ slotId, item }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const slot = WEAPON_SLOTS[slotId];

  useEffect(() => {
    if (item?.name) {
      fetch(`/api/image?name=${encodeURIComponent(item.name)}`)
        .then(res => res.json())
        .then(data => { if (data.url) setImageUrl(data.url); })
        .catch(() => {});
    }
  }, [item?.name]);

  if (!item || !slot) return null;

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border-2 bg-gray-900/95 backdrop-blur-sm
        transition-all duration-200 ${isHovered ? 'border-purple-500/50' : 'border-gray-700/50'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90" />

      <div className="relative h-20 flex items-center justify-center p-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="max-w-full max-h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            loading="lazy"
          />
        ) : (
          <div className="w-14 h-10 bg-gray-800/50 rounded-lg animate-pulse" />
        )}
      </div>

      <div className="relative p-2 bg-gray-900/80 border-t border-gray-700/50">
        <p className="text-[10px] text-gray-500 truncate">{slot.label}</p>
        <p className="text-xs font-bold text-white truncate">{extractSkinName(item.name)}</p>
        <p className="text-green-400 font-mono text-[10px] font-bold mt-0.5">
          ${item.price?.toFixed(2) || '0.00'}
        </p>
      </div>
    </motion.div>
  );
}

export default function SharePage({ encodedData }) {
  const router = useRouter();
  const { bulkSetItems } = useInventory();
  const [selectedMap, setSelectedMap] = useState('studio');
  const [linkCopied, setLinkCopied] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [knifeImage, setKnifeImage] = useState(null);
  const [gloveImage, setGloveImage] = useState(null);

  // Decode share data
  const sharedData = useMemo(() => {
    if (!encodedData) return null;
    const decoded = decodeShareData(encodedData);
    return isValidShareData(decoded) ? decoded : null;
  }, [encodedData]);

  // Get knife and gloves
  const knifeItem = sharedData?.slots?.knife?.item;
  const glovesItem = sharedData?.slots?.gloves?.item;

  // Calculate match score
  const matchScore = useMemo(() => {
    if (knifeItem?.name && glovesItem?.name) {
      return getStyleScore(knifeItem.name, glovesItem.name);
    }
    return null;
  }, [knifeItem, glovesItem]);

  const rarity = matchScore ? getRarity(matchScore) : null;
  const atmosphere = mapAtmospheres.find(m => m.id === selectedMap) || mapAtmospheres[0];

  // Calculate total value
  const totalValue = useMemo(() => {
    if (!sharedData?.slots) return 0;
    return Object.values(sharedData.slots).reduce((sum, slot) => {
      return sum + (slot?.item?.price || 0);
    }, 0);
  }, [sharedData]);

  // Count filled slots
  const filledSlots = sharedData ? Object.keys(sharedData.slots).length : 0;

  // Fetch knife and glove images
  useEffect(() => {
    if (knifeItem?.name) {
      fetch(`/api/image?name=${encodeURIComponent(knifeItem.name)}`)
        .then(res => res.json())
        .then(data => { if (data.url) setKnifeImage(data.url); })
        .catch(() => {});
    }
    if (glovesItem?.name) {
      fetch(`/api/image?name=${encodeURIComponent(glovesItem.name)}`)
        .then(res => res.json())
        .then(data => { if (data.url) setGloveImage(data.url); })
        .catch(() => {});
    }
  }, [knifeItem?.name, glovesItem?.name]);

  // Mouse tracking for parallax
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), springConfig);
  const knifeX = useSpring(useTransform(mouseX, [0, 1], [-15, 15]), springConfig);
  const knifeY = useSpring(useTransform(mouseY, [0, 1], [-10, 10]), springConfig);
  const gloveX = useSpring(useTransform(mouseX, [0, 1], [8, -8]), springConfig);
  const gloveY = useSpring(useTransform(mouseY, [0, 1], [6, -6]), springConfig);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleImportToInventory = () => {
    if (!sharedData?.slots) return;
    bulkSetItems(sharedData.slots);
    setImportSuccess(true);
    setShowConfirm(false);
    setTimeout(() => setImportSuccess(false), 3000);
  };

  // Invalid or missing share data
  if (!sharedData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Share Link</h1>
          <p className="text-gray-400 mb-6">This loadout link is invalid or has expired.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors"
          >
            Go to ComboScout
          </button>
        </div>
      </div>
    );
  }

  // Get weapons by category (excluding knife and gloves)
  const weaponCategories = SLOT_CATEGORIES.filter(cat => cat.id !== 'premium');

  return (
    <div className={`min-h-screen ${atmosphere.bg} transition-colors duration-700`}>
      {/* Color Grade Overlay */}
      <div
        className={`fixed inset-0 ${atmosphere.overlay} transition-colors duration-700 pointer-events-none`}
        style={{ mixBlendMode: atmosphere.blendMode }}
      />

      {/* Floating Particles */}
      <FloatingParticles color={atmosphere.particleColor} />

      {/* Radial vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_70%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Shared Loadout
          </h1>
          <p className="text-gray-400">Check out this CS2 inventory</p>
        </motion.div>

        {/* Hero Section - Knife + Gloves */}
        {(knifeItem || glovesItem) && (
          <motion.div
            className="relative h-[350px] md:h-[420px] mb-8 rounded-3xl overflow-hidden border border-white/10"
            style={{ perspective: 1000 }}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Background */}
            <div className={`absolute inset-0 ${atmosphere.bg}`} />
            <FloatingParticles color={atmosphere.particleColor} />

            {/* 3D Container */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            >
              {/* Glove - Background */}
              {glovesItem && gloveImage && (
                <motion.div
                  className="absolute"
                  style={{ x: gloveX, y: gloveY, left: -40, top: 20, zIndex: 10 }}
                >
                  <img
                    src={gloveImage}
                    alt={glovesItem.name}
                    className="w-[220px] h-[220px] md:w-[300px] md:h-[300px] object-contain
                      opacity-70 brightness-90 saturate-[0.85] drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                  />
                </motion.div>
              )}

              {/* Knife - Foreground */}
              {knifeItem && knifeImage && (
                <motion.div
                  className="relative"
                  style={{ x: knifeX, y: knifeY, zIndex: 20 }}
                >
                  <img
                    src={knifeImage}
                    alt={knifeItem.name}
                    className="w-[280px] h-[280px] md:w-[380px] md:h-[380px] object-contain
                      brightness-110 contrast-105 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Match Score Badge */}
            {matchScore && rarity && (
              <motion.div
                className="absolute top-4 right-4 z-30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className={`px-4 py-2 rounded-full ${rarity.bg} border-2 ${rarity.border}
                  backdrop-blur-md flex items-center gap-3`}>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rarity.gradient}
                    flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-black text-lg">{matchScore}</span>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${rarity.color} tracking-wider`}>{rarity.name}</p>
                    <p className="text-[10px] text-white/60">Match Score</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Item Names */}
            <div className="absolute bottom-4 left-4 z-30">
              {knifeItem && (
                <div className="mb-2">
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Knife</p>
                  <p className="text-white font-bold text-sm">{extractSkinName(knifeItem.name)}</p>
                </div>
              )}
              {glovesItem && (
                <div>
                  <p className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Gloves</p>
                  <p className="text-white font-bold text-sm">{extractSkinName(glovesItem.name)}</p>
                </div>
              )}
            </div>

            {/* Map Selector */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
              <div className="flex items-center gap-1 p-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
                {mapAtmospheres.map((map) => (
                  <button
                    key={map.id}
                    onClick={() => setSelectedMap(map.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all
                      ${selectedMap === map.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                  >
                    {map.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Bar */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Value</p>
            <p className="text-green-400 font-mono text-2xl font-black">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Items</p>
            <p className="text-white text-2xl font-black">{filledSlots}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Match Score</p>
            <p className={`text-2xl font-black ${rarity?.color || 'text-gray-500'}`}>
              {matchScore || '—'}
            </p>
          </div>
        </motion.div>

        {/* Weapons Grid */}
        {weaponCategories.map((category) => {
          const categorySlots = getSlotsByCategory(category.id);
          const filledInCategory = categorySlots.filter(slotId => sharedData.slots[slotId]?.item);
          if (filledInCategory.length === 0) return null;

          return (
            <motion.div
              key={category.id}
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
                {category.label}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {filledInCategory.map(slotId => (
                  <WeaponCard
                    key={slotId}
                    slotId={slotId}
                    item={sharedData.slots[slotId]?.item}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Copy to Inventory */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={importSuccess}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${importSuccess
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
          >
            {importSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Added to Inventory
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Copy to My Inventory
              </>
            )}
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              border ${linkCopied
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
          >
            {linkCopied ? (
              <>
                <Check className="w-5 h-5" />
                Link Copied
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                Copy Link
              </>
            )}
          </button>

          {/* Build Your Own */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              bg-white/5 border border-white/10 text-white hover:bg-white/10"
          >
            <Home className="w-5 h-5" />
            Build Your Own
          </button>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-2">Import Loadout?</h3>
              <p className="text-gray-400 mb-6">
                This will replace your current inventory with this shared loadout. Are you sure?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportToInventory}
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors"
                >
                  Yes, Import
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
