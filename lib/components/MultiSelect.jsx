'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Refined knife icon with better proportions
const KnifeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14.5 4.5L19.5 9.5L9.5 19.5L4.5 14.5L14.5 4.5Z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7L17 12" strokeLinecap="round"/>
    <path d="M4.5 14.5L2 22L9.5 19.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Refined glove icon
const GloveIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 10V5C6 3.89543 6.89543 3 8 3C9.10457 3 10 3.89543 10 5V10" strokeLinecap="round"/>
    <path d="M10 9V3.5C10 2.67157 10.6716 2 11.5 2C12.3284 2 13 2.67157 13 3.5V9" strokeLinecap="round"/>
    <path d="M13 9V4C13 3.17157 13.6716 2.5 14.5 2.5C15.3284 2.5 16 3.17157 16 4V9" strokeLinecap="round"/>
    <path d="M16 10V6C16 5.17157 16.6716 4.5 17.5 4.5C18.3284 4.5 19 5.17157 19 6V14C19 18.4183 15.4183 22 11 22H10C6.68629 22 4 19.3137 4 16V10C4 9.17157 4.67157 8.5 5.5 8.5C6.32843 8.5 7 9.17157 7 10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Animated checkmark for selections
const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <motion.path
      d="M5 12l5 5L19 7"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    />
  </svg>
);

