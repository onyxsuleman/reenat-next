'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import SafeImage from '../../components/SafeImage';
import { getMetaBrowserData, trackMetaPixel } from '../../utils/metaPixel';

export default function Cart() {
  const router = useRouter();
  const { cart, updateCartQty, removeFromCart, showToast, userSession, isProductPaused, isCatalogPaused } = useApp();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // e.g. 0.1 for 10%
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  // Payment method is fixed to COD in the fallback form. "Pay Online" requires a real gateway.
  const paymentMethod = 'Cash on Delivery';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    if (userSession) {
      setEmail(userSession.email || '');
      setFullName(userSession.username || '');
      
      const cacheKey = `addresses_${userSession.uid || userSession.email}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const addrList = JSON.parse(cached);
          setSavedAddresses(addrList);
          const defaultAddr = addrList.find(addr => addr.isDefault) || addrList[0];
          if (defaultAddr) {
            setFullName(defaultAddr.name || '');
            setPhone(defaultAddr.phone || '');
            setAddress(defaultAddr.line1 ? `${defaultAddr.line1}${defaultAddr.line2 ? `, ${defaultAddr.line2}` : ''}` : '');
            setCity(defaultAddr.city || '');
            setState(defaultAddr.state || '');
            setPincode(defaultAddr.pincode || '');
          }
        } catch (e) {
          console.warn("Could not parse cached address book:", e);
        }
      }
    }
  }, [userSession, showCheckoutForm]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  const taxRate = 0.08; // 8% sales tax
  const tax = subtotal * taxRate;
  const discountAmount = subtotal * appliedDiscount;
  const total = subtotal + tax - discountAmount;

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setAppliedDiscount(0.10);
      showToast('Promo code applied: 10% discount!', 'success');
    } else if (code === '') {
      showToast('Please enter a promo code.', 'info');
    } else {
      showToast('Invalid promo code.', 'info');
    }
  };

  const handleClearCart = () => {
    if (cart.length > 0) {
      cart.forEach(item => {
        removeFromCart(item.id);
      });
      localStorage.setItem('cart', JSON.stringify([]));
      window.location.reload(); // Quick reset
    }
  };

  const handleCheckout = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty!', 'info');
      return;
    }

    const hasPausedItems = cart.some(item => isProductPaused ? (isProductPaused(item) || isCatalogPaused(item.catalogId)) : false);
    if (hasPausedItems) {
      showToast('Some items in your cart are currently paused/unavailable. Please remove them to proceed.', 'error');
      return;
    }

    try {
      showToast('Connecting to secure checkout...', 'info');
      
      const response = await fetch('/api/checkout/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cart,
          customer: userSession ? {
            email: userSession.email || '',
            phone: userSession.phone || '',
            name: userSession.username || ''
          } : null
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to initialize checkout token.');
      }

      // Track Meta Pixel InitiateCheckout & AddPaymentInfo with server-matched eventIDs
      const pixelCustomData = {
        content_ids: cart.map(item => String(item.id)),
        content_type: 'product',
        value: Number(subtotal || 0),
        currency: 'INR',
        num_items: cart.reduce((acc, item) => acc + (item.qty || 1), 0)
      };

      trackMetaPixel('InitiateCheckout', pixelCustomData, resData.initCheckoutEventId || `init_checkout_${Date.now()}`);
      trackMetaPixel('AddPaymentInfo', pixelCustomData, resData.addPaymentEventId || `add_payment_${Date.now()}`);

      // Extract token (usually found in access_token or token property)
      const token = resData.result?.token || resData.token || resData.access_token || resData.data?.token;

      if (!token) {
        throw new Error('Invalid token response from server.');
      }

      // --- 1.3 SDK readiness guard (cart page) ---
      // Poll for up to 6 seconds (60 × 100ms). Doubled from 3s to handle slow mobile
      // connections and cases where the user taps Checkout before afterInteractive fires.
      const waitForFastrr = () => new Promise((resolve) => {
        if (window.HeadlessCheckout) { resolve(true); return; }
        let attempts = 0;
        const poll = setInterval(() => {
          attempts++;
          if (window.HeadlessCheckout || attempts >= 60) {
            clearInterval(poll);
            resolve(!!window.HeadlessCheckout);
          }
        }, 100);
      });
      const sdkReady = await waitForFastrr();
      if (sdkReady && window.HeadlessCheckout) {
        window.HeadlessCheckout.addToCart(e, token, {
          fallbackUrl: window.location.href
        });
      } else {
        throw new Error('Fastrr Headless SDK not available — opening manual checkout instead.');
      }
    } catch (err) {
      console.error('Fastrr initialization error:', err);
      // --- 1.4 Cart page fallback ---
      // Never leave the user stuck. Auto-open the built-in manual checkout form
      // so they can complete their order even if Fastrr fails to load.
      showToast('Opening checkout form…', 'info');
      setTimeout(() => setShowCheckoutForm(true), 800);
    }
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !address || !city || !state || !pincode) {
      showToast('Please fill in all address fields (including City, State, and Pincode).', 'warning');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit phone number.', 'warning');
      return;
    }

    if (pincode.replace(/\D/g, '').length !== 6) {
      showToast('Please enter a valid 6-digit delivery pincode.', 'warning');
      return;
    }

    setIsSubmitting(true);
    showToast('Creating order in database...', 'info');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          cart,
          promoCode,
          paymentMethod,
          browserMeta: getMetaBrowserData()
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        showToast(resData.error || 'Checkout failed. Please try again.', 'error');
      } else {
        const pixelCustomData = {
          content_ids: cart.map(item => String(item.id)),
          content_type: 'product',
          value: Number(subtotal || 0),
          currency: 'INR',
          num_items: cart.reduce((acc, item) => acc + (item.qty || 1), 0)
        };

        const addPaymentEventId = resData.addPaymentEventId || (resData.order?.id ? `add_payment_${resData.order.id}` : `add_payment_${Date.now()}`);
        const purchaseEventId = resData.eventId || (resData.order?.id ? `purchase_${resData.order.id}` : `purchase_${Date.now()}`);

        trackMetaPixel('AddPaymentInfo', pixelCustomData, addPaymentEventId);
        trackMetaPixel('Purchase', pixelCustomData, purchaseEventId);

        // Clear cart
        localStorage.setItem('cart', JSON.stringify([]));
        showToast('Order placed successfully!', 'success');
        
        // Wait 1.5 seconds and redirect
        setTimeout(() => {
          router.push('/account');
        }, 1500);
      }
    } catch (err) {
      console.error("Checkout exception:", err);
      showToast('Checkout service is currently unavailable.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 py-4 pb-28 md:space-y-6 md:py-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-anton text-slate-800 dark:text-white uppercase tracking-wider">
          Your Cart
        </h1>
        {cart.length > 0 && (
          <button 
            onClick={handleClearCart}
            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold py-1.5 px-4 rounded-xl border border-rose-200/50 dark:border-rose-900/35 transition-all cursor-pointer text-xs shadow-sm"
          >
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-black/10 border border-black/5 dark:border-white/10 rounded-3xl glass shadow-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-20 mx-auto mb-4 text-slate-405"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
          <p className="font-semibold text-lg text-slate-750 dark:text-white">Your cart is empty</p>
          <p className="text-xs mt-1.5 mb-6">Browse our handloom collections to add sarees to your cart.</p>
          <Link href="/new-arrivals" className="bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded-full transition-transform hover:scale-[1.02] shadow-md text-sm">
            Shop Our Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 items-start">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <ul className="space-y-4">
              {cart.map((item, i) => {
                const isItemPaused = isProductPaused ? (isProductPaused(item) || isCatalogPaused(item.catalogId)) : false;
                return (
                <li key={item.id || i} className={`flex items-center gap-3 p-3 bg-white/70 dark:bg-slate-800/80 border shadow-sm rounded-2xl text-slate-855 dark:text-slate-100 transition-colors duration-200 ${isItemPaused ? 'border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/20' : 'border-black/5 dark:border-white/5'}`}>
                  <div className="relative size-[90px] shrink-0">
                    <SafeImage src={item.image} alt={item.name} className={`size-full object-cover rounded-xl shadow-sm border border-black/5 dark:border-white/5 ${isItemPaused ? 'grayscale-[40%]' : ''}`} />
                    {isItemPaused && (
                      <span className="absolute bottom-1 left-1 right-1 bg-amber-500 text-slate-950 text-[8px] font-black text-center py-0.5 rounded shadow">
                        PAUSED
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white text-base truncate">{item.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">₹{item.price.toLocaleString('en-IN')} x {item.qty}</div>
                    {isItemPaused && (
                      <div className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                        <span>⏸️</span>
                        <span>Item temporarily unavailable / paused</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 shadow-sm overflow-hidden">
                      <button 
                        onClick={() => updateCartQty(item.id, (item.qty || 1) - 1)}
                        className="px-3 py-1 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-semibold text-sm border-x border-slate-200 dark:border-slate-600">
                        {item.qty}
                      </span>
                      <button 
                        onClick={() => updateCartQty(item.id, (item.qty || 1) + 1)}
                        className="px-3 py-1 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors cursor-pointer" 
                      title="Remove Item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
            </ul>
            
            {/* Lower Clear Cart button container removed (moved to header row) */}
          </div>
          
          <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-4 sm:p-6 rounded-3xl glass shadow-md space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">
              Order Summary
            </h2>
            
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-350">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{Math.round(subtotal).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-350">
                <span>Estimated Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-350 border-b border-black/5 dark:border-white/5 pb-3">
                <span>Tax (8% Estimated)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{Math.round(tax).toLocaleString('en-IN')}
                </span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-[#25D366] text-sm">
                  <span>10% Promo Discount</span>
                  <span>-₹{Math.round(discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 dark:text-white text-lg font-bold pt-2">
                <span>Total</span>
                <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2">
              <label htmlFor="promo-code" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="promo-code" 
                  placeholder="WELCOME10" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                />
                <button 
                  onClick={handleApplyPromo}
                  className="bg-slate-800 hover:bg-slate-950 dark:bg-slate-700 dark:hover:bg-slate-650 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-[#183fad] hover:bg-blue-800 text-[#F1BF0A] font-bold py-3 px-6 rounded-full border border-[#183fad] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer block text-center text-sm"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Checkout details form drawer modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9500] flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#0c1e44]/95 text-slate-800 dark:text-white max-w-lg w-full rounded-3xl shadow-2xl glass border border-white/20 dark:border-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button 
              onClick={() => setShowCheckoutForm(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer z-50 font-bold" 
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <form onSubmit={handleConfirmOrder} className="p-6 sm:p-8 space-y-4">
              <h2 className="text-xl md:text-2xl font-anton text-slate-800 dark:text-white uppercase tracking-wider">
                Shipping & Payment Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please complete your information to confirm the saree shipment.
              </p>

              <hr className="border-slate-200 dark:border-slate-850" />

              <div className="space-y-3">
                {savedAddresses.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Deliver to Saved Address
                    </label>
                    <select
                      onChange={(e) => {
                        const selected = savedAddresses.find(addr => addr.id === e.target.value);
                        if (selected) {
                          setFullName(selected.name || '');
                          setPhone(selected.phone || '');
                          setAddress(selected.line1 ? `${selected.line1}${selected.line2 ? `, ${selected.line2}` : ''}` : '');
                          setCity(selected.city || '');
                          setState(selected.state || '');
                          setPincode(selected.pincode || '');
                        }
                      }}
                      className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]"
                    >
                      <option value="">-- Choose a saved address --</option>
                      {savedAddresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.type} ({addr.city} - {addr.name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number (10 Digits)</label>
                  <input 
                    type="tel" 
                    required 
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Street Address (House/Flat No, Building, Area)</label>
                  <textarea 
                    required 
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Lotus Heights, Baner Road"
                    className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">City</label>
                    <input 
                      type="text" 
                      required 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune"
                      className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">State</label>
                    <input 
                      type="text" 
                      required 
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Pincode (6 Digits)</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 411045"
                      className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Payment Method</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20">
                    <span className="text-base">🚚</span>
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Cash on Delivery (COD)</span>
                    <span className="ml-auto text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">Pay at door</span>
                  </div>
                </div>


              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between text-sm font-bold">
                <span>Total Amount:</span>
                <span className="text-[#183fad] dark:text-[#F1BF0A] text-lg">₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#183fad] hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-full border border-[#183fad] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer block text-center text-sm"
              >
                {isSubmitting ? 'Processing Order...' : 'Confirm and Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Script 
        src="https://checkout-ui.shiprocket.com/assets/js/channels/custom.js" 
        strategy="afterInteractive" 
      />
    </div>
  );
}



