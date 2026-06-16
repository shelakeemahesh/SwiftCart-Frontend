// Initial Mock Sellers
export const MOCK_SELLERS = [
  {
    id: "seller-1",
    name: "ElectroWorld Retail",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    rating: 4.7,
    followerCount: 18450,
    description:
      "Premier seller of smartphones, accessories, smart home tech, and custom computing rigs. Fulfilled directly by SwiftCart.",
  },
  {
    id: "seller-2",
    name: "StyleCo Apparel",
    logo: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    rating: 4.3,
    followerCount: 9230,
    description:
      "Modern essentials, casual streetwear, and luxury tailoring for active lifestyles.",
  },
  {
    id: "seller-3",
    name: "HomeZen Living",
    logo: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80",
    rating: 4.8,
    followerCount: 6110,
    description:
      "Ergonomic furnishings, intelligent kitchen solutions, and artisan home accents.",
  },
  {
    id: "seller-4",
    name: "GlowBeauty Essentials",
    logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&auto=format&fit=crop&q=80",
    banner:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80",
    rating: 4.5,
    followerCount: 11200,
    description:
      "Clean skincare, organic body care, dermatologically approved cosmetics.",
  },
];

// Initial Mock Coupons
export const MOCK_COUPONS = [
  {
    code: "SWIFT10",
    discountType: "percentage",
    value: 10,
    minSpend: 999,
    description: "Get 10% Off on all orders above ₹999.",
  },
  {
    code: "SUPERDEAL",
    discountType: "flat",
    value: 500,
    minSpend: 2999,
    description: "Save ₹500 flat on high-value orders above ₹2,999.",
  },
  {
    code: "FREESHIP",
    discountType: "flat",
    value: 40,
    minSpend: 499,
    description: "Free Shipping on purchases over ₹499.",
  },
];

// Initial Mock Addresses
export const MOCK_ADDRESSES = [
  {
    id: "addr-1",
    name: "Mahesh Kumar",
    phone: "9876543210",
    pincode: "560103",
    addressLine1: "Flat 405, Royal Nest Apartments",
    addressLine2: "Green Glen Layout, Bellandur",
    city: "Bengaluru",
    state: "Karnataka",
    type: "Home",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "Mahesh Kumar (Office)",
    phone: "9988776655",
    pincode: "560001",
    addressLine1: "Level 14, TechHub Towers",
    addressLine2: "MG Road, Landmark: Opp Metro Station",
    city: "Bengaluru",
    state: "Karnataka",
    type: "Work",
    isDefault: false,
  },
];

// Standard Mock Reviews Helper
const createMockReviews = (productName) => [
  {
    id: "rev-1",
    username: "Ramesh S.",
    avatar: "RS",
    rating: 5,
    date: "2026-05-18",
    title: "Outstanding quality and premium feel!",
    body: `I am highly impressed with the ${productName}. The build quality is fantastic, and the overall premium finish exceeds expectations. It works flawlessly. Delivery was also super fast!`,
    helpfulYesCount: 42,
    helpfulNoCount: 2,
  },
  {
    id: "rev-2",
    username: "Ananya M.",
    avatar: "AM",
    rating: 4,
    date: "2026-05-24",
    title: "Very good product, highly responsive",
    body: `Bought this after reading many reviews. It is really solid and worth the money. Only minor issue is that the packaging was slightly dented, but the actual product inside was safe. Highly recommend!`,
    helpfulYesCount: 18,
    helpfulNoCount: 1,
  },
  {
    id: "rev-3",
    username: "Vikram K.",
    avatar: "VK",
    rating: 3,
    date: "2026-05-28",
    title: "Decent performance but slightly overpriced",
    body: `It does the job well, but I think similar features can be found at a slightly lower price. If you get it on a sale, then it is a no-brainer.`,
    helpfulYesCount: 9,
    helpfulNoCount: 4,
  },
];

