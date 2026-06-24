'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export default function Account() {
  const router = useRouter();
  const { userSession, handleLogout } = useApp();

  useEffect(() => {
    // Wait for hydration before checking session
    const stored = localStorage.getItem('userSession');
    if (!stored && !userSession) {
      router.push('/login');
    }
  }, [userSession]);

  if (!userSession) {
    return (
      <div className="py-12 text-center text-slate-505 dark:text-slate-400">
        <p className="font-medium animate-pulse text-lg">Verifying your profile credentials…</p>
      </div>
    );
  }

  const initial = userSession.username ? userSession.username.charAt(0).toUpperCase() : 'U';

  const handleLogoutAction = () => {
    handleLogout();
    router.push('/login');
  };

  return (
    <main className="max-w-5xl mx-auto w-full flex-1 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Profile Details Box */}
        <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-md space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="size-20 rounded-full bg-gradient-to-br from-[#183fad] to-indigo-600 text-white flex items-center justify-center text-3xl font-anton shadow-md">
              <span>{initial}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                {userSession.username}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {userSession.email}
              </p>
            </div>
          </div>
          
          <div className="border-t border-black/5 dark:border-white/5 pt-4 space-y-3 text-sm text-slate-655 dark:text-slate-350">
            <div className="flex justify-between">
              <span className="font-medium">Member Since</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {userSession.joinedDate || 'June 2026'}
              </span>
            </div>
            <div className="flex justify-between pb-3">
              <span className="font-medium">Tier</span>
              <span className="font-semibold text-[#F1BF0A] flex items-center gap-1">★ Gold Member</span>
            </div>
            <button 
              onClick={handleLogoutAction}
              className="w-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold py-2 px-4 rounded-xl border border-rose-200 dark:border-rose-900/30 transition-transform active:scale-95 cursor-pointer text-center text-xs flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Dashboard Content */}
        <div className="md:col-span-2 space-y-6 text-slate-800 dark:text-white">
          {/* Order History Card */}
          <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-md">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-3 uppercase font-anton tracking-wide">
              Recent Orders
            </h3>
            
            <div className="mt-4 space-y-4">
              {/* Mock Order 1 */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/40 dark:bg-black/10 border border-black/5 dark:border-white/5 rounded-2xl gap-3">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">Order #RT-9082</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Placed on June 10, 2026</div>
                  <div className="text-xs text-slate-600 dark:text-slate-350">Items: 1x Kanjivaram Silk, 1x Banarasi Weave</div>
                </div>
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">₹6,000</span>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold">Delivered</span>
                </div>
              </div>

              {/* Mock Order 2 */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/40 dark:bg-black/10 border border-black/5 dark:border-white/5 rounded-2xl gap-3">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">Order #RT-8741</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Placed on May 24, 2026</div>
                  <div className="text-xs text-slate-600 dark:text-slate-350">Items: 1x Chanderi Charm</div>
                </div>
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">₹2,000</span>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Book Card */}
          <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-md">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-3 uppercase font-anton tracking-wide">
              Primary Delivery Address
            </h3>
            <div className="mt-4 text-sm text-slate-650 dark:text-slate-350 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-850 dark:text-white">
                {userSession.username ? userSession.username.toUpperCase() : 'User Name'}
              </p>
              <p>12, Weaver Street, Silk Nagar</p>
              <p>Kanchipuram, Tamil Nadu - 631501</p>
              <p>India</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
