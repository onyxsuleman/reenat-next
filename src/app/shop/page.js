'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import ProductSkeleton from '../../components/ProductSkeleton';

const COLLECTIONS = [
  { id: 'All', name: 'All Collections', description: 'Explore our complete handcrafted handloom collection', icon: '✨' },
  { id: 'Paithani', name: 'Paithani', description: 'Royal Maharashtra handloom sarees woven with exquisite zari & peacock motifs', icon: '🦚' },
  { id: 'Hathi Raja', name: 'Hathi Raja', description: 'Majestic elephant procession motifs symbolizing royalty & prosperity', icon: '👑' },
  { id: 'Elephant', name: 'Elephant', description: 'Heritage elephant weave designs crafted by traditional master artisans', icon: '🐘' },
  { id: 'Meena Mor', name: 'Meena Mor', description: 'Intricate Meenakari colored peacock pallu & border artistry', icon: '🪶' }
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, isProductPaused, isCatalogPaused } = useApp();

  // URL state synchronization
  const collectionParam = searchParams.get('collection') || 'All';
  const typeParam = searchParams.get('type') || 'All';
  const priceParam = searchParams.get('price') || 'All';
  const sortParam = searchParams.get('sort') || 'featured';
  const queryParam = searchParams.get('q') || searchParams.get('search') || '';

  const [selectedCollection, setSelectedCollection] = useState(collectionParam);
  const [selectedType, setSelectedType] = useState(typeParam);
  const [selectedPrice, setSelectedPrice] = useState(priceParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync state when URL searchParams change
  useEffect(() => {
    const col = searchParams.get('collection') || 'All';
    setSelectedCollection(col);
    setSelectedType(searchParams.get('type') || 'All');
    setSelectedPrice(searchParams.get('price') || 'All');
    setSortBy(searchParams.get('sort') || 'featured');
    setSearchQuery(searchParams.get('q') || searchParams.get('search') || '');
  }, [searchParams]);

  // Update URL helper (without full page refresh)
  const updateUrlParam = (key, value) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!value || value === 'All' || value === 'featured') {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`/shop${query}`, { scroll: false });
  };

  const handleCollectionChange = (colId) => {
    setSelectedCollection(colId);
    updateUrlParam('collection', colId);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    updateUrlParam('type', type);
  };

  const handlePriceChange = (price) => {
    setSelectedPrice(price);
    updateUrlParam('price', price);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateUrlParam('sort', sort);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    updateUrlParam('q', query.trim());
  };

  const handleClearFilters = () => {
    setSelectedCollection('All');
    setSelectedType('All');
    setSelectedPrice('All');
    setSortBy('featured');
    setSearchQuery('');
    router.replace('/shop', { scroll: false });
  };

  // Active unpaused products
  const activeProducts = useMemo(() => {
    return (products || []).filter(product => {
      const isPaused = isProductPaused ? (isProductPaused(product) || isCatalogPaused(product.catalogId || product.catalog_id)) : false;
      return !isPaused;
    });
  }, [products, isProductPaused, isCatalogPaused]);

  // Available unique types
  const availableTypes = useMemo(() => {
    const set = new Set(activeProducts.map(p => p.type).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [activeProducts]);

  // Collection matching helper
  const matchesCollection = (product, collectionName) => {
    if (!collectionName || collectionName === 'All') return true;
    const col = collectionName.toLowerCase();
    const name = (product.name || '').toLowerCase();
    const type = (product.type || '').toLowerCase();
    const craft = (product.craft || '').toLowerCase();
    const desc = (product.desc || '').toLowerCase();
    const styleid = (product.styleid || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const collection = (product.collection || '').toLowerCase();

    if (col === 'paithani') {
      return type.includes('paithani') || name.includes('paithani') || desc.includes('paithani') || styleid.includes('pai') || craft.includes('paithani');
    }
    if (col === 'hathi raja' || col === 'hathi-raja' || col === 'hathiraja') {
      return name.includes('hathi') || desc.includes('hathi') || styleid.includes('hathi') || name.includes('raja') || collection.includes('hathi');
    }
    if (col === 'elephant') {
      return name.includes('elephant') || desc.includes('elephant') || styleid.includes('elephant') || desc.includes('haathi') || name.includes('hathi') || collection.includes('elephant');
    }
    if (col === 'meena mor' || col === 'meena-mor' || col === 'meenamor') {
      return name.includes('meena') || name.includes('mor') || desc.includes('meena') || desc.includes('peacock') || styleid.includes('mor') || collection.includes('meena');
    }

    return name.includes(col) || type.includes(col) || desc.includes(col) || craft.includes(col) || styleid.includes(col) || category.includes(col);
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let result = activeProducts.filter(product => {
      // 1. Collection Filter
      if (selectedCollection !== 'All' && !matchesCollection(product, selectedCollection)) {
        return false;
      }

      // 2. Type Filter
      if (selectedType !== 'All' && product.type !== selectedType) {
        return false;
      }

      // 3. Price Filter
      if (selectedPrice !== 'All') {
        const p = Number(product.price || 0);
        if (selectedPrice === 'under-1500' && p >= 1500) return false;
        if (selectedPrice === '1500-3000' && (p < 1500 || p > 3000)) return false;
        if (selectedPrice === 'above-3000' && p <= 3000) return false;
      }

      // 4. Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = (product.name || '').toLowerCase().includes(q);
        const matchType = (product.type || '').toLowerCase().includes(q);
        const matchCraft = (product.craft || '').toLowerCase().includes(q);
        const matchOrigin = (product.origin || '').toLowerCase().includes(q);
        const matchColor = (product.color || '').toLowerCase().includes(q);
        const matchStyle = (product.styleid || '').toLowerCase().includes(q);
        if (!matchName && !matchType && !matchCraft && !matchOrigin && !matchColor && !matchStyle) {
          return false;
        }
      }

      return true;
    });

    // Sort result
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }

    return result;
  }, [activeProducts, selectedCollection, selectedType, selectedPrice, searchQuery, sortBy]);

  const activeCollectionMeta = COLLECTIONS.find(c => c.id.toLowerCase() === selectedCollection.toLowerCase()) || COLLECTIONS[0];
  const hasActiveFilters = selectedCollection !== 'All' || selectedType !== 'All' || selectedPrice !== 'All' || searchQuery.trim() !== '' || sortBy !== 'featured';

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      
      {/* Shop Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1e44] via-[#183fad] to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-white/10 glass">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#F1BF0A] font-semibold text-xs tracking-wider uppercase backdrop-blur-md">
            <span>{activeCollectionMeta.icon}</span>
            <span>{selectedCollection === 'All' ? 'Complete Handloom Catalog' : `${selectedCollection} Collection`}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-anton tracking-wider uppercase">
            {selectedCollection === 'All' ? 'SHOP ALL SAREES' : selectedCollection}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xl">
            {activeCollectionMeta.description}
          </p>
        </div>

        {/* Decorative Watermark & Light Orbs */}
        <div className="absolute right-[-20px] bottom-[-20px] text-white/5 font-anton text-[120px] sm:text-[180px] select-none pointer-events-none uppercase leading-none">
          REENAT
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F1BF0A]/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Collection Quick-Switch Tabs Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Curated Collections
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Saree' : 'Sarees'} Available
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {COLLECTIONS.map((col) => {
            const isSelected = selectedCollection.toLowerCase() === col.id.toLowerCase();
            const count = col.id === 'All' 
              ? activeProducts.length 
              : activeProducts.filter(p => matchesCollection(p, col.id)).length;

            return (
              <button
                key={col.id}
                type="button"
                onClick={() => handleCollectionChange(col.id)}
                className={`snap-start shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#F1BF0A] text-slate-950 shadow-md scale-105 font-bold'
                    : 'bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <span>{col.icon}</span>
                <span>{col.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected ? 'bg-black/20 text-slate-950 font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-[#0c1e44]/70 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
            <input
              type="text"
              placeholder="Search sarees by name, motif, color..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A]"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls: Sort and Filter Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label="Sort products by"
              className="py-2 px-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A] cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest First</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFilterDrawerOpen || selectedType !== 'All' || selectedPrice !== 'All'
                  ? 'bg-[#183fad] text-white'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              <span>Filters</span>
              {(selectedType !== 'All' || selectedPrice !== 'All') && (
                <span className="size-2 rounded-full bg-[#F1BF0A]"></span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {isFilterDrawerOpen && (
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Saree Type Filter */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Weave / Saree Type
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                      selectedType === type
                        ? 'bg-[#183fad] dark:bg-[#F1BF0A] text-white dark:text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Price Budget
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'All', label: 'All Prices' },
                  { id: 'under-1500', label: 'Under ₹1,500' },
                  { id: '1500-3000', label: '₹1,500 – ₹3,000' },
                  { id: 'above-3000', label: 'Above ₹3,000' }
                ].map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => handlePriceChange(range.id)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                      selectedPrice === range.id
                        ? 'bg-[#183fad] dark:bg-[#F1BF0A] text-white dark:text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips / Reset */}
        {hasActiveFilters && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Active:</span>

            {selectedCollection !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-[#F1BF0A]/20 text-slate-800 dark:text-[#F1BF0A] px-2.5 py-0.5 rounded-full font-medium">
                Collection: {selectedCollection}
                <button type="button" onClick={() => handleCollectionChange('All')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            {selectedType !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-[#183fad]/15 text-[#183fad] dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-medium">
                Type: {selectedType}
                <button type="button" onClick={() => handleTypeChange('All')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            {selectedPrice !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                Price: {selectedPrice}
                <button type="button" onClick={() => handlePriceChange('All')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                "{searchQuery}"
                <button type="button" onClick={() => handleSearchChange('')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-rose-600 dark:text-rose-400 hover:underline font-semibold ml-auto cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Product Grid Section */}
      <div>
        {filteredProducts && filteredProducts.length > 0 ? (
          <ul id="product-list" className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
        ) : (
          /* Empty Search / Filter State */
          <div className="text-center py-16 px-4 bg-white/60 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 space-y-4">
            <div className="size-16 mx-auto rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-3xl">
              🔍
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                No sarees found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                No products match your current collection or filter criteria. Try selecting another collection or clearing filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn-primary rounded-full px-6 py-2 text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <span>View All Sarees</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse mb-6"></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
