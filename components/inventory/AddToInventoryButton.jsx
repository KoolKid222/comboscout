'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, RefreshCw } from 'lucide-react';
import { useInventory } from '@/lib/InventoryContext';

export default function AddToInventoryButton({
  item,
  slotId,
  label = 'Add to Inventory',
  className = '',
}) {
  const { setItem, isInInventory, getItem } = useInventory();
  const [showSuccess, setShowSuccess] = useState(false);

  const alreadyInInventory = isInInventory(item.name);
  const currentItem = getItem(slotId);
  const hasOtherItem = currentItem && currentItem.name !== item.name;

  const handleClick = () => {
    setItem(slotId, item);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Already in inventory - show checkmark
  if (alreadyInInventory && !showSuccess) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl
        bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium ${className}`}>
        <Check className="w-4 h-4" />
        In Inventory
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
        bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50
        text-purple-300 hover:text-white text-sm font-medium transition-all ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-green-400"
          >
            <Check className="w-4 h-4" />
            Added!
          </motion.span>
        ) : hasOtherItem ? (
          <motion.span
            key="replace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Replace in Inventory
          </motion.span>
        ) : (
          <motion.span
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
