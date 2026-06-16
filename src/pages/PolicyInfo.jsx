import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Shield,
  Scale,
  HelpCircle,
  Truck,
  RefreshCw,
  XCircle,
  AlertCircle,
  Building2,
  UserCheck,
} from "lucide-react";

const POLICIES = {
  "track-order": {
    title: "Track Your Order",
    icon: <Truck className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "May 2026",
    sections: [
      {
        heading: "How to Track Your Shipment",
        paragraphs: [
          "Once your order has been dispatched from our fulfillment center, you will receive an SMS and email notification containing your unique tracking AWB number along with the assigned delivery partner (e.g., Delhivery, BlueDart, or Xpressbees).",
          'You can track your package directly through the customer dashboard under "My Orders" or by entering your tracking ID on our delivery partners official websites.',
        ],
      },
      {
        heading: "Standard Delivery Timelines",
        paragraphs: [
          "Metropolitan areas (Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad): 2-3 business days.",
          "Tier 2 and Tier 3 cities: 3-5 business days.",
          "Northeastern states and remote regional locations: 5-7 business days.",
        ],
      },
      {
        heading: "Delayed Shipments",
        paragraphs: [
          "If your shipment has not arrived within the estimated window, it may be due to weather disturbances, local logistics disruptions, or high holiday volumes. Rest assured, our customer support actively monitors delayed packages and will reach out if a re-routing is required.",
        ],
      },
    ],
  },
  "returns-refunds": {
    title: "Returns & Refunds Policy",
    icon: <RefreshCw className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "April 2026",
    sections: [
      {
        heading: "Easy 7-Day Return Policy",
        paragraphs: [
          "We offer a hassle-free 7-day return policy for most items purchased on SwiftCart. The product must be unused, unwashed, and returned in its original packaging with all tags, user manuals, and warranty cards intact.",
          "Certain categories like innerwear, personal care, and customized goods are non-returnable due to hygiene and health standards.",
        ],
      },
      {
        heading: "Process for Returns",
        paragraphs: [
          'To initiate a return, go to your Orders history dashboard, click on "Request Return" next to the target item, choose the reason for return, and submit. Our courier partner will schedule a reverse pickup from your registered address within 24-48 hours.',
        ],
      },
      {
        heading: "Refund Process & Timelines",
        paragraphs: [
          "Once the returned item is inspected at our quality assurance facility, your refund will be approved.",
          "For UPI / Net Banking / Credit Card transactions: The refund will reflect in your account within 5-7 business days.",
          "For Cash on Delivery (COD) orders: Refund will be processed as SwiftCart Store Credit instantly or transferred to your bank account details provided during the return request.",
        ],
      },
    ],
  },
  cancellations: {
    title: "Cancellation Guidelines",
    icon: <XCircle className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "March 2026",
    sections: [
      {
        heading: "Cancelling Before Dispatch",
        paragraphs: [
          'You can cancel your order free of charge at any time before it is marked as "Dispatched" by the seller. Simply go to your dashboard, locate the order, and click "Cancel Order". If payments were already completed, a full refund will be processed immediately.',
        ],
      },
      {
        heading: "Cancelling Post Dispatch",
        paragraphs: [
          "Once an order is handed over to our courier partner, online cancellations are disabled. However, you can refuse acceptance of the package at the time of delivery. A standard delivery surcharge may be deducted from the refund if a repeated pattern of delivery refusals is observed on the user account.",
        ],
      },
      {
        heading: "Cancellations by SwiftCart / Seller",
        paragraphs: [
          "Sellers reserve the right to cancel orders due to unexpected stockouts, quality assessment failures, or incorrect pricing displays. In such cases, you will be notified immediately via SMS, and a full automatic refund will be triggered.",
        ],
      },
    ],
  },
  "shipping-delivery": {
    title: "Shipping & Delivery Speeds",
    icon: <Truck className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "May 2026",
    sections: [
      {
        heading: "SwiftCart Express Delivery",
        paragraphs: [
          'Look for the "Express" badge on product listings. Items eligible for Express delivery are stocked in our nearest local hubs and qualify for Next-Day Delivery in selected metro PIN codes if ordered before 2:00 PM.',
          "Standard shipping is free for all orders above ₹499. A nominal delivery fee of ₹40 is applied on orders below ₹499.",
        ],
      },
      {
        heading: "Safety First Deliveries",
        paragraphs: [
          "Our delivery agents follow strict sanitization and hygiene protocols. One-Time Passcodes (OTP) are sent via SMS for secure handovers on high-value electronic shipments to prevent package theft.",
        ],
      },
    ],
  },
  "faq-help": {
    title: "FAQ & Customer Service",
    icon: <HelpCircle className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "June 2026",
    sections: [
      {
        heading: "Frequently Asked Questions",
        paragraphs: [
          "Q: Can I change my delivery address after placing an order?\nAnswer: Address updates are only possible if requested within 30 minutes of order placement. Contact support immediately.",
          "Q: What payment modes do you accept?\nAnswer: We accept all major Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, EMI options, and Cash on Delivery.",
        ],
      },
      {
        heading: "Need More Help?",
        paragraphs: [
          "Our Customer Care executives are available 24/7. Call us at 1800-419-3355 (Toll-Free) or email support@swiftcart.com for order-related issues. You can also chat live with our automated chatbot via the widget on the bottom right of the website.",
        ],
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    icon: <Shield className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "January 2026",
    sections: [
      {
        heading: "Information We Collect",
        paragraphs: [
          "We collect information you provide directly (such as name, phone number, delivery address, payment details, and search queries) when creating an account, browsing catalog entries, or executing orders.",
          "We also automatically collect technical device information, browser cookies, and location data to personalize your shopping experience.",
        ],
      },
      {
        heading: "How We Use Your Data",
        paragraphs: [
          "Your data helps us process transactions, send delivery notifications, recommend products matching your preferences, detect fraudulent activity, and comply with legal regulatory obligations.",
        ],
      },
      {
        heading: "Data Security Standards",
        paragraphs: [
          "SwiftCart utilizes advanced Secure Socket Layer (SSL) encryption protocols, tokenized payment pathways, and secure cloud storage partners to prevent unauthorized access or disclosure of personal details.",
        ],
      },
    ],
  },
  "terms-conditions": {
    title: "Terms & Conditions of Sale",
    icon: <Scale className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "February 2026",
    sections: [
      {
        heading: "Binding Agreement",
        paragraphs: [
          "These terms and conditions govern the purchase and sale of products listed on the SwiftCart marketplace. By completing an order, you agree to be bound by these legal policies.",
        ],
      },
      {
        heading: "Pricing and Inventory Errors",
        paragraphs: [
          "While we strive to maintain accurate catalog prices, typographical or listing errors may occur. In such instances, sellers reserve the right to cancel affected transactions prior to fulfillment and issue complete refunds.",
        ],
      },
      {
        heading: "User Accounts & Code of Conduct",
        paragraphs: [
          "Users are responsible for maintaining confidentiality of credentials. We reserve the right to suspend or terminate accounts engaging in fraudulent return requests, coupon abuse, or review manipulations.",
        ],
      },
    ],
  },
  "merchant-guidelines": {
    title: "Merchant Guidelines",
    icon: <Building2 className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "April 2026",
    sections: [
      {
        heading: "Seller Code of Conduct",
        paragraphs: [
          "All merchants must list genuine, trademarked, or authorized items. Listing counterfeit, refurbished (unless clearly specified), or illegal merchandise will result in immediate shop suspension and block of accrued payout releases.",
        ],
      },
      {
        heading: "Inventory & Dispatch SLA",
        paragraphs: [
          "Sellers must update inventory levels accurately to prevent cancellation penalties. Orders must be packed and dispatched to SwiftCart logistics handlers within 24 hours of notification receipt.",
        ],
      },
    ],
  },
  "grievance-redressal": {
    title: "Grievance Redressal",
    icon: <AlertCircle className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "March 2026",
    sections: [
      {
        heading: "Grievance Redressal Officer Contact Details",
        paragraphs: [
          "In accordance with Information Technology Act 2000 and consumer protection guidelines, the name and contact details of our Grievance Officer are published below:",
          "Name: Mr. Rakesh Sharma\nDesignation: Nodal Grievance Redressal Officer\nAddress: Prestige Tech Park, Outer Ring Road, Bengaluru, India\nEmail: grievance@swiftcart.com\nPhone: 080-6070-1122 (Mon-Fri, 10:00 AM to 6:00 PM)",
        ],
      },
      {
        heading: "Escalation Resolution Timelines",
        paragraphs: [
          "All registered grievances will be acknowledged within 36 hours and resolved in a transparent manner within 15 business days from the initial ticket lodgement date.",
        ],
      },
    ],
  },
  "corporate-governance": {
    title: "Corporate Governance",
    icon: <UserCheck className="w-8 h-8 text-swift-orange" />,
    lastUpdated: "December 2025",
    sections: [
      {
        heading: "Our Ethical Principles",
        paragraphs: [
          "SwiftCart stands on values of complete operational transparency, equal opportunity merchant treatment, and rigid compliance with foreign direct investment (FDI) laws in multi-brand e-commerce.",
        ],
      },
      {
        heading: "Whistleblower Policy",
        paragraphs: [
          "We maintain a safe channel for employees, vendors, and consumers to report violations of corporate governance or anti-bribery policies. Incidents can be flagged anonymously to ethics@swiftcart.com.",
        ],
      },
    ],
  },
};

export const PolicyInfo = () => {
  const { pageKey } = useParams();
  const activeKey = pageKey || "privacy-policy";
  const data = POLICIES[activeKey] || POLICIES["privacy-policy"];

  const sidebarLinks = [
    { key: "track-order", label: "Track Order" },
    { key: "returns-refunds", label: "Returns & Refunds" },
    { key: "cancellations", label: "Cancellations Guide" },
    { key: "shipping-delivery", label: "Shipping Speeds" },
    { key: "faq-help", label: "FAQ & Support" },
    { key: "privacy-policy", label: "Privacy Policy" },
    { key: "terms-conditions", label: "Terms of Sale" },
    { key: "merchant-guidelines", label: "Merchant Guide" },
    { key: "grievance-redressal", label: "Grievance Redressal" },
    { key: "corporate-governance", label: "Corporate Governance" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Sidebar menu (Horizontal row on mobile/tablet, vertical sidebar on desktop) */}
        <aside className="lg:col-span-3 bg-white border border-gray-100 rounded-card p-4 shadow-card lg:space-y-1">
          <h3 className="text-xs font-bold text-swift-mid uppercase tracking-wider px-3 mb-3 hidden lg:block">
            Information Center
          </h3>
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            {sidebarLinks.map((link) => {
              const isSelected = activeKey === link.key;
              return (
                <Link
                  key={link.key}
                  to={`/info/${link.key}`}
                  className={`px-3 py-2 rounded-button text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-swift-orange/10 text-swift-orange"
                      : "text-swift-dark hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Right Side: Main Policy Info content */}
        <main className="lg:col-span-9 bg-white border border-gray-100 rounded-card p-6 md:p-8 shadow-card space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-gray-150 pb-6">
            <div className="p-3 bg-swift-orange/5 rounded-button shrink-0">
              {data.icon}
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-swift-dark">
                {data.title}
              </h1>
              <p className="text-xs text-swift-mid mt-1">
                Last updated: {data.lastUpdated}
              </p>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6">
            {data.sections.map((section, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="font-heading font-bold text-base text-swift-dark">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-xs sm:text-sm text-swift-mid leading-relaxed whitespace-pre-line"
                  >
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-swift-mid">
            <span>Was this helpful?</span>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 border border-gray-200 rounded hover:bg-gray-50 font-bold transition-colors">
                Yes
              </button>
              <button className="px-4 py-1.5 border border-gray-200 rounded hover:bg-gray-50 font-bold transition-colors">
                No
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
