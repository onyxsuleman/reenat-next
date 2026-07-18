'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { auth, isFirebaseConfigured } from '../utils/firebase';

const AppContext = createContext();

const defaultProducts = [
  {
    "id": 42,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Gold And Black ",
    "type": "Paithani",
    "color": "Mango Yellow",
    "price": 949,
    "originalprice": 2499,
    "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168166519_7otfupt.png",
    "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168170316_jcqnuvj.png",
    "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168172332_2e741nm.png",
    "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168183387_w7gba29.png",
    "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168188910_htza2t2.png",
    "image6": "",
    "video_url": "",
    "stock_qty": 48,
    "origin": "India",
    "craft": "Zari Woven",
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Mango Green Pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Green",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5
  },
  {
    "id": 50,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Gold And Black ",
    "type": "Paithani",
    "color": "Chikku",
    "price": 949,
    "originalprice": 2499,
    "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168238308_rgjupgb.png",
    "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168240753_m11a6x4.png",
    "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168243005_ok8tv02.png",
    "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168254286_a7j59ie.png",
    "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168265053_3qfgimh.png",
    "image6": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168267754_tvydvqq.png",
    "video_url": "",
    "stock_qty": 49,
    "origin": "India",
    "craft": "Zari Woven",
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Chikku Brown Pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Chocolate",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5
  },
  {
    "id": 51,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Gold And Black ",
    "type": "Paithani",
    "color": "Lemon Yellow",
    "price": 949,
    "originalprice": 2499,
    "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168328804_31eaa6n.png",
    "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168331633_oucta8w.png",
    "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168336536_cj4ldog.png",
    "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168434585_6dov976.png",
    "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168441422_l8mun2j.png",
    "image6": "",
    "video_url": "",
    "stock_qty": 50,
    "origin": "India",
    "craft": "Zari Woven",
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Lemon Blue Pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Navy Blue",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5
  },
  {
    "id": 52,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Gold And Black ",
    "type": "Paithani",
    "color": "Mango Yellow",
    "price": 949,
    "originalprice": 2499,
    "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168471707_043cme6.png",
    "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168473698_m8qod13.png",
    "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168475976_102m7m3.png",
    "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168491938_towtsdz.png",
    "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168498683_ax7u9wa.png",
    "image6": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783168501439_jius6ma.png",
    "video_url": "",
    "stock_qty": 50,
    "origin": "India",
    "craft": "Zari Woven",
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Mango Brown Pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Chocolate",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5
  },
  {
    "id": 53,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Gold And Black ",
    "type": "Paithani",
    "color": "Gold",
    "price": 949,
    "originalprice": 2499,
    "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194023681_8hh6mwq.png",
    "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194026972_vwzyabz.png",
    "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194029364_7o4cwg9.png",
    "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194036693_72j64pv.png",
    "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194043844_zhsakqv.png",
    "image6": "",
    "video_url": "",
    "stock_qty": 50,
    "origin": "India",
    "craft": "Zari Woven",
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Gold Black Pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "black",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5
  },
  {
    "id": 54,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Grey and Rani",
    "type": "Paithani",
    "color": "Grey",
    "price": 949,
    "originalprice": 2499,
    "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194199938_30rin8o.png",
    "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194207435_888xgb6.png",
    "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194209976_9m7m9k2.png",
    "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194213258_wh0fwu6.png",
    "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194224644_lez6kb9.png",
    "image6": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194593372_c0tcdol.png",
    "video_url": "",
    "stock_qty": 50,
    "origin": "India",
    "craft": "Zari Woven",
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Grey Rani Pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Rani Pink",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5
  },
  {
    "id": 55,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Mango Yellow And Rani ",
    "type": "Paithani",
    "color": "Mango Yellow",
    "price": 949,
    "originalprice": 2499,
    "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194656622_alsu4eh.png",
    "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194659044_ykd8hga.png",
    "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194661000_r7sqd94.png",
    "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194669210_pal0t2m.png",
    "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783194675939_v9i7zrt.png",
    "image6": "",
    "video_url": "",
    "stock_qty": 50,
    "origin": "India",
    "craft": "Zari Woven",
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Mango Rani Pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Rani Pink",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5
  },
  {
    "id": 56,
    "name": "Paithani Cotton Silk Saree with contrast blouse peice ( Tussar Brown ?",
    "type": "Silk",
    "color": "Tussar",
    "price": 949,
    "originalprice": 2499,
    "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276410506_aigxg6y.png",
    "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276416827_rqssvt2.png",
    "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276424156_uciw0s7.png",
    "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276428912_l4y7fzi.png",
    "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276443411_hbwetan.png",
    "image6": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783276475693_6hz9xl6.png",
    "video_url": "",
    "stock_qty": 10,
    "origin": "India",
    "craft": "Zari Woven",
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M2||Tussar R Brown Pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Chocolate",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M2",
    "rating": 4.5
  },
  {
    "id": 57,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Navy Blue Rani ",
    "type": "Paithani",
    "color": "Navy Blue",
    "price": 949,
    "originalprice": 2499,
    "image": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783436445998_4m8akrg.png",
    "image2": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783436450020_m1lbqx6.png",
    "image3": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783436453975_ie544do.png",
    "image4": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783436465852_azbjo62.png",
    "image5": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783436514387_1k01ma8.png",
    "image6": "https://eilxtuedgtimrxfvqojv.supabase.co/storage/v1/object/public/saree-images/saree_1783436523778_l1fll9k.png",
    "video_url": "",
    "stock_qty": 48,
    "origin": "India",
    "craft": "Zari Woven",
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Navy Rani Pait X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Rani Pink",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5
  }
];
function mapRawProduct(item) {
  if (!item) return item;
  const rawStyleId = item.styleid || item.styleId || '';
  let catalogId = item.catalog_id || item.catalogId || '';
  let skuId = rawStyleId;
  if (rawStyleId.includes('||')) {
    const parts = rawStyleId.split('||');
    catalogId = catalogId || parts[0];
    skuId = parts[1];
  } else if (!catalogId) {
    catalogId = rawStyleId;
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
        const dbIds = new Set(mappedData.map(p => String(p.id)));
        const dbNames = new Set(mappedData.map(p => p.name));
        const existingLocal = Array.isArray(cached) 
          ? cached.filter(p => (p.isLocal || !dbNames.has(p.name)) && !dbIds.has(String(p.id))) 
          : [];
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
 
  // 4. Firebase Auth State Listener
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    let onAuthStateChanged;
    try {
      // Dynamic import/require to prevent bundler/SSR issues if firebase module isn't loaded yet
      const firebaseAuth = require('firebase/auth');
      onAuthStateChanged = firebaseAuth.onAuthStateChanged;
    } catch (e) {
      console.warn("Could not import onAuthStateChanged from firebase/auth", e);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const username = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
        const userObj = {
          isLoggedIn: true,
          email: currentUser.email || '',
          phone: currentUser.phoneNumber || '',
          username: username,
          joinedDate: 'July 2026',
          uid: currentUser.uid
        };
        setUserSession(userObj);
        localStorage.setItem('userSession', JSON.stringify(userObj));
      } else {
        const stored = localStorage.getItem('userSession');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.uid || parsed.isLoggedIn) {
              setUserSession(null);
              localStorage.removeItem('userSession');
            }
          } catch (e) {
            setUserSession(null);
            localStorage.removeItem('userSession');
          }
        }
      }
    });

    return () => unsubscribe();
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
      const response = await fetch('/api/cms/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          table: 'homepage_config',
          data: { key: type, value: data, updated_at: new Date().toISOString() }
        })
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        console.error(`Supabase sync failed for ${type}:`, resData.error || 'Server error');
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
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        const { signOut } = require('firebase/auth');
        await signOut(auth);
      } catch (err) {
        console.error("Firebase logout error:", err);
      }
    }
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
