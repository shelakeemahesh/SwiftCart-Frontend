import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatbot } from '../../hooks/useChatbot';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';

export const ChatWidget: React.FC = () => {
  const { isOpen, messages, isTyping, toggleChat, sendMessage, resetChat } = useChatbot();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.93 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="origin-bottom-right"
          >
            <ChatWindow
              messages={messages}
              isTyping={isTyping}
              onSendMessage={sendMessage}
              onClose={toggleChat}
              onReset={resetChat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ChatBubble isOpen={isOpen} onClick={toggleChat} />
    </div>
  );
};
