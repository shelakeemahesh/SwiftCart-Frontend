import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart, MapPin, Ticket, LogOut, ChevronRight, Download, Eye, ArrowLeft, Plus, Check } from 'lucide-react';
import { useAuthStore, useWishlistStore, useCartStore, useToastStore, mapBackendOrder } from '../store/useSwiftStore';
import type { Order, Address } from '../data/mockDb';
import { mockDb } from '../data/mockDb';
import { ProductCard, FALLBACK_IMAGE } from '../components/ProductCard';
import { apiClient, API_BASE_URL } from '../api/apiClient';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  const { isLoggedIn, user, logout, addresses, addAddress, removeAddress, setDefaultAddress } = useAuthStore();
  const { wishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { addToast } = useToastStore();

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');

  // Address form modal
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const addrCity = 'Bengaluru';
  const addrState = 'Karnataka';
  const [addrType, setAddrType] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Load orders
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=dashboard');
      return;
    }
    if (user?.role === 'SELLER') {
      navigate('/seller/dashboard');
      return;
    }
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/api/v1/orders');
        const mappedOrders = (response.content || []).map(mapBackendOrder);
        setOrders(mappedOrders);
      } catch (err: any) {
        addToast(err.message || 'Failed to fetch orders from backend', 'error');
      }
    };
    fetchOrders();
  }, [isLoggedIn, user, navigate]);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'All') return true;
    if (orderFilter === 'Active') return o.status === 'Ordered' || o.status === 'Dispatched' || o.status === 'Out for Delivery';
    if (orderFilter === 'Completed') return o.status === 'Delivered';
    if (orderFilter === 'Cancelled') return o.status === 'Cancelled';
    return true;
  });

  const handleInvoiceDownload = async (orderId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sc_access_token')}`
        }
      });
      if (!response.ok) throw new Error('Invoice download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addToast(`Invoice PDF receipt for order ${orderId} downloaded successfully`, 'success');
    } catch (err: any) {
      addToast('Failed to download invoice', 'error');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    try {
      const response = await apiClient.post(`/api/v1/orders/${orderId}/cancel`);
      const updatedOrder = mapBackendOrder(response);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      addToast('Order cancelled successfully', 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrPincode || !addrLine1) {
      addToast('Please fill out all required address fields', 'error');
      return;
    }

    const newAddr: Address = {
      id: `addr-${Math.random().toString(36).substring(5)}`,
      name: addrName,
      phone: addrPhone,
      pincode: addrPincode,
      addressLine1: addrLine1,
      addressLine2: addrLine2,
      city: addrCity || 'Bengaluru',
      state: addrState || 'Karnataka',
      type: addrType,
      isDefault: addresses.length === 0
    };

    addAddress(newAddr);
    setShowAddrForm(false);
    addToast('Address added successfully!', 'success');
    
    // Reset Form
    setAddrName('');
    setAddrPhone('');
    setAddrPincode('');
    setAddrLine1('');
    setAddrLine2('');
  };

  const menuItems = [
    { id: 'orders', label: 'My Orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'wishlist', label: 'Wishlist Collection', icon: <Heart className="w-5 h-5" /> },
    { id: 'addresses', label: 'My Addresses', icon: <MapPin className="w-5 h-5" /> },
    { id: 'coupons', label: 'Coupons & Offers', icon: <Ticket className="w-5 h-5" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-20">
      
      <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-gray-150 pb-6 mb-8 text-center sm:text-left">
        {user?.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white ring-2 ring-swift-orange/20 flex-shrink-0" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.avatar-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        <div className={`w-16 h-16 bg-swift-orange text-white rounded-full flex items-center justify-center font-bold text-2xl font-heading shadow-md avatar-fallback flex-shrink-0 ${user?.avatarUrl ? 'hidden' : ''}`}>
          {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
        </div>
        <div className="min-w-0">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-swift-dark truncate max-w-full">{user?.name}</h2>
            {user?.provider && user.provider.toLowerCase() === 'google' && (
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm border bg-red-50 text-red-600 border-red-100 shrink-0">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-3.5 h-3.5" alt="Google" />
                <span>Google account</span>
              </span>
            )}
          </div>
          <p className="text-xs text-swift-mid mt-1.5 leading-relaxed break-all">
            {user?.phone ? `Mobile: +91 ${user.phone} • ` : ''}Email: {user?.email}
          </p>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex gap-1 bg-white border border-gray-100 rounded-card p-1.5 shadow-sm overflow-x-auto no-scrollbar mb-6 scroll-smooth">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setSelectedOrder(null);
              navigate(`/dashboard?tab=${item.id}`);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-button text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-swift-blue text-white shadow-xs'
                : 'text-swift-dark hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Menu (Desktop only) */}
        <aside className="hidden md:block md:col-span-3 bg-white border border-gray-100 rounded-card p-4 shadow-card shrink-0">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedOrder(null);
                  navigate(`/dashboard?tab=${item.id}`);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-button text-xs font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-swift-blue text-white shadow-xs'
                    : 'text-swift-dark hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}

            <button
              onClick={() => {
                logout();
                addToast('Logged out successfully', 'info');
                navigate('/');
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-button text-xs font-bold text-swift-red hover:bg-red-50 transition-colors border-t border-gray-100 mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout Account</span>
            </button>
          </nav>
        </aside>

        {/* Right Dashboard Details Content (9 cols) */}
        <main className="md:col-span-9 bg-white border border-gray-100 rounded-card p-6 shadow-card min-h-[50vh]">
          
          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {!selectedOrder ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                    <h3 className="font-heading font-extrabold text-base text-swift-dark">My Orders</h3>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-1.5">
                      {(['All', 'Active', 'Completed', 'Cancelled'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setOrderFilter(filter)}
                          className={`px-3 py-1.5 rounded-button text-xs font-bold transition-all border ${
                            orderFilter === filter
                              ? 'bg-swift-orange border-swift-orange text-white shadow-xs'
                              : 'bg-white border-gray-200 text-swift-dark hover:bg-gray-50'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders Cards */}
                  <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-16 text-swift-mid space-y-3">
                        <ShoppingBag className="w-10 h-10 mx-auto opacity-50" />
                        <p className="text-xs">No orders found matching this filter criteria.</p>
                      </div>
                    ) : (
                      filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-150 rounded-card overflow-hidden hover:border-swift-orange transition-all"
                        >
                          {/* Top Strip */}
                          <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-swift-mid border-b border-gray-150 font-bold">
                            <div className="flex gap-4">
                              <div>
                                <span className="uppercase text-[10px] text-swift-mid font-medium block">Order Placed</span>
                                <span className="text-swift-dark">{order.date}</span>
                              </div>
                              <div>
                                <span className="uppercase text-[10px] text-swift-mid font-medium block">Total Amount</span>
                                <span className="text-swift-dark">₹{order.total.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="uppercase text-[10px] text-swift-mid font-medium block">Order ID</span>
                              <span className="font-mono text-swift-dark">{order.id}</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail list */}
                              <div className="flex gap-2">
                                {order.items.map((item, idx) => (
                                  <img
                                    key={idx}
                                    src={item.image || FALLBACK_IMAGE}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded-button border border-gray-100"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = FALLBACK_IMAGE;
                                    }}
                                  />
                                ))}
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-bold text-swift-dark">
                                  {order.items.length === 1 ? order.items[0].name : `${order.items[0].name} and ${order.items.length - 1} other item(s)`}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-pill ${
                                    order.status === 'Delivered' ? 'bg-swift-green/10 text-swift-green border border-swift-green/20' :
                                    order.status === 'Cancelled' ? 'bg-swift-red/10 text-swift-red border border-swift-red/20' :
                                    'bg-swift-orange/10 text-swift-orange border border-swift-orange/20 animate-pulse'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-4 py-2 border border-swift-blue text-swift-blue hover:bg-swift-blue/5 rounded-button text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                // ORDER DETAIL VIEW
                <div className="space-y-6 text-left">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-xs font-bold text-swift-blue hover:text-swift-orange flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Orders List</span>
                  </button>

                  <div className="flex flex-wrap justify-between items-baseline gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="font-heading font-extrabold text-lg text-swift-dark">Order Details</h4>
                      <p className="text-xs text-swift-mid">Placed on {selectedOrder.date} • Reference: <span className="font-mono font-bold text-swift-dark">{selectedOrder.id}</span></p>
                    </div>

                    <button
                      onClick={() => handleInvoiceDownload(selectedOrder.id)}
                      className="px-4 py-2 border border-gray-200 text-swift-dark hover:text-swift-orange rounded-button text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Invoice</span>
                    </button>
                  </div>

                  {/* Visual Tracker timeline */}
                  <div className="bg-gray-50 border border-gray-150 rounded-card p-6">
                    <span className="block text-[10px] font-bold text-swift-mid uppercase tracking-wide mb-4">Shipment Delivery Progress</span>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-2 relative">
                      
                      {selectedOrder.trackingTimeline.map((step, idx) => {
                        return (
                          <div key={idx} className="flex sm:flex-col items-center gap-3 sm:gap-1.5 sm:text-center flex-grow">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                              step.completed ? 'bg-swift-green' : 'bg-gray-200'
                            }`}>
                              {step.completed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-swift-dark">{step.title}</div>
                              <div className="text-[10px] text-swift-mid max-w-[150px]">{step.description}</div>
                              {step.date !== 'Pending' && <div className="text-[9px] text-swift-orange font-mono font-semibold">{step.date}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items detail list */}
                  <div className="space-y-4">
                    <span className="block text-[10px] font-bold text-swift-mid uppercase tracking-wide">Ordered Items ({selectedOrder.items.length})</span>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 border-b border-gray-50 pb-4">
                        <img
                          src={item.image || FALLBACK_IMAGE}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-button border border-gray-100 bg-gray-50"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="flex-grow">
                          <h5 className="text-sm font-bold text-swift-dark">{item.name}</h5>
                          <p className="text-xs text-swift-mid">Qty: {item.quantity} • Price: ₹{item.price}</p>
                          {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {Object.entries(item.selectedVariant).map(([k, v]) => (
                                <span key={k} className="text-[9px] font-bold text-swift-blue bg-swift-blue/5 border border-swift-blue/10 px-1 rounded-pill">{k}: {v}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-swift-dark">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-1.5 text-xs text-swift-mid">
                      <span className="block text-[10px] font-bold uppercase tracking-wide">Shipping Address</span>
                      <div className="font-bold text-swift-dark">{selectedOrder.deliveryAddress.name}</div>
                      <p>{selectedOrder.deliveryAddress.addressLine1}, {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}</p>
                      <p>Phone: {selectedOrder.deliveryAddress.phone}</p>
                    </div>

                    <div className="space-y-2 text-xs font-bold text-swift-mid text-right sm:border-l border-gray-100 sm:pl-6">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-mono text-swift-dark">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-swift-green">
                          <span>Discounts applied</span>
                          <span className="font-mono">-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Courier Shipping</span>
                        <span className="font-mono text-swift-dark">₹{selectedOrder.deliveryCharge}</span>
                      </div>
                      <hr className="border-gray-100 my-1" />
                      <div className="flex justify-between text-sm font-extrabold text-swift-dark">
                        <span>Final Paid</span>
                        <span className="font-mono text-swift-orange">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cancel order action */}
                  {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        className="px-6 py-2.5 bg-swift-red hover:bg-red-700 text-white rounded-button font-bold text-xs shadow-sm transition-all"
                      >
                        Cancel Shipment Order
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h3 className="font-heading font-extrabold text-base text-swift-dark border-b border-gray-50 pb-4 text-left">
                My Wishlist Collection ({wishlist.length})
              </h3>
              
              {wishlist.length === 0 ? (
                <div className="text-center py-20 text-swift-mid space-y-4">
                  <div className="w-16 h-16 bg-swift-bg rounded-full text-swift-mid flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-swift-dark">Your Wishlist is Empty</h4>
                    <p className="text-xs text-swift-mid mt-0.5">Save items you like to track price cuts and stocks.</p>
                  </div>
                  <Link to="/" className="inline-block px-6 py-2 bg-swift-orange text-white rounded-button text-xs font-bold">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((prod) => (
                    <div key={prod.id} className="relative">
                      <ProductCard product={prod} />
                      <button
                        onClick={() => {
                          // select default variants
                          const dv: { [key: string]: string } = {};
                          prod.variants.forEach(v => { dv[v.name] = v.options[0]; });
                          addToCart(prod, 1, dv);
                          addToast(`${prod.name} moved to Cart`, 'success');
                        }}
                        className="absolute bottom-14 left-2 right-2 bg-swift-blue hover:bg-swift-blue-dark text-white font-bold text-[10px] py-1.5 rounded-button shadow-md flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        Move to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <h3 className="font-heading font-extrabold text-base text-swift-dark">Manage Address Directory</h3>
                <button
                  onClick={() => setShowAddrForm(!showAddrForm)}
                  className="px-4 py-2 bg-swift-blue hover:bg-swift-blue-dark text-white rounded-button text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Address</span>
                </button>
              </div>

              {showAddrForm && (
                <form onSubmit={handleSaveAddress} className="border border-gray-150 rounded-card p-4 bg-gray-50/50 space-y-4">
                  <span className="block text-xs font-extrabold text-swift-dark uppercase tracking-wider">New Delivery Coordinates</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">Receiver Name *</label>
                      <input
                        type="text"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        placeholder="e.g. Mahesh Kumar"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">6-digit Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 560103"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">Flat, Door, Suite *</label>
                      <input
                        type="text"
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        placeholder="e.g. Flat 405"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">Locality, Area, Road</label>
                      <input
                        type="text"
                        value={addrLine2}
                        onChange={(e) => setAddrLine2(e.target.value)}
                        placeholder="e.g. Green Glen Layout"
                        className="w-full px-3 py-2 border border-gray-200 rounded-button text-sm focus:border-swift-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-swift-dark mb-1">Address Label</label>
                      <select
                        value={addrType}
                        onChange={(e) => setAddrType(e.target.value as 'Home' | 'Work' | 'Other')}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-button text-sm focus:ring-0 focus:outline-none"
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Office / Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddrForm(false)}
                      className="px-4 py-2 border border-gray-200 rounded-button text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-swift-orange text-white rounded-button text-xs font-bold shadow-sm"
                    >
                      Save Coordinates
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`border rounded-card p-4 relative flex flex-col justify-between gap-3 bg-white hover:border-gray-300 transition-colors ${
                      addr.isDefault ? 'border-swift-green ring-1 ring-swift-green/10' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-swift-dark">{addr.name}</span>
                        <span className="text-[9px] font-bold text-white bg-swift-mid px-1.5 py-0.5 rounded uppercase">
                          {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold text-swift-green border border-swift-green px-1 rounded">
                            Active Default
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-swift-mid mt-2 leading-relaxed">
                        {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}
                        {addr.city}, {addr.state} - <span className="font-mono font-semibold">{addr.pincode}</span>
                      </p>
                      <p className="text-xs text-swift-mid font-semibold mt-1">Phone: {addr.phone}</p>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-50 justify-end">
                      {!addr.isDefault && (
                        <button
                          onClick={() => {
                            setDefaultAddress(addr.id);
                            addToast('Default delivery location updated', 'success');
                          }}
                          className="text-[10px] font-bold text-swift-blue hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          removeAddress(addr.id);
                          addToast('Address removed successfully', 'info');
                        }}
                        className="text-[10px] font-bold text-swift-red hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 text-left">
              <h3 className="font-heading font-extrabold text-base text-swift-dark border-b border-gray-50 pb-4">
                Active Promo Coupons
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockDb.getCoupons().map((coupon) => (
                  <div
                    key={coupon.code}
                    className="border border-dashed border-swift-orange bg-swift-orange/5 p-4 rounded-card relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Visual notches */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-r border-dashed border-swift-orange" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-l border-dashed border-swift-orange" />

                    <div className="px-3">
                      <span className="bg-swift-orange text-white font-mono font-extrabold text-sm px-2.5 py-1 rounded shadow-xs uppercase tracking-wider block w-fit">
                        {coupon.code}
                      </span>
                      <p className="text-xs text-swift-dark font-extrabold mt-3 leading-snug">
                        {coupon.description}
                      </p>
                    </div>

                    <div className="px-3 pt-4 border-t border-gray-200/50 mt-4 text-[10px] text-swift-mid font-semibold">
                      Minimum Spend Limit: ₹{coupon.minSpend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};
