import React, { useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/useSwiftStore";

// Global Components
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { ToastContainer } from "./components/ToastContainer";
import { ChatWidget } from "./components/chatbot/ChatWidget";
import { LiveActivityBanner } from "./components/LiveActivityBanner";

// Lazy Loaded Page Components for Code Splitting
const Home = React.lazy(() =>
  import("./pages/Home").then((m) => ({ default: m.Home })),
);
const ProductListing = React.lazy(() =>
  import("./pages/ProductListing").then((m) => ({ default: m.ProductListing })),
);
const ProductDetail = React.lazy(() =>
  import("./pages/ProductDetail").then((m) => ({ default: m.ProductDetail })),
);
const Cart = React.lazy(() =>
  import("./pages/Cart").then((m) => ({ default: m.Cart })),
);
const Checkout = React.lazy(() =>
  import("./pages/Checkout").then((m) => ({ default: m.Checkout })),
);
const Dashboard = React.lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Search = React.lazy(() =>
  import("./pages/Search").then((m) => ({ default: m.Search })),
);
const SellerStore = React.lazy(() =>
  import("./pages/SellerStore").then((m) => ({ default: m.SellerStore })),
);
const Deals = React.lazy(() =>
  import("./pages/Deals").then((m) => ({ default: m.Deals })),
);
const Login = React.lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.Login })),
);
const NotFound = React.lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);
const PolicyInfo = React.lazy(() =>
  import("./pages/PolicyInfo").then((m) => ({ default: m.PolicyInfo })),
);
const AdminPanel = React.lazy(() =>
  import("./pages/AdminPanel").then((m) => ({ default: m.AdminPanel })),
);
const OAuth2Callback = React.lazy(() => import("./pages/OAuth2Callback"));
const SellerRegister = React.lazy(() =>
  import("./pages/SellerRegister").then((m) => ({
    default: m.SellerRegister,
  })),
);
const SellerDashboard = React.lazy(() =>
  import("./pages/SellerDashboard").then((m) => ({
    default: m.SellerDashboard,
  })),
);
const OrderTrackingPage = React.lazy(() =>
  import("./pages/OrderTrackingPage").then((m) => ({
    default: m.OrderTrackingPage,
  })),
);

// Query Client for React Query server state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Loading Fallback Spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-2 border-swift-orange border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Top-level Error Boundary to catch render failures
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-swift-dark mb-2">
            Something went wrong
          </h2>
          <p className="text-swift-mid text-sm max-w-md mb-6">
            An unexpected error occurred while loading this page. Please refresh to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-medium text-sm transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Guard
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isLoggedIn, user } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    const redirectPath = encodeURIComponent(
      location.pathname + location.search,
    );
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  if (requiredRole) {
    const userRole = user?.role?.toUpperCase();
    if (requiredRole === "ADMIN" && userRole !== "ADMIN") {
      return <Navigate to="/" replace />;
    }
    if (
      requiredRole === "SELLER" &&
      userRole !== "SELLER" &&
      userRole !== "ADMIN"
    ) {
      return <Navigate to="/seller/register" replace />;
    }
  }

  return children;
};

// Scroll To Top on route change helper
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Accessibility - skip to main content helper
const SkipToContent = () => {
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
  const { categoryName } = useParams();
  return <ProductListing key={categoryName} />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/category/:categoryName"
                    element={<ProductListingRoute />}
                  />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/search" element={<Search />} />
                  <Route path="/seller/:sellerId" element={<SellerStore />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/oauth2/callback" element={<OAuth2Callback />} />
                  <Route
                    path="/login/admin"
                    element={<Navigate to="/login?redirect=admin" replace />}
                  />
                  <Route
                    path="/admin/login"
                    element={<Navigate to="/login?redirect=admin" replace />}
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="ADMIN">
                        <AdminPanel />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/seller/register" element={<SellerRegister />} />
                  <Route
                    path="/seller/dashboard"
                    element={
                      <ProtectedRoute requiredRole="SELLER">
                        <SellerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/track/:orderId"
                    element={<OrderTrackingPage />}
                  />
                  <Route path="/info/:pageKey" element={<PolicyInfo />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>

            {/* Page Footer */}
            <Footer />
            <ChatWidget />
            <LiveActivityBanner />
          </div>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
