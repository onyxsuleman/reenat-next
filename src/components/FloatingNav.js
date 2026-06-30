'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

export default function FloatingNav() {
  const { cart } = useApp();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 100 || (window.innerHeight + currentY) >= document.body.scrollHeight - 100) {
        setVisible(true);
      } else {
        setVisible(currentY < lastScrollY || currentY < 50);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToProducts = () => {
    const el = document.getElementById('product-list');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const cartCount = cart?.length || 0;

  const barStyle = {
    background: 'rgba(255, 255, 255, 0.72)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    backdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.55)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
  };

  const iconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    color: '#334155',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const filterBtnStyle = {
    background: 'linear-gradient(135deg, #183fad, #1e50d4)',
    borderRadius: '20px',
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(96px)',
        zIndex: 50,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div 
        style={barStyle}
        className="flex items-center gap-1.5 sm:gap-2 px-2 py-2 rounded-[22px] dark:!bg-[rgba(12,18,38,0.75)] dark:!border-[rgba(255,255,255,0.1)] dark:!shadow-[0_4px_30px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]"
      >


        {/* My Account */}
        <Link 
          href="/account"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/8 active:scale-92 transition-all cursor-pointer no-underline"
          title="My Account"
          style={{ WebkitTapHighlightColor: 'transparent', textDecoration: 'none' }}
        >
          <div style={iconStyle} className="dark:!bg-[rgba(255,255,255,0.1)] dark:!border-[rgba(255,255,255,0.08)] dark:!text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#475569', letterSpacing: '0.02em', lineHeight: 1 }} className="dark:!text-slate-400">Account</span>
        </Link>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: 'rgba(148, 163, 184, 0.3)', margin: '0 2px' }} className="dark:!bg-[rgba(255,255,255,0.1)]"></div>

        {/* Filter */}
        <button 
          onClick={scrollToProducts}
          style={filterBtnStyle}
          className="dark:!bg-gradient-to-r dark:!from-[#F1BF0A] dark:!to-[#d9a200] hover:shadow-lg active:scale-95"
          title="Filter & Browse"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '16px', height: '16px', color: 'white' }} className="dark:!text-slate-900">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', letterSpacing: '0.03em' }} className="dark:!text-slate-900">Filter</span>
        </button>
      </div>
    </div>
  );
}
