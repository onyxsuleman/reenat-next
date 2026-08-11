'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { ProductSkeletonGrid } from '../components/ProductSkeleton';

export default function Home() {
  const { products, heroSlides, categoryCards, collectionCards, catalogPositions, bestSellers } = useApp();
  const [slideIndex, setSlideIndex] = useState(0);
  const [fadeText, setFadeText] = useState(false);
  const [timeLeft, setTimeLeft] = useState('12H:12M:31S');
  const bestsellersRef = useRef(null);
  const categorySectionRef = useRef(null);

  // Intersection Observer for category scroll transitions
  useEffect(() => {
    const categorySection = categorySectionRef.current;
    if (!categorySection) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        } else {
          entry.target.classList.remove('is-revealed');
        }
      });
    }, observerOptions);

    observer.observe(categorySection);

    return () => {
      observer.disconnect();
    };
  }, []);

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

  const scrollBestsellers = (direction) => {
    if (bestsellersRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      bestsellersRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeSlide = (heroSlides && heroSlides[slideIndex]) || { subtitle: '', title: '', desc: '', image: '' };

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
      <header className="max-w-5xl mx-auto bg-[#0c1e44]/95 text-white px-3.5 pb-3.5 pt-8 sm:pt-14 rounded-tl-4xl rounded-b-4xl relative z-10 glass page-hero">
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
            pointer-events: none; /* Prevent this background overlay dot from blocking hover/click events */
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

      {/* Category Circles Section with Scroll Transition */}
      <section className="category-section-custom" id="categorySection" ref={categorySectionRef}>
        <h2 className="section-title-custom font-anton tracking-widest text-[#0c1e44] dark:text-white">Category</h2>
        
        <div className="grid-container-custom">
          {/* The glowing dot that splits */}
          <div className="central-core-custom"></div>
          
          <div className="category-grid-custom">
            {(() => {
              const positionClasses = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
              return categoryCards?.slice(0, 4).map((card, idx) => (
                <div key={idx} className={`reveal-wrapper-custom ${positionClasses[idx]}`}>
                  <div className="float-layer-custom">
                    <Link href={card.link || "#product-list"} className="flex flex-col items-center hover:no-underline group animate-none">
                      <div className="orb-custom">
                        <div className="orb-image-custom relative">
                          <Image 
                            src={card.image || "/saree_kanjivaram.png"} 
                            alt={card.name} 
                            fill
                            sizes="(max-width: 768px) 140px, 170px"
                            className="object-cover rounded-full"
                          />
                        </div>
                      </div>
                      <div className="orb-label-custom font-sans font-bold">{card.name}</div>
                    </Link>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* BESTSELLER SAREES Section (Increased Height Cards, 4 Slots controlled by CMS) */}
      <section className="w-full max-w-5xl mx-auto py-6 relative">
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="font-anton text-3xl sm:text-4xl tracking-wider text-slate-900 dark:text-white uppercase drop-shadow-sm">
            BESTSELLER SAREES
          </h2>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => scrollBestsellers('left')} 
              aria-label="Scroll left"
              className="flex items-center justify-center bg-[#F1BF0A] hover:bg-yellow-500 rounded-full p-2.5 text-slate-900 shadow-md cursor-pointer hover:scale-105 transition-transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4 sm:size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              type="button" 
              onClick={() => scrollBestsellers('right')} 
              aria-label="Scroll right"
              className="flex items-center justify-center bg-[#F1BF0A] hover:bg-yellow-500 rounded-full p-2.5 text-slate-900 shadow-md cursor-pointer hover:scale-105 transition-transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4 sm:size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div 
          ref={bestsellersRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto px-4 pb-6 snap-x scrollbar-none scroll-smooth"
        >
          {(() => {
            const activeSlots = (bestSellers && bestSellers.length > 0) ? bestSellers.slice(0, 4) : [
              { slot: 1, catalogId: 'M1' },
              { slot: 2, catalogId: 'M2' },
              { slot: 3, catalogId: 'M3' },
              { slot: 4, catalogId: 'M4' }
            ];

            return activeSlots.map((slotItem, idx) => {
              const cid = String(slotItem.catalogId || '').trim().toUpperCase();
              const catalogProds = (products || []).filter(p => {
                const pCid = (p.catalogId || p.catalog_id || `SINGLE-${p.id}`).trim().toUpperCase();
                return pCid === cid;
              });

              const coverProd = catalogProds[0] || (products && products[idx % products.length]) || null;
              if (!coverProd) return null;

              const variantCount = catalogProds.length || 1;

              return (
                <div 
                  key={idx} 
                  className="w-[270px] sm:w-[330px] shrink-0 snap-center relative rounded-3xl overflow-hidden h-[460px] sm:h-[540px] group shadow-xl border border-slate-200 dark:border-white/10 bg-slate-900 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  <img 
                    src={coverProd.image || "/saree_kanjivaram.png"} 
                    alt={coverProd.name || `Catalog ${cid}`} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-[#F1BF0A] text-slate-950 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        BESTSELLER #{idx + 1}
                      </span>
                      <span className="text-slate-200 text-xs font-semibold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                        Catalog {cid} {variantCount > 1 ? `(${variantCount} Colors)` : ''}
                      </span>
                    </div>
                    
                    <h3 className="font-anton text-xl sm:text-2xl tracking-wider text-white line-clamp-1 mb-1 drop-shadow-md">
                      {coverProd.name || `Catalog ${cid}`}
                    </h3>

                    <div className="flex items-center justify-between mt-2 pt-2.5 border-t border-white/20">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-300 uppercase font-medium">Price</span>
                        <span className="text-lg sm:text-xl font-bold text-[#F1BF0A]">₹{coverProd.price || 1499}</span>
                      </div>
                      <Link 
                        href={`/product?id=${coverProd.id}`} 
                        className="bg-white/20 hover:bg-[#F1BF0A] text-white hover:text-slate-950 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 backdrop-blur-md border border-white/30 hover:border-[#F1BF0A] flex items-center gap-1.5 shadow-md hover:no-underline"
                      >
                        <span>View Catalog</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
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
            const catalogMap = {};
            products.forEach(p => {
              const cid = (p.catalogId || p.catalog_id || `SINGLE-${p.id}`).trim().toUpperCase();
              if (!catalogMap[cid]) {
                catalogMap[cid] = p;
              }
            });

            const positionOrderMap = {};
            if (catalogPositions && catalogPositions.length > 0) {
              catalogPositions.forEach(item => {
                if (item.catalogId) {
                  positionOrderMap[String(item.catalogId).trim().toUpperCase()] = Number(item.position);
                }
              });
            }

            const uniqueProducts = Object.values(catalogMap);
            uniqueProducts.sort((a, b) => {
              const cIdA = (a.catalogId || a.catalog_id || '').trim().toUpperCase();
              const cIdB = (b.catalogId || b.catalog_id || '').trim().toUpperCase();
              const posA = positionOrderMap[cIdA] !== undefined ? positionOrderMap[cIdA] : 999;
              const posB = positionOrderMap[cIdB] !== undefined ? positionOrderMap[cIdB] : 999;
              if (posA !== posB) return posA - posB;
              return Number(a.id || 0) - Number(b.id || 0);
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