// Initial Mock Products
export const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "SwiftBuds Pro Wireless Earbuds",
    description:
      "Active Noise Cancelling (ANC) true wireless earbuds with custom spatial audio, 30-hour battery life, and IPX7 water resistance. Features quick charging and intuitive touch controls.",
    price: 1999,
    mrp: 4999,
    discount: 60,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Electronics",
    brand: "SwiftAudio",
    rating: 4.4,
    reviewCount: 1240,
    inStock: true,
    stockCount: 45,
    isTrending: true,
    isBestSeller: true,
    isSwiftChoice: true,
    sellerId: "seller-1",
    deliveryDays: 2,
    highlights: [
      "Hybrid Active Noise Cancellation (up to 40dB)",
      "11mm Dynamic Drivers with Spatial Audio",
      "Up to 30 Hours Total Playtime with Wireless Charging Case",
      "IPX7 Sweat & Water Resistant",
      "Ultra-low Latency Mode for Gaming (60ms)",
    ],
    specs: {
      "Bluetooth Version": "5.3",
      "Driver Size": "11 mm",
      "Battery Life (Earbuds)": "7 Hours (ANC Off)",
      "Battery Life (With Case)": "30 Hours",
      "Charging Time": "1.5 Hours",
      "Waterproof Rating": "IPX7",
      Warranty: "1 Year Brand Warranty",
    },
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Carbon Black", "Polar White", "Deep Navy"],
      },
    ],
    reviews: createMockReviews("SwiftBuds Pro Wireless Earbuds"),
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-headphones-moving-to-the-music-34251-large.mp4",
  },
  {
    id: "prod-2",
    name: "AeroRun Pro Cushion Running Shoes",
    description:
      "Engineered with reactive nitrogen-infused foam midsole for supreme energy return. Lightweight mesh upper delivers superior breathability for long runs.",
    price: 2499,
    mrp: 5999,
    discount: 58,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Fashion",
    brand: "AeroRun",
    rating: 4.2,
    reviewCount: 840,
    inStock: true,
    stockCount: 18,
    isTrending: true,
    isNewArrival: true,
    sellerId: "seller-2",
    deliveryDays: 3,
    highlights: [
      "Reactive Nitrogen-Infused Midsole Foam",
      "Breathable Multi-weave Mesh Upper",
      "High-traction Carbon Rubber Outsole",
      "Reflective Accents for Low-light Visibility",
      "Ergonomic Arch Support Cushioning",
    ],
    specs: {
      "Upper Material": "Engineered Mesh",
      "Sole Material": "Carbon Rubber",
      Weight: "245g (Size 9)",
      "Arch Support": "Neutral",
      Closing: "Lace-Up",
      "Ideal For": "Men's Running & Training",
    },
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Crimson Red", "Neon Lime", "Shadow Gray"],
      },
      { type: "size", name: "Size (UK)", options: ["7", "8", "9", "10", "11"] },
    ],
    reviews: createMockReviews("AeroRun Pro Cushion Running Shoes"),
  },
  {
    id: "prod-3",
    name: "SmartVibe AMOLED Fitness Watch",
    description:
      "1.43-inch Always-On AMOLED Display fitness smartwatch. Tracks SpO2, heart rate, sleep quality, and incorporates 110+ sports modes with 12-day battery life.",
    price: 3499,
    mrp: 7999,
    discount: 56,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Electronics",
    brand: "SmartVibe",
    rating: 4.5,
    reviewCount: 3120,
    inStock: true,
    stockCount: 60,
    isBestSeller: true,
    isSwiftChoice: true,
    sellerId: "seller-1",
    deliveryDays: 2,
    highlights: [
      "1.43” Always-On AMOLED Display (466x466 px)",
      "Continuous 24/7 Heart Rate & SpO2 Tracking",
      "110+ Athletic Tracking Modes",
      "5ATM Water Resistance (up to 50 meters)",
      "Up to 12-day Battery Life on Normal Mode",
    ],
    specs: {
      "Display Size": "1.43 inches",
      "Display Type": "AMOLED",
      "Battery Life": "12 Days",
      "Water Resistance": "5 ATM",
      Sensors: "Optical HR, SpO2, Accelerometer, Gyroscope",
      Compatibility: "Android 6.0+ / iOS 11.0+",
    },
    variants: [
      {
        type: "color",
        name: "Strap Color",
        options: ["Obsidian Black", "Classic Leather", "Forest Green"],
      },
    ],
    reviews: createMockReviews("SmartVibe AMOLED Fitness Watch"),
  },
  {
    id: "prod-4",
    name: "OpalGlow Hydrating Glow Serum",
    description:
      "Premium hyaluronic acid and vitamin C face serum. Locks in moisture, brightens dark spots, and reduces fine lines. Suitable for all skin types. 100% vegan.",
    price: 599,
    mrp: 1499,
    discount: 60,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Beauty",
    brand: "OpalGlow",
    rating: 4.6,
    reviewCount: 450,
    inStock: true,
    stockCount: 120,
    isTrending: true,
    sellerId: "seller-4",
    deliveryDays: 3,
    highlights: [
      "Contains 2% Pure Hyaluronic Acid + 10% Vitamin C",
      "Intense Hydration & Elasticity Booster",
      "Reduces Hyperpigmentation & Fine Lines",
      "Fragrance-Free, Cruelty-Free, and 100% Vegan",
      "Dermatologically Tested for Sensitive Skin",
    ],
    specs: {
      Volume: "30 ml",
      "Key Ingredients": "Hyaluronic Acid, Vitamin C, Niacinamide",
      "Skin Type": "All Skin Types",
      Form: "Liquid Serum",
      "Paraben Free": "Yes",
      "Cruelty Free": "Yes",
    },
    variants: [{ type: "size", name: "Pack Size", options: ["30ml", "50ml"] }],
    reviews: createMockReviews("OpalGlow Hydrating Glow Serum"),
  },
  {
    id: "prod-5",
    name: "HomeZen Ergonomic Desk Chair",
    description:
      "High-back mesh desk chair featuring adaptive lumbar support, 3D armrests, and 135-degree recline locking mechanism. Ideal for long remote working sessions.",
    price: 8999,
    mrp: 19999,
    discount: 55,
    images: [
      "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Home",
    brand: "HomeZen",
    rating: 4.7,
    reviewCount: 310,
    inStock: true,
    stockCount: 15,
    isTrending: true,
    isBestSeller: true,
    sellerId: "seller-3",
    deliveryDays: 4,
    highlights: [
      "Adaptive Dynamic Lumbar Support Cushioning",
      "High-elasticity Breathable Mesh Backrest",
      "3D Adjustable Armrests (Height, Angle, Front-Back)",
      "Heavy-duty Alloy Base with Smooth Nylon Casters",
      "Synchro-tilt Recline Reaching Up to 135° with Multi-lock",
    ],
    specs: {
      Material: "High Density Mesh & Heavy Duty Alloy Base",
      "Weight Capacity": "Up to 150 kg",
      "Recline Range": "90 to 135 degrees",
      "Gas Lift Class": "Class 4 Certificated",
      "Assembly Required": "Yes (Tool kit & instructions included)",
      Warranty: "3 Year Manufacturer Warranty",
    },
    variants: [
      {
        type: "color",
        name: "Frame Color",
        options: ["Slate Gray & Black", "White & Light Gray"],
      },
    ],
    reviews: createMockReviews("HomeZen Ergonomic Desk Chair"),
  },
  {
    id: "prod-6",
    name: "EcoFresh Organic Arabica Medium Roast",
    description:
      "100% organic Single-origin Arabica coffee beans harvested from shade-grown estates in Chikmagalur. Medium roast delivering citrus and dark cocoa notes.",
    price: 349,
    mrp: 599,
    discount: 41,
    images: [
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Grocery",
    brand: "EcoFresh",
    rating: 4.3,
    reviewCount: 190,
    inStock: true,
    stockCount: 140,
    isNewArrival: true,
    sellerId: "seller-3",
    deliveryDays: 2,
    highlights: [
      "100% Single Origin shade-grown Arabica Coffee Beans",
      "Medium Roast Profile for balanced body and acidity",
      "Artisan-roasted in small batches in Chikmagalur",
      "Features Tasting Notes of Citrus, Caramel & Dark Cocoa",
      "Eco-friendly re-sealable valve zipper packaging",
    ],
    specs: {
      Weight: "250g",
      "Coffee Type": "Whole Coffee Beans",
      "Roast Level": "Medium Roast",
      Origin: "Chikmagalur, India",
      Certification: "Organic Certified",
      "Shelf Life": "9 Months",
    },
    variants: [
      {
        type: "size",
        name: "Grind Type",
        options: [
          "Whole Beans",
          "Filter Grind",
          "French Press Grind",
          "Cold Brew Grind",
        ],
      },
    ],
    reviews: createMockReviews("EcoFresh Organic Arabica Medium Roast"),
  },
  {
    id: "prod-7",
    name: "SwiftBook Air 14-inch Laptop",
    description:
      "Powered by the latest Gen Intel Core i5 processor, 16GB LPDDR5 RAM, and 512GB NVMe SSD. Features a gorgeous 2.5K IPS thin-bezel screen and an ultra-thin 1.3kg aluminum chassis.",
    price: 49990,
    mrp: 69999,
    discount: 28,
    images: [
      "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Electronics",
    brand: "SwiftTech",
    rating: 4.6,
    reviewCount: 520,
    inStock: true,
    stockCount: 12,
    isTrending: true,
    isBestSeller: true,
    sellerId: "seller-1",
    deliveryDays: 2,
    highlights: [
      "Intel Core i5-1340P 12-Core Processor",
      "16GB LPDDR5 Dual-Channel RAM & 512GB PCIe Gen4 SSD",
      "14.1” 2.5K (2560x1600) IPS Display with 100% sRGB",
      "Backlit keyboard, Fingerprint reader, and Glass Trackpad",
      "Up to 10 Hours Battery with Type-C 65W PD Fast Charger",
    ],
    specs: {
      Processor: "Intel Core i5-1340P",
      RAM: "16 GB LPDDR5",
      Storage: "512 GB NVMe PCIe SSD",
      Display: "14.1 inch 2.5K IPS",
      Graphics: "Intel Iris Xe Graphics",
      "Operating System": "Windows 11 Home",
      Weight: "1.34 kg",
      Warranty: "1 Year Onsite Warranty",
    },
    variants: [
      {
        type: "storage",
        name: "Configuration",
        options: ["16GB RAM / 512GB SSD", "16GB RAM / 1TB SSD"],
      },
    ],
    reviews: createMockReviews("SwiftBook Air 14-inch Laptop"),
  },
  {
    id: "prod-8",
    name: "KitchenPro Multi-Bullet Blender",
    description:
      "High-torque 1000W copper motor nutrition extraction blender. Includes three leak-proof Tritan travel jars, sports lids, and dry/wet grinding stainless steel blades.",
    price: 3299,
    mrp: 6999,
    discount: 52,
    images: [
      "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Home",
    brand: "KitchenPro",
    rating: 4.4,
    reviewCount: 970,
    inStock: true,
    stockCount: 22,
    sellerId: "seller-3",
    deliveryDays: 3,
    highlights: [
      "Powerful 1000W High-Torque 100% Copper Motor",
      "Precision Extracting Blades crafted in Food-Grade Stainless Steel",
      "Includes 3 Tritan BPA-Free Jars (800ml, 500ml, 300ml)",
      "One-touch Hands-free Pulse Operation",
      "Overheat Protection Auto-off safety switch",
    ],
    specs: {
      Wattage: "1000 W",
      "No. of Jars": "3 Jars",
      "Jar Material": "Tritan BPA-Free Plastic",
      "Motor Speed": "22,000 RPM",
      "Blade Types": "1 Wet Extraction Blade, 1 Dry Grinding Blade",
      Warranty: "2 Year Product Warranty",
    },
    variants: [
      {
        type: "color",
        name: "Base Finish",
        options: ["Metallic Silver", "Matte Midnight Black"],
      },
    ],
    reviews: createMockReviews("KitchenPro Multi-Bullet Blender"),
  },
  {
    id: "prod-9",
    name: "GlowRadiance Hydra-Moist Face Gel",
    description:
      "Ultralight gel-moisturizer enriched with 72-hour moisture lock technology. Contains nutrient-rich seaweed extract and soothing Aloe Vera. Non-sticky formula.",
    price: 399,
    mrp: 899,
    discount: 55,
    images: [
      "https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Beauty",
    brand: "GlowBeauty",
    rating: 4.3,
    reviewCount: 680,
    inStock: true,
    stockCount: 85,
    isNewArrival: true,
    sellerId: "seller-4",
    deliveryDays: 3,
    highlights: [
      "72-Hour Active Moisture-Lock Gel Formula",
      "Infused with Seaweed Extract & Aloe Vera Juice",
      "Non-greasy, absorption within 10 seconds",
      "Controls excessive sebum production",
      "Paraben-free, mineral oil-free, phthalate-free",
    ],
    specs: {
      Volume: "50 g",
      "Skin Type": "Oily, Combination & Sensitive",
      Texture: "Ultralight Cooling Gel",
      Usage: "Day & Night Cream",
      Fragrance: "Mild Cucumber Essence",
    },
    variants: [{ type: "size", name: "Weight", options: ["50g", "100g"] }],
    reviews: createMockReviews("GlowRadiance Hydra-Moist Face Gel"),
  },
  {
    id: "prod-10",
    name: "RetroClassic Leather Messenger Bag",
    description:
      "Handcrafted genuine goat leather cross-body messenger bag with heavy brass accents. Accommodates laptops up to 15.6 inches. Canvas padded internal lining.",
    price: 1899,
    mrp: 4500,
    discount: 57,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Fashion",
    brand: "RetroClassic",
    rating: 4.5,
    reviewCount: 420,
    inStock: true,
    stockCount: 8,
    isBestSeller: true,
    sellerId: "seller-2",
    deliveryDays: 4,
    highlights: [
      "100% Genuine Goat Leather, vegetable-tanned",
      "Heavy-duty brass buckles, rivets, and YKK zippers",
      'Padded central compartment fits up to 15.6" Laptop',
      "Adjustable leather shoulder strap with sliding pad",
      "Two external buckle pockets and multiple zip pockets",
    ],
    specs: {
      Material: "Genuine Leather & Canvas Inner Lining",
      "Laptop Compatibility": "Up to 15.6 inches",
      Dimensions: "15 x 11 x 4 inches",
      "Number of Pockets": "6 Pockets",
      Weight: "980g",
      "Strap Drop": "Adjustable up to 28 inches",
    },
    variants: [
      {
        type: "color-name",
        name: "Leather Tone",
        options: ["Tan Brown", "Dark Chocolate"],
      },
    ],
    reviews: createMockReviews("RetroClassic Leather Messenger Bag"),
  },
  {
    id: "prod-11",
    name: "SwiftBuds Lite Wireless Earbuds",
    description:
      "Affordable, rich bass earbuds featuring Bluetooth 5.3, 20-hour playback, and IPX5 splash protection. Perfect for gym and calls.",
    price: 899,
    mrp: 2499,
    discount: 64,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Electronics",
    brand: "SwiftAudio",
    rating: 4.1,
    reviewCount: 3110,
    inStock: true,
    stockCount: 150,
    isBestSeller: true,
    sellerId: "seller-1",
    deliveryDays: 2,
    highlights: [
      "Enhanced bass 10mm micro-drivers",
      "20 hours total battery life with Type-C case",
      "IPX5 water and sweat resistant rating",
      "Low latency touch sensor controls",
    ],
    specs: {
      Bluetooth: "5.3",
      Playback: "20 Hours",
      "Driver Size": "10 mm",
      Waterproof: "IPX5",
    },
    variants: [
      { type: "color", name: "Color", options: ["Matte Black", "Polar White"] },
    ],
    reviews: createMockReviews("SwiftBuds Lite Wireless Earbuds"),
  },
  {
    id: "prod-12",
    name: 'SwiftBook Pro 15.6" OLED',
    description:
      "Workstation laptop containing high-end OLED display, AMD Ryzen 7, 32GB DDR5 RAM, and 1TB SSD. Built for creators and developers.",
    price: 74990,
    mrp: 99999,
    discount: 25,
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=600&auto=format&fit=crop&q=80",
    ],
    category: "Electronics",
    brand: "SwiftTech",
    rating: 4.8,
    reviewCount: 180,
    inStock: false,
    stockCount: 0,
    sellerId: "seller-1",
    deliveryDays: 3,
    highlights: [
      "AMD Ryzen 7 7840HS High-Performance CPU",
      "15.6” 3.2K 120Hz OLED Display (100% DCI-P3)",
      "32GB DDR5 Dual Channel RAM & 1TB NVMe PCIe 4.0 SSD",
      "Aluminum construct with 80Wh long-life battery",
    ],
    specs: {
      CPU: "AMD Ryzen 7 7840HS",
      RAM: "32 GB DDR5",
      Storage: "1 TB SSD",
      Display: '15.6" OLED 3.2K 120Hz',
      Weight: "1.6 kg",
    },
    variants: [],
    reviews: createMockReviews('SwiftBook Pro 15.6" OLED'),
  },
];

// Seed standard past orders for the dashboard
export const MOCK_ORDERS_SEED = [
  {
    id: "OD-781293812",
    date: "2026-05-20",
    status: "Delivered",
    items: [
      {
        productId: "prod-11",
        name: "SwiftBuds Lite Wireless Earbuds",
        price: 899,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=80",
        selectedVariant: { Color: "Matte Black" },
      },
      {
        productId: "prod-4",
        name: "OpalGlow Hydrating Glow Serum",
        price: 599,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&auto=format&fit=crop&q=80",
        selectedVariant: { "Pack Size": "30ml" },
      },
    ],
    subtotal: 1498,
    discount: 149.8,
    deliveryCharge: 0,
    total: 1348.2,
    deliveryAddress: MOCK_ADDRESSES[0],
    paymentMethod: "UPI (Paytm)",
    trackingTimeline: [
      {
        title: "Ordered",
        description: "Order successfully placed on SwiftCart",
        date: "2026-05-20 14:10",
        completed: true,
      },
      {
        title: "Dispatched",
        description: "Shipped via Delhivery Courier service",
        date: "2026-05-21 09:30",
        completed: true,
      },
      {
        title: "Out for Delivery",
        description: "Assigned to delivery agent near Bellandur hub",
        date: "2026-05-22 10:15",
        completed: true,
      },
      {
        title: "Delivered",
        description: "Successfully handed over to resident",
        date: "2026-05-22 15:45",
        completed: true,
      },
    ],
  },
  {
    id: "OD-192384712",
    date: "2026-05-29",
    status: "Dispatched",
    items: [
      {
        productId: "prod-2",
        name: "AeroRun Pro Cushion Running Shoes",
        price: 2499,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
        selectedVariant: { Color: "Crimson Red", "Size (UK)": "9" },
      },
    ],
    subtotal: 2499,
    discount: 0,
    deliveryCharge: 40,
    total: 2539,
    deliveryAddress: MOCK_ADDRESSES[0],
    paymentMethod: "Credit Card (Visa)",
    trackingTimeline: [
      {
        title: "Ordered",
        description: "Order successfully placed on SwiftCart",
        date: "2026-05-29 18:22",
        completed: true,
      },
      {
        title: "Dispatched",
        description: "Shipped from Mumbai Warehouse via SwiftExpress",
        date: "2026-05-30 11:45",
        completed: true,
      },
      {
        title: "Out for Delivery",
        description: "Estimated delivery by 9:00 PM today",
        date: "Pending",
        completed: false,
      },
      {
        title: "Delivered",
        description: "Pending confirmation",
        date: "Pending",
        completed: false,
      },
    ],
  },
];

// Helper database manager synced to localStorage
class LocalMockDatabase {
  constructor() {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("sc_products")) {
        localStorage.setItem("sc_products", JSON.stringify(MOCK_PRODUCTS));
      }
      if (!localStorage.getItem("sc_sellers")) {
        localStorage.setItem("sc_sellers", JSON.stringify(MOCK_SELLERS));
      }
      if (!localStorage.getItem("sc_coupons")) {
        localStorage.setItem("sc_coupons", JSON.stringify(MOCK_COUPONS));
      }
      if (!localStorage.getItem("sc_addresses")) {
        localStorage.setItem("sc_addresses", JSON.stringify(MOCK_ADDRESSES));
      }
      if (!localStorage.getItem("sc_orders")) {
        localStorage.setItem("sc_orders", JSON.stringify(MOCK_ORDERS_SEED));
      }
    }
  }

  getProducts() {
    return JSON.parse(localStorage.getItem("sc_products") || "[]");
  }

  getProductById(id) {
    return this.getProducts().find((p) => p.id === id);
  }

  updateProduct(product) {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      products[idx] = product;
      localStorage.setItem("sc_products", JSON.stringify(products));
    }
  }

  getSellers() {
    return JSON.parse(localStorage.getItem("sc_sellers") || "[]");
  }

  getSellerById(id) {
    return this.getSellers().find((s) => s.id === id);
  }

  getCoupons() {
    return JSON.parse(localStorage.getItem("sc_coupons") || "[]");
  }

  getAddresses() {
    return JSON.parse(localStorage.getItem("sc_addresses") || "[]");
  }

  saveAddress(address) {
    const addresses = this.getAddresses();
    const existingIdx = addresses.findIndex((a) => a.id === address.id);
    if (existingIdx !== -1) {
      addresses[existingIdx] = address;
    } else {
      addresses.push(address);
    }
    // Handle default selection
    if (address.isDefault) {
      addresses.forEach((a) => {
        if (a.id !== address.id) a.isDefault = false;
      });
    }
    localStorage.setItem("sc_addresses", JSON.stringify(addresses));
    return addresses;
  }

  deleteAddress(id) {
    let addresses = this.getAddresses();
    addresses = addresses.filter((a) => a.id !== id);
    localStorage.setItem("sc_addresses", JSON.stringify(addresses));
    return addresses;
  }

  getOrders() {
    return JSON.parse(localStorage.getItem("sc_orders") || "[]");
  }

  addOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order); // Add to top
    localStorage.setItem("sc_orders", JSON.stringify(orders));
  }
}

export const mockDb = new LocalMockDatabase();
