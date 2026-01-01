'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Info } from 'lucide-react';
import { getStyleScoreBreakdown } from '@/lib/styleMatcher';
import AddToInventoryButton from './inventory/AddToInventoryButton';

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
    accent: 'text-amber-400',
  },
  {
    id: 'mirage',
    name: 'MIRAGE',
    bg: 'bg-gradient-to-br from-stone-800 via-neutral-900 to-stone-950',
    overlay: 'bg-orange-400/5',
    blendMode: 'soft-light',
    particleColor: 'rgba(214,211,209,0.04)',
    accent: 'text-stone-400',
  },
  {
    id: 'nuke',
    name: 'NUKE',
    bg: 'bg-gradient-to-br from-slate-900 via-cyan-950 to-blue-950',
    overlay: 'bg-cyan-400/10',
    blendMode: 'overlay',
    particleColor: 'rgba(34,211,238,0.05)',
    accent: 'text-cyan-400',
  },
  {
    id: 'vertigo',
    name: 'VERTIGO',
    bg: 'bg-gradient-to-br from-slate-800 via-gray-900 to-zinc-950',
    overlay: 'bg-white/5',
    blendMode: 'soft-light',
    particleColor: 'rgba(255,255,255,0.04)',
    accent: 'text-gray-300',
  },
];

// Rarity system
const getRarity = (score) => {
  if (score >= 90) return {
    name: 'LEGENDARY',
    color: 'text-yellow-400',
    border: 'border-yellow-500/50',
    glow: 'shadow-yellow-500/30',
    gradient: 'from-yellow-500 to-amber-600',
    bg: 'bg-yellow-500/10'
  };
  if (score >= 80) return {
    name: 'EXOTIC',
    color: 'text-pink-400',
    border: 'border-pink-500/50',
    glow: 'shadow-pink-500/30',
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-500/10'
  };
  if (score >= 70) return {
    name: 'RARE',
    color: 'text-purple-400',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/30',
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-500/10'
  };
  if (score >= 60) return {
    name: 'UNCOMMON',
    color: 'text-blue-400',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/30',
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-500/10'
  };
  return {
    name: 'COMMON',
    color: 'text-gray-400',
    border: 'border-gray-500/50',
    glow: 'shadow-gray-500/30',
    gradient: 'from-gray-500 to-zinc-600',
    bg: 'bg-gray-500/10'
  };
};

