import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle, Plus, Edit2, Trash2,
  Truck, Search, BarChart3, Boxes, IndianRupee, Eye, X,
  ChevronDown, ChevronUp, ImageIcon
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuthStore, useToastStore } from '../store/useSwiftStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SellerProduct {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  mrp: number;
  category: { id: number; name: string } | null;
  brand: string;
  stockQty: number;
  status: string;
  images: { id?: number; imageUrl: string }[];
  slug: string;
}

interface SellerOrderItem {
  id: number;
  product: { id: number; name: string; images?: { imageUrl: string }[] };
  productSnapshot: { name: string; imageUrl: string };
  quantity: number;
  unitPrice: number;
}

interface SellerOrder {
  id: number;
  orderUuid: string;
  placedAt: string;
  status: string;
  finalAmount: number;
  user: { id: number; name: string; email: string } | null;
  items: SellerOrderItem[];
  trackingId?: string;
}

interface DashboardStats {
  totalRevenue: number;
  unitsSold: number;
  lowStockAlerts: number;
  pendingOrders: number;
  recentOrders: SellerOrder[];
  revenueByMonth: { month: string; revenue: number }[];
}

interface CategoryOption {
  id: number;
  name: string;
}

type ActiveTab = 'overview' | 'products' | 'orders' | 'inventory';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

// ─── Product Form State ──────────────────────────────────────────────────────

const emptyProductForm = {
  name: '',
  description: '',
  basePrice: '',
  mrp: '',
  categoryId: '',
  brand: '',
  stockQty: '',
  imageUrl: '',
};

// ─── Component ───────────────────────────────────────────────────────────────

// ─── Skeleton Loaders (module-scoped to avoid state loss on re-render) ──────
const SkeletonCard: React.FC = () => (
  <div className="bg-white border border-gray-100 rounded-card p-5 shadow-card animate-pulse">
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-2 bg-gray-100 rounded w-1/3" />
  </div>
);

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="py-3" colSpan={7}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded" />
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-2 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    </td>
  </tr>
);

