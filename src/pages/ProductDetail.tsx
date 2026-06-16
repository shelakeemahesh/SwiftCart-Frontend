import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, CheckCircle2, Play, Plus, Minus, ThumbsUp, Send, X } from 'lucide-react';
import { mockDb } from '../data/mockDb';
import type { Product, Review } from '../data/mockDb';
import { useCartStore, useWishlistStore, useToastStore, useAuthStore, mapBackendProduct } from '../store/useSwiftStore';
import { ProductCard, FALLBACK_IMAGE } from '../components/ProductCard';
import { apiClient } from '../api/apiClient';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { addToast } = useToastStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { isLoggedIn, user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // Selected variant state
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  
  // Image gallery state
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });

  // Pincode checker state
  const [pincodeCheck, setPincodeCheck] = useState('');
  const [deliveryResult, setDeliveryResult] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState(false);

  // Review modal state
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewBody, setNewReviewBody] = useState('');
  const [reviewsFilter, setReviewsFilter] = useState<number | null>(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'highlights' | 'specs' | 'reviews'>('highlights');

  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);

  // Reload product on parameter changes
  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        const dbProduct = await apiClient.get(`/api/v1/products/${slug}`);
        const prod = mapBackendProduct(dbProduct);
        setProduct(prod);

        // Select first options of variants by default
        const defaultOptions: { [key: string]: string } = {};
        (prod.variants || []).forEach(v => {
          defaultOptions[v.name] = v.options[0];
        });
        setSelectedVariants(defaultOptions);
        setQuantity(1);
        setActiveMediaIdx(0);
        setShowVideo(false);
        setDeliveryResult(null);
        setDeliveryError(false);

        // Fetch related products
        try {
          const related = await apiClient.get(`/api/v1/products/${prod.id}/related?limit=4`);
          setRelatedProducts((related || []).map(mapBackendProduct));
        } catch (e) {}
      } catch (err) {
        console.error("Failed to load product details", err);
        navigate('/404');
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-swift-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-swift-mid text-sm font-bold">Loading product details...</p>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);

  // Filter reviews
  const reviewsToDisplay = reviewsFilter 
    ? product.reviews.filter(r => r.rating === reviewsFilter)
    : product.reviews;

  // This comment is written by human not ai - Zoom Lens Effect (Desktop Magnifier)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024 || !window.matchMedia('(hover: hover)').matches) return;
    const img = mainImageRef.current;
    if (!img) return;

    const { left, top, width, height } = img.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Calculate background percentage position
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    // Lens diameter is 150px. Center lens on cursor
    const lensX = x - 75;
    const lensY = y - 75;

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${product.images[activeMediaIdx]})`,
      backgroundPosition: `${bgX}% ${bgY}%`,
      backgroundSize: `${width * 2}px ${height * 2}px`,
      left: `${lensX}px`,
      top: `${lensY}px`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincodeCheck)) {
      setDeliveryError(false);
      // Simulate delivery date: 2 days for metropolitan codes, 4 for others
      const days = parseInt(pincodeCheck[0]) % 2 === 0 ? 2 : 4;
      const date = new Date();
      date.setDate(date.getDate() + days);
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      setDeliveryResult(`Guaranteed delivery by ${date.toLocaleDateString('en-IN', options)} | Free Shipping`);
      addToast('Pincode verified successfully!', 'success');
    } else {
      setDeliveryError(true);
      setDeliveryResult(null);
      addToast('Invalid pincode. Must be 6 digits.', 'error');
    }
  };

  const handleAddToCart = () => {
    if (!product.inStock) {
      addToast('This product is out of stock', 'error');
      return;
    }
    addToCart(product, quantity, selectedVariants);
    addToast(`${product.name} added to cart`, 'success');
  };

  const handleBuyNow = () => {
    if (!product.inStock) {
      addToast('This product is out of stock', 'error');
      return;
    }
    addToCart(product, quantity, selectedVariants);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    addToast(
      isSaved ? `${product.name} removed from Wishlist` : `${product.name} added to Wishlist`,
      isSaved ? 'info' : 'success'
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      addToast('Please login to submit a review', 'warning');
      return;
    }

    if (!newReviewTitle.trim() || !newReviewBody.trim()) {
      addToast('Please fill out all review fields', 'error');
      return;
    }

    const reviewObj: Review = {
      id: Math.random().toString(),
      username: user?.name || 'Anonymous User',
      avatar: (user?.name || 'AU').split(' ').map(n => n[0]).join(''),
      rating: newReviewRating,
      date: new Date().toISOString().split('T')[0],
      title: newReviewTitle,
      body: newReviewBody,
      helpfulYesCount: 0,
      helpfulNoCount: 0
    };

    // Update database
    const updatedReviews = [reviewObj, ...product.reviews];
    
    // Recalculate average rating
    const avgRating = parseFloat((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));

    const updatedProd = {
      ...product,
      reviews: updatedReviews,
      reviewCount: updatedReviews.length,
      rating: avgRating
    };

    mockDb.updateProduct(updatedProd);
    setProduct(updatedProd);

    // Reset Form
    setNewReviewTitle('');
    setNewReviewBody('');
    setWriteReviewOpen(false);
    addToast('Review submitted successfully! Thank you.', 'success');
  };

  // histogram calculation

  // Histogram calculation
  const starsHistogram = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  product.reviews.forEach(r => {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 5|4|3|2|1;
    starsHistogram[rounded]++;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24">
      
      {/* Breadcrumb Header */}
      <nav className="text-xs font-bold text-swift-mid mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-swift-orange">Home</Link>
        <span className="mx-2">&gt;</span>
        <Link to={`/category/${product.category}`} className="hover:text-swift-orange capitalize">{product.category}</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-swift-dark truncate max-w-[200px] inline-block align-bottom">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Left Column: Image/Video Gallery (5 cols on large desktop) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-gray-100 rounded-card p-4 shadow-xs relative">
            
            {/* Wishlist Button (absolute top-right) */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 z-20 p-2.5 rounded-full border border-gray-100 shadow-sm bg-white hover:scale-105 transition-all ${
                isSaved ? 'text-swift-red' : 'text-swift-mid hover:text-swift-red'
              }`}
              aria-label="Toggle Wishlist"
            >
              <Heart className="w-5.5 h-5.5" fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            {/* Magnifier Glass Lens Container (Desktop only) */}
            <div 
              className="relative w-full aspect-[4/4] bg-gray-50 rounded-button overflow-hidden cursor-crosshair flex items-center justify-center"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {showVideo && product.videoUrl ? (
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover rounded-button"
                />
              ) : (
                <img
                  ref={mainImageRef}
                  src={product.images[activeMediaIdx] || FALLBACK_IMAGE}
                  alt={product.name}
                  className="w-full h-full object-contain max-h-[450px]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              )}

              {/* Magnifier glass circle */}
              {!showVideo && (
                <div 
                  className="magnifier-lens" 
                  style={zoomStyle} 
                />
              )}
            </div>

            {/* Quick choice indicators */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                <span className="text-white text-xs font-extrabold uppercase px-4 py-2 bg-swift-red rounded-pill tracking-wider shadow-modal">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail list (include video if available) */}
          <div className="flex gap-2.5 overflow-x-auto py-1 no-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveMediaIdx(idx);
                  setShowVideo(false);
                }}
                className={`w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-button overflow-hidden bg-white hover:border-swift-orange flex-shrink-0 transition-all ${
                  activeMediaIdx === idx && !showVideo ? 'border-swift-orange scale-95 shadow-sm' : 'border-gray-100'
                }`}
              >
                <img
                  src={img || FALLBACK_IMAGE}
                  alt="Product thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </button>
            ))}

            {product.videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                className={`w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-button overflow-hidden bg-gray-900 flex-shrink-0 flex flex-col items-center justify-center text-white relative ${
                  showVideo ? 'border-swift-orange' : 'border-gray-150'
                }`}
                aria-label="Play video"
              >
                <Play className="w-6 h-6 fill-white" />
                <span className="text-[9px] uppercase font-bold tracking-wider mt-1 text-gray-300">Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Product Detail details (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Info */}
          <div>
            <Link 
              to={`/search?q=${product.brand}`} 
              className="text-xs font-extrabold text-swift-blue uppercase tracking-wider hover:underline"
            >
              {product.brand} Store
            </Link>
            
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-swift-dark leading-tight mt-1">
              {product.name}
            </h1>

            {/* Ratings anchor links */}
            <button
              onClick={() => {
                setActiveTab('reviews');
                reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 mt-3 group"
            >
              <div className="flex items-center bg-swift-orange/10 px-2 py-0.5 rounded-button text-swift-orange font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-swift-orange" />
                <span className="ml-1">{product.rating}</span>
              </div>
              <span className="text-xs font-semibold text-swift-mid group-hover:underline">
                {product.reviewCount} customer reviews
              </span>
            </button>
          </div>

          {/* Pricing Section */}
          <div className="bg-white border border-gray-100 rounded-card p-4 shadow-xs">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-3xl font-extrabold text-swift-dark font-mono">₹{product.price.toLocaleString('en-IN')}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-base text-swift-mid line-through font-mono">MRP ₹{product.mrp.toLocaleString('en-IN')}</span>
                  <span className="bg-swift-orange/15 text-swift-orange text-xs font-extrabold px-2 py-1 rounded-button uppercase tracking-wide">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-swift-mid mt-1.5 font-bold uppercase tracking-wider">Inclusive of all local taxes</p>
          </div>

          {product.variants.map((variant) => (
            <div key={variant.name} className="space-y-2 border-b border-gray-100 pb-4">
              <span className="block text-xs font-bold text-swift-dark uppercase tracking-wider">
                Select {variant.name}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {variant.options.map((opt) => {
                  const isSelected = selectedVariants[variant.name] === opt;
                  
                  if (variant.type === 'color') {
                    return (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: opt }))}
                        className={`px-4 py-2.5 min-h-[38px] rounded-button text-xs sm:text-sm font-bold transition-all border flex items-center gap-2 ${
                          isSelected
                            ? 'border-swift-orange bg-swift-orange/5 text-swift-orange shadow-xs'
                            : 'border-gray-200 bg-white text-swift-dark hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-gray-300 bg-gray-500 shrink-0" style={{ backgroundColor: opt.toLowerCase() }} />
                        <span>{opt}</span>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: opt }))}
                      className={`px-4 py-2.5 min-w-[44px] min-h-[38px] rounded-button text-xs sm:text-sm font-bold transition-all border ${
                        isSelected
                          ? 'border-swift-blue bg-swift-blue/5 text-swift-blue shadow-xs'
                          : 'border-gray-200 bg-white text-swift-dark hover:bg-gray-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-swift-dark uppercase tracking-wider">Quantity</span>
            <div className="flex items-center border border-gray-250 rounded-button bg-white">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="p-2 hover:bg-gray-50 text-swift-mid rounded-l-button"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const q = parseInt(e.target.value);
                  if (!isNaN(q) && q > 0) {
                    setQuantity(product.stockCount > 0 ? Math.min(q, product.stockCount) : q);
                  }
                }}
                className="w-12 border-none text-center font-bold text-sm focus:ring-0 p-0"
              />
              <button
                onClick={() => setQuantity(prev => {
                  if (product.stockCount > 0 && prev >= product.stockCount) return prev;
                  return prev + 1;
                })}
                className="p-2 hover:bg-gray-50 text-swift-mid rounded-r-button"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {product.stockCount > 0 && (
              <span className="text-xs text-swift-mid font-semibold">
                Only {product.stockCount} items left in stock!
              </span>
            )}
          </div>

          {/* Checkout & Actions Button block (Sticky on mobile, inline here) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 py-3.5 rounded-button font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                product.inStock
                  ? 'bg-transparent hover:bg-swift-blue/5 text-swift-blue border-swift-blue shadow-sm'
                  : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className={`flex-1 py-3.5 rounded-button font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                product.inStock
                  ? 'bg-swift-orange hover:bg-swift-orange-hover text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Buy Now</span>
            </button>
          </div>

          {/* Delivery checker */}
          <div className="bg-white border border-gray-100 rounded-card p-4 shadow-xs space-y-3">
            <div className="text-xs font-bold text-swift-dark uppercase tracking-wider flex items-center gap-2">
              <span>Delivery Availability Checker</span>
            </div>
            <form onSubmit={handlePincodeSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincodeCheck}
                onChange={(e) => setPincodeCheck(e.target.value.replace(/\D/g, ''))}
                className="flex-grow px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-swift-blue hover:bg-swift-blue-dark text-white rounded-button text-sm font-bold transition-all shadow-sm"
              >
                Check
              </button>
            </form>
            {deliveryResult && (
              <p className="text-xs text-swift-green font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{deliveryResult}</span>
              </p>
            )}
            {deliveryError && (
              <p className="text-xs text-swift-red font-semibold">
                Invalid pin. Please enter a valid 6-digit code.
              </p>
            )}
          </div>

          {/* Bank Offers */}
          <div className="border border-gray-100 rounded-card p-4 bg-gray-50/50 space-y-2">
            <span className="text-xs font-extrabold text-swift-dark uppercase tracking-wide">Available Bank Offers</span>
            <ul className="space-y-1.5">
              <li className="text-xs text-swift-mid flex items-start gap-1.5">
                <span className="font-bold text-swift-green shrink-0">Offer 1:</span>
                <span>Flat 10% Instant Discount on HDFC Bank Credit Cards on orders above ₹5,000.</span>
              </li>
              <li className="text-xs text-swift-mid flex items-start gap-1.5">
                <span className="font-bold text-swift-green shrink-0">Offer 2:</span>
                <span>Get 5% unlimited Cashback using SwiftCart Axis Bank cobranded card.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Tabs Layout: Details, Specs, Reviews */}
      <section className="bg-white border border-gray-100 rounded-card overflow-hidden shadow-card mb-16">
        
        {/* Tabs Headers */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {(['highlights', 'specs', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-6 py-4 font-heading font-extrabold text-sm border-b-2 text-center transition-all ${
                activeTab === tab
                  ? 'text-swift-orange border-swift-orange bg-white'
                  : 'text-swift-mid border-transparent hover:text-swift-dark'
              }`}
            >
              {tab === 'highlights' ? 'Product Highlights' : tab === 'specs' ? 'Specifications' : `Reviews (${product.reviews.length})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          
          {/* Highlights */}
          {activeTab === 'highlights' && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-swift-dark">Key Highlights</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.highlights.map((hl, i) => (
                  <li key={i} className="text-sm text-swift-mid flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-swift-green shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
              <div className="text-sm text-swift-mid leading-relaxed pt-4 border-t border-gray-50">
                <h4 className="font-bold text-swift-dark mb-2">Description</h4>
                <p>{product.description}</p>
              </div>
            </div>
          )}

          {/* Specs */}
          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="p-3 text-swift-dark font-extrabold">Technical Specifications</th>
                    <th className="p-3 text-swift-dark font-extrabold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 font-semibold text-swift-dark shrink-0">{key}</td>
                      <td className="p-3 text-swift-mid">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reviews Anchor */}
          {activeTab === 'reviews' && (
            <div ref={reviewSectionRef} className="space-y-8">
              
              {/* Histogram section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-gray-100 pb-8">
                
                {/* Score */}
                <div className="md:col-span-4 text-center space-y-2 border-r border-gray-100 py-2">
                  <div className="text-5xl font-extrabold text-swift-dark">{product.rating}</div>
                  <div className="flex items-center justify-center text-swift-orange gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.rating) ? 'fill-swift-orange' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-swift-mid">Based on {product.reviewCount} user feedback</p>
                </div>

                {/* Bars */}
                <div className="md:col-span-5 space-y-1.5">
                  {(Object.keys(starsHistogram) as unknown as (5|4|3|2|1)[]).reverse().map((stars) => {
                    const count = starsHistogram[stars];
                    const percent = product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0;
                    return (
                      <button
                        key={stars}
                        onClick={() => setReviewsFilter(reviewsFilter === stars ? null : stars)}
                        className={`w-full flex items-center gap-3 text-left p-1 rounded hover:bg-gray-50 transition-colors ${
                          reviewsFilter === stars ? 'bg-swift-orange/5 font-bold' : ''
                        }`}
                      >
                        <span className="w-8 text-xs font-bold text-swift-dark">{stars} ★</span>
                        <div className="flex-grow h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-swift-orange" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-10 text-xs text-swift-mid text-right">{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action button */}
                <div className="md:col-span-3 text-center">
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        addToast('Please login to write a review', 'warning');
                        navigate('/login');
                      } else {
                        setWriteReviewOpen(true);
                      }
                    }}
                    className="px-6 py-2.5 bg-swift-blue hover:bg-swift-blue-dark text-white rounded-button text-xs font-bold transition-all shadow-sm"
                  >
                    Write a Review
                  </button>
                </div>

              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-extrabold text-sm text-swift-dark">
                    {reviewsFilter ? `${reviewsFilter} Star Feedback` : 'Latest Verified Purchases'}
                  </h4>
                  {reviewsFilter && (
                    <button
                      onClick={() => setReviewsFilter(null)}
                      className="text-xs font-bold text-swift-orange hover:underline"
                    >
                      Show All Reviews
                    </button>
                  )}
                </div>

                {reviewsToDisplay.length === 0 ? (
                  <p className="text-xs text-swift-mid text-center py-6">No reviews matched this filter selection.</p>
                ) : (
                  reviewsToDisplay.map((rev) => (
                    <div key={rev.id} className="border-b border-gray-50 pb-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-swift-blue/15 text-swift-blue flex items-center justify-center text-xs font-bold font-mono">
                            {rev.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-swift-dark">{rev.username}</div>
                            <div className="text-[10px] text-swift-mid">Verified Purchase • {rev.date}</div>
                          </div>
                        </div>
                        {/* Rating */}
                        <div className="flex text-swift-orange gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-swift-orange' : 'text-gray-150'}`} />
                          ))}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pl-10 space-y-1">
                        <h5 className="font-bold text-sm text-swift-dark">{rev.title}</h5>
                        <p className="text-xs text-swift-mid leading-relaxed">{rev.body}</p>
                        
                        {/* Helpful checker */}
                        <div className="flex items-center gap-3 pt-2 text-[10px] text-swift-mid font-bold">
                          <span>Was this review helpful?</span>
                          <button className="flex items-center gap-1 hover:text-swift-blue border border-gray-200 px-2 py-0.5 rounded bg-white">
                            <ThumbsUp className="w-3 h-3" /> Yes ({rev.helpfulYesCount})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      </section>

      {/* Frequently Bought Together (Bundle widget) */}
      <section className="bg-white border border-gray-100 rounded-card p-6 shadow-card mb-16 space-y-6">
        <h3 className="font-heading font-extrabold text-lg text-swift-dark">Frequently Bought Together</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            
            {/* Primary Item */}
            <div className="text-center w-24">
              <img
                src={product.images[0] || FALLBACK_IMAGE}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-button border border-gray-100 mx-auto bg-gray-50"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <span className="block text-[10px] text-swift-dark font-semibold mt-1 truncate">{product.name}</span>
              <span className="block text-xs font-extrabold text-swift-dark mt-0.5">₹{product.price}</span>
            </div>

            <span className="text-xl text-swift-mid font-bold">+</span>

            {/* Simulated Bundle Companion */}
            <div className="text-center w-24">
              <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&auto=format&fit=crop&q=80" alt="SwiftBuds Pro" className="w-16 h-16 object-cover rounded-button border border-gray-100 mx-auto bg-gray-50" />
              <span className="block text-[10px] text-swift-dark font-semibold mt-1 truncate">SwiftBuds Lite</span>
              <span className="block text-xs font-extrabold text-swift-dark mt-0.5">₹899</span>
            </div>

          </div>

          <div className="h-full border-l border-gray-100 hidden md:block" />

          {/* Checkout pricing details */}
          <div className="text-center md:text-left space-y-2">
            <div>
              <div className="text-xs text-swift-mid font-bold">Bundle Price:</div>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-xl font-extrabold text-swift-dark font-mono">₹{(product.price + 899 - 100).toLocaleString('en-IN')}</span>
                <span className="text-xs text-swift-mid line-through">₹{product.price + 899}</span>
                <span className="text-xs font-bold text-swift-green bg-swift-green/10 px-1.5 py-0.5 rounded">Save ₹100</span>
              </div>
            </div>
            <button
              onClick={() => {
                addToCart(product, 1, selectedVariants);
                const addBuds = async () => {
                  try {
                    const response = await apiClient.get('/api/v1/products', { params: { size: '1' } });
                    const buds = response.content?.[0] ? mapBackendProduct(response.content[0]) : null;
                    if (buds) addToCart(buds, 1, {});
                  } catch (e) {}
                };
                addBuds();
                addToast('Combo bundle successfully added to Cart!', 'success');
              }}
              className="px-5 py-2.5 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-xs shadow-sm transition-all"
            >
              Add Both to Cart
            </button>
          </div>
        </div>
      </section>

      {/* Customers Also Bought (Sliders row) */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-heading font-extrabold text-lg text-swift-dark">Customers Also Bought</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Write a Review Modal */}
      {writeReviewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="bg-white rounded-modal w-full max-w-md p-6 shadow-modal overflow-y-auto max-h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-heading font-extrabold text-lg text-swift-dark">Write a review</h3>
              <button 
                onClick={() => setWriteReviewOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star selector */}
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1.5">Overall Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewReviewRating(s)}
                      className="p-1 hover:scale-105 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${s <= newReviewRating ? 'text-swift-orange fill-swift-orange' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1">Review Title</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent purchase, works great!"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1">Share detailed feedback</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you like or dislike about this product..."
                  value={newReviewBody}
                  onChange={(e) => setNewReviewBody(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWriteReviewOpen(false)}
                  className="flex-grow py-2.5 text-xs font-bold text-swift-dark border border-gray-200 rounded-button hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 text-xs font-bold text-white bg-swift-orange hover:bg-swift-orange-hover rounded-button shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
