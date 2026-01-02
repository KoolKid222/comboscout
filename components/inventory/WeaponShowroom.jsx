'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { WEAPON_SLOTS } from '@/lib/weaponSlots';

// Map atmospheres with color grading - copied from InspectionOverlay
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

// Rarity based on price
const getRarity = (price) => {
  if (price >= 500) return {
    name: 'LEGENDARY',
    color: 'text-yellow-400',
    border: 'border-yellow-500/50',
    gradient: 'from-yellow-500 to-amber-600',
    bg: 'bg-yellow-500/10'
  };
  if (price >= 200) return {
    name: 'EXOTIC',
    color: 'text-pink-400',
    border: 'border-pink-500/50',
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-500/10'
  };
  if (price >= 50) return {
    name: 'RARE',
    color: 'text-purple-400',
    border: 'border-purple-500/50',
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-500/10'
  };
  if (price >= 10) return {
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
      {[...Array(30)].map((_, i) => (
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

// Extract weapon and skin name
function extractNames(fullName) {
  if (!fullName) return { weapon: 'Unknown', skin: '' };

  // Remove star prefix
  const cleanName = fullName.replace('★ ', '');
  const parts = cleanName.split('|');

  if (parts.length > 1) {
    const weapon = parts[0].trim();
    // Remove condition from skin name
    const skin = parts[1].replace(/\(.*\)/, '').trim();
    return { weapon, skin };
  }

  return { weapon: cleanName, skin: '' };
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
  return abbrevs[condition] || condition || '';
}

// Get condition percentage for bar
function getConditionPercent(condition) {
  const percents = {
    'Factory New': 100,
    'Minimal Wear': 80,
    'Field-Tested': 60,
    'Well-Worn': 40,
    'Battle-Scarred': 20,
  };
  return percents[condition] || 50;
}

export default function WeaponShowroom({ item, slotId, imageUrl, gloveItem, gloveImageUrl, isOpen, onClose }) {
  const [selectedMap, setSelectedMap] = useState('studio');
  const [fetchedGloveImage, setFetchedGloveImage] = useState(null);

  // Mouse tracking for parallax
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Spring config
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };

  // 3D tilt
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), springConfig);

  // Parallax for weapon (foreground - more movement)
  const weaponX = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), springConfig);
  const weaponY = useSpring(useTransform(mouseY, [0, 1], [-15, 15]), springConfig);

  // Parallax for glove (background - less movement, opposite direction)
  const gloveX = useSpring(useTransform(mouseX, [0, 1], [10, -10]), springConfig);
  const gloveY = useSpring(useTransform(mouseY, [0, 1], [8, -8]), springConfig);

  // Glare
  const glareX = useTransform(mouseX, [0, 1], [30, 70]);
  const glareY = useTransform(mouseY, [0, 1], [30, 70]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth);
    mouseY.set(clientY / innerHeight);
  };

  useEffect(() => {
    if (isOpen) {
      mouseX.set(0.5);
      mouseY.set(0.5);
      window.addEventListener('mousemove', handleMouseMove);
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Fetch glove image if needed
  useEffect(() => {
    if (gloveItem?.name && !gloveImageUrl && !gloveItem.image) {
      fetch(`/api/image?name=${encodeURIComponent(gloveItem.name)}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) setFetchedGloveImage(data.url);
        })
        .catch(() => {});
    } else {
      setFetchedGloveImage(null);
    }
  }, [gloveItem?.name, gloveImageUrl, gloveItem?.image]);

  if (!item) return null;

  const slot = WEAPON_SLOTS[slotId];
  const { weapon, skin } = extractNames(item.name);
  const rarity = getRarity(item.price || 0);
  const atmosphere = mapAtmospheres.find(m => m.id === selectedMap) || mapAtmospheres[0];

  // Build Skinport link
  const marketLink = `https://skinport.com/market?search=${encodeURIComponent(item.name)}`;

  // Determine glove image to use
  const actualGloveImage = gloveImageUrl || gloveItem?.image || fetchedGloveImage;
  const hasGlove = gloveItem && actualGloveImage;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Atmospheric Background */}
          <motion.div
            className={`absolute inset-0 ${atmosphere.bg} transition-colors duration-700`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Color Grade Overlay */}
          <div
            className={`absolute inset-0 ${atmosphere.overlay} transition-colors duration-700`}
            style={{ mixBlendMode: atmosphere.blendMode }}
          />

          {/* Floating Particles */}
          <FloatingParticles color={atmosphere.particleColor} />

          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_70%,_rgba(0,0,0,0.8)_100%)]" />

          {/* Scan lines */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-scan-lines" />

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md
              border border-white/10 flex items-center justify-center text-white/70 hover:text-white
              hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 }}
            whileHover={{ rotate: 90 }}
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* ========== THE STAGE ========== */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: 1200 }}
          >
            {/* 3D Tilt Container */}
            <motion.div
              className="relative"
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Glove - Background Layer (if equipped) */}
              {hasGlove && (
                <motion.div
                  className="absolute"
                  style={{
                    x: gloveX,
                    y: gloveY,
                    left: -60,
                    top: 20,
                    zIndex: 10,
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <img
                    src={actualGloveImage}
                    alt={gloveItem.name}
                    className="w-[300px] h-[300px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px]
                      object-contain opacity-80 brightness-90 saturate-[0.85]
                      drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
                  />
                </motion.div>
              )}

              {/* Weapon - Foreground Layer */}
              <motion.div
                className="relative"
                style={{
                  x: weaponX,
                  y: weaponY,
                  zIndex: 20,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-[340px] h-[340px] md:w-[450px] md:h-[450px] lg:w-[520px] lg:h-[520px]
                      object-contain brightness-110 contrast-105
                      drop-shadow-[0_35px_70px_rgba(0,0,0,0.7)]"
                  />
                ) : (
                  <div className="w-[450px] h-[450px] bg-white/5 rounded-3xl flex items-center justify-center">
                    <span className="text-white/30 text-sm tracking-widest">NO IMAGE</span>
                  </div>
                )}

                {/* Glare overlay */}
                <motion.div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.5) 0%, transparent 50%)`,
                  }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* ========== HUD PANEL: Spec Sheet (Top Left) ========== */}
          <motion.div
            className="absolute top-6 left-6 z-40 max-w-md"
            initial={{ opacity: 0, x: -50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Weapon Type Badge */}
            {slot && (
              <div className="mb-4">
                <span className="text-white/40 text-xs font-medium tracking-[0.3em] uppercase">
                  {slot.category}
                </span>
              </div>
            )}

            {/* Weapon Name */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${rarity.gradient}`} />
                <div>
                  <h1 className="text-white text-2xl md:text-3xl font-black tracking-tight uppercase">
                    {weapon}
                  </h1>
                </div>
              </div>
              {skin && (
                <p className={`text-lg font-semibold ${rarity.color} ml-4 tracking-wide`}>
                  {skin}
                </p>
              )}
            </div>

            {/* Condition Bar */}
            {item.condition && (
              <div className="ml-4 flex items-center gap-3 mb-6">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[150px]">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${rarity.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${getConditionPercent(item.condition)}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </div>
                <span className="text-white/60 text-xs font-mono uppercase tracking-wider">
                  {item.condition}
                </span>
              </div>
            )}

            {/* Rarity Badge */}
            <motion.div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${rarity.bg}
                border ${rarity.border} backdrop-blur-sm`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${rarity.gradient} animate-pulse`} />
              <span className={`text-xs font-bold tracking-[0.2em] ${rarity.color}`}>
                {rarity.name}
              </span>
            </motion.div>

            {/* Glove info (if equipped) */}
            {hasGlove && (
              <motion.div
                className="mt-6 opacity-70"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-pink-500 to-rose-600" />
                  <div>
                    <p className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase">With Gloves</p>
                    <p className="text-pink-400/80 text-sm font-medium">
                      {extractNames(gloveItem.name).skin || extractNames(gloveItem.name).weapon}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* ========== HUD PANEL: Commerce (Bottom Right) ========== */}
          <motion.div
            className="absolute bottom-6 right-6 z-40"
            initial={{ opacity: 0, x: 50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Price Display */}
            <div className="text-right mb-4">
              <p className="text-white/40 text-xs font-medium tracking-[0.3em] uppercase mb-1">
                Market Price
              </p>
              <div className={`text-4xl md:text-5xl font-black font-mono ${rarity.color} tracking-tight`}>
                ${(item.price || 0).toFixed(2)}
              </div>
            </div>

            {/* Buy Button */}
            <a
              href={marketLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 px-5 py-3 rounded-xl
                bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10
                hover:border-white/20 transition-all duration-300"
            >
              <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                Buy on Skinport
              </span>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
            </a>
          </motion.div>

          {/* ========== Map Selector (Bottom Center) ========== */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex items-center gap-1 p-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
              {mapAtmospheres.map((map) => (
                <button
                  key={map.id}
                  onClick={() => setSelectedMap(map.id)}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold tracking-[0.15em] uppercase
                    transition-all duration-300 ${
                      selectedMap === map.id
                        ? 'text-white'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                >
                  {selectedMap === map.id && (
                    <motion.div
                      layoutId="weapon-map-selector-bg"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/20"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    />
                  )}
                  <span className="relative z-10">{map.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-white/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-white/5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-white/5 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-white/5 pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
