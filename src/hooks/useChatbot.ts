import { useState, useCallback, useEffect } from 'react';
import { chatbotService } from '../services/chatbotService';
import type { ChatbotResponse, ActiveOrder } from '../services/chatbotService';
import { useAuthStore } from '../store/useSwiftStore';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  type?: 'text' | 'order_card' | 'options';
  order?: ActiveOrder | null;
  options?: string[];
  actionUrl?: string | null;
  timestamp: Date;
}

const DEFAULT_OPTIONS = [
  "🚚 Track my order",
  "❌ Cancel an order",
  "↩️ Return / Refund",
  "💳 Payment issue",
  "🗣️ Talk to human"
];

const mapTextToIntent = (text: string): string => {
  const clean = text.toLowerCase().trim();
  if (clean.includes('track') || clean.includes('status') || clean.includes('where')) return 'TRACK_ORDER';
  if (clean.includes('cancel')) return 'CANCEL_ORDER';
  if (clean.includes('return') || clean.includes('refund')) return 'RETURN';
  if (clean.includes('payment') || clean.includes('fail') || clean.includes('debit')) return 'PAYMENT';
  if (clean.includes('account') || clean.includes('profile') || clean.includes('login')) return 'ACCOUNT';
  if (clean.includes('not received') || clean.includes('delay')) return 'ORDER_NOT_RECEIVED';
  if (clean.includes('human') || clean.includes('support') || clean.includes('agent')) return 'TALK_TO_HUMAN';
  return text;
};

export const useChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { isLoggedIn, user } = useAuthStore();

  const initializeChat = useCallback(() => {
    const greetingText = isLoggedIn && user
      ? `Hi ${user.name}! Welcome to SwiftCart Support. How can I assist you today?`
      : "Hello! Welcome to SwiftCart Support. Please log in for personalized order support, or ask me any general questions!";
    
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: greetingText,
        type: 'options',
        options: DEFAULT_OPTIONS,
        timestamp: new Date()
      }
    ]);
  }, [isLoggedIn, user]);

  // Reset or initialize chatbot history when login state changes or when empty
  useEffect(() => {
    if (messages.length === 0) {
      initializeChat();
    }
  }, [isLoggedIn, messages.length, initializeChat]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setIsTyping(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      let response: ChatbotResponse;
      
      // If it's order cancellation selection
      if (text.startsWith('Cancel ')) {
        const orderId = text.replace('Cancel ', '').trim();
        response = await chatbotService.cancelOrder(orderId);
      } else {
        const intent = mapTextToIntent(text);
        response = await chatbotService.sendMessage(intent);
      }

      // Artificial timeout for realistic typing effect
      setTimeout(() => {
        const botMsg: Message = {
          id: Math.random().toString(36).substring(7),
          sender: 'bot',
          text: response.messageText,
          type: response.type,
          order: response.order,
          options: response.options && response.options.length > 0 ? response.options : DEFAULT_OPTIONS,
          actionUrl: response.actionUrl,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 800);
    } catch (error: any) {
      setIsTyping(false);
      setTimeout(() => {
        const botMsg: Message = {
          id: Math.random().toString(36).substring(7),
          sender: 'bot',
          text: error.message || "Sorry, I encountered an issue. Let's try again.",
          type: 'text',
          options: DEFAULT_OPTIONS,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }, 400);
    }
  }, []);

  return {
    isOpen,
    messages,
    isTyping,
    toggleChat,
    sendMessage,
    resetChat
  };
};
