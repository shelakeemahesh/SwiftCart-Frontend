import React from "react";
import { motion } from "framer-motion";

export const QuickReplies = ({ options, onSelect }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar snap-x snap-mandatory">
      {options.map((option, idx) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(option)}
          className="flex-shrink-0 snap-start px-3 py-1.5 bg-white hover:bg-swift-blue/5 text-swift-blue border border-swift-blue/20 hover:border-swift-blue/40 text-xs font-medium rounded-pill transition-colors duration-200 shadow-sm whitespace-nowrap"
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
};
