'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';

export default function NewArrivals() {
  const { products } = useApp();
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique types for filters
  const types = ['All', ...new Set(products.map(p => p.type).filter(Boolean))];

  // Filter products based on selected criteria
  const filteredProducts = products.filter(product => {
    // 1. Type filter
    if (selectedType !== 'All' && product.type !== selectedType) {
      return false;
    }

    // 2. Price filter
    if (selectedPriceRange !== 'All') {
      if (selectedPriceRange === 'under-3k' && product.price >= 3000) return false;
      if (selectedPriceRange === '3k-4k' && (product.price < 3000 || product.price > 4000)) return false;
      if (selectedPriceRange === 'over-4k' && product.price <= 4000) return false;
    }

    // 3. Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchName = product.name?.toLowerCase().includes(query);
      const matchCraft = product.craft?.toLowerCase().includes(query);
      const matchOrigin = product.origin?.toLowerCase().includes(query);
      return matchName || matchCraft || matchOrigin;
    }

    return true;
  });

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#d9a05b] font-semibold">Exquisite Weaves</span>
        <h1 className="text-4xl font-anton text-slate-800 dark:text-white">NEW ARRIVALS</h1>
        <p className="text-slate-600 dark:text-slate-350 text-sm max-w-xl mx-auto leading-relaxed">
          Direct from weavers' wood looms to Reenat Trends. Explore the latest collections.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="max-w-md mx-auto space-y-4 px-2">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Search by name, craft, or origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A] transition-all"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-[#183fad] hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
          >
            <span>Filters</span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Filter Sheet (Toggleable) */}
        {showFilters && (
          <div id="filter-sheet" className="p-4 bg-white/95 dark:bg-[#0c1e44]/95 rounded-2xl glass border border-white/20 dark:border-white/10 space-y-4">
            {/* Filter by Type */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider block">Saree Type</span>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`filter-pill text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      selectedType === type
                        ? 'bg-[#F1BF0A] border-[#F1BF0A] text-slate-900 font-semibold'
                        : 'bg-white/40 dark:bg-black/10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Price */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider block">Price Range</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'All Prices', value: 'All' },
                  { label: 'Under ₹3,000', value: 'under-3k' },
                  { label: '₹3,000 - ₹4,000', value: '3k-4k' },
                  { label: 'Over ₹4,000', value: 'over-4k' },
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setSelectedPriceRange(range.value)}
                    className={`filter-pill text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      selectedPriceRange === range.value
                        ? 'bg-[#F1BF0A] border-[#F1BF0A] text-slate-900 font-semibold'
                        : 'bg-white/40 dark:bg-black/10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setSelectedType('All');
                  setSelectedPriceRange('All');
                  setSearchQuery('');
                }}
                className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Catalog Grid */}
      <main className="max-w-5xl mx-auto overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-black/10 border border-black/5 dark:border-white/10 rounded-2xl glass">
            <p className="font-semibold text-base text-slate-750 dark:text-white">No sarees match your filter criteria.</p>
            <p className="text-xs mt-1">Try resetting search query or filters to view our full lineage.</p>
          </div>
        ) : (
          <ul id="product-list" className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
