import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  User,
  Calendar,
  Box,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const getStatusBadgeColor = (status) => {
  if (!status) return "bg-gray-100 text-gray-700";
  const clean = status.toUpperCase();
  switch (clean) {
    case "DELIVERED":
      return "bg-green-50 text-swift-green border-swift-green/20";
    case "CANCELLED":
      return "bg-red-50 text-swift-red border-swift-red/20";
    case "SHIPPED":
    case "DISPATCHED":
    case "OUT_FOR_DELIVERY":
      return "bg-amber-50 text-swift-orange border-swift-orange/20";
    case "CONFIRMED":
    case "PLACED":
    case "PENDING":
    default:
      return "bg-blue-50 text-swift-blue border-swift-blue/20";
  }
};

const getActionLabel = (url) => {
  if (url.includes("login")) return "Login to Account";
  if (url.includes("returns")) return "View Returns Policy";
  if (url.includes("dashboard")) return "Go to Dashboard";
  return "View Details";
};

export const ChatMessage = ({ message }) => {
  const navigate = useNavigate();
  const isBot = message.sender === "bot";

  return (
    <div
      className={`flex w-full mb-4 px-4 items-start gap-2.5 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-swift-blue/10 flex items-center justify-center text-swift-blue">
          <Bot size={16} />
        </div>
      )}

      {/* Message Bubble Column */}
      <div
        className={`flex flex-col max-w-[75%] gap-1 ${!isBot ? "items-end" : "items-start"}`}
      >
        {/* Simple Text Bubble */}
        {message.text && (
          <div
            className={`px-4 py-2.5 text-sm rounded-2xl shadow-card leading-relaxed ${
              isBot
                ? "bg-white text-swift-dark border border-gray-100 rounded-tl-none"
                : "bg-swift-blue text-white rounded-tr-none"
            }`}
          >
            <p className="whitespace-pre-line">{message.text}</p>
          </div>
        )}

        {/* Custom Order Card (type === 'order_card') */}
        {isBot && message.type === "order_card" && message.order && (
          <div className="w-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-card p-3 flex flex-col gap-2">
            <div className="flex items-start gap-3">
              {message.order.productThumbnailUrl ? (
                <img
                  src={message.order.productThumbnailUrl}
                  alt={message.order.productName}
                  className="w-12 h-12 object-cover rounded-md border border-gray-100"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center text-gray-400">
                  <Box size={20} />
                </div>
              )}
              <div className="flex-grow min-w-0">
                <p className="text-xs font-semibold text-swift-dark truncate">
                  {message.order.productName || "Product Info"}
                </p>
                <p className="text-[10px] text-swift-mid mt-0.5">
                  ID: #{message.order.orderId.substring(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(message.order.status)}`}
              >
                {message.order.status}
              </span>

              {message.order.estimatedDelivery && (
                <span className="text-[10px] text-swift-mid flex items-center gap-1">
                  <Calendar size={10} /> {message.order.estimatedDelivery}
                </span>
              )}
            </div>

            <button
              onClick={() =>
                navigate(`/orders/track/${message.order?.orderId}`)
              }
              className="w-full mt-1.5 py-1.5 bg-swift-blue hover:bg-swift-blue-dark text-white text-xs font-semibold rounded-button flex items-center justify-center gap-1 transition-colors duration-200"
            >
              Track Order <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* RAG Product Recommendation Cards */}
        {isBot && message.recommendedProducts && message.recommendedProducts.length > 0 && (
          <div className="w-full mt-2 flex flex-col gap-2">
            {message.recommendedProducts.map((prod) => (
              <div
                key={prod.id || prod.slug}
                onClick={() => navigate(`/product/${prod.slug || prod.id}`)}
                className="group cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-swift-blue/50 hover:shadow-md p-2.5 flex items-start gap-2.5 transition-all duration-200"
              >
                {prod.imageUrl ? (
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-100 group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                    <Box size={18} />
                  </div>
                )}

                <div className="flex-grow min-w-0">
                  <p className="text-xs font-semibold text-swift-dark truncate group-hover:text-swift-blue transition-colors">
                    {prod.name}
                  </p>
                  {prod.brand && (
                    <p className="text-[10px] text-swift-mid">{prod.brand}</p>
                  )}
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-bold text-swift-dark">
                      ₹{prod.price?.toLocaleString()}
                    </span>
                    {prod.mrp && prod.mrp > prod.price && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ₹{prod.mrp?.toLocaleString()}
                      </span>
                    )}
                    {prod.averageRating > 0 && (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        ⭐ {prod.averageRating}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-gray-100">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      prod.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                    }`}>
                      {prod.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                    <span className="text-[10px] text-swift-blue font-semibold flex items-center gap-0.5 group-hover:underline">
                      View Item <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button Redirects */}
        {isBot && message.actionUrl && (
          <Link
            to={message.actionUrl}
            className="mt-1.5 inline-flex items-center gap-1 px-3.5 py-1.5 bg-swift-orange hover:bg-swift-orange/90 text-white text-xs font-bold rounded-button shadow-sm transition-colors duration-200"
          >
            {getActionLabel(message.actionUrl)}
            <ExternalLink size={12} />
          </Link>
        )}
      </div>

      {/* User Avatar */}
      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-swift-orange/10 flex items-center justify-center text-swift-orange">
          <User size={16} />
        </div>
      )}
    </div>
  );
};
