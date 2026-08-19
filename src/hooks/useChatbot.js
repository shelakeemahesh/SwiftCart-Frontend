import { useState, useCallback, useEffect } from "react";
import { chatbotService } from "../services/chatbotService";
import { useAuthStore } from "../store/useSwiftStore";

const DEFAULT_OPTIONS = [
  "🚚 Track my order",
  "❌ Cancel an order",
  "↩️ Return / Refund",
  "💳 Payment issue",
  "🗣️ Talk to human",
];

const BUTTON_INTENT_MAP = {
  "🚚 Track my order": "TRACK_ORDER",
  "track my order": "TRACK_ORDER",
  "❌ Cancel an order": "CANCEL_ORDER",
  "cancel an order": "CANCEL_ORDER",
  "↩️ Return / Refund": "RETURN",
  "return / refund": "RETURN",
  "💳 Payment issue": "PAYMENT",
  "payment issue": "PAYMENT",
  "🔐 Account help": "ACCOUNT",
  "account help": "ACCOUNT",
  "📦 Order not received": "ORDER_NOT_RECEIVED",
  "order not received": "ORDER_NOT_RECEIVED",
  "🗣️ Talk to human": "TALK_TO_HUMAN",
  "talk to human": "TALK_TO_HUMAN",
};

export const useChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { isLoggedIn, user } = useAuthStore();

  const initializeChat = useCallback(() => {
    const greetingText =
      isLoggedIn && user
        ? `Hi ${user.name}! Welcome to SwiftCart Support. How can I assist you today?`
        : "Hello! Welcome to SwiftCart Support. Please log in for personalized order support, or ask me any questions about our products!";
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: greetingText,
        type: "options",
        options: DEFAULT_OPTIONS,
        timestamp: new Date(),
      },
    ]);
  }, [isLoggedIn, user]);

  // Reset or initialize chatbot history when login state changes or when empty
  useEffect(() => {
    initializeChat();
  }, [isLoggedIn, initializeChat]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setIsTyping(false);
    initializeChat();
  }, [initializeChat]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text ? text.trim() : "";
    if (!trimmed) return;

    // Add user message
    const userMsg = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      let response;
      // If it's order cancellation selection
      if (trimmed.startsWith("Cancel ")) {
        const orderId = trimmed.replace("Cancel ", "").trim();
        response = await chatbotService.cancelOrder(orderId);
      } else {
        const explicitIntent = BUTTON_INTENT_MAP[trimmed] || null;
        response = await chatbotService.sendMessage(trimmed, explicitIntent);
      }

      // Artificial timeout for realistic typing effect
      setTimeout(() => {
        const botMsg = {
          id: Math.random().toString(36).substring(7),
          sender: "bot",
          text: response?.messageText || "How else can I help you?",
          type: response?.type || "text",
          order: response?.order,
          recommendedProducts: response?.recommendedProducts || [],
          options:
            response?.options && response?.options.length > 0
              ? response?.options
              : DEFAULT_OPTIONS,
          actionUrl: response?.actionUrl,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 400);
    } catch (error) {
      setIsTyping(false);
      setTimeout(() => {
        const botMsg = {
          id: Math.random().toString(36).substring(7),
          sender: "bot",
          text:
            error.message || "Sorry, I encountered an issue. Let's try again.",
          type: "text",
          options: DEFAULT_OPTIONS,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 300);
    }
  }, []);

  return {
    isOpen,
    messages,
    isTyping,
    toggleChat,
    sendMessage,
    resetChat,
  };
};
