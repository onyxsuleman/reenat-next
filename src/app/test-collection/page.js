'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import { ProductSkeletonGrid } from '../../components/ProductSkeleton';

export default function TestCollectionPage() {
  // --- REAL HOMEPAGE STATE & HOOKS ---
  const { products, heroSlides, categoryCards, collectionCards } = useApp();
  const [slideIndex, setSlideIndex] = useState(0);
  const [fadeText, setFadeText] = useState(false);
  const [timeLeft, setTimeLeft] = useState('12H:12M:31S');
  const collectionsRef = useRef(null);

  // --- COLLECTION SANDBOX STATE ---
  const [layoutOption, setLayoutOption] = useState('glass-cards'); // 'glass-cards', 'accordion', '3d-tilt'
  const [hoveredAccordionIndex, setHoveredAccordionIndex] = useState(0);
  const [tiltCoords, setTiltCoords] = useState({ x: 0, y: 0, index: null });

  // Auto-play timer for hero carousel
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

  const scrollCollections = (direction) => {
    if (collectionsRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      collectionsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeSlide = (heroSlides && heroSlides[slideIndex]) || { subtitle: '', title: '', desc: '', image: '' };

  // --- 3D TILT CALCULATION ---
  const handleMouseMove = (e, index) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Normalize coordinates (-10 to 10 degrees max tilt)
    const rotateX = (mouseY / (height / 2)) * -10;
    const rotateY = (mouseX / (width / 2)) * 10;
    
    setTiltCoords({ x: rotateX, y: rotateY, index });
  };

  const handleMouseLeave = () => {
    setTiltCoords({ x: 0, y: 0, index: null });
  };

  return (
    <div className="space-y-12 pb-24 relative">
      {/* SCOPED SANDBOX STYLE SHEETS */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* --- Redesigned Collection Custom Styles --- */

        /* 1. Glassmorphic Slider Styles */
        .glass-collection-card {
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 
                0 4px 15px rgba(0, 0, 0, 0.05),
                0 10px 30px rgba(139, 115, 85, 0.08);
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .dark .glass-collection-card {
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 
                0 4px 20px rgba(0, 0, 0, 0.3),
                0 10px 35px rgba(0, 0, 0, 0.2);
        }

        .glass-collection-card:hover {
            transform: translateY(-8px) scale(1.02);
            border-color: #F1BF0A;
            box-shadow: 
                0 20px 40px rgba(241, 191, 10, 0.12),
                0 12px 30px rgba(0, 0, 0, 0.08);
        }

        .glass-collection-overlay {
            background: linear-gradient(to top, rgba(12, 30, 68, 0.9) 0%, rgba(12, 30, 68, 0.3) 60%, transparent 100%);
            transition: all 0.4s ease;
        }

        .glass-collection-card:hover .glass-collection-overlay {
            background: linear-gradient(to top, rgba(12, 30, 68, 0.95) 0%, rgba(12, 30, 68, 0.5) 75%, rgba(12, 30, 68, 0.1) 100%);
        }

        .collection-btn-reveal {
            opacity: 0;
            transform: translateY(15px);
            transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .glass-collection-card:hover .collection-btn-reveal {
            opacity: 1;
            transform: translateY(0);
        }

        /* 2. Accordion Layout Styles */
        .accordion-wrapper {
            display: flex;
            gap: 16px;
            width: 100%;
            height: 380px;
            overflow: hidden;
            border-radius: 24px;
        }

        .accordion-card {
            flex: 1;
            height: 100%;
            position: relative;
            overflow: hidden;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.6s cubic-bezier(0.25, 1, 0.3, 1);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .accordion-card.is-active {
            flex: 2.8;
            border-color: rgba(241, 191, 10, 0.5);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .accordion-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.8s ease;
        }

        .accordion-card.is-active img {
            transform: scale(1.05);
        }

        .accordion-text-container {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            transform: rotate(180deg);
            transition: all 0.5s ease;
        }

        .accordion-card.is-active .accordion-text-container {
            writing-mode: horizontal-tb;
            text-orientation: unset;
            transform: rotate(0deg);
        }

        /* 3. 3D Tilt Card Grid Styles */
        .tilt-card-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 24px;
        }
        @media (min-width: 640px) {
            .tilt-card-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        .tilt-card {
            border-radius: 24px;
            overflow: hidden;
            aspect-ratio: 4/5;
            position: relative;
            background: #181c26;
            cursor: pointer;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            transform-style: preserve-3d;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .tilt-inner {
            transform: translateZ(30px);
            transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }
      ` }} />

      {/* Sticky Sandbox Switcher Header */}
      <div className="sticky top-2 z-[999] bg-[#0c1e44]/95 backdrop-blur-md text-white p-3 rounded-2xl border border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
        <div>
          <span className="font-extrabold text-sm block text-[#F1BF0A] uppercase tracking-wider">📦 Collection Sandbox Panel</span>
          <span className="text-[10px] opacity-80 block">Toggle collection section layouts live</span>
        </div>
        <div className="flex bg-black/30 p-1 rounded-full border border-white/5">
          <button 
            type="button" 
            onClick={() => setLayoutOption('glass-cards')}
            className={`text-xs font-bold py-1.5 px-3 rounded-full cursor-pointer transition-colors ${
              layoutOption === 'glass-cards' ? 'bg-[#F1BF0A] text-slate-900' : 'text-slate-300 hover:text-white'
            }`}
          >
            Glass Slider
          </button>
          <button 
            type="button" 
            onClick={() => setLayoutOption('accordion')}
            className={`text-xs font-bold py-1.5 px-3 rounded-full cursor-pointer transition-colors ${
              layoutOption === 'accordion' ? 'bg-[#F1BF0A] text-slate-900' : 'text-slate-300 hover:text-white'
            }`}
          >
            Accordion Banner
          </button>
          <button 
            type="button" 
            onClick={() => setLayoutOption('3d-tilt')}
            className={`text-xs font-bold py-1.5 px-3 rounded-full cursor-pointer transition-colors ${
              layoutOption === '3d-tilt' ? 'bg-[#F1BF0A] text-slate-900' : 'text-slate-300 hover:text-white'
            }`}
          >
            3D Tilt Grid
          </button>
        </div>
      </div>

      {/* --- REAL HOME PAGE CONTENT --- */}

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
          <span className="font-anton text-[11vw] sm:text-[12vw] md:text-[100px] leading-none tracking-wider text-white/95 dark:text-[#f1bf0a] uppercase w-full text-center drop-shadow-md block select-none">
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

      {/* --- Redesigned Sandboxed Collection Section --- */}
      <section className="w-full max-w-5xl mx-auto py-4 relative">
        <h2 className="font-anton text-2xl tracking-widest text-slate-800 dark:text-slate-100 mb-8 px-4 text-center sm:text-left">
          COLLECTION <span className="text-xs font-sans text-amber-500 lowercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold ml-2">Testing Option: {layoutOption}</span>
        </h2>

        {/* layoutOption === 'glass-cards' */}
        {layoutOption === 'glass-cards' && (
          <div className="relative">
            <div className="absolute right-4 -top-14 flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => scrollCollections('left')} 
                aria-label="Scroll left"
                className="flex items-center justify-center bg-[#F1BF0A] hover:bg-yellow-500 rounded-full p-2 text-slate-900 shadow-md cursor-pointer hover:scale-105 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button 
                type="button" 
                onClick={() => scrollCollections('right')} 
                aria-label="Scroll right"
                className="flex items-center justify-center bg-[#F1BF0A] hover:bg-yellow-500 rounded-full p-2 text-slate-900 shadow-md cursor-pointer hover:scale-105 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            <div 
              ref={collectionsRef}
              className="flex gap-6 overflow-x-auto px-4 pb-6 snap-x scrollbar-none scroll-smooth"
            >
              {collectionCards?.map((card, idx) => (
                <div key={idx} className="w-72 sm:w-80 shrink-0 snap-center relative rounded-3xl overflow-hidden aspect-[4/3] group glass-collection-card border">
                  <img src={card.image || "/saree_kanjivaram.png"} alt={card.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 glass-collection-overlay flex flex-col justify-end p-5">
                    <span className="text-[#F1BF0A] text-[10px] font-bold tracking-widest uppercase mb-1 drop-shadow-sm">Saree Weaves</span>
                    <a href={card.link || "#product-list"} className="font-anton text-xl tracking-wider text-white hover:text-[#F1BF0A] uppercase transition-colors hover:no-underline mb-3 drop-shadow-md">{card.name}</a>
                    <div className="collection-btn-reveal">
                      <a href={card.link || "#product-list"} className="inline-flex items-center gap-1.5 bg-[#F1BF0A] hover:bg-yellow-500 text-slate-900 text-xs font-bold py-2 px-4 rounded-full transition-transform active:scale-95 hover:no-underline shadow-lg">
                        <span>View Collection</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* layoutOption === 'accordion' */}
        {layoutOption === 'accordion' && (
          <div className="px-4">
            <div className="accordion-wrapper">
              {collectionCards?.slice(0, 3).map((card, idx) => {
                const isActive = hoveredAccordionIndex === idx;
                return (
                  <div 
                    key={idx}
                    onMouseEnter={() => setHoveredAccordionIndex(idx)}
                    className={`accordion-card ${isActive ? 'is-active' : ''}`}
                  >
                    <img src={card.image || "/saree_kanjivaram.png"} alt={card.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-6">
                      <div className="w-full flex items-center justify-between">
                        <div className="flex flex-col text-left">
                          {isActive && (
                            <span className="text-[#F1BF0A] text-[10px] font-extrabold tracking-widest uppercase mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300">Handloom Premium</span>
                          )}
                          <h3 className={`font-anton text-white uppercase tracking-wider ${isActive ? 'text-2xl' : 'text-sm opacity-80'} transition-all duration-300`}>
                            {card.name}
                          </h3>
                        </div>
                        {isActive && (
                          <a 
                            href={card.link || "#product-list"}
                            className="bg-[#F1BF0A] hover:bg-yellow-500 text-slate-900 rounded-full p-2.5 shadow-lg hover:scale-105 active:scale-95 transition-all animate-in fade-in zoom-in-50 duration-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="size-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* layoutOption === '3d-tilt' */}
        {layoutOption === '3d-tilt' && (
          <div className="px-4">
            <div className="tilt-card-grid">
              {collectionCards?.slice(0, 3).map((card, idx) => {
                const isTilting = tiltCoords.index === idx;
                return (
                  <div 
                    key={idx}
                    onMouseMove={(e) => handleMouseMove(e, idx)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      perspective: '800px',
                    }}
                  >
                    <div
                      style={{
                        transform: isTilting ? `rotateX(${tiltCoords.x}deg) rotateY(${tiltCoords.y}deg) scale(1.03)` : 'rotateX(0) rotateY(0) scale(1)',
                        transition: isTilting ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                      }}
                      className="tilt-card"
                    >
                      <img src={card.image || "/saree_kanjivaram.png"} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex flex-col justify-end p-6">
                        <div className="tilt-inner text-left">
                          <span className="text-[#F1BF0A] text-[9px] font-black tracking-widest uppercase block mb-1">Exclusive Craft</span>
                          <h3 className="font-anton text-white text-xl uppercase tracking-wider mb-4">{card.name}</h3>
                          <a href={card.link || "#product-list"} className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-extrabold uppercase py-2 px-4 rounded-xl shadow-lg transition-transform active:scale-95 hover:no-underline">
                            <span>Explore Details</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
    </div>
  );
}
