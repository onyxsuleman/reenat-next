'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../utils/supabase';

export default function CMSConsole() {
  const { products, setProducts, refreshDatabase, showToast } = useApp();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  
  // Form Drawer Overlay state
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // null means adding new

  // Form Fields State
  const [formData, setFormData] = useState({
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
    blouseLen: '0.8',
    sareeLen: '5.5',
    blouseType: 'Contrast Blouse',
    blouseColor: '',
    color: '',
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
  });

  const [activeUploadSlot, setActiveUploadSlot] = useState('front'); // 'front', 'img2', 'img3'
  const [uploadStatus, setUploadStatus] = useState({
    front: 'CLICK TO UPLOAD',
    img2: 'CLICK TO UPLOAD',
    img3: 'CLICK TO UPLOAD',
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

  const handleOpenDrawer = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      const p = products[index];
      setFormData({
        name: p.name || '',
        price: p.price || '',
        originalPrice: p.originalPrice || '',
        type: p.type || 'Silk',
        origin: p.origin || 'India',
        desc: p.desc || '',
        gst: p.gst || '5',
        hsn: p.hsn || '500720',
        weight: p.weight || '450',
        styleId: p.styleId || '',
        blouseLen: p.blouseLen || '0.8',
        sareeLen: p.sareeLen || '5.5',
        blouseType: p.blouseType || 'Contrast Blouse',
        blouseColor: p.blouseColor || '',
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
      });
    } else {
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        type: 'Silk',
        origin: 'India',
        desc: '',
        gst: '5',
        hsn: '500720',
        weight: '450',
        styleId: `Saagar-Style-${products.length + 1}`,
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
      });
    }
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

      setFormData(prev => {
        const update = { ...prev };
        if (slot === 'front') update.image = publicUrl;
        if (slot === 'img2') update.image2 = publicUrl;
        if (slot === 'img3') update.image3 = publicUrl;
        return update;
      });

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
        setFormData(prev => {
          const update = { ...prev };
          if (slot === 'front') update.image = dataUrl;
          if (slot === 'img2') update.image2 = dataUrl;
          if (slot === 'img3') update.image3 = dataUrl;
          return update;
        });
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
      const formattedProduct = {
        ...formData,
        id: editingIndex !== null ? products[editingIndex].id : Date.now(),
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        weight: Number(formData.weight),
        rating: editingIndex !== null ? products[editingIndex].rating : 4.5,
        isLocal: true
      };

      let updatedProducts = [...products];

      if (editingIndex !== null) {
        updatedProducts[editingIndex] = formattedProduct;
      } else {
        updatedProducts.push(formattedProduct);
      }

      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      // Save/update in Supabase as well
      try {
        const dbRow = {
          name: formattedProduct.name,
          price: formattedProduct.price,
          originalprice: formattedProduct.originalPrice,
          type: formattedProduct.type,
          origin: formattedProduct.origin,
          desc: formattedProduct.desc,
          gst: formattedProduct.gst,
          hsn: formattedProduct.hsn,
          weight: formattedProduct.weight,
          styleid: formattedProduct.styleId,
          blouselen: formattedProduct.blouseLen,
          sareelen: formattedProduct.sareeLen,
          blousetype: formattedProduct.blouseType,
          blousecolor: formattedProduct.blouseColor,
          color: formattedProduct.color,
          transparency: formattedProduct.transparency,
          qty: formattedProduct.qty,
          fabric: formattedProduct.fabric,
          border: formattedProduct.border,
          occasion: formattedProduct.occasion,
          loom: formattedProduct.loom,
          brand: formattedProduct.brand,
          image: formattedProduct.image,
          image2: formattedProduct.image2,
          image3: formattedProduct.image3,
          rating: formattedProduct.rating
        };

        let dbError = false;
        if (editingIndex !== null) {
          const { error } = await supabase.from('products').update(dbRow).eq('name', formattedProduct.name);
          if (error) {
            console.error("Database update error:", error);
            dbError = true;
          }
        } else {
          const { error } = await supabase.from('products').insert(dbRow);
          if (error) {
            console.error("Database insert error:", error);
            dbError = true;
          }
        }

        if (!dbError) {
          // If sync succeeded, remove the isLocal flag from state and localStorage
          const syncedProduct = { ...formattedProduct };
          delete syncedProduct.isLocal;
          
          const finalProducts = [...products];
          if (editingIndex !== null) {
            finalProducts[editingIndex] = syncedProduct;
          } else {
            finalProducts.push(syncedProduct);
          }
          setProducts(finalProducts);
          localStorage.setItem('products', JSON.stringify(finalProducts));
        }
      } catch (dbErr) {
        console.warn("Could not sync with live database:", dbErr);
      }

      alert("successfully uploaded");
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
      localStorage.setItem('products', JSON.stringify(updated));

      try {
        await supabase.from('products').delete().eq('name', itemToDelete.name);
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
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">{item.name}</td>
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
        <div className="fixed inset-0 w-screen h-screen bg-slate-50 dark:bg-slate-900 z-[9501] flex flex-col overflow-hidden text-slate-800 dark:text-white">
          <div className="px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 shrink-0">
            <div 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer select-none text-xs font-semibold uppercase tracking-wider" 
              onClick={handleCloseDrawer}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span>Back to Console</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                <img src={formData.image || "/saree_kanjivaram.png"} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-800 dark:text-white truncate">
                  {editingIndex !== null ? 'Configure Saree Details' : 'Add New Saree to Catalog'}
                </h2>
                <p className="text-xs text-slate-405 font-medium">Style ID: {formData.styleId || 'N/A'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 dark:bg-slate-900">
            {/* Left Specs Form */}
            <div className="col-span-1 lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-250/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  Price, Size and Inventory
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">GST (%)</label>
                    <select 
                      value={formData.gst}
                      onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    >
                      <option value="5">5</option>
                      <option value="12">12</option>
                      <option value="18">18</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">HSN Code</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.hsn}
                      onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Net Weight (gms)</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Style Code / Product ID</label>
                    <input 
                      type="text" 
                      value={formData.styleId}
                      onChange={(e) => setFormData({ ...formData, styleId: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Saree Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Weave Type *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Cluster / Origin *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Brand *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Selling Price (₹) *</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Original Price (₹) *</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Weave Description *</label>
                  <textarea 
                    rows={4} 
                    required 
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Images & Save Column */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-250/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  Media & Hosting
                </h3>
                
                {/* Front Image */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-600 dark:text-slate-400">Front Image</span>
                  <div className="flex items-center gap-3">
                    <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border">
                      <img src={formData.image || "/saree_kanjivaram.png"} className="w-full h-full object-cover" />
                    </div>
                    <label className="bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer shadow-sm">
                      {uploadStatus.front}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'front')} 
                      />
                    </label>
                  </div>
                </div>

                {/* Detail Image 2 */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-600 dark:text-slate-400">Detail Image 2</span>
                  <div className="flex items-center gap-3">
                    <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border">
                      <img src={formData.image2 || "/saree_kanjivaram.png"} className="w-full h-full object-cover" />
                    </div>
                    <label className="bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer shadow-sm">
                      {uploadStatus.img2}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'img2')} 
                      />
                    </label>
                  </div>
                </div>

                {/* Detail Image 3 */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-600 dark:text-slate-400">Detail Image 3</span>
                  <div className="flex items-center gap-3">
                    <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border">
                      <img src={formData.image3 || "/saree_kanjivaram.png"} className="w-full h-full object-cover" />
                    </div>
                    <label className="bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer shadow-sm">
                      {uploadStatus.img3}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'img3')} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Triggers */}
              <button 
                type="submit"
                className="w-full bg-[#F1BF0A] hover:bg-yellow-500 text-slate-900 font-bold py-3 px-6 rounded-full transition-transform active:scale-95 cursor-pointer shadow-md text-sm"
              >
                Save Saree Configuration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
