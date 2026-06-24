'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Link from 'next/link';

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, updateCounts, showToast } = useApp();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // e.g. 0.1 for 10%

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
      // Loop to remove all
      cart.forEach(item => {
        removeFromCart(item.id);
      });
      // Direct update through app context or local storage
      localStorage.setItem('cart', JSON.stringify([]));
      window.location.reload(); // Quick reset
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!', 'info');
      return;
    }
    showToast('Processing Checkout... Payment integration simulated.', 'success');
    setTimeout(() => {
      localStorage.setItem('cart', JSON.stringify([]));
      showToast('Purchase successful!', 'success');
      alert('Thank you for your order! Your purchase of traditional handloom sarees was successful.');
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-3xl font-anton text-slate-800 dark:text-white uppercase tracking-wider">
        Your Cart
      </h1>

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <ul className="space-y-4">
              {cart.map((item, i) => (
                <li key={item.id || i} className="flex items-center gap-4 p-4 bg-white/70 dark:bg-slate-800/80 border border-black/5 dark:border-white/5 shadow-sm rounded-2xl text-slate-855 dark:text-slate-100 transition-colors duration-200">
                  <img src={item.image} alt={item.name} className="size-[90px] object-cover rounded-xl shadow-sm border border-black/5 dark:border-white/5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white text-base truncate">{item.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">₹{item.price.toLocaleString('en-IN')} x {item.qty}</div>
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
              ))}
            </ul>
            
            <div className="pt-4 flex gap-4">
              <button 
                onClick={handleClearCart}
                className="bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-medium py-2.5 px-6 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer text-sm shadow-sm border border-rose-200 dark:border-rose-900/30"
              >
                Clear Cart
              </button>
            </div>
          </div>
          
          {/* Right: Summary Card */}
          <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-md space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-3">
              Order Summary
            </h2>
            
            <div className="space-y-3">
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
              className="w-full bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-full border border-[#183fad] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer block text-center text-sm"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
