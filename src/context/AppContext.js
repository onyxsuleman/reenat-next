'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AppContext = createContext();

const defaultProducts = [
  {
    "id": 1,
    "name": "Classic Kanjivaram Silk Saree",
    "type": "Silk",
    "color": "Gold",
    "price": 4500,
    "originalPrice": 9000,
    "image": "/saree_kanjivaram.png",
    "image2": "/saree_kanjivaram.png",
    "image3": "/saree_kanjivaram.png",
    "image4": "",
    "origin": "India",
    "craft": "Mulberry Silk with Zari Border",
    "desc": "Exquisite pure mulberry silk sarees woven with genuine gold zari borders, carrying centuries of wedding-day heritage.",
    "gst": "5",
    "hsn": "500720",
    "weight": 450,
    "styleId": "KJV-SILK-001",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Contrast Blouse",
    "blouseColor": "Golden",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Mulberry Silk",
    "border": "Zari",
    "occasion": "Party Traditional Wedding",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "rating": 4.9
  },
  {
    "id": 2,
    "name": "Royal Banarasi Silk Saree",
    "type": "Brocade",
    "color": "Magenta",
    "price": 3800,
    "originalPrice": 7600,
    "image": "/saree_banarasi.png",
    "image2": "/saree_banarasi.png",
    "image3": "/saree_banarasi.png",
    "image4": "",
    "origin": "India",
    "craft": "Banarasi Brocade",
    "desc": "Dense and luxurious brocades from Varanasi, featuring elaborate floral vines and silver filigree for celebrations.",
    "gst": "5",
    "hsn": "500720",
    "weight": 500,
    "styleId": "BNS-BROC-002",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Running Blouse",
    "blouseColor": "Magenta",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Banarasi Brocade",
    "border": "Zari",
    "occasion": "Party Traditional Wedding",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "rating": 4.8
  },
  {
    "id": 3,
    "name": "Elegant Chanderi Saree",
    "type": "Lightweight",
    "color": "Aqua Blue",
    "price": 2400,
    "originalPrice": 4800,
    "image": "/saree_chanderi.png",
    "image2": "/saree_chanderi.png",
    "image3": "/saree_chanderi.png",
    "image4": "",
    "origin": "India",
    "craft": "Chanderi Weave",
    "desc": "Whisper-light silk cotton blends adorned with delicate handwoven buttis, perfect for warm summers and day events.",
    "gst": "5",
    "hsn": "520811",
    "weight": 350,
    "styleId": "CDR-COT-003",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Contrast Blouse",
    "blouseColor": "Aqua Blue",
    "transparency": "Semi-Transparent",
    "qty": "Single",
    "fabric": "Chanderi Cotton",
    "border": "Contrast",
    "occasion": "Casual",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "rating": 4.7
  },
  {
    "id": 4,
    "name": "Golden Tussar Silk Saree",
    "type": "Organic",
    "color": "Golden Yellow",
    "price": 3200,
    "originalPrice": 6400,
    "image": "/saree_hero.png",
    "image2": "/saree_hero.png",
    "image3": "/saree_hero.png",
    "image4": "",
    "origin": "India",
    "craft": "Tussar Handloom",
    "desc": "Naturally textured wild silk sarees with a soft golden sheen, celebrating raw elegance and earth-toned charm.",
    "gst": "5",
    "hsn": "500720",
    "weight": 400,
    "styleId": "TSR-ORG-004",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Running Blouse",
    "blouseColor": "Golden Yellow",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Silk",
    "border": "Zari",
    "occasion": "Festive",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "rating": 4.6
  },
  {
    "id": 10,
    "name": "paithani saree",
    "type": "Kanjeevaram",
    "color": "Aqua Blue",
    "price": 900,
    "originalPrice": 1900,
    "image": "/saree_kanjivaram.png",
    "image2": "/saree_kanjivaram.png",
    "image3": "https://reenat-trends.vercel.app/saree_chanderi.png",
    "image4": "",
    "origin": "India",
    "craft": "Cotton Silk with Zari Border",
    "desc": "saree",
    "gst": "5",
    "hsn": "520811",
    "weight": 390,
    "styleId": "",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Running Blouse",
    "blouseColor": "Aqua Blue",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Party Traditional Wedding",
    "loom": "Powerloom",
    "brand": "REENAT TRENDS",
    "rating": 4.5
  },
  {
    "id": 11,
    "name": "paithani saree Mango Green",
    "type": "Kanjeevaram",
    "color": "Golden Yellow",
    "price": 999,
    "originalPrice": 3000,
    "image": "/saree_kanjivaram.png",
    "image2": "/saree_kanjivaram.png",
    "image3": "https://reenat-trends.vercel.app/saree_chanderi.png",
    "image4": "",
    "origin": "India",
    "craft": "Cotton Silk with Zari Border",
    "desc": "paithani Mango Green with blouse",
    "gst": "5",
    "hsn": "520811",
    "weight": 390,
    "styleId": "mangoGreen",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Running Blouse",
    "blouseColor": "Golden",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Party Traditional Wedding",
    "loom": "Powerloom",
    "brand": "REENAT TRENDS",
    "rating": 4.5
  },
  {
    "id": 17,
    "name": "Paithani Cotton Silk saree",
    "type": "Kanjeevaram",
    "color": "Aqua Blue",
    "price": 900,
    "originalPrice": 3000,
    "image": "/saree_kanjivaram.png",
    "image2": "/saree_kanjivaram.png",
    "image3": "/saree_kanjivaram.png",
    "image4": "",
    "origin": "India",
    "craft": "Cotton Silk with Zari Border",
    "desc": "saree",
    "gst": "5",
    "hsn": "520811",
    "weight": 390,
    "styleId": "Tussar R Brown X1",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Running Blouse",
    "blouseColor": "Aqua Blue",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Party Traditional Wedding",
    "loom": "Powerloom",
    "brand": "REENAT TRENDS",
    "rating": 4.5
  },
  {
    "id": 19,
    "name": "Paithani Cotton Silk saree Black red",
    "type": "Kanjeevaram",
    "color": "Aqua Blue",
    "price": 2900,
    "originalPrice": 3100,
    "image": "/saree_kanjivaram.png",
    "image2": "/saree_kanjivaram.png",
    "image3": "/saree_kanjivaram.png",
    "image4": "",
    "origin": "India",
    "craft": "Cotton Silk with Zari Border",
    "desc": "paithanipaithani",
    "gst": "5",
    "hsn": "520811",
    "weight": 390,
    "styleId": "black red X14",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Running Blouse",
    "blouseColor": "Aqua Blue",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Party Traditional Wedding",
    "loom": "Powerloom",
    "brand": "REENAT TRENDS",
    "rating": 4.5
  },
  {
    "id": 20,
    "name": "Paithani Cotton Silk saree Black red",
    "type": "Kanjeevaram",
    "color": "Aqua Blue",
    "price": 2900,
    "originalPrice": 3100,
    "image": "/saree_kanjivaram.png",
    "image2": "/saree_kanjivaram.png",
    "image3": "/saree_kanjivaram.png",
    "image4": "",
    "origin": "India",
    "craft": "Cotton Silk with Zari Border",
    "desc": "paithanipaithani",
    "gst": "5",
    "hsn": "520811",
    "weight": 390,
    "styleId": "black red X14",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Running Blouse",
    "blouseColor": "Aqua Blue",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Party Traditional Wedding",
    "loom": "Powerloom",
    "brand": "REENAT TRENDS",
    "rating": 4.5
  },
  {
    "id": 21,
    "name": "Beautiful Mysore Silk Saree",
    "type": "Kanjeevaram",
    "color": "Royal Blue",
    "price": 999,
    "originalPrice": 1500,
    "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
    "image2": "file:///C:/Users/Onyx/Desktop/RT45/RT45/saree_banarasi.png",
    "image3": "file:///C:/Users/Onyx/Desktop/RT45/RT45/saree_chanderi.png",
    "image4": "",
    "origin": "India",
    "craft": "Silk with Zari Border",
    "desc": "A beautiful silk saree perfect for festive occasions.",
    "gst": "5",
    "hsn": "500720",
    "weight": 350,
    "styleId": "MYSORE_SILK_001",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Running Blouse",
    "blouseColor": "Golden",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Silk",
    "border": "Zari",
    "occasion": "Festive",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "rating": 4.5
  },
  {
    "id": 22,
    "name": "Paithani Cotton Silk saree",
    "type": "Kanjeevaram",
    "color": "Aqua Blue",
    "price": 600,
    "originalPrice": 3000,
    "image": "/saree_kanjivaram.png",
    "image2": "/saree_kanjivaram.png",
    "image3": "/saree_kanjivaram.png",
    "image4": "",
    "origin": "India",
    "craft": "Cotton Silk with Zari Border",
    "desc": "paithani",
    "gst": "5",
    "hsn": "520811",
    "weight": 390,
    "styleId": "Tussar R Brown X1",
    "blouseLen": "0.8",
    "sareeLen": "5.5",
    "blouseType": "Running Blouse",
    "blouseColor": "Aqua Blue",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Party Traditional Wedding",
    "loom": "Powerloom",
    "brand": "REENAT TRENDS",
    "rating": 4.5
  }
];
function mapRawProduct(item) {
  if (!item) return item;
  const rawStyleId = item.styleid || item.styleId || '';
  let catalogId = rawStyleId;
  let skuId = rawStyleId;
  if (rawStyleId.includes('||')) {
    const parts = rawStyleId.split('||');
    catalogId = parts[0];
    skuId = parts[1];
  }
  const productId = 'NSY' + String(item.id).padStart(4, '0');
  return {
    ...item,
    originalPrice: item.originalPrice || item.originalprice || 0,
    styleId: rawStyleId,
    catalogId,
    skuId,
    productId,
    blouseLen: item.blouseLen || item.blouselen || '0.8',
    sareeLen: item.sareeLen || item.sareelen || '5.5',
    blouseType: item.blouseType || item.blousetype || '',
    blouseColor: item.blouseColor || item.blousecolor || '',
    image4: item.image4 || '',
    image5: item.image5 || '',
    image6: item.image6 || '',
    linkedTo: item.linkedTo || item.linked_to || '',
    rating: item.rating || 4.5,
    videoUrl: item.videoUrl || item.video_url || '',
    stockQty: item.stockQty !== undefined ? Number(item.stockQty) : (item.stock_qty !== undefined ? Number(item.stock_qty) : 10)
  };
}

