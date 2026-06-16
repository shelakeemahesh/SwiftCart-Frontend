import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import {
  useWishlistStore,
  useCartStore,
  useToastStore,
} from "../store/useSwiftStore";

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";

export const ProductCard = ({ product, viewMode = "grid" }) => {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { addToast } = useToastStore();

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const isSaved = isInWishlist(product.id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    addToast(
      isSaved
        ? `${product.name} removed from Wishlist`
        : `${product.name} added to Wishlist`,
      isSaved ? "info" : "success",
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) {
      addToast("Product is currently out of stock", "error");
      return;
    }

    // Default select first options for variants if any
    const defaultVariants = {};
    (product.variants || []).forEach((v) => {
      defaultVariants[v.name] = v.options[0];
    });

    addToCart(product, 1, defaultVariants);
    addToast(`${product.name} added to Cart`, "success");
  };

  const hasSecondaryImage = product.images.length > 1;

  if (viewMode === "list") {
    return (
      <Link
        to={`/product/${product.slug || product.id}`}
        className="flex flex-col sm:flex-row bg-white border border-gray-100 rounded-card overflow-hidden shadow-card hover:shadow-md transition-all duration-200 relative p-4 gap-4"
      >
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full border border-gray-100 shadow-sm transition-all bg-white hover:scale-105 ${
            isSaved ? "text-swift-red" : "text-swift-mid hover:text-swift-red"
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
        </button>

        {/* Thumbnail Image */}
        <div
          className="relative w-full sm:w-48 aspect-[3/4] bg-gray-50 flex-shrink-0 rounded-button overflow-hidden"
          onMouseEnter={() => hasSecondaryImage && setCurrentImageIdx(1)}
          onMouseLeave={() => setCurrentImageIdx(0)}
        >
          <img
            src={product.images[currentImageIdx] || FALLBACK_IMAGE}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="text-white text-xs font-extrabold uppercase px-3 py-1 bg-swift-red rounded-pill tracking-wider shadow-sm">
                Out of Stock
              </span>
            </div>
          )}
          {product.isSwiftChoice && (
            <span className="absolute top-2 left-2 bg-swift-blue text-white text-[10px] font-extrabold px-2 py-0.5 rounded-button shadow-sm">
              SwiftChoice
            </span>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-grow flex flex-col justify-between py-1">
          <div>
            <div className="text-xs font-bold text-swift-mid uppercase tracking-wide">
              {product.brand}
            </div>
            <h3 className="font-heading font-extrabold text-lg text-swift-dark mt-1 line-clamp-2 leading-snug">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center bg-swift-orange/10 px-1.5 py-0.5 rounded-button">
                <Star className="w-3.5 h-3.5 text-swift-orange fill-swift-orange" />
                <span className="text-xs font-bold text-swift-orange ml-1">
                  {product.rating}
                </span>
              </div>
              <span className="text-xs text-swift-mid">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Highlights */}
            <ul className="mt-3 space-y-1 hidden md:block">
              {product.highlights.slice(0, 3).map((hl, i) => (
                <li
                  key={i}
                  className="text-xs text-swift-mid flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 bg-swift-blue rounded-full" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
            {/* Price */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-swift-dark">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-sm text-swift-mid line-through font-mono">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm font-bold text-swift-orange">
                      ({product.discount}% OFF)
                    </span>
                  </>
                )}
              </div>
              {product.price >= 499 && (
                <span className="inline-block mt-1 text-[10px] font-bold text-swift-green bg-swift-green/10 px-2 py-0.5 rounded-button">
                  Free Delivery
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`px-6 py-2.5 rounded-button font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 border ${
                product.inStock
                  ? "bg-swift-orange hover:bg-swift-orange-hover text-white border-swift-orange"
                  : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="group flex flex-col bg-white border border-gray-100 rounded-card overflow-hidden shadow-card hover:shadow-md transition-all duration-200 relative"
    >
      {/* Wishlist Toggle Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full border border-gray-100 shadow-sm bg-white hover:scale-105 transition-all ${
          isSaved ? "text-swift-red" : "text-swift-mid hover:text-swift-red"
        }`}
        aria-label="Add to Wishlist"
      >
        <Heart className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
      </button>

      {/* Image Gallery */}
      <div
        className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden"
        onMouseEnter={() => hasSecondaryImage && setCurrentImageIdx(1)}
        onMouseLeave={() => setCurrentImageIdx(0)}
      >
        <img
          src={product.images[currentImageIdx] || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-white text-xs font-extrabold uppercase px-2.5 py-1 bg-swift-red rounded-pill tracking-wider shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
        {product.isSwiftChoice && (
          <span className="absolute top-3 left-3 bg-swift-blue text-white text-[9px] font-extrabold px-2 py-0.5 rounded-button shadow-sm">
            Choice
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 flex-grow flex flex-col justify-between min-h-[140px]">
        <div>
          <div className="text-[10px] font-bold text-swift-mid uppercase tracking-wider">
            {product.brand}
          </div>
          <h3 className="font-heading font-extrabold text-sm text-swift-dark mt-1 line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center bg-swift-orange/10 px-1 py-0.5 rounded-button">
              <Star className="w-3 h-3 text-swift-orange fill-swift-orange" />
              <span className="text-[10px] font-bold text-swift-orange ml-0.5">
                {product.rating}
              </span>
            </div>
            <span className="text-[10px] text-swift-mid">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 space-y-2">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-extrabold text-swift-dark">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-xs text-swift-mid line-through font-mono">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-bold text-swift-orange">
                    -{product.discount}%
                  </span>
                </>
              )}
            </div>
            {product.price >= 499 && (
              <span className="inline-block text-[9px] font-bold text-swift-green">
                Free Delivery
              </span>
            )}
          </div>

          {/* Add to Cart Overlay / Always visible on mobile & tablet touch screens */}
          <div className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-2 rounded-button font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                product.inStock
                  ? "bg-swift-orange hover:bg-swift-orange-hover text-white border-swift-orange shadow-sm"
                  : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
