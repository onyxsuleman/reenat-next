'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export default function Account() {
  const router = useRouter();
  const { userSession, handleLogout, handleLogin, wishlist, addToCart, toggleWishlist, showToast } = useApp();
  
  // Dashboard state variables
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activePopup, setActivePopup] = useState(null); // 'profile' | 'orders' | 'wishlist' | 'addresses' | 'wallet'
  
  // Profile edit states
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Addresses states
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null); // null or address object being created/edited
  const [addrType, setAddrType] = useState('Home');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');

  // Wallet states
  const [walletBalance, setWalletBalance] = useState(500);
  const [walletLedger, setWalletLedger] = useState([]);
  const [customRecharge, setCustomRecharge] = useState('');

  // Return form states
  const [returningOrder, setReturningOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Handloom Texture Issue');

  // Verify hydration and session
  useEffect(() => {
    const stored = localStorage.getItem('userSession');
    if (!stored && !userSession) {
      router.push('/login');
    }
  }, [userSession]);

  // Load orders from Supabase / API
  useEffect(() => {
    async function fetchOrders() {
      if (!userSession) return;
      try {
        setIsLoadingOrders(true);
        // Search by both email and phone for robust retrieval
        const emailParam = userSession.email ? `email=${encodeURIComponent(userSession.email)}` : '';
        const phoneParam = userSession.phone ? `phone=${encodeURIComponent(userSession.phone)}` : '';
        const query = [emailParam, phoneParam].filter(Boolean).join('&');

        const response = await fetch(`/api/orders?${query}`);
        const data = await response.json();

        if (response.ok && data && !data.error) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [userSession]);

  // Initialize Profile form inputs
  useEffect(() => {
    if (userSession) {
      setEditUsername(userSession.username || '');
      setEditPhone(userSession.phone || '');
    }
  }, [userSession, activePopup]);

  // Address book management: Load addresses from localStorage or Fastrr user session
  useEffect(() => {
    if (!userSession) return;
    const cacheKey = `addresses_${userSession.uid || userSession.phone || userSession.email}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAddresses(JSON.parse(cached));
    } else {
      // Setup initial address from Fastrr profile if available
      const fastrrAddr = userSession.address || {};
      const defaultAddr = [
        {
          id: 'def-1',
          type: 'Home',
          name: userSession.username || 'Recipient Name',
          phone: userSession.phone || '',
          line1: fastrrAddr.line1 || 'Main Street',
          line2: fastrrAddr.line2 || '',
          city: fastrrAddr.city || 'Mumbai',
          state: fastrrAddr.state || 'Maharashtra',
          pincode: fastrrAddr.pincode || '400001',
          isDefault: true
        }
      ];
      setAddresses(defaultAddr);
      localStorage.setItem(cacheKey, JSON.stringify(defaultAddr));
    }
  }, [userSession]);

  // Self-healing wallet calculations linked with orders & sign-up
  useEffect(() => {
    if (!userSession) return;
    const balanceKey = `wallet_balance_${userSession.uid || userSession.email}`;
    const ledgerKey = `wallet_ledger_${userSession.uid || userSession.email}`;

    const storedBalance = localStorage.getItem(balanceKey);
    const storedLedger = localStorage.getItem(ledgerKey);

    let balance = storedBalance ? parseFloat(storedBalance) : 500;
    let ledger = storedLedger ? JSON.parse(storedLedger) : [
      { id: 'welcome', type: 'Credit', amount: 500, description: 'Welcome Sign-up Bonus', date: new Date().toISOString() }
    ];

    let updated = false;
    // Credit 10% cashback dynamically for orders placed
    orders.forEach(order => {
      const txId = `cashback_${order.id}`;
      const exists = ledger.some(tx => tx.id === txId);
      if (!exists) {
        const cashback = Math.round(order.total * 0.10);
        ledger.push({
          id: txId,
          type: 'Credit',
          amount: cashback,
          description: `10% Cashback on Order #RT-${order.id}`,
          date: order.created_at || new Date().toISOString()
        });
        balance += cashback;
        updated = true;
      }
    });

    if (updated || !storedBalance) {
      localStorage.setItem(balanceKey, balance.toString());
      localStorage.setItem(ledgerKey, JSON.stringify(ledger));
    }
    setWalletBalance(balance);
    setWalletLedger(ledger);
  }, [orders, userSession]);

  if (!userSession) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        <p className="font-medium animate-pulse text-lg">Verifying your profile credentials…</p>
      </div>
    );
  }

  // Address Actions
  const handleSaveAddress = (e) => {
    e.preventDefault();
    const cacheKey = `addresses_${userSession.uid || userSession.email}`;
    let newAddresses;

    const addressObj = {
      id: editingAddress?.id || `addr_${Date.now()}`,
      type: addrType,
      name: addrName,
      phone: addrPhone,
      line1: addrLine1,
      line2: addrLine2,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: editingAddress ? editingAddress.isDefault : false
    };

    if (editingAddress?.id) {
      // Edit
      newAddresses = addresses.map(addr => addr.id === editingAddress.id ? addressObj : addr);
      showToast('Address updated successfully.', 'success');
    } else {
      // Create new
      newAddresses = [...addresses, addressObj];
      // Set as default if it is the first one
      if (newAddresses.length === 1) {
        newAddresses[0].isDefault = true;
      }
      showToast('New address saved.', 'success');
    }

    setAddresses(newAddresses);
    localStorage.setItem(cacheKey, JSON.stringify(newAddresses));
    setEditingAddress(null);
  };

  const handleSetDefaultAddress = (id) => {
    const cacheKey = `addresses_${userSession.uid || userSession.email}`;
    const newAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    setAddresses(newAddresses);
    localStorage.setItem(cacheKey, JSON.stringify(newAddresses));
    showToast('Default delivery address updated.', 'success');
  };

  const handleDeleteAddress = (id) => {
    const cacheKey = `addresses_${userSession.uid || userSession.email}`;
    const toDelete = addresses.find(addr => addr.id === id);
    if (toDelete?.isDefault && addresses.length > 1) {
      showToast('Please set another address as default before deleting.', 'warning');
      return;
    }
    const newAddresses = addresses.filter(addr => addr.id !== id);
    setAddresses(newAddresses);
    localStorage.setItem(cacheKey, JSON.stringify(newAddresses));
    showToast('Address removed.', 'info');
  };

  const openAddressForm = (addr = null) => {
    if (addr) {
      setEditingAddress(addr);
      setAddrType(addr.type);
      setAddrName(addr.name);
      setAddrPhone(addr.phone);
      setAddrLine1(addr.line1);
      setAddrLine2(addr.line2);
      setAddrCity(addr.city);
      setAddrState(addr.state);
      setAddrPincode(addr.pincode);
    } else {
      setEditingAddress({ id: '' });
      setAddrType('Home');
      setAddrName(userSession.username || '');
      setAddrPhone(userSession.phone || '');
      setAddrLine1('');
      setAddrLine2('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
    }
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editUsername) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }

    const updatedUser = {
      ...userSession,
      username: editUsername,
      phone: editPhone
    };
    
    // Save locally
    handleLogin(updatedUser);
    
    showToast('Profile updated successfully!', 'success');
    setActivePopup(null);
  };

  // Wallet Actions
  const handleWalletRecharge = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Please enter a valid amount.', 'warning');
      return;
    }

    const balanceKey = `wallet_balance_${userSession.uid || userSession.email}`;
    const ledgerKey = `wallet_ledger_${userSession.uid || userSession.email}`;

    const newBalance = walletBalance + numericAmount;
    const newLedger = [
      ...walletLedger,
      {
        id: `recharge_${Date.now()}`,
        type: 'Credit',
        amount: numericAmount,
        description: 'Simulated Wallet Recharge',
        date: new Date().toISOString()
      }
    ];

    setWalletBalance(newBalance);
    setWalletLedger(newLedger);
    localStorage.setItem(balanceKey, newBalance.toString());
    localStorage.setItem(ledgerKey, JSON.stringify(newLedger));
    setCustomRecharge('');
    showToast(`Successfully credited ₹${numericAmount.toLocaleString('en-IN')} to wallet!`, 'success');
  };

  // Return Saree Request Action
  const handleReturnSareeSubmit = async (e) => {
    e.preventDefault();
    if (!returningOrder) return;
    
    try {
      showToast('Initiating return request...', 'info');
      
      const response = await fetch('/api/cms/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          table: 'return_orders',
          data: {
            order_id: returningOrder.id,
            reason: returnReason,
            status: 'Requested',
            created_at: new Date().toISOString()
          }
        })
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        throw new Error(resData.error || 'Database write failed');
      }

      showToast(`Return requested for Order #RT-${returningOrder.id}!`, 'success');
      setReturningOrder(null);
    } catch (err) {
      console.error("Return order insert failed:", err);
      showToast("Could not submit request. Please try again later.", "error");
    }
  };

  // Compute display name and initial cleanly
  const rawName = (userSession.username && !userSession.username.startsWith('Customer ') && !userSession.username.startsWith('FASTRR-')) 
    ? userSession.username 
    : (userSession.address?.name || (userSession.email ? userSession.email.split('@')[0] : 'Store Customer'));
  const displayName = rawName.toUpperCase();
  const initial = rawName ? rawName.charAt(0).toUpperCase() : 'U';

  const defaultAddressObj = addresses.find(addr => addr.isDefault) || addresses[0];
  const fastrrAddr = userSession.address || {};

  const displayPrimaryAddress = defaultAddressObj
    ? [defaultAddressObj.line1, defaultAddressObj.city].filter(Boolean).join(', ')
    : (fastrrAddr.line1 ? [fastrrAddr.line1, fastrrAddr.city].filter(Boolean).join(', ') : 'None Saved');

  return (
    <main className="max-w-5xl mx-auto w-full flex-1 py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Profile overview panel */}
        <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-md space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="size-20 rounded-full bg-gradient-to-br from-[#183fad] to-indigo-650 text-white flex items-center justify-center text-3xl font-anton shadow-md select-none">
              <span>{initial}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                {displayName}
              </h2>
              {userSession.email && !userSession.email.includes('@reenattrends.com') && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{userSession.email}</p>
              )}
              {userSession.phone && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Phone: +91 {userSession.phone.replace('+91', '')}</p>
              )}
              <div className="mt-2 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full select-none">
                  <svg className="w-3 h-3 fill-emerald-500" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span>Fastrr Verified Mobile</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-black/5 dark:border-white/5 pt-4 space-y-3 text-sm text-slate-600 dark:text-slate-350">
            <div className="flex justify-between">
              <span className="font-medium">Member Since</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {userSession.joinedDate || 'August 2026'}
              </span>
            </div>
            <div className="flex justify-between pb-3">
              <span className="font-medium">Primary Address</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]" title={displayPrimaryAddress}>
                {displayPrimaryAddress}
              </span>
            </div>
            <button 
              onClick={() => { handleLogout(); router.push('/login'); }}
              className="w-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-450 font-semibold py-2 px-4 rounded-xl border border-rose-200/50 dark:border-rose-900/30 transition-transform active:scale-95 cursor-pointer text-center text-xs flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Side: Action Dashboard Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Card 1: Orders */}
          <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider font-anton">My Orders</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track shipments, view order details, print bills, and initiate return requests.</p>
            </div>
            <button 
              onClick={() => setActivePopup('orders')}
              className="w-full bg-[#183fad] text-white hover:bg-blue-800 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold py-2 px-4 rounded-xl transition-all text-xs cursor-pointer text-center font-bold"
            >
              View Purchases ({orders.length})
            </button>
          </div>

          {/* Card 2: Address Book */}
          <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider font-anton">Saved Addresses</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Save and edit multiple billing and delivery addresses for quick checkouts.</p>
            </div>
            <button 
              onClick={() => setActivePopup('addresses')}
              className="w-full bg-[#183fad] text-white hover:bg-blue-800 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold py-2 px-4 rounded-xl transition-all text-xs cursor-pointer text-center font-bold"
            >
              Address Book ({addresses.length})
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL WRAPPERS */}

      {/* 1. Profile details popup */}
      {activePopup === 'profile' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9500] flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#0c1e44]/95 text-slate-800 dark:text-white max-w-md w-full rounded-3xl shadow-2xl glass border border-white/20 dark:border-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setActivePopup(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer font-bold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
            <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-anton text-slate-805 dark:text-white uppercase tracking-wider">Update Profile Info</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Save edits to update display settings across the storefront checkout actions.</p>
              <hr className="border-slate-200 dark:border-slate-800" />
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                  <input type="text" required value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Contact Phone</label>
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="e.g. 9876543210" className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl border border-[#183fad] transition-transform active:scale-[0.98] shadow-md cursor-pointer mt-4 text-xs">Save Profile Details</button>
            </form>
          </div>
        </div>
      )}

      {activePopup === 'orders' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9500] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1e44] text-slate-800 dark:text-white max-w-3xl w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <button onClick={() => setActivePopup(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer font-bold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
            
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-4">
              <h3 className="text-xl font-anton text-slate-800 dark:text-white uppercase tracking-wider">Purchase History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">View recent orders, current shipping details, logistics tracking status, and initiate returns.</p>
              <hr className="border-slate-200 dark:border-slate-800" />
              
              <div className="space-y-6">
                {isLoadingOrders ? (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading orders…</div>
                ) : orders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/20 dark:bg-black/10 rounded-2xl border border-black/5 dark:border-white/5 font-medium">No order logs found for this account.</div>
                ) : (
                  orders.map(order => {
                    const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
                    return (
                      <div key={order.id} className="p-4 bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="font-semibold text-sm text-slate-850 dark:text-white">Order #RT-{order.id}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">Placed on {dateStr}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">₹{Math.round(order.total).toLocaleString('en-IN')}</span>
                            <strong className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              order.order_status === 'Pending' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' :
                              order.order_status === 'Shipped' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' :
                              'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450'
                            }`}>
                              {order.order_status}
                            </strong>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="flex flex-wrap gap-2.5 border-t border-black/5 dark:border-white/5 pt-2">
                          {Array.isArray(order.items) && order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/40 dark:bg-black/20 p-1.5 rounded-xl border border-black/5 dark:border-white/5 flex-1 min-w-[180px] max-w-xs">
                              <img src={item.image} className="size-10 object-cover rounded-lg border border-black/5 dark:border-white/5" alt="" />
                              <div className="text-[10px] min-w-0 flex-1">
                                <div className="font-bold truncate text-slate-800 dark:text-white">{item.name}</div>
                                <div className="text-slate-500 dark:text-slate-400">₹{item.price.toLocaleString('en-IN')} x {item.qty}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Shiprocket Logistics tracking */}
                        {order.tracking_number && (
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl p-2.5 text-[10px] text-indigo-650 dark:text-indigo-350 border border-indigo-150/20 dark:border-indigo-900/10 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              Shipment Track: <span className="font-bold">{order.carrier_name}</span> - ID: <span className="font-mono font-bold select-all">{order.tracking_number}</span>
                            </div>
                            {order.tracking_url && (
                              <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="bg-[#183fad] hover:bg-blue-800 text-white font-bold py-1 px-2.5 rounded-lg transition-colors text-[9px]">
                                Track Live Link
                              </a>
                            )}
                          </div>
                        )}

                        {/* Actions: Return flow */}
                        {order.order_status === 'Delivered' && (
                          <div className="flex justify-end pt-1">
                            <button 
                              onClick={() => setReturningOrder(order)}
                              className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/20 font-bold py-1.5 px-3.5 rounded-xl text-[10px] transition-all cursor-pointer"
                            >
                              Return Items / Order Exchange
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.1 Return request modal */}
      {returningOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9800] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1e44] text-slate-800 dark:text-white max-w-sm w-full rounded-3xl shadow-2xl p-6 relative border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setReturningOrder(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer font-bold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
            <form onSubmit={handleReturnSareeSubmit} className="space-y-4">
              <h4 className="text-base font-anton uppercase tracking-wide text-rose-600 dark:text-rose-400">Request Return / Exchange</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Please provide a reason to request reverse pickup for Order #RT-{returningOrder.id}.</p>
              <hr className="border-slate-200 dark:border-slate-800" />
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Reason for Return</label>
                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]">
                  <option value="Handloom Texture Issue">Handloom Texture / Weaving Imperfection</option>
                  <option value="Color Discrepancy">Color Discrepancy (Doesn't match photo)</option>
                  <option value="Damage on Arrival">Fabric damage/tear on arrival</option>
                  <option value="Incorrect Saree Received">Incorrect saree pattern delivered</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs cursor-pointer">Submit Return Request</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Wishlist popup overlay */}
      {activePopup === 'wishlist' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9500] flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#0c1e44]/95 text-slate-800 dark:text-white max-w-2xl w-full rounded-3xl shadow-2xl glass border border-white/20 dark:border-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <button onClick={() => setActivePopup(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer font-bold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
            
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-4">
              <h3 className="text-xl font-anton text-slate-800 dark:text-white uppercase tracking-wider">My Saved Wishlist</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Review wishlisted products and add them directly to your active shopping cart.</p>
              <hr className="border-slate-200 dark:border-slate-800" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlist.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">Your wishlist is empty. Browse sarees to save items.</div>
                ) : (
                  wishlist.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl">
                      <img src={product.image} className="size-16 object-cover rounded-xl border border-black/5 dark:border-white/5 shadow-sm" alt="" />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-bold truncate text-slate-850 dark:text-white">{product.name}</div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5">₹{product.price.toLocaleString('en-IN')}</div>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => { addToCart(product); toggleWishlist(product); }}
                            className="bg-[#183fad] hover:bg-blue-800 text-white font-bold py-1 px-2.5 rounded-lg text-[9px] cursor-pointer"
                          >
                            Move to Cart
                          </button>
                          <button 
                            onClick={() => toggleWishlist(product)}
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/20 font-bold py-1 px-2.5 rounded-lg text-[9px] cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Address Book popup */}
      {activePopup === 'addresses' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9500] flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#0c1e44]/95 text-slate-800 dark:text-white max-w-2xl w-full rounded-3xl shadow-2xl glass border border-white/20 dark:border-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <button onClick={() => { setActivePopup(null); setEditingAddress(null); }} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer font-bold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
            
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-4">
              <h3 className="text-xl font-anton text-slate-800 dark:text-white uppercase tracking-wider">My Address Book</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Save and edit multiple billing and delivery addresses for quick checkouts.</p>
              <hr className="border-slate-200 dark:border-slate-800" />
              
              {!editingAddress ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button onClick={() => openAddressForm()} className="bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-1.5 px-3.5 rounded-xl text-xs cursor-pointer">
                      + Add New Address
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`p-4 bg-white/40 dark:bg-black/20 border rounded-2xl flex flex-col justify-between gap-3 text-xs leading-relaxed relative ${addr.isDefault ? 'border-[#F1BF0A] bg-amber-50/5 dark:bg-amber-950/5 shadow-sm' : 'border-black/5 dark:border-white/5'}`}>
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 text-[9px] font-bold text-[#F1BF0A] uppercase tracking-wider flex items-center gap-0.5">
                            ★ Primary
                          </span>
                        )}
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                            <span>{addr.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[8px] font-bold tracking-widest">{addr.type}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400">Phone: {addr.phone}</p>
                          <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                          <p>{addr.city}, {addr.state} - <span className="font-mono font-semibold">{addr.pincode}</span></p>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[10px] text-[#183fad] dark:text-[#F1BF0A] hover:underline font-bold bg-transparent border-0 cursor-pointer">
                              Set Default
                            </button>
                          )}
                          <button onClick={() => openAddressForm(addr)} className="text-[10px] text-slate-500 dark:text-slate-400 hover:underline font-bold bg-transparent border-0 cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] text-rose-500 hover:underline font-bold bg-transparent border-0 cursor-pointer ml-auto">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveAddress} className="space-y-4 text-xs text-slate-800 dark:text-white">
                  <div className="flex items-center justify-between">
                    <h4 className="font-anton uppercase tracking-wide text-slate-800 dark:text-white">{editingAddress.id ? 'Edit Address Profile' : 'Add New Shipping Address'}</h4>
                    <button type="button" onClick={() => setEditingAddress(null)} className="text-xs text-slate-500 dark:text-slate-400 hover:underline font-bold bg-transparent border-0 cursor-pointer">
                      Cancel & Go Back
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Address Label</label>
                      <select value={addrType} onChange={(e) => setAddrType(e.target.value)} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]">
                        <option value="Home">Home (Delivery all day)</option>
                        <option value="Office">Office/Work (Delivery 9 AM - 5 PM)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Recipient Full Name</label>
                      <input type="text" required value={addrName} onChange={(e) => setAddrName(e.target.value)} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Contact Phone (10 Digits)</label>
                      <input type="tel" required maxLength={10} value={addrPhone} onChange={(e) => setAddrPhone(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Pin Code (6 Digits)</label>
                      <input type="text" required maxLength={6} placeholder="e.g. 631501" value={addrPincode} onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Flat / House No / Shipping Line 1</label>
                      <input type="text" required value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Area / Street / Shipping Line 2 (Optional)</label>
                      <input type="text" value={addrLine2} onChange={(e) => setAddrLine2(e.target.value)} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Town / City</label>
                      <input type="text" required value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">State / Province</label>
                      <input type="text" required value={addrState} onChange={(e) => setAddrState(e.target.value)} className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl border border-[#183fad] transition-transform active:scale-[0.98] shadow-md cursor-pointer mt-4 text-xs">Save Address details</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Wallet Ledger popup */}
      {activePopup === 'wallet' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9500] flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#0c1e44]/95 text-slate-800 dark:text-white max-w-2xl w-full rounded-3xl shadow-2xl glass border border-white/20 dark:border-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <button onClick={() => setActivePopup(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer font-bold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
            
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-5">
              <div className="flex items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-3">
                <h3 className="text-xl font-anton text-slate-800 dark:text-white uppercase tracking-wider">Wallet Dashboard</h3>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase">Wallet Balance</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-405 block">₹{walletBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              {/* Simulated Recharge Section */}
              <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-3">
                <h4 className="text-xs font-anton uppercase tracking-wider text-slate-800 dark:text-white">Simulated Wallet Recharge</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Recharging simulated credits adds instant balance to test cart payment options.</p>
                <div className="flex gap-2">
                  <button onClick={() => handleWalletRecharge(500)} className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex-1">
                    + ₹500
                  </button>
                  <button onClick={() => handleWalletRecharge(1000)} className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex-1">
                    + ₹1,000
                  </button>
                  <button onClick={() => handleWalletRecharge(2000)} className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex-1">
                    + ₹2,000
                  </button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Enter custom amount" 
                    value={customRecharge}
                    onChange={(e) => setCustomRecharge(e.target.value)}
                    className="flex-1 bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                  />
                  <button onClick={() => handleWalletRecharge(customRecharge)} className="bg-[#183fad] hover:bg-blue-800 text-white font-semibold px-4 py-1.5 rounded-xl text-xs cursor-pointer">
                    Apply Recharge
                  </button>
                </div>
              </div>

              {/* Ledger Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-anton uppercase tracking-wider text-slate-800 dark:text-white">Transaction History Ledger</h4>
                <div className="border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-[10px] text-left text-slate-800 dark:text-slate-200 leading-normal border-collapse bg-white/40 dark:bg-black/10">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[8px] border-b border-black/5 dark:border-white/5">
                        <th className="p-3">Transaction</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {walletLedger.slice().reverse().map((tx, i) => {
                        const dateStr = new Date(tx.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        return (
                          <tr key={tx.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="p-3 font-semibold text-slate-850 dark:text-white">
                              {tx.description}
                            </td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{dateStr}</td>
                            <td className={`p-3 text-right font-bold text-xs ${tx.type === 'Credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                              {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}
