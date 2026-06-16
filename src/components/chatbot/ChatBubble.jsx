import React from "react";
import { MessageSquare, X } from "lucide-react";
import { motion } from "framer-motion";

export const ChatBubble = ({ isOpen, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="w-14 h-14 bg-swift-blue text-white rounded-full flex items-center justify-center shadow-modal cursor-pointer focus:outline-none focus:ring-2 focus:ring-swift-blue/50 z-50"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      layout
      aria-label={isOpen ? "Close support chat" : "Open support chat"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.div>
    </motion.button>
  );
};
