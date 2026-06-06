import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight, Grid, List, HelpCircle, Flame } from 'lucide-react';
import { ProductCard, FALLBACK_IMAGE } from '../components/ProductCard';
import { apiClient } from '../api/apiClient';
import { mapBackendProduct } from '../store/useSwiftStore';
import type { Product } from '../data/mockDb';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');

  // Typo check (simulated spell-check suggestion)
  const spellCheck = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (q === 'earbudz' || q === 'earbud' || q === 'earfone' || q === 'earphones') {
      return { suggestion: 'wireless earbuds', target: 'wireless earbuds' };
    }
    if (q === 'shos' || q === 'shoe' || q === 'sneker') {
      return { suggestion: 'running shoes', target: 'AeroRun' };
    }
    if (q === 'blender' || q === 'mixey' || q === 'juicer') {
      return { suggestion: 'multi-bullet blender', target: 'KitchenPro' };
    }
    return null;
  }, [query]);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!query.trim()) return;
    const fetchSearchResults = async () => {
      try {
        const response = await apiClient.get('/api/v1/search', {
          params: { q: query, size: '40' }
        });
        const mapped = (response.content || []).map(mapBackendProduct);
        setProducts(mapped);
      } catch (err) {
        console.error("Failed to load search results", err);
      }
    };
    fetchSearchResults();
  }, [query]);

  // Query Matcher
  const matchedProducts = products;

  // Sponsored Product Simulation (Display first matching item as Sponsored, or a popular item)
  const sponsoredProduct = useMemo(() => {
    if (matchedProducts.length > 0) {
      return { ...matchedProducts[0], isSponsored: true };
    }
    return null;
  }, [matchedProducts]);

  // Sort logic
  const sortedProducts = useMemo(() => {
    const result = [...matchedProducts];
    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'relevance':
      default:
        result.sort((a, b) => (b.isSwiftChoice ? 1 : 0) - (a.isSwiftChoice ? 1 : 0));
        break;
    }
    return result;
  }, [matchedProducts, sortBy]);

  // Trending searches and suggestions for empty states
  const trendingSearches = ['wireless earbuds', 'running shoes', 'glow serum', 'desk chair', 'whole coffee beans'];
  const suggestedCategories = ['Electronics', 'Fashion', 'Home', 'Grocery', 'Beauty'];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-20">
      
      {/* Title / Query results subhead */}
      <div className="border-b border-gray-100 pb-4 mb-6 text-left">
        <h2 className="font-heading font-extrabold text-2xl text-swift-dark">
          Search Results
        </h2>
        <p className="text-xs text-swift-mid mt-0.5">
          Showing results for &quot;<span className="font-bold text-swift-dark">{query}</span>&quot; • {matchedProducts.length} items found
        </p>
      </div>

      {/* 1. Typo / Spell check Suggestion Strip */}
      {spellCheck && (
        <div className="bg-swift-orange/10 border border-swift-orange/20 rounded-card p-3 mb-6 text-xs text-left font-bold text-swift-dark flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-swift-orange shrink-0" />
          <div>
            Did you mean:{' '}
            <button
              onClick={() => navigate(`/search?q=${encodeURIComponent(spellCheck.suggestion)}`)}
              className="text-swift-blue underline hover:text-swift-orange transition-colors"
            >
              {spellCheck.suggestion}
            </button>
            ?
          </div>
        </div>
      )}

      {matchedProducts.length === 0 ? (
        // NO RESULTS STATE
        <div className="max-w-xl mx-auto text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-gray-50 border border-gray-150 text-swift-mid rounded-full flex items-center justify-center mx-auto">
            <SearchIcon className="w-10 h-10" />
          </div>
          
          <div>
            <h3 className="font-heading font-extrabold text-lg text-swift-dark">No products matched &quot;{query}&quot;</h3>
            <p className="text-xs text-swift-mid mt-1 leading-relaxed">
              We couldn&apos;t find any matches. Double check your spellings, search for generic keywords, or browse categories.
            </p>
          </div>

          {/* Spell check suggestions block */}
          <div className="border border-gray-150 rounded-card p-5 bg-white space-y-4 text-left">
            <div>
              <span className="block text-[10px] font-bold text-swift-mid uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-swift-orange" />
                <span>Trending Search Queries</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map(term => (
                  <Link
                    key={term}
                    to={`/search?q=${encodeURIComponent(term)}`}
                    className="bg-gray-50 hover:bg-swift-orange/10 hover:text-swift-orange text-swift-dark font-bold text-xs px-3 py-1.5 border border-gray-200 hover:border-swift-orange/30 rounded-button transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-swift-mid uppercase tracking-wide mb-2">Shop Top Categories</span>
              <div className="flex flex-wrap gap-2">
                {suggestedCategories.map(cat => (
                  <Link
                    key={cat}
                    to={`/category/${cat}`}
                    className="bg-swift-blue/5 hover:bg-swift-blue text-swift-blue hover:text-white font-bold text-xs px-3 py-1.5 border border-swift-blue/10 rounded-button transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // GRID LAYOUT MATCHES
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Matches listing (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Sort row */}
            <div className="flex justify-between items-center bg-white border border-gray-100 rounded-card p-3 shadow-xs">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-250 px-3 py-1 rounded-button text-xs font-bold text-swift-dark">
                <span className="text-swift-mid font-medium">Sort results:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none p-0 pr-6 text-xs focus:ring-0 focus:outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>

              {/* View options */}
              <div className="flex border border-gray-250 rounded-button p-0.5 bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded-button transition-colors ${
                    viewMode === 'grid' ? 'bg-swift-orange text-white' : 'text-swift-mid'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded-button transition-colors ${
                    viewMode === 'list' ? 'bg-swift-orange text-white' : 'text-swift-mid'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cards grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'flex flex-col gap-4'}>
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>

          </div>

          {/* Sponsored/Ad side column (3 cols) */}
          {sponsoredProduct && (
            <aside className="lg:col-span-3 space-y-4 shrink-0">
              <div className="bg-white border border-gray-100 rounded-card p-4 shadow-card text-left space-y-3 relative overflow-hidden">
                <span className="absolute top-2 right-2 bg-gray-900/10 text-swift-dark font-extrabold text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded">
                  Sponsored Ad
                </span>
                
                <div className="text-xs font-bold text-swift-mid uppercase tracking-wide">Brand Spotlight</div>
                
                {/* Sponsored Product Card */}
                <img
                  src={sponsoredProduct.images[0] || FALLBACK_IMAGE}
                  alt={sponsoredProduct.name}
                  className="w-full aspect-[4/3] object-cover rounded-button border border-gray-100 bg-gray-50"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
                <div>
                  <span className="text-[10px] text-swift-blue font-bold uppercase">{sponsoredProduct.brand}</span>
                  <h4 className="font-heading font-extrabold text-sm text-swift-dark mt-0.5 leading-snug line-clamp-2">
                    {sponsoredProduct.name}
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="font-extrabold text-sm text-swift-dark">₹{sponsoredProduct.price.toLocaleString('en-IN')}</span>
                    {sponsoredProduct.mrp > sponsoredProduct.price && (
                      <span className="text-xs text-swift-mid line-through">₹{sponsoredProduct.mrp}</span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/product/${sponsoredProduct.slug || sponsoredProduct.id}`}
                  className="w-full py-2 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Product Offers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </aside>
          )}

        </div>
      )}

    </div>
  );
};
