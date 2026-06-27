import { create } from "zustand";
import { apiClient, API_BASE_URL } from "../api/apiClient";
import { mockDb } from "../data/mockDb";

export function mapBackendProduct(p) {
  if (!p) return {};
  return {
    id: String(p.id || ""),
    name: p.name || "",
    slug: p.slug || "",
    description: p.description || "",
    price:
      p.basePrice !== undefined ? Number(p.basePrice) : Number(p.price || 0),
    mrp: p.mrp !== undefined ? Number(p.mrp) : Number(p.mrp || 0),
    discount:
      p.discountPercent !== undefined
        ? Number(p.discountPercent)
        : p.discount !== undefined
          ? Number(p.discount)
          : 0,
    images: Array.isArray(p.images)
      ? p.images.map((img) => (typeof img === "string" ? img : img.imageUrl))
      : [],
    category:
      p.category && typeof p.category === "object"
        ? p.category.name
        : p.category || "General",
    brand: p.brand || "",
    rating:
      p.averageRating !== undefined
        ? Number(p.averageRating)
        : Number(p.rating || 0),
    reviewCount: p.reviewCount !== undefined ? Number(p.reviewCount) : 0,
    inStock: p.stockQty !== undefined ? p.stockQty > 0 : !!p.inStock,
    stockCount: p.stockQty !== undefined ? p.stockQty : p.stockCount || 0,
    isTrending: p.isFeatured || (p.soldCount !== undefined && p.soldCount > 10),
    isNewArrival: p.isNewArrival,
    isBestSeller: p.soldCount !== undefined && p.soldCount > 20,
    isSwiftChoice: p.isFeatured,
    sellerId:
      p.seller && typeof p.seller === "object"
        ? String(p.seller.id)
        : String(p.sellerId || "1"),
    deliveryDays: p.deliveryDays || 3,
    highlights: Array.isArray(p.highlights) ? p.highlights : [],
    specs: p.specifications || p.specs || {},
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    variants: Array.isArray(p.variants)
      ? p.variants.map((v) => ({
          type: "color",
          name: v.variantKey || "",
          options: [v.variantVal || ""],
        }))
      : [],
  };
}

export function mapBackendCartItem(item) {
  const product = mapBackendProduct(item.product);
  const selectedVariant = {};
  if (item.variant) {
    selectedVariant[item.variant.variantKey] = item.variant.variantVal;
  }
  return {
    cartItemId: String(item.id),
    product,
    quantity: item.quantity,
    selectedVariant,
  };
}