// Skin color extraction - maps skin patterns to their primary colors
const skinColorMap = {
  // ==================== KNIFE SKINS ====================

  // Reds
  autotronic: { bg: 'bg-red-600/20', hover: 'hover:bg-red-500/30', border: 'hover:border-red-500/50', shadow: 'hover:shadow-red-500/20' },
  slaughter: { bg: 'bg-red-500/20', hover: 'hover:bg-red-400/30', border: 'hover:border-red-400/50', shadow: 'hover:shadow-red-400/20' },
  ruby: { bg: 'bg-rose-600/20', hover: 'hover:bg-rose-500/30', border: 'hover:border-rose-500/50', shadow: 'hover:shadow-rose-500/20' },

  // Greens
  'gamma doppler': { bg: 'bg-emerald-600/20', hover: 'hover:bg-emerald-500/30', border: 'hover:border-emerald-500/50', shadow: 'hover:shadow-emerald-500/20' },
  lore: { bg: 'bg-lime-600/20', hover: 'hover:bg-lime-500/30', border: 'hover:border-lime-500/50', shadow: 'hover:shadow-lime-500/20' },
  'boreal forest': { bg: 'bg-green-700/20', hover: 'hover:bg-green-600/30', border: 'hover:border-green-600/50', shadow: 'hover:shadow-green-600/20' },

  // Blues
  doppler: { bg: 'bg-blue-600/20', hover: 'hover:bg-blue-500/30', border: 'hover:border-blue-500/50', shadow: 'hover:shadow-blue-500/20' },
  sapphire: { bg: 'bg-blue-500/20', hover: 'hover:bg-blue-400/30', border: 'hover:border-blue-400/50', shadow: 'hover:shadow-blue-400/20' },
  'blue steel': { bg: 'bg-slate-500/20', hover: 'hover:bg-slate-400/30', border: 'hover:border-slate-400/50', shadow: 'hover:shadow-slate-400/20' },
  'bright water': { bg: 'bg-cyan-600/20', hover: 'hover:bg-cyan-500/30', border: 'hover:border-cyan-500/50', shadow: 'hover:shadow-cyan-500/20' },

  // Purples/Pinks
  fade: { bg: 'bg-fuchsia-500/20', hover: 'hover:bg-fuchsia-400/30', border: 'hover:border-fuchsia-400/50', shadow: 'hover:shadow-fuchsia-400/20' },
  ultraviolet: { bg: 'bg-violet-600/20', hover: 'hover:bg-violet-500/30', border: 'hover:border-violet-500/50', shadow: 'hover:shadow-violet-500/20' },
  'marble fade': { bg: 'bg-pink-500/20', hover: 'hover:bg-pink-400/30', border: 'hover:border-pink-400/50', shadow: 'hover:shadow-pink-400/20' },

  // Yellows/Golds
  'tiger tooth': { bg: 'bg-yellow-500/20', hover: 'hover:bg-yellow-400/30', border: 'hover:border-yellow-400/50', shadow: 'hover:shadow-yellow-400/20' },
  'case hardened': { bg: 'bg-amber-500/20', hover: 'hover:bg-amber-400/30', border: 'hover:border-amber-400/50', shadow: 'hover:shadow-amber-400/20' },

  // Oranges/Browns
  'rust coat': { bg: 'bg-orange-700/20', hover: 'hover:bg-orange-600/30', border: 'hover:border-orange-600/50', shadow: 'hover:shadow-orange-600/20' },
  safari: { bg: 'bg-amber-700/20', hover: 'hover:bg-amber-600/30', border: 'hover:border-amber-600/50', shadow: 'hover:shadow-amber-600/20' },

  // Blacks/Darks
  'black laminate': { bg: 'bg-zinc-600/20', hover: 'hover:bg-zinc-500/30', border: 'hover:border-zinc-500/50', shadow: 'hover:shadow-zinc-500/20' },
  night: { bg: 'bg-indigo-900/20', hover: 'hover:bg-indigo-800/30', border: 'hover:border-indigo-800/50', shadow: 'hover:shadow-indigo-800/20' },
  scorched: { bg: 'bg-stone-700/20', hover: 'hover:bg-stone-600/30', border: 'hover:border-stone-600/50', shadow: 'hover:shadow-stone-600/20' },
  vanilla: { bg: 'bg-stone-500/20', hover: 'hover:bg-stone-400/30', border: 'hover:border-stone-400/50', shadow: 'hover:shadow-stone-400/20' },

  // Special knife patterns
  'damascus steel': { bg: 'bg-slate-400/20', hover: 'hover:bg-slate-300/30', border: 'hover:border-slate-300/50', shadow: 'hover:shadow-slate-300/20' },
  'stained': { bg: 'bg-amber-600/20', hover: 'hover:bg-amber-500/30', border: 'hover:border-amber-500/50', shadow: 'hover:shadow-amber-500/20' },
  'urban masked': { bg: 'bg-gray-500/20', hover: 'hover:bg-gray-400/30', border: 'hover:border-gray-400/50', shadow: 'hover:shadow-gray-400/20' },

  // ==================== SPORT GLOVES ====================
  'superconductor': { bg: 'bg-cyan-600/20', hover: 'hover:bg-cyan-500/30', border: 'hover:border-cyan-500/50', shadow: 'hover:shadow-cyan-500/20' },
  'pandora': { bg: 'bg-purple-600/20', hover: 'hover:bg-purple-500/30', border: 'hover:border-purple-500/50', shadow: 'hover:shadow-purple-500/20' },
  'hedge maze': { bg: 'bg-teal-600/20', hover: 'hover:bg-teal-500/30', border: 'hover:border-teal-500/50', shadow: 'hover:shadow-teal-500/20' },
  'arid': { bg: 'bg-amber-600/20', hover: 'hover:bg-amber-500/30', border: 'hover:border-amber-500/50', shadow: 'hover:shadow-amber-500/20' },
  'vice': { bg: 'bg-pink-500/20', hover: 'hover:bg-pink-400/30', border: 'hover:border-pink-400/50', shadow: 'hover:shadow-pink-400/20' },
  'omega': { bg: 'bg-orange-500/20', hover: 'hover:bg-orange-400/30', border: 'hover:border-orange-400/50', shadow: 'hover:shadow-orange-400/20' },
  'bronze morph': { bg: 'bg-amber-700/20', hover: 'hover:bg-amber-600/30', border: 'hover:border-amber-600/50', shadow: 'hover:shadow-amber-600/20' },
  'scarlet shamagh': { bg: 'bg-red-600/20', hover: 'hover:bg-red-500/30', border: 'hover:border-red-500/50', shadow: 'hover:shadow-red-500/20' },
  'slingshot': { bg: 'bg-sky-600/20', hover: 'hover:bg-sky-500/30', border: 'hover:border-sky-500/50', shadow: 'hover:shadow-sky-500/20' },
  'nocts': { bg: 'bg-indigo-700/20', hover: 'hover:bg-indigo-600/30', border: 'hover:border-indigo-600/50', shadow: 'hover:shadow-indigo-600/20' },

  // ==================== DRIVER GLOVES ====================
  'lunar weave': { bg: 'bg-slate-500/20', hover: 'hover:bg-slate-400/30', border: 'hover:border-slate-400/50', shadow: 'hover:shadow-slate-400/20' },
  'convoy': { bg: 'bg-stone-600/20', hover: 'hover:bg-stone-500/30', border: 'hover:border-stone-500/50', shadow: 'hover:shadow-stone-500/20' },
  'crimson weave': { bg: 'bg-red-700/20', hover: 'hover:bg-red-600/30', border: 'hover:border-red-600/50', shadow: 'hover:shadow-red-600/20' },
  'diamondback': { bg: 'bg-amber-600/20', hover: 'hover:bg-amber-500/30', border: 'hover:border-amber-500/50', shadow: 'hover:shadow-amber-500/20' },
  'overtake': { bg: 'bg-blue-600/20', hover: 'hover:bg-blue-500/30', border: 'hover:border-blue-500/50', shadow: 'hover:shadow-blue-500/20' },
  'racing green': { bg: 'bg-green-700/20', hover: 'hover:bg-green-600/30', border: 'hover:border-green-600/50', shadow: 'hover:shadow-green-600/20' },
  'king snake': { bg: 'bg-zinc-600/20', hover: 'hover:bg-zinc-500/30', border: 'hover:border-zinc-500/50', shadow: 'hover:shadow-zinc-500/20' },
  'imperial plaid': { bg: 'bg-purple-900/20', hover: 'hover:bg-purple-700/30', border: 'hover:border-purple-700/50', shadow: 'hover:shadow-purple-700/20' },
  'black tie': { bg: 'bg-neutral-700/20', hover: 'hover:bg-neutral-600/30', border: 'hover:border-neutral-600/50', shadow: 'hover:shadow-neutral-600/20' },
  'queen jaguar': { bg: 'bg-amber-500/20', hover: 'hover:bg-amber-400/30', border: 'hover:border-amber-400/50', shadow: 'hover:shadow-amber-400/20' },
  'amphibious': { bg: 'bg-emerald-700/20', hover: 'hover:bg-emerald-600/30', border: 'hover:border-emerald-600/50', shadow: 'hover:shadow-emerald-600/20' },
  'snow leopard': { bg: 'bg-gray-400/20', hover: 'hover:bg-gray-300/30', border: 'hover:border-gray-300/50', shadow: 'hover:shadow-gray-300/20' },
  'rezan the red': { bg: 'bg-red-600/20', hover: 'hover:bg-red-500/30', border: 'hover:border-red-500/50', shadow: 'hover:shadow-red-500/20' },

  // ==================== HAND WRAPS ====================
  'leather': { bg: 'bg-amber-800/20', hover: 'hover:bg-amber-700/30', border: 'hover:border-amber-700/50', shadow: 'hover:shadow-amber-700/20' },
  'spruce ddpat': { bg: 'bg-green-800/20', hover: 'hover:bg-green-700/30', border: 'hover:border-green-700/50', shadow: 'hover:shadow-green-700/20' },
  'badlands': { bg: 'bg-orange-700/20', hover: 'hover:bg-orange-600/30', border: 'hover:border-orange-600/50', shadow: 'hover:shadow-orange-600/20' },
  'slaughter': { bg: 'bg-red-500/20', hover: 'hover:bg-red-400/30', border: 'hover:border-red-400/50', shadow: 'hover:shadow-red-400/20' },
  'cobalt skulls': { bg: 'bg-blue-700/20', hover: 'hover:bg-blue-600/30', border: 'hover:border-blue-600/50', shadow: 'hover:shadow-blue-600/20' },
  'overprint': { bg: 'bg-cyan-700/20', hover: 'hover:bg-cyan-600/30', border: 'hover:border-cyan-600/50', shadow: 'hover:shadow-cyan-600/20' },
  'duct tape': { bg: 'bg-gray-500/20', hover: 'hover:bg-gray-400/30', border: 'hover:border-gray-400/50', shadow: 'hover:shadow-gray-400/20' },
  'arboreal': { bg: 'bg-lime-700/20', hover: 'hover:bg-lime-600/30', border: 'hover:border-lime-600/50', shadow: 'hover:shadow-lime-600/20' },
  'constrictor': { bg: 'bg-amber-600/20', hover: 'hover:bg-amber-500/30', border: 'hover:border-amber-500/50', shadow: 'hover:shadow-amber-500/20' },
  'desert shamagh': { bg: 'bg-stone-500/20', hover: 'hover:bg-stone-400/30', border: 'hover:border-stone-400/50', shadow: 'hover:shadow-stone-400/20' },
  'giraffe': { bg: 'bg-yellow-700/20', hover: 'hover:bg-yellow-600/30', border: 'hover:border-yellow-600/50', shadow: 'hover:shadow-yellow-600/20' },
  'caution!': { bg: 'bg-yellow-500/20', hover: 'hover:bg-yellow-400/30', border: 'hover:border-yellow-400/50', shadow: 'hover:shadow-yellow-400/20' },

  // ==================== MOTO GLOVES ====================
  'eclipse': { bg: 'bg-orange-600/20', hover: 'hover:bg-orange-500/30', border: 'hover:border-orange-500/50', shadow: 'hover:shadow-orange-500/20' },
  'spearmint': { bg: 'bg-emerald-500/20', hover: 'hover:bg-emerald-400/30', border: 'hover:border-emerald-400/50', shadow: 'hover:shadow-emerald-400/20' },
  'cool mint': { bg: 'bg-teal-500/20', hover: 'hover:bg-teal-400/30', border: 'hover:border-teal-400/50', shadow: 'hover:shadow-teal-400/20' },
  'boom!': { bg: 'bg-red-500/20', hover: 'hover:bg-red-400/30', border: 'hover:border-red-400/50', shadow: 'hover:shadow-red-400/20' },
  'polygon': { bg: 'bg-blue-500/20', hover: 'hover:bg-blue-400/30', border: 'hover:border-blue-400/50', shadow: 'hover:shadow-blue-400/20' },
  'transport': { bg: 'bg-yellow-600/20', hover: 'hover:bg-yellow-500/30', border: 'hover:border-yellow-500/50', shadow: 'hover:shadow-yellow-500/20' },
  'turtle': { bg: 'bg-green-600/20', hover: 'hover:bg-green-500/30', border: 'hover:border-green-500/50', shadow: 'hover:shadow-green-500/20' },
  'pow!': { bg: 'bg-pink-600/20', hover: 'hover:bg-pink-500/30', border: 'hover:border-pink-500/50', shadow: 'hover:shadow-pink-500/20' },
  'smoke out': { bg: 'bg-gray-600/20', hover: 'hover:bg-gray-500/30', border: 'hover:border-gray-500/50', shadow: 'hover:shadow-gray-500/20' },
  'blood pressure': { bg: 'bg-red-700/20', hover: 'hover:bg-red-600/30', border: 'hover:border-red-600/50', shadow: 'hover:shadow-red-600/20' },
  'finish line': { bg: 'bg-sky-500/20', hover: 'hover:bg-sky-400/30', border: 'hover:border-sky-400/50', shadow: 'hover:shadow-sky-400/20' },
  '3rd commando': { bg: 'bg-stone-600/20', hover: 'hover:bg-stone-500/30', border: 'hover:border-stone-500/50', shadow: 'hover:shadow-stone-500/20' },
  'hazmat': { bg: 'bg-yellow-500/20', hover: 'hover:bg-yellow-400/30', border: 'hover:border-yellow-400/50', shadow: 'hover:shadow-yellow-400/20' },

  // ==================== SPECIALIST GLOVES ====================
  'crimson web': { bg: 'bg-red-700/20', hover: 'hover:bg-red-600/30', border: 'hover:border-red-600/50', shadow: 'hover:shadow-red-600/20' },
  'crimson kimono': { bg: 'bg-red-600/20', hover: 'hover:bg-red-500/30', border: 'hover:border-red-500/50', shadow: 'hover:shadow-red-500/20' },
  'emerald web': { bg: 'bg-emerald-600/20', hover: 'hover:bg-emerald-500/30', border: 'hover:border-emerald-500/50', shadow: 'hover:shadow-emerald-500/20' },
  'foundation': { bg: 'bg-stone-500/20', hover: 'hover:bg-stone-400/30', border: 'hover:border-stone-400/50', shadow: 'hover:shadow-stone-400/20' },
  'mogul': { bg: 'bg-sky-600/20', hover: 'hover:bg-sky-500/30', border: 'hover:border-sky-500/50', shadow: 'hover:shadow-sky-500/20' },
  'forest ddpat': { bg: 'bg-green-700/20', hover: 'hover:bg-green-600/30', border: 'hover:border-green-600/50', shadow: 'hover:shadow-green-600/20' },
  'buckshot': { bg: 'bg-amber-700/20', hover: 'hover:bg-amber-600/30', border: 'hover:border-amber-600/50', shadow: 'hover:shadow-amber-600/20' },
  'field agent': { bg: 'bg-zinc-600/20', hover: 'hover:bg-zinc-500/30', border: 'hover:border-zinc-500/50', shadow: 'hover:shadow-zinc-500/20' },
  'tiger strike': { bg: 'bg-orange-500/20', hover: 'hover:bg-orange-400/30', border: 'hover:border-orange-400/50', shadow: 'hover:shadow-orange-400/20' },
  'fade': { bg: 'bg-fuchsia-500/20', hover: 'hover:bg-fuchsia-400/30', border: 'hover:border-fuchsia-400/50', shadow: 'hover:shadow-fuchsia-400/20' },
  'marble fade': { bg: 'bg-pink-500/20', hover: 'hover:bg-pink-400/30', border: 'hover:border-pink-400/50', shadow: 'hover:shadow-pink-400/20' },

  // ==================== HYDRA GLOVES ====================
  'emerald': { bg: 'bg-emerald-500/20', hover: 'hover:bg-emerald-400/30', border: 'hover:border-emerald-400/50', shadow: 'hover:shadow-emerald-400/20' },
  'mangrove': { bg: 'bg-green-800/20', hover: 'hover:bg-green-700/30', border: 'hover:border-green-700/50', shadow: 'hover:shadow-green-700/20' },
  'rattler': { bg: 'bg-amber-600/20', hover: 'hover:bg-amber-500/30', border: 'hover:border-amber-500/50', shadow: 'hover:shadow-amber-500/20' },
  'case hardened': { bg: 'bg-amber-500/20', hover: 'hover:bg-amber-400/30', border: 'hover:border-amber-400/50', shadow: 'hover:shadow-amber-400/20' },

  // ==================== BROKEN FANG GLOVES ====================
  'jade': { bg: 'bg-emerald-600/20', hover: 'hover:bg-emerald-500/30', border: 'hover:border-emerald-500/50', shadow: 'hover:shadow-emerald-500/20' },
  'unhinged': { bg: 'bg-rose-600/20', hover: 'hover:bg-rose-500/30', border: 'hover:border-rose-500/50', shadow: 'hover:shadow-rose-500/20' },
  'needle point': { bg: 'bg-violet-600/20', hover: 'hover:bg-violet-500/30', border: 'hover:border-violet-500/50', shadow: 'hover:shadow-violet-500/20' },
  'yellow-banded': { bg: 'bg-yellow-500/20', hover: 'hover:bg-yellow-400/30', border: 'hover:border-yellow-400/50', shadow: 'hover:shadow-yellow-400/20' },
};

