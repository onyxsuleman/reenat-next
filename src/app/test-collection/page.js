'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import { ProductSkeletonGrid } from '../../components/ProductSkeleton';

// Premium Theme Color Constants
const GOLD_ACCENT = '#F1BF0A';

// Curated collections dataset with metadata for swiping deck stack
const SAREE_COLLECTIONS = [
  {
    catalog_id: 'M1',
    id: 'NSY0042',
    styleid: 'MANGO GREEN PAI X1',
    title: 'Imperial Paithani',
    category: 'Handloom Silk',
    price: '₹18,500',
    originalPrice: '₹24,000',
    discount: '23% OFF',
    rating: '4.9',
    reviewsCount: '124',
    badge: 'Trending Seller',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    image_back: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
    colorName: 'Mango Green',
    drapingStyles: ['Traditional Maharashtrian', 'Modern Open Pallu'],
    fabricScale: { soft: 85, weight: 75 }
  },
  {
    catalog_id: 'M2',
    id: 'NSY0050',
    styleid: 'ROYAL KANJI BL-02',
    title: 'Regal Kanjeevaram',
    category: 'Pure Mulberry Silk',
    price: '₹29,000',
    originalPrice: '₹38,000',
    discount: '24% OFF',
    rating: '5.0',
    reviewsCount: '89',
    badge: 'Bridal Heritage',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
    image_back: 'https://images.unsplash.com/photo-1583391265517-35bbadd01209?auto=format&fit=crop&q=80&w=600',
    colorName: 'Royal Blue & Crimson Gold',
    drapingStyles: ['South Indian Temple style', 'Mumtaz Drape'],
    fabricScale: { soft: 90, weight: 90 }
  },
  {
    catalog_id: 'M3',
    id: 'NSY0088',
    styleid: 'BANARASI CRIMSON XP',
    title: 'Brocade Banarasi',
    category: 'Katan Silk Zari',
    price: '₹34,500',
    originalPrice: '₹45,000',
    discount: '23% OFF',
    rating: '4.8',
    reviewsCount: '210',
    badge: 'Highly Exclusive',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
    image_back: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    colorName: 'Crimson Vermillion',
    drapingStyles: ['Bengali Athpouree Style', 'Traditional Gown drape'],
    fabricScale: { soft: 70, weight: 95 }
  },
  {
    catalog_id: 'M4',
    id: 'NSY0101',
    styleid: 'CHANDERI LACE PC-04',
    title: 'Gossamer Chanderi',
    category: 'Cotton Silk Blend',
    price: '₹9,800',
    originalPrice: '₹12,500',
    discount: '21% OFF',
    rating: '4.7',
    reviewsCount: '64',
    badge: 'Summer Luxury',
    image: 'https://images.unsplash.com/photo-1583391265517-35bbadd01209?auto=format&fit=crop&q=80&w=600',
    image_back: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
    colorName: 'Peach Zari Veil',
    drapingStyles: ['Modern Casual Nivi', 'Neck Wrap Style'],
    fabricScale: { soft: 95, weight: 45 }
  },
  {
    catalog_id: 'M5',
    id: 'NSY0120',
    styleid: 'PATOLA DOUBLE GEOMETRIC',
    title: 'Patan Patola Silk',
    category: 'Double Ikat Weave',
    price: '₹48,000',
    originalPrice: '₹60,000',
    discount: '20% OFF',
    rating: '4.9',
    reviewsCount: '42',
    badge: 'Artisanal Treasure',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    image_back: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
    colorName: 'Madder Red & Mustard',
    drapingStyles: ['Gujarati Seedha Pallu', 'Dhoti Style'],
    fabricScale: { soft: 80, weight: 80 }
  }
];

