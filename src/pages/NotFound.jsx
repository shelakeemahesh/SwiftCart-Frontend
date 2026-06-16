import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";

export const NotFound = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      {/* 404 Branded Illustration wrapper */}
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-swift-orange/5 rounded-full scale-110 animate-pulse" />
        <div className="text-swift-orange p-8 bg-swift-orange/10 rounded-full">
          <ShoppingBag className="w-24 h-24" strokeWidth={1.5} />
        </div>
        <span className="absolute bottom-4 right-4 bg-swift-red text-white text-base font-mono font-extrabold px-3 py-1 rounded-pill shadow-modal border-2 border-white">
          404 Error
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="font-heading font-extrabold text-2xl text-swift-dark">
          This Page Took a Wrong Turn
        </h2>
        <p className="text-xs text-swift-mid max-w-sm mx-auto leading-relaxed">
          The link you requested might be broken, or the page has been migrated.
          Search below to discover top products.
        </p>
      </div>

      {/* Embedded Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative w-full max-w-sm mx-auto"
      >
        <input
          type="text"
          placeholder="Try searching: wireless earbuds..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-button text-xs focus:bg-white focus:border-swift-orange"
        />

        <button
          type="submit"
          className="absolute right-0 top-0 bottom-0 px-3.5 text-swift-mid hover:text-swift-orange transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      <div>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-xs shadow-sm transition-all"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};
