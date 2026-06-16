import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Star, CheckCircle, Share2, Grid, List, Check } from "lucide-react";
import { mockDb } from "../data/mockDb";
import { ProductCard } from "../components/ProductCard";
import { useToastStore } from "../store/useSwiftStore";

export const SellerStore = () => {
  const { sellerId } = useParams();
  const { addToast } = useToastStore();

  const [seller, setSeller] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Tabs: all, featured, new
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (!sellerId) return;
    const found = mockDb.getSellerById(sellerId);
    if (found) {
      setSeller(found);
      setFollowerCount(found.followerCount);
    }
  }, [sellerId]);

  // Filter seller-specific products
  const sellerProducts = useMemo(() => {
    if (!sellerId) return [];
    const all = mockDb.getProducts();
    const matches = all.filter((p) => p.sellerId === sellerId);

    if (activeTab === "featured") {
      return matches.filter((p) => p.isSwiftChoice || p.isBestSeller);
    }
    if (activeTab === "new") {
      return matches.filter((p) => p.isNewArrival);
    }
    return matches;
  }, [sellerId, activeTab]);

  if (!seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-swift-mid text-sm font-bold">
          Loading seller store...
        </p>
      </div>
    );
  }

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    addToast(
      isFollowing
        ? `Unfollowed store ${seller.name}`
        : `Following store ${seller.name}!`,
      isFollowing ? "info" : "success",
    );
  };

  const handleShareStore = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Seller store URL copied to clipboard!", "success");
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Seller Header Banner */}
      <section className="relative h-[180px] sm:h-[260px] bg-gray-900 overflow-hidden">
        <img
          src={seller.banner}
          alt={seller.name}
          className="w-full h-full object-cover opacity-50"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </section>

      {/* 2. Brand Identity Panel */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-16 sm:-mt-24 relative z-10 text-left">
        <div className="bg-white border border-gray-100 rounded-card p-6 shadow-modal flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img
              src={seller.logo}
              alt={seller.name}
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-card bg-gray-50 flex-shrink-0"
            />

            {/* Identity details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-swift-dark">
                  {seller.name}
                </h2>
                <span className="text-[10px] font-bold text-white bg-swift-blue px-2 py-0.5 rounded-button flex items-center gap-1 shadow-sm">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Merchant</span>
                </span>
              </div>
              <p className="text-xs text-swift-mid max-w-md">
                {seller.description}
              </p>

              {/* Ratings and Stats */}
              <div className="flex items-center gap-4 pt-1 flex-wrap text-xs text-swift-mid font-bold">
                <div className="flex items-center bg-swift-orange/10 px-2 py-0.5 rounded-button text-swift-orange">
                  <Star className="w-3.5 h-3.5 fill-swift-orange" />
                  <span className="ml-1">{seller.rating} rating</span>
                </div>
                <span>•</span>
                <span className="text-swift-dark font-mono">
                  {followerCount.toLocaleString()} followers
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full md:w-auto self-end md:self-center">
            <button
              onClick={handleFollowToggle}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-button font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                isFollowing
                  ? "bg-swift-green hover:bg-green-700 text-white"
                  : "bg-swift-orange hover:bg-swift-orange-hover text-white"
              }`}
            >
              {isFollowing ? <Check className="w-4 h-4" /> : null}
              <span>{isFollowing ? "Following Store" : "Follow Store"}</span>
            </button>
            <button
              onClick={handleShareStore}
              className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-button text-swift-dark shadow-xs transition-colors"
              aria-label="Share Store"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Grid Filter & Catalog */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 border-b border-gray-100 pb-3 mb-6">
          <div className="flex gap-1 bg-gray-50 p-1 border border-gray-150 rounded-card">
            {[
              { id: "all", label: "All Products" },
              { id: "featured", label: "Featured Offers" },
              { id: "new", label: "New Arrivals" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-button text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-swift-dark shadow-xs"
                    : "text-swift-mid hover:text-swift-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex border border-gray-250 rounded-button p-0.5 bg-white shadow-xs self-end">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-button transition-colors ${
                viewMode === "grid"
                  ? "bg-swift-orange text-white"
                  : "text-swift-mid"
              }`}
              aria-label="Grid layout"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-button transition-colors ${
                viewMode === "list"
                  ? "bg-swift-orange text-white"
                  : "text-swift-mid"
              }`}
              aria-label="List layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Grid listing */}
        {sellerProducts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-card p-12 text-center text-swift-mid">
            No products found matching this filter group in this merchant&apos;s
            storefront.
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "flex flex-col gap-4"
            }
          >
            {sellerProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} viewMode={viewMode} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