export default function TestCollectionPage() {
  // --- REAL HOMEPAGE STATE & HOOKS ---
  const { 
    products, 
    heroSlides, 
    categoryCards,
    cart, 
    addToCart, 
    removeFromCart, 
    wishlist, 
    toggleWishlist: toggleGlobalWishlist 
  } = useApp();

  const [slideIndex, setSlideIndex] = useState(0);
  const [fadeText, setFadeText] = useState(false);
  const [timeLeft, setTimeLeft] = useState('12H:12M:31S');

  // --- TACTILE SWIPING SLIDER STATE ---
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDetailItem, setActiveDetailItem] = useState(null);
  const [customToast, setCustomToast] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const dragStartRef = useRef(0);
  const categorySectionRef = useRef(null);

  // Auto-play timer for hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides]);

  // Live Countdown Timer
  useEffect(() => {
    let totalSeconds = 12 * 3600 + 12 * 60 + 31;
    const interval = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}H:${minutes.toString().padStart(2, '0')}M:${seconds.toString().padStart(2, '0')}S`
        );
      } else {
        totalSeconds = 12 * 3600;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNextSlide = () => {
    setFadeText(true);
    setTimeout(() => {
      setSlideIndex((prev) => (prev + 1) % (heroSlides?.length || 1));
      setFadeText(false);
    }, 455);
  };

  const handlePrevSlide = () => {
    setFadeText(true);
    setTimeout(() => {
      setSlideIndex((prev) => (prev - 1 + (heroSlides?.length || 1)) % (heroSlides?.length || 1));
      setFadeText(false);
    }, 455);
  };

  const activeSlide = (heroSlides && heroSlides[slideIndex]) || { subtitle: '', title: '', desc: '', image: '' };

  // --- SWIPING SLIDER AUTO-PLAY TIMER ---
  useEffect(() => {
    if (!isAutoPlaying || isDragging || activeDetailItem || isHovered) {
      return;
    }
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SAREE_COLLECTIONS.length);
    }, 3000); // 3 seconds automatic transition rate
    return () => clearInterval(timer);
  }, [isAutoPlaying, isDragging, activeDetailItem, isHovered]);

  const showToast = (message, isGold = true) => {
    setCustomToast({ message, isGold });
    setTimeout(() => {
      setCustomToast(null);
    }, 2800);
  };

  // --- STATE-SYNC WITH GLOBAL APP CONTEXT ---
  const isWishlisted = (id) => wishlist.some(p => p.id === id);
  const isInCart = (id) => cart.some(p => p.id === id);

  const handleToggleWishlist = (item, e) => {
    e.stopPropagation();
    const productSchema = {
      id: item.id,
      catalog_id: item.catalog_id,
      styleid: item.styleid,
      name: item.title,
      price: parseInt(item.price.replace(/[^\d]/g, '')),
      image: item.image,
      category: item.category,
      color: item.colorName
    };
    toggleGlobalWishlist(productSchema);
    if (!isWishlisted(item.id)) {
      showToast(`Added ${item.title} to Wishlist!`, true);
    } else {
      showToast(`Removed ${item.title} from Wishlist!`, false);
    }
  };

  const handleToggleCart = (item, e) => {
    e.stopPropagation();
    const productSchema = {
      id: item.id,
      catalog_id: item.catalog_id,
      styleid: item.styleid,
      name: item.title,
      price: parseInt(item.price.replace(/[^\d]/g, '')),
      image: item.image,
      category: item.category,
      color: item.colorName
    };
    if (isInCart(item.id)) {
      removeFromCart(item.id);
      showToast(`Removed ${item.title} from Bag!`, false);
    } else {
      addToCart(productSchema);
      showToast(`Added ${item.title} to Bag!`, true);
    }
  };

  // --- TOUCH & MOUSE SWIPE PHYSICS GESTURES ---
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    dragStartRef.current = clientX;
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const diff = clientX - dragStartRef.current;
    const resistance = diff < 0 ? 0.85 : 0.65;
    setDragOffset(diff * resistance);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 80;
    if (dragOffset < -threshold) {
      setActiveIndex((prev) => (prev + 1) % SAREE_COLLECTIONS.length);
    } else if (dragOffset > threshold) {
      setActiveIndex((prev) => (prev - 1 + SAREE_COLLECTIONS.length) % SAREE_COLLECTIONS.length);
    }
    setDragOffset(0);
  };

  const onMouseDown = (e) => handleDragStart(e.clientX);
  const onMouseMove = (e) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();

  const onTouchStart = (e) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  return (
    <div className="space-y-12 pb-24 relative">
      {/* SCOPED SLIDER STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        .deck-card-container {
            position: relative;
            width: 300px;
            height: 450px;
            margin: 0 auto;
            touch-action: none;
        }

        .deck-card {
            position: absolute;
            width: 300px;
            height: 450px;
            background: #0f1d3c;
            border-radius: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            pointer-events: auto;
        }

        .dark .deck-card {
            background: #0b152d;
            border-color: rgba(255, 255, 255, 0.05);
        }

        .deck-badge-glass {
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
      ` }} />

      {/* Dynamic Toast System */}
      {customToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl backdrop-blur-xl shadow-2xl flex items-center gap-3 border"
             style={{
               background: 'rgba(12, 30, 68, 0.95)',
               borderColor: customToast.isGold ? GOLD_ACCENT : '#ffffff33',
               animation: 'bounce 0.5s ease-out'
             }}>
          <span style={{ color: customToast.isGold ? GOLD_ACCENT : '#ffffff' }}>✨</span>
          <p className="text-sm tracking-wide font-medium text-gray-100">{customToast.message}</p>
        </div>
      )}

      {/* Promo Bar */}
      <div className="w-full bg-rose-600/90 dark:bg-rose-950/90 text-white py-2 px-4 rounded-xl flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm shadow-md border border-rose-500/20 glass animate-pulse-subtle">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>Sale Is Live! • 50% Off On All Sarees</span>
        </div>
        <div className="flex items-center gap-2 font-mono bg-black/25 px-3 py-1 rounded-lg border border-white/10">
          <span>⏱️</span>
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Hero Header Section */}
      <header className="max-w-5xl mx-auto bg-[#0c1e44]/95 text-white px-3.5 pb-3.5 pt-8 sm:pt-14 rounded-tl-4xl rounded-b-4xl relative z-0 overflow-hidden glass page-hero">
        <div className="w-full flex justify-center overflow-hidden py-6 sm:py-8 select-none">
          <span className="font-anton font-black text-[11.5vw] sm:text-[12vw] md:text-[90px] leading-none tracking-wider text-white/95 dark:text-[#f1bf0a] uppercase text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] inline-block select-none transform scale-x-135 scale-y-135 sm:scale-x-145 sm:scale-y-140 md:scale-x-160 md:scale-y-150 origin-center hero-title-span w-auto">
            REENAT
          </span>
        </div>

        <div className="mt-6 sm:mt-12 pt-7 bg-[#183fad]/40 dark:bg-black/25 rounded-4xl glass">
          <div className="flex flex-col sm:flex-row sm:items-stretch justify-between bg-transparent rounded-b-4xl relative z-10 px-3 sm:px-6 pb-6">
            <div className="flex flex-col justify-between">
              <span className={`uppercase tracking-[0.35em] text-sm text-[#F1BF0A] carousel-text-transition ${fadeText ? 'carousel-text-hidden' : ''}`}>
                {activeSlide.subtitle}
              </span>
              <h2 className={`text-[#F1BF0A] text-4xl sm:text-5xl font-anton tracking-wider carousel-text-transition ${fadeText ? 'carousel-text-hidden' : ''}`}>
                {activeSlide.title}
              </h2>
              <p className={`mt-2 mb-6 sm:mb-0 sm:mt-0 sm:max-w-xs z-200 text-slate-100/90 carousel-text-transition ${fadeText ? 'carousel-text-hidden' : ''}`}>
                {activeSlide.desc}
              </p>
            </div>

            <Link 
              href="/reviews"
              className="hidden sm:block bg-white/10 dark:bg-white/5 rounded-2xl p-4 text-white sm:max-w-[185px] glass border border-white/10 shadow-inner hover:scale-[1.03] transition-transform duration-200 hover:no-underline select-none cursor-pointer block"
            >
              <div className="flex items-center gap-4 sm:gap-0 sm:flex-col sm:items-start">
                <span className="text-4xl font-bold">98%</span>
                <div className="flex -space-x-3 my-3">
                  <div className="inline-flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-xs border border-white/20 shadow-sm">R</div>
                  <div className="inline-flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white font-bold text-xs border border-white/20 shadow-sm">P</div>
                  <div className="inline-flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold text-xs border border-white/20 shadow-sm">S</div>
                </div>
              </div>
              <p className="text-sm text-slate-200">Customer satisfaction rating across all orders</p>
            </Link>
          </div>

          <div className="flex items-stretch justify-between relative z-5">
            <div className="pb-3 pl-3 sm:p-6 rounded-tr-4xl rounded-bl-4xl relative glass">
              <a href="#product-list" className="flex items-center gap-2 btn-primary rounded-full py-2 px-5 whitespace-nowrap transition-transform duration-300 hover:scale-105 shadow-md font-semibold">
                <span>Shop Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
              </a>
            </div>
            <div className="hidden sm:block flex-1 rounded-b-4xl relative z-10"></div>
            <div className="flex items-center gap-3 bg-white/10 dark:bg-black/15 p-3.5 sm:p-6 rounded-tl-4xl rounded-br-4xl relative glass">
              <button 
                type="button" 
                onClick={handlePrevSlide}
                aria-label="Previous image"
                className="flex items-center justify-center bg-[#F1BF0A] hover:bg-yellow-500 rounded-full p-2.5 text-slate-900 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                </svg>
              </button>
              <button 
                type="button" 
                onClick={handleNextSlide}
                aria-label="Next image"
                className="flex items-center justify-center bg-[#F1BF0A] hover:bg-yellow-500 rounded-full p-2.5 text-slate-900 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <img 
          id="hero-image" 
          src={activeSlide.image} 
          alt={activeSlide.title} 
          className={`block object-contain h-[95vw] max-h-[420px] md:h-[56vw] md:max-h-135 absolute bottom-6 left-1/2 z-[100] select-none pointer-events-none animate-float carousel-image-transition ${fadeText ? 'carousel-image-hidden' : ''}`}
          style={{ filter: "drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.4))" }}
        />
      </header>

      {/* Trust Badges Row */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-5 gap-1 sm:gap-4 py-6 border-y border-slate-200 dark:border-white/10 text-center">
        <div className="flex flex-col items-center p-1">
          <div className="size-10 sm:size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 sm:size-6">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h1" />
              <path d="M15 18H9" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-5.65a1 1 0 0 0-.293-.707l-2.6-2.6A1 1 0 0 0 18.4 8H15" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-[10px] sm:text-sm leading-tight">Free Shipping</span>
          <span className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-xs mt-0.5 leading-tight">Across India</span>
        </div>

        <div className="flex flex-col items-center p-1">
          <div className="size-10 sm:size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 sm:size-6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 11 2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-[10px] sm:text-sm leading-tight">Assured Quality</span>
          <span className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-xs mt-0.5 leading-tight">Handloom cert.</span>
        </div>

        <div className="flex flex-col items-center p-1">
          <div className="size-10 sm:size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 sm:size-6">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-[10px] sm:text-sm leading-tight">Secure Payment</span>
          <span className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-xs mt-0.5 leading-tight">UPI & Cards</span>
        </div>

        <div className="flex flex-col items-center p-1">
          <div className="size-10 sm:size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 sm:size-6">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
              <polyline points="7.5 19.79 7.5 14.6 3 12" />
              <polyline points="21 12 16.5 14.6 16.5 19.79" />
              <polyline points="12 22 12 14.6" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-[10px] sm:text-sm leading-tight">100% Protection</span>
          <span className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-xs mt-0.5 leading-tight">Easy returns</span>
        </div>

        <div className="flex flex-col items-center p-1">
          <div className="size-10 sm:size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 sm:size-6">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-[10px] sm:text-sm leading-tight">Price Promise</span>
          <span className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-xs mt-0.5 leading-tight">Direct source</span>
        </div>
      </div>

      {/* --- INTEGRATED LUXURY SWIPING CARD DECK SECTION --- */}
      <section className="w-full max-w-5xl mx-auto py-6 relative text-center">
        <div className="max-w-md mx-auto px-4 mb-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#F1BF0A] font-bold block mb-1">Handloom Treasures</span>
          <h2 className="font-anton text-2xl sm:text-3xl tracking-widest text-slate-800 dark:text-slate-100 uppercase">
            Signature Collections
          </h2>
          <div className="h-[2px] w-24 bg-[#F1BF0A] mx-auto mt-2.5"></div>
        </div>

        {/* Card Stack Drag Bounds */}
        <div className="deck-card-container relative z-10 select-none overflow-visible py-4"
             onTouchStart={onTouchStart}
             onTouchMove={onTouchMove}
             onTouchEnd={onTouchEnd}
             onMouseDown={onMouseDown}
             onMouseMove={onMouseMove}
             onMouseUp={onMouseUp}
             onMouseLeave={(e) => {
               handleDragEnd();
               setIsHovered(false);
             }}
             onMouseEnter={() => setIsHovered(true)}>
          
          {SAREE_COLLECTIONS.map((item, index) => {
            const diff = (index - activeIndex + SAREE_COLLECTIONS.length) % SAREE_COLLECTIONS.length;
            if (diff > 2) return null;

            // Positioning calculations for stacked card physics
            let scale = 1 - diff * 0.08;
            let translateRight = diff * 24;
            let rotateDeg = diff * 2.5;
            let zIndex = 30 - diff;
            let opacity = 1 - diff * 0.35;
            let blur = diff * 1.5;

            // Gesture interpolations
            if (diff === 0 && isDragging) {
              rotateDeg = dragOffset * 0.04;
              opacity = 1 - Math.min(Math.abs(dragOffset) / 380, 0.4);
            } else if (diff === 1 && isDragging) {
              const pullRatio = Math.min(Math.abs(dragOffset) / 120, 1);
              scale = 0.92 + (0.08 * pullRatio);
              translateRight = 24 - (24 * pullRatio);
              rotateDeg = 2.5 - (2.5 * pullRatio);
              opacity = 0.65 + (0.35 * pullRatio);
              blur = 1.5 - (1.5 * pullRatio);
            } else if (diff === 2 && isDragging) {
              const pullRatio = Math.min(Math.abs(dragOffset) / 120, 1);
              scale = 0.84 + (0.08 * pullRatio);
              translateRight = 48 - (24 * pullRatio);
              rotateDeg = 5 - (2.5 * pullRatio);
              opacity = 0.3 + (0.35 * pullRatio);
              blur = 3.0 - (1.5 * pullRatio);
            }

            const style = {
              transform: diff === 0 
                ? `translateX(${dragOffset}px) scale(${scale}) rotate(${rotateDeg}deg)`
                : `translateX(${translateRight}px) scale(${scale}) rotate(${rotateDeg}deg)`,
              zIndex: zIndex,
              opacity: opacity,
              filter: `blur(${blur}px)`,
              transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease, filter 0.4s ease',
              cursor: isDragging ? 'grabbing' : 'grab'
            };

            return (
              <div key={item.id}
                   style={style}
                   className="deck-card absolute left-1/2 -translate-x-1/2 text-left">
                
                {/* Image Section */}
                <div className="relative w-full h-[300px] overflow-hidden select-none pointer-events-none">
                  <img src={item.image} 
                       alt={item.title} 
                       className="w-full h-full object-cover select-none pointer-events-none"
                       draggable="false" />
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                    <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase deck-badge-glass text-white">
                      {item.badge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase bg-[#F1BF0A] text-black">
                      {item.catalog_id} / {item.id}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 deck-badge-glass rounded-full px-2.5 py-1 flex items-center gap-1">
                    <span className="text-[#F1BF0A] text-xs">★</span>
                    <span className="text-[10px] font-bold text-white">{item.rating}</span>
                  </div>

                  {/* Bottom Text Box Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col gap-0.5">
                    <p className="text-[11px] tracking-widest text-amber-200 uppercase font-medium">{item.category}</p>
                    <h3 className="text-lg font-serif font-bold text-white tracking-wide">{item.title}</h3>
                    <p className="text-[10px] text-gray-300 tracking-wide font-mono">SKU: {item.styleid}</p>
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex flex-col gap-2.5 pointer-events-auto">
                    {/* Wishlist Button */}
                    <button onClick={(e) => handleToggleWishlist(item, e)}
                            className="w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center transition shadow-lg active:scale-95 cursor-pointer"
                            style={{
                              background: isWishlisted(item.id) ? 'rgba(241, 191, 10, 0.25)' : 'rgba(0, 0, 0, 0.5)',
                              borderColor: isWishlisted(item.id) ? GOLD_ACCENT : 'rgba(255, 255, 255, 0.15)'
                            }}>
                      <svg className="w-5 h-5 transition-transform duration-300"
                           style={{
                             fill: isWishlisted(item.id) ? GOLD_ACCENT : 'none',
                             stroke: isWishlisted(item.id) ? GOLD_ACCENT : '#ffffff',
                             transform: isWishlisted(item.id) ? 'scale(1.15)' : 'scale(1)'
                           }}
                           viewBox="0 0 24 24" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                      </svg>
                    </button>

                    {/* Cart Button */}
                    <button onClick={(e) => handleToggleCart(item, e)}
                            className="w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center transition shadow-lg active:scale-95 cursor-pointer"
                            style={{
                              background: isInCart(item.id) ? '#F1BF0A' : 'rgba(0,0,0,0.5)',
                              borderColor: isInCart(item.id) ? GOLD_ACCENT : 'rgba(255,255,255,0.15)'
                            }}>
                      {isInCart(item.id) ? (
                        <svg className="w-4.5 h-4.5 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Details Row */}
                <div className="p-4 flex-1 bg-[#0c1e44] dark:bg-[#080f1e] flex flex-col justify-between select-none">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">PREMIUM PRICE</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{item.price}</span>
                        <span className="text-xs text-gray-500 line-through">{item.originalPrice}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-red-950 border border-red-800 text-red-300 font-bold px-2 py-0.5 rounded-full">
                      {item.discount}
                    </span>
                  </div>

                  {/* Detail Panel Trigger */}
                  <button onClick={(e) => {
                            e.stopPropagation();
                            setActiveDetailItem(item);
                          }}
                          className="w-full mt-2.5 py-2.5 rounded-xl border border-[#F1BF0A]/30 text-white font-medium text-xs tracking-wider uppercase transition-colors hover:bg-[#F1BF0A] hover:text-black hover:border-transparent active:scale-98 cursor-pointer">
                    Inspect Craftsmanship
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Autoplay & Pagination Control Interface below the card deck */}
        <div className="flex flex-col items-center gap-1.5 mt-4 text-slate-600 dark:text-slate-400 z-20 relative select-none">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAutoPlaying && !isHovered && !activeDetailItem ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <p className="text-[10px] tracking-widest uppercase font-bold text-slate-500 dark:text-slate-400">
              {isHovered ? 'Paused (Hovering)' : activeDetailItem ? 'Paused (Viewing Details)' : isAutoPlaying ? 'Autoplay active' : 'Swipe deck to discover'}
            </p>
            <button onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="ml-2 px-2.5 py-0.5 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white rounded text-[9px] font-bold border border-slate-300 dark:border-white/10 hover:bg-[#F1BF0A] hover:text-black transition cursor-pointer">
              {isAutoPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
          
          <div className="flex gap-5 mt-1 items-center">
            <button onClick={() => setActiveIndex((prev) => (prev - 1 + SAREE_COLLECTIONS.length) % SAREE_COLLECTIONS.length)}
                    className="text-xs font-bold text-[#F1BF0A] hover:opacity-85 transition cursor-pointer border-none bg-transparent">
              ← Prev Collection
            </button>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-200/50 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-300/30 dark:border-white/5">
              {activeIndex + 1} / {SAREE_COLLECTIONS.length}
            </span>
            <button onClick={() => setActiveIndex((prev) => (prev + 1) % SAREE_COLLECTIONS.length)}
                    className="text-xs font-bold text-[#F1BF0A] hover:opacity-85 transition cursor-pointer border-none bg-transparent">
              Next Collection →
            </button>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="category-section-custom" id="categorySection" ref={categorySectionRef}>
        <h2 className="section-title-custom">Category</h2>
        <div className="grid-container-custom">
          {/* Static rendering helper for mobile/desktop layout switches */}
          <div className="block md:hidden">
            <div className="grid-grid-custom">
              {categoryCards?.map((card, idx) => (
                <Link href={card.link} key={idx} className="orb-link-custom hover:no-underline">
                  <div className="orb-wrapper-custom" style={{ '--index-custom': idx }}>
                    <div className="orb-custom">
                      <img src={card.image} alt={card.name} />
                    </div>
                    <span className="orb-label-custom">{card.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex-row-custom">
              {categoryCards?.map((card, idx) => (
                <Link href={card.link} key={idx} className="orb-link-custom hover:no-underline">
                  <div className="orb-wrapper-custom" style={{ '--index-custom': idx }}>
                    <div className="orb-custom">
                      <img src={card.image} alt={card.name} />
                    </div>
                    <span className="orb-label-custom">{card.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Area */}
      <main className="max-w-5xl mx-auto overflow-hidden px-2 mt-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-10">
          <h1 className="font-anton text-5xl/14 md:text-6xl/18 flex-1">
            EXPLORE THE <br className="hidden md:inline" /> SAREE COLLECTION
          </h1>
          <div className="flex-1 space-y-4">
            <p className="text-slate-705 dark:text-slate-300">
              Discover curated handloom sarees — from classic silks to contemporary weaves. Limited pieces available.
            </p>
            <a href="#product-list" className="inline-flex items-center gap-2 bg-[#F1BF0A] hover:bg-yellow-500 rounded-full py-2 px-5 text-slate-900 font-semibold transition-transform duration-300 hover:scale-105 active:scale-95 shadow-md">
              <span>Explore Collection</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Product Grid */}
        <ul id="product-list" className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-3 mt-8">
          {products && products.length > 0 ? (() => {
            const seenCatalogs = new Set();
            const uniqueProducts = products.filter(product => {
              if (!product.catalogId) return true;
              const cid = product.catalogId.toLowerCase();
              if (seenCatalogs.has(cid)) return false;
              seenCatalogs.add(cid);
              return true;
            });
            return uniqueProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ));
          })() : (
            <ProductSkeletonGrid count={6} />
          )}
        </ul>
      </main>

      {/* Slide-Up Bottom Detail Sheet Drawer */}
      {activeDetailItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col justify-end transition-all select-none">
          {/* Backdrop closer click hook */}
          <div className="flex-1" onClick={() => setActiveDetailItem(null)}></div>
          
          {/* Slide-Up drawer container */}
          <div className="w-full max-h-[85%] sm:max-w-xl sm:mx-auto bg-[#0c1e44] border-t-2 border-[#F1BF0A] rounded-t-[35px] shadow-2xl p-6 flex flex-col overflow-y-auto text-white font-sans">
            
            {/* Close handlebar */}
            <div className="w-12 h-1 bg-white/20 rounded-full self-center mb-5 cursor-pointer"
                 onClick={() => setActiveDetailItem(null)}></div>

            {/* Header section */}
            <div className="flex justify-between items-start gap-4 text-left">
              <div>
                <span className="text-[10px] tracking-widest text-[#F1BF0A] uppercase font-bold">Product Blueprint ({activeDetailItem.id})</span>
                <h3 className="text-2xl font-serif font-bold text-white tracking-wide mt-0.5">{activeDetailItem.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{activeDetailItem.category} • SKU: {activeDetailItem.styleid}</p>
              </div>
              <button onClick={() => setActiveDetailItem(null)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 cursor-pointer border-none">
                ✕
              </button>
            </div>

            {/* Photo gallery */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="h-40 rounded-2xl overflow-hidden border border-white/5">
                <img src={activeDetailItem.image} alt="Front View" className="w-full h-full object-cover" />
              </div>
              <div className="h-40 rounded-2xl overflow-hidden border border-white/5">
                <img src={activeDetailItem.image_back} alt="Back Detail" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Color name */}
            <div className="mt-4 flex flex-col gap-1 text-left">
              <span className="text-[10px] tracking-wider text-gray-400 uppercase">AUTHENTIC TONE</span>
              <p className="text-sm font-semibold text-[#F1BF0A]">{activeDetailItem.colorName}</p>
            </div>

            {/* Composition stats */}
            <div className="mt-5 flex flex-col gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
              <span className="text-[10px] tracking-widest text-[#F1BF0A] uppercase font-bold">Textile Composition Metrics</span>
              
              {/* Scale A: Softness */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium text-gray-300">
                  <span>Loom Softness</span>
                  <span>{activeDetailItem.fabricScale.soft}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F1BF0A] rounded-full transition-all" style={{ width: `${activeDetailItem.fabricScale.soft}%` }}></div>
                </div>
              </div>

              {/* Scale B: Weight density */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium text-gray-300">
                  <span>Festive Weight (Density)</span>
                  <span>{activeDetailItem.fabricScale.weight}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${activeDetailItem.fabricScale.weight}%` }}></div>
                </div>
              </div>
            </div>

            {/* Recommended Drapings */}
            <div className="mt-5 flex flex-col gap-2 text-left">
              <span className="text-[10px] tracking-wider text-gray-400 uppercase">LOOM STYLING RECOMMENDATIONS</span>
              <div className="flex flex-wrap gap-2">
                {activeDetailItem.drapingStyles.map((style) => (
                  <span key={style} className="text-[10px] bg-[#F1BF0A]/10 text-[#F1BF0A] border border-[#F1BF0A]/20 px-3 py-1 rounded-full">
                    {style}
                  </span>
                ))}
              </div>
            </div>

            {/* Add to Bag block */}
            <div className="mt-6 pt-2 border-t border-white/5 flex gap-3 items-center text-left">
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] text-gray-400">Total Price</span>
                <span className="text-xl font-bold text-white">{activeDetailItem.price}</span>
              </div>
              <button onClick={(e) => {
                        handleToggleCart(activeDetailItem, e);
                        setActiveDetailItem(null);
                      }}
                      className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition bg-[#F1BF0A] text-black cursor-pointer border-none shadow-md">
                {isInCart(activeDetailItem.id) ? 'In Your Bag' : 'Add to Bag'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