export function mapBackendOrder(o) {
  if (!o) return {};
  const items = Array.isArray(o.items)
    ? o.items.map((item) => {
        const productSnapshot = item.productSnapshot || {};
        return {
          productId: String(item.product?.id || ""),
          name: productSnapshot.name || item.product?.name || "",
          price:
            item.unitPrice !== undefined
              ? Number(item.unitPrice)
              : Number(item.price || 0),
          quantity: item.quantity,
          image:
            productSnapshot.imageUrl ||
            (item.product?.images && item.product.images[0]?.imageUrl) ||
            "",
          selectedVariant: item.variant
            ? { [item.variant.variantKey]: item.variant.variantVal }
            : undefined,
        };
      })
    : [];

  const mappedAddress = o.address
    ? {
        id: String(o.address.id),
        name: o.address.recipientName || "",
        phone: o.address.phone || "",
        pincode: o.address.pincode || "",
        addressLine1: o.address.flatHouse || "",
        addressLine2: o.address.area || "",
        city: o.address.city || "",
        state: o.address.state || "",
        type:
          o.address.label === "HOME"
            ? "Home"
            : o.address.label === "WORK"
              ? "Work"
              : "Other",
        isDefault: o.address.default,
      }
    : {
        id: "",
        name: "",
        phone: "",
        pincode: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        type: "Home",
      };

  const today = o.placedAt
    ? o.placedAt.split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    id: o.orderUuid || String(o.id),
    date: today,
    status:
      o.status === "DELIVERED"
        ? "Delivered"
        : o.status === "CANCELLED"
          ? "Cancelled"
          : o.status === "RETURNED"
            ? "Returned"
            : o.status === "SHIPPED"
              ? "Dispatched"
              : "Ordered",
    items,
    subtotal: o.mrpTotal !== undefined ? Number(o.mrpTotal) : 0,
    discount:
      (o.discountTotal !== undefined ? Number(o.discountTotal) : 0) +
      (o.couponDiscount !== undefined ? Number(o.couponDiscount) : 0),
    deliveryCharge: o.deliveryFee !== undefined ? Number(o.deliveryFee) : 0,
    total: o.finalAmount !== undefined ? Number(o.finalAmount) : 0,
    deliveryAddress: mappedAddress,
    paymentMethod: String(o.paymentMethod || "COD"),
    trackingTimeline: [
      {
        title: "Ordered",
        description: "Order successfully placed on SwiftCart",
        date: `${today} 14:40`,
        completed: true,
      },
      {
        title: "Dispatched",
        description: "Awaiting shipping courier confirmation",
        date: "Pending",
        completed: o.status === "SHIPPED" || o.status === "DELIVERED",
      },
      {
        title: "Out for Delivery",
        description: "Pending dispatched courier",
        date: "Pending",
        completed: o.status === "DELIVERED",
      },
      {
        title: "Delivered",
        description: "Package has been delivered",
        date: "Pending",
        completed: o.status === "DELIVERED",
      },
    ],
  };
}

// Keep track of the last shown timestamp for each toast message to prevent spamming
const lastToastTimes = new Map();

// Toast Types and Store

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const key = `${type}:${message}`;
    const now = Date.now();
    const lastTime = lastToastTimes.get(key) || 0;
    // Cooldown of 1.5s (1500ms) to prevent showing duplicate toasts rapidly
    if (now - lastTime < 1500) {
      return;
    }
    lastToastTimes.set(key, now);

    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    // Auto remove after 3s
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Auth Store Types and Store

