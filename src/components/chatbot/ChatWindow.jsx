import React, { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, X, Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { QuickReplies } from "./QuickReplies";
import { TypingIndicator } from "./TypingIndicator";

export const ChatWindow = ({
  messages,
  isTyping,
  onSendMessage,
  onClose,
  onReset,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages or typing status updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const DEFAULT_OPTIONS = [
    "🚚 Track my order",
    "❌ Cancel an order",
    "↩️ Return / Refund",
    "💳 Payment issue",
    "🗣️ Talk to human",
  ];

  // Extract quick replies from the last bot message
  const lastMessage = messages[messages.length - 1];
  const quickReplyOptions =
    lastMessage && lastMessage.sender === "bot" && lastMessage.options && lastMessage.options.length > 0
      ? lastMessage.options
      : DEFAULT_OPTIONS;

  return (
    <div className="w-[calc(100vw-2rem)] sm:w-[360px] h-[80vh] sm:h-[520px] max-h-[520px] bg-white rounded-2xl shadow-modal border border-gray-100 flex flex-col overflow-hidden z-50">
      {/* Premium Gradient Header */}
      <div className="bg-gradient-to-r from-swift-blue to-swift-blue-dark text-white px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <Sparkles size={18} className="text-swift-orange animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide">
              SwiftCart Support
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-white/80 font-medium">
                Assistant Online
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            title="Reset conversation"
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors duration-200 text-white/80 hover:text-white"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onClose}
            title="Close chat"
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors duration-200 text-white/80 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-grow overflow-y-auto bg-swift-bg/30 py-4 no-scrollbar">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {quickReplyOptions && quickReplyOptions.length > 0 && !isTyping && (
        <div className="bg-white border-t border-gray-50 flex-shrink-0">
          <QuickReplies options={quickReplyOptions} onSelect={onSendMessage} />
        </div>
      )}

      {/* Custom input bar */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask something about orders or return..."
          className="flex-grow px-3 py-2 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 focus:border-swift-blue outline-none text-xs rounded-button transition-all duration-200"
        />

        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-2 bg-swift-blue hover:bg-swift-blue-dark disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-button transition-colors duration-200"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
