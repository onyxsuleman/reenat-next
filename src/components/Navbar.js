'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const pathname = usePathname();
  const { cart, wishlist, theme, toggleTheme, userSession } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const wishlistCount = wishlist.length;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'New Arrivals', href: '/new-arrivals' },
  ];

  return (
    <nav className="flex flex-col max-w-5xl w-full mx-auto relative z-50 gap-4 mt-1.5 mb-4 px-2 sm:px-0">
      
      {/* Mobile Navbar Row */}
      <div className="flex md:hidden items-center gap-3 w-full">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center justify-start gap-2 bg-white/90 dark:bg-[#0c1e44]/90 px-3.5 h-12 rounded-[9999px] nav-glass border border-white/30 dark:border-white/10 transition-colors duration-300 flex-1 min-w-0 hover:no-underline">
          <Image 
            src="/logo.png" 
            alt="Reenat Trends Logo" 
            width={32} 
            height={32} 
            style={{ width: 'auto', height: 'auto' }}
            className="rounded-full object-contain shrink-0"
          />
          <span className="font-anton font-bold select-none text-slate-800 dark:text-white text-xs sm:text-sm tracking-wider transition-colors duration-300 whitespace-nowrap truncate">REENAT TRENDS</span>
        </Link>

        {/* Right: Toggle/Search/Hamburger Pill */}
        <div className="flex items-center justify-between gap-2 bg-white/90 dark:bg-[#0c1e44]/90 px-3.5 h-12 rounded-[9999px] nav-glass border border-white/30 dark:border-white/10 text-slate-800 dark:text-white flex-1 min-w-0">
          {/* Neumorphic Sliding Switch (Left) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="relative w-[64px] h-[30px] rounded-full p-[3px] bg-slate-200/90 dark:bg-slate-950/80 border border-black/5 dark:border-white/5 shadow-[inset_0_2.5px_4.5px_rgba(0,0,0,0.15)] flex items-center cursor-pointer transition-colors duration-300 select-none outline-none shrink-0"
            aria-label="Toggle theme"
          >
            {/* Background Sun Icon (Recessed) */}
            <div className={`absolute left-[9px] top-[6px] transition-all duration-300 ${
              theme === 'dark' ? 'opacity-40 text-slate-500' : 'opacity-0 scale-75'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.16 5.1a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06L6.16 6.16a.75.75 0 0 1 0-1.06ZM18.84 5.1a.75.75 0 0 1 0 1.06l-1.59 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM3 12a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM16.25 16.25a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06ZM6.16 17.84a.75.75 0 0 1 1.06 0l1.59-1.59a.75.75 0 1 1 1.06 1.06l-1.59 1.59a.75.75 0 0 1-1.06 0ZM12 17.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V18a.75.75 0 0 1 .75-.75ZM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
              </svg>
            </div>

            {/* Background Moon Icon (Recessed) */}
            <div className={`absolute right-[9px] top-[6px] transition-all duration-300 ${
              theme !== 'dark' ? 'opacity-40 text-slate-500' : 'opacity-0 scale-75'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 1 1-9.694-9.694.75.75 0 0 1 .819.162ZM19.75 3a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 19.75 3ZM19.75 8.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM22.5 6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 22.5 6ZM17 6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 17 6Z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Sliding Knob (Thumb) */}
            <div 
              className={`w-[24px] h-[24px] rounded-full bg-white dark:bg-slate-100 flex items-center justify-center transition-transform duration-300 ease-out shadow-[0_3px_8px_rgba(0,0,0,0.15),_0_1px_3px_rgba(0,0,0,0.06),_inset_0_2px_3px_rgba(255,255,255,0.7)] border border-black/5 relative ${
                theme === 'dark' ? 'translate-x-[34px]' : 'translate-x-0'
              }`}
            >
              {/* Active Sun Icon */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 text-[#FF9F0A] ${
                theme === 'dark' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5 shrink-0">
                  <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.16 5.1a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06L6.16 6.16a.75.75 0 0 1 0-1.06ZM18.84 5.1a.75.75 0 0 1 0 1.06l-1.59 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM3 12a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM16.25 16.25a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06ZM6.16 17.84a.75.75 0 0 1 1.06 0l1.59-1.59a.75.75 0 1 1 1.06 1.06l-1.59 1.59a.75.75 0 0 1-1.06 0ZM12 17.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V18a.75.75 0 0 1 .75-.75ZM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
                </svg>
              </div>

              {/* Active Moon Icon */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 text-indigo-650 dark:text-[#F1BF0A] ${
                theme !== 'dark' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5 shrink-0">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 1 1-9.694-9.694.75.75 0 0 1 .819.162ZM19.75 3a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 19.75 3ZM19.75 8.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM22.5 6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 22.5 6ZM17 6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 17 6Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </button>

          {/* Search Button (Center) */}
          <Link 
            href="/new-arrivals" 
            className="text-slate-850 dark:text-white hover:opacity-80 transition-opacity flex items-center justify-center" 
            title="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
          </Link>

          {/* Hamburger Menu Toggle (Right) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="cursor-pointer rounded text-slate-800 dark:text-white flex items-center justify-center"
            aria-label="Open Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Navbar Row */}
      <div className="hidden md:flex items-center justify-between gap-3 w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 h-[60px] px-5 rounded-[9999px] nav-glass border border-white/30 dark:border-white/10 transition-colors duration-300 shrink-0 hover:no-underline">
          <Image 
            src="/logo.png" 
            alt="Reenat Trends Logo" 
            width={32} 
            height={32} 
            style={{ width: 'auto', height: 'auto' }}
            className="rounded-full object-contain shrink-0"
          />
          <span className="font-anton font-bold select-none text-slate-800 dark:text-white text-base tracking-wider transition-colors duration-300">REENAT TRENDS</span>
        </Link>

        {/* Desktop Nav and Action Buttons */}
        <div className="flex items-center justify-between gap-4 flex-1 h-[60px] px-6 md:px-8 rounded-[9999px] nav-glass border border-white/30 dark:border-white/10 transition-colors duration-300">
          {/* Links */}
          <ul className="hidden md:flex items-center gap-8 py-1 m-0 flex-none">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`transition-colors font-medium text-sm ${
                      isActive 
                        ? 'text-[#183fad] dark:text-[#F1BF0A] font-semibold' 
                        : 'text-slate-700 hover:text-[#183fad] dark:text-white/80 dark:hover:text-[#F1BF0A]'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Icons/Actions */}
          <div className="flex items-center gap-4 shrink-0 flex-none min-w-auto justify-end">
            <Link href="/new-arrivals" className="hidden sm:flex items-center gap-2 btn-primary rounded-full py-1.5 px-4 text-sm whitespace-nowrap transition-transform duration-300 hover:scale-105 shadow-sm font-semibold">
              <span>Explore Collection</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
              </svg>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden min-[480px]:flex items-center gap-2 text-slate-800 dark:text-white hover:text-rose-500 dark:hover:text-rose-400 transition-colors" title="My Wishlist">
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"></path>
                </svg>
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full text-[10px] px-1 font-bold">{wishlistCount}</span>
              </div>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="hidden min-[480px]:flex items-center gap-2 text-slate-800 dark:text-white hover:text-[#183fad] dark:hover:text-[#F1BF0A] transition-colors" title="My Cart">
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-6">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4L7 13zM7 13l-1.6 6.4A1 1 0 006.4 21h11.2a1 1 0 00.98-.76L20 13H7zM10 21a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
                <span className="absolute -top-2 -right-2 bg-[#F1BF0A] text-slate-900 rounded-full text-[10px] px-1 font-bold">{cartCount}</span>
              </div>
            </Link>

            {/* Account */}
            <Link href={userSession ? "/account" : "/login"} className="hidden min-[480px]:flex items-center gap-2 text-slate-800 dark:text-white hover:text-[#183fad] dark:hover:text-[#F1BF0A] transition-colors" title={userSession ? "My Account" : "Login / Sign Up"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"></path>
              </svg>
            </Link>

            {/* Neumorphic Sliding Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative w-[76px] h-[38px] rounded-full p-[3px] bg-slate-200/90 dark:bg-slate-950/80 border border-black/5 dark:border-white/5 shadow-[inset_0_2.5px_4.5px_rgba(0,0,0,0.15)] flex items-center cursor-pointer transition-colors duration-300 select-none outline-none shrink-0"
              aria-label="Toggle theme"
            >
              {/* Background Sun Icon (Recessed) */}
              <div className={`absolute left-[11px] top-[10px] transition-all duration-300 ${
                theme === 'dark' ? 'opacity-40 text-slate-500' : 'opacity-0 scale-75'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4.5">
                  <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.16 5.1a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06L6.16 6.16a.75.75 0 0 1 0-1.06ZM18.84 5.1a.75.75 0 0 1 0 1.06l-1.59 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM3 12a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM16.25 16.25a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06ZM6.16 17.84a.75.75 0 0 1 1.06 0l1.59-1.59a.75.75 0 1 1 1.06 1.06l-1.59 1.59a.75.75 0 0 1-1.06 0ZM12 17.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V18a.75.75 0 0 1 .75-.75ZM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
                </svg>
              </div>

              {/* Background Moon Icon (Recessed) */}
              <div className={`absolute right-[11px] top-[10px] transition-all duration-300 ${
                theme !== 'dark' ? 'opacity-40 text-slate-500' : 'opacity-0 scale-75'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4.5">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 1 1-9.694-9.694.75.75 0 0 1 .819.162ZM19.75 3a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 19.75 3ZM19.75 8.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM22.5 6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 22.5 6ZM17 6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 17 6Z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Sliding Knob (Thumb) */}
              <div 
                className={`w-[32px] h-[32px] rounded-full bg-white dark:bg-slate-100 flex items-center justify-center transition-transform duration-300 ease-out shadow-[0_3px_8px_rgba(0,0,0,0.15),_0_1px_3px_rgba(0,0,0,0.06),_inset_0_2px_3px_rgba(255,255,255,0.7)] border border-black/5 relative ${
                  theme === 'dark' ? 'translate-x-[38px]' : 'translate-x-0'
                }`}
              >
                {/* Active Sun Icon */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 text-[#FF9F0A] ${
                  theme === 'dark' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
                    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.16 5.1a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06L6.16 6.16a.75.75 0 0 1 0-1.06ZM18.84 5.1a.75.75 0 0 1 0 1.06l-1.59 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM3 12a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM16.25 16.25a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06ZM6.16 17.84a.75.75 0 0 1 1.06 0l1.59-1.59a.75.75 0 1 1 1.06 1.06l-1.59 1.59a.75.75 0 0 1-1.06 0ZM12 17.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V18a.75.75 0 0 1 .75-.75ZM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
                  </svg>
                </div>

                {/* Active Moon Icon */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 text-indigo-650 dark:text-[#F1BF0A] ${
                  theme !== 'dark' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 1 1-9.694-9.694.75.75 0 0 1 .819.162ZM19.75 3a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 19.75 3ZM19.75 8.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM22.5 6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 22.5 6ZM17 6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 17 6Z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Sidebar sliding from right) */}
      <div className={`fixed inset-0 z-[999] md:hidden transition-all duration-300 ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop overlay */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sliding Panel */}
        <div 
          className={`absolute inset-y-0 right-0 w-[300px] max-w-[85vw] bg-white dark:bg-[#0c1e44] border-l border-slate-200/80 dark:border-white/10 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out glass ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Image 
                  src="/logo.png" 
                  alt="Reenat Trends Logo" 
                  width={28} 
                  height={28} 
                  style={{ width: 'auto', height: 'auto' }}
                  className="rounded-full object-contain"
                />
                <span className="font-anton select-none text-slate-800 dark:text-white text-base tracking-wider">
                  REENAT TRENDS
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setMobileMenuOpen(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <ul className="flex flex-col gap-3 py-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-semibold ${
                        isActive 
                          ? 'bg-[#183fad]/10 text-[#183fad] dark:bg-[#F1BF0A]/10 dark:text-[#F1BF0A]' 
                          : 'text-slate-800 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
              
              {/* Mobile Bulk Purchase */}
              <li>
                <a 
                  href="https://wa.me/919028571571?text=Hi%2C%20I%27m%20interested%20in%20wholesale%20buying%20from%20Reenat%20Trends."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-4 rounded-xl text-slate-800 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5 text-sm font-medium hover:no-underline"
                >
                  💼 Bulk Purchase (WhatsApp)
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="h-[1px] bg-slate-200 dark:bg-white/10"></div>

            {/* Mobile Actions Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pb-2">
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span className="relative text-xl">
                  ❤️
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white rounded-full text-[9px] px-1 font-bold">{wishlistCount}</span>
                  )}
                </span>
                <span className="font-semibold">Wishlist</span>
              </Link>

              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span className="relative text-xl">
                  🛒
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#F1BF0A] text-slate-900 rounded-full text-[9px] px-1 font-bold">{cartCount}</span>
                  )}
                </span>
                <span className="font-semibold">Cart</span>
              </Link>

              <Link
                href={userSession ? "/account" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span className="text-xl">👤</span>
                <span className="font-semibold">Account</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
