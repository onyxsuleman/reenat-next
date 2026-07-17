'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useApp } from '../context/AppContext';

function FloatingNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cart } = useApp();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 100) {
        setVisible(true);
      } else {
        setVisible(currentY < lastScrollY);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Hide the navigation button on the product details page
  if (pathname.startsWith('/product') || pathname === '/product') {
    return null;
  }

  const cartCount = cart?.reduce((sum, item) => sum + (item.qty || 1), 0) || 0;
  const tab = searchParams ? searchParams.get('tab') : null;

  const isHomeActive = pathname === '/';
  const isFilterActive = pathname === '/new-arrivals';
  const isOrdersActive = pathname === '/account' && tab === 'orders';
  const isCartActive = pathname === '/cart';
  const isAccountActive = pathname === '/account' && tab !== 'orders';

  // Render on mobile only, transition visible state. Sitting at bottom-0 with no margin.
  return (
    <div 
      className={`fixed bottom-0 left-0 w-full z-45 transition-all duration-300 md:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <nav className="flex items-center justify-around bg-white dark:bg-[#0c1e44] border-t border-slate-200/80 dark:border-white/10 shadow-2xl rounded-t-[20px] px-4 pt-3 pb-[calc(10px+env(safe-area-inset-bottom,12px))] text-slate-800 dark:text-[#F1BF0A]">
        
        {/* 1. Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1.5 py-1 px-3 text-center transition-transform hover:scale-105 active:scale-95 ${
            isHomeActive 
              ? 'text-slate-900 dark:text-[#F1BF0A] font-bold' 
              : 'text-slate-500 dark:text-[#F1BF0A]/60 font-medium'
          }`}
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          <span className="text-[10px] sm:text-xs">Home</span>
        </Link>

        {/* 2. Filter */}
        <Link 
          href="/new-arrivals" 
          className={`flex flex-col items-center gap-1.5 py-1 px-3 text-center transition-transform hover:scale-105 active:scale-95 ${
            isFilterActive 
              ? 'text-slate-900 dark:text-[#F1BF0A] font-bold' 
              : 'text-slate-500 dark:text-[#F1BF0A]/60 font-medium'
          }`}
        >
          <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          <span className="text-[10px] sm:text-xs">Filter</span>
        </Link>

        {/* 3. Orders */}
        <Link 
          href="/account?tab=orders" 
          className={`flex flex-col items-center gap-1.5 py-1 px-3 text-center transition-transform hover:scale-105 active:scale-95 ${
            isOrdersActive 
              ? 'text-slate-900 dark:text-[#F1BF0A] font-bold' 
              : 'text-slate-500 dark:text-[#F1BF0A]/60 font-medium'
          }`}
        >
          <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* Perspective Box Package Icon */}
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
          <span className="text-[10px] sm:text-xs">Orders</span>
        </Link>

        {/* 4. Cart */}
        <Link 
          href="/cart" 
          className={`flex flex-col items-center gap-1.5 py-1 px-3 text-center relative transition-transform hover:scale-105 active:scale-95 ${
            isCartActive 
              ? 'text-slate-900 dark:text-[#F1BF0A] font-bold' 
              : 'text-slate-500 dark:text-[#F1BF0A]/60 font-medium'
          }`}
        >
          <div className="relative">
            <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white rounded-full text-[9px] min-w-[14px] h-[14px] flex items-center justify-center font-bold px-0.5 border border-white dark:border-[#0c1e44] shadow-sm">{cartCount}</span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs">Cart</span>
        </Link>

        {/* 5. Account */}
        <Link 
          href="/account" 
          className={`flex flex-col items-center gap-1.5 py-1 px-3 text-center transition-transform hover:scale-105 active:scale-95 ${
            isAccountActive 
              ? 'text-slate-900 dark:text-[#F1BF0A] font-bold' 
              : 'text-slate-500 dark:text-[#F1BF0A]/60 font-medium'
          }`}
        >
          <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span className="text-[10px] sm:text-xs">Account</span>
        </Link>
      </nav>
    </div>
  );
}

export default function FloatingNav() {
  return (
    <Suspense fallback={null}>
      <FloatingNavContent />
    </Suspense>
  );
}
