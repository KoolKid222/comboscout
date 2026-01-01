'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

// Rarity colors based on CS2 item tiers
const getRarityColor = (score) => {
  if (score >= 90) return { border: 'border-yellow-500', glow: 'shadow-yellow-500/40', text: 'text-yellow-400', bg: 'bg-yellow-500/10', gradient: 'from-yellow-500 to-amber-600' };
  if (score >= 80) return { border: 'border-pink-500', glow: 'shadow-pink-500/40', text: 'text-pink-400', bg: 'bg-pink-500/10', gradient: 'from-pink-500 to-rose-600' };
  if (score >= 70) return { border: 'border-purple-500', glow: 'shadow-purple-500/40', text: 'text-purple-400', bg: 'bg-purple-500/10', gradient: 'from-purple-500 to-violet-600' };
  if (score >= 60) return { border: 'border-blue-500', glow: 'shadow-blue-500/40', text: 'text-blue-400', bg: 'bg-blue-500/10', gradient: 'from-blue-500 to-cyan-600' };
  return { border: 'border-gray-500', glow: 'shadow-gray-500/40', text: 'text-gray-400', bg: 'bg-gray-500/10', gradient: 'from-gray-500 to-zinc-600' };
};

export default function ComboCard({ combo, imageMap, comboId, onClick, isSelected }) {
  const [isHovered, setIsHovered] = useState(false);

  // Raw motion values for mouse position (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoother spring config
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };

  // Card rotation (subtle 4 degree tilt)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig);

  // Card scale on hover (very subtle)
  const scale = useSpring(isHovered ? 1.015 : 1, springConfig);

  // Parallax for knife (foreground - moves more)
  const knifeX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);
  const knifeY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-4, 4]), springConfig);

  // Parallax for glove (background - moves less, opposite direction for depth)
  const gloveX = useSpring(useTransform(mouseX, [-0.5, 0.5], [3, -3]), springConfig);
  const gloveY = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]), springConfig);

  // Glare position (percentage for gradient)
  const glareXPercent = useTransform(mouseX, [-0.5, 0.5], [65, 35]);
  const glareYPercent = useTransform(mouseY, [-0.5, 0.5], [65, 35]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareXPercent}% ${glareYPercent}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;

  // Handle mouse move
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Reset on mouse leave
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleClick = (e) => {
    // Don't trigger if clicking on buy links
    if (e.target.closest('a')) return;
    // Reset hover state when opening overlay
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    onClick?.();
  };

  const rarity = getRarityColor(combo.styleScore);
  const knifeImage = combo.knifeImage || imageMap[combo.knife];
  const gloveImage = combo.gloveImage || imageMap[combo.glove];

  // Don't render if selected (the overlay will show it)
  if (isSelected) {
    return (
      <div className="relative">
        {/* Placeholder to maintain grid layout */}
        <div className="rounded-2xl border-2 border-transparent bg-gray-900/30 h-[420px]" />
      </div>
    );
  }

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Card Container with 3D Transform */}
      <motion.div
        className={`relative overflow-hidden rounded-2xl border-2 bg-gray-900/95 backdrop-blur-sm
          transition-colors duration-300 ${isHovered ? `${rarity.border} shadow-2xl ${rarity.glow}` : 'border-gray-700/50'}`}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
        }}
      >
        {/* Glare Overlay */}
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: glareBackground,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Score Badge - Floating Top Right (visible on hover) */}
        <div
          className={`absolute top-3 right-3 z-40 px-3 py-1.5 rounded-full text-sm font-bold border-2
            ${rarity.border} ${rarity.text} ${rarity.bg} backdrop-blur-md shadow-lg
            transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
            <span>{combo.styleScore}</span>
        </div>

        {/* Visual Viewport - The 3D Layered Image Section */}
        <div className="relative h-56 overflow-hidden">
          {/* Layer 1: Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90" />

          {/* Layer 2: Glove (Background - desaturated, smaller) */}
          <motion.div
            layoutId={`glove-${comboId}`}
            className="absolute inset-0 flex items-center justify-center"
            style={{ x: gloveX, y: gloveY }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {gloveImage ? (
              <img
                src={gloveImage}
                alt={combo.glove}
                className={`w-36 h-36 object-contain drop-shadow-2xl transition-all duration-300
                  ${isHovered ? 'opacity-70 saturate-[0.7]' : 'opacity-50 saturate-50 blur-[0.5px]'}`}
                loading="lazy"
              />
            ) : (
              <div className="w-36 h-36 bg-gray-800/50 rounded-xl flex items-center justify-center">
                <span className="text-gray-600 text-xs">Loading...</span>
              </div>
            )}
          </motion.div>

          {/* Layer 3: Knife (Foreground - high contrast, larger) */}
          <motion.div
            layoutId={`knife-${comboId}`}
            className="absolute inset-0 flex items-center justify-center"
            style={{ x: knifeX, y: knifeY }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {knifeImage ? (
              <img
                src={knifeImage}
                alt={combo.knife}
                className={`w-44 h-44 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)] transition-all duration-300
                  ${isHovered ? 'contrast-125 brightness-110 scale-105' : 'contrast-110 brightness-105'}`}
                loading="lazy"
              />
            ) : (
              <div className="w-44 h-44 bg-gray-800/50 rounded-xl flex items-center justify-center">
                <span className="text-gray-600 text-xs">Loading...</span>
              </div>
            )}
          </motion.div>

          {/* Bottom gradient fade into metadata */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>

        {/* Metadata Section - Frosted Glass */}
        <div className="relative z-30 p-5 bg-gray-900/90 border-t border-gray-700/50">
          {/* Item Names */}
          <div className="space-y-2 mb-4">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Knife</span>
              <h3 className={`text-sm font-bold leading-tight line-clamp-1 transition-colors duration-200
                ${isHovered ? 'text-purple-300' : 'text-white'}`}>
                {combo.knife}
              </h3>
            </div>
            <div>
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">Gloves</span>
              <h3 className={`text-sm font-bold leading-tight line-clamp-1 transition-colors duration-200
                ${isHovered ? 'text-pink-300' : 'text-white'}`}>
                {combo.glove}
              </h3>
            </div>
          </div>

          {/* Condition Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {combo.knifeCondition && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-medium">
                {combo.knifeCondition}
              </span>
            )}
            {combo.gloveCondition && (
              <span className="px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-[10px] font-medium">
                {combo.gloveCondition}
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider">Knife</span>
                <div className="text-green-400 font-mono text-sm font-bold">${combo.knifePrice.toFixed(2)}</div>
              </div>
              <div className="text-gray-600">+</div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider">Gloves</span>
                <div className="text-green-400 font-mono text-sm font-bold">${combo.glovePrice.toFixed(2)}</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">Total</span>
              <div className={`text-xl font-black font-mono ${rarity.text}`}>
                ${combo.totalPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Buy Links */}
          <div className="flex gap-2 mt-4">
            <a
              href={combo.knifeLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-3 py-2 rounded-lg font-medium
                transition-all flex items-center justify-center gap-1.5 text-xs
                border border-white/10 hover:border-white/20 active:scale-95"
            >
              Knife
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
            <a
              href={combo.gloveLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-3 py-2 rounded-lg font-medium
                transition-all flex items-center justify-center gap-1.5 text-xs
                border border-white/10 hover:border-white/20 active:scale-95"
            >
              Gloves
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