// Search icon with subtle animation capability
const SearchIcon = ({ className, focused }) => (
  <motion.svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    animate={{ scale: focused ? 1.1 : 1 }}
    transition={{ duration: 0.15 }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </motion.svg>
);

export default function MultiSelect({
  label,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  options = [],
  selected = [],
  onChange,
  variant = 'knife',
  maxVisiblePills = 2,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const Icon = variant === 'knife' ? KnifeIcon : GloveIcon;

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
        setHoveredIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        setHoveredIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHoveredIndex(prev => Math.min(prev + 1, filteredOptions.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHoveredIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (hoveredIndex === -1) {
          onChange([]);
          setIsOpen(false);
        } else if (hoveredIndex >= 0 && hoveredIndex < filteredOptions.length) {
          toggleOption(filteredOptions[hoveredIndex]);
        }
        break;
    }
  }, [isOpen, hoveredIndex, filteredOptions, onChange]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (e, option) => {
    e.stopPropagation();
    onChange(selected.filter(s => s !== option));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const clearSearch = (e) => {
    e.stopPropagation();
    setSearch('');
    inputRef.current?.focus();
  };

  const visiblePills = selected.slice(0, maxVisiblePills);
  const hiddenCount = selected.length - maxVisiblePills;

  // Animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -8,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1,
      }
    },
    exit: {
      opacity: 0,
      y: -4,
      scale: 0.98,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  const pillVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -4 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { type: "spring", stiffness: 500, damping: 25 }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      x: -4,
      transition: { duration: 0.15 }
    }
  };

  const optionVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.02,
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {/* Label */}
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <motion.div
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        whileTap={{ scale: 0.995 }}
        className={`
          relative min-h-[48px] px-4 py-3 rounded-xl cursor-pointer
          bg-gray-900/80 border transition-all duration-200
          flex items-center gap-2 flex-wrap
          ${isOpen
            ? 'border-purple-500/50 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/5'
            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/60'
          }
        `}
        style={{
          boxShadow: isOpen
            ? '0 4px 20px -4px rgba(168, 85, 247, 0.15), inset 0 1px 1px rgba(255,255,255,0.03)'
            : 'inset 0 1px 1px rgba(255,255,255,0.02), inset 0 -1px 1px rgba(0,0,0,0.1)'
        }}
      >
        {/* Selected Pills */}
        <AnimatePresence mode="popLayout">
          {visiblePills.map((item, index) => (
            <motion.span
              key={item}
              layout
              variants={pillVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="group/pill inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg
                         bg-purple-500/10 border border-purple-500/20
                         text-[11px] font-medium text-purple-300
                         hover:bg-purple-500/15 hover:border-purple-500/30
                         transition-colors duration-150"
            >
              <span className="truncate max-w-[80px]">{item}</span>
              <motion.button
                onClick={(e) => removeOption(e, item)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-0.5 rounded-md opacity-60 hover:opacity-100
                           hover:bg-purple-500/20 transition-all duration-150"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Hidden Count Badge */}
        <AnimatePresence>
          {hiddenCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center justify-center px-2 py-0.5
                         rounded-md bg-gray-700/50 text-[11px] font-medium text-gray-400"
            >
              +{hiddenCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Placeholder */}
        {selected.length === 0 && (
          <span className="text-sm text-gray-500 select-none">{placeholder}</span>
        )}

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {/* Clear All Button */}
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearAll}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-300
                           hover:bg-gray-700/50 transition-all duration-150"
                aria-label="Clear all selections"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Divider */}
          {selected.length > 0 && (
            <div className="w-px h-4 bg-gray-700 mx-1" />
          )}

          {/* Chevron */}
          <motion.div
            animate={{
              rotate: isOpen ? 180 : 0,
              y: isOpen ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`p-1 rounded-md transition-colors duration-150 ${
              isOpen ? 'text-purple-400' : 'text-gray-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-[200] mt-2 w-full min-w-[220px] rounded-xl overflow-hidden
                       border border-gray-700 bg-gray-800"
            style={{
              boxShadow: `
                0 4px 6px -1px rgba(0, 0, 0, 0.2),
                0 10px 20px -5px rgba(0, 0, 0, 0.3),
                0 25px 50px -12px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.03) inset,
                0 1px 0 rgba(255, 255, 255, 0.03) inset
              `
            }}
            role="listbox"
            aria-multiselectable="true"
          >
            {/* Search Section */}
            <div className="p-3">
              <div className={`
                flex items-center gap-2.5 px-3 py-2 rounded-lg
                bg-gray-900/60 border transition-all duration-200
                ${searchFocused
                  ? 'border-purple-500/30 ring-1 ring-purple-500/10'
                  : 'border-gray-700/50 hover:border-gray-600/50'
                }
              `}>
                <SearchIcon
                  className="w-4 h-4 shrink-0 text-gray-500"
                  focused={searchFocused}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm text-gray-200
                             placeholder-gray-500 outline-none"
                  aria-label="Search options"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={clearSearch}
                      className="p-0.5 rounded text-gray-500 hover:text-gray-300
                                 hover:bg-gray-700/50 transition-all duration-150"
                      aria-label="Clear search"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Elegant Separator */}
            <div className="relative h-px mx-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent" />
            </div>

            {/* Options List */}
            <div
              ref={listRef}
              className="max-h-[280px] overflow-y-auto overflow-x-hidden custom-scrollbar py-2 px-2"
            >
              {/* "All" Option - Reset Selection */}
              <motion.div
                variants={optionVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                onClick={() => { onChange([]); setIsOpen(false); setSearch(''); }}
                onMouseEnter={() => setHoveredIndex(-1)}
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                  transition-all duration-150 mb-1
                  ${selected.length === 0
                    ? 'bg-purple-500/10'
                    : hoveredIndex === -1
                      ? 'bg-gray-700/40'
                      : 'hover:bg-gray-700/30'
                  }
                `}
                role="option"
                aria-selected={selected.length === 0}
              >
                {/* Checkbox Indicator */}
                <div className={`
                  flex items-center justify-center w-4 h-4 rounded
                  transition-all duration-150 shrink-0
                  ${selected.length === 0
                    ? 'bg-purple-500 text-white'
                    : 'border-2 border-gray-500 group-hover:border-gray-400'
                  }
                `}>
                  {selected.length === 0 && (
                    <CheckIcon className="w-3 h-3" />
                  )}
                </div>

                {/* Icon */}
                <div className={`
                  transition-colors duration-150 shrink-0
                  ${selected.length === 0 ? 'text-purple-300' : 'text-gray-400 group-hover:text-gray-300'}
                `}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label */}
                <span className={`
                  text-sm font-medium transition-colors duration-150 truncate
                  ${selected.length === 0 ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                `}>
                  All {variant === 'knife' ? 'Knives' : 'Gloves'}
                </span>

                {/* Count Badge */}
                <span className={`
                  ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0
                  ${selected.length === 0
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-gray-700/50 text-gray-500'
                  }
                `}>
                  {options.length}
                </span>
              </motion.div>

              {/* Subtle Separator after "All" */}
              <div className="h-px bg-gray-700/30 mx-2 my-2" />

              {/* Options */}
              {filteredOptions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-gray-500"
                >
                  <svg className="w-10 h-10 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm font-medium">No results found</p>
                  <p className="text-xs text-gray-600 mt-1">Try a different search term</p>
                </motion.div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selected.includes(option);
                  const isHovered = hoveredIndex === index;

                  return (
                    <motion.div
                      key={option}
                      variants={optionVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index + 1}
                      onClick={() => toggleOption(option)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                        transition-all duration-150
                        ${isSelected
                          ? 'bg-purple-500/10'
                          : isHovered
                            ? 'bg-gray-700/40'
                            : 'hover:bg-gray-700/30'
                        }
                      `}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {/* Checkbox Indicator */}
                      <motion.div
                        className={`
                          flex items-center justify-center w-4 h-4 rounded shrink-0
                          transition-all duration-150
                          ${isSelected
                            ? 'bg-purple-500 text-white'
                            : 'border-2 border-gray-500 group-hover:border-gray-400'
                          }
                        `}
                        animate={{ scale: isSelected ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.15 }}
                            >
                              <CheckIcon className="w-3 h-3" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Icon */}
                      <div className={`
                        transition-colors duration-150 shrink-0
                        ${isSelected ? 'text-purple-300' : 'text-gray-400 group-hover:text-gray-300'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Label */}
                      <span className={`
                        text-sm font-medium transition-colors duration-150 truncate
                        ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                      `}>
                        {option}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer with selection count */}
            {selected.length > 0 && (
              <>
                <div className="h-px bg-gray-700/30 mx-3" />
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {selected.length} selected
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onChange([]); }}
                    className="text-xs text-purple-400 hover:text-purple-300
                               font-medium transition-colors duration-150"
                  >
                    Clear all
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
