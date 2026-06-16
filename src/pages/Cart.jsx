import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Heart,
  ShieldCheck,
  Ticket,
  ArrowRight,
  MapPin,
  ShoppingBag,
  Minus,
  Plus,
  X,
} from "lucide-react";
import {
  useCartStore,
  useToastStore,
  useWishlistStore,
  useAuthStore,
} from "../store/useSwiftStore";
import { mockDb } from "../data/mockDb";
import { ProductCard, FALLBACK_IMAGE } from "../components/ProductCard";

export const Cart = () => {
  const navigate = useNavigate();

  const {
    cart,
    updateQuantity,
    removeFromCart,
    coupon,
    applyCoupon,
    removeCoupon,
    getTotals,
    selectedAddressId,
    setSelectedAddressId,
  } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToast } = useToastStore();
  const { isLoggedIn, addresses } = useAuthStore();

  const [couponInput, setCouponInput] = useState("");
  const [showCouponFocus, setShowCouponFocus] = useState(false);

  const totals = getTotals();
  const availableCoupons = mockDb.getCoupons();

  const handleCouponApply = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = await applyCoupon(couponInput);
    if (res.success) {
      addToast(res.message, "success");
      setCouponInput("");
      setShowCouponFocus(false);
    } else {
      addToast(res.message, "error");
    }
  };

  const handleSaveForLater = (productId, cartItemId) => {
    const prod = mockDb.getProductById(productId);
    if (!prod) return;

    if (!isInWishlist(productId)) {
      toggleWishlist(prod);
    }
    removeFromCart(cartItemId);
    addToast(`${prod.name} saved for later (moved to Wishlist)`, "success");
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      addToast("Your cart is empty", "warning");
      return;
    }
    if (!isLoggedIn) {
      addToast("Please login to place an order", "warning");
      navigate("/login?redirect=checkout");
      return;
    }
    navigate("/checkout");
  };

  // Recommendations: Get other products
  const recommendations = mockDb.getProducts().slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-20">
      <h2 className="font-heading font-extrabold text-2xl text-swift-dark mb-6">
        Shopping Cart
      </h2>

      {cart.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-card p-12 text-center max-w-xl mx-auto space-y-4 shadow-card">
          <div className="w-16 h-16 bg-swift-bg rounded-full text-swift-mid flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-swift-dark">
              Your Shopping Cart is Empty
            </h3>
            <p className="text-xs text-swift-mid mt-1">
              Explore daily deals and add products to start shopping.
            </p>
          </div>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-sm shadow-sm transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items List (65% width) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Address Selector subhead */}
            {isLoggedIn && addresses.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-card p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-swift-blue shrink-0" />
                  <div className="text-left">
                    <span className="text-xs font-extrabold text-swift-dark uppercase tracking-wider block">
                      Deliver to:
                    </span>
                    <span className="text-xs text-swift-mid">
                      {addresses.find((a) => a.id === selectedAddressId)
                        ?.name || "Default Address"}{" "}
                      -{" "}
                      {
                        addresses.find((a) => a.id === selectedAddressId)
                          ?.addressLine1
                      }
                      ,{" "}
                      {addresses.find((a) => a.id === selectedAddressId)?.city}
                    </span>
                  </div>
                </div>
                <select
                  value={selectedAddressId || ""}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-button text-xs font-bold text-swift-dark focus:ring-0 focus:outline-none"
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.type}: {a.name} ({a.pincode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Items Cards */}
            <div className="space-y-4">
              {cart.map((item) => {
                const isSaved = isInWishlist(item.product.id);
                return (
                  <div
                    key={item.cartItemId}
                    className="bg-white border border-gray-100 rounded-card p-4 shadow-card flex flex-col sm:flex-row gap-4 relative group"
                  >
                    {/* Image */}
                    <img
                      src={item.product.images[0] || FALLBACK_IMAGE}
                      alt={item.product.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-button border border-gray-100 bg-gray-50 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    {/* Details Info */}
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-heading font-extrabold text-base text-swift-dark hover:text-swift-orange transition-colors">
                            <Link
                              to={`/product/${item.product.slug || item.product.id}`}
                            >
                              {item.product.name}
                            </Link>
                          </h4>
                          <span className="font-mono font-extrabold text-base text-swift-dark shrink-0">
                            ₹
                            {(
                              item.product.price * item.quantity
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-xs text-swift-mid mt-0.5">
                          Sold by:{" "}
                          {mockDb.getSellerById(item.product.sellerId)?.name ||
                            "SwiftCart"}
                        </p>

                        {/* Selected Variants */}
                        {Object.keys(item.selectedVariant).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {Object.entries(item.selectedVariant).map(
                              ([k, v]) => (
                                <span
                                  key={k}
                                  className="inline-block bg-swift-bg text-[10px] font-bold text-swift-blue border border-swift-blue/15 px-2 py-0.5 rounded-pill"
                                >
                                  {k}: {v}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper & Save & Delete */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          {/* Stepper */}
                          <div className="flex items-center border border-gray-250 rounded-button bg-white">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemId,
                                  item.quantity - 1,
                                )
                              }
                              className="p-1.5 hover:bg-gray-50 text-swift-mid rounded-l-button"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-4 text-xs font-bold text-swift-dark text-center min-w-[20px]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemId,
                                  item.quantity + 1,
                                )
                              }
                              className="p-1.5 hover:bg-gray-50 text-swift-mid rounded-r-button"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-[10px] text-swift-mid">
                            ₹{item.product.price} / item
                          </span>
                        </div>

                        {/* Save & Delete Links */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleSaveForLater(
                                item.product.id,
                                item.cartItemId,
                              )
                            }
                            className="text-xs font-bold text-swift-blue hover:text-swift-orange hover:underline flex items-center gap-1 transition-colors"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${isSaved ? "fill-swift-blue" : ""}`}
                            />
                            <span>Save for later</span>
                          </button>

                          <button
                            onClick={() => {
                              removeFromCart(item.cartItemId);
                              addToast(
                                `${item.product.name} removed from cart`,
                                "info",
                              );
                            }}
                            className="text-xs font-bold text-swift-red hover:underline flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary (35% width, sticky) */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            {/* Promo code area */}
            <div className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <span className="block text-xs font-bold text-swift-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-swift-orange" />
                <span>Apply Promo Coupon</span>
              </span>

              {coupon ? (
                <div className="bg-swift-green/5 border border-swift-green/20 rounded-button p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-swift-green uppercase">
                      {coupon.code} Applied
                    </span>
                    <p className="text-[10px] text-swift-mid">
                      {coupon.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      removeCoupon();
                      addToast("Coupon code removed", "info");
                    }}
                    className="p-1 hover:bg-swift-green/10 text-swift-red rounded-full"
                    aria-label="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponApply} className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SWIFT10"
                      value={couponInput}
                      onChange={(e) =>
                        setCouponInput(e.target.value.toUpperCase())
                      }
                      onFocus={() => setShowCouponFocus(true)}
                      className="flex-grow px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange uppercase"
                    />

                    <button
                      type="submit"
                      className="px-4 py-2 bg-swift-blue hover:bg-swift-blue-dark text-white rounded-button font-bold text-xs shadow-sm transition-colors"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Dropdown list of coupons on focus */}
                  {showCouponFocus && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-card shadow-modal z-20 p-2 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-swift-mid uppercase tracking-wide border-b border-gray-50 pb-1.5">
                        <span>Available Coupons</span>
                        <button
                          type="button"
                          onClick={() => setShowCouponFocus(false)}
                          className="text-swift-red hover:underline"
                        >
                          Close
                        </button>
                      </div>
                      {availableCoupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={async () => {
                            setCouponInput(c.code);
                            const res = await applyCoupon(c.code);
                            if (res.success) {
                              addToast(res.message, "success");
                              setCouponInput("");
                              setShowCouponFocus(false);
                            } else {
                              addToast(res.message, "error");
                            }
                          }}
                          className="w-full text-left p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-100 flex flex-col transition-colors"
                        >
                          <span className="text-xs font-bold text-swift-blue uppercase">
                            {c.code}
                          </span>
                          <span className="text-[10px] text-swift-mid">
                            {c.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Calculations Card */}
            <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-swift-dark uppercase tracking-wider border-b border-gray-50 pb-2">
                Payment Details
              </h3>

              <div className="space-y-2 text-xs font-bold text-swift-mid">
                <div className="flex justify-between">
                  <span>Price Total (MRP)</span>
                  <span className="font-mono text-swift-dark">
                    ₹
                    {cart
                      .reduce(
                        (sum, item) => sum + item.product.mrp * item.quantity,
                        0,
                      )
                      .toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-swift-green">
                  <span>Discount on MRP</span>
                  <span className="font-mono">
                    -₹
                    {(
                      cart.reduce(
                        (sum, item) => sum + item.product.mrp * item.quantity,
                        0,
                      ) - totals.subtotal
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-swift-green">
                    <span>Coupon Promo Discount</span>
                    <span className="font-mono">
                      -₹{totals.discount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-mono text-swift-dark">
                    {totals.deliveryCharge === 0 ? (
                      <span className="text-swift-green">FREE</span>
                    ) : (
                      `₹${totals.deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-mono text-swift-dark">₹10</span>
                </div>

                <hr className="border-gray-150 my-2" />

                <div className="flex justify-between text-base font-extrabold text-swift-dark">
                  <span>Total Amount</span>
                  <span className="font-mono text-swift-orange">
                    ₹{(totals.total + 10).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                className="w-full py-3.5 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors duration-200"
              >
                <span>Place Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secure checkout assurance */}
              <div className="flex justify-center items-center gap-2 pt-2 border-t border-gray-50 text-[10px] text-swift-mid font-bold">
                <ShieldCheck className="w-4 h-4 text-swift-green" />
                <span>100% Safe and Secure SwiftCart Gateways</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended list */}
      <section className="mt-16 space-y-6">
        <h3 className="font-heading font-extrabold text-lg text-swift-dark">
          Similar Products You Might Like
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};