export const SellerDashboard: React.FC = () => {
  const { isLoggedIn, user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'SELLER') {
      navigate('/login');
    }
  }, [isLoggedIn, user?.role, navigate]);

  // ─── Core State ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // ─── Data State ──────────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // ─── Loading & Error State ───────────────────────────────────────────────
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // ─── Product Modal State ─────────────────────────────────────────────────
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [savingProduct, setSavingProduct] = useState(false);

  // ─── Delete Confirmation ─────────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Stock Quick-Edit ────────────────────────────────────────────────────
  const [stockEditId, setStockEditId] = useState<number | null>(null);
  const [stockEditValue, setStockEditValue] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);

  // ─── Order Filters ───────────────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // ─── Ship Modal ──────────────────────────────────────────────────────────
  const [shipModalOrderId, setShipModalOrderId] = useState<string | null>(null);
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [shipping, setShipping] = useState(false);

  // ─── Search ──────────────────────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState('');

  // ─── Bulk Stock ──────────────────────────────────────────────────────────
  const [bulkStockUpdates, setBulkStockUpdates] = useState<Record<number, string>>({});
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await apiClient.get('/api/v1/seller/dashboard');
      setStats({
        totalRevenue: data.totalRevenue ?? 0,
        unitsSold: data.unitsSold ?? 0,
        lowStockAlerts: data.lowStockAlerts ?? 0,
        pendingOrders: data.pendingOrders ?? 0,
        recentOrders: data.recentOrders ?? [],
        revenueByMonth: data.revenueByMonth ?? [
          { month: 'Jan', revenue: 12000 },
          { month: 'Feb', revenue: 19000 },
          { month: 'Mar', revenue: 15500 },
          { month: 'Apr', revenue: 22000 },
          { month: 'May', revenue: 28000 },
          { month: 'Jun', revenue: 24500 },
        ],
      });
    } catch (err: any) {
      // Use placeholder stats on error so the UI still renders
      setStats({
        totalRevenue: 0, unitsSold: 0, lowStockAlerts: 0, pendingOrders: 0,
        recentOrders: [], revenueByMonth: [
          { month: 'Jan', revenue: 12000 }, { month: 'Feb', revenue: 19000 },
          { month: 'Mar', revenue: 15500 }, { month: 'Apr', revenue: 22000 },
          { month: 'May', revenue: 28000 }, { month: 'Jun', revenue: 24500 },
        ],
      });
      addToast(err.message || 'Failed to load dashboard stats', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await apiClient.get('/api/v1/seller/products');
      const list = Array.isArray(data) ? data : data.content ?? [];
      setProducts(list);
    } catch (err: any) {
      addToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await apiClient.get('/api/v1/seller/orders');
      const list = Array.isArray(data) ? data : data.content ?? [];
      setOrders(list);
    } catch (err: any) {
      addToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiClient.get('/api/v1/categories');
      const list = Array.isArray(data) ? data : data.content ?? [];
      setCategories(list.map((c: any) => ({ id: c.id, name: c.name })));
    } catch {
      // Fallback categories
      setCategories([
        { id: 1, name: 'Electronics' }, { id: 2, name: 'Fashion' },
        { id: 3, name: 'Home & Kitchen' }, { id: 4, name: 'Sports' },
        { id: 5, name: 'Books' }, { id: 6, name: 'Beauty' },
      ]);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.role === 'SELLER') {
      fetchStats();
      fetchProducts();
      fetchOrders();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.role]);

  // ─── Handlers: Products ──────────────────────────────────────────────────

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setShowProductModal(true);
  };

  const openEditProduct = (p: SellerProduct) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description || '',
      basePrice: String(p.basePrice),
      mrp: String(p.mrp),
      categoryId: p.category ? String(p.category.id) : '',
      brand: p.brand || '',
      stockQty: String(p.stockQty),
      imageUrl: p.images?.[0]?.imageUrl || '',
    });
    setShowProductModal(true);
  };

  const handleProductFormChange = (field: string, value: string) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.basePrice) {
      addToast('Product name and price are required', 'error');
      return;
    }

    setSavingProduct(true);
    try {
      const payload: any = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        basePrice: Number(productForm.basePrice),
        mrp: Number(productForm.mrp) || Number(productForm.basePrice),
        brand: productForm.brand.trim(),
        stockQty: Number(productForm.stockQty) || 0,
      };
      if (productForm.categoryId) {
        payload.category = { id: Number(productForm.categoryId) };
      }
      if (productForm.imageUrl.trim()) {
        payload.images = [{ imageUrl: productForm.imageUrl.trim() }];
      }

      if (editingProduct) {
        await apiClient.put(`/api/v1/seller/products/${editingProduct.id}`, payload);
        addToast('Product updated successfully!', 'success');
      } else {
        await apiClient.post('/api/v1/seller/products', payload);
        addToast('Product created successfully!', 'success');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm(emptyProductForm);
      await fetchProducts();
    } catch (err: any) {
      addToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setDeleting(true);
    try {
      await apiClient.delete(`/api/v1/seller/products/${id}`);
      addToast('Product deleted successfully', 'success');
      setDeleteConfirmId(null);
      await fetchProducts();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleStockUpdate = async (id: number) => {
    const qty = Number(stockEditValue);
    if (isNaN(qty) || qty < 0) {
      addToast('Please enter a valid stock quantity', 'error');
      return;
    }
    setUpdatingStock(true);
    try {
      await apiClient.put(`/api/v1/seller/products/${id}/stock?qty=${qty}`);
      addToast('Stock updated successfully', 'success');
      setStockEditId(null);
      setStockEditValue('');
      await fetchProducts();
    } catch (err: any) {
      addToast(err.message || 'Failed to update stock', 'error');
    } finally {
      setUpdatingStock(false);
    }
  };

  // ─── Handlers: Orders ────────────────────────────────────────────────────

  const handleShipOrder = async () => {
    if (!shipModalOrderId || !trackingIdInput.trim()) {
      addToast('Please enter a tracking ID', 'error');
      return;
    }
    setShipping(true);
    try {
      await apiClient.put(`/api/v1/seller/orders/${shipModalOrderId}/ship?trackingId=${encodeURIComponent(trackingIdInput.trim())}`);
      addToast('Order shipped successfully!', 'success');
      setShipModalOrderId(null);
      setTrackingIdInput('');
      await fetchOrders();
    } catch (err: any) {
      addToast(err.message || 'Failed to ship order', 'error');
    } finally {
      setShipping(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  // ─── Handlers: Inventory / Bulk ──────────────────────────────────────────

  const lowStockProducts = products.filter((p) => p.stockQty > 0 && p.stockQty < 5);
  const outOfStockProducts = products.filter((p) => p.stockQty === 0);
  const healthyStockProducts = products.filter((p) => p.stockQty >= 5);

  const handleBulkStockUpdate = async () => {
    const entries = Object.entries(bulkStockUpdates).filter(
      ([, val]) => val !== '' && !isNaN(Number(val))
    );
    if (entries.length === 0) {
      addToast('No stock changes to apply', 'error');
      return;
    }
    setBulkUpdating(true);
    let successCount = 0;
    for (const [id, qty] of entries) {
      try {
        await apiClient.put(`/api/v1/seller/products/${id}/stock?qty=${Number(qty)}`);
        successCount++;
      } catch {
        // continue with remaining
      }
    }
    addToast(`Updated stock for ${successCount} product(s)`, 'success');
    setBulkStockUpdates({});
    setBulkUpdating(false);
    await fetchProducts();
  };

  // ─── Filtered Products for Search ────────────────────────────────────────

  const displayProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PLACED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      CONFIRMED: 'bg-swift-blue/10 text-swift-blue border-swift-blue/20',
      DISPATCHED: 'bg-orange-50 text-orange-600 border-orange-200',
      SHIPPED: 'bg-orange-50 text-orange-600 border-orange-200',
      DELIVERED: 'bg-green-50 text-green-700 border-green-200',
      CANCELLED: 'bg-red-50 text-red-600 border-red-200',
      RETURNED: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return map[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getStockColor = (qty: number) => {
    if (qty === 0) return 'text-red-600 bg-red-50';
    if (qty < 5) return 'text-orange-600 bg-orange-50';
    return 'text-green-700 bg-green-50';
  };

  const getProductImage = (p: SellerProduct) =>
    p.images?.[0]?.imageUrl || FALLBACK_IMAGE;

  // ─── Sidebar Tabs ────────────────────────────────────────────────────────

  const sidebarItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" />, badge: products.length },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" />, badge: orders.length },
    { id: 'inventory', label: 'Inventory', icon: <Boxes className="w-5 h-5" />, badge: lowStockProducts.length + outOfStockProducts.length },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────

  if (!isLoggedIn || user?.role !== 'SELLER') return null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 pb-24 text-left">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-swift-blue/10 text-swift-blue px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              Seller Hub
            </span>
            <span className="text-xs text-swift-mid">• Welcome back, {user?.name}</span>
          </div>
          <h1 id="seller-dashboard-title" className="font-heading font-extrabold text-2xl md:text-3xl text-swift-dark mt-1">
            Seller Dashboard
          </h1>
          <p className="text-sm text-swift-mid mt-1">
            Manage your products, track orders, and grow your business on SwiftCart.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 self-start md:self-center">
          <button
            id="seller-add-product-header"
            onClick={() => { setActiveTab('products'); openAddProduct(); }}
            className="px-4 py-2.5 bg-swift-orange hover:bg-orange-600 text-white rounded-button text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            id="seller-view-orders-header"
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2.5 border border-swift-blue text-swift-blue hover:bg-swift-blue/5 rounded-button text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>View Orders</span>
          </button>
        </div>
      </div>

      {/* ═══ Layout Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ─── Mobile Tab Bar ─── */}
        <div className="lg:hidden flex gap-1 bg-white border border-gray-100 rounded-card p-1.5 shadow-card overflow-x-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              id={`seller-tab-mobile-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-button text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-swift-blue text-white shadow-xs'
                  : 'text-swift-dark hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-pill ${
                  activeTab === item.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-swift-mid'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-card p-4 shadow-card sticky top-24 space-y-1">
            <div className="text-[10px] uppercase font-bold text-swift-mid tracking-wider px-3 mb-3">
              Dashboard Navigation
            </div>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                id={`seller-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-button text-sm font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-swift-blue text-white shadow-sm'
                    : 'text-swift-dark hover:bg-swift-bg'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-pill ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-swift-mid'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Seller Info Card */}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex items-center gap-3 px-3">
                <div className="w-9 h-9 bg-swift-blue text-white rounded-full flex items-center justify-center font-bold text-sm font-heading">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'S'}
                </div>
                <div>
                  <div className="text-xs font-bold text-swift-dark">{user?.name}</div>
                  <div className="text-[10px] text-swift-mid">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="lg:col-span-4 space-y-6 min-h-[60vh]">

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: OVERVIEW
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              {loadingStats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue */}
                  <div className="bg-white border border-gray-100 rounded-card p-5 shadow-card relative overflow-hidden group hover:shadow-sm transition-shadow">
                    <div className="absolute right-3 top-3 bg-green-50 p-2 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-swift-mid tracking-wider block">
                      Total Revenue
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl text-swift-dark font-mono mt-1">
                      {formatCurrency(stats?.totalRevenue || 0)}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Lifetime earnings</span>
                    </div>
                  </div>

                  {/* Units Sold */}
                  <div className="bg-white border border-gray-100 rounded-card p-5 shadow-card relative overflow-hidden group hover:shadow-sm transition-shadow">
                    <div className="absolute right-3 top-3 bg-swift-blue/10 p-2 rounded-lg text-swift-blue group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-swift-mid tracking-wider block">
                      Units Sold
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl text-swift-dark font-mono mt-1">
                      {(stats?.unitsSold || 0).toLocaleString('en-IN')}
                    </h3>
                    <span className="text-[10px] text-swift-mid font-semibold">Total units fulfilled</span>
                  </div>

                  {/* Low Stock */}
                  <div className="bg-white border border-gray-100 rounded-card p-5 shadow-card relative overflow-hidden group hover:shadow-sm transition-shadow">
                    <div className="absolute right-3 top-3 bg-orange-50 p-2 rounded-lg text-orange-500 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-swift-mid tracking-wider block">
                      Low Stock Alerts
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl text-swift-dark font-mono mt-1">
                      {stats?.lowStockAlerts ?? lowStockProducts.length}
                    </h3>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="text-[10px] text-orange-600 font-bold hover:underline"
                    >
                      View inventory →
                    </button>
                  </div>

                  {/* Pending Orders */}
                  <div className="bg-white border border-gray-100 rounded-card p-5 shadow-card relative overflow-hidden group hover:shadow-sm transition-shadow">
                    <div className="absolute right-3 top-3 bg-purple-50 p-2 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-swift-mid tracking-wider block">
                      Pending Orders
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl text-swift-dark font-mono mt-1">
                      {stats?.pendingOrders ?? 0}
                    </h3>
                    <button
                      onClick={() => { setActiveTab('orders'); setOrderFilter('PLACED'); }}
                      className="text-[10px] text-purple-600 font-bold hover:underline"
                    >
                      Process now →
                    </button>
                  </div>
                </div>
              )}

              {/* Revenue Chart (CSS Bar Chart) */}
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-6">
                  <h3 className="font-heading font-extrabold text-base text-swift-dark flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-swift-blue" />
                    Revenue Overview
                  </h3>
                  <span className="text-xs text-swift-mid font-semibold">Last 6 months</span>
                </div>
                <div className="flex items-end gap-3 h-48">
                  {(stats?.revenueByMonth || []).map((item, idx) => {
                    const maxRevenue = Math.max(...(stats?.revenueByMonth || []).map(r => r.revenue), 1);
                    const heightPercent = (item.revenue / maxRevenue) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-swift-dark">
                          {formatCurrency(item.revenue)}
                        </span>
                        <div className="w-full relative flex justify-center">
                          <div
                            className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-swift-blue to-swift-blue/60 transition-all duration-700 ease-out hover:from-swift-orange hover:to-swift-orange/60"
                            style={{ height: `${Math.max(heightPercent * 1.5, 8)}px` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-swift-mid">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
                  <h3 className="font-heading font-extrabold text-base text-swift-dark">
                    Recent Orders
                  </h3>
                  <button
                    id="seller-view-all-orders"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-swift-blue hover:text-swift-orange transition-colors"
                  >
                    View All Orders →
                  </button>
                </div>
                {loadingOrders ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex gap-4 py-3">
                        <div className="w-20 h-3 bg-gray-200 rounded" />
                        <div className="flex-1 h-3 bg-gray-100 rounded" />
                        <div className="w-16 h-3 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-swift-mid">
                    <ShoppingCart className="w-10 h-10 mx-auto opacity-40 mb-3" />
                    <p className="text-xs font-bold">No orders yet</p>
                    <p className="text-[10px] mt-0.5">Orders will appear here once customers purchase your products.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-swift-mid font-bold">
                          <th className="py-2 pr-4">Order ID</th>
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Customer</th>
                          <th className="py-2 pr-4">Total</th>
                          <th className="py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-semibold text-swift-dark">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-2.5 pr-4 font-mono text-swift-blue text-[10px]">
                              {order.orderUuid?.substring(0, 8) || `#${order.id}`}
                            </td>
                            <td className="py-2.5 pr-4 text-swift-mid">
                              {order.placedAt ? new Date(order.placedAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="py-2.5 pr-4">
                              {order.user?.name || 'Customer'}
                            </td>
                            <td className="py-2.5 pr-4 font-mono">
                              {formatCurrency(order.finalAmount || 0)}
                            </td>
                            <td className="py-2.5">
                              <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-pill border ${getStatusBadge(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  id="seller-quick-add-product"
                  onClick={() => { setActiveTab('products'); openAddProduct(); }}
                  className="bg-white border border-gray-100 rounded-card p-5 shadow-card text-left hover:border-swift-orange hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-swift-orange/10 p-2.5 rounded-lg text-swift-orange group-hover:bg-swift-orange group-hover:text-white transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-swift-dark">Add New Product</h4>
                      <p className="text-[10px] text-swift-mid mt-0.5">List a new product in your store</p>
                    </div>
                  </div>
                </button>
                <button
                  id="seller-quick-view-orders"
                  onClick={() => setActiveTab('orders')}
                  className="bg-white border border-gray-100 rounded-card p-5 shadow-card text-left hover:border-swift-blue hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-swift-blue/10 p-2.5 rounded-lg text-swift-blue group-hover:bg-swift-blue group-hover:text-white transition-all">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-swift-dark">View All Orders</h4>
                      <p className="text-[10px] text-swift-mid mt-0.5">Process and track customer orders</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: PRODUCTS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Header with Search + Add */}
              <div className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-swift-dark">
                      Product Catalog
                    </h3>
                    <p className="text-xs text-swift-mid mt-0.5">
                      {products.length} product{products.length !== 1 ? 's' : ''} in your store
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-swift-mid absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="seller-product-search"
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-button text-xs w-48 focus:border-swift-blue focus:outline-none focus:ring-1 focus:ring-swift-blue/20 transition-all"
                      />
                    </div>
                    <button
                      id="seller-add-product-btn"
                      onClick={openAddProduct}
                      className="px-4 py-2 bg-swift-orange hover:bg-orange-600 text-white rounded-button text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-gray-100 rounded-card shadow-card overflow-hidden">
                {loadingProducts ? (
                  <div className="p-6">
                    <table className="w-full"><tbody>{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</tbody></table>
                  </div>
                ) : displayProducts.length === 0 ? (
                  <div className="text-center py-16 text-swift-mid">
                    <Package className="w-12 h-12 mx-auto opacity-30 mb-3" />
                    <h4 className="font-bold text-sm text-swift-dark">No Products Found</h4>
                    <p className="text-xs mt-1">
                      {productSearch ? 'Try a different search term' : 'Start by adding your first product'}
                    </p>
                    {!productSearch && (
                      <button
                        onClick={openAddProduct}
                        className="mt-4 px-5 py-2 bg-swift-orange text-white rounded-button text-xs font-bold"
                      >
                        Add Your First Product
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-swift-mid font-bold text-[10px] uppercase tracking-wider">
                          <th className="py-3 px-4">Image</th>
                          <th className="py-3 px-4">Product Name</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Stock</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {displayProducts.map((product) => (
                          <tr
                            key={product.id}
                            className="hover:bg-gray-50/50 transition-colors font-semibold text-swift-dark group"
                          >
                            <td className="py-3 px-4">
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100 bg-gray-50"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = FALLBACK_IMAGE;
                                }}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-swift-dark max-w-[200px] truncate">
                                {product.name}
                              </div>
                              <div className="text-[10px] text-swift-mid font-normal mt-0.5">
                                {product.brand || 'No brand'} • {product.category?.name || 'Uncategorized'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-mono font-bold text-swift-dark">
                                {formatCurrency(product.basePrice)}
                              </div>
                              {product.mrp > product.basePrice && (
                                <div className="text-[10px] text-swift-mid line-through font-normal">
                                  {formatCurrency(product.mrp)}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {stockEditId === product.id ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    value={stockEditValue}
                                    onChange={(e) => setStockEditValue(e.target.value)}
                                    className="w-16 px-2 py-1 border border-swift-blue rounded text-xs font-mono focus:outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleStockUpdate(product.id)}
                                    disabled={updatingStock}
                                    className="text-[10px] font-bold text-white bg-swift-blue px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {updatingStock ? '...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => { setStockEditId(null); setStockEditValue(''); }}
                                    className="text-[10px] font-bold text-swift-mid hover:text-swift-dark"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setStockEditId(product.id); setStockEditValue(String(product.stockQty)); }}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${getStockColor(product.stockQty)} border-current/20`}
                                  title="Click to edit stock"
                                >
                                  {product.stockQty} units
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-pill border ${
                                product.status === 'ACTIVE' || product.status === 'APPROVED'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : product.status === 'PENDING'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}>
                                {product.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  id={`seller-edit-product-${product.id}`}
                                  onClick={() => openEditProduct(product)}
                                  className="p-1.5 border border-gray-200 rounded-lg hover:bg-swift-blue/5 hover:border-swift-blue text-swift-mid hover:text-swift-blue transition-all"
                                  title="Edit product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`seller-delete-product-${product.id}`}
                                  onClick={() => setDeleteConfirmId(product.id)}
                                  className="p-1.5 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 text-swift-mid hover:text-red-600 transition-all"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 3: ORDERS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Header + Filters */}
              <div className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-swift-dark">
                      Order Management
                    </h3>
                    <p className="text-xs text-swift-mid mt-0.5">
                      {orders.length} total order{orders.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'PLACED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED'].map((filter) => (
                      <button
                        key={filter}
                        id={`seller-order-filter-${filter.toLowerCase()}`}
                        onClick={() => setOrderFilter(filter)}
                        className={`px-3 py-1.5 rounded-button text-xs font-bold transition-all border ${
                          orderFilter === filter
                            ? 'bg-swift-blue border-swift-blue text-white shadow-xs'
                            : 'bg-white border-gray-200 text-swift-dark hover:bg-gray-50'
                        }`}
                      >
                        {filter}
                        {filter !== 'ALL' && (
                          <span className="ml-1 opacity-60">
                            ({orders.filter(o => o.status === filter).length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white border border-gray-100 rounded-card shadow-card overflow-hidden">
                {loadingOrders ? (
                  <div className="p-6">
                    <table className="w-full"><tbody>{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</tbody></table>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-16 text-swift-mid">
                    <ShoppingCart className="w-12 h-12 mx-auto opacity-30 mb-3" />
                    <h4 className="font-bold text-sm text-swift-dark">No Orders Found</h4>
                    <p className="text-xs mt-1">
                      {orderFilter !== 'ALL'
                        ? `No ${orderFilter.toLowerCase()} orders. Try a different filter.`
                        : 'Orders will appear here when customers make purchases.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-swift-mid font-bold text-[10px] uppercase tracking-wider">
                          <th className="py-3 px-4"></th>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Items</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredOrders.map((order) => (
                          <React.Fragment key={order.id}>
                            <tr className="hover:bg-gray-50/50 transition-colors font-semibold text-swift-dark">
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                  className="p-1 text-swift-mid hover:text-swift-dark transition-colors"
                                  id={`seller-expand-order-${order.id}`}
                                >
                                  {expandedOrderId === order.id
                                    ? <ChevronUp className="w-4 h-4" />
                                    : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </td>
                              <td className="py-3 px-4 font-mono text-swift-blue text-[10px]">
                                {order.orderUuid?.substring(0, 8) || `#${order.id}`}
                              </td>
                              <td className="py-3 px-4 text-swift-mid">
                                {order.placedAt ? new Date(order.placedAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                }) : '—'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold">{order.user?.name || 'Customer'}</div>
                                <div className="text-[10px] text-swift-mid font-normal">{order.user?.email || ''}</div>
                              </td>
                              <td className="py-3 px-4 font-mono">
                                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold">
                                {formatCurrency(order.finalAmount || 0)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-pill border ${getStatusBadge(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {(order.status === 'CONFIRMED' || order.status === 'PLACED') && (
                                  <button
                                    id={`seller-ship-order-${order.id}`}
                                    onClick={() => { setShipModalOrderId(order.orderUuid); setTrackingIdInput(''); }}
                                    className="px-3 py-1.5 bg-swift-blue hover:bg-blue-700 text-white rounded-button text-[10px] font-bold flex items-center gap-1 ml-auto transition-all"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Ship</span>
                                  </button>
                                )}
                              </td>
                            </tr>

                            {/* Expandable Order Detail Row */}
                            {expandedOrderId === order.id && (
                              <tr>
                                <td colSpan={8} className="px-4 py-0">
                                  <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-100">
                                    <span className="text-[10px] font-bold text-swift-mid uppercase tracking-wider block mb-3">
                                      Order Items
                                    </span>
                                    <div className="space-y-2.5">
                                      {order.items?.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-gray-100">
                                          <img
                                            src={item.productSnapshot?.imageUrl || item.product?.images?.[0]?.imageUrl || FALLBACK_IMAGE}
                                            alt={item.productSnapshot?.name || item.product?.name || ''}
                                            className="w-10 h-10 rounded object-cover border border-gray-100"
                                            onError={(e) => {
                                              e.currentTarget.onerror = null;
                                              e.currentTarget.src = FALLBACK_IMAGE;
                                            }}
                                          />
                                          <div className="flex-1">
                                            <div className="text-xs font-bold text-swift-dark">
                                              {item.productSnapshot?.name || item.product?.name || 'Product'}
                                            </div>
                                            <div className="text-[10px] text-swift-mid">
                                              Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                                            </div>
                                          </div>
                                          <div className="text-xs font-mono font-bold text-swift-dark">
                                            {formatCurrency(item.quantity * item.unitPrice)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex justify-end mt-3 pt-3 border-t border-gray-200">
                                      <div className="text-sm font-extrabold text-swift-dark">
                                        Order Total: <span className="font-mono text-swift-orange">{formatCurrency(order.finalAmount || 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 4: INVENTORY
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Stock Level Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-red-100 rounded-card p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider block">
                        Out of Stock
                      </span>
                      <h3 className="font-heading font-extrabold text-3xl text-red-600 font-mono mt-1">
                        {outOfStockProducts.length}
                      </h3>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                  <p className="text-[10px] text-swift-mid mt-2">Products with zero stock</p>
                </div>

                <div className="bg-white border border-orange-100 rounded-card p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-orange-500 tracking-wider block">
                        Low Stock (&lt; 5)
                      </span>
                      <h3 className="font-heading font-extrabold text-3xl text-orange-600 font-mono mt-1">
                        {lowStockProducts.length}
                      </h3>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <Boxes className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                  <p className="text-[10px] text-swift-mid mt-2">Need restocking soon</p>
                </div>

                <div className="bg-white border border-green-100 rounded-card p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider block">
                        Healthy Stock
                      </span>
                      <h3 className="font-heading font-extrabold text-3xl text-green-700 font-mono mt-1">
                        {healthyStockProducts.length}
                      </h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-[10px] text-swift-mid mt-2">Adequate inventory levels</p>
                </div>
              </div>

              {/* Critical Stock Items */}
              {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
                <div className="bg-white border border-gray-100 rounded-card shadow-card overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-heading font-extrabold text-base text-swift-dark flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Critical Stock Items
                    </h3>
                    <p className="text-xs text-swift-mid mt-0.5">
                      Products requiring immediate attention
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-swift-mid font-bold text-[10px] uppercase tracking-wider">
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4">Current Stock</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Update Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {[...outOfStockProducts, ...lowStockProducts].map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50/50 transition-colors font-semibold text-swift-dark">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  className="w-9 h-9 rounded object-cover border border-gray-100"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_IMAGE;
                                  }}
                                />
                                <div>
                                  <div className="font-bold text-swift-dark text-xs truncate max-w-[180px]">
                                    {product.name}
                                  </div>
                                  <div className="text-[10px] text-swift-mid font-normal">
                                    {product.brand || 'No brand'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-bold ${getStockColor(product.stockQty)}`}>
                                {product.stockQty} units
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-pill border ${
                                product.stockQty === 0
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-orange-50 text-orange-600 border-orange-200'
                              }`}>
                                {product.stockQty === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Qty"
                                  value={bulkStockUpdates[product.id] || ''}
                                  onChange={(e) =>
                                    setBulkStockUpdates(prev => ({ ...prev, [product.id]: e.target.value }))
                                  }
                                  className="w-20 px-2 py-1.5 border border-gray-200 rounded-button text-xs font-mono focus:border-swift-blue focus:outline-none text-center"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
                    <div className="p-4 border-t border-gray-100 flex justify-end">
                      <button
                        id="seller-bulk-stock-update"
                        onClick={handleBulkStockUpdate}
                        disabled={bulkUpdating || Object.values(bulkStockUpdates).filter(v => v !== '').length === 0}
                        className="px-5 py-2 bg-swift-blue hover:bg-blue-700 text-white rounded-button text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bulkUpdating ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Boxes className="w-3.5 h-3.5" />
                            <span>Apply Bulk Updates</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Full Inventory Table */}
              <div className="bg-white border border-gray-100 rounded-card shadow-card overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-heading font-extrabold text-base text-swift-dark">
                    Complete Inventory
                  </h3>
                  <p className="text-xs text-swift-mid mt-0.5">All products with stock levels</p>
                </div>
                {loadingProducts ? (
                  <div className="p-6">
                    <table className="w-full"><tbody>{[1,2,3].map(i => <SkeletonRow key={i} />)}</tbody></table>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 text-swift-mid">
                    <Boxes className="w-10 h-10 mx-auto opacity-30 mb-3" />
                    <p className="text-xs font-bold">No products in inventory</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-swift-mid font-bold text-[10px] uppercase tracking-wider">
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4">SKU / ID</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Stock Level</th>
                          <th className="py-3 px-4">Indicator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50/50 transition-colors font-semibold text-swift-dark">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  className="w-8 h-8 rounded object-cover border border-gray-100"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_IMAGE;
                                  }}
                                />
                                <span className="truncate max-w-[200px]">{product.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-swift-mid text-[10px]">
                              #{product.id}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              {formatCurrency(product.basePrice)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-bold ${getStockColor(product.stockQty)}`}>
                                {product.stockQty} units
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {/* Stock level indicator bar */}
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      product.stockQty === 0
                                        ? 'bg-red-500'
                                        : product.stockQty < 5
                                          ? 'bg-orange-400'
                                          : product.stockQty < 20
                                            ? 'bg-yellow-400'
                                            : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (product.stockQty / 50) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-swift-mid font-mono w-8">
                                  {product.stockQty > 50 ? '50+' : product.stockQty}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: Add / Edit Product
      ═══════════════════════════════════════════════════════════════════════ */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-modal shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-heading font-extrabold text-lg text-swift-dark">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                id="seller-close-product-modal"
                onClick={() => { setShowProductModal(false); setEditingProduct(null); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-swift-mid" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="seller-product-name"
                  type="text"
                  value={productForm.name}
                  onChange={(e) => handleProductFormChange('name', e.target.value)}
                  placeholder="e.g. Premium Wireless Earbuds"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm focus:border-swift-blue focus:outline-none focus:ring-1 focus:ring-swift-blue/20"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1">Description</label>
                <textarea
                  id="seller-product-description"
                  value={productForm.description}
                  onChange={(e) => handleProductFormChange('description', e.target.value)}
                  placeholder="Describe your product..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm focus:border-swift-blue focus:outline-none focus:ring-1 focus:ring-swift-blue/20 resize-none"
                />
              </div>

              {/* Price & MRP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-swift-dark mb-1">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="seller-product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.basePrice}
                    onChange={(e) => handleProductFormChange('basePrice', e.target.value)}
                    placeholder="999"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm font-mono focus:border-swift-blue focus:outline-none focus:ring-1 focus:ring-swift-blue/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-swift-dark mb-1">MRP (₹)</label>
                  <input
                    id="seller-product-mrp"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.mrp}
                    onChange={(e) => handleProductFormChange('mrp', e.target.value)}
                    placeholder="1499"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm font-mono focus:border-swift-blue focus:outline-none focus:ring-1 focus:ring-swift-blue/20"
                  />
                </div>
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-swift-dark mb-1">Category</label>
                  <select
                    id="seller-product-category"
                    value={productForm.categoryId}
                    onChange={(e) => handleProductFormChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm focus:border-swift-blue focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-swift-dark mb-1">Brand</label>
                  <input
                    id="seller-product-brand"
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => handleProductFormChange('brand', e.target.value)}
                    placeholder="e.g. Sony"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm focus:border-swift-blue focus:outline-none focus:ring-1 focus:ring-swift-blue/20"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1">Stock Quantity</label>
                <input
                  id="seller-product-stock"
                  type="number"
                  min="0"
                  value={productForm.stockQty}
                  onChange={(e) => handleProductFormChange('stockQty', e.target.value)}
                  placeholder="50"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm font-mono focus:border-swift-blue focus:outline-none focus:ring-1 focus:ring-swift-blue/20"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image URL
                  </span>
                </label>
                <input
                  id="seller-product-image"
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => handleProductFormChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm focus:border-swift-blue focus:outline-none focus:ring-1 focus:ring-swift-blue/20"
                />
                {productForm.imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={productForm.imageUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    <span className="text-[10px] text-swift-mid">Image preview</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowProductModal(false); setEditingProduct(null); }}
                  className="px-4 py-2.5 border border-gray-200 rounded-button text-xs font-bold text-swift-dark hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="seller-save-product"
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 py-2.5 bg-swift-orange hover:bg-orange-600 text-white rounded-button text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {savingProduct ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: Delete Confirmation
      ═══════════════════════════════════════════════════════════════════════ */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-modal shadow-modal w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-swift-dark mb-2">
              Delete Product?
            </h3>
            <p className="text-xs text-swift-mid mb-6">
              This action cannot be undone. The product will be permanently removed from your catalog.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-button text-xs font-bold text-swift-dark hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                id="seller-confirm-delete"
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-button text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: Ship Order (Tracking ID)
      ═══════════════════════════════════════════════════════════════════════ */}
      {shipModalOrderId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-modal shadow-modal w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-extrabold text-lg text-swift-dark flex items-center gap-2">
                <Truck className="w-5 h-5 text-swift-blue" />
                Ship Order
              </h3>
              <button
                onClick={() => { setShipModalOrderId(null); setTrackingIdInput(''); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-swift-mid" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1">
                  Order Reference
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-button text-xs font-mono text-swift-mid">
                  {shipModalOrderId.substring(0, 12)}...
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1">
                  Tracking ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="seller-tracking-id"
                  type="text"
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                  placeholder="e.g. AWB123456789"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm font-mono focus:border-swift-blue focus:outline-none focus:ring-1 focus:ring-swift-blue/20"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShipModalOrderId(null); setTrackingIdInput(''); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-button text-xs font-bold text-swift-dark hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="seller-confirm-ship"
                  onClick={handleShipOrder}
                  disabled={shipping || !trackingIdInput.trim()}
                  className="flex-1 px-4 py-2.5 bg-swift-blue hover:bg-blue-700 text-white rounded-button text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {shipping ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Shipping...</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-3.5 h-3.5" />
                      <span>Confirm Shipment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
