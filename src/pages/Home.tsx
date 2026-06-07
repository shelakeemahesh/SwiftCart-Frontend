import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Flame, ArrowRight, Store } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { apiClient } from '../api/apiClient';
import { mapBackendProduct, useAuthStore } from '../store/useSwiftStore';
import { ActiveOrderBanner } from '../components/ActiveOrderBanner';
import type { Product } from '../data/mockDb';

interface PromoBanner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  category: string;
  bgColor: string;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Banners list
  const BANNERS: PromoBanner[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80',
      title: 'Electronics Extravaganza',
      subtitle: 'Up to 60% OFF on Audio, Laptops, & Smart Wearables',
      category: 'Electronics',
      bgColor: 'from-[#185FA5] to-[#0C447C]'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=80',
      title: 'Summer Fashion Fiesta',
      subtitle: 'Flat 50% OFF on Streetwear & Athletic Shoes',
      category: 'Fashion',
      bgColor: 'from-[#D85A30] to-[#EF9F27]'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
      title: 'Home Zen Makeover',
      subtitle: 'Premium Furniture & Kitchen blenders at lowest price',
      category: 'Home',
      bgColor: 'from-teal-700 to-emerald-800'
    }
  ];

  const categories = [
    { name: 'Electronics', icon: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&auto=format&fit=crop&q=80' },
    { name: 'Fashion', icon: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=150&auto=format&fit=crop&q=80' },
    { name: 'Home', icon: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&auto=format&fit=crop&q=80' },
    { name: 'Grocery', icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80' },
    { name: 'Beauty', icon: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&auto=format&fit=crop&q=80' },
    { name: 'Sports', icon: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=80' },
    { name: 'Toys', icon: 'https://images.unsplash.com/photo-1537655780520-1e392edd816a?w=150&auto=format&fit=crop&q=80' },
    { name: 'Books', icon: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=80' }
  ];

  const brands = [
    { name: 'SwiftAudio', logo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&auto=format&fit=crop&q=80' },
    { name: 'AeroRun', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&auto=format&fit=crop&q=80' },
    { name: 'SmartVibe', logo: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=80&auto=format&fit=crop&q=80' },
    { name: 'HomeZen', logo: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=80&auto=format&fit=crop&q=80' },
    { name: 'OpalGlow', logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&auto=format&fit=crop&q=80' }
  ];

  // Carousel logic
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Flash Sale Timer logic
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t: number) => t.toString().padStart(2, '0');

  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);

  const { isLoggedIn } = useAuthStore();
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (!isLoggedIn) return;
      try {
        const data = await apiClient.get('/api/v1/orders/active');
        if (data && typeof data === 'object' && data.orderId) {
          setActiveOrder(data);
        }
      } catch (err) {
        console.error("Failed to load active order banner", err);
      }
    };
    fetchActiveOrder();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const trending = await apiClient.get('/api/v1/products/trending');
        const mappedTrending = (trending || []).map(mapBackendProduct);
        setTrendingProducts(mappedTrending);

        const arrivals = await apiClient.get('/api/v1/products/new-arrivals');
        setNewArrivals((arrivals || []).map(mapBackendProduct));

        const deals = await apiClient.get('/api/v1/products/deals');
        setFlashDeals((deals || []).map(mapBackendProduct));
        
        setBestSellers(mappedTrending.slice(0, 4));
      } catch (err) {
        console.error("Failed to load home product sections", err);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {activeOrder && <ActiveOrderBanner activeOrder={activeOrder} />}
      
      {/* 1. Hero Carousel */}
      <section 
        className="relative h-[250px] sm:h-[350px] md:h-[450px] overflow-hidden bg-gray-900 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {BANNERS.map((banner, index) => (
          <div
            key={banner.id}
            onClick={() => navigate(`/category/${banner.category}`)}
            className={`absolute inset-0 w-full h-full flex flex-col justify-center bg-gradient-to-r ${banner.bgColor} transition-opacity duration-700 cursor-pointer ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Banner Background Image with Overlay */}
            <div className="absolute inset-0 z-0 opacity-40">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            </div>
            
            {/* Text Overlay */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white space-y-3 sm:space-y-4">
              <span className="inline-block bg-swift-orange font-bold text-xs uppercase px-3 py-1 rounded-button shadow-sm tracking-wider">
                Limited Time Offer
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl leading-tight max-w-xl">
                {banner.title}
              </h2>
              <p className="text-sm sm:text-lg max-w-md opacity-90 font-medium">
                {banner.subtitle}
              </p>
              <div>
                <button className="bg-white hover:bg-swift-orange hover:text-white text-swift-dark font-extrabold text-sm px-6 py-3 rounded-button shadow-md transition-all duration-200">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Arrow Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white text-white hover:text-swift-dark rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % BANNERS.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white text-white hover:text-swift-dark rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Next Banner"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {BANNERS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-swift-orange w-6' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Flash Sale Strip */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-white rounded-card border border-gray-100 shadow-card p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-4">
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-button text-swift-red">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-swift-dark flex items-center gap-2">
                  Deals of the Day
                </h3>
                <p className="text-xs text-swift-mid">Top-rated items with limited-time discount drops</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-swift-mid" />
              <span className="text-xs font-bold text-swift-mid uppercase tracking-wide">Ends in:</span>
              <div className="flex gap-1 font-mono">
                <span className="bg-swift-orange text-white text-xs font-bold px-2 py-1 rounded">{formatTime(timeLeft.hours)}</span>
                <span className="text-swift-dark font-bold">:</span>
                <span className="bg-swift-orange text-white text-xs font-bold px-2 py-1 rounded">{formatTime(timeLeft.minutes)}</span>
                <span className="text-swift-dark font-bold">:</span>
                <span className="bg-swift-orange text-white text-xs font-bold px-2 py-1 rounded">{formatTime(timeLeft.seconds)}</span>
              </div>
            </div>

          </div>

          {/* Horizontally Scrollable Row */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {flashDeals.map((product) => (
              <div key={product.id} className="w-[180px] sm:w-[220px] flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
            <div className="flex-shrink-0 w-[180px] sm:w-[220px] bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-200 rounded-card flex flex-col items-center justify-center text-center p-6 gap-3 group transition-colors duration-200">
              <span className="p-3 bg-white rounded-full shadow-sm text-swift-orange group-hover:scale-110 transition-transform">
                <ArrowRight className="w-6 h-6" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-swift-dark">Explore More</h4>
                <p className="text-xs text-swift-mid mt-0.5">Find 50+ exciting deals</p>
              </div>
              <Link to="/deals" className="text-xs font-bold text-swift-blue hover:underline">
                View All Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <h3 className="font-heading font-extrabold text-xl text-swift-dark mb-1">Shop by Category</h3>
        <p className="text-xs text-swift-mid mb-6">Browse curated selections across our popular categories</p>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/category/${cat.name}`}
              className="bg-white border border-gray-100 p-4 rounded-card text-center hover:shadow-card hover:border-swift-orange transition-all duration-200 group shadow-xs"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden bg-gray-50 mb-3 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                <img src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-swift-dark group-hover:text-swift-orange transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Banner Ad Block */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/category/Electronics"
            className="relative h-[150px] sm:h-[200px] rounded-card overflow-hidden bg-gradient-to-br from-[#0C447C] to-[#185FA5] group shadow-card"
          >
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 md:opacity-50">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80" alt="Audio Store Ad" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 p-6 flex flex-col justify-center h-full text-white max-w-[60%] space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 w-fit px-2 py-0.5 rounded">Ad</span>
              <h4 className="font-heading font-extrabold text-base sm:text-xl leading-tight">Premium Audio Gear</h4>
              <p className="text-xs opacity-90">Experience immersive deep-bass with top brand ANC headphones.</p>
              <span className="text-xs font-bold underline mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore Audio Store
              </span>
            </div>
          </Link>

          <Link
            to="/category/Fashion"
            className="relative h-[150px] sm:h-[200px] rounded-card overflow-hidden bg-gradient-to-br from-[#D85A30] to-[#EF9F27] group shadow-card"
          >
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 md:opacity-50">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80" alt="Fashion Store Ad" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 p-6 flex flex-col justify-center h-full text-white max-w-[60%] space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 w-fit px-2 py-0.5 rounded">Ad</span>
              <h4 className="font-heading font-extrabold text-base sm:text-xl leading-tight">Athleisure Outfits</h4>
              <p className="text-xs opacity-90">Grab comfortable and stylistic workout shirts & sneakers.</p>
              <span className="text-xs font-bold underline mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Shop Sports Fashion
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Trending Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-swift-dark">Trending Now</h3>
            <p className="text-xs text-swift-mid">The most popular items searched and ordered today</p>
          </div>
          <Link to="/category/Electronics" className="text-sm font-bold text-swift-blue hover:underline flex items-center gap-1">
            <span>See All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {trendingProducts.map((product) => (
            <div key={product.id} className="w-[180px] sm:w-[220px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 6. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-swift-dark">Best Sellers</h3>
            <p className="text-xs text-swift-mid">Highest rated and most reliable goods on SwiftCart</p>
          </div>
          <Link to="/deals" className="text-sm font-bold text-swift-blue hover:underline flex items-center gap-1">
            <span>See All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {bestSellers.map((product) => (
            <div key={product.id} className="w-[180px] sm:w-[220px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 7. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-swift-dark">New Arrivals</h3>
            <p className="text-xs text-swift-mid">Fresh products just added to our collection</p>
          </div>
          <Link to="/category/Electronics" className="text-sm font-bold text-swift-blue hover:underline flex items-center gap-1">
            <span>See All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {newArrivals.map((product) => (
            <div key={product.id} className="w-[180px] sm:w-[220px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Become a Seller Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 my-8">
        <div className="bg-gradient-to-r from-swift-blue to-swift-blue-dark rounded-card p-8 md:p-12 text-white relative overflow-hidden shadow-card">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <Store className="w-full h-full text-white" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-swift-orange text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              SwiftCart Seller Hub
            </span>
            <h3 className="font-heading font-extrabold text-2xl md:text-3xl leading-tight">
              Start your selling journey on SwiftCart
            </h3>
            <p className="text-sm md:text-base opacity-90">
              Join thousands of merchants selling to millions of customers. Register in minutes with minimal documentation, low commissions, and 24/7 seller support.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/seller/register"
                className="bg-white text-swift-blue font-bold px-6 py-3 rounded-button text-sm hover:bg-gray-100 transition-colors shadow-md"
              >
                Register Now
              </Link>
              <button
                onClick={() => navigate('/info/about')}
                className="border border-white/40 hover:border-white text-white font-bold px-6 py-3 rounded-button text-sm transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Brand Spotlight */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <h3 className="font-heading font-extrabold text-xl text-swift-dark mb-1">Brand Spotlight</h3>
        <p className="text-xs text-swift-mid mb-6">Official storefronts of your favorite brands</p>

        <div className="bg-white rounded-card border border-gray-100 p-6 flex flex-wrap items-center justify-center sm:justify-between gap-6 shadow-xs">
          {brands.map((brand) => (
            <button
              key={brand.name}
              onClick={() => navigate(`/search?q=${brand.name}`)}
              className="flex items-center gap-3 p-3 border border-gray-100 hover:border-swift-orange rounded-card transition-all hover:shadow-card bg-gray-50/50 w-[180px]"
            >
              <img src={brand.logo} alt={brand.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
              <div className="text-left">
                <div className="text-sm font-extrabold text-swift-dark">{brand.name}</div>
                <div className="text-[10px] text-swift-mid">Official Store</div>
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
};
