import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Store,
  User,
  MapPin,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Package,
  TrendingUp,
  Headphones,
} from "lucide-react";
import { apiClient } from "../api/apiClient";
import { useAuthStore, useToastStore } from "../store/useSwiftStore";

const CONFETTI_PARTICLES = Array.from({ length: 40 }).map((_, i) => ({
  left: `${(i * 7.7 + 3) % 100}%`,
  top: `-${((i * 13 + 5) % 20) + 5}%`,
  width: `${((i * 3 + 6) % 10) + 6}px`,
  height: `${((i * 3 + 6) % 10) + 6}px`,
  backgroundColor: ["#EF9F27", "#185FA5", "#3B6D11", "#A32D2D", "#2C2C2A"][
    i % 5
  ],
  borderRadius: i % 2 === 0 ? "50%" : "2px",
  animationDelay: `${(i * 0.15) % 1.5}s`,
  animationDuration: `${((i * 0.25) % 3) + 2}s`,
  rotate: `${(i * 45) % 360}deg`,
}));

const STEP_META = [
  { label: "Business Details", icon: Store },
  { label: "Contact Info", icon: User },
  { label: "Pickup & Bank", icon: MapPin },
  { label: "Verification", icon: Shield },
];

const SELLING_BENEFITS = [
  {
    icon: Package,
    title: "45 Cr+ Customers",
    desc: "Sell to India's largest online marketplace audience",
  },
  {
    icon: TrendingUp,
    title: "7-Day Payments",
    desc: "Quick, hassle-free payment settlements every week",
  },
  {
    icon: Headphones,
    title: "24×7 Seller Support",
    desc: "Dedicated account manager & support for your store",
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    desc: "End-to-end secure transactions with buyer protection",
  },
];

