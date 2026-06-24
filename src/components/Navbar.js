'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    { name: 'Stores', href: '/stores' },
    { name: 'CMS Panel', href: '/cms' },
  ];

  return (
    <nav className="flex flex-col max-w-5xl w-full mx-auto relative z-50 gap-4 mt-4 mb-4 px-2 sm:px-0">
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 bg-white/90 dark:bg-[#0c1e44]/90 px-4 py-2.5 rounded-[9999px] glass shadow-md border border-white/20 dark:border-white/10 transition-colors duration-300 shrink-0 hover:no-underline">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#F1BF0A" />
            <path d="M20 8C20 8 12 15 12 22C12 26.4183 15.5817 30 20 30C24.4183 30 28 26.4183 28 22C28 15 20 8 20 8ZM20 27C17.2386 27 15 24.7614 15 22C15 18.5 18 14.5 20 12.2C22 14.5 25 18.5 25 22C25 24.7614 22.7614 27 20 27Z" fill="#0f1f41"/>
          </svg>
          <span className="font-anton select-none text-slate-800 dark:text-white text-base tracking-wider transition-colors duration-300">REENAT TRENDS</span>
        </Link>

        {/* Desktop Nav and Action Buttons */}
        <div className="flex items-center justify-between gap-4 flex-1 bg-white/90 dark:bg-[#0c1e44]/90 text-slate-800 dark:text-white px-5 py-2 rounded-[9999px] glass shadow-md border border-white/20 dark:border-white/10 transition-colors duration-300">
          <div className="hidden md:block"></div>

          {/* Links */}
          <ul className="hidden md:flex items-center gap-6 py-1">
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

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden cursor-pointer rounded text-slate-800 dark:text-white"
            aria-label="Toggle Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
              <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Icons/Actions */}
          <div className="flex items-center gap-4">
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

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              id="theme-toggle"
              aria-label="Toggle theme"
              className="cursor-pointer"
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden flex flex-col gap-2 p-4 bg-white/95 dark:bg-[#0c1e44]/95 rounded-2xl glass shadow-lg border border-white/20 dark:border-white/10 mt-1 transition-all duration-300">
          <ul className="flex flex-col gap-3 py-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-1.5 px-3 rounded-lg transition-colors text-sm font-medium ${
                      isActive 
                        ? 'bg-[#183fad]/10 text-[#183fad] dark:bg-[#F1BF0A]/10 dark:text-[#F1BF0A]' 
                        : 'text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="h-[1px] bg-slate-200 dark:bg-white/10 my-2"></div>

          {/* Mobile Actions */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs py-2">
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <span className="relative">
                ❤️
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white rounded-full text-[9px] px-1 font-bold">{wishlistCount}</span>
                )}
              </span>
              <span>Wishlist</span>
            </Link>

            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <span className="relative">
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#F1BF0A] text-slate-900 rounded-full text-[9px] px-1 font-bold">{cartCount}</span>
                )}
              </span>
              <span>Cart</span>
            </Link>

            <Link
              href={userSession ? "/account" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <span>👤</span>
              <span>Account</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
