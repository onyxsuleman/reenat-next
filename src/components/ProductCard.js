'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, setQuickViewProduct, isInWishlist } = useApp();

  const formattedPrice = Math.round(product.price || 0).toLocaleString('en-IN');
  const formattedOriginal = product.originalPrice ? Math.round(product.originalPrice).toLocaleString('en-IN') : null;
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const rating = product.rating || 4.5;
  const inWishlist = isInWishlist(product.id);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product?id=${product.id}`;
    let imgPart = '';
    if (product.image) {
      if (product.image.startsWith('data:')) {
        imgPart = '';
      } else if (product.image.startsWith('http')) {
        imgPart = `\n\nHigh-Res Image: ${product.image}`;
      } else {
        imgPart = `\n\nHigh-Res Image: ${window.location.origin}${product.image}`;
      }
    }
    const shareText = `Hey! What do you think of this gorgeous handloom saree? Check it out on Reenat Trends: ${product.name} (${product.craft} from ${product.origin}) for ₹${product.price.toLocaleString('en-IN')}.\n\nView details: ${productUrl}${imgPart}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <li className="group product-card col-span-1 flex flex-col rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-md">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-[#0c1e44]/5 dark:bg-black/20 p-2">
        <Link href={`/product?id=${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105" 
            loading="lazy" 
          />
        </Link>
        {/* Badge */}
        <span className="absolute top-4 left-4 bg-slate-800/80 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
          {product.type}
        </span>
        
        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5 shadow-md z-20">
          <span>{rating}</span>
          <span className="text-emerald-600">★</span>
        </div>

        {/* Floating WhatsApp Shortcut */}
        <button 
          type="button" 
          onClick={handleShare}
          className="absolute top-4 right-4 bg-[#25D366] hover:bg-emerald-600 text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer z-20 flex items-center justify-center border border-white/20" 
          title="Ask for Second Opinion on WhatsApp"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.012 2c-5.506 0-9.972 4.466-9.972 9.974 0 1.758.459 3.479 1.33 5.003L2.028 22l5.166-1.355a9.92 9.92 0 0 0 4.814 1.258h.004c5.503 0 9.973-4.467 9.973-9.975C21.985 6.467 17.518 2 12.012 2zm5.727 13.993c-.25.707-1.464 1.3-2.025 1.385-.561.085-1.042.348-3.486-.643-2.937-1.196-4.81-4.184-4.957-4.382-.148-.198-1.197-1.591-1.197-3.036 0-1.444.757-2.15 1.026-2.433.269-.283.593-.354.79-.354.198 0 .396.002.567.01.178.008.419-.068.657.506.25.599.852 2.083.926 2.233.074.15.124.325.025.525-.099.2-.148.324-.297.499-.148.175-.313.39-.446.524-.148.15-.304.312-.132.607.172.296.764 1.259 1.636 2.036.873.778 1.611 1.018 1.908 1.168.297.15.469.125.643-.075.172-.2.757-.881.956-1.181.2-.3.4-.25.674-.15.275.1 1.748.824 2.049.975.301.15.501.225.576.35.074.125.074.723-.176 1.43z"/>
          </svg>
        </button>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 flex items-center justify-center gap-3">
          <button 
            type="button" 
            onClick={() => addToCart(product)}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-[#F1BF0A] dark:hover:bg-[#F1BF0A] text-slate-800 dark:text-slate-100 rounded-full shadow-md transition-colors duration-200 cursor-pointer" 
            title="Add to Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </button>
          <button 
            type="button" 
            onClick={() => toggleWishlist(product)}
            className={`p-3 rounded-full shadow-md transition-colors duration-200 cursor-pointer ${
              inWishlist 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-white dark:bg-slate-900 hover:bg-rose-500 hover:text-white text-slate-800 dark:text-slate-100'
            }`}
            title="Add to Wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>
          <button 
            type="button" 
            onClick={() => setQuickViewProduct(product)}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-[#183fad] hover:text-white text-slate-800 dark:text-slate-100 rounded-full shadow-md transition-colors duration-200 cursor-pointer" 
            title="Quick View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Saree Details */}
      <Link href={`/product?id=${product.id}`} className="p-3 sm:p-4 flex flex-col justify-between flex-1 bg-white/40 dark:bg-black/10 relative hover:no-underline block">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-[#183fad] dark:group-hover:text-[#F1BF0A] transition-colors duration-200 truncate">
            {product.name}
          </h3>
          {discountPercent > 0 && (
            <div className="text-[#16a34a] dark:text-[#25D366] text-xs font-semibold mt-1">
              {discountPercent}% OFF
            </div>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex flex-col pr-10">
            <div className="flex items-center gap-2">
              {formattedOriginal && (
                <span className="text-sm line-through text-slate-455 dark:text-slate-400">
                  ₹{formattedOriginal}
                </span>
              )}
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ₹{formattedPrice}
              </span>
            </div>
            <div className="inline-block bg-[#16a34a]/10 dark:bg-[#25D366]/10 text-[#16a34a] dark:text-[#25D366] text-[10px] font-bold mt-1.5 px-2.5 py-0.5 rounded border border-[#16a34a]/20 dark:border-[#25D366]/20 shadow-[0_2px_6px_rgba(22,163,74,0.12)] dark:shadow-none w-fit">
              Hot Deal
            </div>
          </div>
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 p-2 sm:p-2.5 bg-[#F1BF0A] hover:bg-yellow-500 text-slate-900 rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-sm" 
            title="Add to Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </button>
        </div>
      </Link>
    </li>
  );
}
