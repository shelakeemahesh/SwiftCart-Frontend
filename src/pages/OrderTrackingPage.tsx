import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Package, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuthStore, useToastStore } from '../store/useSwiftStore';

interface TrackingItem {
  name: string;
  qty: number;
  price: number;
  imageUrl?: string;
}

interface TimelineStep {
  step: string;
  timestamp: string | null;
  completed: boolean;
}

interface OrderTrackingData {
  orderId: string;
  status: string;
  items: TrackingItem[];
  deliveryAddress: string;
  statusTimeline: TimelineStep[];
  estimatedDelivery: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';

const getStepLabel = (step: string) => {
  switch (step) {
    case 'PLACED': return 'Order Placed';
    case 'CONFIRMED': return 'Order Confirmed';
    case 'SHIPPED': return 'Shipped';
    case 'OUT_FOR_DELIVERY': return 'Out For Delivery';
    case 'DELIVERED': return 'Delivered';
    default: return step.replace(/_/g, ' ');
  }
};

const getStepDescription = (step: string) => {
  switch (step) {
    case 'PLACED': return 'Your order has been successfully logged on our system.';
    case 'CONFIRMED': return 'Seller has approved your order and is packaging the goods.';
    case 'SHIPPED': return 'Your package has been handed over to our courier partner.';
    case 'OUT_FOR_DELIVERY': return 'A delivery executive is bringing the package to your location.';
    case 'DELIVERED': return 'Package received. Thank you for choosing SwiftCart!';
    default: return '';
  }
};

const formatStepTimestamp = (timestampStr: string | null) => {
  if (!timestampStr) return null;
  const date = new Date(timestampStr);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatEstDelivery = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const { addToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Authentication guard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=orders/track/${orderId}`);
    }
  }, [isLoggedIn, navigate, orderId]);

  const fetchTracking = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/api/v1/orders/${orderId}/track`);
      setOrder(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve tracking details');
      addToast(err.message || 'Failed to retrieve tracking details', 'error');
    } finally {
      setLoading(false);
    }
  }, [orderId, addToast]);

  useEffect(() => {
    if (isLoggedIn && orderId) {
      fetchTracking();
    }
  }, [isLoggedIn, orderId, fetchTracking]);

  if (!isLoggedIn) return null;

  // Motion variants for container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 text-left">
      {/* Back to Home Link */}
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-sm font-semibold text-swift-mid hover:text-swift-orange transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-6 mb-8">
        <div>
          <span className="bg-swift-orange/10 text-swift-orange px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            Order Status
          </span>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-swift-dark mt-1">
            Track Shipment
          </h1>
          <p className="text-sm text-swift-mid mt-0.5">
            Real-time delivery progress tracker for your package.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-card p-8 shadow-card flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-swift-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-swift-mid mt-4 font-semibold">Loading shipment details...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-100 rounded-card p-8 shadow-card text-center py-16">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-swift-dark">Unable to load tracking details</h3>
          <p className="text-sm text-swift-mid mt-1">{error}</p>
          <button 
            onClick={fetchTracking} 
            className="mt-6 px-6 py-2.5 bg-swift-orange hover:bg-orange-600 text-white rounded-button font-bold text-sm shadow-sm transition-all"
          >
            Retry Fetch
          </button>
        </div>
      ) : order ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left / Center 2 Columns: Stepper Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-6">
              
              {/* Card Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-swift-mid tracking-wider block">Order ID</span>
                  <span className="font-mono font-bold text-swift-dark text-sm">{order.orderId}</span>
                </div>
                
                {order.estimatedDelivery && (
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-swift-mid tracking-wider block">Estimated Delivery</span>
                    <span className="text-sm font-bold text-swift-orange flex items-center sm:justify-end gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatEstDelivery(order.estimatedDelivery)}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Stepper Timeline container */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative pl-8 md:pl-10 space-y-8 py-2"
              >
                {/* Vertical Stepper Connecting Bar */}
                <div className="absolute left-3.5 md:left-4.5 top-5 bottom-5 w-0.5 bg-gray-100">
                  <div 
                    className="w-full bg-swift-orange transition-all duration-500"
                    style={{
                      height: `${(order.statusTimeline.filter(s => s.completed).length - 1) / (order.statusTimeline.length - 1) * 100}%`
                    }}
                  />
                </div>

                {/* Stepper Steps */}
                {order.statusTimeline.map((step, idx) => (
                  <motion.div 
                    key={step.step}
                    variants={itemVariants}
                    className="relative flex gap-4 text-left"
                  >
                    {/* Circle Indicator */}
                    <div className={`absolute -left-8 md:-left-10 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                      step.completed 
                        ? 'bg-swift-orange border-swift-orange text-white shadow-sm shadow-swift-orange/20' 
                        : 'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {step.completed ? (
                        <Check className="w-4 h-4 stroke-[3px]" />
                      ) : (
                        <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Metadata text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className={`text-sm font-bold leading-none ${step.completed ? 'text-swift-dark' : 'text-gray-400'}`}>
                          {getStepLabel(step.step)}
                        </h4>
                        
                        {step.timestamp && (
                          <span className="text-[10px] md:text-xs text-swift-mid font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatStepTimestamp(step.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-xs mt-1.5 leading-relaxed ${step.completed ? 'text-swift-mid' : 'text-gray-300'}`}>
                        {getStepDescription(step.step)}
                      </p>
                    </div>

                  </motion.div>
                ))}
              </motion.div>

            </div>
          </div>

          {/* Right 1 Column: Shipping Details & Products Summary */}
          <div className="space-y-6">
            
            {/* Delivery address card */}
            <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-swift-dark flex items-center gap-2 border-b border-gray-50 pb-3">
                <MapPin className="w-4.5 h-4.5 text-swift-orange" />
                Shipping Destination
              </h3>
              
              <div className="text-xs font-semibold text-swift-dark leading-relaxed">
                {order.deliveryAddress ? (
                  <p className="whitespace-pre-line">{order.deliveryAddress}</p>
                ) : (
                  <p className="text-swift-mid italic">No address details specified.</p>
                )}
              </div>
            </div>

            {/* Items Summary card */}
            <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-swift-dark flex items-center gap-2 border-b border-gray-50 pb-3">
                <Package className="w-4.5 h-4.5 text-swift-blue" />
                Items Summary
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    {/* Item Image */}
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={item.imageUrl || FALLBACK_IMAGE} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <h4 className="font-bold text-swift-dark truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-swift-mid font-semibold">Qty: {item.qty}</p>
                      <p className="text-swift-dark font-bold font-mono">
                        ₹{(item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
};
