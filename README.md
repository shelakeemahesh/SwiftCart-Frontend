# SwiftCart Frontend ⚡

[![SwiftCart Frontend CI](https://github.com/shelakeemahesh/SwiftCart-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/shelakeemahesh/SwiftCart-Frontend/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node: 20+](https://img.shields.io/badge/node-20%2B-brightgreen)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/bundler-Vite-646CFF.svg)](https://vitejs.dev)

SwiftCart Frontend is the modern, high-performance customer-facing and seller web portal for SwiftCart. Built with React 19, Vite, Tailwind CSS, Zustand, and TanStack React Query, it delivers a lightning-fast shopping and order management experience.

---

## 🎨 Design System & Highlights

- **Visual Identity**: SwiftCart Brand Orange (`#EF9F27`), Deep Ocean Blue (`#185FA5`), and Sleek Neutral Grays.
- **Responsive**: Mobile-first design optimized for mobile (320px+), tablet (768px+), and desktop (1024px+).
- **Smooth Animations**: Interactive micro-interactions and transitions driven by Framer Motion.
- **Resilience**: Robust route-level error boundaries, safe API fallbacks, timeout handling, and image fallbacks.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework & Runtime** | React 19, JavaScript/JSX, Vite |
| **Styling & Icons** | Tailwind CSS 3.x, Lucide React |
| **State Management** | Zustand (auth, cart, wishlist, address, toast) |
| **Server State & Cache** | TanStack React Query v5 |
| **Routing & RBAC** | React Router v7 with protected route guards |
| **HTTP Client** | Fetch API with timeout, AbortController, and 401 token refresh |

---

## 📦 Key Features

1. **Authentication & RBAC**:
   - Phone + OTP and Email/Password login.
   - Social OAuth2 login (Google, GitHub) with callback token handling and role redirection.
   - Protected routes with fine-grained RBAC (`CUSTOMER`, `SELLER`, `ADMIN`).
2. **Catalog & Search**:
   - Dynamic product listings with price, category, brand, and rating filters.
   - Multi-image product gallery, highlights, and customer reviews.
3. **Cart & Interactive Checkout**:
   - Persistent cart synced with backend API.
   - Address management and delivery selection.
   - Razorpay payment gateway integration with signature verification.
4. **Order Tracking & AI Chatbot**:
   - Dynamic status timeline with visual progress stepper.
   - Integrated AI support chatbot for product recommendations and order inquiry.
5. **Seller & Admin Portals**:
   - Seller product management and order fulfillment dashboard.
   - Admin platform oversight and metric tracking.

---

## ⚙️ Environment Variables

Create `.env.local` for local development:

```properties
VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyHere
VITE_API_BASE_URL=http://localhost:8080
```

For production deployment:

```properties
VITE_RAZORPAY_KEY_ID=rzp_live_YourKeyHere
VITE_API_BASE_URL=https://swiftcart-backend-j3os.onrender.com
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Installation & Run
```bash
# 1. Install dependencies
npm ci

# 2. Start development server
npm run dev

# 3. Lint source files
npm run lint

# 4. Build production bundle
npm run build
```

---

## 🐳 Docker Container

Build and run the hardened production container with Nginx:

```bash
# Build image
docker build -t swiftcart-frontend .

# Run container on port 80
docker run -d -p 80:80 swiftcart-frontend
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
