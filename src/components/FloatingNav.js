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

  return null;
}
