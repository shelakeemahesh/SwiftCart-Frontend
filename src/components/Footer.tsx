import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <footer className="bg-[#1f1f1e] text-gray-300 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Main Link Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Column 1: About */}
            <div className="space-y-4">
              <h4 className="text-white font-heading font-bold text-base">About SwiftCart</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                SwiftCart is India’s ultimate full-featured destination for high-fidelity consumer electronics, trendsetting fashion, organic groceries, and daily lifestyle essentials.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-swift-orange hover:text-white transition-colors duration-200" aria-label="Facebook">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-swift-orange hover:text-white transition-colors duration-200" aria-label="Twitter">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-swift-orange hover:text-white transition-colors duration-200" aria-label="Instagram">
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-swift-orange hover:text-white transition-colors duration-200" aria-label="Youtube">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163c-.272-1.016-1.07-1.817-2.086-2.09C19.57 3.79 12 3.79 12 3.79s-7.57 0-9.412.283c-1.017.273-1.814 1.074-2.086 2.09C.22 8.002.22 12 .22 12s0 3.998.282 5.837c.272 1.016 1.07 1.817 2.086 2.09 1.842.283 9.412.283 9.412.283s7.57 0 9.412-.283c1.017-.273 1.814-1.574 2.086-2.09.282-1.839.282-5.837.282-5.837s0-3.998-.282-5.837zm-14.12 8.566V9.271l6.19 3.73-6.19 3.728z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Help & Support */}
            <div className="space-y-4">
              <h4 className="text-white font-heading font-bold text-base">Help & Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/info/track-order" className="hover:text-swift-orange transition-colors">Track Your Order</Link></li>
                <li><Link to="/info/returns-refunds" className="hover:text-swift-orange transition-colors">Returns & Refunds Policy</Link></li>
                <li><Link to="/info/cancellations" className="hover:text-swift-orange transition-colors">Cancellation Guidelines</Link></li>
                <li><Link to="/info/shipping-delivery" className="hover:text-swift-orange transition-colors">Shipping & Delivery Speeds</Link></li>
                <li><Link to="/info/faq-help" className="hover:text-swift-orange transition-colors">FAQ & Customer Service Help</Link></li>
              </ul>
            </div>

            {/* Column 3: Policies */}
            <div className="space-y-4">
              <h4 className="text-white font-heading font-bold text-base">Policies</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/info/privacy-policy" className="hover:text-swift-orange transition-colors">Privacy Policy</Link></li>
                <li><Link to="/info/terms-conditions" className="hover:text-swift-orange transition-colors">Terms & Conditions of Sale</Link></li>
                <li><Link to="/info/merchant-guidelines" className="hover:text-swift-orange transition-colors">Merchant Guidelines</Link></li>
                <li><Link to="/info/grievance-redressal" className="hover:text-swift-orange transition-colors">Grievance Officer Redressal</Link></li>
                <li><Link to="/info/corporate-governance" className="hover:text-swift-orange transition-colors">Corporate Governance</Link></li>
              </ul>
            </div>

            {/* Column 4: Connect With Us */}
            <div className="space-y-4">
              <h4 className="text-white font-heading font-bold text-base">Connect With Us</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-swift-orange flex-shrink-0 mt-0.5" />
                  <span>SwiftCart Head Office, 10th Floor, Prestige Tech Park, Outer Ring Road, Bangalore, India - 560103</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-swift-orange flex-shrink-0" />
                  <span>1800-419-3355 (Toll-Free)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-swift-orange flex-shrink-0" />
                  <span>support@swiftcart.com</span>
                </li>
              </ul>
            </div>

          </div>

          <hr className="border-gray-800 my-8" />

          {/* Bottom Strip: App Links, Payments and Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* App Store Downloads */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider hidden sm:inline">Download:</span>
              <a href="#" className="block h-10 hover:opacity-90 transition-opacity">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-full object-contain" />
              </a>
              <a href="#" className="block h-10 hover:opacity-90 transition-opacity">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play Store" className="h-full object-contain" />
              </a>
            </div>

            {/* Payment Method Badges */}
            <div className="flex items-center gap-2 bg-gray-900/40 p-2 rounded-card border border-gray-800">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider px-2">Payments:</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono border border-gray-700 px-1.5 py-0.5 rounded text-gray-400 font-bold">VISA</span>
                <span className="text-[10px] font-mono border border-gray-700 px-1.5 py-0.5 rounded text-gray-400 font-bold">MC</span>
                <span className="text-[10px] font-mono border border-gray-700 px-1.5 py-0.5 rounded text-gray-400 font-bold">UPI</span>
                <span className="text-[10px] font-mono border border-gray-700 px-1.5 py-0.5 rounded text-gray-400 font-bold">NET BANKING</span>
                <span className="text-[10px] font-mono border border-gray-700 px-1.5 py-0.5 rounded text-gray-400 font-bold">EMI</span>
              </div>
            </div>

          </div>

          <div className="text-center text-xs text-gray-500 mt-12">
            © {new Date().getFullYear()} SwiftCart Commerce India Private Limited. All rights reserved.
          </div>

        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-swift-orange hover:bg-swift-orange-hover text-white p-3 rounded-full shadow-modal transition-all duration-300 hover:scale-105"
          aria-label="Back to Top"
        >
          <ChevronUp className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}
    </>
  );
};
