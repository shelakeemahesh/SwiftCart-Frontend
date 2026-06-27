// Mock of mapBackendProduct
function mapBackendProduct(p) {
  if (!p) return {};
  return {
    id: String(p.id || ''),
    name: p.name || '',
    slug: p.slug || '',
    description: p.description || '',
    price: p.basePrice !== undefined ? Number(p.basePrice) : Number(p.price || 0),
    mrp: p.mrp !== undefined ? Number(p.mrp) : Number(p.mrp || 0),
    discount: p.discountPercent !== undefined ? Number(p.discountPercent) : (p.discount !== undefined ? Number(p.discount) : 0),
    images: Array.isArray(p.images)
      ? p.images.map((img) => typeof img === 'string' ? img : img.imageUrl)
      : [],
    category: p.category && typeof p.category === 'object' ? p.category.name : (p.category || 'General'),
    brand: p.brand || '',
    rating: p.averageRating !== undefined ? Number(p.averageRating) : Number(p.rating || 0),
    reviewCount: p.reviewCount !== undefined ? Number(p.reviewCount) : 0,
    inStock: p.stockQty !== undefined ? p.stockQty > 0 : !!p.inStock,
    stockCount: p.stockQty !== undefined ? p.stockQty : (p.stockCount || 0),
    isTrending: p.isFeatured || (p.soldCount !== undefined && p.soldCount > 10),
    isNewArrival: p.isNewArrival,
    isBestSeller: p.soldCount !== undefined && p.soldCount > 20,
    isSwiftChoice: p.isFeatured,
    sellerId: p.seller && typeof p.seller === 'object' ? String(p.seller.id) : String(p.sellerId || '1'),
    deliveryDays: p.deliveryDays || 3,
    highlights: Array.isArray(p.highlights) ? p.highlights : [],
    specs: p.specifications || p.specs || {},
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    variants: Array.isArray(p.variants)
      ? p.variants.map((v) => ({
          type: 'color',
          name: v.variantKey || '',
          options: [v.variantVal || '']
        }))
      : []
  };
}

async function run() {
  try {
    const categoryName = 'Electronics';
    console.log("Fetching categories...");
    const categoriesRes = await fetch('https://swiftcart-backend-40z4.onrender.com/api/v1/categories');
    const categoriesJson = await categoriesRes.json();
    const categories = categoriesJson.data;
    
    console.log("Categories found:", categories.length);
    const matchedCat = categories.find(c => 
      c.slug.toLowerCase() === categoryName.toLowerCase() ||
      c.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (!matchedCat) {
      console.log("No category matched!");
      return;
    }
    
    console.log("Matched category ID:", matchedCat.id);
    
    const params = new URLSearchParams({
      page: '0',
      size: '100',
      inStock: 'false',
      categoryId: String(matchedCat.id)
    });
    
    console.log("Fetching products with params:", params.toString());
    const prodRes = await fetch(`https://swiftcart-backend-40z4.onrender.com/api/v1/products?${params.toString()}`);
    const prodJson = await prodRes.json();
    const response = prodJson.data;
    
    console.log("Raw products content count:", response.content ? response.content.length : 'none');
    const mapped = (response.content || []).map(mapBackendProduct);
    console.log("Successfully mapped products count:", mapped.length);
    if (mapped.length > 0) {
      console.log("Sample mapped product:", JSON.stringify(mapped[0], null, 2));
    }
  } catch (e) {
    console.error("Error occurred:", e);
  }
}

run();