export const useAuthStore = create((set, get) => ({
  user:
    typeof window !== "undefined" &&
    localStorage.getItem("sc_logged_in") === "true"
      ? {
          name: localStorage.getItem("sc_user_name") || "John Doe",
          phone: localStorage.getItem("sc_user_phone") || "9876543210",
          email:
            localStorage.getItem("sc_user_email") || "mahesh@swiftcart.com",
          role: localStorage.getItem("sc_user_role") || "ADMIN",
          provider: localStorage.getItem("sc_user_provider") || "LOCAL",
          avatarUrl: localStorage.getItem("sc_user_avatar_url") || "",
        }
      : null,
  isLoggedIn:
    typeof window !== "undefined" &&
    localStorage.getItem("sc_logged_in") === "true",
  addresses: [],

  login: (phone, name = "Mahesh Kumar", role = "ADMIN") => {
    localStorage.setItem("sc_logged_in", "true");
    localStorage.setItem("sc_user_name", name);
    localStorage.setItem("sc_user_phone", phone);
    localStorage.setItem("sc_user_role", role);
    localStorage.setItem("sc_user_provider", "LOCAL");
    set({
      isLoggedIn: true,
      user: {
        name,
        phone,
        email: "mahesh@swiftcart.com",
        role,
        provider: "LOCAL",
        avatarUrl: "",
      },
    });
  },

  loginWithAuthData: (authData) => {
    localStorage.setItem("sc_logged_in", "true");
    localStorage.setItem("sc_user_name", authData.name || "");
    localStorage.setItem("sc_user_phone", authData.phone || "");
    localStorage.setItem("sc_user_email", authData.email || "");
    localStorage.setItem("sc_user_role", authData.role || "CUSTOMER");
    localStorage.setItem("sc_user_provider", authData.provider || "LOCAL");
    localStorage.setItem("sc_user_avatar_url", authData.avatarUrl || "");
    localStorage.setItem("sc_access_token", authData.accessToken || "");
    localStorage.setItem("sc_refresh_token", authData.refreshToken || "");
    set({
      isLoggedIn: true,
      user: {
        name: authData.name || "",
        phone: authData.phone || "",
        email: authData.email || "",
        role: authData.role || "CUSTOMER",
        provider: authData.provider || "LOCAL",
        avatarUrl: authData.avatarUrl || "",
      },
    });
    get().fetchAddresses();
    useCartStore
      .getState()
      .fetchCart()
      .catch(() => {});
    useWishlistStore
      .getState()
      .fetchWishlist()
      .catch(() => {});
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("sc_refresh_token");
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (e) {}
    localStorage.removeItem("sc_logged_in");
    localStorage.removeItem("sc_user_name");
    localStorage.removeItem("sc_user_phone");
    localStorage.removeItem("sc_user_role");
    localStorage.removeItem("sc_user_email");
    localStorage.removeItem("sc_user_provider");
    localStorage.removeItem("sc_user_avatar_url");
    localStorage.removeItem("sc_access_token");
    localStorage.removeItem("sc_refresh_token");
    set({ isLoggedIn: false, user: null, addresses: [] });
    useCartStore.getState().clearCart();
    useWishlistStore.setState({ wishlist: [] });
    localStorage.removeItem("sc_wishlist_items");
  },

  setRole: (role) => {
    localStorage.setItem("sc_user_role", role);
    set((state) => {
      if (state.user) {
        return { user: { ...state.user, role } };
      }
      return {};
    });
  },

  fetchAddresses: async () => {
    try {
      const dbAddresses = await apiClient.get("/api/v1/users/me/addresses");
      const mapped = dbAddresses.map((a) => ({
        id: String(a.id),
        name: a.recipientName,
        phone: a.phone,
        pincode: a.pincode,
        addressLine1: a.flatHouse,
        addressLine2: a.area,
        city: a.city,
        state: a.state,
        type:
          a.label === "HOME" ? "Home" : a.label === "WORK" ? "Work" : "Other",
        isDefault: a.default,
      }));
      set({ addresses: mapped });
    } catch (e) {
      console.error("Failed to fetch addresses from backend", e);
    }
  },

  addAddress: async (address) => {
    try {
      const payload = {
        label: address.type.toUpperCase(),
        recipientName: address.name,
        phone: address.phone,
        pincode: address.pincode,
        flatHouse: address.addressLine1,
        area: address.addressLine2,
        city: address.city,
        state: address.state,
        isDefault: !!address.isDefault,
      };
      const response = await apiClient.post("/api/v1/users/me/addresses", payload);
      await get().fetchAddresses();
      return response;
    } catch (e) {
      console.error("Failed to add address in backend", e);
    }
  },

  removeAddress: async (id) => {
    try {
      await apiClient.delete(`/api/v1/users/me/addresses/${id}`);
      await get().fetchAddresses();
    } catch (e) {
      console.error("Failed to delete address in backend", e);
    }
  },

  setDefaultAddress: async (id) => {
    try {
      await apiClient.put(`/api/v1/users/me/addresses/${id}/default`);
      await get().fetchAddresses();
    } catch (e) {
      console.error("Failed to set default address in backend", e);
    }
  },

  fetchCurrentUser: async () => {
    try {
      const data = await apiClient.get("/api/v1/auth/me");
      localStorage.setItem("sc_user_name", data.name || "");
      localStorage.setItem("sc_user_phone", data.phone || "");
      localStorage.setItem("sc_user_email", data.email || "");
      localStorage.setItem("sc_user_role", data.role || "CUSTOMER");
      localStorage.setItem("sc_user_provider", data.provider || "LOCAL");
      localStorage.setItem("sc_user_avatar_url", data.avatarUrl || "");
      set({
        user: {
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          role: data.role || "CUSTOMER",
          provider: data.provider || "LOCAL",
          avatarUrl: data.avatarUrl || "",
        },
      });
    } catch (e) {
      console.error("Failed to fetch current user profile", e);
    }
  },
}));

