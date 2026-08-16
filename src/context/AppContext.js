'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AppContext = createContext();

const defaultProducts = [
  {
    "id": 127,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse /  Color Sea Green Rani",
    "type": "Paithani",
    "color": "Sea Green",
    "price": 999,
    "originalprice": 2499,
    "image": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815223440_4rne30q.webp",
    "image2": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815225606_2ok4tii.webp",
    "image3": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815227380_35q9jco.webp",
    "image4": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815336743_1fm39fx.webp",
    "image5": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815307524_86nm1z5.webp",
    "image6": "",
    "video_url": "",
    "stock_qty": 48,
    "origin": "India",
    "craft": null,
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||SagarRani Pa X1",
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
    "rating": 4.5,
    "created_at": "2026-08-15T17:36:46.275445+00:00",
    "collection_id": 1
  },
  {
    "id": 126,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse /  Color Rani Balck",
    "type": "Paithani",
    "color": "Rani Pink",
    "price": 999,
    "originalprice": 2499,
    "image": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786814711773_xcm9dsf.webp",
    "image2": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786814718113_bwhx8w9.webp",
    "image3": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786814720250_vn1m34y.webp",
    "image4": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815328624_91ocz9n.webp",
    "image5": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815304099_hibvkjr.webp",
    "image6": "",
    "video_url": "",
    "stock_qty": 48,
    "origin": "India",
    "craft": null,
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Rani Balck Pai X1",
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
    "rating": 4.5,
    "created_at": "2026-08-15T17:36:46.2422+00:00",
    "collection_id": 1
  },
  {
    "id": 125,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse /  Color Tussar Brown",
    "type": "Paithani",
    "color": "Tussar",
    "price": 999,
    "originalprice": 2499,
    "image": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786814296102_8vfl2ml.webp",
    "image2": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786814298280_sx35mmd.webp",
    "image3": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786814300300_t96vuhp.webp",
    "image4": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815315487_qmlnsnt.webp",
    "image5": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815299876_quu25bx.webp",
    "image6": "",
    "video_url": "",
    "stock_qty": 48,
    "origin": "India",
    "craft": null,
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Tussar R Brown",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Brown",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5,
    "created_at": "2026-08-15T17:36:46.208945+00:00",
    "collection_id": 1
  },
  {
    "id": 124,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Black Silver",
    "type": "Paithani",
    "color": "black",
    "price": 999,
    "originalprice": 2499,
    "image": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786814025379_tqwlqsu.webp",
    "image2": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786814027604_dgjgioh.webp",
    "image3": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786814029576_fvwlf88.webp",
    "image4": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815280810_na840d9.webp",
    "image5": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786815287405_440ivmf.webp",
    "image6": "",
    "video_url": "",
    "stock_qty": 48,
    "origin": "India",
    "craft": null,
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Black Silver Pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Grey",
    "transparency": "No",
    "qty": "50",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M1",
    "rating": 4.5,
    "created_at": "2026-08-15T17:36:46.173995+00:00",
    "collection_id": 1
  },
  {
    "id": 123,
    "name": "Premium Zari Woven Cotton Silk Paithani Saree with Blouse Piece / Saree Color Chocolate Green ",
    "type": "Paithani",
    "color": "Chocolate",
    "price": 949,
    "originalprice": 2499,
    "image": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786812673360_tqs2bek.webp",
    "image2": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786812675793_nkyhd7i.webp",
    "image3": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786812678733_yvdfkon.webp",
    "image4": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786812724632_e7nrtcs.webp",
    "image5": "",
    "image6": "",
    "video_url": "",
    "stock_qty": 48,
    "origin": "India",
    "craft": null,
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M1||Choco Green Pai X1",
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
    "rating": 4.5,
    "created_at": "2026-08-15T16:53:03.146353+00:00",
    "collection_id": 1
  },
  {
    "id": 122,
    "name": "Paithani Cotton Silk Saree with contrast blouse peice ( Sea Green And Rani Pink )",
    "type": "Kanjeevaram",
    "color": "Sea Green",
    "price": 949,
    "originalprice": 2499,
    "image": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786812284119_k8zb8vv.webp",
    "image2": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786812286139_3j5ht0x.webp",
    "image3": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786812287863_5sdrrtz.webp",
    "image4": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786812550543_hfj6vj7.webp",
    "image5": "",
    "image6": "",
    "video_url": "",
    "stock_qty": 10,
    "origin": "India",
    "craft": null,
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M2||Sagar Rani pai X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Rani Pink",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M2",
    "rating": 4.5,
    "created_at": "2026-08-15T16:49:19.092214+00:00",
    "collection_id": 6
  },
  {
    "id": 121,
    "name": "Paithani Cotton Silk Saree with contrast blouse peice ( Blacl Rani)",
    "type": "Kanjeevaram",
    "color": "black",
    "price": 949,
    "originalprice": 2499,
    "image": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786811134859_zs2187u.webp",
    "image2": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786811136526_2284zh1.webp",
    "image3": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786811138607_89voi58.webp",
    "image4": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786811200816_8eb6lk7.webp",
    "image5": "",
    "image6": "",
    "video_url": "",
    "stock_qty": 10,
    "origin": "India",
    "craft": null,
    "desc": "Traditional Paithani Saree, masterfully crafted from a premium cotton silk saree blend. This masterpiece features a breathtaking zari woven design throughout, perfectly complemented by a majestic golden zari woven design border that adds a touch of royal grandeur. Perfect for weddings and festive celebrations, it beautifully balances rich heritage with sophisticated comfort.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M2||Black Rani Pa X1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Rani Pink",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M2",
    "rating": 4.5,
    "created_at": "2026-08-15T16:26:50.78375+00:00",
    "collection_id": 6
  },
  {
    "id": 120,
    "name": "REENAT's Premium Cotton Silk Golden Zari Woven Saree Color Navy Blue And Mint Green ",
    "type": "Kanjeevaram",
    "color": "Navy Blue",
    "price": 1099,
    "originalprice": 2499,
    "image": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786810740691_i2hm5uw.webp",
    "image2": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786810743029_ew869fu.webp",
    "image3": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786810760555_j5g5csk.webp",
    "image4": "",
    "image5": "",
    "image6": "",
    "video_url": "",
    "stock_qty": 38,
    "origin": "India",
    "craft": null,
    "desc": "Discover beauty in this magnificent Paithani saree. This is designed to perfection, worn with ease. The saree is crafted with cotton silk, a premium quality fabric for lasting comfort. The design showcases botanical artistry, beautifully adorned with traditional zari woven work and a detailed zari woven border. This ensemble is crafted for auspicious occasions demanding respectful elegance—a perfect choice for bringing cultural heritage to life with contemporary grace.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M5||Navy Radium ",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Mint Green",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M5",
    "rating": 4.5,
    "created_at": "2026-08-15T16:21:39.178456+00:00",
    "collection_id": 6
  },
  {
    "id": 119,
    "name": "Hathi Raja Latest Design Saree Zari Border ( Gold Black )",
    "type": "Hathi Raja Pattern",
    "color": "Gold",
    "price": 949,
    "originalprice": 2499,
    "image": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786793747092_ub7advx.webp",
    "image2": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786793749881_0nkuy1c.webp",
    "image3": "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1786793766881_w52qrmt.webp",
    "image4": "",
    "image5": "",
    "image6": "",
    "video_url": "",
    "stock_qty": 10,
    "origin": "India",
    "craft": null,
    "desc": "Make a majestic entrance with our newly launched Hathi Raja design. Inspired by the royal elephants of Indian heritage—a timeless symbol of prosperity, strength, and grandeur—this stunning new arrival brings a touch of regal elegance to your traditional wardrobe.\n\nCrafted for the modern woman who values her roots, this saree effortlessly combines heritage motifs with everyday comfort. The magnificent elephant-inspired weaving makes it a true statement piece, guaranteed to turn heads at your next big event.",
    "gst": "5",
    "hsn": "520811",
    "weight": 450,
    "styleid": "M8||Gold Black HR1",
    "blouselen": "0.8",
    "sareelen": "5.5",
    "blousetype": "Zari Woven",
    "blousecolor": "Gold",
    "transparency": "No",
    "qty": "Single",
    "fabric": "Cotton Silk",
    "border": "Zari",
    "occasion": "Traditional",
    "loom": "Handloom",
    "brand": "REENAT TRENDS",
    "linked_to": "",
    "catalog_id": "M8",
    "rating": 4.5,
    "created_at": "2026-08-15T11:41:44.049099+00:00"
  }
];

