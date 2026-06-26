'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';

function ProductDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, addToCart, toggleWishlist, isInWishlist } = useApp();
  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showExtendedInfo, setShowExtendedInfo] = useState(false);
  const zoomContainerRef = useRef(null);
  const zoomImageRef = useRef(null);
  const mobileCarouselRef = useRef(null);

  const productId = searchParams.get('id');

  useEffect(() => {
    if (products.length > 0 && productId) {
      const found = products.find(p => String(p.id) === String(productId));
      if (found) {
        setProduct(found);
        setActiveImageIndex(0);
        if (mobileCarouselRef.current) {
          mobileCarouselRef.current.scrollLeft = 0;
        }
      }
    }
  }, [products, productId]);

  const handleMobileScroll = (e) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      if (index >= 0 && index < galleryImages.length && index !== activeImageIndex) {
        setActiveImageIndex(index);
      }
    }
  };

  const handleImageChange = (idx) => {
    setActiveImageIndex(idx);
    const container = mobileCarouselRef.current;
    if (container) {
      const width = container.clientWidth;
      container.scrollTo({
        left: idx * width,
        behavior: 'smooth'
      });
    }
  };

  if (!product) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        <p className="font-medium animate-pulse text-lg">Gathering master weave details…</p>
      </div>
    );
  }

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const onlinePrice = product.price - 100;
  const inWishlist = isInWishlist(product.id);

  // Zoom Effect
  const handleMouseMove = (e) => {
    const container = zoomContainerRef.current;
    const image = zoomImageRef.current;
    if (!container || !image) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
    image.style.transform = 'scale(1.7)';
  };

  const handleMouseLeave = () => {
    const image = zoomImageRef.current;
    if (image) {
      image.style.transform = 'scale(1)';
      image.style.transformOrigin = 'center';
    }
  };

  const handleShare = () => {
    const shareText = `Hey! What do you think of this gorgeous "${product.name}" saree on Reenat Trends? Woven details: ${product.craft} from ${product.origin}. See details: ${window.location.origin}/product?id=${product.id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  // Get active image src
  const galleryImages = [
    product.image,
    product.image2 || product.image,
    product.image3 || product.image
  ];

  const activeImageSrc = galleryImages[activeImageIndex];

  // Recommended weaves
  const recommended = products
    .filter(p => String(p.id) !== String(product.id))
    .slice(0, 3);

  // Get color variants (matching weave type or similar prefix)
  const colorVariants = products.filter(p => p.type === product.type);
  const displayVariants = colorVariants.length > 1 ? colorVariants : products.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2 select-none">
        <Link href="/" className="hover:text-[#183fad] dark:hover:text-[#F1BF0A]">Home</Link>
        <span>/</span>
        <Link href="/new-arrivals" className="hover:text-[#183fad] dark:hover:text-[#F1BF0A]">Collection</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-white font-medium">{product.name}</span>
      </nav>

      {/* Product Main details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image and Thumbnails */}
        <div className="col-span-1 md:col-span-6 space-y-4 md:space-y-6">
          {/* Mobile Image Carousel */}
          <div className="md:hidden relative aspect-[3/4] overflow-hidden select-none bg-slate-100 dark:bg-black/20 border border-black/5 dark:border-white/10 shadow-sm">
            <div 
              ref={mobileCarouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none w-full h-full"
              onScroll={handleMobileScroll}
            >
              {galleryImages.map((img, idx) => (
                <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                  <Image 
                    src={img} 
                    alt={`${product.name} - View ${idx + 1}`} 
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
            
            {/* Flipkart-style progress line indicator at bottom center */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-black/25 rounded-full overflow-hidden z-20">
              <div 
                className="h-full bg-slate-800 dark:bg-[#F1BF0A] rounded-full transition-all duration-150"
                style={{ 
                  width: `${100 / galleryImages.length}%`, 
                  transform: `translateX(${activeImageIndex * 100}%)` 
                }}
              />
            </div>
          </div>

          {/* Desktop Hover-to-Zoom Main Image */}
          <div 
            ref={zoomContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="hidden md:block relative overflow-hidden aspect-square bg-slate-100 dark:bg-black/20 md:rounded-3xl border border-black/5 dark:border-white/10 shadow-md cursor-zoom-in group select-none"
          >
            <Image 
              ref={zoomImageRef}
              src={activeImageSrc} 
              alt={product.name} 
              fill
              sizes="50vw"
              className="object-cover rounded-2xl transition-transform duration-250 ease-out origin-center"
              priority
            />
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
              Hover to Zoom
            </div>
          </div>

          {/* Thumbnails strip */}
          <div className="mobile-card md:bg-transparent md:border-0 md:p-0">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 md:hidden">
              Gallery Views
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleImageChange(idx)}
                  className={`thumbnail-btn flex-shrink-0 size-16 md:size-20 rounded-xl overflow-hidden bg-white/40 dark:bg-black/10 focus:outline-none cursor-pointer transition-all border-2 ${
                    idx === activeImageIndex 
                      ? 'border-[#183fad] dark:border-[#F1BF0A]' 
                      : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image 
                      src={img} 
                      alt={`View ${idx + 1}`} 
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Specifications, Actions */}
        <div className="col-span-1 md:col-span-6 space-y-4">
          <div className="mobile-card md:bg-white/40 md:dark:bg-[#0c1e44]/15 md:border md:border-black/5 md:dark:border-white/5 md:rounded-3xl md:p-5 md:glass space-y-3">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#d9a05b] font-bold">
                  Traditional Handloom {product.type}
                </span>
                <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-white mt-0.5 leading-snug">
                  {product.name} Saree With Blouse
                </h1>
              </div>
              <div className="flex items-center gap-3.5 mt-1 shrink-0">
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`transition-colors p-1 cursor-pointer ${
                    inWishlist ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-455'
                  }`}
                  title="Wishlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={inWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
                <button onClick={handleShare} className="text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors p-1 cursor-pointer" title="Share Saree Link">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-0.5 bg-emerald-600 dark:bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                <span>{product.rating || 4.8}</span>
                <span className="text-[9px]">★</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">128 Ratings, 15 Reviews</span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm line-through text-slate-400">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-[#25D366] px-2 py-0.5 rounded-full font-bold ml-1">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Special Online Pay discount Banner */}
            <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/45 dark:from-[#1e293b]/50 dark:to-[#0f172a]/50 border border-amber-100/70 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-sm mt-3.5">
              <div className="flex items-center gap-3">
                <span className="bg-[#d9a05b] text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase">OFFER</span>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Get this as low as</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">₹{onlinePrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#183fad] dark:text-[#F1BF0A]">
                  <span>Pay Online | Extra ₹100 Off</span>
                </span>
              </div>
            </div>

            {/* Color Variant Selector */}
            {displayVariants.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-3.5">
                <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  Selected Color: <span className="text-slate-800 dark:text-white font-semibold">{product.color || 'Classic Gold'}</span>
                </span>
                
                <div className="relative">
                  <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
                    {displayVariants.map((variant) => {
                      const isSelected = String(variant.id) === String(product.id);
                      return (
                        <Link
                          key={variant.id}
                          href={`/product?id=${variant.id}`}
                          className={`flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border-2 transition-all cursor-pointer relative group snap-start ${
                            isSelected 
                              ? 'border-slate-900 dark:border-[#F1BF0A] scale-102 shadow-sm' 
                              : 'border-slate-200 dark:border-slate-850 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <Image 
                            src={variant.image} 
                            alt={variant.name} 
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-slate-900/10 dark:bg-amber-500/5 pointer-events-none" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Value Propositions */}
          <div className="mobile-card md:bg-white/40 md:dark:bg-[#0c1e44]/15 md:border md:border-black/5 md:dark:border-white/5 md:rounded-3xl md:p-4 md:glass">
            <div className="grid grid-cols-3 gap-2.5 text-center text-slate-800 dark:text-slate-100">
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#a0aec0]/20 dark:bg-slate-900/60">
                <div className="size-9 rounded-full bg-[#5c6ac4] text-white flex items-center justify-center mb-1.5 shadow-sm">
                  🎨
                </div>
                <span className="text-[9px] font-bold">Lowest Price</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#a0aec0]/20 dark:bg-slate-900/60">
                <div className="size-9 rounded-full bg-[#2ca089] text-white flex items-center justify-center mb-1.5 shadow-sm">
                  🚚
                </div>
                <span className="text-[9px] font-bold">Cash on Delivery</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#a0aec0]/20 dark:bg-slate-900/60">
                <div className="size-9 rounded-full bg-[#d9534f] text-white flex items-center justify-center mb-1.5 shadow-sm">
                  🔄
                </div>
                <span className="text-[9px] font-bold">7 Days Return</span>
              </div>
            </div>
          </div>

          {/* Size Info */}
          <div className="mobile-card md:bg-white/40 md:dark:bg-[#0c1e44]/15 md:border md:border-black/5 md:dark:border-white/5 md:rounded-3xl md:p-5 md:glass flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-700 dark:text-white">Size</span>
            <span className="border border-slate-700 dark:border-slate-350 text-slate-800 dark:text-white px-6 py-2 rounded-md font-bold text-xs bg-transparent">
              Free Size
            </span>
          </div>

          {/* Specs Table */}
          <div className="mobile-card md:bg-white/40 md:dark:bg-[#0c1e44]/15 md:border md:border-black/5 md:dark:border-white/5 md:rounded-3xl md:p-5 md:glass space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-wider pb-1">
              Product Information
            </h2>
            
            <div className="space-y-3">
              <table className="w-full text-left border-collapse text-slate-800 dark:text-slate-100">
                <tbody>
                  <tr className="border-b border-slate-200 dark:border-slate-800/80">
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-medium text-sm w-[45%]">Brand</td>
                    <td className="py-3 text-right font-semibold text-sm w-[55%]">{product.brand || 'REENAT TRENDS'}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/80">
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-medium text-sm">Material / Craft</td>
                    <td className="py-3 text-right font-semibold text-sm">{product.craft || 'Silk Handloom'}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/80">
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-medium text-sm">Size</td>
                    <td className="py-3 text-right font-semibold text-sm">Free Size</td>
                  </tr>
                  
                  {showExtendedInfo && (
                    <>
                      <tr className="border-b border-slate-200 dark:border-slate-800/80 animate-in slide-in-from-top-1">
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium text-sm">Saree Length</td>
                        <td className="py-3 text-right font-semibold text-sm">{product.sareeLen || '5.5'} Meters</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800/80 animate-in slide-in-from-top-1">
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium text-sm">Blouse Info</td>
                        <td className="py-3 text-right font-semibold text-sm">{product.blouseType || 'Contrast Blouse'} ({product.blouseLen || '0.8'}m)</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800/80 animate-in slide-in-from-top-1">
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium text-sm">Fabric / Loom</td>
                        <td className="py-3 text-right font-semibold text-sm">{product.fabric} ({product.loom})</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800/80 animate-in slide-in-from-top-1">
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium text-sm">Occasion</td>
                        <td className="py-3 text-right font-semibold text-sm">{product.occasion}</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800/80 animate-in slide-in-from-top-1">
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium text-sm">Transparency</td>
                        <td className="py-3 text-right font-semibold text-sm">{product.transparency}</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800/80 animate-in slide-in-from-top-1">
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium text-sm">Style ID</td>
                        <td className="py-3 text-right font-semibold text-sm">{product.styleId}</td>
                      </tr>
                      
                      <tr className="animate-in slide-in-from-top-1">
                        <td colSpan="2" className="pt-5">
                          <div className="border-b border-slate-200 dark:border-slate-800/80 mb-4"></div>
                          <div className="text-center font-bold text-slate-800 dark:text-white text-xs uppercase tracking-widest mb-4">
                            PRODUCT DESCRIPTION
                          </div>
                          <div className="border-b border-slate-200 dark:border-slate-800/80 mb-4"></div>
                          <div className="space-y-3 text-left text-slate-650 dark:text-slate-350 leading-relaxed text-xs pt-2">
                            <p className="font-semibold">{product.desc}</p>
                            <p>This traditional Indian drape is crafted with pride and meticulous detail, ensuring you carry the rich aesthetic heritage of the weaver lineage. Premium threads align perfectly for wedding events, temple days, and celebratory parties.</p>
                          </div>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
              
              <button 
                onClick={() => setShowExtendedInfo(!showExtendedInfo)}
                className="w-full text-center py-2 text-[#183fad] dark:text-[#cfe3ff] hover:underline font-bold text-xs cursor-pointer block select-none"
              >
                {showExtendedInfo ? 'Read Less ▲' : 'More Details ▼'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex gap-3 pt-2">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-full border border-[#183fad] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer text-center text-sm"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => toggleWishlist(product)}
              className={`font-semibold py-3 px-6 rounded-full border transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer text-center text-sm ${
                inWishlist 
                  ? 'bg-rose-500 border-rose-500 text-white' 
                  : 'bg-white dark:bg-slate-800 text-rose-550 border-slate-200 dark:border-slate-700 hover:bg-rose-500 hover:text-white'
              }`}
            >
              {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Actions */}
      <div className="mobile-sticky-bar fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-between px-4 z-40 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)] bg-white dark:bg-[#0c1e44]">
        <button 
          onClick={() => addToCart(product)}
          className="mobile-sticky-btn-secondary w-[48%] h-11 font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1f41]"
        >
          <span>Add to Cart</span>
        </button>
        <button 
          onClick={() => {
            addToCart(product);
            router.push('/cart');
          }}
          className="w-[48%] h-11 bg-[#F1BF0A] hover:bg-yellow-500 text-slate-900 font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Buy Now</span>
        </button>
      </div>

      {/* Recommended weaves section */}
      {recommended.length > 0 && (
        <section className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-anton text-slate-850 dark:text-white tracking-wider">
              RECOMMENDED WEAVES
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sarees carrying matching handloom lineages and weaving styles.
            </p>
          </div>

          <ul id="related-product-list" className="grid grid-cols-2 gap-4 md:grid-cols-3 mt-8">
            {recommended.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        <p className="font-medium animate-pulse text-lg">Loading saree details…</p>
      </div>
    }>
      <ProductDetailsContent />
    </Suspense>
  );
}
