'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../utils/supabase';

export default function CMSConsole() {
  const { products, setProducts, refreshDatabase, showToast } = useApp();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  
  // Form Drawer Overlay state
  // Trigger fresh Vercel build
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // null means adding new

  // Batch Products State for Meesho-style variations
  const [batchProducts, setBatchProducts] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [copyCommonDetails, setCopyCommonDetails] = useState(true);
  const [originalProductIds, setOriginalProductIds] = useState([]);
  const [activeUploadSlot, setActiveUploadSlot] = useState('front');
  const [uploadStatus, setUploadStatus] = useState({
    front: 'CLICK TO UPLOAD',
    img2: 'CLICK TO UPLOAD',
    img3: 'CLICK TO UPLOAD',
    img4: 'CLICK TO UPLOAD',
    img5: 'CLICK TO UPLOAD',
    img6: 'CLICK TO UPLOAD',
  });

  const [activeView, setActiveView] = useState('home');
  const [selectedCatalogId, setSelectedCatalogId] = useState(null);

  // Meesho-Style Dashboard Filters & Stock Editor States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'out_of_stock' | 'low_stock'
  const [sortBy, setSortBy] = useState('estimated_orders'); // 'estimated_orders' | 'newest' | 'price_asc' | 'price_desc'
  const [editingStockId, setEditingStockId] = useState(null); // id of product variant being edited
  const [editingStockValue, setEditingStockValue] = useState(''); // current stock text value

  // Tasks, Notes, and Schedule State
  const [tasks, setTasks] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_tasks');
      return saved ? JSON.parse(saved) : [
        { id: 1, text: "Verify pending order labels", completed: false },
        { id: 2, text: "Update prices for Kanjeevaram catalog", completed: true },
        { id: 3, text: "Prepare weekend collection banner launch", completed: false }
      ];
    }
    return [];
  });
  const [newTaskText, setNewTaskText] = useState("");

  const [schedule, setSchedule] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_schedule');
      return saved ? JSON.parse(saved) : [
        { id: 1, time: "04:30 PM", text: "Courier dispatch pickup deadline" },
        { id: 2, time: "06:00 PM", text: "Review client customization request for NYS0003" },
        { id: 3, time: "Tomorrow 11 AM", text: "Add 5 new arrivals silk styles to catalog" }
      ];
    }
    return [];
  });
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [newScheduleText, setNewScheduleText] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cms_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cms_schedule', JSON.stringify(schedule));
    }
  }, [schedule]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText("");
    showToast("Task added successfully.", "success");
  };

  const handleToggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast("Task deleted.", "info");
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!newScheduleTime.trim() || !newScheduleText.trim()) return;
    const newItem = {
      id: Date.now(),
      time: newScheduleTime.trim(),
      text: newScheduleText.trim()
    };
    setSchedule(prev => [...prev, newItem]);
    setNewScheduleTime("");
    setNewScheduleText("");
    showToast("Event scheduled successfully.", "success");
  };

  const handleDeleteSchedule = (id) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
    showToast("Schedule item deleted.", "info");
  };

  // Mock Orders state
  const [orders, setOrders] = useState([
    {
      id: 'ORD1024',
      date: '2026-06-28',
      customer: 'Priya Sharma',
      phone: '+91 98765 43210',
      address: 'Apt 402, Block B, Silver Oak Apartments, Whitefield, Bengaluru - 560066',
      productName: 'Traditional Kanjeevaram Silk Saree',
      productImage: '',
      color: 'Rani Pink',
      amount: 1599,
      qty: 1,
      paymentMethod: 'Pay Online',
      status: 'Pending'
    },
    {
      id: 'ORD1023',
      date: '2026-06-27',
      customer: 'Anjali Gupta',
      phone: '+91 87654 32109',
      address: 'House No 12, Sector 15, Faridabad, Haryana - 121007',
      productName: 'Banarasi Brocade Silk Saree',
      productImage: '',
      color: 'Navy Blue',
      amount: 1799,
      qty: 1,
      paymentMethod: 'Cash on Delivery',
      status: 'Shipped'
    },
    {
      id: 'ORD1022',
      date: '2026-06-26',
      customer: 'Kiran Patel',
      phone: '+91 76543 21098',
      address: '24, Gokul Society, Near ISKCON Temple, SG Highway, Ahmedabad - 380015',
      productName: 'Soft Litchi Silk Saree',
      productImage: '',
      color: 'Lemon Yellow',
      amount: 1499,
      qty: 1,
      paymentMethod: 'Pay Online',
      status: 'Delivered'
    },
    {
      id: 'ORD1021',
      date: '2026-06-25',
      customer: 'Meenakshi Iyer',
      phone: '+91 65432 10987',
      address: 'Flat G3, Mylapore, Chennai - 600004',
      productName: 'Designer Organza Floral Saree',
      productImage: '',
      color: 'Chikku',
      amount: 1899,
      qty: 2,
      paymentMethod: 'Pay Online',
      status: 'Delivered'
    }
  ]);

  // Mock Returns state
  const [returns, setReturns] = useState([
    {
      id: 'RET501',
      orderId: 'ORD1019',
      customer: 'Sunita Verma',
      productName: 'Traditional Kanjeevaram Silk Saree',
      productImage: '',
      color: 'Lemon Yellow',
      amount: 1599,
      reason: 'Color slightly different from photo',
      status: 'Pending Approval'
    },
    {
      id: 'RET502',
      orderId: 'ORD1015',
      customer: 'Rekha Sen',
      productName: 'Designer Organza Floral Saree',
      productImage: '',
      color: 'Rani Pink',
      amount: 1899,
      reason: 'Fabric quality not as expected',
      status: 'RTO (Returned to Origin)'
    }
  ]);

  useEffect(() => {
    if (products && products.length > 0) {
      setOrders(prev => prev.map((ord, idx) => {
        const matchingProd = products[idx % products.length];
        return {
          ...ord,
          productName: matchingProd.name,
          productImage: matchingProd.image,
          color: matchingProd.color || ord.color
        };
      }));
      setReturns(prev => prev.map((ret, idx) => {
        const matchingProd = products[(idx + 2) % products.length];
        return {
          ...ret,
          productName: matchingProd.name,
          productImage: matchingProd.image,
          color: matchingProd.color || ret.color
        };
      }));
    }
  }, [products]);

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order ${orderId} marked as ${newStatus}.`, 'success');
  };

  const handleUpdateReturnStatus = (returnId, newStatus) => {
    setReturns(prev => prev.map(r => r.id === returnId ? { ...r, status: newStatus } : r));
    showToast(`Return ${returnId} marked as ${newStatus}.`, 'info');
  };

  useEffect(() => {
    const unlocked = sessionStorage.getItem('cms_unlocked') === 'true';
    if (unlocked) {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode === 'admin123') {
      setIsUnlocked(true);
      sessionStorage.setItem('cms_unlocked', 'true');
      showToast('Console database unlocked.', 'success');
    } else {
      showToast('Invalid passcode key.', 'error');
    }
  };

  const confirmReset = () => {
    if (confirm('Are you sure you want to reset the database to default products? All custom additions will be lost.')) {
      localStorage.removeItem('products');
      refreshDatabase();
      showToast('Database reset to defaults.', 'success');
    }
  };

  // Active product convenience getter
  const activeProduct = batchProducts[activeTabIndex] || {
    name: '', price: '', originalPrice: '', type: 'Silk', origin: 'India', desc: '',
    gst: '5', hsn: '500720', weight: '450', styleId: '', blouseLen: '0.8', sareeLen: '5.5',
    blouseType: 'Contrast Blouse', blouseColor: '', color: '', transparency: 'No',
    qty: 'Single', fabric: 'Mulberry Silk', border: 'Zari', occasion: 'Party Traditional Wedding',
    loom: 'Handloom', brand: 'REENAT TRENDS', image: '', image2: '', image3: '', image4: '', image5: '', image6: '', linkedTo: '', rating: 4.5
  };

  const isCommonField = (field) => {
    const specificFields = ['color', 'price', 'originalPrice', 'blouseColor', 'skuId', 'image', 'image2', 'image3', 'image4', 'image5', 'image6', 'linkedTo'];
    return !specificFields.includes(field);
  };

  const updateActiveProductField = (field, value) => {
    setBatchProducts(prev => {
      return prev.map((item, idx) => {
        if (idx === activeTabIndex) {
          return { ...item, [field]: value };
        }
        if (copyCommonDetails && isCommonField(field)) {
          return { ...item, [field]: value };
        }
        return item;
      });
    });
  };

  const handleAddVariant = () => {
    const baseProduct = batchProducts[activeTabIndex] || batchProducts[0];
    const newVariant = {
      ...baseProduct,
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      color: '',
      skuId: '',
      productId: '',
      image: '',
      image2: '',
      image3: '',
      image4: '',
      image5: '',
      image6: '',
      linkedTo: '',
      name: baseProduct.name ? `${baseProduct.name} - New Variant` : ''
    };
    setBatchProducts(prev => [...prev, newVariant]);
    setActiveTabIndex(batchProducts.length);
  };

  const handleRemoveVariant = (indexToRemove) => {
    if (confirm("Are you sure you want to remove this product variation?")) {
      setBatchProducts(prev => prev.filter((_, idx) => idx !== indexToRemove));
      if (activeTabIndex >= indexToRemove) {
        setActiveTabIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleOpenDrawer = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      const selectedProduct = products[index];
      const catalogId = selectedProduct.catalogId;
      
      // Find all related products sharing the same catalogId
      const related = catalogId
        ? products.filter(p => {
            return p.catalogId && p.catalogId.toLowerCase() === catalogId.toLowerCase();
          })
        : [selectedProduct];
      
      // Map products to form structure
      const mappedRelated = related.map(p => ({
        id: p.id,
        name: p.name || '',
        price: p.price || '',
        originalPrice: p.originalPrice || '',
        type: p.type || 'Silk',
        origin: p.origin || 'India',
        desc: p.desc || '',
        gst: p.gst || '5',
        hsn: p.hsn || '500720',
        weight: p.weight || '450',
        styleId: p.styleId || p.styleid || '',
        catalogId: p.catalogId || '',
        skuId: p.skuId || '',
        productId: p.productId || '',
        blouseLen: p.blouseLen || p.blouselen || '0.8',
        sareeLen: p.sareeLen || p.sareelen || '5.5',
        blouseType: p.blouseType || p.blousetype || 'Contrast Blouse',
        blouseColor: p.blouseColor || p.blousecolor || '',
        color: p.color || '',
        transparency: p.transparency || 'No',
        qty: p.qty || 'Single',
        fabric: p.fabric || 'Mulberry Silk',
        border: p.border || 'Zari',
        occasion: p.occasion || 'Party Traditional Wedding',
        loom: p.loom || 'Handloom',
        brand: p.brand || 'REENAT TRENDS',
        image: p.image || '',
        image2: p.image2 || '',
        image3: p.image3 || '',
        image4: p.image4 || '',
        image5: p.image5 || '',
        image6: p.image6 || '',
        linkedTo: p.linkedTo || p.linked_to || '',
        rating: p.rating || 4.5
      }));

      setBatchProducts(mappedRelated);
      setOriginalProductIds(mappedRelated.map(p => p.id).filter(id => id && !String(id).startsWith('temp-')));
      
      const activeIdx = mappedRelated.findIndex(p => p.id === selectedProduct.id);
      setActiveTabIndex(activeIdx >= 0 ? activeIdx : 0);
    } else {
      const newProduct = {
        id: `temp-${Date.now()}`,
        name: '',
        price: '',
        originalPrice: '',
        type: 'Silk',
        origin: 'India',
        desc: '',
        gst: '5',
        hsn: '500720',
        weight: '450',
        styleId: '',
        catalogId: '',
        skuId: '',
        productId: '',
        blouseLen: '0.8',
        sareeLen: '5.5',
        blouseType: 'Contrast Blouse',
        blouseColor: 'Golden',
        color: 'Multicolor',
        transparency: 'No',
        qty: 'Single',
        fabric: 'Mulberry Silk',
        border: 'Zari',
        occasion: 'Party Traditional Wedding',
        loom: 'Handloom',
        brand: 'REENAT TRENDS',
        image: '',
        image2: '',
        image3: '',
        image4: '',
        image5: '',
        image6: '',
        linkedTo: '',
        rating: 4.5
      };
      setBatchProducts([newProduct]);
      setOriginalProductIds([]);
      setActiveTabIndex(0);
    }
    setCopyCommonDetails(true);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
  };

  const handleImageUpload = async (e, slot) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus(prev => ({ ...prev, [slot]: 'UPLOADING...' }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `saree_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('saree-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('saree-images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const field = slot === 'front' ? 'image' : slot === 'img2' ? 'image2' : slot === 'img3' ? 'image3' : slot === 'img4' ? 'image4' : slot === 'img5' ? 'image5' : 'image6';
      updateActiveProductField(field, publicUrl);

      setUploadStatus(prev => ({ ...prev, [slot]: 'SUCCESS' }));
      showToast('Image uploaded to cloud successfully!', 'success');
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, [slot]: 'CLICK TO UPLOAD' }));
      }, 3000);
    } catch (err) {
      console.error("Cloud upload failed, loading as local Base64:", err);
      showToast("Cloud upload failed. Storing as local browser backup.", "warning");
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const field = slot === 'front' ? 'image' : slot === 'img2' ? 'image2' : slot === 'img3' ? 'image3' : slot === 'img4' ? 'image4' : slot === 'img5' ? 'image5' : 'image6';
        updateActiveProductField(field, dataUrl);
        setUploadStatus(prev => ({ ...prev, [slot]: 'LOCAL BACKUP' }));
        setTimeout(() => {
          setUploadStatus(prev => ({ ...prev, [slot]: 'CLICK TO UPLOAD' }));
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate all products in batch have name, price, image, and skuId
      for (let i = 0; i < batchProducts.length; i++) {
        const p = batchProducts[i];
        if (!p.name) {
          alert(`Product ${i + 1} must have a name.`);
          return;
        }
        if (!p.price || isNaN(Number(p.price))) {
          alert(`Product ${i + 1} must have a valid price.`);
          return;
        }
        if (!p.image) {
          alert(`Product ${i + 1} must have at least a Front image.`);
          return;
        }
        if (!p.skuId) {
          alert(`Product ${i + 1} must have a SKU ID.`);
          return;
        }
      }

      // Sync common fields if copyCommonDetails is checked
      let finalBatch = [...batchProducts];
      if (copyCommonDetails && finalBatch.length > 1) {
        const main = finalBatch[0];
        finalBatch = finalBatch.map((p, idx) => {
          if (idx === 0) return p;
          const updated = { ...p };
          Object.keys(main).forEach(key => {
            if (isCommonField(key)) {
              updated[key] = main[key];
            }
          });
          return updated;
        });
      }

      let dbError = false;

      // Handle deletions first
      const currentIds = finalBatch.map(p => p.id).filter(id => id && !String(id).startsWith('temp-'));
      const deletedIds = originalProductIds.filter(id => !currentIds.includes(id));

      for (const id of deletedIds) {
        try {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) {
            console.error("Delete error for ID", id, error);
            dbError = true;
          }
        } catch (err) {
          console.error("Delete call failed for ID", id, err);
          dbError = true;
        }
      }

      // Determine the shared catalog ID for items
      let sharedCatalogId = null;

      // If we are editing, we can use the catalogId of the first variant (which is already set)
      if (editingIndex !== null && finalBatch[0] && finalBatch[0].catalogId) {
        sharedCatalogId = finalBatch[0].catalogId;
      }

      // Handle updates and insertions
      for (let i = 0; i < finalBatch.length; i++) {
        const p = finalBatch[i];
        const isNew = !p.id || String(p.id).startsWith('temp-');

        let currentCatalogId = p.catalogId || '';
        if (isNew && sharedCatalogId) {
          currentCatalogId = sharedCatalogId;
        }

        const dbRow = {
          name: p.name,
          price: Number(p.price),
          originalprice: p.originalPrice ? Number(p.originalPrice) : null,
          type: p.type,
          origin: p.origin,
          desc: p.desc,
          gst: p.gst,
          hsn: p.hsn,
          weight: p.weight ? Number(p.weight) : null,
          styleid: `${currentCatalogId}||${p.skuId || ''}`,
          blouselen: p.blouseLen,
          sareelen: p.sareeLen,
          blousetype: p.blouseType,
          blousecolor: p.blouseColor,
          color: p.color,
          transparency: p.transparency,
          qty: p.qty,
          fabric: p.fabric,
          border: p.border,
          occasion: p.occasion,
          loom: p.loom,
          brand: p.brand,
          image: p.image,
          image2: p.image2,
          image3: p.image3,
          image4: p.image4 || '',
          image5: p.image5 || '',
          image6: p.image6 || '',
          linked_to: p.linkedTo || '',
          rating: p.rating ? Number(p.rating) : 4.5
        };

        try {
          if (!isNew) {
            // Update by unique integer ID!
            const { error } = await supabase.from('products').update(dbRow).eq('id', p.id);
            if (error) {
              console.error("Update error for product ID", p.id, error);
              dbError = true;
            }
          } else {
            // If this is a new catalog list and it's the first product, we must insert it to get the ID,
            // then use its generated Product ID as the shared catalog ID.
            if (i === 0 && !sharedCatalogId) {
              const { data, error } = await supabase.from('products').insert(dbRow).select();
              if (error) {
                console.error("Insert error for first product", p.name, error);
                dbError = true;
              } else if (data && data.length > 0) {
                const inserted = data[0];
                sharedCatalogId = 'NYS' + String(inserted.id).padStart(4, '0');
                // Update the first variant's styleid in database to include the new catalog ID
                const updatedStyleId = `${sharedCatalogId}||${p.skuId || ''}`;
                await supabase.from('products').update({ styleid: updatedStyleId }).eq('id', inserted.id);
              }
            } else {
              // For subsequent new variants, use the sharedCatalogId
              if (sharedCatalogId) {
                dbRow.styleid = `${sharedCatalogId}||${p.skuId || ''}`;
              }
              const { error } = await supabase.from('products').insert(dbRow);
              if (error) {
                console.error("Insert error for product variant", p.name, error);
                dbError = true;
              }
            }
          }
        } catch (err) {
          console.error("Save call failed:", err);
          dbError = true;
        }
      }

      if (dbError) {
        alert("Warning: Some catalog items failed to sync to the live database. Local state will sync from DB.");
      } else {
        alert("Successfully uploaded and synced all catalog items to the live database!");
      }

      // Always reload database products at the end
      await refreshDatabase();
      setShowDrawer(false);
    } catch (err) {
      console.error("Form submission error:", err);
      alert("Error: " + err.message);
    }
  };

  const deleteSaree = async (index) => {
    if (confirm(`Are you sure you want to delete "${products[index].name}"?`)) {
      const itemToDelete = products[index];
      const updated = products.filter((_, i) => i !== index);
      setProducts(updated);
      try {
        localStorage.setItem('products', JSON.stringify(updated));
      } catch (storageError) {
        console.warn("Could not save products cache to localStorage due to quota limits:", storageError);
      }

      try {
        await supabase.from('products').delete().eq('id', itemToDelete.id);
      } catch (err) {
        console.warn("Failed to delete from database:", err);
      }

      showToast('Product removed from catalog.', 'info');
    }
  };

  const deleteCatalog = async (catalogId) => {
    const itemsToDelete = products.filter(p => p.catalogId && p.catalogId.toLowerCase() === catalogId.toLowerCase());
    if (confirm(`Are you sure you want to delete catalog "${catalogId}" and all its ${itemsToDelete.length} variations?`)) {
      const updated = products.filter(p => !p.catalogId || p.catalogId.toLowerCase() !== catalogId.toLowerCase());
      setProducts(updated);
      try {
        localStorage.setItem('products', JSON.stringify(updated));
      } catch (storageError) {
        console.warn("Could not save products cache to localStorage:", storageError);
      }

      try {
        const idsToDelete = itemsToDelete.map(item => item.id).filter(id => id);
        if (idsToDelete.length > 0) {
          const { error } = await supabase.from('products').delete().in('id', idsToDelete);
          if (error) console.error("Database delete error:", error);
        }
      } catch (err) {
        console.warn("Failed to delete from database:", err);
      }

      showToast(`Catalog ${catalogId} deleted.`, 'info');
      if (selectedCatalogId && selectedCatalogId.toLowerCase() === catalogId.toLowerCase()) {
        setSelectedCatalogId(null);
      }
    }
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-8 rounded-3xl glass shadow-lg text-center space-y-6">
        <div className="size-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-3xl mx-auto shadow-sm">
          🔒
        </div>
        <div>
          <h2 className="text-2xl font-anton text-slate-800 dark:text-white tracking-wider">ADMIN CONSOLE LOCK</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please enter your passcode key to unlock the catalog CMS.</p>
        </div>
        
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <input 
              type="password" 
              placeholder="Default: admin123" 
              required 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-center text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A] transition-all" 
            />
          </div>
          <button type="submit" className="w-full bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded-full border border-[#183fad] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer text-sm">
            Unlock Database
          </button>
        </form>
      </div>
    );
  }

    const renderHomeView = () => {
    const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
    const lowStockCount = products.filter(p => p.qty === 'Low Stock' || (p.qty && p.qty.includes('Low'))).length;

    return (
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-indigo-950 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
          {/* Ambient background glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span className="text-[10px] font-extrabold tracking-widest text-[#F1BF0A] uppercase">Premium Seller Console</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              Welcome back, <span className="bg-gradient-to-r from-[#F1BF0A] via-amber-400 to-[#F1BF0A] bg-clip-text text-transparent">REENAT PREMIUM SAREES</span>
            </h1>
            <p className="text-xs text-slate-450 max-w-xl">
              Manage and grow your luxury handloom saree collections, inspect live orders, and monitor artisan shop operations.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <span className="bg-emerald-500/10 text-emerald-450 text-[10px] font-black tracking-widest px-4 py-2 rounded-full border border-emerald-500/20 flex items-center gap-2 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ONLINE STATUS: ACTIVE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: To-Do list, sales stats */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* To Do List Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span>📋</span> Operational Checklist
                </h3>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">Today</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div 
                  onClick={() => setActiveView('orders')}
                  className="relative overflow-hidden bg-gradient-to-br from-blue-50/30 to-slate-50/20 dark:from-blue-950/10 dark:to-slate-950/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Pending Orders</span>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{pendingOrdersCount}</span>
                    <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-1.5 transition-transform">➔</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/30 to-slate-50/20 dark:from-indigo-950/10 dark:to-slate-950/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Download Labels</span>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">7</span>
                    <span className="flex items-center justify-center size-6 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold group-hover:scale-110 transition-all">⬇</span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="relative overflow-hidden bg-gradient-to-br from-rose-50/30 to-slate-50/20 dark:from-rose-950/10 dark:to-slate-950/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Out of Stock</span>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-3xl font-black text-rose-600 dark:text-rose-500 tracking-tight">0</span>
                    <span className="flex items-center justify-center size-6 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-455 font-bold">⚠️</span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/30 to-slate-50/20 dark:from-amber-950/10 dark:to-slate-950/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Low Stock</span>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-500 tracking-tight">{lowStockCount}</span>
                    <span className="flex items-center justify-center size-6 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-455 font-bold">⚡</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Insights (Sales Chart) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span>📈</span> Analytics & Performance
                </h3>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-250 dark:border-slate-850">
                  <button className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-800">Daily</button>
                  <button className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 px-3 py-1 hover:text-slate-600 dark:hover:text-slate-350 bg-transparent border-0 cursor-pointer" onClick={() => alert("Weekly view is generated as a pro feature.")}>Weekly</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* SVG Chart area */}
                <div className="md:col-span-2 relative">
                  <svg viewBox="0 0 500 200" className="w-full h-44 overflow-visible">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800/60" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800/60" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800/60" />
                    <line x1="0" y1="160" x2="500" y2="160" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800/60" />

                    <path 
                      d="M 10 120 L 90 85 L 170 95 L 250 140 L 330 110 L 410 70 L 490 190 Z" 
                      fill="url(#chartGrad)" 
                    />

                    <path 
                      d="M 10 120 L 90 85 L 170 95 L 250 140 L 330 110 L 410 70 L 490 190" 
                      fill="none" 
                      stroke="#2563eb" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      strokeLinejoin="round" 
                    />

                    <circle cx="10" cy="120" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="dark:stroke-slate-900 shadow-md" />
                    <circle cx="90" cy="85" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="dark:stroke-slate-900 shadow-md" />
                    <circle cx="170" cy="95" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="dark:stroke-slate-900 shadow-md" />
                    <circle cx="250" cy="140" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="dark:stroke-slate-900 shadow-md" />
                    <circle cx="330" cy="110" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="dark:stroke-slate-900 shadow-md" />
                    <circle cx="410" cy="70" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="dark:stroke-slate-900 shadow-md" />
                    <circle cx="490" cy="190" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="dark:stroke-slate-900 shadow-md" />

                    <text x="10" y="210" textAnchor="middle" className="text-[10px] fill-slate-400 font-extrabold uppercase tracking-wide">23rd</text>
                    <text x="90" y="210" textAnchor="middle" className="text-[10px] fill-slate-400 font-extrabold uppercase tracking-wide">24th</text>
                    <text x="170" y="210" textAnchor="middle" className="text-[10px] fill-slate-400 font-extrabold uppercase tracking-wide">25th</text>
                    <text x="250" y="210" textAnchor="middle" className="text-[10px] fill-slate-400 font-extrabold uppercase tracking-wide">26th</text>
                    <text x="330" y="210" textAnchor="middle" className="text-[10px] fill-slate-400 font-extrabold uppercase tracking-wide">27th</text>
                    <text x="410" y="210" textAnchor="middle" className="text-[10px] fill-slate-400 font-extrabold uppercase tracking-wide">28th</text>
                    <text x="490" y="210" textAnchor="middle" className="text-[10px] fill-slate-400 font-extrabold uppercase tracking-wide">29th</text>
                  </svg>
                  <div className="text-center text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">
                    June '26 (Daily Sales Trend)
                  </div>
                </div>

                <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 md:pl-6 pt-4 md:pt-0">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Views (28 Jun)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">1,61,069</span>
                      <span className="text-[10px] font-bold text-rose-500 flex items-center">▼ 8.56%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders (28 Jun)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">73</span>
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center">▲ 19.67%</span>
                    </div>
                  </div>

                  <button className="w-full text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline py-2 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl cursor-pointer">
                    View More Details
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Planner, Tasks & Notes */}
          <div className="space-y-6">
            
            {/* Tasks, Notes, and Schedule Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span>⚡</span> Planner & Tasks
                </h3>
                <span className="text-[8px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Live Cache</span>
              </div>

              {/* Task list and Add Form */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-350">Active Notes</span>
                  <span className="text-[10px] text-slate-400 font-bold">{tasks.filter(t => !t.completed).length} pending</span>
                </div>

                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Type task/note..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm">
                    Add
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 select-none" style={{ scrollbarWidth: 'thin' }}>
                  {tasks.length === 0 ? (
                    <div className="text-center py-6 text-slate-450 dark:text-slate-500 text-[11px] font-bold">No tasks added yet. Add some notes above!</div>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/50 rounded-xl transition-all group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="rounded border-slate-350 dark:border-slate-700 text-blue-600 focus:ring-blue-500 size-3.5 cursor-pointer"
                          />
                          <span className={`text-xs font-bold truncate transition-all ${task.completed ? 'line-through text-slate-400 dark:text-slate-600 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                            {task.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer p-0.5 text-xs bg-transparent border-0 font-bold"
                          title="Delete task"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Schedule list and Add Form */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-350">Today's Schedule</span>
                  <span className="text-[10px] text-slate-400 font-bold">Timeline</span>
                </div>

                <form onSubmit={handleAddSchedule} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newScheduleTime}
                      onChange={(e) => setNewScheduleTime(e.target.value)}
                      placeholder="e.g. 05:00 PM"
                      className="w-24 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800/80 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newScheduleText}
                      onChange={(e) => setNewScheduleText(e.target.value)}
                      placeholder="Describe event..."
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800/80 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-800 hover:bg-slate-750 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-[10px] py-1.5 rounded-lg transition-all cursor-pointer">
                    Schedule Event
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {schedule.length === 0 ? (
                    <div className="text-center py-6 text-slate-450 dark:text-slate-500 text-[11px] font-bold">No scheduled events today. Add some above!</div>
                  ) : (
                    schedule.map(item => (
                      <div key={item.id} className="flex items-start justify-between p-2.5 bg-slate-55/30 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/50 rounded-xl group">
                        <div className="flex gap-2.5 min-w-0">
                          <span className="text-[8px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded h-fit shrink-0">
                            {item.time}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-350 leading-relaxed truncate">
                            {item.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer p-0.5 text-xs bg-transparent border-0 shrink-0 ml-2"
                          title="Remove event"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };;

  const renderOrdersView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Orders Dashboard</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage packing lists, print labels, and track customer shipments</p>
          </div>
          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full border border-blue-500/20">
            📦 TOTAL ORDERS: {orders.length}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Live Orders log</h3>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded font-bold">State Synced</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse text-slate-800 dark:text-slate-100">
              <thead>
                <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-slate-800 font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="p-4 w-24">Order ID</th>
                  <th className="p-4 w-28">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4 w-32">SKU ID</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-center">Payment</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-950 dark:text-white">{item.id}</td>
                    <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{item.date}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.customer}</div>
                      <div className="text-[10px] text-slate-450 dark:text-slate-550 font-medium mt-0.5">{item.phone}</div>
                      <div className="text-[9px] text-slate-450 dark:text-slate-500 mt-0.5 truncate max-w-[160px]" title={item.address}>{item.address}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 relative">
                          {item.productImage ? (
                            <img src={item.productImage} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">📷</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[165px]">{item.productName}</span>
                          <span className="text-[9px] text-slate-455 dark:text-slate-550 block uppercase font-extrabold mt-0.5">Color: {item.color} | Qty: {item.qty}</span>
                        </div>
                      </div>
                    </td>
                    <td 
                      className="p-4 font-mono text-slate-500 dark:text-slate-455 cursor-copy hover:underline select-text font-bold"
                      onClick={() => { if (item.skuId) handleCopyToClipboard(item.skuId, "SKU ID"); }}
                      title="Click to copy SKU ID"
                    >
                      {item.skuId || 'N/A'}
                    </td>
                    <td className="p-4 text-right font-extrabold text-slate-950 dark:text-white">₹{(item.amount * item.qty).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.paymentMethod === 'Pay Online' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Pending' 
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                          : item.status === 'Shipped'
                            ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {item.status === 'Pending' && (
                        <button 
                          onClick={() => handleUpdateOrderStatus(item.id, 'Shipped')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer shadow-sm transition-all"
                        >
                          Mark as Shipped
                        </button>
                      )}
                      {item.status === 'Shipped' && (
                        <button 
                          onClick={() => handleUpdateOrderStatus(item.id, 'Delivered')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer shadow-sm transition-all"
                        >
                          Mark as Delivered
                        </button>
                      )}
                      {item.status === 'Delivered' && (
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 flex items-center justify-end gap-1 select-none">
                          <span>✓</span> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderReturnsView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Returns & RTO Tracker</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review return requests, verify items, and check customer refund status</p>
          </div>
          <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full border border-rose-500/20">
            ↩ TOTAL RETURNS: {returns.length}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Returns Requests log</h3>
            <span className="text-[9px] bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded font-bold">Admin Console</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse text-slate-800 dark:text-slate-100">
              <thead>
                <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-slate-800 font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="p-4 w-24">Return ID</th>
                  <th className="p-4 w-24">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4 text-right">Refund Amount</th>
                  <th className="p-4">Reason for Return</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {returns.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-950 dark:text-white">{item.id}</td>
                    <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">{item.orderId}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{item.customer}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 relative">
                          {item.productImage ? (
                            <img src={item.productImage} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">📷</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[165px]">{item.productName}</span>
                          <span className="text-[9px] text-slate-450 block uppercase font-extrabold mt-0.5">Color: {item.color}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-extrabold text-slate-950 dark:text-white">₹{item.amount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-slate-650 dark:text-slate-400 font-medium max-w-[200px] truncate" title={item.reason}>{item.reason}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Pending Approval' 
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                          : item.status === 'Approved & Refunded'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {item.status === 'Pending Approval' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleUpdateReturnStatus(item.id, 'Approved & Refunded')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer shadow-sm"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateReturnStatus(item.id, 'Rejected')}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 flex items-center justify-end gap-1 select-none">
                          <span>✓</span> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

    const handleCopyToClipboard = (text, label = "Catalog ID") => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} "${text}" copied to clipboard.`, 'success');
    }
  };

  const getStockNumber = (qty) => {
    if (!qty) return 150; // default stock
    const num = parseInt(qty, 10);
    if (!isNaN(num)) return num;
    const lower = qty.toLowerCase();
    if (lower.includes('out') || lower.includes('zero') || lower === '0') return 0;
    if (lower.includes('low')) return 5;
    if (lower.includes('single')) return 1;
    return 100; // default fallback
  };

  const handleEditStockClick = (variant) => {
    setEditingStockId(variant.id);
    setEditingStockValue(String(variant.stockNumber));
  };

  const handleSaveStock = async (variant) => {
    const newStockVal = parseInt(editingStockValue, 10);
    if (isNaN(newStockVal) || newStockVal < 0) {
      showToast("Please enter a valid stock number.", "error");
      setEditingStockId(null);
      return;
    }

    // Update local state
    const updatedProducts = products.map((p, idx) => {
      if (idx === variant.globalIndex) {
        return { ...p, qty: String(newStockVal) };
      }
      return p;
    });
    setProducts(updatedProducts);

    try {
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (storageError) {
      console.warn("Could not save products cache to localStorage:", storageError);
    }

    // Update Supabase
    try {
      const { error } = await supabase.from('products').update({ qty: String(newStockVal) }).eq('id', variant.id);
      if (error) {
        console.error("Failed to update stock in database:", error);
        showToast("Database update failed, synced locally.", "warning");
      } else {
        showToast("Stock updated successfully.", "success");
      }
    } catch (err) {
      console.warn("Supabase update error:", err);
      showToast("Stock updated locally.", "info");
    }

    setEditingStockId(null);
  };

  const renderCatalogView = () => {
    const totalSarees = products.length;

    // Group products by catalogId
    const catalogGroupsMap = {};
    products.forEach((p, idx) => {
      const cid = p.catalogId || 'UNCATALOGED';
      const stockVal = getStockNumber(p.qty);
      
      if (!catalogGroupsMap[cid]) {
        catalogGroupsMap[cid] = {
          catalogId: cid,
          name: p.name || 'Unnamed Catalog Saree',
          weaveType: p.type || 'Silk',
          origin: p.origin || 'India',
          coverImage: p.image || '/saree_kanjivaram.png',
          variants: [],
          variantsCount: 0,
          totalStock: 0,
          minPrice: p.price || 0,
          maxPrice: p.price || 0,
          estimatedOrders: (parseInt(p.id || 0) * 123) % 1000 + 50, // simulated order history
          rating: p.rating || 4.2,
          createdDate: new Date(Date.now() - (parseInt(p.id || 0) * 24 * 60 * 60 * 1000)), // simulated date
          firstVariantGlobalIndex: idx
        };
      }
      
      catalogGroupsMap[cid].variants.push({ ...p, globalIndex: idx, stockNumber: stockVal });
      catalogGroupsMap[cid].variantsCount += 1;
      catalogGroupsMap[cid].totalStock += stockVal;
      catalogGroupsMap[cid].minPrice = Math.min(catalogGroupsMap[cid].minPrice, p.price || 0);
      catalogGroupsMap[cid].maxPrice = Math.max(catalogGroupsMap[cid].maxPrice, p.price || 0);
    });

    const allCatalogsCount = Object.keys(catalogGroupsMap).length;
    const outOfStockCount = Object.values(catalogGroupsMap).filter(group => 
      group.variants.every(v => v.stockNumber === 0)
    ).length;
    const lowStockCount = Object.values(catalogGroupsMap).filter(group => 
      group.variants.some(v => v.stockNumber > 0 && v.stockNumber < 10)
    ).length;

    // Filter Catalogs List
    let filteredGroups = Object.values(catalogGroupsMap).filter(group => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        group.catalogId.toLowerCase().includes(query) ||
        group.name.toLowerCase().includes(query) ||
        group.weaveType.toLowerCase().includes(query) ||
        group.origin.toLowerCase().includes(query) ||
        group.variants.some(v => v.skuId && v.skuId.toLowerCase().includes(query))
      );
    });

    // Apply Status Tabs Filters
    if (statusFilter === 'out_of_stock') {
      filteredGroups = filteredGroups.filter(group => group.variants.every(v => v.stockNumber === 0));
    } else if (statusFilter === 'low_stock') {
      filteredGroups = filteredGroups.filter(group => group.variants.some(v => v.stockNumber > 0 && v.stockNumber < 10));
    }

    // Apply Sorting
    filteredGroups.sort((a, b) => {
      if (sortBy === 'estimated_orders') {
        return b.estimatedOrders - a.estimatedOrders;
      } else if (sortBy === 'newest') {
        return b.firstVariantGlobalIndex - a.firstVariantGlobalIndex;
      } else if (sortBy === 'price_asc') {
        return a.minPrice - b.minPrice;
      } else if (sortBy === 'price_desc') {
        return b.maxPrice - a.maxPrice;
      }
      return 0;
    });

    const activeCatalogId = selectedCatalogId || (filteredGroups[0] ? filteredGroups[0].catalogId : null);

    return (
      <div className="space-y-6 flex flex-col h-[calc(100vh-120px)] overflow-hidden">
        
        {/* TOP CONTROLS BAR */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          
          {/* Tabs (All, Out of stock, Low stock) */}
          <div className="flex items-center gap-2 border-b xl:border-b-0 pb-3 xl:pb-0 border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border-0 ${
                statusFilter === 'all' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 bg-transparent'
              }`}
            >
              All Catalog ({allCatalogsCount})
            </button>
            <button 
              onClick={() => setStatusFilter('out_of_stock')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border-0 ${
                statusFilter === 'out_of_stock' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355 bg-transparent'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
            <button 
              onClick={() => setStatusFilter('low_stock')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border-0 ${
                statusFilter === 'low_stock' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-[#F1BF0A] bg-transparent'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
          </div>

          {/* Sort, Search, Upload Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort catalogs by Dropdown */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
              <span>Sort catalogs by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 dark:text-slate-355 cursor-pointer"
              >
                <option value="estimated_orders">Highest Estimated Orders</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none text-xs">🔍</span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Catalog ID/Style ID/SKU ID"
                className="bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Catalog Upload Purple Button */}
            <button 
              onClick={() => handleOpenDrawer(null)}
              className="bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-950/20 cursor-pointer flex items-center gap-1.5 border-0"
            >
              <span>⬆</span> Catalog Upload
            </button>
          </div>
        </div>

        {/* SPLIT MASTER-DETAIL COLUMNS */}
        <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
          
          {/* LEFT COLUMN: CATALOG LIST PANEL (1/3 width) */}
          <div className="w-80 md:w-96 flex flex-col bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-550">Catalog Groups ({filteredGroups.length})</span>
              <button 
                onClick={confirmReset}
                className="text-[9.5px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-900/40 text-rose-500 hover:text-rose-600 font-extrabold px-2 py-0.5 rounded border border-rose-200/50 dark:border-rose-900/30 cursor-pointer transition-colors"
              >
                Reset DB
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar p-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
              {filteredGroups.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-550 text-xs">No matching catalogs found.</div>
              ) : (
                filteredGroups.map(group => {
                  const isSelected = activeCatalogId && activeCatalogId.toLowerCase() === group.catalogId.toLowerCase();
                  const extraCount = group.variantsCount > 1 ? `+${group.variantsCount - 1}` : '';

                  return (
                    <div 
                      key={group.catalogId}
                      onClick={() => setSelectedCatalogId(group.catalogId)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative flex gap-3.5 ${
                        isSelected 
                          ? 'bg-blue-50/40 dark:bg-blue-950/15 border-blue-500/80 shadow-sm shadow-blue-500/5' 
                          : 'bg-transparent border-slate-150 dark:border-slate-800 hover:bg-slate-50/40 dark:hover:bg-slate-950/30'
                      }`}
                    >
                      {/* Collage Thumbnail Box */}
                      <div className="relative size-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img src={group.coverImage} className="w-full h-full object-cover" alt="" />
                        {extraCount && (
                          <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow">
                            {extraCount}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1 flex flex-col justify-center py-0.5">
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(group.catalogId);
                          }}
                          className="text-[15px] font-black text-blue-600 dark:text-blue-400 font-mono tracking-wide hover:underline cursor-copy select-text"
                          title="Click to copy Catalog ID"
                        >
                          Catalog ID: {group.catalogId}
                        </span>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate mt-1.5 leading-snug">
                          {group.name}
                        </h4>
                      </div>

                      {/* Selected Indicator Glow Dot */}
                      {isSelected && (
                        <span className="absolute top-3.5 right-3.5 size-2 rounded-full bg-blue-500 shadow shadow-blue-500/50 animate-pulse"></span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: PRODUCTS TABLE (2/3 width, scrollable) */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden min-w-0">
            {activeCatalogId ? (
              (() => {
                const selectedCatalog = catalogGroupsMap[activeCatalogId];
                if (!selectedCatalog) return <div className="flex-1 flex items-center justify-center text-xs text-slate-400">Loading catalog...</div>;
                
                return (
                  <>
                    {/* Header Title Bar */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                      <div>
                        <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                          SKUs and Products of Catalog ID: <span 
                            onClick={() => handleCopyToClipboard(selectedCatalog.catalogId)}
                            className="font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-xl font-black text-sm hover:bg-blue-500/20 transition-colors cursor-copy select-text"
                            title="Click to copy Catalog ID"
                          >
                            {selectedCatalog.catalogId}
                          </span>
                        </h2>
                        <p className="text-[10px] text-slate-450 dark:text-slate-550 mt-1.5 flex items-center gap-3">
                          <span>📦 <strong>{selectedCatalog.estimatedOrders} Orders</strong> in last 30 days</span>
                          <span>•</span>
                          <span className="bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 px-1.5 py-0.5 rounded text-[9px] font-black">⭐ {selectedCatalog.rating.toFixed(1)} Rating</span>
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleOpenDrawer(selectedCatalog.firstVariantGlobalIndex)}
                          className="bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-transform active:scale-95 shadow cursor-pointer flex items-center gap-1.5 border-0"
                        >
                          <span>⚙️</span> Configure (Batch)
                        </button>
                        <button 
                          onClick={() => deleteCatalog(selectedCatalog.catalogId)}
                          className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-900/40 text-rose-500 font-bold py-2 px-4 rounded-xl text-xs border border-rose-200/50 dark:border-rose-900/30 transition-transform active:scale-95 cursor-pointer"
                        >
                          Delete Catalog
                        </button>
                      </div>
                    </div>

                    {/* Table wrapper */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-xs text-left border-collapse text-slate-800 dark:text-slate-100">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-150 dark:border-slate-800/80 font-bold text-[9.5px] uppercase tracking-wider text-slate-400 dark:text-slate-555 shrink-0">
                            <th className="p-4 w-10 text-center select-all"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /></th>
                            <th className="p-4 w-20">SKU Image</th>
                            <th className="p-4">SKU Info</th>
                            <th className="p-4 w-28">Product ID</th>
                            <th className="p-4 w-32">SKU ID (optional)</th>
                            <th className="p-4 text-right w-24">Price</th>
                            <th className="p-4 text-center w-36">Stock</th>
                            <th className="p-4 text-right w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedCatalog.variants.map((item, i) => {
                            const isEditingThisStock = editingStockId === item.id;
                            
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                                {/* Checkbox */}
                                <td className="p-4 text-center">
                                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-3.5 cursor-pointer" />
                                </td>

                                {/* Image */}
                                <td className="p-4">
                                  <img src={item.image} alt={item.color} className="size-11 object-cover rounded-lg border border-black/5" />
                                </td>

                                {/* SKU Info */}
                                <td className="p-4">
                                  <div className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]">{item.name}</div>
                                  <div className="text-[10px] text-slate-450 dark:text-slate-550 font-bold mt-1 flex items-center gap-1.5">
                                    <span className="size-2.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: item.blouseColor || '#ccc' }}></span>
                                    {item.color || 'No color'}
                                  </div>
                                </td>

                                {/* Product ID */}
                                <td 
                                  className="p-4 font-mono font-bold text-slate-455 dark:text-slate-550 cursor-copy hover:underline select-text"
                                  onClick={() => handleCopyToClipboard(item.productId.replace('NYS', 'NSY'), "Product ID")}
                                  title="Click to copy Product ID"
                                >
                                  {item.productId.replace('NYS', 'NSY')}
                                </td>

                                {/* SKU ID */}
                                <td 
                                  className="p-4 font-mono text-slate-500 dark:text-slate-450 cursor-copy hover:underline select-text"
                                  onClick={() => { if (item.skuId) handleCopyToClipboard(item.skuId, "SKU ID"); }}
                                  title="Click to copy SKU ID"
                                >
                                  {item.skuId || 'N/A'}
                                </td>

                                {/* Price */}
                                <td className="p-4 text-right font-black text-slate-850 dark:text-slate-100">
                                  ₹{(item.price || 0).toLocaleString('en-IN')}
                                </td>

                                {/* Stock inline editor */}
                                <td className="p-4 text-center">
                                  {isEditingThisStock ? (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <input 
                                        type="text" 
                                        value={editingStockValue}
                                        onChange={(e) => setEditingStockValue(e.target.value)}
                                        className="w-16 bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-800 rounded-lg px-1.5 py-0.5 text-center text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveStock(item);
                                          if (e.key === 'Escape') setEditingStockId(null);
                                        }}
                                      />
                                      <button 
                                        onClick={() => handleSaveStock(item)}
                                        className="bg-emerald-650 hover:bg-emerald-750 text-white rounded p-0.5 text-[9px] cursor-pointer font-bold border-0"
                                      >
                                        ✓
                                      </button>
                                      <button 
                                        onClick={() => setEditingStockId(null)}
                                        className="bg-slate-300 text-slate-700 rounded p-0.5 text-[9px] hover:bg-slate-400 cursor-pointer font-bold border-0"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20 px-2.5 py-1 rounded-xl w-28 mx-auto hover:border-slate-350 dark:hover:border-slate-750 transition-colors">
                                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                        Stock: <strong className="text-slate-850 dark:text-slate-200 font-extrabold">{item.stockNumber}</strong>
                                      </div>
                                      <button 
                                        onClick={() => handleEditStockClick(item)}
                                        className="text-slate-400 hover:text-blue-500 cursor-pointer select-none font-bold text-[10px] bg-transparent border-0 p-0"
                                        title="Edit Stock inline"
                                      >
                                        ✏️
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="p-4 text-right space-x-2.5 whitespace-nowrap">
                                  <button 
                                    onClick={() => handleOpenDrawer(item.globalIndex)}
                                    className="text-blue-600 dark:text-blue-450 hover:underline font-extrabold bg-transparent border-0 p-0 cursor-pointer text-xs"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-slate-300 dark:text-slate-750 select-none">|</span>
                                  <button 
                                    onClick={() => deleteSaree(item.globalIndex)}
                                    className="text-rose-500 hover:text-rose-600 font-extrabold bg-transparent border-0 p-0 cursor-pointer text-xs"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 dark:text-slate-550 space-y-3">
                <span className="text-3xl">🗂️</span>
                <span className="text-xs font-bold">Select a catalog on the left to configure variants.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };;

  return (
    <div id="cms-console-root" className="flex h-screen w-full overflow-hidden bg-[#f4f7fe] dark:bg-slate-950 text-slate-800 dark:text-white">
      {/* Left Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#020408] text-slate-100 flex flex-col border-r border-slate-200 dark:border-slate-850 shrink-0">
        {/* Profile Card Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/20">
          <div className="flex items-center gap-2.5 select-none">
            <div className="size-8 rounded-full bg-gradient-to-tr from-amber-400 to-[#F1BF0A] flex items-center justify-center font-bold text-slate-900 text-sm shadow-md animate-pulse">
              👑
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-[11px] uppercase tracking-wider block text-slate-200 truncate">REENAT PREMIUM</span>
              <span className="text-[9px] text-slate-500 font-bold block truncate">Seller Dashboard</span>
            </div>
          </div>
          <span className="text-slate-500 font-bold text-xs select-none">▼</span>
        </div>

        {/* Notices and Support */}
        <div className="px-4 py-3 border-b border-slate-855 flex items-center justify-between text-[10px] font-bold text-slate-400 select-none">
          <button 
            onClick={() => alert("Announcements: 1 Active notice.")}
            className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer select-none bg-transparent border-0 text-left text-slate-400 font-bold text-[10px] transition-colors"
          >
            <span>🔔 Notices</span>
            <span className="bg-rose-500 text-white text-[8px] font-black size-4 rounded-full flex items-center justify-center animate-pulse">1</span>
          </button>
          <span className="text-slate-700">|</span>
          <button 
            onClick={() => alert("Support Hotline: support@reenattrends.com / Toll Free: 1800-XXX-XXXX")}
            className="hover:text-slate-200 cursor-pointer select-none bg-transparent border-0 text-slate-400 font-bold text-[10px] transition-colors"
          >
            🎧 Support
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-2 select-none">
          <button
            onClick={() => setActiveView('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 text-left ${
              activeView === 'home'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-950/40 border-l-4 border-[#F1BF0A]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 bg-transparent'
            }`}
          >
            <span>🏠</span>
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveView('catalog')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 text-left ${
              activeView === 'catalog'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-655 text-white shadow-md shadow-blue-950/40 border-l-4 border-[#F1BF0A]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 bg-transparent'
            }`}
          >
            <span>👘</span>
            <span>Catalog</span>
          </button>

          <button
            onClick={() => setActiveView('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 text-left ${
              activeView === 'orders'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-655 text-white shadow-md shadow-blue-950/40 border-l-4 border-[#F1BF0A]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 bg-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <span>📦</span>
              <span>Orders</span>
            </div>
            {orders.filter(o => o.status === 'Pending').length > 0 && (
              <span className="bg-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide animate-pulse">
                NEW
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('returns')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 text-left ${
              activeView === 'returns'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-655 text-white shadow-md shadow-blue-950/40 border-l-4 border-[#F1BF0A]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 bg-transparent'
            }`}
          >
            <span>↩</span>
            <span>Returns</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-855 text-[9px] font-bold text-slate-500 text-center select-none">
          Powered by Reenat Trends Console
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeView === 'home' && renderHomeView()}
        {activeView === 'catalog' && renderCatalogView()}
        {activeView === 'orders' && renderOrdersView()}
        {activeView === 'returns' && renderReturnsView()}
      </main>

      {/* Edit Form Drawer Panel Overlay */}
      {showDrawer && (
        <div className="fixed inset-0 w-screen h-screen bg-[#f8fafc] dark:bg-slate-900 z-[9501] flex flex-col overflow-hidden text-slate-800 dark:text-white font-sans">
          {/* Header */}
          <div className="px-8 py-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between shrink-0 gap-6 z-[9502]">
            <div className="flex items-center gap-3 shrink-0">
              <div className="size-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                <img src={activeProduct.image || "/saree_kanjivaram.png"} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold truncate max-w-[150px]" style={{ color: '#ffffff' }}>
                  {activeProduct.name || (editingIndex !== null ? 'Configure Saree' : 'New Saree')}
                </h2>
                <p className="text-[10px] font-bold font-mono" style={{ color: '#94a3b8' }}>ID: {activeProduct.productId || 'N/A'}</p>
              </div>
            </div>

            {/* Variations (Moved to Header) */}
            <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto flex-nowrap py-1 px-2 select-none" style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none' }}>
              {batchProducts.map((prod, idx) => {
                const isSelected = idx === activeTabIndex;
                return (
                  <div 
                    key={prod.id || idx}
                    onClick={() => setActiveTabIndex(idx)}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 cursor-pointer transition-all relative group"
                    style={{
                      borderColor: isSelected ? '#2563eb' : '#334155',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.2)' : '#1e293b',
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="size-6 rounded overflow-hidden bg-slate-900 border border-slate-800">
                      {prod.image ? (
                        <img src={prod.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-bold bg-slate-900">📷</div>
                      )}
                    </div>
                    
                    {/* Tab Text */}
                    <span className="text-[10px] font-bold truncate max-w-[80px]" style={{ color: '#ffffff' }}>
                      {prod.color || 'No Color'}
                    </span>

                    {/* Close button for deleting a variant */}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVariant(idx);
                        }}
                        className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full size-3.5 flex items-center justify-center text-[8px] shadow-sm cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all z-10"
                        title="Delete this variant"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Variant Tab */}
              <button
                type="button"
                onClick={handleAddVariant}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-slate-700 hover:border-blue-500 text-[10px] font-bold transition-all cursor-pointer bg-[#1e293b]"
                style={{ color: '#94a3b8' }}
              >
                <span>➕</span>
                <span>Add Product</span>
              </button>
            </div>

            <button 
              type="button"
              className="bg-[#ff9e59] hover:bg-orange-500 text-white font-bold py-1.5 px-4 rounded-lg text-[10px] transition-colors flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
              onClick={handleCloseDrawer}
              style={{ color: 'white' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span>Back</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-900 pb-36">
            <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Specs Column */}
              <div className="col-span-1 lg:col-span-8 space-y-3">
                {/* Section: Price, Size and Inventory */}
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Product Details</h3>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wide">Price, Size and Inventory</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* GST */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>GST *</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5 cursor-pointer hover:text-slate-650" title="Goods and Services Tax rate">ⓘ</span>
                      </label>
                      <select 
                        value={activeProduct.gst}
                        onChange={(e) => updateActiveProductField('gst', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="5">5</option>
                        <option value="12">12</option>
                        <option value="18">18</option>
                      </select>
                    </div>
                    
                    {/* HSN Code */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>HSN Code *</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5 cursor-pointer hover:text-slate-650" title="Harmonized System of Nomenclature code">ⓘ</span>
                      </label>
                      <select 
                        value={activeProduct.hsn}
                        onChange={(e) => updateActiveProductField('hsn', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="500720">500720</option>
                        <option value="520811">520811</option>
                        <option value="540752">540752</option>
                      </select>
                    </div>

                    {/* Country of Origin */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>COUNTRY OF ORIGIN *</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5 cursor-pointer hover:text-slate-650" title="Manufacturing country">ⓘ</span>
                      </label>
                      <select 
                        value={activeProduct.origin}
                        onChange={(e) => updateActiveProductField('origin', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="India">India</option>
                        <option value="Bangladesh">Bangladesh</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Net Weight */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Net Weight (gms) *</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5 cursor-pointer hover:text-slate-650" title="Weight in grams">ⓘ</span>
                      </label>
                      <input 
                        type="number" 
                        required 
                        value={activeProduct.weight}
                        onChange={(e) => updateActiveProductField('weight', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      />
                    </div>

                    {/* Net Quantity */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Net Quantity (N) *</span>
                      </label>
                      <select 
                        value={activeProduct.qty}
                        onChange={(e) => updateActiveProductField('qty', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="Single">Single</option>
                        <option value="Pack of 2">Pack of 2</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Product ID (Read-only) */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Product ID (Read-only)</span>
                      </label>
                      <input 
                        type="text" 
                        readOnly 
                        disabled
                        value={activeProduct.productId || 'Generated on save'}
                        className="w-full bg-slate-150 dark:bg-slate-900/50 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed"
                      />
                    </div>

                    {/* Catalog ID (Read-only) */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Catalog ID (Read-only)</span>
                      </label>
                      <input 
                        type="text" 
                        readOnly 
                        disabled
                        value={activeProduct.catalogId || 'Generated on save'}
                        className="w-full bg-slate-150 dark:bg-slate-900/50 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed"
                      />
                    </div>

                    {/* SKU ID */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>SKU ID *</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={activeProduct.skuId || ''}
                        onChange={(e) => updateActiveProductField('skuId', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                        placeholder="e.g. Black Red HR1"
                      />
                    </div>

                    {/* Link to Product ID (Optional) */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Link to Product ID (Optional)</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5 cursor-pointer hover:text-slate-600" title="Cross-link this product variation to another product catalog (e.g. NYS0010)">ⓘ</span>
                      </label>
                      <input 
                        type="text" 
                        value={activeProduct.linkedTo || ''}
                        onChange={(e) => updateActiveProductField('linkedTo', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. NYS0010"
                      />
                    </div>
                  </div>

                  {/* Saree Name */}
                  <div>
                    <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Product Name *</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={activeProduct.name}
                      onChange={(e) => updateActiveProductField('name', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Pricing grid table style */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden grid grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 bg-[#f8fafc] dark:bg-slate-900">
                    <div className="p-3 space-y-1">
                      <label className="flex items-center text-[9px] font-extrabold text-slate-550 uppercase tracking-wide">
                        <span>MRP *</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-xs text-slate-450 font-bold">₹</span>
                        <input 
                          type="number" 
                          required 
                          value={activeProduct.originalPrice}
                          onChange={(e) => updateActiveProductField('originalPrice', e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-5 pr-2 py-1.5 text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-1">
                      <label className="flex items-center text-[9px] font-extrabold text-slate-550 uppercase tracking-wide">
                        <span>Price *</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-xs text-slate-450 font-bold">₹</span>
                        <input 
                          type="number" 
                          required 
                          value={activeProduct.price}
                          onChange={(e) => updateActiveProductField('price', e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-5 pr-2 py-1.5 text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 space-y-1">
                      <label className="block text-[9px] font-extrabold text-slate-550 uppercase tracking-wide">Blouse Length *</label>
                      <select 
                        value={activeProduct.blouseLen}
                        onChange={(e) => updateActiveProductField('blouseLen', e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs font-semibold focus:outline-none"
                      >
                        <option value="0.8">0.8 m</option>
                        <option value="0.9">0.9 m</option>
                        <option value="1.0">1.0 m</option>
                        <option value="No Blouse">No Blouse</option>
                      </select>
                    </div>

                    <div className="p-3 space-y-1">
                      <label className="block text-[9px] font-extrabold text-slate-550 uppercase tracking-wide">Saree Length *</label>
                      <select 
                        value={activeProduct.sareeLen}
                        onChange={(e) => updateActiveProductField('sareeLen', e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs font-semibold focus:outline-none"
                      >
                        <option value="5.5">5.5 m</option>
                        <option value="6.0">6.0 m</option>
                        <option value="6.3">6.3 m</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Section: Product Details */}
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-900">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Product Details</h3>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wide">Fabric & Design Specifications</p>
                    </div>
                    {/* Copy Input Checkbox */}
                    <div className="flex items-center gap-2 select-none shrink-0 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                      <input
                        type="checkbox"
                        id="copy-common-details"
                        checked={copyCommonDetails}
                        onChange={(e) => setCopyCommonDetails(e.target.checked)}
                        className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="copy-common-details" className="text-[9px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer" title="Copy changes to other variations automatically">
                        Copy common details
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Saree Color */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Saree Color *</label>
                      <select 
                        value={activeProduct.color}
                        onChange={(e) => updateActiveProductField('color', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="">Select Color</option>
                        <option value="Gold">Gold</option>
                        <option value="Red">Red</option>
                        <option value="Green">Green</option>
                        <option value="Mango Yellow">Mango Yellow</option>
                        <option value="Yellow">Yellow</option>
                        <option value="black">black</option>
                        <option value="Rani Pink">Rani Pink</option>
                        <option value="Lemon Yellow">Lemon Yellow</option>
                        <option value="Navy Blue">Navy Blue</option>
                        <option value="Royal Blue">Royal Blue</option>
                        <option value="Deep Green">Deep Green</option>
                        <option value="Grey">Grey</option>
                        <option value="Tussar">Tussar</option>
                        <option value="Chikku">Chikku</option>
                        <option value="Kesar Orange">Kesar Orange</option>
                        <option value="Sea Green">Sea Green</option>
                        <option value="Chocolate">Chocolate</option>
                        <option value="Mint Green">Mint Green</option>
                        <option value="Magenta">Magenta</option>
                        <option value="Violet">Violet</option>
                        <option value="Baby Pink">Baby Pink</option>
                        <option value="Light Brown">Light Brown</option>
                      </select>
                    </div>

                    {/* Blouse Color */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Blouse Color</label>
                      <select 
                        value={activeProduct.blouseColor}
                        onChange={(e) => updateActiveProductField('blouseColor', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="">Select Color</option>
                        <option value="Gold">Gold</option>
                        <option value="Red">Red</option>
                        <option value="Green">Green</option>
                        <option value="Mango Yellow">Mango Yellow</option>
                        <option value="Yellow">Yellow</option>
                        <option value="black">black</option>
                        <option value="Rani Pink">Rani Pink</option>
                        <option value="Lemon Yellow">Lemon Yellow</option>
                        <option value="Navy Blue">Navy Blue</option>
                        <option value="Royal Blue">Royal Blue</option>
                        <option value="Deep Green">Deep Green</option>
                        <option value="Grey">Grey</option>
                        <option value="Tussar">Tussar</option>
                        <option value="Chikku">Chikku</option>
                        <option value="Kesar Orange">Kesar Orange</option>
                        <option value="Sea Green">Sea Green</option>
                        <option value="Chocolate">Chocolate</option>
                        <option value="Mint Green">Mint Green</option>
                        <option value="Magenta">Magenta</option>
                        <option value="Violet">Violet</option>
                        <option value="Baby Pink">Baby Pink</option>
                        <option value="Light Brown">Light Brown</option>
                      </select>
                    </div>

                    {/* Border */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Border *</label>
                      <select 
                        value={activeProduct.border}
                        onChange={(e) => updateActiveProductField('border', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="Zari">Zari</option>
                        <option value="Threaded">Threaded</option>
                        <option value="Contrast">Contrast</option>
                        <option value="No Border">No Border</option>
                      </select>
                    </div>

                    {/* Design Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Design Type *</label>
                      <select 
                        value={activeProduct.blouseType}
                        onChange={(e) => updateActiveProductField('blouseType', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="Zari Woven / Printed">Zari Woven / Printed</option>
                        <option value="Printed">Printed</option>
                        <option value="Woven">Woven</option>
                        <option value="Embroidered">Embroidered</option>
                        <option value="Plain">Plain</option>
                      </select>
                    </div>

                    {/* Transparency */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Transparency *</label>
                      <select 
                        value={activeProduct.transparency}
                        onChange={(e) => updateActiveProductField('transparency', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="No">No</option>
                        <option value="Semi-Transparent">Semi-Transparent</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    {/* Occasion */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Occasion *</label>
                      <select 
                        value={activeProduct.occasion}
                        onChange={(e) => updateActiveProductField('occasion', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="Party Traditional Wedding">Party Traditional Wedding</option>
                        <option value="Festive">Festive</option>
                        <option value="Casual">Casual</option>
                        <option value="Formal">Formal</option>
                      </select>
                    </div>

                    {/* Saree Fabric */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Saree Fabric *</label>
                      <select 
                        value={activeProduct.fabric}
                        onChange={(e) => updateActiveProductField('fabric', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="Cotton Silk">Cotton Silk</option>
                        <option value="Mulberry Silk">Mulberry Silk</option>
                        <option value="Mysore Silk">Mysore Silk</option>
                        <option value="Banarasi Brocade">Banarasi Brocade</option>
                        <option value="Chanderi Weave">Chanderi Weave</option>
                        <option value="Tussar Handloom">Tussar Handloom</option>
                      </select>
                    </div>

                    {/* Saree Pattern Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Saree Pattern Type *</label>
                      <select 
                        value={activeProduct.type}
                        onChange={(e) => updateActiveProductField('type', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="Silk">Silk</option>
                        <option value="Kanjeevaram">Kanjeevaram</option>
                        <option value="Brocade">Brocade</option>
                        <option value="Lightweight">Lightweight</option>
                        <option value="Organic">Organic</option>
                      </select>
                    </div>

                    {/* Brand */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Brand *</label>
                      <select 
                        value={activeProduct.brand}
                        onChange={(e) => updateActiveProductField('brand', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-255 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        <option value="REENAT TRENDS">REENAT TRENDS</option>
                        <option value="REENAT PREMIUM">REENAT PREMIUM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Images & Description Column */}
              <div className="col-span-1 lg:col-span-4 space-y-8">
                {/* Uploaded Images card grid */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Uploaded Images</h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* Front Image */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="relative w-full aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group shadow-sm bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center">
                        {activeProduct.image ? (
                          <>
                            <img src={activeProduct.image} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => updateActiveProductField('image', '')}
                              className="absolute top-1 right-1 size-5 bg-black/75 hover:bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all shadow-md"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-blue-600 dark:text-blue-400 font-bold text-[10px] p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="text-lg">+</span>
                            <span>Add Front</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'front')} 
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        Front Image <span className="text-rose-500">*</span>
                      </span>
                      {activeProduct.image && (
                        <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer uppercase tracking-wider">
                          CHANGE
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'front')} 
                          />
                        </label>
                      )}
                    </div>

                    {/* Image 2 */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="relative w-full aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group shadow-sm bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center">
                        {activeProduct.image2 ? (
                          <>
                            <img src={activeProduct.image2} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => updateActiveProductField('image2', '')}
                              className="absolute top-1 right-1 size-5 bg-black/75 hover:bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all shadow-md"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-blue-600 dark:text-blue-400 font-bold text-[10px] p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="text-lg">+</span>
                            <span>Add Image</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'img2')} 
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Image 2</span>
                    </div>

                    {/* Image 3 */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="relative w-full aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group shadow-sm bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center">
                        {activeProduct.image3 ? (
                          <>
                            <img src={activeProduct.image3} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => updateActiveProductField('image3', '')}
                              className="absolute top-1 right-1 size-5 bg-black/75 hover:bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all shadow-md"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-blue-600 dark:text-blue-400 font-bold text-[10px] p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="text-lg">+</span>
                            <span>Add Image</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'img3')} 
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Image 3</span>
                    </div>

                    {/* Image 4 */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="relative w-full aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group shadow-sm bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center">
                        {activeProduct.image4 ? (
                          <>
                            <img src={activeProduct.image4} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => updateActiveProductField('image4', '')}
                              className="absolute top-1 right-1 size-5 bg-black/75 hover:bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all shadow-md"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-blue-600 dark:text-blue-400 font-bold text-[10px] p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="text-lg">+</span>
                            <span>Add Image</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'img4')} 
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Image 4</span>
                    </div>

                    {/* Image 5 */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="relative w-full aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group shadow-sm bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center">
                        {activeProduct.image5 ? (
                          <>
                            <img src={activeProduct.image5} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => updateActiveProductField('image5', '')}
                              className="absolute top-1 right-1 size-5 bg-black/75 hover:bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all shadow-md"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-blue-600 dark:text-blue-400 font-bold text-[10px] p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="text-lg">+</span>
                            <span>Add Image</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'img5')} 
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Image 5</span>
                    </div>

                    {/* Image 6 */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="relative w-full aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group shadow-sm bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center">
                        {activeProduct.image6 ? (
                          <>
                            <img src={activeProduct.image6} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => updateActiveProductField('image6', '')}
                              className="absolute top-1 right-1 size-5 bg-black/75 hover:bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all shadow-md"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-blue-600 dark:text-blue-400 font-bold text-[10px] p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="text-lg">+</span>
                            <span>Add Image</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'img6')} 
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Image 6</span>
                    </div>
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Description</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 cursor-pointer" title="Detailed description or saree specifications. Max 1400 characters.">ⓘ</span>
                    </label>
                  </div>
                  <textarea 
                    rows={8} 
                    required 
                    maxLength={1400}
                    value={activeProduct.desc}
                    onChange={(e) => updateActiveProductField('desc', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium leading-relaxed"
                    placeholder="Enter description here..."
                  />
                  <div className="text-right text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                    {(activeProduct.desc || '').length}/1400
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Floating Actions (No full-width white footer strip) */}
          <div className="fixed bottom-6 right-8 flex items-center gap-3 z-[9502]">
            <button 
              type="button"
              className="hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer select-none font-extrabold py-2.5 px-5 rounded-xl text-xs border"
              onClick={handleCloseDrawer}
              style={{
                color: '#ffffff',
                backgroundColor: '#1e293b',
                borderColor: '#334155'
              }}
            >
              Discard and Go Back
            </button>
            <button 
              type="button"
              className="hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer select-none font-extrabold py-2.5 px-6 rounded-xl text-xs"
              onClick={handleFormSubmit}
              style={{
                color: '#ffffff',
                backgroundColor: '#2563eb'
              }}
            >
              Submit Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