const mapRawProduct = (raw) => ({
  id: raw.id,
  name: raw.name,
  type: raw.type,
  color: raw.color,
  price: Number(raw.price) || 0,
  originalPrice: Number(raw.originalprice || raw.originalPrice) || 0,
  image: raw.image || '/saree_kanjivaram.png',
  image2: raw.image2 || '',
  image3: raw.image3 || '',
  image4: raw.image4 || '',
  image5: raw.image5 || '',
  image6: raw.image6 || '',
  videoUrl: raw.video_url || raw.videoUrl || '',
  stockQty: raw.stock_qty !== undefined ? raw.stock_qty : (raw.stockQty || 50),
  origin: raw.origin || 'India',
  craft: raw.craft || 'Handloom',
  desc: raw.desc || '',
  gst: raw.gst || '5',
  hsn: raw.hsn || '520811',
  weight: raw.weight || 450,
  styleId: raw.styleid || raw.styleId || '',
  styleid: raw.styleid || raw.styleId || '',
  blouseLen: raw.blouselen || raw.blouseLen || '0.8',
  sareeLen: raw.sareelen || raw.sareeLen || '5.5',
  blouseType: raw.blousetype || raw.blouseType || 'Zari Woven',
  blouseColor: raw.blousecolor || raw.blouseColor || '',
  transparency: raw.transparency || 'No',
  fabric: raw.fabric || 'Cotton Silk',
  border: raw.border || 'Zari',
  occasion: raw.occasion || 'Traditional',
  loom: raw.loom || 'Handloom',
  brand: raw.brand || 'REENAT TRENDS',
  linkedTo: raw.linked_to || raw.linkedTo || '',
  linked_to: raw.linked_to || raw.linkedTo || '',
  catalogId: raw.catalog_id || raw.catalogId || '',
  catalog_id: raw.catalog_id || raw.catalogId || '',
  rating: Number(raw.rating) || 4.5
});

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