const mappedDefaultProducts = defaultProducts.map(mapRawProduct);



const defaultHeroSlides = [
  {
    subtitle: "Luxury Weaves",
    title: "KANJIVARAM SILK",
    desc: "Exquisite pure mulberry silk sarees woven with genuine gold zari borders, carrying centuries of wedding-day heritage.",
    image: "/assets/hero (1).png"
  },
  {
    subtitle: "Royal Heritage",
    title: "BANARASI WEAVE",
    desc: "Dense and luxurious brocades from Varanasi, featuring elaborate floral vines and silver filigree for celebrations.",
    image: "/assets/hero (2).png"
  },
  {
    subtitle: "Sheer Elegance",
    title: "CHANDERI CHARM",
    desc: "Whisper-light silk cotton blends adorned with delicate handwoven buttis, perfect for warm summers and day events.",
    image: "/assets/hero (3).png"
  },
  {
    subtitle: "Organic Splendor",
    title: "TUSSAR ELEGANCE",
    desc: "Naturally textured wild silk sarees with a soft golden sheen, celebrating raw elegance and earth-toned charm.",
    image: "/assets/hero (4).png"
  },
  {
    subtitle: "Regal Drape",
    title: "ROYAL PAITHANI",
    desc: "Vibrant Maharashtrian silks detailed with spectacular peacock pallus and signature square borders.",
    image: "/assets/hero (5).png"
  },
  {
    subtitle: "Rare Golden Thread",
    title: "MUGA MARVEL",
    desc: "Assam’s exclusive golden silk, renowned for its glossy natural color and durability that outlasts a lifetime.",
    image: "/assets/hero (6).png"
  }
];

