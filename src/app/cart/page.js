'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase';

export default function Cart() {
  const router = useRouter();
  const { cart, updateCartQty, removeFromCart, showToast, userSession } = useApp();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // e.g. 0.1 for 10%
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userSession) {
      setEmail(userSession.email || '');
      setFullName(userSession.username || '');
      setAddress('12, Weaver Street, Silk Nagar, Kanchipuram, Tamil Nadu - 631501');
    }
  }, [userSession]);

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

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!', 'info');
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !address) {
      showToast('Please fill in all checkout fields.', 'warning');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit phone number.', 'warning');
      return;
    }

    setIsSubmitting(true);
    showToast('Creating order in database...', 'info');

    try {
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
        color: item.color || '',
        skuId: item.skuId || item.styleId || ''
      }));

      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: fullName,
          email: email,
          phone: phone,
          address: address,
          subtotal: Number(subtotal),
          tax: Number(tax),
          discount: Number(discountAmount),
          total: Number(total),
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'Pay Online' ? 'paid' : 'pending',
          order_status: 'Pending',
          items: orderItems
        })
        .select();

      if (error) {
        console.error("Order creation failed:", error);
        showToast('Checkout failed. Please try again.', 'error');
      } else {
        // Successfully placed order!
        // Decrement product stock levels in background
        for (const item of cart) {
          if (item.id && !String(item.id).startsWith('temp-')) {
            const currentStock = item.stockQty || 10;
            const updatedStock = Math.max(0, currentStock - item.qty);
            await supabase
              .from('products')
              .update({ stock_qty: updatedStock })
              .eq('id', item.id);
          }
        }

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
      showToast('Database connection failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Delivery Address</label>
                  <textarea 
                    required 
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'Cash on Delivery'
                          ? 'bg-[#183fad] border-[#183fad] text-white'
                          : 'bg-white/40 dark:bg-black/10 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350'
                      }`}
                    >
                      Cash on Delivery (COD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Pay Online')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'Pay Online'
                          ? 'bg-[#183fad] border-[#183fad] text-white'
                          : 'bg-white/40 dark:bg-black/10 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350'
                      }`}
                    >
                      Pay Online (Simulated)
                    </button>
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

    </div>
  );
}



