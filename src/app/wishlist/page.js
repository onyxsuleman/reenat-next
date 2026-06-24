'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import Link from 'next/link';

export default function Wishlist() {
  const { wishlist } = useApp();

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-3xl font-anton text-slate-800 dark:text-white uppercase tracking-wider">
        Your Wishlist
      </h1>
      
      {wishlist.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-black/10 border border-black/5 dark:border-white/10 rounded-3xl glass shadow-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-20 mx-auto mb-4 text-slate-405"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
          <p className="font-semibold text-lg text-slate-750 dark:text-white">Your wishlist is empty</p>
          <p className="text-xs mt-1.5 mb-6">Explore our saree catalog and tap the heart icon to save your favorites.</p>
          <Link href="/new-arrivals" className="bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded-full transition-transform hover:scale-[1.02] shadow-md text-sm">
            Explore Collection
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {wishlist.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
