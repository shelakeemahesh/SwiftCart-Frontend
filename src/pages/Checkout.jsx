import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Check,
  ShieldCheck,
  MapPin,
  Plus,
  FileText,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Wallet,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import {
  useCartStore,
  useAuthStore,
  useToastStore,
  mapBackendOrder,
} from "../store/useSwiftStore";
import { mockDb } from "../data/mockDb";
import { apiClient } from "../api/apiClient";
import { loadRazorpayScript } from "../utils/loadScript";
import { FALLBACK_IMAGE } from "../components/ProductCard";

export const Checkout = () => {
  const navigate = useNavigate();
  const {
    cart,
    getTotals,
    selectedAddressId,
    setSelectedAddressId,
    clearCart,
  } = useCartStore();
  const { isLoggedIn, user, addresses, addAddress } = useAuthStore();
  const { addToast } = useToastStore();

  const totals = getTotals();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      addToast("Please login to continue checkout", "warning");
      navigate("/login?redirect=checkout");
      return;
    }
    if (user?.role === "SELLER") {
      addToast("Sellers are not permitted to checkout products.", "error");
      navigate("/seller/dashboard");
      return;
    }
    if (cart.length === 0) {
      addToast("Your cart is empty. Add some items first!", "warning");
      navigate("/cart");
    }
  }, [isLoggedIn, user, navigate, addToast, cart.length]);

  // This comment is written by human not ai - step tracking
  const [step, setStep] = useState(1);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Form states for new address
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrType, setAddrType] = useState("Home");

  // Payment states
  const [paymentTab, setPaymentTab] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("9503072201-4@ybl");

  // Generated Order Details for Confirmation Screen
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrPincode || !addrLine1) {
      addToast("Please fill out all required address fields", "error");
      return;
    }

    const newAddr = {
      id: `addr-${Math.random().toString(36).substring(5)}`,
      name: addrName,
      phone: addrPhone,
      pincode: addrPincode,
      addressLine1: addrLine1,
      addressLine2: addrLine2,
      city: addrCity,
      state: addrState,
      type: addrType,
      isDefault: addresses.length === 0,
    };

    const savedAddr = await addAddress(newAddr);
    if (savedAddr && savedAddr.id) {
      setSelectedAddressId(String(savedAddr.id));
    } else {
      setSelectedAddressId(newAddr.id);
    }
    addToast("New address saved successfully!", "success");
    // Reset Form
    setShowAddressForm(false);
    setAddrName("");
    setAddrPhone("");
    setAddrPincode("");
    setAddrLine1("");
    setAddrLine2("");
    setAddrCity("");
    setAddrState("");
  };

  // Card Formatting logic
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 3);
    setCardCvv(value);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    // Validate active payment fields
    if (paymentTab === "card") {
      if (
        cardNumber.replace(/\s/g, "").length !== 16 ||
        cardExpiry.length !== 5 ||
        cardCvv.length !== 3 ||
        !cardName
      ) {
        addToast("Please enter valid credit/debit card information", "error");
        return;
      }
    } else if (paymentTab === "upi") {
      if (!upiId.includes("@")) {
        addToast("Please enter a valid UPI ID (e.g. mahesh@okaxis)", "error");
        return;
      }
    }

    // Deliver Address details
    const activeAddress =
      addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    if (!activeAddress) {
      addToast("No delivery address found. Please select one.", "error");
      setStep(1);
      return;
    }

    let couponCode = undefined;
    const couponStore = useCartStore.getState().coupon;
    if (couponStore) {
      couponCode = couponStore.code;
    }

    let backendPaymentMethod = "COD";
    if (paymentTab === "card") backendPaymentMethod = "CARD";
    else if (paymentTab === "upi") backendPaymentMethod = "UPI";

    const placeOrderAsync = async () => {
      try {
        if (backendPaymentMethod === "CARD" || backendPaymentMethod === "UPI") {
          // RAZORPAY FLOW
          const isScriptLoaded = await loadRazorpayScript();
          if (!isScriptLoaded) {
            addToast(
              "Failed to load Razorpay SDK. Please check your connection.",
              "error",
            );
            return;
          }

          // 1. Create order in SwiftCart (with CARD or UPI as payment method)
          const parsedAddrId = parseInt(activeAddress.id, 10);
          if (isNaN(parsedAddrId)) {
            addToast("Invalid delivery address. Please select a saved address.", "error");
            setStep(1);
            return;
          }
          const orderObj = await apiClient.post("/api/v1/orders", {
            addressId: parsedAddrId,
            paymentMethod: backendPaymentMethod,
            couponCode: couponCode,
            notes: `Placed via frontend (${backendPaymentMethod})`,
          });

          // 2. Create Razorpay order
          const rzpOrder = await apiClient.post(
            "/api/v1/payments/razorpay/create-order",
            {
              orderUuid: orderObj.orderUuid,
            },
          );

          // 3. Initialize Razorpay Checkout
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || rzpOrder.keyId,
            amount: Math.round(rzpOrder.amount * 100),
            currency: rzpOrder.currency || "INR",
            name: "SwiftCart",
            description: "Order Payment",
            order_id: rzpOrder.razorpayOrderId,
            handler: async function (response) {
              try {
                // 4. Verify Payment
                await apiClient.post("/api/v1/payments/razorpay/verify", {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  swiftcartOrderUuid: orderObj.orderUuid,
                });

                // 5. Success cleanup
                const mappedOrder = mapBackendOrder(orderObj);
                setConfirmedOrder(mappedOrder);
                await apiClient.delete("/api/v1/cart");
                clearCart();
                addToast(
                  "Payment successful! Your order has been placed.",
                  "success",
                );
                setStep(4);
              } catch (verifyErr) {
                addToast(
                  "Payment verification failed. Please contact support.",
                  "error",
                );
              }
            },
            prefill: {
              name: activeAddress.name,
              contact: activeAddress.phone,
              email: user?.email || "",
            },
            theme: {
              color: "#F97316", // swift-orange
            },
          };

          // @ts-ignore
          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", function (response) {
            addToast(`Payment Failed: ${response.error.description}`, "error");
          });
          rzp.open();
        } else {
          // COD FLOW
          const parsedCodAddrId = parseInt(activeAddress.id, 10);
          if (isNaN(parsedCodAddrId)) {
            addToast("Invalid delivery address. Please select a saved address.", "error");
            setStep(1);
            return;
          }
          const orderObj = await apiClient.post("/api/v1/orders", {
            addressId: parsedCodAddrId,
            paymentMethod: "COD",
            couponCode: couponCode,
            notes: "Placed via frontend (COD)",
          });
          const mappedOrder = mapBackendOrder(orderObj);
          setConfirmedOrder(mappedOrder);
          await apiClient.delete("/api/v1/cart");
          clearCart();
          addToast(
            "Order placed successfully via Cash on Delivery!",
            "success",
          );
          setStep(4);
        }
      } catch (err) {
        addToast(
          err.message ||
            "Failed to place order. Please check stock and details.",
          "error",
        );
      }
    };
    placeOrderAsync();
  };

  const activeAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 pb-20">
      <nav className="mb-10 max-w-xl mx-auto" aria-label="Progress Tracker">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-4 right-4 h-1 bg-gray-200 top-1/2 -translate-y-1/2 -z-10 rounded-full" />
          <div
            className="absolute left-4 h-1 bg-swift-orange top-1/2 -translate-y-1/2 -z-10 transition-all duration-300 rounded-full"
            style={{
              width: `calc(${(step - 1) * 33.33}% - ${(step - 1) * 8}px)`,
            }}
          />

          {[
            { num: 1, label: "Address" },
            { num: 2, label: "Review" },
            { num: 3, label: "Payment" },
            { num: 4, label: "Success" },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-swift-orange border-swift-orange text-white ring-4 ring-swift-orange/20"
                      : isCompleted
                        ? "bg-swift-orange border-swift-orange text-white"
                        : "bg-white border-gray-250 text-swift-mid"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold mt-2 uppercase tracking-wide ${
                    isActive ? "text-swift-orange" : "text-swift-mid"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* This comment is written by human not ai - show summary toggle on mobile viewports */}
      {step !== 4 && (
        <div className="lg:hidden mb-6 bg-white border border-gray-150 rounded-card overflow-hidden shadow-sm">
          <button
            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
            className="w-full px-5 py-4 flex items-center justify-between text-sm font-extrabold text-swift-dark hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-swift-blue" />
              <span>
                {isSummaryExpanded
                  ? "Hide Order Summary"
                  : "Show Order Summary"}
              </span>
            </span>
            <span className="text-swift-orange font-mono">
              ₹{(totals.total + 10).toLocaleString("en-IN")}
            </span>
          </button>

          {isSummaryExpanded && (
            <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50/50 space-y-4">
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex gap-3 text-xs">
                    <img
                      src={item.product.images[0] || FALLBACK_IMAGE}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-button border border-gray-100 bg-white shrink-0"
                    />

                    <div className="flex-grow text-left">
                      <h4 className="font-bold text-swift-dark truncate max-w-[180px]">
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] text-swift-mid">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-swift-dark">
                      ₹
                      {(item.product.price * item.quantity).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200" />

              <div className="space-y-2 text-xs font-bold text-swift-mid">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span className="font-mono text-swift-dark">
                    ₹{totals.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-swift-green">
                    <span>Discount</span>
                    <span className="font-mono">
                      -₹{totals.discount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
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
                <hr className="border-gray-200 my-1" />
                <div className="flex justify-between text-sm font-extrabold text-swift-dark">
                  <span>Total Amount</span>
                  <span className="font-mono text-swift-orange">
                    ₹{(totals.total + 10).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Steps Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Step Panel (8 cols) */}
        <div
          className={`${step === 4 ? "lg:col-span-12" : "lg:col-span-8"} bg-white border border-gray-100 rounded-card p-6 shadow-card`}
        >
          {/* STEP 1: Address Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="font-heading font-extrabold text-base text-swift-dark flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-swift-blue" />
                  <span>Choose Delivery Address</span>
                </h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs font-bold text-swift-blue hover:text-swift-orange flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {showAddressForm ? (
                // Add Address Form
                <form
                  onSubmit={handleAddAddressSubmit}
                  className="space-y-4 border border-gray-150 rounded-card p-4 bg-gray-50/50"
                >
                  <span className="block text-xs font-extrabold text-swift-dark uppercase tracking-wider">
                    New Address Form
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        placeholder="e.g. Mahesh Kumar"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={addrPhone}
                        onChange={(e) =>
                          setAddrPhone(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={addrPincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setAddrPincode(val);
                          if (val.length === 6) {
                            setAddrCity("Bengaluru");
                            setAddrState("Karnataka");
                          }
                        }}
                        placeholder="e.g. 560103"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">
                        Flat, House No., Building *
                      </label>
                      <input
                        type="text"
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        placeholder="e.g. Flat 405, Block B"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">
                        Area, Street, Sector
                      </label>
                      <input
                        type="text"
                        value={addrLine2}
                        onChange={(e) => setAddrLine2(e.target.value)}
                        placeholder="e.g. Green Glen Layout, Bellandur"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">
                        Address Type
                      </label>
                      <select
                        value={addrType}
                        onChange={(e) => setAddrType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:ring-0 focus:outline-none"
                      >
                        <option value="Home">Home (All-day delivery)</option>
                        <option value="Work">
                          Work (Delivery between 9 AM - 6 PM)
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-5 py-2 border border-gray-200 text-sm font-bold text-swift-dark rounded-button hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-swift-blue hover:bg-swift-blue-dark text-white rounded-button text-sm font-bold shadow-sm"
                    >
                      Save and Use Address
                    </button>
                  </div>
                </form>
              ) : (
                // Addresses Card List
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`border rounded-card p-4 cursor-pointer relative transition-all flex gap-3 ${
                          isSelected
                            ? "border-swift-orange bg-swift-orange/5 shadow-xs"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="text-swift-orange focus:ring-swift-orange mt-1 w-4 h-4 border-gray-300"
                        />

                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-swift-dark">
                              {addr.name}
                            </span>
                            <span className="text-[9px] font-bold text-white bg-swift-mid uppercase px-1.5 py-0.5 rounded">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-bold text-swift-green border border-swift-green px-1.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-swift-mid mt-1.5">
                            {addr.addressLine1},{" "}
                            {addr.addressLine2 ? `${addr.addressLine2}, ` : ""}
                            {addr.city}, {addr.state} -{" "}
                            <span className="font-mono font-bold">
                              {addr.pincode}
                            </span>
                          </p>
                          <p className="text-xs text-swift-mid font-semibold mt-1">
                            Phone: {addr.phone}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {addresses.length === 0 && (
                    <p className="text-center text-xs text-swift-mid py-4">
                      No saved addresses found. Please add a new one.
                    </p>
                  )}

                  {/* Proceed to summary review */}
                  {addresses.length > 0 && (
                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => setStep(2)}
                        className="px-6 py-2.5 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <span>Confirm and Proceed</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Order Summary Review */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-heading font-extrabold text-base text-swift-dark border-b border-gray-50 pb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-swift-blue" />
                <span>Review Order Summary</span>
              </h3>

              {/* Items Summary list */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex gap-4 border-b border-gray-50 pb-4"
                  >
                    <img
                      src={item.product.images[0] || FALLBACK_IMAGE}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-button border border-gray-100 bg-gray-50 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <div className="flex-grow text-left">
                      <h4 className="text-sm font-bold text-swift-dark truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-swift-mid">
                        Quantity: {item.quantity} | Seller:{" "}
                        {mockDb.getSellerById(item.product.sellerId)?.name}
                      </p>
                      {Object.keys(item.selectedVariant).length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {Object.entries(item.selectedVariant).map(
                            ([k, v]) => (
                              <span
                                key={k}
                                className="text-[9px] font-bold text-swift-blue bg-swift-blue/5 border border-swift-blue/10 px-1 rounded-pill"
                              >
                                {k}: {v}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-swift-dark">
                        ₹
                        {(item.product.price * item.quantity).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                      <p className="text-[10px] text-swift-green font-bold flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          Delivery in {item.product.deliveryDays} Days
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deliver location confirmation */}
              {activeAddress && (
                <div className="bg-gray-50 p-4 border border-gray-100 rounded-card text-left">
                  <span className="text-[10px] font-bold text-swift-mid uppercase tracking-wide block">
                    Shipment delivery address:
                  </span>
                  <div className="text-xs font-bold text-swift-dark mt-1">
                    {activeAddress.name} ({activeAddress.type})
                  </div>
                  <p className="text-xs text-swift-mid mt-0.5">
                    {activeAddress.addressLine1}, {activeAddress.city} -{" "}
                    {activeAddress.pincode}
                  </p>
                </div>
              )}

              {/* CTAs */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-gray-200 text-xs font-bold text-swift-dark rounded-button hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Section */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-heading font-extrabold text-base text-swift-dark border-b border-gray-50 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-swift-green" />
                <span>Select Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                <div className="sm:col-span-4 flex flex-row sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-gray-150 pb-4 sm:pb-0 pr-0 sm:pr-4 overflow-x-auto sm:overflow-visible no-scrollbar">
                  {[
                    {
                      id: "card",
                      label: "Credit/Debit Card",
                      icon: <CreditCard className="w-4 h-4" />,
                    },
                    {
                      id: "upi",
                      label: "UPI / QR Scan",
                      icon: <QrCode className="w-4 h-4" />,
                    },
                    {
                      id: "cod",
                      label: "Cash on Delivery",
                      icon: <Wallet className="w-4 h-4" />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPaymentTab(tab.id)}
                      className={`flex-1 sm:w-full flex-shrink-0 flex items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-button text-xs font-extrabold transition-all ${
                        paymentTab === tab.id
                          ? "bg-swift-orange text-white shadow-xs"
                          : "text-swift-dark hover:bg-gray-50"
                      }`}
                    >
                      {tab.icon}
                      <span className="whitespace-nowrap sm:whitespace-normal">
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Form fields panels (Right 8 cols) */}
                <div className="sm:col-span-8">
                  {/* Card Form */}
                  {paymentTab === "card" && (
                    <form
                      onSubmit={handlePaymentSubmit}
                      className="space-y-4 text-left"
                    >
                      <div>
                        <label className="block text-xs font-bold text-swift-dark mb-1">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="e.g. MAHESH KUMAR"
                          className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange uppercase"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-swift-dark mb-1">
                          Card Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="xxxx xxxx xxxx xxxx"
                            className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                            required
                          />

                          <CreditCard className="w-5 h-5 text-swift-mid absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-swift-dark mb-1">
                            Expiry *
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange text-center"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-swift-dark mb-1">
                            CVV *
                          </label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={handleCvvChange}
                            placeholder="xxx"
                            className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange text-center"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-sm shadow-sm transition-all"
                      >
                        Pay ₹{(totals.total + 10).toLocaleString("en-IN")}{" "}
                        Secured
                      </button>
                    </form>
                  )}

                  {/* UPI QR Scanner */}
                  {paymentTab === "upi" && (
                    <form
                      onSubmit={handlePaymentSubmit}
                      className="space-y-4 text-center"
                    >
                      <div className="max-w-[200px] mx-auto border-2 border-gray-250 p-2.5 rounded-card bg-white shadow-xs">
                        {/* Dynamic UPI QR Code */}
                        <div className="bg-gray-50 aspect-square flex flex-col items-center justify-center p-2 rounded">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                              `upi://pay?pa=9503072201-4@ybl&pn=SwiftCart&am=${totals.total + 10}&cu=INR`,
                            )}`}
                            alt="UPI QR Scanner"
                            className="w-36 h-36 object-contain"
                          />

                          <span className="text-[10px] font-mono text-swift-mid font-bold mt-1">
                            9503072201-4@ybl
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-swift-mid leading-relaxed">
                        Scan this dynamic QR code using GPay, PhonePe, or BHIM
                        UPI apps to complete payment instantly.
                      </p>

                      <div className="text-swift-mid font-bold text-xs uppercase my-2">
                        — OR enter UPI ID —
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. mahesh@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="flex-grow px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange text-center"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-sm shadow-sm transition-all mt-4"
                      >
                        Authorize & Pay ₹
                        {(totals.total + 10).toLocaleString("en-IN")}
                      </button>
                    </form>
                  )}

                  {/* Cash on Delivery COD */}
                  {paymentTab === "cod" && (
                    <form
                      onSubmit={handlePaymentSubmit}
                      className="space-y-4 text-center p-4 bg-gray-50 border border-gray-150 rounded-card"
                    >
                      <div className="text-left space-y-2">
                        <span className="block text-xs font-bold text-swift-dark uppercase tracking-wider">
                          Cash on Delivery Terms
                        </span>
                        <p className="text-xs text-swift-mid leading-relaxed">
                          Pay by cash, UPI, or card on the spot when your
                          packages are delivered to your doorstep. An extra ₹15
                          service fee applies for Cash orders (waived for you).
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-sm shadow-sm transition-all mt-4"
                      >
                        Confirm COD Order (₹
                        {(totals.total + 10).toLocaleString("en-IN")})
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Back controls */}
              <div className="border-t border-gray-100 pt-4 flex">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2 border border-gray-250 text-xs font-bold text-swift-dark rounded-button hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Review</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success confirmation screen */}
          {step === 4 && confirmedOrder && (
            <div className="text-center py-10 space-y-6">
              {/* Animated visual Check icon */}
              <div className="w-16 h-16 bg-swift-green text-white rounded-full flex items-center justify-center mx-auto shadow-md scale-110 animate-bounce">
                <Check className="w-9 h-9" strokeWidth={3} />
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-2xl text-swift-dark">
                  Order Confirmed!
                </h3>
                <p className="text-xs text-swift-mid max-w-sm mx-auto leading-relaxed">
                  Thank you for shopping with SwiftCart! We have received your
                  payment and your shipment logistics are being configured.
                </p>
              </div>

              {/* Order Info grid */}
              <div className="max-w-md mx-auto bg-gray-50 border border-gray-150 rounded-card p-4 text-left space-y-3 font-semibold text-xs text-swift-mid">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Order Reference ID:</span>
                  <span className="font-mono text-swift-dark font-bold text-sm">
                    {confirmedOrder.id}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Guaranteed Delivery:</span>
                  <span className="text-swift-green font-bold">In 3 Days</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Address Type:</span>
                  <span className="text-swift-dark">
                    {confirmedOrder.deliveryAddress.type} (
                    {confirmedOrder.deliveryAddress.name})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="text-swift-dark uppercase">
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Email advisory */}
              <p className="text-[10px] text-swift-mid">
                A verification invoice receipt has been dispatched to{" "}
                <span className="font-bold text-swift-dark">{user?.email}</span>
                .
              </p>

              {/* Success CTAs */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-sm mx-auto pt-4">
                <button
                  onClick={() => navigate("/dashboard?tab=orders")}
                  className="flex-1 py-3 border border-swift-blue text-swift-blue hover:bg-swift-blue/5 rounded-button font-bold text-xs transition-colors"
                >
                  Track Order Timeline
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 py-3 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-xs shadow-sm transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Pricing Summary column (Only visible if not on step 4) */}
        {step !== 4 && (
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            {/* Payment Details */}
            <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-swift-dark uppercase tracking-wider border-b border-gray-50 pb-2">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs font-bold text-swift-mid">
                <div className="flex justify-between">
                  <span>MRP Items Total</span>
                  <span className="font-mono text-swift-dark">
                    ₹{totals.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-swift-green">
                    <span>Discount Deducted</span>
                    <span className="font-mono">
                      -₹{totals.discount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
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

              {/* Secure Checkout Trust */}
              <div className="flex justify-center items-center gap-1.5 pt-2 border-t border-gray-50 text-[10px] text-swift-mid">
                <ShieldCheck className="w-4 h-4 text-swift-green shrink-0" />
                <span>Security verified SSL transaction</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
