import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, MapPin, Heart, LogOut, ChevronDown, X, Store } from 'lucide-react';
import { useCartStore, useAuthStore, useToastStore, useWishlistStore, mapBackendProduct } from '../store/useSwiftStore';
import { apiClient } from '../api/apiClient';
import type { Product } from '../data/mockDb';
import { FALLBACK_IMAGE } from './ProductCard';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Grocery', 'Beauty', 'Sports', 'Toys', 'Books'];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isLoggedIn, user, logout } = useAuthStore();
  const { cart, setCartOpen } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { addToast } = useToastStore();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ products: Product[]; categories: string[] }>({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  // Pincode state
  const [pincode, setPincode] = useState(() => localStorage.getItem('sc_pincode') || '');
  const [city, setCity] = useState(() => localStorage.getItem('sc_city') || 'India');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [tempPincode, setTempPincode] = useState('');

  // Dropdown states
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Refs for closing dropdowns on click outside
  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Active category navigation helper
  const categories = CATEGORIES;

  // Debounced search logic (300ms)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await apiClient.get('/api/v1/search', {
          params: { q: searchQuery, size: '5' }
        });
        const matchedProducts = (response.content || []).map(mapBackendProduct);
        const matchedCategories = categories.filter(c =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions({ products: matchedProducts, categories: matchedCategories });
      } catch (err) {
        console.error("Suggestions fetch failed", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (type: 'product' | 'category', value: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setMobileSearchOpen(false);
    if (type === 'product') {
      navigate(`/product/${value}`);
    } else {
      navigate(`/category/${value}`);
    }
  };

  const getCityFromPincode = (pin: string): string => {
    if (!pin || pin.length !== 6) return 'India';
    const prefix2 = pin.substring(0, 2);
    const prefix3 = pin.substring(0, 3);
    
    // Major cities
    if (prefix3 === '110') return 'New Delhi';
    if (prefix3 === '400') return 'Mumbai';
    if (prefix3 === '411') return 'Pune';
    if (prefix3 === '560') return 'Bengaluru';
    if (prefix3 === '600') return 'Chennai';
    if (prefix3 === '700') return 'Kolkata';
    if (prefix3 === '500') return 'Hyderabad';
    if (prefix3 === '380') return 'Ahmedabad';
    if (prefix3 === '395') return 'Surat';
    if (prefix3 === '452') return 'Indore';
    if (prefix3 === '682') return 'Kochi';
    if (prefix3 === '751') return 'Bhubaneswar';
    if (prefix3 === '800') return 'Patna';
    
    switch (prefix2) {
      case '11': return 'Delhi';
      case '12':
      case '13': return 'Gurugram';
      case '14':
      case '15':
      case '16': return 'Chandigarh';
      case '17': return 'Shimla';
      case '18':
      case '19': return 'Srinagar';
      case '20':
      case '21':
      case '22':
      case '23':
      case '24':
      case '25':
      case '26':
      case '27':
      case '28': return 'Noida';
      case '30':
      case '31':
      case '32':
      case '33':
      case '34': return 'Jaipur';
      case '36':
      case '37':
      case '38':
      case '39': return 'Ahmedabad';
      case '40':
      case '41':
      case '42':
      case '43':
      case '44': return 'Mumbai';
      case '45':
      case '46':
      case '47':
      case '48': return 'Indore';
      case '49': return 'Raipur';
      case '50':
      case '51':
      case '52':
      case '53': return 'Hyderabad';
      case '56':
      case '57':
      case '58':
      case '59': return 'Bengaluru';
      case '60':
      case '61':
      case '62':
      case '63':
      case '64': return 'Chennai';
      case '67':
      case '68':
      case '69': return 'Kochi';
      case '70':
      case '71':
      case '72':
      case '73':
      case '74': return 'Kolkata';
      case '75':
      case '76':
      case '77': return 'Bhubaneswar';
      case '78': return 'Guwahati';
      case '80':
      case '81':
      case '82':
      case '83':
      case '84':
      case '85': return 'Patna';
      default: return 'India';
    }
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(tempPincode)) {
      const detectedCity = getCityFromPincode(tempPincode);
      setPincode(tempPincode);
      setCity(detectedCity);
      localStorage.setItem('sc_pincode', tempPincode);
      localStorage.setItem('sc_city', detectedCity);
      setShowPincodeModal(false);
      addToast(`Delivery location updated to ${detectedCity} (${tempPincode})`, 'success');
      navigate(`/search?q=${encodeURIComponent(detectedCity)}`);
    } else {
      addToast('Please enter a valid 6-digit pincode', 'error');
    }
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        {/* Main Navbar Row */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left Cluster: Logo & Location */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <div className="bg-swift-orange text-white p-1.5 rounded-button shadow-sm">
                  <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="font-heading font-extrabold text-2xl tracking-tight text-swift-dark flex items-center">
                  Swift<span className="text-swift-orange">Cart</span>
                </span>
              </Link>

              {/* Location Picker (Desktop) */}
              <button 
                onClick={() => {
                  setTempPincode(pincode);
                  setShowPincodeModal(true);
                }}
                className="hidden lg:flex items-center gap-2 text-swift-dark hover:text-swift-orange transition-colors duration-200 text-sm group text-left max-w-[200px]"
              >
                <MapPin className="w-5 h-5 text-swift-blue group-hover:text-swift-orange flex-shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] text-swift-mid uppercase font-bold tracking-wider leading-none">Deliver to</div>
                  <div className="font-bold text-swift-dark leading-tight group-hover:text-swift-orange">
                    {pincode ? `${city} ${pincode}` : 'India'}
                  </div>
                </div>
              </button>
            </div>

            {/* Center Cluster: Search (Desktop) */}
            <div ref={searchRef} className="hidden md:block flex-grow max-w-xl relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search brands, products, categories..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-button text-sm focus:bg-white focus:border-swift-orange transition-all duration-200"
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 px-3 text-swift-mid hover:text-swift-orange transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {showSuggestions && (searchQuery.trim().length >= 2) && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-card shadow-modal overflow-hidden z-50">
                  {suggestions.categories.length > 0 && (
                    <div className="p-2 border-b border-gray-50">
                      <div className="text-[10px] uppercase font-bold text-swift-mid px-3 py-1 tracking-wider">Suggested Categories</div>
                      {suggestions.categories.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleSuggestionClick('category', c)}
                          className="w-full text-left px-3 py-2 text-sm text-swift-dark hover:bg-swift-bg rounded-button font-medium transition-colors"
                        >
                          In <span className="text-swift-blue">{c}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.products.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] uppercase font-bold text-swift-mid px-3 py-1 tracking-wider">Suggested Products</div>
                      {suggestions.products.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSuggestionClick('product', p.slug || p.id)}
                          className="w-full text-left px-3 py-2 hover:bg-swift-bg rounded-button flex items-center gap-3 transition-colors"
                        >
                          <img
                            src={p.images[0] || FALLBACK_IMAGE}
                            alt={p.name}
                            className="w-8 h-8 rounded-button object-cover bg-gray-50 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                          />
                          <div className="truncate">
                            <div className="text-sm font-semibold text-swift-dark truncate">{p.name}</div>
                            <div className="text-xs text-swift-mid font-mono">₹{p.price.toLocaleString('en-IN')}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Cluster: Controls */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Become a Seller CTA (Desktop) */}
              {(!isLoggedIn || user?.role === 'CUSTOMER') && (
                <Link
                  to="/seller/register"
                  className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-swift-dark hover:text-swift-blue transition-colors"
                >
                  <Store className="w-4 h-4" />
                  <span>Become a Seller</span>
                </Link>
              )}
              {/* Search Toggle (Mobile Only) */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2 text-swift-dark hover:text-swift-orange rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Toggle Search"
              >
                {mobileSearchOpen ? <X className="w-5.5 h-5.5" /> : <Search className="w-5.5 h-5.5" />}
              </button>

              {/* Account Dropdown */}
              <div ref={accountRef} className="relative">
                {isLoggedIn ? (
                  <button
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                    className="flex items-center gap-1.5 p-2 text-swift-dark hover:text-swift-orange rounded-full md:rounded-button md:hover:bg-gray-50 transition-all duration-200"
                  >
                    <User className="w-5.5 h-5.5 text-swift-blue md:w-5 md:h-5" />
                    <span className="hidden md:inline text-sm font-semibold truncate max-w-[100px]">{user?.name.split(' ')[0]}</span>
                    <ChevronDown className="hidden md:inline w-4 h-4 text-swift-mid" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 md:px-4 text-sm font-bold text-white bg-swift-blue hover:bg-swift-blue-dark rounded-button transition-colors shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {showAccountDropdown && isLoggedIn && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-card shadow-modal py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-swift-mid font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-swift-dark truncate">{user?.name}</p>
                    </div>
                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowAccountDropdown(false)}
                        className="block px-4 py-2 text-sm text-swift-orange hover:bg-swift-bg font-extrabold transition-colors border-b border-gray-100"
                      >
                        Admin Panel
                      </Link>
                    )}
                    {user?.role === 'SELLER' && (
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setShowAccountDropdown(false)}
                        className="block px-4 py-2 text-sm text-swift-blue hover:bg-swift-bg font-extrabold transition-colors border-b border-gray-100"
                      >
                        🏪 Seller Dashboard
                      </Link>
                    )}
                    {user?.role === 'CUSTOMER' && (
                      <Link
                        to="/seller/register"
                        onClick={() => setShowAccountDropdown(false)}
                        className="block px-4 py-2 text-sm text-swift-blue hover:bg-blue-50 font-semibold transition-colors border-b border-gray-100"
                      >
                        🚀 Become a Seller
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      onClick={() => setShowAccountDropdown(false)}
                      className="block px-4 py-2 text-sm text-swift-dark hover:bg-swift-bg font-medium transition-colors"
                    >
                      My Dashboard
                    </Link>
                    <Link
                      to="/dashboard?tab=orders"
                      onClick={() => setShowAccountDropdown(false)}
                      className="block px-4 py-2 text-sm text-swift-dark hover:bg-swift-bg font-medium transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/dashboard?tab=wishlist"
                      onClick={() => setShowAccountDropdown(false)}
                      className="block px-4 py-2 text-sm text-swift-dark hover:bg-swift-bg font-medium transition-colors"
                    >
                      Wishlist ({wishlist.length})
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowAccountDropdown(false);
                        addToast('Successfully logged out', 'info');
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-swift-red hover:bg-red-50 border-t border-gray-100 flex items-center gap-2 font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/dashboard?tab=wishlist"
                className="relative p-2 text-swift-dark hover:text-swift-orange rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5.5 h-5.5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-swift-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Toggle */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-swift-dark hover:text-swift-orange rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5.5 h-5.5" />
                {totalCartItems > 0 && (
                  <span className="absolute top-1 right-1 bg-swift-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Mobile Search Row */}
          {mobileSearchOpen && (
            <div ref={searchRef} className="md:hidden mt-3 relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search SwiftCart..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-button text-sm focus:bg-white focus:border-swift-orange"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 px-3 text-swift-mid"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
              
              {/* Mobile suggestions */}
              {showSuggestions && (searchQuery.trim().length >= 2) && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-card shadow-modal overflow-hidden z-50">
                  {suggestions.categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleSuggestionClick('category', c)}
                      className="w-full text-left px-4 py-2 text-sm text-swift-dark hover:bg-swift-bg font-medium border-b border-gray-50"
                    >
                      In <span className="text-swift-blue">{c}</span>
                    </button>
                  ))}
                  {suggestions.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSuggestionClick('product', p.slug || p.id)}
                      className="w-full text-left px-4 py-3 hover:bg-swift-bg flex items-center gap-3 border-b border-gray-50"
                    >
                      <img
                        src={p.images[0] || FALLBACK_IMAGE}
                        alt={p.name}
                        className="w-8 h-8 rounded-button object-cover flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="truncate">
                        <div className="text-sm font-semibold text-swift-dark truncate">{p.name}</div>
                        <div className="text-xs text-swift-mid font-mono">₹{p.price.toLocaleString('en-IN')}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pincode bar (Mobile & Tablet subheader) */}
        <div className="lg:hidden bg-gray-50 border-t border-b border-gray-100 py-1.5 px-4">
          <button 
            onClick={() => {
              setTempPincode(pincode);
              setShowPincodeModal(true);
            }}
            className="flex items-center gap-2 text-swift-dark hover:text-swift-orange transition-colors text-xs font-semibold"
          >
            <MapPin className="w-4 h-4 text-swift-blue" />
            <span>Deliver to {pincode ? `${city} - ${pincode}` : 'India'}</span>
          </button>
        </div>

        {/* Horizontal Scrollable Categories Submenu */}
        <nav className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center gap-6 overflow-x-auto py-2.5 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              {categories.map((category) => {
                const isActive = location.pathname.includes(`/category/${category}`);
                return (
                  <Link
                    key={category}
                    to={`/category/${category}`}
                    className={`text-sm font-bold whitespace-nowrap transition-colors py-0.5 border-b-2 ${
                      isActive 
                        ? 'text-swift-orange border-swift-orange' 
                        : 'text-swift-dark border-transparent hover:text-swift-orange'
                    }`}
                  >
                    {category}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Pincode Selection Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-modal w-full max-w-sm p-6 shadow-modal">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-swift-dark">Choose delivery location</h3>
                <p className="text-xs text-swift-mid mt-0.5">Select a delivery pincode to check product availability and delivery speeds</p>
              </div>
              <button 
                onClick={() => setShowPincodeModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1.5">Enter 6-digit Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 560103"
                  className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange focus:ring-1 focus:ring-swift-orange"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPincodeModal(false)}
                  className="flex-1 py-2 text-sm font-bold text-swift-dark hover:bg-gray-50 border border-gray-200 rounded-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-sm font-bold text-white bg-swift-orange hover:bg-swift-orange-hover rounded-button shadow-sm"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
