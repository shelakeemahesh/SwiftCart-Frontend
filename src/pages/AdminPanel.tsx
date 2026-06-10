import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Ticket, 
  Zap, 
  Upload, 
  Play, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Search, 
  Loader2, 
  Database, 
  Code, 
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { useAuthStore, useToastStore } from '../store/useSwiftStore';
import { apiClient, API_BASE_URL } from '../api/apiClient';
import { mockDb } from '../data/mockDb';
import type { Product } from '../data/mockDb';
import { FALLBACK_IMAGE } from '../components/ProductCard';

// Predefined API endpoints for the Testing Deck
interface ApiPreset {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  defaultParams?: { key: string; value: string }[];
  defaultBody?: string;
  requiresFile?: boolean;
}

const API_PRESETS: ApiPreset[] = [
  {
    name: 'Get Sales Analytics',
    method: 'GET',
    path: '/api/v1/admin/analytics/sales',
    description: 'Retrieve summary of total revenues, active orders, and sales counts.'
  },
  {
    name: 'Get Top Products',
    method: 'GET',
    path: '/api/v1/admin/analytics/products',
    description: 'Retrieve top 20 active products ordered by units sold.'
  },
  {
    name: 'List Users',
    method: 'GET',
    path: '/api/v1/admin/users',
    description: 'Fetch paginated list of all registered users.',
    defaultParams: [
      { key: 'page', value: '0' },
      { key: 'size', value: '20' }
    ]
  },
  {
    name: 'Change User Role',
    method: 'PUT',
    path: '/api/v1/admin/users/1/role',
    description: 'Change the authorization role of a specific user.',
    defaultParams: [
      { key: 'role', value: 'SELLER' } // CUSTOMER, SELLER, ADMIN
    ]
  },
  {
    name: 'Deactivate User',
    method: 'DELETE',
    path: '/api/v1/admin/users/1',
    description: 'Mark a user as unverified/deactivated in the system.'
  },
  {
    name: 'List Products',
    method: 'GET',
    path: '/api/v1/admin/products',
    description: 'Fetch paginated list of all inventory products.',
    defaultParams: [
      { key: 'page', value: '0' },
      { key: 'size', value: '20' }
    ]
  },
  {
    name: 'Approve Product',
    method: 'PUT',
    path: '/api/v1/admin/products/1/approve',
    description: 'Approve a product to make it active and visible in catalog searches.'
  },
  {
    name: 'Reject Product',
    method: 'PUT',
    path: '/api/v1/admin/products/1/reject',
    description: 'Reject and deactivate a product from catalog listings.',
    defaultParams: [
      { key: 'reason', value: 'Incomplete specifications details' }
    ]
  },
  {
    name: 'List Orders',
    method: 'GET',
    path: '/api/v1/admin/orders',
    description: 'Fetch paginated list of all system orders sorted descending by ID.',
    defaultParams: [
      { key: 'page', value: '0' },
      { key: 'size', value: '20' }
    ]
  },
  {
    name: 'List Coupons',
    method: 'GET',
    path: '/api/v1/admin/coupons',
    description: 'Retrieve list of all coupons in the system.'
  },
  {
    name: 'Create Coupon',
    method: 'POST',
    path: '/api/v1/admin/coupons',
    description: 'Register a new discount coupon in the system.',
    defaultBody: JSON.stringify({
      code: 'SUPER50',
      type: 'FLAT', // PERCENT, FLAT, FREE_DELIVERY
      value: 50.00,
      minOrderValue: 200.00,
      maxDiscount: 50.00,
      usageLimit: 100,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      active: true
    }, null, 2)
  },
  {
    name: 'Edit Coupon',
    method: 'PUT',
    path: '/api/v1/admin/coupons/1',
    description: 'Update the parameters of an existing coupon.',
    defaultBody: JSON.stringify({
      code: 'WELCOME15',
      type: 'PERCENT',
      value: 15.00,
      minOrderValue: 50.00,
      maxDiscount: 150.00,
      usageLimit: 200,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      active: true
    }, null, 2)
  },
  {
    name: 'Deactivate Coupon',
    method: 'DELETE',
    path: '/api/v1/admin/coupons/1',
    description: 'Deactivate and disable a discount coupon.'
  },
  {
    name: 'List Flash Sales',
    method: 'GET',
    path: '/api/v1/admin/flash-sales',
    description: 'Retrieve all configured flash sales.'
  },
  {
    name: 'Create Flash Sale',
    method: 'POST',
    path: '/api/v1/admin/flash-sales',
    description: 'Schedule a new flash sale discount event for a product.',
    defaultBody: JSON.stringify({
      product: { id: 1 },
      salePrice: 80.00,
      startsAt: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      stockLimit: 10
    }, null, 2)
  },
  {
    name: 'Import Products CSV',
    method: 'POST',
    path: '/api/v1/admin/products/import',
    description: 'Trigger asynchronous background bulk import of products using a CSV file.',
    requiresFile: true
  },
  {
    name: 'Check Import Status',
    method: 'GET',
    path: '/api/v1/admin/products/import/status/some-job-uuid',
    description: 'Poll status (PENDING, SUCCESS, FAILED) of an asynchronous CSV import job.'
  }
];

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, setRole } = useAuthStore();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'products' | 'coupons' | 'flash' | 'csv' | 'testing'>('analytics');

  // --- API Testing Deck State ---
  const [selectedPresetName, setSelectedPresetName] = useState(API_PRESETS[0].name);
  const selectedPreset = API_PRESETS.find(p => p.name === selectedPresetName) || API_PRESETS[0];
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [apiPath, setApiPath] = useState(API_PRESETS[0].path);
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>(API_PRESETS[0].method);
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('sc_jwt_token') || '');
  const [queryParams, setQueryParams] = useState<{ key: string; value: string }[]>([]);
  const [requestBody, setRequestBody] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Response states
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string>('');

  // Local/Mock database states
  const [mockUsers, setMockUsers] = useState<any[]>([]);
  const [mockProducts, setMockProducts] = useState<Product[]>([]);
  const [mockCoupons, setMockCoupons] = useState<any[]>([]);
  const [mockFlashSales, setMockFlashSales] = useState<any[]>([]);
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  // Form states for adding items (Mock & presets creation)
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponVal, setNewCouponVal] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(499);
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');

  const [flashProductId, setFlashProductId] = useState('');
  const [flashPrice, setFlashPrice] = useState('');
  const [flashStockLimit, setFlashStockLimit] = useState('10');

  // Check role authorization on mount
  useEffect(() => {
    if (!isLoggedIn) {
      addToast('Please login to access the admin panel.', 'error');
      navigate('/login?redirect=admin');
      return;
    }
    if (user?.role !== 'ADMIN') {
      addToast('Access denied: Administrator role required.', 'error');
      navigate('/dashboard');
      return;
    }

    // Fetch real users from backend
    const fetchRealUsers = async () => {
      try {
        const data = await apiClient.get('/api/v1/admin/users?page=0&size=100');
        const usersList = data.content || data || [];
        const normalized = usersList.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          verified: u.verified !== undefined ? u.verified : (u.isVerified !== undefined ? u.isVerified : true)
        }));
        setMockUsers(normalized);
      } catch (err: any) {
        setMockUsers([
          { id: 1, name: 'Mahesh Kumar', phone: '9876543210', email: 'mahesh@swiftcart.com', role: 'ADMIN', verified: true },
          { id: 2, name: 'Amit Singh', phone: '9876543211', email: 'amit@swiftcart.com', role: 'SELLER', verified: true },
          { id: 3, name: 'Rohan Shah', phone: '9876543212', email: 'rohan@swiftcart.com', role: 'CUSTOMER', verified: true },
          { id: 4, name: 'Priya Patel', phone: '9876543213', email: 'priya@swiftcart.com', role: 'CUSTOMER', verified: false }
        ]);
      }
    };
    fetchRealUsers();
    setMockProducts(mockDb.getProducts());
    setMockCoupons([
      { id: 1, code: 'SWIFT20', discountType: 'percentage', value: 20, minSpend: 999, description: '20% Off on minimum spend of ₹999', active: true },
      { id: 2, code: 'FLAT100', discountType: 'flat', value: 100, minSpend: 799, description: 'Flat ₹100 Off on orders above ₹799', active: true },
      { id: 3, code: 'FREESHIP', discountType: 'flat', value: 0, minSpend: 499, description: 'Free Delivery on order value ₹499+', active: true }
    ]);
    setMockFlashSales([]);
  }, [isLoggedIn, user, navigate, addToast]);

  // Save JWT changes to localStorage
  const handleSaveJwt = (token: string) => {
    setJwtToken(token);
    localStorage.setItem('sc_jwt_token', token);
    addToast('JWT Auth Token saved locally for requests.', 'success');
  };

  // Execute actual REST API request against local running Spring Boot
  const handleExecuteRequest = async () => {
    setLoadingRequest(true);
    setResponseStatus(null);
    setResponseBody('');

    try {
      // Build query string
      const queryStr = queryParams
        .filter(p => p.key.trim() !== '')
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');

      const fullUrl = `${apiUrl.trim()}${apiPath}${queryStr ? '?' + queryStr : ''}`;

      const headers: HeadersInit = {
        'Accept': 'application/json'
      };

      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      let options: RequestInit = {
        method: apiMethod,
        headers: headers
      };

      if (selectedPreset.requiresFile) {
        if (!uploadedFile) {
          addToast('Please select a CSV file first.', 'error');
          setLoadingRequest(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', uploadedFile);
        options.body = formData;
        // Don't set Content-Type header when uploading file, browser sets it with boundary
      } else if (['POST', 'PUT'].includes(apiMethod) && requestBody) {
        headers['Content-Type'] = 'application/json';
        options.body = requestBody;
      }

      const response = await fetch(fullUrl, options);
      setResponseStatus(response.status);

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        setResponseBody(JSON.stringify(json, null, 2));
        
        // Custom extract jobId if triggering import CSV
        if (apiPath.includes('/import') && json.jobId) {
          setImportJobId(json.jobId);
          setImportStatus('PENDING');
          addToast(`Import job triggered: ${json.jobId}`, 'info');
        }
      } catch {
        setResponseBody(text || `HTTP status ${response.status}`);
      }

      if (response.ok) {
        addToast('Request successfully completed!', 'success');
      } else {
        addToast(`Request failed with status ${response.status}`, 'error');
      }
    } catch (err: any) {
      console.error(err);
      setResponseStatus(500);
      setResponseBody(JSON.stringify({
        error: 'Network Connection Failure',
        message: `Failed to connect to backend at ${apiUrl}. Make sure the Spring Boot server is active on that port.`,
        details: err.message
      }, null, 2));
      addToast('Network connection failed.', 'error');
    } finally {
      setLoadingRequest(false);
    }
  };

  // Add a parameter row
  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  // Remove a parameter row
  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  // Update parameter value
  const updateQueryParam = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...queryParams];
    updated[index][field] = val;
    setQueryParams(updated);
  };

  // Mock changes
  const handleToggleMockRole = async (id: number, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'CUSTOMER' : currentRole === 'CUSTOMER' ? 'SELLER' : 'ADMIN';
    try {
      await apiClient.put(`/api/v1/admin/users/${id}/role?role=${nextRole}`);
      setMockUsers(prev => prev.map(u => u.id === id ? { ...u, role: nextRole } : u));
      addToast(`Updated user role to ${nextRole} in database`, 'success');
    } catch (err: any) {
      setMockUsers(prev => prev.map(u => u.id === id ? { ...u, role: nextRole } : u));
      addToast(`[MOCK] Updated User role to ${nextRole}`, 'success');
    }
  };

  const handleToggleMockVerify = async (id: number) => {
    const targetUser = mockUsers.find(u => u.id === id);
    if (!targetUser) return;
    const nextVerifiedState = !targetUser.verified;
    try {
      await apiClient.put(`/api/v1/admin/users/${id}/verify?verified=${nextVerifiedState}`);
      setMockUsers(prev => prev.map(u => u.id === id ? { ...u, verified: nextVerifiedState } : u));
      addToast(`User ${nextVerifiedState ? 'activated' : 'deactivated'} in database`, 'success');
    } catch (err: any) {
      setMockUsers(prev => prev.map(u => u.id === id ? { ...u, verified: nextVerifiedState } : u));
      addToast('[MOCK] Toggled user verification status', 'success');
    }
  };

  const handleApproveProductMock = (id: string, approve: boolean) => {
    setMockProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: approve } : p));
    addToast(`[MOCK] Product ${approve ? 'approved' : 'rejected'} successfully.`, approve ? 'success' : 'error');
  };

  const handleCreateMockCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const newCp = {
      id: mockCoupons.length + 1,
      code: newCouponCode.toUpperCase(),
      discountType: newCouponType,
      value: Number(newCouponVal),
      minSpend: Number(newCouponMin),
      description: `${newCouponType === 'percentage' ? newCouponVal + '%' : '₹' + newCouponVal} Off on orders above ₹${newCouponMin}`,
      active: true
    };
    setMockCoupons([newCp, ...mockCoupons]);
    setNewCouponCode('');
    addToast(`[MOCK] Coupon ${newCp.code} created successfully`, 'success');
  };

  const handleDeactivateMockCoupon = (id: number) => {
    setMockCoupons(prev => prev.map(c => c.id === id ? { ...c, active: false } : c));
    addToast('[MOCK] Coupon deactivated', 'info');
  };

  const handleCreateMockFlash = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = mockProducts.find(p => p.id === flashProductId);
    if (!prod) {
      addToast('Product not found in inventory', 'error');
      return;
    }
    const newSale = {
      id: mockFlashSales.length + 1,
      product: prod,
      salePrice: Number(flashPrice),
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      stockLimit: Number(flashStockLimit),
      soldCount: 0
    };
    setMockFlashSales([newSale, ...mockFlashSales]);
    setFlashProductId('');
    setFlashPrice('');
    addToast(`[MOCK] Flash sale created for ${prod.name}`, 'success');
  };

  // Real Async CSV import trigger and polling
  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      addToast('Please select a CSV file first.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await apiClient.post('/api/v1/admin/products/import', formData);
      const jobId = response.jobId;
      setImportJobId(jobId);
      setImportStatus('PENDING');
      addToast(`Async CSV import job triggered: ${jobId}`, 'success');

      // Start polling status
      const interval = setInterval(async () => {
        try {
          const statusRes = await apiClient.get(`/api/v1/admin/products/import/status/${jobId}`);
          const status = statusRes.status || '';

          if (status.startsWith('SUCCESS')) {
            setImportStatus('COMPLETED');
            addToast('Bulk CSV products imported successfully!', 'success');
            clearInterval(interval);
          } else if (status.startsWith('FAILED')) {
            setImportStatus('FAILED');
            addToast(`CSV Import Failed: ${status}`, 'error');
            clearInterval(interval);
          } else if (status === 'PROCESSING') {
            setImportStatus('PROCESSING');
          } else if (status === 'PENDING') {
            setImportStatus('PENDING');
          }
        } catch (pollErr) {
          console.error("Error polling import status", pollErr);
        }
      }, 2000);

    } catch (err: any) {
      addToast(err.message || 'Failed to trigger CSV import.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-24 text-left">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-swift-orange/10 text-swift-orange px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              Control Panel
            </span>
            <span className="text-xs text-swift-mid">• Active Admin: {user?.name}</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-swift-dark mt-1">
            SwiftCart Admin Center
          </h1>
          <p className="text-sm text-swift-mid mt-1">
            Manage customer catalog moderation, coupon overrides, system telemetry, and test live server APIs.
          </p>
        </div>

        {/* Quick Role Switcher for Testing Sandbox */}
        <div className="bg-swift-bg border border-gray-250/70 p-3 rounded-card flex flex-col gap-1.5 self-start">
          <span className="text-[10px] uppercase font-bold tracking-wider text-swift-mid">Sandbox Role Switcher:</span>
          <div className="flex gap-2">
            <button 
              onClick={() => { setRole('ADMIN'); addToast('Role toggled to ADMIN', 'info'); }}
              className={`px-3 py-1 text-xs font-bold rounded-button transition-colors ${user?.role === 'ADMIN' ? 'bg-swift-orange text-white' : 'bg-white hover:bg-gray-100 text-swift-dark'}`}
            >
              ADMIN
            </button>
            <button 
              onClick={() => {
                navigate('/dashboard');
                setTimeout(() => {
                  setRole('CUSTOMER');
                  addToast('Role toggled to CUSTOMER. Panel exited.', 'warning');
                }, 50);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-button transition-colors ${user?.role === 'CUSTOMER' ? 'bg-swift-orange text-white' : 'bg-white hover:bg-gray-100 text-swift-dark'}`}
            >
              CUSTOMER
            </button>
            <button 
              onClick={() => {
                navigate('/seller/dashboard');
                setTimeout(() => {
                  setRole('SELLER');
                  addToast('Role toggled to SELLER. Panel exited.', 'warning');
                }, 50);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-button transition-colors ${user?.role === 'SELLER' ? 'bg-swift-orange text-white' : 'bg-white hover:bg-gray-100 text-swift-dark'}`}
            >
              SELLER
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Tabs Navigation & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Navigation Menu */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white border border-gray-100 rounded-card p-4 shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-swift-mid tracking-wider px-3 mb-2">Management Tabs</div>
            
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-swift-dark text-white shadow-sm' : 'text-swift-dark hover:bg-swift-bg'}`}
            >
              <LayoutDashboard className="w-4 h-4 text-swift-orange" />
              <span>Overview & Analytics</span>
            </button>

            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-swift-dark text-white shadow-sm' : 'text-swift-dark hover:bg-swift-bg'}`}
            >
              <Users className="w-4 h-4 text-swift-blue" />
              <span>User Base</span>
            </button>

            <button 
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-swift-dark text-white shadow-sm' : 'text-swift-dark hover:bg-swift-bg'}`}
            >
              <ShoppingBag className="w-4 h-4 text-swift-green" />
              <span>Catalog Moderation</span>
            </button>

            <button 
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-bold transition-all ${activeTab === 'coupons' ? 'bg-swift-dark text-white shadow-sm' : 'text-swift-dark hover:bg-swift-bg'}`}
            >
              <Ticket className="w-4 h-4 text-swift-red" />
              <span>Promo Coupons</span>
            </button>

            <button 
              onClick={() => setActiveTab('flash')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-bold transition-all ${activeTab === 'flash' ? 'bg-swift-dark text-white shadow-sm' : 'text-swift-dark hover:bg-swift-bg'}`}
            >
              <Zap className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
              <span>Flash Sales Scheduler</span>
            </button>

            <button 
              onClick={() => setActiveTab('csv')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-bold transition-all ${activeTab === 'csv' ? 'bg-swift-dark text-white shadow-sm' : 'text-swift-dark hover:bg-swift-bg'}`}
            >
              <Upload className="w-4 h-4 text-purple-500" />
              <span>Bulk CSV Importer</span>
            </button>

            <div className="border-t border-gray-100 my-2 pt-2"></div>
            <div className="text-[10px] uppercase font-bold text-swift-mid tracking-wider px-3 mb-2">Dev Console</div>

            <button 
              onClick={() => setActiveTab('testing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-bold transition-all ${activeTab === 'testing' ? 'bg-swift-orange text-white shadow-md' : 'text-swift-dark hover:bg-swift-orange/10 hover:text-swift-orange'}`}
            >
              <Code className="w-4 h-4" />
              <span>API Testing Deck</span>
            </button>
          </div>

          {/* Telemetry Status Widget */}
          <div className="bg-white border border-gray-100 rounded-card p-4 shadow-sm text-xs space-y-2">
            <span className="font-bold text-swift-dark block text-[10px] uppercase tracking-wider text-swift-mid">Services Status</span>
            <div className="space-y-1.5 font-semibold text-swift-dark font-mono">
              <div className="flex items-center justify-between">
                <span>MySQL Core:</span>
                <span className="text-swift-green">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Redis Rate Limit:</span>
                <span className="text-swift-green">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Elasticsearch Index:</span>
                <span className="text-swift-green">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Kafka Producer:</span>
                <span className="text-swift-green">ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tab Workspace Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tab 1: Overview & Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Analytics Header Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-100 rounded-card p-5 shadow-sm space-y-2 relative overflow-hidden group">
                  <div className="absolute right-3 top-3 bg-swift-orange/10 p-2 rounded text-swift-orange">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-xs uppercase font-bold text-swift-mid tracking-wider block">Total Sales Revenue</span>
                  <h3 className="font-heading font-extrabold text-3xl text-swift-dark font-mono">₹4,89,120</h3>
                  <div className="flex items-center gap-1 text-[10px] text-swift-green font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12.4% vs last week</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-card p-5 shadow-sm space-y-2 relative overflow-hidden group">
                  <div className="absolute right-3 top-3 bg-swift-blue/10 p-2 rounded text-swift-blue">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <span className="text-xs uppercase font-bold text-swift-mid tracking-wider block">Active Processing Orders</span>
                  <h3 className="font-heading font-extrabold text-3xl text-swift-dark font-mono">14 Orders</h3>
                  <span className="text-[10px] text-swift-mid font-semibold block">COD: 9 • Razorpay Prepaid: 5</span>
                </div>

                <div className="bg-white border border-gray-100 rounded-card p-5 shadow-sm space-y-2 relative overflow-hidden group">
                  <div className="absolute right-3 top-3 bg-swift-green/10 p-2 rounded text-swift-green">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs uppercase font-bold text-swift-mid tracking-wider block">Active Users Base</span>
                  <h3 className="font-heading font-extrabold text-3xl text-swift-dark font-mono">1,048</h3>
                  <span className="text-[10px] text-swift-green font-bold block">158 verified today</span>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="font-heading font-extrabold text-lg text-swift-dark">Top Performing Catalog Products</h3>
                  <span className="text-xs font-semibold text-swift-mid">Telemetry from Elasticsearch/MySQL DB</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-150 text-swift-mid font-bold">
                        <th className="py-2.5">Product ID</th>
                        <th className="py-2.5">Product Name</th>
                        <th className="py-2.5">Category</th>
                        <th className="py-2.5">Price</th>
                        <th className="py-2.5 text-center">Units Sold</th>
                        <th className="py-2.5 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-swift-dark">
                      {mockProducts.slice(0, 5).map((p, idx) => (
                        <tr key={p.id}>
                          <td className="py-3 font-mono font-bold text-swift-blue">{p.id}</td>
                          <td className="py-3 truncate max-w-[200px]">{p.name}</td>
                          <td className="py-3 text-swift-mid">{p.category}</td>
                          <td className="py-3 font-mono">₹{p.price}</td>
                          <td className="py-3 text-center font-mono text-swift-blue">{140 - idx * 24}</td>
                          <td className="py-3 text-right font-mono text-swift-green">₹{(p.price * (140 - idx * 24)).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: User Base Management */}
          {activeTab === 'users' && (
            <div className="bg-white border border-gray-100 rounded-card p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-50 pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-swift-dark">User Credentials Directory</h3>
                  <p className="text-xs text-swift-mid">Promote authorization levels or deactivate users simulator.</p>
                </div>
                <div className="relative max-w-xs">
                  <Search className="w-4 h-4 text-swift-mid absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search phone or email..."
                    className="pl-9 pr-4 py-1.5 w-full border border-gray-200 rounded-button text-xs focus:border-swift-orange"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-swift-mid font-bold">
                      <th className="py-2.5">ID</th>
                      <th className="py-2.5">User Details</th>
                      <th className="py-2.5">Mobile Phone</th>
                      <th className="py-2.5">Verified Status</th>
                      <th className="py-2.5">Role level</th>
                      <th className="py-2.5 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-swift-dark">
                    {mockUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-mono text-swift-mid">{u.id}</td>
                        <td className="py-3">
                          <div className="font-bold">{u.name}</div>
                          <div className="text-[10px] text-swift-mid leading-none font-normal">{u.email}</div>
                        </td>
                        <td className="py-3 font-mono">{u.phone}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.verified ? 'bg-swift-green/10 text-swift-green' : 'bg-swift-red/10 text-swift-red'}`}>
                            {u.verified ? 'VERIFIED' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1.5">
                          <button 
                            onClick={() => handleToggleMockRole(u.id, u.role)}
                            className="bg-swift-bg border border-gray-200 hover:border-swift-blue text-swift-dark px-2 py-1 rounded text-[10px] transition-colors"
                          >
                            Cycle Role
                          </button>
                          <button 
                            onClick={() => handleToggleMockVerify(u.id)}
                            className={`px-2 py-1 rounded text-[10px] border transition-colors ${u.verified ? 'bg-red-50 hover:bg-red-100 border-red-200 text-swift-red' : 'bg-green-50 hover:bg-green-100 border-green-200 text-swift-green'}`}
                          >
                            {u.verified ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Catalog Moderation */}
          {activeTab === 'products' && (
            <div className="bg-white border border-gray-100 rounded-card p-6 shadow-sm space-y-4">
              <div className="border-b border-gray-50 pb-4">
                <h3 className="font-heading font-extrabold text-lg text-swift-dark">Catalog Moderation Dashboard</h3>
                <p className="text-xs text-swift-mid">Approve or reject newly imported catalog products.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-swift-mid font-bold">
                      <th className="py-2.5">Product ID</th>
                      <th className="py-2.5">Catalog Item Details</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Unit Price</th>
                      <th className="py-2.5">Stock</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-swift-dark">
                    {mockProducts.slice(0, 6).map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 font-mono font-bold text-swift-blue">{p.id}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0] || FALLBACK_IMAGE}
                              alt=""
                              className="w-8 h-8 rounded object-cover bg-gray-50 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                            />
                            <div className="truncate max-w-[150px]">
                              <div className="font-bold truncate">{p.name}</div>
                              <div className="text-[10px] text-swift-mid font-normal">{p.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-swift-mid">{p.category}</td>
                        <td className="py-3 font-mono">₹{p.price}</td>
                        <td className="py-3 font-mono">{p.stockCount} units</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.inStock ? 'bg-swift-green/10 text-swift-green' : 'bg-amber-500/10 text-amber-500'}`}>
                            {p.inStock ? 'APPROVED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1.5">
                          {!p.inStock ? (
                            <>
                              <button 
                                onClick={() => handleApproveProductMock(p.id, true)}
                                className="bg-swift-green hover:bg-swift-green-dark text-white px-2.5 py-1 rounded text-[10px] flex-inline items-center gap-1 font-bold shadow-sm"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleApproveProductMock(p.id, false)}
                                className="bg-swift-bg border border-gray-200 hover:bg-red-50 hover:text-swift-red hover:border-red-200 text-swift-dark px-2.5 py-1 rounded text-[10px]"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleApproveProductMock(p.id, false)}
                              className="bg-swift-bg border border-gray-200 hover:bg-amber-100 text-swift-dark px-2 py-1 rounded text-[10px]"
                            >
                              Revoke Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Promo Coupons Management */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              
              {/* Form to Create Coupon */}
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-sm">
                <div className="border-b border-gray-50 pb-4 mb-4">
                  <h3 className="font-heading font-extrabold text-lg text-swift-dark">Generate System Coupon Code</h3>
                  <p className="text-xs text-swift-mid">Create discount codes applicable at cart checkout.</p>
                </div>

                <form onSubmit={handleCreateMockCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Coupon Code *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. WELCOME50"
                      value={newCouponCode}
                      onChange={e => setNewCouponCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange font-bold uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Discount Type</label>
                    <select
                      value={newCouponType}
                      onChange={e => setNewCouponType(e.target.value as 'percentage' | 'flat')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Cash (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Value *</label>
                    <input 
                      type="number" 
                      value={newCouponVal}
                      onChange={e => setNewCouponVal(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Min Order value (₹)</label>
                    <input 
                      type="number" 
                      value={newCouponMin}
                      onChange={e => setNewCouponMin(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange font-mono"
                      required
                    />
                  </div>
                  <div className="md:col-span-4 text-right">
                    <button
                      type="submit"
                      className="bg-swift-orange hover:bg-swift-orange-hover text-white px-4 py-2 rounded-button text-xs font-bold shadow-sm transition-colors flex inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Coupon</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Coupon Listings Table */}
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-sm space-y-4">
                <div className="border-b border-gray-50 pb-4">
                  <h3 className="font-heading font-extrabold text-lg text-swift-dark">Active Coupon Repository</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-150 text-swift-mid font-bold">
                        <th className="py-2.5">ID</th>
                        <th className="py-2.5">Coupon Code</th>
                        <th className="py-2.5">Rule Parameters</th>
                        <th className="py-2.5">Min Cart spend</th>
                        <th className="py-2.5">Description</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Deactivate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-swift-dark">
                      {mockCoupons.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 font-mono text-swift-mid">{c.id}</td>
                          <td className="py-3 font-bold text-swift-orange font-mono">{c.code}</td>
                          <td className="py-3 capitalize">
                            {c.discountType === 'percentage' ? `${c.value}% discount` : `₹${c.value} flat discount`}
                          </td>
                          <td className="py-3 font-mono">₹{c.minSpend}</td>
                          <td className="py-3 text-swift-mid font-normal">{c.description}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.active ? 'bg-swift-green/10 text-swift-green' : 'bg-swift-red/10 text-swift-red'}`}>
                              {c.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {c.active && (
                              <button 
                                onClick={() => handleDeactivateMockCoupon(c.id)}
                                className="text-swift-red hover:bg-red-50 p-1.5 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Tab 5: Flash Sales Scheduler */}
          {activeTab === 'flash' && (
            <div className="space-y-6">
              
              {/* Form to Create Flash Sale */}
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-sm">
                <div className="border-b border-gray-50 pb-4 mb-4">
                  <h3 className="font-heading font-extrabold text-lg text-swift-dark">Schedule Product Flash Sale</h3>
                  <p className="text-xs text-swift-mid">Override a product base price during specific temporal windows.</p>
                </div>

                <form onSubmit={handleCreateMockFlash} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Target Product *</label>
                    <select
                      value={flashProductId}
                      onChange={e => setFlashProductId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange"
                      required
                    >
                      <option value="">Select Catalog Item...</option>
                      {mockProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Flash Promo Price (₹) *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 799"
                      value={flashPrice}
                      onChange={e => setFlashPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Stock Limit Count *</label>
                    <input 
                      type="number" 
                      value={flashStockLimit}
                      onChange={e => setFlashStockLimit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange font-mono"
                      required
                    />
                  </div>
                  <div className="md:col-span-3 text-right">
                    <button
                      type="submit"
                      className="bg-swift-orange hover:bg-swift-orange-hover text-white px-4 py-2 rounded-button text-xs font-bold shadow-sm transition-colors flex inline-flex items-center gap-1.5"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Activate Flash Promo</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Flash Sales List */}
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-sm space-y-4">
                <div className="border-b border-gray-50 pb-4">
                  <h3 className="font-heading font-extrabold text-lg text-swift-dark">Configured Flash Sales Scheduler</h3>
                </div>

                {mockFlashSales.length === 0 ? (
                  <div className="text-center py-8 text-swift-mid text-xs">
                    No active flash sales scheduled.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-150 text-swift-mid font-bold">
                          <th className="py-2.5">ID</th>
                          <th className="py-2.5">Product Name</th>
                          <th className="py-2.5 font-mono">Normal Price</th>
                          <th className="py-2.5 font-mono text-swift-red">Flash Price</th>
                          <th className="py-2.5">Stock limits</th>
                          <th className="py-2.5">Active window</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold text-swift-dark">
                        {mockFlashSales.map((f) => (
                          <tr key={f.id}>
                            <td className="py-3 font-mono text-swift-mid">{f.id}</td>
                            <td className="py-3 truncate max-w-[200px]">{f.product.name}</td>
                            <td className="py-3 font-mono">₹{f.product.price}</td>
                            <td className="py-3 font-mono text-swift-red">₹{f.salePrice}</td>
                            <td className="py-3 font-mono">{f.stockLimit} items</td>
                            <td className="py-3 text-swift-mid font-normal">
                              Expires in 24 hours
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

          {/* Tab 6: Bulk CSV Importer */}
          {activeTab === 'csv' && (
            <div className="bg-white border border-gray-100 rounded-card p-6 shadow-sm space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h3 className="font-heading font-extrabold text-lg text-swift-dark">Asynchronous CSV Bulk Importer</h3>
                <p className="text-xs text-swift-mid">Upload database items in bulk. Handled asynchronously via Spring ProductService threading.</p>
              </div>

              {/* Upload Drop Zone */}
              <form onSubmit={handleCsvImport} className="space-y-4">
                <div className="border-2 border-dashed border-gray-250 hover:border-swift-orange rounded-card p-8 text-center transition-all bg-swift-bg/20">
                  <FileSpreadsheet className="w-12 h-12 text-swift-mid mx-auto mb-3" />
                  <p className="text-sm font-bold text-swift-dark mb-1">Choose products metadata CSV file</p>
                  <p className="text-xs text-swift-mid mb-4">File format must match header attributes (name, price, stock, brand, etc.)</p>
                  
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={e => setUploadedFile(e.target.files ? e.target.files[0] : null)}
                    className="text-xs mx-auto text-swift-dark"
                  />
                  {uploadedFile && (
                    <div className="mt-3 text-xs text-swift-green font-bold">
                      Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <a 
                    href="#" 
                    onClick={e => {
                      e.preventDefault();
                      const csvContent = "data:text/csv;charset=utf-8,brand,name,description,price,mrp,stockQty,categoryId,sellerId\nSwiftBrand,Smart Glass Pro,High end AR visual wear glass,12999.00,19999.00,45,1,2\n";
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "swiftcart_import_template.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-xs text-swift-blue font-bold hover:underline"
                  >
                    Download Template CSV File
                  </a>
                  
                  <button
                    type="submit"
                    className="bg-swift-dark hover:bg-swift-dark-hover text-white px-5 py-2.5 rounded-button text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Run CSV Import Task</span>
                  </button>
                </div>
              </form>

              {/* Status Polling Simulation Panel */}
              {importJobId && (
                <div className="bg-swift-bg rounded-card border border-gray-200 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-swift-mid uppercase tracking-wide">Import Telemetry Monitor</span>
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded font-bold text-swift-dark">Job ID: {importJobId}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {importStatus !== 'COMPLETED' ? (
                        <Loader2 className="w-10 h-10 text-swift-orange animate-spin" />
                      ) : (
                        <CheckCircle className="w-10 h-10 text-swift-green" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-swift-dark">
                        Status: <span className={importStatus === 'COMPLETED' ? 'text-swift-green' : 'text-swift-orange'}>{importStatus}</span>
                      </div>
                      <p className="text-xs text-swift-mid">
                        {importStatus === 'PENDING' && 'Worker thread spinning up in background...'}
                        {importStatus === 'PROCESSING' && 'Importing row data, indexing search cluster...'}
                        {importStatus === 'COMPLETED' && 'Successfully completed! Products added to MySQL and Elasticsearch.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 7: Dev Console - API Testing Deck */}
          {activeTab === 'testing' && (
            <div className="space-y-6">
              
              {/* Endpoint configuration */}
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-sm space-y-4">
                <div className="border-b border-gray-50 pb-4">
                  <h3 className="font-heading font-extrabold text-lg text-swift-dark flex items-center gap-2">
                    <Database className="w-5 h-5 text-swift-orange" />
                    <span>Interactive API Testing Deck</span>
                  </h3>
                  <p className="text-xs text-swift-mid mt-1">
                    Send real REST API requests directly to the running Spring Boot server on localhost.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Endpoint Preset */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Select Endpoint Template</label>
                    <select
                      value={selectedPresetName}
                      onChange={e => {
                        const pr = API_PRESETS.find(p => p.name === e.target.value);
                        if (pr) {
                          setSelectedPresetName(pr.name);
                          setApiPath(pr.path);
                          setApiMethod(pr.method);
                          setRequestBody(pr.defaultBody || '');
                          setQueryParams(pr.defaultParams || []);
                          setUploadedFile(null);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-250 rounded-button text-xs font-bold focus:border-swift-orange"
                    >
                      {API_PRESETS.map(p => (
                        <option key={p.name} value={p.name}>{p.method} {p.path} — {p.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-swift-mid mt-1 font-semibold italic">{selectedPreset.description}</p>
                  </div>

                  {/* Backend Server Base URL */}
                  <div>
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Base URL</label>
                    <input 
                      type="text" 
                      value={apiUrl}
                      onChange={e => setApiUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange font-mono"
                    />
                  </div>

                  {/* Path */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1">Endpoint Path</label>
                    <div className="flex gap-2">
                      <select 
                        value={apiMethod}
                        onChange={e => setApiMethod(e.target.value as any)}
                        className="px-2 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange font-bold bg-gray-50"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                      <input 
                        type="text" 
                        value={apiPath}
                        onChange={e => setApiPath(e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-200 rounded-button text-xs focus:border-swift-orange font-mono"
                      />
                    </div>
                  </div>

                  {/* JWT token field */}
                  <div className="md:col-span-3 bg-swift-bg/30 p-3 rounded-card border border-gray-200">
                    <label className="block text-[10px] font-bold text-swift-dark uppercase mb-1 flex items-center justify-between">
                      <span>JWT Authorization Token (Bearer)</span>
                      <span className="text-[9px] text-swift-mid uppercase font-bold">Injected in Headers</span>
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Paste JWT Access Token retrieved from /api/v1/auth/login..."
                        value={jwtToken}
                        onChange={e => setJwtToken(e.target.value)}
                        className="flex-grow px-3 py-1.5 border border-gray-200 rounded-button text-xs focus:border-swift-orange font-mono"
                      />
                      <button 
                        onClick={() => handleSaveJwt(jwtToken)}
                        className="bg-swift-dark text-white px-3 py-1.5 rounded-button text-xs font-bold hover:bg-swift-dark-hover"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                {/* HTTP Request details tabs (Params, Headers, Body) */}
                <div className="border-t border-gray-150 pt-4 space-y-3 text-left">
                  
                  {/* Query Parameters Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-swift-dark uppercase">Query Parameters</span>
                      <button 
                        onClick={addQueryParam}
                        className="text-swift-blue font-bold text-[10px] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Parameter</span>
                      </button>
                    </div>
                    
                    {queryParams.length === 0 ? (
                      <p className="text-[10px] text-swift-mid">No query parameters defined.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {queryParams.map((p, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text" 
                              placeholder="key" 
                              value={p.key} 
                              onChange={e => updateQueryParam(idx, 'key', e.target.value)}
                              className="px-2 py-1.5 border border-gray-200 rounded text-xs w-1/3 font-mono font-semibold"
                            />
                            <input 
                              type="text" 
                              placeholder="value" 
                              value={p.value} 
                              onChange={e => updateQueryParam(idx, 'value', e.target.value)}
                              className="px-2 py-1.5 border border-gray-200 rounded text-xs flex-grow font-mono"
                            />
                            <button 
                              onClick={() => removeQueryParam(idx)}
                              className="text-swift-red p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Body Editor Section */}
                  {['POST', 'PUT'].includes(apiMethod) && !selectedPreset.requiresFile && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-swift-dark uppercase block">Request Body Payload (JSON)</span>
                      <textarea
                        rows={6}
                        value={requestBody}
                        onChange={e => setRequestBody(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded font-mono text-xs focus:border-swift-orange bg-gray-50 focus:bg-white"
                        placeholder="{}"
                      />
                    </div>
                  )}

                  {/* File Selector for Import Presets */}
                  {selectedPreset.requiresFile && (
                    <div className="space-y-1.5 pt-2 bg-swift-bg/20 p-3 rounded border border-dashed border-gray-200 text-center">
                      <span className="text-[10px] font-bold text-swift-dark uppercase block mb-1">Required File Attachment</span>
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={e => setUploadedFile(e.target.files ? e.target.files[0] : null)}
                        className="text-xs mx-auto text-swift-dark"
                      />
                    </div>
                  )}

                  {/* Trigger Call */}
                  <div className="text-right pt-2 border-t border-gray-100">
                    <button
                      onClick={handleExecuteRequest}
                      disabled={loadingRequest}
                      className="bg-swift-orange hover:bg-swift-orange-hover text-white px-5 py-2.5 rounded-button font-bold text-xs shadow-md transition-all flex inline-flex items-center gap-1.5"
                    >
                      {loadingRequest ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching Request...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-white" fill="white" />
                          <span>Execute HTTP Request</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>

              {/* Server Response Terminal Display */}
              <div className="bg-swift-dark border border-zinc-800 rounded-card p-6 shadow-xl space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-xs font-mono font-bold text-zinc-400 ml-2">Terminal JSON Output</span>
                  </div>
                  
                  {responseStatus !== null && (
                    <div className="flex items-center gap-2 font-mono text-xs font-bold">
                      <span className="text-zinc-400">STATUS:</span>
                      <span className={responseStatus >= 200 && responseStatus < 300 ? 'text-green-400' : 'text-red-400'}>
                        {responseStatus}
                      </span>
                    </div>
                  )}
                </div>

                <div className="overflow-auto max-h-96">
                  {responseBody ? (
                    <pre className="text-xs font-mono text-swift-orange font-semibold whitespace-pre-wrap leading-relaxed">
                      {responseBody}
                    </pre>
                  ) : (
                    <pre className="text-xs font-mono text-zinc-500 font-normal">
                      No request dispatched yet. Choose a preset template above and click "Execute HTTP Request" to capture live telemetry.
                    </pre>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