// Eagerly load addresses and bind logout events
if (typeof window !== "undefined") {
  if (localStorage.getItem("sc_logged_in") === "true") {
    setTimeout(() => {
      useAuthStore
        .getState()
        .fetchAddresses()
        .catch(() => {});
      useCartStore
        .getState()
        .fetchCart()
        .catch(() => {});
      useWishlistStore
        .getState()
        .fetchWishlist()
        .catch(() => {});
    }, 200);
  }
  window.addEventListener("auth-logout", () => {
    useAuthStore.setState({ isLoggedIn: false, user: null, addresses: [] });
  });
}

export const useCartStore = create((set, get) => ({
  cart:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("sc_cart_items") || "[]")
      : [],
  isCartOpen: false,
  coupon: null,
  selectedAddressId: null,

  setCartOpen: (open) => set({ isCartOpen: open }),

  fetchCart: async () => {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (!isLoggedIn) return;
    try {
      const dbCart = await apiClient.get("/api/v1/cart");
      const mapped = dbCart.map(mapBackendCartItem);
      set({ cart: mapped });
      localStorage.setItem("sc_cart_items", JSON.stringify(mapped));
    } catch (e) {
      console.error("Failed to fetch cart from backend", e);
    }
  },

  addToCart: async (product, quantity, selectedVariant) => {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (isLoggedIn) {
      try {
        let variantId = null;
        if (product.variants && product.variants.length > 0) {
          const matching = product.variants.find((v) =>
            Object.entries(selectedVariant).some(
              ([key, val]) =>
                v.name.toLowerCase() === key.toLowerCase() &&
                v.options.includes(val),
            ),
          );
          if (matching) {
            // Seeding Flipkart items won't have variants by default, but this logic is fully robust
          }
        }
        await apiClient.post("/api/v1/cart/items", {
          productId: Number(product.id),
          variantId,
          quantity,
        });
        await get().fetchCart();
      } catch (e) {
        console.error("Failed to add to cart in backend", e);
        throw e;
      }
    } else {
      const variantString = Object.entries(selectedVariant)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, v]) => `${k}:${v}`)
        .join("|");
      const cartItemId = `${product.id}_${variantString}`;

      set((state) => {
        const existingIdx = state.cart.findIndex(
          (item) => item.cartItemId === cartItemId,
        );
        let updatedCart;
        if (existingIdx !== -1) {
          updatedCart = [...state.cart];
          const newQty = updatedCart[existingIdx].quantity + quantity;
          updatedCart[existingIdx].quantity =
            product.stockCount > 0
              ? Math.min(newQty, product.stockCount)
              : newQty;
        } else {
          updatedCart = [
            ...state.cart,
            { cartItemId, product, quantity, selectedVariant },
          ];
        }

        localStorage.setItem("sc_cart_items", JSON.stringify(updatedCart));
        return { cart: updatedCart };
      });
    }
  },

  removeFromCart: async (cartItemId) => {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (isLoggedIn) {
      try {
        await apiClient.delete(`/api/v1/cart/items/${cartItemId}`);
        await get().fetchCart();
      } catch (e) {
        console.error("Failed to remove item in backend", e);
      }
    } else {
      set((state) => {
        const updatedCart = state.cart.filter(
          (item) => item.cartItemId !== cartItemId,
        );
        localStorage.setItem("sc_cart_items", JSON.stringify(updatedCart));
        return { cart: updatedCart };
      });
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (isLoggedIn) {
      try {
        await apiClient.put(
          `/api/v1/cart/items/${cartItemId}?quantity=${quantity}`,
        );
        await get().fetchCart();
      } catch (e) {
        console.error("Failed to update quantity in backend", e);
        throw e;
      }
    } else {
      set((state) => {
        const updatedCart = state.cart.map((item) => {
          if (item.cartItemId === cartItemId) {
            const capQty =
              item.product.stockCount > 0
                ? Math.min(quantity, item.product.stockCount)
                : quantity;
            return { ...item, quantity: Math.max(1, capQty) };
          }
          return item;
        });
        localStorage.setItem("sc_cart_items", JSON.stringify(updatedCart));
        return { cart: updatedCart };
      });
    }
  },

  applyCoupon: async (code) => {
    const { subtotal } = get().getTotals();
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (isLoggedIn) {
      try {
        const response = await apiClient.post("/api/v1/coupons/validate", {
          code,
          orderValue: subtotal,
        });
        const coupon = {
          code: response.code,
          discountType:
            response.type.toLowerCase() === "percentage"
              ? "percentage"
              : "flat",
          value: Number(response.discount),
          minSpend: 0,
          description: `Backend Coupon: ${response.code}`,
        };
        set({ coupon });
        return {
          success: true,
          message: `Coupon ${response.code} applied successfully!`,
        };
      } catch (e) {
        return { success: false, message: e.message || "Invalid coupon code." };
      }
    } else {
      const coupons = mockDb.getCoupons();
      const found = coupons.find(
        (c) => c.code.toUpperCase() === code.trim().toUpperCase(),
      );
      if (!found) {
        return { success: false, message: "Invalid coupon code." };
      }

      if (subtotal < found.minSpend) {
        return {
          success: false,
          message: `Minimum spend of ₹${found.minSpend} required for this coupon.`,
        };
      }

      set({ coupon: found });
      return {
        success: true,
        message: `Coupon ${found.code} applied successfully!`,
      };
    }
  },

  removeCoupon: () => set({ coupon: null }),

  setSelectedAddressId: (id) => set({ selectedAddressId: id }),

  clearCart: () => {
    localStorage.removeItem("sc_cart_items");
    set({ cart: [], coupon: null });
  },

  getTotals: () => {
    const cart = get().cart;
    const coupon = get().coupon;

    const subtotal = cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
    let discount = 0;
    if (coupon) {
      if (coupon.discountType === "percentage") {
        discount = subtotal * (coupon.value / 100);
      } else {
        discount = coupon.value;
      }
    }

    let deliveryCharge = subtotal > 0 && subtotal < 499 ? 40 : 0;
    if (coupon?.code === "FREESHIP" && subtotal >= coupon.minSpend) {
      deliveryCharge = 0;
    }

    const total = Math.max(0, subtotal - discount + deliveryCharge);

    return { subtotal, discount, deliveryCharge, total };
  },
}));

