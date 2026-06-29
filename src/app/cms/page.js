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

  // Calculate Metrics
  const totalSarees = products.length;
  const avgPrice = totalSarees > 0 
    ? Math.round(products.reduce((sum, p) => sum + (p.price || 0), 0) / totalSarees) 
    : 0;

  return (
    <div className="space-y-8 py-6 text-slate-800 dark:text-white">
      {/* CMS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#d9a05b] font-bold">Catalog Administrator</span>
          <h1 className="text-4xl font-anton text-slate-850 dark:text-white mt-1">SAREE DATABASE CONSOLE</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenDrawer(null)}
            className="bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-full text-xs transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Add New Saree</span>
          </button>
          <button 
            onClick={confirmReset}
            className="bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold py-2 px-4 rounded-full text-xs border border-rose-200 dark:border-rose-900/30 transition-transform active:scale-95 cursor-pointer"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-5 rounded-3xl glass shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Catalog Items</span>
            <span className="text-3xl font-anton text-slate-800 dark:text-white">{totalSarees}</span>
          </div>
          <span className="text-2xl">👘</span>
        </div>
        <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-5 rounded-3xl glass shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Price</span>
            <span className="text-3xl font-anton text-slate-800 dark:text-white">₹{avgPrice.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-2xl">💰</span>
        </div>
        <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-5 rounded-3xl glass shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Availability Status</span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-2 block">100% In Stock</span>
          </div>
          <span className="text-2xl">✓</span>
        </div>
      </div>

      {/* Saree List */}
      <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 rounded-3xl glass shadow-md overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Inventory List</h3>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full font-bold">Dynamic CRUD Enabled</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse text-slate-800 dark:text-slate-100">
            <thead>
              <tr className="bg-slate-50 dark:bg-black/20 border-b border-black/5 dark:border-white/5 font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 w-20">Saree</th>
                <th className="p-4">Name</th>
                <th className="p-4">Weave Type</th>
                <th className="p-4">Cluster / Origin</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {products.map((item, i) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 text-center font-bold">{i + 1}</td>
                  <td className="p-4">
                    <img src={item.image} alt={item.name} className="size-10 object-cover rounded-lg border border-black/5" />
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      ID: {item.productId} | SKU: {item.skuId}
                    </div>
                  </td>
                  <td className="p-4">{item.type}</td>
                  <td className="p-4">{item.origin}</td>
                  <td className="p-4 text-right font-bold">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-center space-x-2">
                    <button 
                      onClick={() => handleOpenDrawer(i)}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-[10px]"
                    >
                      Configure
                    </button>
                    <button 
                      onClick={() => deleteSaree(i)}
                      className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-500 font-semibold py-1.5 px-3 rounded-lg border border-rose-200/50 dark:border-rose-900/30 transition-colors cursor-pointer text-[10px]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
