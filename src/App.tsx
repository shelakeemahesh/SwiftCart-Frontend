import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Global Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ToastContainer } from './components/ToastContainer';
import { ChatWidget } from './components/chatbot/ChatWidget';

// Page Components
import { Home } from './pages/Home';
import { ProductListing } from './pages/ProductListing';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Dashboard } from './pages/Dashboard';
import { Search } from './pages/Search';
import { SellerStore } from './pages/SellerStore';
import { Deals } from './pages/Deals';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { PolicyInfo } from './pages/PolicyInfo';
import { AdminPanel } from './pages/AdminPanel';
import OAuth2Callback from './pages/OAuth2Callback';
import { SellerRegister } from './pages/SellerRegister';
import { SellerDashboard } from './pages/SellerDashboard';
import { OrderTrackingPage } from './pages/OrderTrackingPage';

// Query Client for React Query server state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// Scroll To Top on route change helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Accessibility - skip to main content helper
const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-swift-orange text-white px-4 py-2 rounded-button font-bold text-xs z-50 shadow-modal"
    >
      Skip to main content
    </a>
  );
};

const ProductListingRoute = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  return <ProductListing key={categoryName} />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col min-h-screen bg-swift-bg text-swift-dark font-sans selection:bg-swift-orange/30">
          {/* Skip link for accessibility */}
          <SkipToContent />
 
          {/* Sticky Navbar */}
          <Navbar />
 
          {/* Floating Cart Drawer overlay */}
          <CartDrawer />
 
          {/* Toast Notification channel */}
          <ToastContainer />
 
          {/* Main Layout Area */}
          <main id="main-content" className="flex-grow">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:categoryName" element={<ProductListingRoute />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/seller/:sellerId" element={<SellerStore />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/login" element={<Login />} />
              <Route path="/oauth2/callback" element={<OAuth2Callback />} />
              <Route path="/login/admin" element={<Navigate to="/login?redirect=admin" replace />} />
              <Route path="/admin/login" element={<Navigate to="/login?redirect=admin" replace />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/seller/register" element={<SellerRegister />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/orders/track/:orderId" element={<OrderTrackingPage />} />
              <Route path="/info/:pageKey" element={<PolicyInfo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Page Footer */}
          <Footer />
          <ChatWidget />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
// Trigger dev server reload
