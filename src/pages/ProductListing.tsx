import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid, List, Check, X } from 'lucide-react';
import { mockDb } from '../data/mockDb';
import { ProductCard } from '../components/ProductCard';
import { apiClient } from '../api/apiClient';
import { mapBackendProduct } from '../store/useSwiftStore';
import type { Product } from '../data/mockDb';

export const ProductListing: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(80000);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // Mobile drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sorting & View
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCatProducts, setAllCatProducts] = useState<Product[]>([]);

  const [resolvedCategoryId, setResolvedCategoryId] = useState<number | undefined>(undefined);
  const [categoryResolved, setCategoryResolved] = useState(false);

  useEffect(() => {
    const resolveCategory = async () => {
      try {
        if (categoryName) {
          const categories = await apiClient.get('/api/v1/categories');
          const matchedCat = categories.find((c: any) => 
            c.slug.toLowerCase() === categoryName.toLowerCase() ||
            c.name.toLowerCase() === categoryName.toLowerCase()
          );
          setResolvedCategoryId(matchedCat ? matchedCat.id : undefined);
        } else {
          setResolvedCategoryId(undefined);
        }
      } catch (e) {
        setResolvedCategoryId(undefined);
      }
      setCategoryResolved(true);
    };
    setCategoryResolved(false);
    resolveCategory();
  }, [categoryName]);

  useEffect(() => {
    if (!categoryResolved) return;
    const loadInitialFilterValues = async () => {
      try {
        const params: Record<string, string> = { page: '0', size: '100' };
        if (resolvedCategoryId) params.categoryId = String(resolvedCategoryId);
        const response = await apiClient.get('/api/v1/products', { params });
        const mapped = (response.content || []).map(mapBackendProduct);
        setAllCatProducts(mapped);
      } catch (e) {}
    };
    loadInitialFilterValues();
  }, [categoryResolved, resolvedCategoryId]);

  useEffect(() => {
    if (!categoryResolved) return;
    const loadProducts = async () => {
      try {
        const params: Record<string, string> = {
          page: '0',
          size: '100',
          inStock: inStockOnly ? 'true' : 'false'
        };
        if (resolvedCategoryId) params.categoryId = String(resolvedCategoryId);
        if (minPrice > 0) params.minPrice = String(minPrice);
        if (maxPrice < 80000) params.maxPrice = String(maxPrice);
        if (selectedRating !== null) params.rating = String(selectedRating);
        if (selectedDiscounts.length > 0) {
          const minDisc = Math.min(...selectedDiscounts);
          params.discount = String(minDisc);
        }
        
        let sortParam = 'id,desc';
        if (sortBy === 'price-low-high') sortParam = 'price,asc';
        else if (sortBy === 'price-high-low') sortParam = 'price,desc';
        else if (sortBy === 'rating') sortParam = 'rating,desc';
        else if (sortBy === 'newest') sortParam = 'createdAt,desc';
        else if (sortBy === 'discount') sortParam = 'discountPercent,desc';
        params.sort = sortParam;

        const response = await apiClient.get('/api/v1/products', { params });
        const mapped = (response.content || []).map(mapBackendProduct);
        
        let filtered = mapped;
        if (selectedBrands.length > 0) {
          filtered = filtered.filter((p: any) => selectedBrands.includes(p.brand));
        }
        if (selectedSellers.length > 0) {
          filtered = filtered.filter((p: any) => selectedSellers.includes(p.sellerId));
        }
        
        setProducts(filtered);
      } catch (err) {
        console.error("Failed to load products list", err);
      }
    };
    loadProducts();
  }, [categoryResolved, resolvedCategoryId, selectedBrands, minPrice, maxPrice, selectedRating, selectedDiscounts, inStockOnly, selectedSellers, sortBy]);

  // Derive unique brands and sellers from products in this category
  const availableBrands = useMemo(() => {
    const brandsSet = new Set(allCatProducts.map(p => p.brand));
    return Array.from(brandsSet);
  }, [allCatProducts]);

  const filteredBrands = useMemo(() => {
    return availableBrands.filter(b => b.toLowerCase().includes(brandSearchQuery.toLowerCase()));
  }, [availableBrands, brandSearchQuery]);

  const availableSellers = useMemo(() => {
    const sellers = mockDb.getSellers();
    const sellerIds = new Set(allCatProducts.map(p => p.sellerId));
    return sellers.filter(s => sellerIds.has(s.id));
  }, [allCatProducts]);

  const filteredProducts = products;

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleDiscountToggle = (disc: number) => {
    setSelectedDiscounts(prev =>
      prev.includes(disc) ? prev.filter(d => d !== disc) : [...prev, disc]
    );
  };

  const handleSellerToggle = (sellerId: string) => {
    setSelectedSellers(prev =>
      prev.includes(sellerId) ? prev.filter(id => id !== sellerId) : [...prev, sellerId]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(80000);
    setSelectedRating(null);
    setSelectedDiscounts([]);
    setInStockOnly(false);
    setSelectedSellers([]);
    setBrandSearchQuery('');
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 4);
      setIsLoadingMore(false);
    }, 800);
  };

  // Render Filter Form Content
  const renderFilters = () => (
    <div className="space-y-6">
      {/* 1. Price Filter */}
      <div className="border-b border-gray-100 pb-5">
        <h4 className="font-heading font-extrabold text-sm text-swift-dark mb-3">Price Range</h4>
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <span className="text-[10px] text-swift-mid font-bold uppercase">Min Price</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-button text-xs"
            />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-swift-mid font-bold uppercase">Max Price</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-button text-xs"
            />
          </div>
        </div>
        {/* Preset Ranges */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setMinPrice(0); setMaxPrice(999); }}
            className="text-[11px] font-bold text-swift-blue bg-swift-blue/5 border border-swift-blue/10 px-2 py-1 rounded-button hover:bg-swift-blue hover:text-white"
          >
            Under ₹999
          </button>
          <button
            onClick={() => { setMinPrice(1000); setMaxPrice(4999); }}
            className="text-[11px] font-bold text-swift-blue bg-swift-blue/5 border border-swift-blue/10 px-2 py-1 rounded-button hover:bg-swift-blue hover:text-white"
          >
            ₹1,000 - ₹4,999
          </button>
          <button
            onClick={() => { setMinPrice(5000); setMaxPrice(80000); }}
            className="text-[11px] font-bold text-swift-blue bg-swift-blue/5 border border-swift-blue/10 px-2 py-1 rounded-button hover:bg-swift-blue hover:text-white"
          >
            Over ₹5,000
          </button>
        </div>
      </div>

      {/* 2. Brand Filter */}
      {availableBrands.length > 0 && (
        <div className="border-b border-gray-100 pb-5">
          <h4 className="font-heading font-extrabold text-sm text-swift-dark mb-3">Brands</h4>
          {availableBrands.length > 5 && (
            <input
              type="text"
              placeholder="Search brand..."
              value={brandSearchQuery}
              onChange={(e) => setBrandSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-button text-xs mb-3 focus:border-swift-orange"
            />
          )}
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {filteredBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-xs font-semibold text-swift-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="rounded text-swift-orange focus:ring-swift-orange border-gray-300 w-4 h-4"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 3. Rating Filter */}
      <div className="border-b border-gray-100 pb-5">
        <h4 className="font-heading font-extrabold text-sm text-swift-dark mb-3">Customer Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() => setSelectedRating(selectedRating === stars ? null : stars)}
              className={`w-full text-left flex items-center justify-between p-2 rounded-button text-xs font-bold transition-all border ${
                selectedRating === stars
                  ? 'bg-swift-orange/5 border-swift-orange text-swift-orange shadow-xs'
                  : 'bg-transparent border-transparent text-swift-dark hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-1">
                {stars}★ & above
              </span>
              {selectedRating === stars && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Discount Filter */}
      <div className="border-b border-gray-100 pb-5">
        <h4 className="font-heading font-extrabold text-sm text-swift-dark mb-3">Discounts</h4>
        <div className="space-y-2">
          {[50, 25, 10].map((disc) => (
            <label key={disc} className="flex items-center gap-2 text-xs font-semibold text-swift-dark cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDiscounts.includes(disc)}
                onChange={() => handleDiscountToggle(disc)}
                className="rounded text-swift-orange focus:ring-swift-orange border-gray-300 w-4 h-4"
              />
              <span>{disc}% and above</span>
            </label>
          ))}
        </div>
      </div>

      {/* 5. In Stock Only */}
      <div className="border-b border-gray-100 pb-5 flex items-center justify-between">
        <div>
          <h4 className="font-heading font-extrabold text-sm text-swift-dark">In Stock Only</h4>
          <p className="text-[10px] text-swift-mid mt-0.5">Exclude unavailable items</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => setInStockOnly(!inStockOnly)}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-swift-green"></div>
        </label>
      </div>

      {/* 6. Sellers Filter */}
      {availableSellers.length > 0 && (
        <div className="pb-5">
          <h4 className="font-heading font-extrabold text-sm text-swift-dark mb-3">Sellers</h4>
          <div className="space-y-2">
            {availableSellers.map((seller) => (
              <label key={seller.id} className="flex items-center gap-2 text-xs font-semibold text-swift-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSellers.includes(seller.id)}
                  onChange={() => handleSellerToggle(seller.id)}
                  className="rounded text-swift-orange focus:ring-swift-orange border-gray-300 w-4 h-4"
                />
                <span>{seller.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-20">
      
      {/* Breadcrumb Header */}
      <nav className="text-xs font-bold text-swift-mid mb-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-swift-orange">Home</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-swift-dark capitalize">{categoryName || 'All Categories'}</span>
      </nav>

      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-gray-100 pb-4 mb-6">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-swift-dark capitalize">
            {categoryName ? `${categoryName} Store` : 'Explore All Products'}
          </h2>
          <p className="text-xs text-swift-mid mt-0.5">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found matching your selection
          </p>
        </div>

        {/* Action Toggles for Mobile Filters & List/Grid View */}
        <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0">
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-button text-xs font-bold text-swift-dark hover:bg-gray-50 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-button text-xs font-bold text-swift-dark shadow-xs">
            <span className="text-swift-mid font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none p-0 pr-6 text-xs focus:ring-0 focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest First</option>
              <option value="discount">Price drop %</option>
            </select>
          </div>

          {/* Grid/List Toggles */}
          <div className="flex border border-gray-200 rounded-button p-0.5 bg-white shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-button transition-colors ${
                viewMode === 'grid' ? 'bg-swift-orange text-white' : 'text-swift-mid hover:text-swift-dark'
              }`}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-button transition-colors ${
                viewMode === 'list' ? 'bg-swift-orange text-white' : 'text-swift-mid hover:text-swift-dark'
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-8 items-start">
        
        {/* Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block w-64 bg-white border border-gray-100 rounded-card p-6 shadow-card shrink-0 sticky top-28 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-50">
            <span className="font-heading font-extrabold text-sm text-swift-dark">Filter Options</span>
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-bold text-swift-orange hover:underline"
            >
              Clear All
            </button>
          </div>
          {renderFilters()}
        </aside>

        {/* Product Grid/List Listings */}
        <div className="flex-grow space-y-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-card p-8 flex flex-col items-center justify-center space-y-4">
              <div className="p-6 bg-swift-bg rounded-full text-swift-mid">
                <SlidersHorizontal className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-swift-dark">No products match your criteria</h4>
                <p className="text-xs text-swift-mid mt-1">Try resetting selected filters or adjusting price limits.</p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 text-xs font-bold text-white bg-swift-orange hover:bg-swift-orange-hover rounded-button shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>

              {/* Shimmer loading / Load More action */}
              {visibleCount < filteredProducts.length && (
                <div className="text-center pt-4">
                  {isLoadingMore ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-full">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className="bg-white border border-gray-100 rounded-card p-3 h-[280px] flex flex-col justify-between">
                          <div className="w-full aspect-[3/4] rounded-button bg-gray-150 animate-shimmer" />
                          <div className="space-y-2 mt-3">
                            <div className="h-4 w-1/3 bg-gray-200 animate-shimmer rounded" />
                            <div className="h-4 w-5/6 bg-gray-200 animate-shimmer rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-button font-bold text-sm text-swift-dark hover:text-swift-orange transition-all shadow-xs"
                    >
                      Load More Products
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Mobile Filters Drawer (Bottom Sheet) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end pointer-events-auto">
          {/* Backdrop closer clicker */}
          <div className="absolute inset-0 z-0" onClick={() => setMobileFiltersOpen(false)} />
          
          <div className="relative w-full max-w-sm h-full bg-white shadow-modal z-10 flex flex-col">
            {/* Mobile filter Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-swift-orange" />
                <h3 className="font-heading font-extrabold text-base text-swift-dark">Filter Products</h3>
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 hover:bg-gray-100 text-gray-400 hover:text-swift-dark rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Filter Scroll Area */}
            <div className="flex-grow overflow-y-auto p-4 bg-white">
              {renderFilters()}
            </div>

            {/* Mobile filter Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3 shrink-0 bg-white">
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 py-3 text-sm font-bold text-swift-dark border border-gray-250 rounded-button hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-white bg-swift-orange hover:bg-swift-orange-hover rounded-button shadow-sm"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