// Default color for unknown skins
const defaultSkinColor = { bg: 'bg-white/5', hover: 'hover:bg-white/10', border: 'hover:border-white/20', shadow: 'hover:shadow-white/10' };

// Extract skin color from item name
const getSkinColor = (itemName) => {
  if (!itemName) return defaultSkinColor;
  const lowerName = itemName.toLowerCase();

  // Check each skin pattern
  for (const [pattern, colors] of Object.entries(skinColorMap)) {
    if (lowerName.includes(pattern)) {
      return colors;
    }
  }

  return defaultSkinColor;
};

// Floating Particles Component
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

export default function InspectionOverlay({ combo, imageMap, comboId, isOpen, onClose }) {
  const [selectedMap, setSelectedMap] = useState('studio');
  const [showScoreTooltip, setShowScoreTooltip] = useState(false);

  // Calculate score breakdown when combo changes
  const scoreBreakdown = useMemo(() => {
    if (!combo?.knife || !combo?.glove) return null;
    return getStyleScoreBreakdown(combo.knife, combo.glove);
  }, [combo?.knife, combo?.glove]);

  // Mouse tracking for parallax
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Spring config for smooth motion
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };

  // 3D tilt based on mouse
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), springConfig);

  // Parallax movement for items
  const knifeX = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), springConfig);
  const knifeY = useSpring(useTransform(mouseY, [0, 1], [-15, 15]), springConfig);
  const gloveX = useSpring(useTransform(mouseX, [0, 1], [10, -10]), springConfig);
  const gloveY = useSpring(useTransform(mouseY, [0, 1], [8, -8]), springConfig);

  // Glare position
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
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isOpen]);

  if (!combo) return null;

  const rarity = getRarity(combo.styleScore);
  const atmosphere = mapAtmospheres.find(m => m.id === selectedMap) || mapAtmospheres[0];
  const knifeImage = combo.knifeImage || imageMap?.[combo.knife];
  const gloveImage = combo.gloveImage || imageMap?.[combo.glove];

  // Extract clean names
  const knifeBaseName = combo.knife?.split('|')[0]?.replace('★ ', '').trim() || 'Knife';
  const knifeSkin = combo.knife?.split('|')[1]?.trim() || '';
  const gloveBaseName = combo.glove?.split('|')[0]?.replace('★ ', '').trim() || 'Gloves';
  const gloveSkin = combo.glove?.split('|')[1]?.trim() || '';

  // Get dynamic skin colors for buttons
  const knifeColor = getSkinColor(combo.knife);
  const gloveColor = getSkinColor(combo.glove);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
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

          {/* Scan lines effect */}
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
              {/* Glove - Background Layer */}
              <motion.div
                layoutId={`glove-${comboId}`}
                className="absolute"
                style={{
                  x: gloveX,
                  y: gloveY,
                  left: -60,
                  top: 20,
                  zIndex: 10,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                {gloveImage ? (
                  <img
                    src={gloveImage}
                    alt={combo.glove}
                    className="w-[300px] h-[300px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px]
                      object-contain opacity-80 brightness-90 saturate-[0.85]
                      drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
                  />
                ) : (
                  <div className="w-[380px] h-[380px] bg-white/5 rounded-3xl flex items-center justify-center">
                    <span className="text-white/30 text-sm tracking-widest">NO IMAGE</span>
                  </div>
                )}
              </motion.div>

              {/* Knife - Foreground Layer */}
              <motion.div
                layoutId={`knife-${comboId}`}
                className="relative"
                style={{
                  x: knifeX,
                  y: knifeY,
                  zIndex: 20,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                {knifeImage ? (
                  <img
                    src={knifeImage}
                    alt={combo.knife}
                    className="w-[340px] h-[340px] md:w-[450px] md:h-[450px] lg:w-[520px] lg:h-[520px]
                      object-contain brightness-110 contrast-105
                      drop-shadow-[0_35px_70px_rgba(0,0,0,0.7)]"
                  />
                ) : (
                  <div className="w-[450px] h-[450px] bg-white/5 rounded-3xl flex items-center justify-center">
                    <span className="text-white/30 text-sm tracking-widest">NO IMAGE</span>
                  </div>
                )}

                {/* Glare overlay on knife */}
                <motion.div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.5) 0%, transparent 50%)`,
                  }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* ========== HUD PANEL A: Spec Sheet (Top Left) ========== */}
          <motion.div
            className="absolute top-6 left-6 z-40 max-w-md"
            initial={{ opacity: 0, x: -50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Knife Spec */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${rarity.gradient}`} />
                <div>
                  <p className="text-white/50 text-xs font-medium tracking-[0.3em] uppercase">Primary Weapon</p>
                  <h1 className="text-white text-2xl md:text-3xl font-black tracking-tight uppercase">
                    {knifeBaseName}
                  </h1>
                </div>
              </div>
              {knifeSkin && (
                <p className={`text-lg font-semibold ${rarity.color} ml-4 tracking-wide`}>
                  {knifeSkin}
                </p>
              )}
              {combo.knifeCondition && (
                <div className="mt-3 ml-4 flex items-center gap-3">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[150px]">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${rarity.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: combo.knifeCondition === 'Factory New' ? '100%' :
                                        combo.knifeCondition === 'Minimal Wear' ? '80%' :
                                        combo.knifeCondition === 'Field-Tested' ? '60%' :
                                        combo.knifeCondition === 'Well-Worn' ? '40%' : '20%' }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                  </div>
                  <span className="text-white/60 text-xs font-mono uppercase tracking-wider">
                    {combo.knifeCondition}
                  </span>
                </div>
              )}
            </div>

            {/* Glove Spec */}
            <div className="opacity-70">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-pink-500 to-rose-600" />
                <div>
                  <p className="text-white/40 text-xs font-medium tracking-[0.3em] uppercase">Secondary</p>
                  <h2 className="text-white text-lg md:text-xl font-bold tracking-tight uppercase">
                    {gloveBaseName}
                  </h2>
                </div>
              </div>
              {gloveSkin && (
                <p className="text-pink-400/80 text-sm font-medium ml-4 tracking-wide">
                  {gloveSkin}
                </p>
              )}
            </div>

            {/* Rarity Badge with Score Tooltip */}
            <div className="relative mt-6 inline-block">
              <motion.div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${rarity.bg}
                  border ${rarity.border} backdrop-blur-sm cursor-help`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                onMouseEnter={() => setShowScoreTooltip(true)}
                onMouseLeave={() => setShowScoreTooltip(false)}
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${rarity.gradient} animate-pulse`} />
                <span className={`text-xs font-bold tracking-[0.2em] ${rarity.color}`}>
                  {rarity.name} MATCH
                </span>
                <span className={`text-sm font-black ${rarity.color}`}>
                  {combo.styleScore}
                </span>
                <Info className={`w-3.5 h-3.5 ${rarity.color} opacity-50`} />
              </motion.div>

              {/* Score Breakdown Tooltip */}
              <AnimatePresence>
                {showScoreTooltip && scoreBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-3 z-50 w-72"
                  >
                    <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-white/10
                      shadow-2xl shadow-black/50 overflow-hidden">
                      {/* Header */}
                      <div className={`px-4 py-3 border-b border-white/10 ${rarity.bg}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-xs font-medium tracking-wider uppercase">
                            Score Breakdown
                          </span>
                          <span className={`text-lg font-black ${rarity.color}`}>
                            {scoreBreakdown.finalScore}
                          </span>
                        </div>
                        <p className={`text-sm font-semibold ${rarity.color} mt-1`}>
                          {scoreBreakdown.summary}
                        </p>
                      </div>

                      {/* Factors */}
                      <div className="px-4 py-3 space-y-2.5">
                        {scoreBreakdown.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white/90 text-xs font-semibold">
                                {factor.label}
                              </p>
                              <p className="text-white/50 text-xs truncate">
                                {factor.value}
                              </p>
                            </div>
                            <span className={`text-xs font-mono font-bold whitespace-nowrap ${
                              factor.impact.startsWith('-') ? 'text-red-400' :
                              factor.impact.startsWith('+') ? 'text-green-400' :
                              'text-yellow-400'
                            }`}>
                              {factor.impact}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Base score footer */}
                      <div className="px-4 py-2 bg-white/5 border-t border-white/10">
                        <p className="text-white/40 text-[10px] font-medium tracking-wider">
                          BASE: 25 PTS + COLOR + TEXTURE + PRESTIGE
                        </p>
                      </div>
                    </div>

                    {/* Tooltip arrow */}
                    <div className="absolute -top-2 left-6 w-4 h-4 rotate-45 bg-black/90 border-l border-t border-white/10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ========== HUD PANEL B: Commerce Engine (Bottom Right) ========== */}
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
                Total Investment
              </p>
              <div className={`text-4xl md:text-5xl font-black font-mono ${rarity.color} tracking-tight`}>
                ${combo.totalPrice.toFixed(2)}
              </div>
              <div className="flex justify-end gap-4 mt-2 text-white/50 text-sm font-mono">
                <span>Knife: ${combo.knifePrice.toFixed(2)}</span>
                <span>Gloves: ${combo.glovePrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Buy Buttons - Colors match skin patterns on hover */}
            <div className="flex flex-col gap-2">
              <a
                href={combo.knifeLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between gap-4 px-5 py-3 rounded-xl
                  bg-white/5 ${knifeColor.hover} backdrop-blur-md border border-white/10
                  ${knifeColor.border} ${knifeColor.shadow} transition-all duration-300`}
              >
                <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">Buy Knife</span>
                <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
              </a>

              <a
                href={combo.gloveLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between gap-4 px-5 py-3 rounded-xl
                  bg-white/5 ${gloveColor.hover} backdrop-blur-md border border-white/10
                  ${gloveColor.border} ${gloveColor.shadow} transition-all duration-300`}
              >
                <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">Buy Gloves</span>
                <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
              </a>
            </div>

            {/* Add to Inventory Buttons */}
            <div className="flex flex-col gap-2 mt-4">
              <AddToInventoryButton
                item={{
                  name: combo.knife,
                  condition: combo.knifeCondition,
                  price: combo.knifePrice,
                  image: knifeImage,
                  marketLink: combo.knifeLink,
                }}
                slotId="knife"
                label="Add Knife"
              />
              <AddToInventoryButton
                item={{
                  name: combo.glove,
                  condition: combo.gloveCondition,
                  price: combo.glovePrice,
                  image: gloveImage,
                  marketLink: combo.gloveLink,
                }}
                slotId="gloves"
                label="Add Gloves"
              />
            </div>
          </motion.div>

          {/* ========== HUD PANEL C: Map Selector (Bottom Center) ========== */}
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
                      layoutId="map-selector-bg"
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
