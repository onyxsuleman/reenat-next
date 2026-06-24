'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AppContext = createContext();

const defaultProducts = [
  {
    id: 1,
    name: "Classic Kanjivaram Silk Saree",
    type: "Silk",
    color: "Gold",
    price: 4500,
    originalPrice: 9000,
    image: "/saree_kanjivaram.png",
    image2: "/saree_kanjivaram.png",
    image3: "/saree_kanjivaram.png",
    origin: "India",
    craft: "Mulberry Silk with Zari Border",
    desc: "Exquisite pure mulberry silk sarees woven with genuine gold zari borders, carrying centuries of wedding-day heritage.",
    gst: "5",
    hsn: "500720",
    weight: 450,
    styleId: "KJV-SILK-001",
    blouseLen: "0.8",
    sareeLen: "5.5",
    blouseType: "Contrast Blouse",
    blouseColor: "Golden",
    transparency: "No",
    qty: "Single",
    fabric: "Mulberry Silk",
    border: "Zari",
    occasion: "Party Traditional Wedding",
    loom: "Handloom",
    brand: "REENAT TRENDS",
    rating: 4.9
  },
  {
    id: 2,
    name: "Royal Banarasi Silk Saree",
    type: "Brocade",
    color: "Magenta",
    price: 3800,
    originalPrice: 7600,
    image: "/saree_banarasi.png",
    image2: "/saree_banarasi.png",
    image3: "/saree_banarasi.png",
    origin: "India",
    craft: "Banarasi Brocade",
    desc: "Dense and luxurious brocades from Varanasi, featuring elaborate floral vines and silver filigree for celebrations.",
    gst: "5",
    hsn: "500720",
    weight: 500,
    styleId: "BNS-BROC-002",
    blouseLen: "0.8",
    sareeLen: "5.5",
    blouseType: "Running Blouse",
    blouseColor: "Magenta",
    transparency: "No",
    qty: "Single",
    fabric: "Banarasi Brocade",
    border: "Zari",
    occasion: "Party Traditional Wedding",
    loom: "Handloom",
    brand: "REENAT TRENDS",
    rating: 4.8
  },
  {
    id: 3,
    name: "Elegant Chanderi Saree",
    type: "Lightweight",
    color: "Aqua Blue",
    price: 2400,
    originalPrice: 4800,
    image: "/saree_chanderi.png",
    image2: "/saree_chanderi.png",
    image3: "/saree_chanderi.png",
    origin: "India",
    craft: "Chanderi Weave",
    desc: "Whisper-light silk cotton blends adorned with delicate handwoven buttis, perfect for warm summers and day events.",
    gst: "5",
    hsn: "520811",
    weight: 350,
    styleId: "CDR-COT-003",
    blouseLen: "0.8",
    sareeLen: "5.5",
    blouseType: "Contrast Blouse",
    blouseColor: "Aqua Blue",
    transparency: "Semi-Transparent",
    qty: "Single",
    fabric: "Chanderi Cotton",
    border: "Contrast",
    occasion: "Casual",
    loom: "Handloom",
    brand: "REENAT TRENDS",
    rating: 4.7
  },
  {
    id: 4,
    name: "Golden Tussar Silk Saree",
    type: "Organic",
    color: "Golden Yellow",
    price: 3200,
    originalPrice: 6400,
    image: "/saree_hero.png",
    image2: "/saree_hero.png",
    image3: "/saree_hero.png",
    origin: "India",
    craft: "Tussar Handloom",
    desc: "Naturally textured wild silk sarees with a soft golden sheen, celebrating raw elegance and earth-toned charm.",
    gst: "5",
    hsn: "500720",
    weight: 400,
    styleId: "TSR-ORG-004",
    blouseLen: "0.8",
    sareeLen: "5.5",
    blouseType: "Running Blouse",
    blouseColor: "Golden Yellow",
    transparency: "No",
    qty: "Single",
    fabric: "Silk",
    border: "Zari",
    occasion: "Festive",
    loom: "Handloom",
    brand: "REENAT TRENDS",
    rating: 4.6
  }
];

export function AppProvider({ children }) {
  const [products, setProducts] = useState(defaultProducts);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [theme, setTheme] = useState('light');
  const [toast, setToast] = useState(null);
  const [userSession, setUserSession] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Initialize from LocalStorage (Client Side only)
  useEffect(() => {
    // 1. Theme Setup
    const storedTheme = localStorage.getItem('theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
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

    // 3. Load Products from Supabase / cache
    loadDatabaseProducts();
  }, []);

  const loadDatabaseProducts = async () => {
    let cached = [];
    try {
      cached = JSON.parse(localStorage.getItem('products') || '[]');
    } catch (e) {
      console.warn("localStorage products parsing failed", e);
    }

    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        const mappedData = data.map(item => ({
          ...item,
          originalPrice: item.originalprice || item.originalPrice,
          styleId: item.styleid || item.styleId,
          blouseLen: item.blouselen || item.blouseLen,
          sareeLen: item.sareelen || item.sareeLen,
          blouseType: item.blousetype || item.blouseType,
          blouseColor: item.blousecolor || item.blouseColor,
          rating: item.rating || 4.5
        }));

        // Merge fetched data with local-only items (isLocal: true)
        const existingLocal = Array.isArray(cached) ? cached.filter(p => p.isLocal) : [];
        const combined = [...mappedData, ...existingLocal];
        setProducts(combined);
        try {
          localStorage.setItem('products', JSON.stringify(combined));
        } catch (storageError) {
          console.warn("Could not save products cache to localStorage due to quota limits:", storageError);
        }
      } else {
        if (cached && cached.length > 0) {
          setProducts(cached);
        } else {
          setProducts(defaultProducts);
        }
      }
    } catch (err) {
      console.error("Failed to connect to database:", err);
      if (cached && cached.length > 0) {
        setProducts(cached);
      } else {
        setProducts(defaultProducts);
      }
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
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