const defaultCatalogPositions = [
  { position: 1, catalogId: 'M1' },
  { position: 2, catalogId: 'M2' },
  { position: 3, catalogId: 'M3' },
  { position: 4, catalogId: 'M4' },
  { position: 5, catalogId: 'M5' },
  { position: 6, catalogId: 'M6' },
  { position: 7, catalogId: 'M7' },
  { position: 8, catalogId: 'M8' },
  { position: 9, catalogId: 'M9' },
  { position: 10, catalogId: '' },
  { position: 11, catalogId: '' },
  { position: 12, catalogId: '' }
];

const defaultBestSellers = [
  { slot: 1, catalogId: 'M1' },
  { slot: 2, catalogId: 'M2' },
  { slot: 3, catalogId: 'M3' },
  { slot: 4, catalogId: 'M4' }
];

export function AppProvider({ children }) {
  const [products, setProducts] = useState(mappedDefaultProducts);
  const [cart, setCart] = useState([]);
  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides);
  const [categoryCards, setCategoryCards] = useState(defaultCategoryCards);
  const [collectionCards, setCollectionCards] = useState(defaultCollectionCards);
  const [catalogPositions, setCatalogPositions] = useState(defaultCatalogPositions);
  const [bestSellers, setBestSellers] = useState(defaultBestSellers);
  const [pausedCatalogs, setPausedCatalogs] = useState([]);
  const [pausedProducts, setPausedProducts] = useState([]);
  // catalogVariantOrders: { [catalogId]: [productId, productId, ...] } — controls display order of variants
  const [catalogVariantOrders, setCatalogVariantOrders] = useState({});
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
      const storedPositions = localStorage.getItem('homepage_catalog_positions');
      if (storedPositions) setCatalogPositions(JSON.parse(storedPositions));
      const storedBestSellers = localStorage.getItem('homepage_bestsellers');
      if (storedBestSellers) setBestSellers(JSON.parse(storedBestSellers));
      const storedPausedCatalogs = localStorage.getItem('homepage_paused_catalogs');
      if (storedPausedCatalogs) setPausedCatalogs(JSON.parse(storedPausedCatalogs));
      const storedPausedProducts = localStorage.getItem('homepage_paused_products');
      if (storedPausedProducts) setPausedProducts(JSON.parse(storedPausedProducts));
      const storedVariantOrders = localStorage.getItem('homepage_catalog_variant_orders');
      if (storedVariantOrders) setCatalogVariantOrders(JSON.parse(storedVariantOrders));
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
        const positionsRow = data.find(row => row.key === 'catalog_positions');
        const bestsellersRow = data.find(row => row.key === 'bestsellers');
        const pausedCatalogsRow = data.find(row => row.key === 'paused_catalogs');
        const pausedProductsRow = data.find(row => row.key === 'paused_products');
        const variantOrdersRow = data.find(row => row.key === 'catalog_variant_orders');

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
        if (positionsRow && Array.isArray(positionsRow.value)) {
          setCatalogPositions(positionsRow.value);
          localStorage.setItem('homepage_catalog_positions', JSON.stringify(positionsRow.value));
        }
        if (bestsellersRow && Array.isArray(bestsellersRow.value)) {
          setBestSellers(bestsellersRow.value);
          localStorage.setItem('homepage_bestsellers', JSON.stringify(bestsellersRow.value));
        }
        if (pausedCatalogsRow && Array.isArray(pausedCatalogsRow.value)) {
          setPausedCatalogs(pausedCatalogsRow.value);
          localStorage.setItem('homepage_paused_catalogs', JSON.stringify(pausedCatalogsRow.value));
        }
        if (pausedProductsRow && Array.isArray(pausedProductsRow.value)) {
          setPausedProducts(pausedProductsRow.value);
          localStorage.setItem('homepage_paused_products', JSON.stringify(pausedProductsRow.value));
        }
        if (variantOrdersRow && variantOrdersRow.value && typeof variantOrdersRow.value === 'object' && !Array.isArray(variantOrdersRow.value)) {
          setCatalogVariantOrders(variantOrdersRow.value);
          localStorage.setItem('homepage_catalog_variant_orders', JSON.stringify(variantOrdersRow.value));
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

    // 4. Real-time storage listener for cross-tab sync
    const handleStorageChange = (e) => {
      if (e.key === 'homepage_catalog_positions' && e.newValue) {
        try {
          setCatalogPositions(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Storage sync error:", err);
        }
      }
    };
    const handleCustomSync = () => {
      try {
        const storedPositions = localStorage.getItem('homepage_catalog_positions');
        if (storedPositions) setCatalogPositions(JSON.parse(storedPositions));
      } catch (err) {
        console.warn("Custom position sync error:", err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('catalogPositionsUpdated', handleCustomSync);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('catalogPositionsUpdated', handleCustomSync);
    };
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
    } else if (type === 'bestsellers') {
      setBestSellers(data);
      localStorage.setItem('homepage_bestsellers', JSON.stringify(data));
    } else if (type === 'paused_catalogs') {
      setPausedCatalogs(data);
      localStorage.setItem('homepage_paused_catalogs', JSON.stringify(data));
    } else if (type === 'paused_products') {
      setPausedProducts(data);
      localStorage.setItem('homepage_paused_products', JSON.stringify(data));
    }

    try {
      const response = await fetch('/api/cms/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          table: 'homepage_config',
          data: { key: type, value: data, updated_at: new Date().toISOString() },
          onConflict: 'key'
        })
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        console.warn(`API route sync for ${type} returned error, falling back to direct Supabase client:`, resData.error);
        const { error: directErr } = await supabase
          .from('homepage_config')
          .upsert({ key: type, value: data, updated_at: new Date().toISOString() }, { onConflict: 'key' });

        if (directErr) {
          showToast("Saved locally, database sync failed.", "warning");
        } else {
          showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} updated live successfully!`, "success");
        }
      } else {
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} updated live successfully!`, "success");
      }
    } catch (err) {
      console.warn(`API route sync exception for ${type}, falling back to direct Supabase client:`, err);
      try {
        const { error: directErr } = await supabase
          .from('homepage_config')
          .upsert({ key: type, value: data, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (directErr) {
          showToast("Saved locally, database connection failed.", "warning");
        } else {
          showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} updated live successfully!`, "success");
        }
      } catch (fbErr) {
        showToast("Saved locally, database connection failed.", "warning");
      }
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

    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', 'AddToCart', {
          content_name: product.name || product.title,
          content_ids: [String(product.id)],
          content_type: 'product',
          value: Number(product.price || 0),
          currency: 'INR'
        });
      } catch (err) {
        console.error('Meta Pixel AddToCart error:', err);
      }
    }
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
    setUserSession(null);
    localStorage.removeItem('userSession');
    showToast('Logged out successfully.', 'info');
  };

  const saveCatalogPositions = async (positionsArray) => {
    setCatalogPositions(positionsArray);
    try {
      localStorage.setItem('homepage_catalog_positions', JSON.stringify(positionsArray));
      window.dispatchEvent(new Event('catalogPositionsUpdated'));
    } catch (e) {
      console.warn("Could not save catalog positions to localStorage:", e);
    }

    try {
      const response = await fetch('/api/cms/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          table: 'homepage_config',
          data: { key: 'catalog_positions', value: positionsArray, updated_at: new Date().toISOString() },
          onConflict: 'key'
        })
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        console.warn("API route save error, falling back to direct Supabase client:", resData.error);
        const { error: directErr } = await supabase
          .from('homepage_config')
          .upsert({ key: 'catalog_positions', value: positionsArray, updated_at: new Date().toISOString() }, { onConflict: 'key' });

        if (directErr) {
          showToast(`Save error: ${resData.error || directErr.message}`, 'error');
        } else {
          showToast('Catalog grid sequence saved successfully!', 'success');
        }
      } else {
        showToast('Catalog grid sequence saved successfully!', 'success');
      }
    } catch (err) {
      console.warn("Save catalog positions API exception, falling back to direct Supabase client:", err);
      try {
        const { error: directErr } = await supabase
          .from('homepage_config')
          .upsert({ key: 'catalog_positions', value: positionsArray, updated_at: new Date().toISOString() }, { onConflict: 'key' });

        if (directErr) {
          showToast("Saved locally.", "info");
        } else {
          showToast("Catalog grid sequence saved successfully!", "success");
        }
      } catch (fbErr) {
        showToast("Saved locally.", "info");
      }
    }
  };

  const isCatalogPaused = (catalogId) => {
    if (!catalogId) return false;
    const cid = String(catalogId).toUpperCase().trim();
    return pausedCatalogs.some(c => String(c).toUpperCase().trim() === cid);
  };

  const isProductPaused = (productOrId) => {
    if (!productOrId) return false;
    let pid, cid, numId;
    if (typeof productOrId === 'object') {
      pid = productOrId.productId || productOrId.id;
      cid = productOrId.catalogId;
      numId = productOrId.id;
    } else {
      pid = productOrId;
      numId = productOrId;
    }
    // If whole catalog is paused, product is considered paused
    if (cid && isCatalogPaused(cid)) return true;

    // Check individual product ID
    const pidStr = String(pid || '').toUpperCase().trim();
    const numIdStr = String(numId || '').toUpperCase().trim();
    return pausedProducts.some(p => {
      const s = String(p).toUpperCase().trim();
      return s === pidStr || s === numIdStr;
    });
  };

  const togglePauseCatalog = async (catalogId) => {
    if (!catalogId) return;
    const cid = String(catalogId).toUpperCase().trim();
    const isPaused = isCatalogPaused(cid);
    const newPausedCatalogs = isPaused 
      ? pausedCatalogs.filter(c => String(c).toUpperCase().trim() !== cid)
      : [...pausedCatalogs, catalogId];
    
    setPausedCatalogs(newPausedCatalogs);
    try {
      localStorage.setItem('homepage_paused_catalogs', JSON.stringify(newPausedCatalogs));
    } catch (e) {
      console.warn("Failed to save paused catalogs to localStorage:", e);
    }
    await saveHomepageConfig('paused_catalogs', newPausedCatalogs);
    showToast(isPaused ? `Catalog ${catalogId} resumed (Active 🟢)` : `Catalog ${catalogId} paused (⏸️)`, isPaused ? 'success' : 'info');
  };

  const togglePauseProduct = async (productOrId) => {
    if (!productOrId) return;
    const pid = typeof productOrId === 'object' ? (productOrId.productId || productOrId.id) : productOrId;
    const pidStr = String(pid).toUpperCase().trim();
    
    const isPaused = pausedProducts.some(p => String(p).toUpperCase().trim() === pidStr);
    const newPausedProducts = isPaused
      ? pausedProducts.filter(p => String(p).toUpperCase().trim() !== pidStr)
      : [...pausedProducts, pid];

    setPausedProducts(newPausedProducts);
    try {
      localStorage.setItem('homepage_paused_products', JSON.stringify(newPausedProducts));
    } catch (e) {
      console.warn("Failed to save paused products to localStorage:", e);
    }
    await saveHomepageConfig('paused_products', newPausedProducts);
    showToast(isPaused ? `Variation resumed (Active 🟢)` : `Variation paused (⏸️)`, isPaused ? 'success' : 'info');
  };

  /**
   * Returns the ordered array of product IDs for a given catalog.
   * Falls back to natural ID-ascending order if no custom ordering is saved.
   */
  const getCatalogVariantOrder = (catalogId) => {
    if (!catalogId) return [];
    const key = String(catalogId).toUpperCase().trim();
    return catalogVariantOrders[key] || [];
  };

  /**
   * Saves a new variant ordering for a given catalog.
   * orderedIds: array of product IDs (numeric) in the desired display order.
   */
  const saveCatalogVariantOrder = async (catalogId, orderedIds) => {
    if (!catalogId) return;
    const key = String(catalogId).toUpperCase().trim();
    const newOrders = { ...catalogVariantOrders, [key]: orderedIds };
    setCatalogVariantOrders(newOrders);
    try {
      localStorage.setItem('homepage_catalog_variant_orders', JSON.stringify(newOrders));
    } catch (e) {
      console.warn('Failed to save catalog variant orders to localStorage:', e);
    }
    await saveHomepageConfig('catalog_variant_orders', newOrders);
    showToast(`Variant display order saved for Catalog ${catalogId} ✅`, 'success');
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
      catalogPositions,
      setCatalogPositions,
      saveCatalogPositions,
      bestSellers,
      setBestSellers,
      pausedCatalogs,
      setPausedCatalogs,
      pausedProducts,
      setPausedProducts,
      isCatalogPaused,
      isProductPaused,
      togglePauseCatalog,
      togglePauseProduct,
      saveHomepageConfig,
      catalogVariantOrders,
      getCatalogVariantOrder,
      saveCatalogVariantOrder,
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
