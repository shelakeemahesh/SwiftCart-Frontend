# SwiftCart Frontend ⚡

SwiftCart is a premium, full-featured e-commerce application. This repository contains the high-fidelity, responsive frontend React application designed with rich aesthetics, smooth animations, and optimized state management.

---

## 🎨 Design System & Visual Excellence

- **Brand Colors**: SwiftCart Brand Orange (`#EF9F27`), Accent Deep Blue (`#185FA5`), and Sleek Neutral Grays.
- **Responsiveness**: Fully optimized for mobile screens (320px+), tablets (768px+), and desktops (1024px+).
- **Typography & Icons**: Curated fonts (using Outfit/Inter styles) and Lucide React icons.
- **Animations**: Subtle micro-interactions and transitions driven by Framer Motion.

---

## 🛠️ Technology Stack

- **Framework**: React 18 & TypeScript (via Vite for lightning-fast HMR)
- **Styling**: Tailwind CSS 3.x
- **State Management**: Zustand (lightweight, decoupled stores for cart operations, address books, and authentication states)
- **Server Cache**: React Query (for efficient query invalidations and data syncing)
- **Routing**: React Router v6
- **Validation**: React Hook Form + Zod Schema Validation

---

## 📦 Core Features Included

1. **Dashboard & Auth Flow**:
   - Local authentication (Sign-in / Register with dynamic OTP inputs).
   - OAuth2 Provisioning flow.
2. **Interactive Checkout & Simulated Payments**:
   - Advanced address selection and coupon application.
   - Secure Razorpay payment sequence (UPI QR code scanner, Net Banking dropdowns, and form validations for credit/debit card details).
3. **Fulfillment Tracking & Live Activities**:
   - Real-time order status tracking with timeline bars synced directly with backend SSE feeds.
   - Autocomplete search suggestions and dynamic category browsing filters.

---

## ⚙️ Environment Variables (`.env`)

Create a `.env` or `.env.local` file in the root of the project:

```properties
VITE_API_URL=http://localhost:8080
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build
```bash
npm run build
```
The optimized bundles will be outputted to the `dist/` directory, ready to be deployed to Vercel, Netlify, or AWS.