const INITIAL_FORM = {
  businessName: "",
  gstin: "",
  panNumber: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  pickupAddress: "",
  pickupPincode: "",
  bankAccountNumber: "",
  ifscCode: "",
};

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                 */
/* ------------------------------------------------------------------ */
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function validateStep(step, data) {
  const e = {};

  if (step === 0) {
    if (!data.businessName.trim()) e.businessName = "Business name is required";
    if (!data.gstin.trim()) e.gstin = "GSTIN is required";
    else if (!GSTIN_RE.test(data.gstin.toUpperCase()))
      e.gstin = "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)";
    if (!data.panNumber.trim()) e.panNumber = "PAN is required";
    else if (!PAN_RE.test(data.panNumber.toUpperCase()))
      e.panNumber = "Invalid PAN format (e.g. ABCDE1234F)";
  }

  if (step === 1) {
    if (!data.fullName.trim()) e.fullName = "Full name is required";
    if (!data.email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(data.email))
      e.email = "Enter a valid email address";
    if (!data.phone.trim()) e.phone = "Phone is required";
    else if (data.phone.length !== 10)
      e.phone = "Enter a valid 10-digit phone number";
    if (!data.password) e.password = "Password is required";
    else if (data.password.length < 6)
      e.password = "Minimum 6 characters required";
    if (!data.confirmPassword) e.confirmPassword = "Confirm your password";
    else if (data.password !== data.confirmPassword)
      e.confirmPassword = "Passwords do not match";
  }

  if (step === 2) {
    if (!data.pickupAddress.trim())
      e.pickupAddress = "Pickup address is required";
    if (!data.pickupPincode.trim()) e.pickupPincode = "Pincode is required";
    else if (!/^\d{6}$/.test(data.pickupPincode))
      e.pickupPincode = "Enter a valid 6-digit pincode";
    if (!data.bankAccountNumber.trim())
      e.bankAccountNumber = "Account number is required";
    if (!data.ifscCode.trim()) e.ifscCode = "IFSC code is required";
    else if (!IFSC_RE.test(data.ifscCode.toUpperCase()))
      e.ifscCode = "Invalid IFSC format (e.g. SBIN0001234)";
  }

  return e;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export const SellerRegister = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { loginWithAuthData } = useAuthStore();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const touchedRef = useRef(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Slide direction for transition
  const [slideDir, setSlideDir] = useState("left");
  const [isAnimating, setIsAnimating] = useState(false);

  /* ---- OTP timer ---- */
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [otpTimer]);

  /* ---- Redirect on success after delay ---- */
  useEffect(() => {
    if (!isSuccess) return;
    const id = setTimeout(() => navigate("/login"), 4000);
    return () => clearTimeout(id);
  }, [isSuccess, navigate]);

  /* ---- Field change helper ---- */
  const handleChange = useCallback(
    (field) => (e) => {
      let value = e.target.value;

      // Auto-format
      if (field === "phone" || field === "pickupPincode")
        value = value.replace(/\D/g, "");
      if (field === "gstin" || field === "panNumber" || field === "ifscCode")
        value = value.toUpperCase();

      setForm((prev) => ({ ...prev, [field]: value }));

      // Clear error on change if field is touched
      if (touchedRef.current.has(field)) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [],
  );

  const handleBlur = useCallback(
    (field) => () => {
      touchedRef.current.add(field);
      const stepErrors = validateStep(step, form);
      if (stepErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: stepErrors[field] }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [step, form],
  );

  /* ---- Step navigation ---- */
  const goNext = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // Mark all fields as touched
      const fieldsPerStep = [
        ["businessName", "gstin", "panNumber"],
        ["fullName", "email", "phone", "password", "confirmPassword"],
        ["pickupAddress", "pickupPincode", "bankAccountNumber", "ifscCode"],
      ];
      const fields = fieldsPerStep[step] || [];
      fields.forEach((f) => touchedRef.current.add(f));
      return;
    }
    setSlideDir("left");
    setIsAnimating(true);
    setTimeout(() => {
      setStep((s) => Math.min(s + 1, 3));
      setIsAnimating(false);
    }, 300);
  };

  const goBack = () => {
    setSlideDir("right");
    setIsAnimating(true);
    setTimeout(() => {
      setStep((s) => Math.max(s - 1, 0));
      setIsAnimating(false);
    }, 300);
  };

  /* ---- Submit & OTP flow ---- */
  const handleRegister = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/api/v1/auth/register/seller", {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        businessName: form.businessName,
        gstin: form.gstin.toUpperCase(),
        panNumber: form.panNumber.toUpperCase(),
        pickupAddress: form.pickupAddress,
        pickupPincode: form.pickupPincode,
        bankAccountNumber: form.bankAccountNumber,
        ifscCode: form.ifscCode.toUpperCase(),
      });

      await apiClient.post(`/api/v1/auth/send-otp?phone=${form.phone}`);
      setOtpSent(true);
      setOtpTimer(60);
      addToast("OTP sent to your registered phone number", "success");
    } catch (err) {
      addToast(
        err.message || "Registration failed. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      addToast("Please enter a valid 6-digit OTP", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const authData = await apiClient.post("/api/v1/auth/verify-otp", {
        phone: form.phone,
        otp,
      });
      loginWithAuthData(authData);
      addToast("Seller account created successfully!", "success");
      setIsSuccess(true);
    } catch (err) {
      addToast(
        err.message || "OTP verification failed. Please retry.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    try {
      await apiClient.post(`/api/v1/auth/send-otp?phone=${form.phone}`);
      setOtpTimer(60);
      addToast("OTP resent successfully", "success");
    } catch (err) {
      addToast(err.message || "Failed to resend OTP", "error");
    }
  };

  /* ================================================================ */
  /*  Render helpers                                                   */
  /* ================================================================ */
  const inputCls = (field) =>
    `w-full px-4 py-2.5 border rounded-button text-sm font-sans transition-all duration-200 outline-none ${
      errors[field]
        ? "border-swift-red/60 bg-red-50/40 focus:border-swift-red focus:ring-1 focus:ring-swift-red/20"
        : "border-gray-200 bg-white focus:border-swift-blue focus:ring-1 focus:ring-swift-blue/20"
    }`;

  const labelCls = "block text-xs font-bold text-swift-dark mb-1.5";
  const errorCls = "flex items-center gap-1 text-[11px] text-swift-red mt-1";

  const renderError = (field) =>
    errors[field] ? (
      <p className={errorCls}>
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {errors[field]}
      </p>
    ) : null;

  /* ---- Success screen ---- */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-swift-bg flex items-center justify-center p-4">
        {/* Confetti particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {CONFETTI_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: p.left,
                top: p.top,
                width: p.width,
                height: p.height,
                backgroundColor: p.backgroundColor,
                borderRadius: p.borderRadius,
                animation: `confettiFall ${p.animationDuration} ease-in-out ${p.animationDelay} forwards`,
                transform: `rotate(${p.rotate})`,
              }}
            />
          ))}
        </div>

        <div className="bg-white rounded-modal shadow-modal p-10 text-center max-w-md w-full relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-swift-green/10 rounded-full flex items-center justify-center animate-pulse">
            <Check className="w-10 h-10 text-swift-green" strokeWidth={3} />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-swift-dark mb-2">
            Welcome to SwiftCart Seller Hub!
          </h2>
          <p className="text-sm text-swift-mid mb-6">
            Your seller account has been created successfully. You'll be
            redirected to login shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              id="seller-reg-go-login"
              className="px-6 py-2.5 bg-swift-blue text-white rounded-button text-sm font-bold hover:bg-swift-blue-dark transition-all"
            >
              Go to Login
            </Link>
            <Link
              to="/"
              id="seller-reg-go-home"
              className="px-6 py-2.5 border border-gray-200 text-swift-dark rounded-button text-sm font-bold hover:bg-gray-50 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Confetti keyframe */}
        <style>{`
          @keyframes confettiFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  /* ================================================================ */
  /*  Main layout                                                      */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-swift-bg flex flex-col lg:flex-row">
      {/* -------- LEFT: Branding Panel -------- */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] bg-gradient-to-br from-swift-blue via-[#1a4f8a] to-[#0c3a6b] text-white relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-10 w-40 h-40 rounded-full bg-white/[0.03]" />

        {/* Logo & heading */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-swift-orange rounded-card flex items-center justify-center shadow-lg">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight">
              SwiftCart
            </span>
          </Link>

          <h1 className="font-heading font-extrabold text-3xl xl:text-4xl leading-tight mb-4">
            Start Selling on
            <br />
            India's #1 Marketplace
          </h1>
          <p className="text-sm text-blue-200 leading-relaxed max-w-sm">
            Join millions of sellers growing their business on SwiftCart.
            Register in minutes, start selling today.
          </p>
        </div>

        {/* Benefits list */}
        <div className="relative z-10 space-y-5 mt-10">
          {SELLING_BENEFITS.map((b, i) => (
            <div key={i} className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-card bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <b.icon className="w-5 h-5 text-swift-orange" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm">{b.title}</h3>
                <p className="text-xs text-blue-200 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[10px] text-blue-300/60 mt-8">
          © 2026 SwiftCart Marketplace Pvt. Ltd. All rights reserved.
        </p>
      </div>

      {/* -------- RIGHT: Form Panel -------- */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile branding bar */}
        <div className="lg:hidden bg-swift-blue text-white px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-swift-orange rounded-button flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-extrabold text-lg">
            Seller Registration
          </span>
        </div>

        {/* Stepper */}
        <div className="px-5 sm:px-8 lg:px-12 xl:px-16 pt-8 lg:pt-10">
          <div className="max-w-xl mx-auto">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-2">
              {STEP_META.map((s, i) => {
                const StepIcon = s.icon;
                const isCompleted = i < step;
                const isCurrent = i === step;
                return (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center gap-1.5 relative">
                      <div
                        id={`seller-reg-step-${i}`}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                          isCompleted
                            ? "bg-swift-green text-white shadow-sm scale-100"
                            : isCurrent
                              ? "bg-swift-orange text-white shadow-md scale-110 ring-4 ring-swift-orange/20"
                              : "bg-gray-100 text-swift-mid"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" strokeWidth={3} />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold text-center hidden sm:block transition-colors duration-300 ${
                          isCurrent
                            ? "text-swift-dark"
                            : isCompleted
                              ? "text-swift-green"
                              : "text-swift-mid"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < STEP_META.length - 1 && (
                      <div className="flex-1 h-[2px] mx-2 sm:mx-3 mt-[-16px] sm:mt-[-22px] relative overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="absolute inset-y-0 left-0 bg-swift-green rounded-full transition-all duration-700 ease-out"
                          style={{ width: i < step ? "100%" : "0%" }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Step title */}
            <div className="mt-6 mb-6">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-swift-dark">
                {STEP_META[step].label}
              </h2>
              <p className="text-xs text-swift-mid mt-1">
                {step === 0 && "Enter your business registration details"}
                {step === 1 && "Set up your seller login credentials"}
                {step === 2 && "Configure pickup and payment details"}
                {step === 3 && "Review your information & verify phone"}
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="flex-1 px-5 sm:px-8 lg:px-12 xl:px-16 pb-8 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            <div className="bg-white border border-gray-100 rounded-card shadow-card p-6 sm:p-8 overflow-hidden">
              {/* Animated form container */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isAnimating
                    ? slideDir === "left"
                      ? "opacity-0 -translate-x-8"
                      : "opacity-0 translate-x-8"
                    : "opacity-100 translate-x-0"
                }`}
              >
                {/* ======== STEP 0: Business Details ======== */}
                {step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="seller-reg-business-name"
                        className={labelCls}
                      >
                        Business Name <span className="text-swift-red">*</span>
                      </label>
                      <input
                        id="seller-reg-business-name"
                        type="text"
                        placeholder="e.g. Rajesh Electronics Pvt Ltd"
                        value={form.businessName}
                        onChange={handleChange("businessName")}
                        onBlur={handleBlur("businessName")}
                        className={inputCls("businessName")}
                      />

                      {renderError("businessName")}
                    </div>

                    <div>
                      <label htmlFor="seller-reg-gstin" className={labelCls}>
                        GSTIN <span className="text-swift-red">*</span>
                      </label>
                      <input
                        id="seller-reg-gstin"
                        type="text"
                        maxLength={15}
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={form.gstin}
                        onChange={handleChange("gstin")}
                        onBlur={handleBlur("gstin")}
                        className={`${inputCls("gstin")} font-mono tracking-wide uppercase`}
                      />

                      {renderError("gstin")}
                      <p className="text-[10px] text-swift-mid mt-1">
                        15-character GST Identification Number
                      </p>
                    </div>

                    <div>
                      <label htmlFor="seller-reg-pan" className={labelCls}>
                        PAN Number <span className="text-swift-red">*</span>
                      </label>
                      <input
                        id="seller-reg-pan"
                        type="text"
                        maxLength={10}
                        placeholder="e.g. ABCDE1234F"
                        value={form.panNumber}
                        onChange={handleChange("panNumber")}
                        onBlur={handleBlur("panNumber")}
                        className={`${inputCls("panNumber")} font-mono tracking-wide uppercase`}
                      />

                      {renderError("panNumber")}
                    </div>
                  </div>
                )}

                {/* ======== STEP 1: Contact Info ======== */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="seller-reg-fullname" className={labelCls}>
                        Full Name <span className="text-swift-red">*</span>
                      </label>
                      <input
                        id="seller-reg-fullname"
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        value={form.fullName}
                        onChange={handleChange("fullName")}
                        onBlur={handleBlur("fullName")}
                        className={inputCls("fullName")}
                      />

                      {renderError("fullName")}
                    </div>

                    <div>
                      <label htmlFor="seller-reg-email" className={labelCls}>
                        Email Address <span className="text-swift-red">*</span>
                      </label>
                      <input
                        id="seller-reg-email"
                        type="email"
                        placeholder="e.g. rajesh@business.com"
                        value={form.email}
                        onChange={handleChange("email")}
                        onBlur={handleBlur("email")}
                        className={inputCls("email")}
                      />

                      {renderError("email")}
                    </div>

                    <div>
                      <label htmlFor="seller-reg-phone" className={labelCls}>
                        Phone Number <span className="text-swift-red">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-swift-mid font-semibold">
                          +91
                        </span>
                        <input
                          id="seller-reg-phone"
                          type="tel"
                          maxLength={10}
                          placeholder="98765 43210"
                          value={form.phone}
                          onChange={handleChange("phone")}
                          onBlur={handleBlur("phone")}
                          className={`${inputCls("phone")} pl-12 font-mono tracking-wide`}
                        />
                      </div>
                      {renderError("phone")}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="seller-reg-password"
                          className={labelCls}
                        >
                          Password <span className="text-swift-red">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="seller-reg-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min 6 characters"
                            value={form.password}
                            onChange={handleChange("password")}
                            onBlur={handleBlur("password")}
                            className={`${inputCls("password")} pr-10`}
                          />

                          <button
                            type="button"
                            id="seller-reg-toggle-password"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-swift-mid hover:text-swift-dark transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {renderError("password")}
                      </div>

                      <div>
                        <label
                          htmlFor="seller-reg-confirm-password"
                          className={labelCls}
                        >
                          Confirm Password{" "}
                          <span className="text-swift-red">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="seller-reg-confirm-password"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Re-enter password"
                            value={form.confirmPassword}
                            onChange={handleChange("confirmPassword")}
                            onBlur={handleBlur("confirmPassword")}
                            className={`${inputCls("confirmPassword")} pr-10`}
                          />

                          <button
                            type="button"
                            id="seller-reg-toggle-confirm"
                            onClick={() => setShowConfirm((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-swift-mid hover:text-swift-dark transition-colors"
                            tabIndex={-1}
                          >
                            {showConfirm ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {renderError("confirmPassword")}
                      </div>
                    </div>
                  </div>
                )}

                {/* ======== STEP 2: Pickup & Bank ======== */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="seller-reg-pickup-address"
                        className={labelCls}
                      >
                        Pickup Address <span className="text-swift-red">*</span>
                      </label>
                      <textarea
                        id="seller-reg-pickup-address"
                        rows={3}
                        placeholder="Full address including building, street, area, city, state"
                        value={form.pickupAddress}
                        onChange={handleChange("pickupAddress")}
                        onBlur={handleBlur("pickupAddress")}
                        className={`${inputCls("pickupAddress")} resize-none`}
                      />

                      {renderError("pickupAddress")}
                    </div>

                    <div>
                      <label htmlFor="seller-reg-pincode" className={labelCls}>
                        Pickup Pincode <span className="text-swift-red">*</span>
                      </label>
                      <input
                        id="seller-reg-pincode"
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 400001"
                        value={form.pickupPincode}
                        onChange={handleChange("pickupPincode")}
                        onBlur={handleBlur("pickupPincode")}
                        className={`${inputCls("pickupPincode")} font-mono tracking-wide`}
                      />

                      {renderError("pickupPincode")}
                    </div>

                    <div className="border-t border-gray-100 pt-5">
                      <h3 className="font-heading font-bold text-sm text-swift-dark mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-swift-blue/10 rounded-full flex items-center justify-center">
                          <Shield className="w-3.5 h-3.5 text-swift-blue" />
                        </div>
                        Bank Account Details
                      </h3>

                      <div className="space-y-5">
                        <div>
                          <label
                            htmlFor="seller-reg-bank-account"
                            className={labelCls}
                          >
                            Account Number{" "}
                            <span className="text-swift-red">*</span>
                          </label>
                          <input
                            id="seller-reg-bank-account"
                            type="text"
                            placeholder="e.g. 1234567890123456"
                            value={form.bankAccountNumber}
                            onChange={handleChange("bankAccountNumber")}
                            onBlur={handleBlur("bankAccountNumber")}
                            className={`${inputCls("bankAccountNumber")} font-mono tracking-wide`}
                          />

                          {renderError("bankAccountNumber")}
                        </div>

                        <div>
                          <label htmlFor="seller-reg-ifsc" className={labelCls}>
                            IFSC Code <span className="text-swift-red">*</span>
                          </label>
                          <input
                            id="seller-reg-ifsc"
                            type="text"
                            maxLength={11}
                            placeholder="e.g. SBIN0001234"
                            value={form.ifscCode}
                            onChange={handleChange("ifscCode")}
                            onBlur={handleBlur("ifscCode")}
                            className={`${inputCls("ifscCode")} font-mono tracking-wide uppercase`}
                          />

                          {renderError("ifscCode")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======== STEP 3: Verification ======== */}
                {step === 3 && (
                  <div className="space-y-6">
                    {/* Summary */}
                    {!otpSent ? (
                      <>
                        <div className="space-y-4">
                          <SummarySection
                            title="Business Details"
                            icon={
                              <Store className="w-4 h-4 text-swift-orange" />
                            }
                            items={[
                              {
                                label: "Business Name",
                                value: form.businessName,
                              },
                              { label: "GSTIN", value: form.gstin },
                              { label: "PAN", value: form.panNumber },
                            ]}
                          />

                          <SummarySection
                            title="Contact Information"
                            icon={<User className="w-4 h-4 text-swift-blue" />}
                            items={[
                              { label: "Name", value: form.fullName },
                              { label: "Email", value: form.email },
                              { label: "Phone", value: `+91 ${form.phone}` },
                            ]}
                          />

                          <SummarySection
                            title="Pickup & Bank"
                            icon={
                              <MapPin className="w-4 h-4 text-swift-green" />
                            }
                            items={[
                              {
                                label: "Pickup Address",
                                value: form.pickupAddress,
                              },
                              { label: "Pincode", value: form.pickupPincode },
                              {
                                label: "Account No.",
                                value: form.bankAccountNumber.replace(
                                  /.(?=.{4})/g,
                                  "•",
                                ),
                              },
                              { label: "IFSC", value: form.ifscCode },
                            ]}
                          />
                        </div>

                        <button
                          id="seller-reg-submit"
                          type="button"
                          onClick={handleRegister}
                          disabled={isSubmitting}
                          className="w-full py-3 bg-swift-orange hover:bg-swift-orange-hover disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-button font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Registering...
                            </>
                          ) : (
                            <>
                              Send OTP & Register
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      /* OTP verification */
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="w-14 h-14 mx-auto mb-4 bg-swift-blue/10 rounded-full flex items-center justify-center">
                            <Shield className="w-7 h-7 text-swift-blue" />
                          </div>
                          <h3 className="font-heading font-bold text-lg text-swift-dark">
                            Verify Your Phone
                          </h3>
                          <p className="text-xs text-swift-mid mt-1">
                            Enter the 6-digit OTP sent to{" "}
                            <span className="font-bold text-swift-dark">
                              +91 {form.phone}
                            </span>
                          </p>
                        </div>

                        <div className="flex justify-center">
                          <input
                            id="seller-reg-otp"
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="------"
                            autoFocus
                            className="w-48 text-center px-4 py-3 border-2 border-gray-200 rounded-button text-xl focus:border-swift-orange font-bold font-mono tracking-[0.4em] outline-none transition-colors"
                          />
                        </div>

                        <div className="flex justify-center">
                          {otpTimer > 0 ? (
                            <span className="text-xs text-swift-mid">
                              Resend OTP in{" "}
                              <span className="font-bold font-mono text-swift-dark">
                                {otpTimer}s
                              </span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              id="seller-reg-resend-otp"
                              onClick={handleResendOtp}
                              className="text-xs text-swift-blue font-bold hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>

                        <button
                          id="seller-reg-verify-otp"
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isSubmitting || otp.length !== 6}
                          className="w-full py-3 bg-swift-green hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-button font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4" />
                              Verify & Create Account
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            {step < 3 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  id="seller-reg-back"
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-swift-mid hover:text-swift-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-button hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  id="seller-reg-next"
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-7 py-2.5 bg-swift-blue hover:bg-swift-blue-dark text-white rounded-button text-sm font-bold shadow-sm transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 3 && !otpSent && (
              <div className="mt-6">
                <button
                  id="seller-reg-back-from-verify"
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-swift-mid hover:text-swift-dark transition-all rounded-button hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Edit
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center space-y-3">
              <p className="text-xs text-swift-mid">
                Already have an account?{" "}
                <Link
                  to="/login"
                  id="seller-reg-login-link"
                  className="text-swift-blue font-bold hover:underline"
                >
                  Login here
                </Link>
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-swift-mid">
                <Shield className="w-3.5 h-3.5 text-swift-green" />
                <span>Your data is encrypted & secured with 256-bit SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummarySection = ({ title, icon, items }) => (
  <div className="bg-swift-bg/60 border border-gray-100 rounded-card p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <h4 className="font-heading font-bold text-sm text-swift-dark">
        {title}
      </h4>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-[10px] text-swift-mid font-semibold uppercase tracking-wide">
            {item.label}
          </span>
          <span className="text-sm text-swift-dark font-medium truncate">
            {item.value || "—"}
          </span>
        </div>
      ))}
    </div>
  </div>
);
