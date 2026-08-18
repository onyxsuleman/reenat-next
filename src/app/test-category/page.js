'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import { ProductSkeletonGrid } from '../../components/ProductSkeleton';

export default function TestCategoryPage() {
  // --- REAL HOMEPAGE STATE & HOOKS ---
  const { products, heroSlides, categoryCards, collectionCards } = useApp();
  const [slideIndex, setSlideIndex] = useState(0);
  const [fadeText, setFadeText] = useState(false);
  const [timeLeft, setTimeLeft] = useState('12H:12M:31S');
  const collectionsRef = useRef(null);

  // --- TRANSITION TEST STATE & HOOKS ---
  const [resetOnScrollOut, setResetOnScrollOut] = useState(true);
  const [isRevealedState, setIsRevealedState] = useState(false);
  const categorySectionRef = useRef(null);

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

  // --- INTERSECTION OBSERVER FOR CATEGORY TRANSITION ---
  useEffect(() => {
    const categorySection = categorySectionRef.current;
    if (!categorySection) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2 // Triggers when 20% of the category section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          setIsRevealedState(true);
        } else {
          if (resetOnScrollOut) {
            entry.target.classList.remove('is-revealed');
            setIsRevealedState(false);
          }
        }
      });
    }, observerOptions);

    observer.observe(categorySection);

    return () => {
      observer.disconnect();
    };
  }, [resetOnScrollOut]);

  const scrollToCategory = () => {
    categorySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetAnimation = () => {
    if (categorySectionRef.current) {
      categorySectionRef.current.classList.remove('is-revealed');
      setIsRevealedState(false);
      setTimeout(() => {
        const rect = categorySectionRef.current.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom >= 0;
        if (inViewport) {
          categorySectionRef.current.classList.add('is-revealed');
          setIsRevealedState(true);
        }
      }, 100);
    }
  };

  return (
    <div className="space-y-12 pb-24 relative">
      {/* SCOPED CUSTOM TRANSITION STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
            --cream-bg-custom: #FAF6F0;
            --text-dark-custom: #2A2522;
            --accent-gold-custom: #D4AF37;
            --glass-bg-custom: rgba(255, 255, 255, 0.5);
            --glass-border-custom: rgba(255, 255, 255, 0.9);
        }

        .dark {
            --cream-bg-custom: #121212;
            --text-dark-custom: #E2E8F0;
            --glass-bg-custom: rgba(24, 24, 27, 0.6);
            --glass-border-custom: rgba(255, 255, 255, 0.1);
        }

        .category-section-custom {
            padding: 8px 20px 60px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            background-color: var(--cream-bg-custom);
            border-radius: 32px;
            margin: -16px 0 40px 0;
            border: 1px solid var(--glass-border-custom);
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.02);
            transition: background-color 0.3s ease;
        }

        .section-title-custom {
            text-align: center;
            font-size: 26px;
            color: var(--text-dark-custom);
            letter-spacing: 4px;
            margin-bottom: 60px;
            text-transform: uppercase;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s ease;
        }

        .category-section-custom.is-revealed .section-title-custom {
            opacity: 1;
            transform: translateY(0);
        }

        .grid-container-custom {
            position: relative;
            width: 100%;
            max-width: 360px;
            margin: 0 auto;
        }

        .central-core-custom {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: radial-gradient(circle, #fff, var(--accent-gold-custom));
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 40px rgba(212, 175, 55, 0.8), 0 0 80px rgba(212, 175, 55, 0.4);
            z-index: 20;
            opacity: 1;
            transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1), opacity 1s ease-out;
            pointer-events: none; /* Prevent background split-dot from blocking category hover/clicks */
        }

        .category-section-custom.is-revealed .central-core-custom {
            transform: translate(-50%, -50%) scale(8);
            opacity: 0;
        }

        .category-grid-custom {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px 20px;
            width: 100%;
            position: relative;
            z-index: 10;
        }

        .reveal-wrapper-custom {
            transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease;
            opacity: 0;
        }

        .reveal-wrapper-custom.top-left { transform: translate(70px, 80px) scale(0.2); }
        .reveal-wrapper-custom.top-right { transform: translate(-70px, 80px) scale(0.2); }
        .reveal-wrapper-custom.bottom-left { transform: translate(70px, -80px) scale(0.2); }
        .reveal-wrapper-custom.bottom-right { transform: translate(-70px, -80px) scale(0.2); }

        .category-section-custom.is-revealed .reveal-wrapper-custom {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }

        .reveal-wrapper-custom.top-left { transition-delay: 0.1s; }
        .reveal-wrapper-custom.top-right { transition-delay: 0.15s; }
        .reveal-wrapper-custom.bottom-left { transition-delay: 0.2s; }
        .reveal-wrapper-custom.bottom-right { transition-delay: 0.25s; }

        .float-layer-custom {
            display: flex;
            flex-direction: column;
            align-items: center;
            /* Floating animation disabled to keep tap targets still and ensure clicks/taps register reliably */
            /* animation: float-custom 6s ease-in-out infinite; */
        }

        .reveal-wrapper-custom.top-left .float-layer-custom { animation-delay: 0s; }
        .reveal-wrapper-custom.top-right .float-layer-custom { animation-delay: -1.5s; }
        .reveal-wrapper-custom.bottom-left .float-layer-custom { animation-delay: -3s; }
        .reveal-wrapper-custom.bottom-right .float-layer-custom { animation-delay: -4.5s; }

        @keyframes float-custom {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
        }

        @media (min-width: 768px) {
            .grid-container-custom {
                max-width: 900px;
            }
            .category-grid-custom {
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
            }
            .orb-custom {
                width: 170px;
                height: 170px;
            }
            .reveal-wrapper-custom.top-left { transform: translate(337.5px, 0px) scale(0.2); }
            .reveal-wrapper-custom.top-right { transform: translate(112.5px, 0px) scale(0.2); }
            .reveal-wrapper-custom.bottom-left { transform: translate(-112.5px, 0px) scale(0.2); }
            .reveal-wrapper-custom.bottom-right { transform: translate(-337.5px, 0px) scale(0.2); }
        }

        .orb-custom {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            position: relative;
            cursor: pointer;
            background: #fff;
            padding: 6px;
            border: 1px solid rgba(255, 255, 255, 0.7);
            box-shadow: 
                inset 0 6px 12px rgba(255, 255, 255, 0.95),
                inset 0 -6px 12px rgba(139, 115, 85, 0.15),
                0 25px 45px rgba(139, 115, 85, 0.35),
                0 10px 20px rgba(139, 115, 85, 0.2);
            transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
        }

        @media (hover: hover) {
            .orb-custom:hover {
                /* Hover zoom removed to keep tap targets stable and still */
                box-shadow: 
                    inset 0 6px 12px rgba(255, 255, 255, 0.95),
                    inset 0 -4px 10px rgba(139, 115, 85, 0.15),
                    0 35px 60px rgba(139, 115, 85, 0.45),
                    0 15px 30px rgba(139, 115, 85, 0.3);
            }
        }

        .dark .orb-custom {
            background: #2a2522;
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 
                inset 0 6px 12px rgba(255, 255, 255, 0.15),
                inset 0 -6px 12px rgba(0, 0, 0, 0.4),
                0 25px 45px rgba(0, 0, 0, 0.65),
                0 10px 20px rgba(0, 0, 0, 0.35);
        }

        @media (hover: hover) {
            .dark .orb-custom:hover {
                box-shadow: 
                    inset 0 6px 12px rgba(255, 255, 255, 0.2),
                    inset 0 -6px 12px rgba(0, 0, 0, 0.4),
                    0 35px 60px rgba(0, 0, 0, 0.9),
                    0 15px 30px rgba(0, 0, 0, 0.55);
            }
        }

        .orb-custom:active {
            /* Active shift removed to keep click targets stable */
            box-shadow: inset 0 4px 10px rgba(255, 255, 255, 0.8), 0 5px 10px rgba(139, 115, 85, 0.2);
        }

        .dark .orb-custom:active {
            box-shadow: inset 0 4px 10px rgba(255, 255, 255, 0.1), 0 5px 10px rgba(0, 0, 0, 0.4);
        }

        .orb-image-custom {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
        }

        .orb-image-custom img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            animation: slowZoom-custom 15s linear infinite alternate;
        }

        @keyframes slowZoom-custom {
            0% { transform: scale(1); }
            100% { transform: scale(1.15); }
        }

        .orb-label-custom {
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg-custom);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border-custom);
            padding: 8px 16px;
            border-radius: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            font-size: 11px;
            font-weight: 700;
            color: var(--text-dark-custom);
            letter-spacing: 1px;
            text-transform: uppercase;
            z-index: 5;
            transition: all 0.3s ease;
        }

        .orb-custom:active + .orb-label-custom {
            transform: translateX(-50%) scale(0.95);
            background: var(--accent-gold-custom);
            color: #fff;
            border-color: var(--accent-gold-custom);
        }
      ` }} />

      {/* Floating Interactive Control Panel for Sandbox testing */}
      <div className="sticky top-2 z-[999] bg-amber-500/90 dark:bg-amber-500/85 backdrop-blur-md text-slate-950 p-3 rounded-2xl border border-amber-400 shadow-lg flex items-center justify-between gap-4 max-w-xl mx-auto">
        <div className="hidden sm:block">
          <span className="font-extrabold text-sm block">🔄 Category Scroll Sandbox</span>
          <span className="text-[10px] opacity-80 block">Test transitions relative to real layout</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            type="button"
            onClick={scrollToCategory}
            className="bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-full transition-transform active:scale-95 cursor-pointer"
          >
            Scroll to Categories
          </button>
          <button 
            type="button"
            onClick={resetAnimation}
            className="bg-white hover:bg-slate-50 text-slate-950 text-[11px] font-bold py-1.5 px-3 rounded-full transition-transform active:scale-95 cursor-pointer border-0"
          >
            Reset Animation
          </button>
          <label className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={resetOnScrollOut} 
              onChange={(e) => setResetOnScrollOut(e.target.checked)}
              className="rounded text-slate-950 focus:ring-slate-950 cursor-pointer h-3.5 w-3.5"
            />
            Reset on scroll-up
          </label>
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
        <div className="w-full flex justify-center overflow-hidden py-6 sm:py-8 select-none">
          <span className="font-anton font-black text-[11.5vw] sm:text-[12vw] md:text-[90px] leading-none tracking-wider text-white/95 dark:text-[#f1bf0a] uppercase text-center drop-shadow-md inline-block select-none transform scale-x-135 scale-y-135 sm:scale-x-145 sm:scale-y-140 md:scale-x-160 md:scale-y-150 origin-center hero-title-span w-auto">
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

      {/* --- INTEGRATED SCROLL TRANSITION CATEGORY SECTION --- */}
      <section className="category-section-custom" id="categorySection" ref={categorySectionRef}>
        <h2 className="section-title-custom font-anton tracking-widest">Category</h2>
        
        <div className="grid-container-custom">
          {/* The glowing dot that splits */}
          <div className="central-core-custom"></div>
          
          <div className="category-grid-custom">
            
            {/* Top Left Orb */}
            <div className="reveal-wrapper-custom top-left">
              <div className="float-layer-custom">
                <div className="orb-custom">
                  <div className="orb-image-custom relative">
                    <Image 
                      src="https://upload.meeshosupplyassets.com/cataloging/1783968560581/1.png" 
                      alt="Paithani Sarees" 
                      fill
                      sizes="(max-width: 768px) 140px, 170px"
                      className="object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="orb-label-custom font-sans">Sarees</div>
              </div>
            </div>

            {/* Top Right Orb */}
            <div className="reveal-wrapper-custom top-right">
              <div className="float-layer-custom">
                <div className="orb-custom">
                  <div className="orb-image-custom relative">
                    <Image 
                      src="https://upload.meeshosupplyassets.com/cataloging/1783968607590/lemonrani.png" 
                      alt="Trending" 
                      fill
                      sizes="(max-width: 768px) 140px, 170px"
                      className="object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="orb-label-custom font-sans font-bold">Trending</div>
              </div>
            </div>

            {/* Bottom Left Orb */}
            <div className="reveal-wrapper-custom bottom-left">
              <div className="float-layer-custom">
                <div className="orb-custom">
                  <div className="orb-image-custom relative">
                    <Image 
                      src="https://upload.meeshosupplyassets.com/cataloging/1783968697416/3.png" 
                      alt="Popular" 
                      fill
                      sizes="(max-width: 768px) 140px, 170px"
                      className="object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="orb-label-custom font-sans font-bold">Popular</div>
              </div>
            </div>

            {/* Bottom Right Orb */}
            <div className="reveal-wrapper-custom bottom-right">
              <div className="float-layer-custom">
                <div className="orb-custom">
                  <div className="orb-image-custom relative">
                    <Image 
                      src="https://upload.meeshosupplyassets.com/cataloging/1783968891146/3.png" 
                      alt="Clearance" 
                      fill
                      sizes="(max-width: 768px) 140px, 170px"
                      className="object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="orb-label-custom font-sans font-bold">Clearance</div>
              </div>
            </div>

          </div>
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
          {collectionCards?.map((card, idx) => (
            <div key={idx} className="w-72 sm:w-80 shrink-0 snap-center relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-lg border border-slate-200 dark:border-white/5">
              <img src={card.image || "/saree_kanjivaram.png"} alt={card.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-5">
                <a href={card.link || "#product-list"} className="font-anton text-lg tracking-wider text-[#F1BF0A] hover:text-white uppercase transition-colors hover:no-underline">{card.name}</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Catalog Area */}
      <main className="max-w-5xl mx-auto overflow-hidden px-2 mt-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-10">
          <h1 className="font-anton text-5xl/14 md:text-6xl/18 flex-1">
            EXPLORE THE <br className="hidden md:inline" /> SAREE COLLECTION
          </h1>
          <div className="flex-1 space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
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
