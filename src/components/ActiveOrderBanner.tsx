import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowRight } from 'lucide-react';

interface ActiveOrder {
  orderId: string;
  status: string;
  productName: string;
  productThumbnailUrl?: string;
  estimatedDelivery: string;
  totalItems: number;
}

interface ActiveOrderBannerProps {
  activeOrder: ActiveOrder;
}

export const ActiveOrderBanner: React.FC<ActiveOrderBannerProps> = ({ activeOrder }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'SHIPPED': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'OUT_FOR_DELIVERY': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-250';
    }
  };

  const formattedDate = new Date(activeOrder.estimatedDelivery).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    weekday: 'short'
  });

  return (
    <div 
      onClick={() => navigate(`/orders/track/${activeOrder.orderId}`)}
      className="bg-amber-50 border-y border-amber-100 hover:bg-amber-100/60 transition-colors cursor-pointer w-full py-3 px-4 md:px-6 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 text-left">
        
        {/* Left Side: Icon & Product info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-amber-100 p-2 rounded-full text-amber-700 flex-shrink-0 animate-bounce sm:animate-none">
            <Truck className="w-5 h-5" />
          </div>
          
          <div className="min-w-0 flex-1">
            <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">
              Active Order In Progress
            </p>
            
            <h4 className="text-sm font-semibold text-swift-dark mt-0.5 truncate">
              {activeOrder.productName}
              {activeOrder.totalItems > 1 && ` (+${activeOrder.totalItems - 1} more items)`}
            </h4>
          </div>
        </div>

        {/* Center: Status & Estimated Delivery */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {/* Pulsing Dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>

            <span className={`text-[10px] md:text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusColor(activeOrder.status)}`}>
              {activeOrder.status.replace(/_/g, ' ')}
            </span>
          </div>

          <p className="text-xs md:text-sm text-swift-mid font-medium">
            Delivery expected by <span className="font-bold text-swift-dark">{formattedDate}</span>
          </p>
        </div>

        {/* Right Side: CTA */}
        <div className="flex items-center text-swift-blue font-bold text-xs md:text-sm hover:translate-x-1 transition-transform self-end sm:self-center gap-1">
          <span>Track Order</span>
          <ArrowRight className="w-4 h-4" />
        </div>

      </div>
    </div>
  );
};