const defaultCategoryCards = [
  { name: "SAREES", image: "/saree_kanjivaram.png", link: "#product-list" },
  { name: "TRENDING STYLES", image: "/saree_banarasi.png", link: "#product-list" },
  { name: "POPULAR THIS WEEK", image: "/saree_chanderi.png", link: "#product-list" },
  { name: "CLEARANCE ZONE", image: "/saree_hero.png", link: "#product-list" }
];

const defaultCollectionCards = [
  { name: "SAREES", image: "/saree_kanjivaram.png", link: "#product-list" },
  { name: "POPULAR THIS WEEK", image: "/saree_chanderi.png", link: "#product-list" },
  { name: "TRENDING STYLES", image: "/saree_banarasi.png", link: "#product-list" }
];

export function AppProvider({ children }) {
  const [products, setProducts] = useState(mappedDefaultProducts);
  const [cart, setCart] = useState([]);
  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides);
  const [categoryCards, setCategoryCards] = useState(defaultCategoryCards);
  const [collectionCards, setCollectionCards] = useState(defaultCollectionCards);
  const [wishlist, setWishlist] = useState([]);
  const [theme, setTheme] = useState('light');
  const [toast, setToast] = useState(null);
  const [userSession, setUserSession] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  
  const loadDatabaseHomepageConfig = async () => {
    // 1. First load from localStorage for instant display
    try {
      const storedHero = localStorage.getItem('homepage_hero');
      if (storedHero) setHeroSlides(JSON.parse(storedHero));
      const storedCategories = localStorage.getItem('homepage_categories');
      if (storedCategories) setCategoryCards(JSON.parse(storedCategories));
      const storedCollections = localStorage.getItem('homepage_collections');
      if (storedCollections) setCollectionCards(JSON.parse(storedCollections));
    } catch (e) {
      console.warn("Failed to load stored homepage configs from localStorage:", e);
    }

    // 2. Fetch from Supabase
    try {
      const { data, error } = await supabase.from('homepage_config').select('*');
      if (!error && data && data.length > 0) {
        const heroRow = data.find(row => row.key === 'hero');
        const categoriesRow = data.find(row => row.key === 'categories');
        const collectionsRow = data.find(row => row.key === 'collections');

        if (heroRow && Array.isArray(heroRow.value)) {
          setHeroSlides(heroRow.value);
          localStorage.setItem('homepage_hero', JSON.stringify(heroRow.value));
        }
        if (categoriesRow && Array.isArray(categoriesRow.value)) {
          setCategoryCards(categoriesRow.value);
          localStorage.setItem('homepage_categories', JSON.stringify(categoriesRow.value));
        }
        if (collectionsRow && Array.isArray(collectionsRow.value)) {
          setCollectionCards(collectionsRow.value);
          localStorage.setItem('homepage_collections', JSON.stringify(collectionsRow.value));
        }
      } else if (error) {
        console.warn("Could not load homepage config from database (it might not exist yet):", error.message);
      }
    } catch (err) {
      console.error("Failed to connect to Supabase for homepage_config:", err);
    }
  };

  const loadDatabaseProducts = async () => {
    let cached = [];
    try {
      cached = JSON.parse(localStorage.getItem('products') || '[]');
      if (cached && cached.length > 0) {
        setProducts(cached.map(mapRawProduct));
      }
    } catch (e) {
      console.warn("localStorage products parsing failed", e);
    }

    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        const mappedData = data.map(mapRawProduct);

        // Merge fetched data with local-only items (either marked isLocal or not present in the database)
        const dbNames = new Set(mappedData.map(p => p.name));
        const existingLocal = Array.isArray(cached) ? cached.filter(p => p.isLocal || !dbNames.has(p.name)) : [];
        const combined = [...mappedData, ...existingLocal];
        setProducts(combined);
        try {
          localStorage.setItem('products', JSON.stringify(combined));
        } catch (storageError) {
          console.warn("Could not save products cache to localStorage due to quota limits:", storageError);
        }
      } else {
        if (!cached || cached.length === 0) {
          setProducts(mappedDefaultProducts);
        }
      }
    } catch (err) {
      console.error("Failed to connect to database:", err);
      if (!cached || cached.length === 0) {
        setProducts(mappedDefaultProducts);
      }
    }
  };


  // Initialize from LocalStorage (Client Side only)
  useEffect(() => {
    // 1. Theme Setup
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Cart & Wishlist & Session Setup
    try {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(storedCart);
    } catch (e) {
      console.error(e);
    }

    try {
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(storedWishlist);
    } catch (e) {
      console.error(e);
    }

    try {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) setUserSession(JSON.parse(storedSession));
    } catch (e) {
      console.error(e);
    }

    // 3. Load Homepage Config & Products from Supabase / cache
    loadDatabaseHomepageConfig();
    loadDatabaseProducts();

    // 3. Load Products from Supabase / cache
    
  }, []);



  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const saveHomepageConfig = async (type, data) => {
    if (type === 'hero') {
      setHeroSlides(data);
      localStorage.setItem('homepage_hero', JSON.stringify(data));
    } else if (type === 'categories') {
      setCategoryCards(data);
      localStorage.setItem('homepage_categories', JSON.stringify(data));
    } else if (type === 'collections') {
      setCollectionCards(data);
      localStorage.setItem('homepage_collections', JSON.stringify(data));
    }

    try {
      const { error } = await supabase
        .from('homepage_config')
        .upsert({ key: type, value: data, updated_at: new Date().toISOString() });

      if (error) {
        console.error(`Supabase sync failed for ${type}:`, error.message);
        showToast("Saved locally, database sync failed.", "warning");
      } else {
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} updated live successfully!`, "success");
      }
    } catch (err) {
      console.error(`Supabase sync exception for ${type}:`, err);
      showToast("Saved locally, database connection failed.", "warning");
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync state to local storage when changed
  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product, qty = 1) => {
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => 
        item.id === product.id ? { ...item, qty: item.qty + qty } : item
      );
    } else {
      newCart = [...cart, { ...product, qty }];
    }
    updateCart(newCart);
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    updateCart(newCart);
    showToast('Removed item from cart.', 'info');
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item => 
      item.id === productId ? { ...item, qty } : item
    );
    updateCart(newCart);
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.some(item => item.id === product.id);
    let newWish;
    if (exists) {
      newWish = wishlist.filter(item => item.id !== product.id);
      showToast('Removed from wishlist.', 'info');
    } else {
      newWish = [...wishlist, product];
      showToast('Added to wishlist!', 'success');
    }
    setWishlist(newWish);
    localStorage.setItem('wishlist', JSON.stringify(newWish));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogin = (userObj) => {
    setUserSession(userObj);
    localStorage.setItem('userSession', JSON.stringify(userObj));
    showToast('Logged in successfully!', 'success');
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('userSession');
    showToast('Logged out successfully.', 'info');
  };

  return (
    <AppContext.Provider value={{
      products,
      setProducts,
      cart,
      wishlist,
      theme,
      toast,
      userSession,
      addToCart,
      removeFromCart,
      updateCartQty,
      toggleWishlist,
      isInWishlist,
      toggleTheme,
      showToast,
      handleLogin,
      handleLogout,
      quickViewProduct,
      setQuickViewProduct,
      heroSlides,
      categoryCards,
      collectionCards,
      saveHomepageConfig,
      refreshDatabase: loadDatabaseProducts
    }}>
      {children}
      {toast && (
        <div id="toast-container">
          <div className={`toast show toast-${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