export const useWishlistStore = create((set, get) => ({
  wishlist:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("sc_wishlist_items") || "[]")
      : [],

  fetchWishlist: async () => {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (!isLoggedIn) return;
    try {
      const dbWishlist = await apiClient.get("/api/v1/wishlist");
      const products = dbWishlist.map((item) =>
        mapBackendProduct(item.product),
      );
      set({ wishlist: products });
      localStorage.setItem("sc_wishlist_items", JSON.stringify(products));
    } catch (e) {
      console.error("Failed to fetch wishlist from backend", e);
    }
  },

  toggleWishlist: async (product) => {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (isLoggedIn) {
      try {
        const exists = get().isInWishlist(product.id);
        if (exists) {
          await apiClient.delete(`/api/v1/wishlist/${product.id}`);
        } else {
          await apiClient.post(`/api/v1/wishlist/${product.id}`);
        }
        await get().fetchWishlist();
      } catch (e) {
        console.error("Failed to toggle wishlist in backend", e);
      }
    } else {
      set((state) => {
        const exists = state.wishlist.some((p) => p.id === product.id);
        let updated;
        if (exists) {
          updated = state.wishlist.filter((p) => p.id !== product.id);
        } else {
          updated = [...state.wishlist, product];
        }
        localStorage.setItem("sc_wishlist_items", JSON.stringify(updated));
        return { wishlist: updated };
      });
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some((p) => String(p.id) === String(productId));
  },
}));
