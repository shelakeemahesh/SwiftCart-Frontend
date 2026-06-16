import React, { useState, useEffect, useMemo } from "react";
import { Clock, Flame, Percent, Award } from "lucide-react";
import { mockDb } from "../data/mockDb";
import { ProductCard } from "../components/ProductCard";

export const Deals = () => {
  const [dealCategory, setDealCategory] = useState("All");

  // Big Sale countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 52,
    seconds: 12,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return {
            ...prev,
            minutes: prev.seconds === 0 ? prev.minutes - 1 : prev.minutes,
            seconds: 59,
          };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter high discount products
  const dealProducts = useMemo(() => {
    const all = mockDb.getProducts();
    const discountsOnly = all.filter((p) => p.discount >= 40); // 40%+ discounts are deals

    if (dealCategory === "All") return discountsOnly;
    return discountsOnly.filter((p) => p.category === dealCategory);
  }, [dealCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-20 space-y-10 text-left">
      {/* 1. Immersive Countdown Banner */}
      <section className="bg-gradient-to-r from-[#D85A30] to-[#EF9F27] rounded-card overflow-hidden relative shadow-card text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 sm:space-y-4 max-w-xl">
          <span className="inline-block bg-white/20 text-white font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded shadow-xs">
            Flash Sale Event
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl leading-tight">
            Super Swift Savings Fiesta
          </h2>
          <p className="text-xs sm:text-sm opacity-90 leading-relaxed font-medium">
            Get highest price cuts on popular brands in electronics, casual
            streetwear clothing, and dynamic house kitchen appliances.
          </p>
        </div>

        {/* Big Countdown Timer */}
        <div className="bg-white/10 backdrop-blur-md rounded-card border border-white/20 p-5 text-center min-w-[280px]">
          <div className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Sale starts in</span>
          </div>

          <div className="flex justify-center gap-4 font-mono font-extrabold">
            <div>
              <span className="block text-2xl sm:text-3xl">
                {timeLeft.days.toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/70 block mt-0.5">
                Days
              </span>
            </div>
            <span className="text-xl sm:text-2xl mt-1">:</span>
            <div>
              <span className="block text-2xl sm:text-3xl">
                {timeLeft.hours.toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/70 block mt-0.5">
                Hours
              </span>
            </div>
            <span className="text-xl sm:text-2xl mt-1">:</span>
            <div>
              <span className="block text-2xl sm:text-3xl">
                {timeLeft.minutes.toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/70 block mt-0.5">
                Mins
              </span>
            </div>
            <span className="text-xl sm:text-2xl mt-1">:</span>
            <div>
              <span className="block text-2xl sm:text-3xl">
                {timeLeft.seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/70 block mt-0.5">
                Secs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Value Badges strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "40% - 70% Off",
            desc: "Highest discount drops on selected cards",
            icon: <Percent className="w-5 h-5" />,
          },
          {
            label: "100% Verified Deals",
            desc: "Sourced from authorized brand merchants",
            icon: <Award className="w-5 h-5" />,
          },
          {
            label: "Free Delivery",
            desc: "Applicable on all deal items above ₹499",
            icon: <Flame className="w-5 h-5" />,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-150 rounded-card p-4 flex items-center gap-3 bg-white shadow-xs"
          >
            <span className="p-2.5 bg-swift-orange/10 rounded-full text-swift-orange shrink-0">
              {item.icon}
            </span>
            <div>
              <div className="text-xs font-extrabold text-swift-dark">
                {item.label}
              </div>
              <div className="text-[10px] text-swift-mid">{item.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Deal categories tab filtering */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 border-b border-gray-100 pb-3">
          <h3 className="font-heading font-extrabold text-lg text-swift-dark">
            Trending Offers Catalog
          </h3>

          <div className="flex gap-1.5 flex-wrap">
            {["All", "Electronics", "Fashion", "Home"].map((cat) => (
              <button
                key={cat}
                onClick={() => setDealCategory(cat)}
                className={`px-4 py-2 border rounded-button text-xs font-bold transition-all ${
                  dealCategory === cat
                    ? "bg-swift-orange border-swift-orange text-white shadow-xs"
                    : "bg-white border-gray-200 text-swift-dark hover:bg-gray-50"
                }`}
              >
                {cat} Deals
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid listing */}
        {dealProducts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-card p-12 text-center text-swift-mid">
            No deal items matching this category at this moment. Please check
            back later.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {dealProducts.map((prod) => (
              <div key={prod.id} className="relative">
                <ProductCard product={prod} />

                {/* Deal timing badge overlay */}
                <span className="absolute bottom-[140px] left-2 bg-swift-red text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Ends Soon
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
