'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { ProductSkeletonGrid } from '../components/ProductSkeleton';

const carouselSlides = [
  {
    subtitle: "Luxury Weaves",
    title: "KANJIVARAM SILK",
    desc: "Exquisite pure mulberry silk sarees woven with genuine gold zari borders, carrying centuries of wedding-day heritage.",
    image: "/assets/hero (1).png"
  },
  {
    subtitle: "Royal Heritage",
    title: "BANARASI WEAVE",
    desc: "Dense and luxurious brocades from Varanasi, featuring elaborate floral vines and silver filigree for celebrations.",
    image: "/assets/hero (2).png"
  },
  {
    subtitle: "Sheer Elegance",
    title: "CHANDERI CHARM",
    desc: "Whisper-light silk cotton blends adorned with delicate handwoven buttis, perfect for warm summers and day events.",
    image: "/assets/hero (3).png"
  },
  {
    subtitle: "Organic Splendor",
    title: "TUSSAR ELEGANCE",
    desc: "Naturally textured wild silk sarees with a soft golden sheen, celebrating raw elegance and earth-toned charm.",
    image: "/assets/hero (4).png"
  },
  {
    subtitle: "Regal Drape",
    title: "ROYAL PAITHANI",
    desc: "Vibrant Maharashtrian silks detailed with spectacular peacock pallus and signature square borders.",
    image: "/assets/hero (5).png"
  },
  {
    subtitle: "Rare Golden Thread",
    title: "MUGA MARVEL",
    desc: "Assam’s exclusive golden silk, renowned for its glossy natural color and durability that outlasts a lifetime.",
    image: "/assets/hero (6).png"
  }
];

