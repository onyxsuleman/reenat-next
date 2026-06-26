'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

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

  // Auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 8000);
    return () => clearInterval(timer);
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

  const activeSlide = carouselSlides[slideIndex];

  return (
    <div className="space-y-12">
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
          className={`block object-contain h-[95vw] max-h-[420px] md:h-[56vw] md:max-h-135 absolute bottom-6 left-1/2 -translate-x-1/2 z-1 select-none pointer-events-none animate-float carousel-image-transition ${fadeText ? 'carousel-image-hidden' : ''}`}
          style={{ filter: "drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.4))" }}
        />
      </header>

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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      </main>
    </div>
  );
}
