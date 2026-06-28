import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, ShoppingBag, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../api/apiClient";

export const LiveActivityBanner = () => {
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    let timerId = null;
    const eventSource = new EventSource(`${API_BASE_URL}/api/v1/activity/stream`);

    eventSource.addEventListener("activity-feed", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received live activity event:", data);

        if (timerId) {
          clearTimeout(timerId);
        }

        setActiveEvent(data);

        // Auto dismiss after 5 seconds
        timerId = setTimeout(() => {
          setActiveEvent(null);
          timerId = null;
        }, 5000);
      } catch (err) {
        console.error("Failed to parse SSE live activity event", err);
      }
    });

    eventSource.addEventListener("connected", (event) => {
      console.log("SSE connection established successfully.");
    });

    eventSource.onerror = (err) => {
      console.warn("SSE connection error, retrying...", err);
    };

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
      eventSource.close();
    };
  }, []);

  const getEventText = (evt) => {
    switch (evt.type) {
      case "PURCHASE":
        return (
          <span className="text-xs text-swift-dark font-medium leading-relaxed">
            🛍️ <span className="font-extrabold text-swift-orange">{evt.username}</span> from{" "}
            <span className="font-bold text-swift-dark">{evt.city}</span> just bought{" "}
            <span className="font-bold text-swift-blue">{evt.productName}</span>!
          </span>
        );
      case "VIEW":
      default:
        return (
          <span className="text-xs text-swift-dark font-medium leading-relaxed">
            🔥 <span className="font-extrabold text-swift-orange">{evt.username}</span> from{" "}
            <span className="font-bold text-swift-dark">{evt.city}</span> is viewing{" "}
            <span className="font-bold text-swift-blue">{evt.productName}</span> right now.
          </span>
        );
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] pointer-events-none">
      <AnimatePresence>
        {activeEvent && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="pointer-events-auto bg-white border border-gray-150 rounded-card px-4 py-3 shadow-modal flex items-center gap-3 max-w-sm"
          >
            <div className={`p-2 rounded-full shrink-0 ${
              activeEvent.type === "PURCHASE" 
                ? "bg-swift-green/10 text-swift-green" 
                : "bg-swift-orange/10 text-swift-orange"
            }`}>
              {activeEvent.type === "PURCHASE" ? (
                <ShoppingBag className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </div>

            <div className="flex-grow text-left">
              {getEventText(activeEvent)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
