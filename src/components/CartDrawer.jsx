import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore, useToastStore } from "../store/useSwiftStore";
import { mockDb } from "../data/mockDb";
import { FALLBACK_IMAGE } from "./ProductCard";

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    isCartOpen,
    cart,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    getTotals,
  } = useCartStore();
  const { addToast } = useToastStore();

  const containerRef = useRef(null);
  const totals = getTotals();

  // Click outside to close drawer
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isCartOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCartOpen, setCartOpen]);

  // Disable body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const handleCheckoutClick = () => {
    setCartOpen(false);
    if (cart.length === 0) {
      addToast("Your cart is empty", "warning");
      return;
    }
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-50 pointer-events-auto"
          />

          {/* Drawer Container */}
          <motion.div
            ref={containerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-modal z-50 flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-swift-orange" />
                <h3 className="font-heading font-extrabold text-lg text-swift-dark">
                  Shopping Drawer
                </h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 text-gray-400 hover:text-swift-dark hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="bg-swift-bg p-6 rounded-full text-swift-mid">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-swift-dark">
                      Your cart is empty
                    </h4>
                    <p className="text-xs text-swift-mid mt-1">
                      Add items to get started on your shopping journey.
                    </p>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-swift-blue hover:bg-swift-blue-dark rounded-button shadow-sm transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex gap-3 bg-gray-50/50 p-3 rounded-card border border-gray-100 relative group transition-all"
                  >
                    <img
                      src={item.product.images[0] || FALLBACK_IMAGE}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-button bg-white border border-gray-100 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <div className="flex-grow min-w-0 pr-6">
                      <h4 className="text-sm font-bold text-swift-dark truncate group-hover:text-swift-orange transition-colors">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-swift-mid mt-0.5">
                        Sold by:{" "}
                        {mockDb.getSellerById(item.product.sellerId)?.name ||
                          "SwiftCart"}
                      </p>

                      {Object.keys(item.selectedVariant).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.selectedVariant).map(
                            ([key, val]) => (
                              <span
                                key={key}
                                className="inline-block bg-white text-[10px] font-bold text-swift-blue border border-swift-blue/20 px-1.5 py-0.5 rounded-pill"
                              >
                                {key}: {val}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center bg-white border border-gray-200 rounded-button">
                          <button
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity - 1)
                            }
                            className="p-1 hover:bg-gray-50 text-swift-mid rounded-l-button"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-swift-dark min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity + 1)
                            }
                            className="p-1 hover:bg-gray-50 text-swift-mid rounded-r-button"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-swift-dark">
                            ₹
                            {(
                              item.product.price * item.quantity
                            ).toLocaleString("en-IN")}
                          </span>
                          {item.product.mrp > item.product.price && (
                            <div className="text-[10px] text-swift-mid line-through leading-none">
                              ₹
                              {(
                                item.product.mrp * item.quantity
                              ).toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        removeFromCart(item.cartItemId);
                        addToast(
                          `${item.product.name} removed from cart`,
                          "info"
                        );
                      }}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-swift-red hover:bg-red-50 rounded-full transition-all"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-swift-mid font-medium">
                    <span>Subtotal</span>
                    <span className="font-mono text-swift-dark">
                      ₹{totals.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-swift-green font-bold">
                      <span>Discount</span>
                      <span className="font-mono">
                        -₹{totals.discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-swift-mid font-medium">
                    <span>Shipping Charges</span>
                    <span className="font-mono text-swift-dark">
                      {totals.deliveryCharge === 0 ? (
                        <span className="text-swift-green font-bold">FREE</span>
                      ) : (
                        `₹${totals.deliveryCharge}`
                      )}
                    </span>
                  </div>
                  <hr className="border-gray-200/80 my-2" />
                  <div className="flex justify-between text-base font-extrabold text-swift-dark">
                    <span>Total Amount</span>
                    <span className="font-mono text-swift-orange">
                      ₹{totals.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full py-3 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors duration-200"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
