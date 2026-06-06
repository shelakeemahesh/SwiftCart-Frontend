import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../store/useSwiftStore';
import type { Toast } from '../store/useSwiftStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white border-l-4 border-swift-green shadow-card',
          icon: <CheckCircle2 className="w-5 h-5 text-swift-green flex-shrink-0" />,
          textColor: 'text-swift-dark',
        };
      case 'error':
        return {
          bg: 'bg-white border-l-4 border-swift-red shadow-card',
          icon: <XCircle className="w-5 h-5 text-swift-red flex-shrink-0" />,
          textColor: 'text-swift-dark',
        };
      case 'warning':
        return {
          bg: 'bg-white border-l-4 border-swift-orange shadow-card',
          icon: <AlertTriangle className="w-5 h-5 text-swift-orange flex-shrink-0" />,
          textColor: 'text-swift-dark',
        };
      case 'info':
      default:
        return {
          bg: 'bg-white border-l-4 border-swift-blue shadow-card',
          icon: <Info className="w-5 h-5 text-swift-blue flex-shrink-0" />,
          textColor: 'text-swift-dark',
        };
    }
  };

  return (
    <div className="fixed z-50 flex flex-col gap-2 max-w-sm w-full p-4 pointer-events-none md:top-4 md:right-4 top-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 p-4 rounded-card border border-gray-100 pointer-events-auto ${styles.bg}`}
            >
              {styles.icon}
              <div className="flex-grow text-sm font-medium leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