export default function Home() {
  const { products } = useApp();
  const [slideIndex, setSlideIndex] = useState(0);
  const [fadeText, setFadeText] = useState(false);
  const [timeLeft, setTimeLeft] = useState('12H:12M:31S');
  const collectionsRef = useRef(null);

  // Auto-play timer for hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

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
      setSlideIndex((prev) => (prev + 1) % carouselSlides.length);
      setFadeText(false);
    }, 450);
  };

  const handlePrevSlide = () => {
    setFadeText(true);
    setTimeout(() => {
      setSlideIndex((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
      setFadeText(false);
    }, 450);
  };

  const scrollCollections = (direction) => {
    if (collectionsRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      collectionsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeSlide = carouselSlides[slideIndex];

  return (
    <div className="space-y-12">
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
        <div className="w-full flex justify-center overflow-hidden py-4 sm:py-6 select-none">
          <span className="font-anton text-[12vw] sm:text-[13vw] md:text-[14vw] leading-none tracking-wider text-white/95 dark:text-[#f1bf0a] uppercase w-full text-center drop-shadow-md">
            REENAT'S
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

            {/* Satisfaction Card */}
            <div className="hidden sm:block bg-white/10 dark:bg-white/5 rounded-2xl p-4 text-white sm:max-w-[185px] glass border border-white/10 shadow-inner">
              <div className="flex items-center gap-4 sm:gap-0 sm:flex-col sm:items-start">
                <span className="text-4xl font-bold">98%</span>
                <div className="flex -space-x-3 my-3">
                  <div className="inline-flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-xs border border-white/20 shadow-sm">R</div>
                  <div className="inline-flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white font-bold text-xs border border-white/20 shadow-sm">P</div>
                  <div className="inline-flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold text-xs border border-white/20 shadow-sm">S</div>
                </div>
              </div>
              <p className="text-sm text-slate-200">Customer satisfaction rating across all orders</p>
            </div>
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
      <div className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-4 py-8 border-y border-slate-200 dark:border-white/10 text-center">
        <div className="flex flex-col items-center p-2">
          <div className="size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h1" />
              <path d="M15 18H9" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-5.65a1 1 0 0 0-.293-.707l-2.6-2.6A1 1 0 0 0 18.4 8H15" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Free Shipping</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">Across all of India</span>
        </div>

        <div className="flex flex-col items-center p-2">
          <div className="size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 11 2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Assured Quality</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">Handloom certified</span>
        </div>

        <div className="flex flex-col items-center p-2">
          <div className="size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Secure Payment</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">UPI & Credit Cards</span>
        </div>

        <div className="flex flex-col items-center p-2 col-span-1">
          <div className="size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
              <polyline points="7.5 19.79 7.5 14.6 3 12" />
              <polyline points="21 12 16.5 14.6 16.5 19.79" />
              <polyline points="12 22 12 14.6" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">100% Protection</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">Easy returns policy</span>
        </div>

        <div className="flex flex-col items-center p-2 col-span-2 sm:col-span-1">
          <div className="size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 dark:text-[#F1BF0A] flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Best Price Promise</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">Direct from artisans</span>
        </div>
      </div>

      {/* Category Circles Section */}
      <section className="w-full max-w-5xl mx-auto py-4">
        <h2 className="font-anton text-center text-2xl tracking-widest text-slate-800 dark:text-slate-100 mb-8">CATEGORY</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
          <a href="#product-list" className="flex flex-col items-center group gap-3 hover:no-underline">
            <div className="size-24 sm:size-28 rounded-full overflow-hidden border-2 border-amber-500/30 group-hover:border-amber-500 group-hover:shadow-md transition-all duration-300 relative">
              <img src="/saree_kanjivaram.png" alt="Sarees" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wider group-hover:text-amber-500 transition-colors">SAREES</span>
          </a>

          <a href="#product-list" className="flex flex-col items-center group gap-3 hover:no-underline">
            <div className="size-24 sm:size-28 rounded-full overflow-hidden border-2 border-amber-500/30 group-hover:border-amber-500 group-hover:shadow-md transition-all duration-300 relative">
              <img src="/saree_banarasi.png" alt="Trending Styles" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wider group-hover:text-amber-500 transition-colors">TRENDING STYLES</span>
          </a>

          <a href="#product-list" className="flex flex-col items-center group gap-3 hover:no-underline">
            <div className="size-24 sm:size-28 rounded-full overflow-hidden border-2 border-amber-500/30 group-hover:border-amber-500 group-hover:shadow-md transition-all duration-300 relative">
              <img src="/saree_chanderi.png" alt="Popular This Week" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wider group-hover:text-amber-500 transition-colors">POPULAR THIS WEEK</span>
          </a>

          <a href="#product-list" className="flex flex-col items-center group gap-3 hover:no-underline">
            <div className="size-24 sm:size-28 rounded-full overflow-hidden border-2 border-amber-500/30 group-hover:border-amber-500 group-hover:shadow-md transition-all duration-300 relative">
              <img src="/saree_hero.png" alt="Clearance Zone" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wider group-hover:text-amber-500 transition-colors">CLEARANCE ZONE</span>
          </a>
        </div>
      </section>

      {/* Collection Section */}
      <section className="w-full max-w-5xl mx-auto py-4 relative">
        <div className="flex items-center justify-between mb-8 px-4">
          <h2 className="font-anton text-2xl tracking-widest text-slate-800 dark:text-slate-100">COLLECTION</h2>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => scrollCollections('left')} 
              aria-label="Scroll left"
              className="flex items-center justify-center bg-[#F1BF0A] hover:bg-yellow-500 rounded-full p-2 text-slate-900 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              type="button" 
              onClick={() => scrollCollections('right')} 
              aria-label="Scroll right"
              className="flex items-center justify-center bg-[#F1BF0A] hover:bg-yellow-500 rounded-full p-2 text-slate-900 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div 
          ref={collectionsRef}
          className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x scrollbar-none scroll-smooth"
        >
          <div className="w-72 sm:w-80 shrink-0 snap-center relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-lg border border-slate-200 dark:border-white/5">
            <img src="/saree_kanjivaram.png" alt="Sarees" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-5">
              <a href="#product-list" className="font-anton text-lg tracking-wider text-[#F1BF0A] hover:text-white uppercase transition-colors hover:no-underline">SAREES</a>
            </div>
          </div>

          <div className="w-72 sm:w-80 shrink-0 snap-center relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-lg border border-slate-200 dark:border-white/5">
            <img src="/saree_chanderi.png" alt="Popular This Week" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-5">
              <a href="#product-list" className="font-anton text-lg tracking-wider text-[#F1BF0A] hover:text-white uppercase transition-colors hover:no-underline">POPULAR THIS WEEK</a>
            </div>
          </div>

          <div className="w-72 sm:w-80 shrink-0 snap-center relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-lg border border-slate-200 dark:border-white/5">
            <img src="/saree_banarasi.png" alt="Trending Styles" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-5">
              <a href="#product-list" className="font-anton text-lg tracking-wider text-[#F1BF0A] hover:text-white uppercase transition-colors hover:no-underline">TRENDING STYLES</a>
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
          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <ProductSkeletonGrid count={6} />
          )}
        </ul>
      </main>
    </div>
  );
}
