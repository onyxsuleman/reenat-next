'use client';

import React from 'react';
import { useApp } from '../context/AppContext';

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useApp();

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const formattedPrice = Math.round(product.price || 0).toLocaleString('en-IN');
  const formattedOriginal = product.originalPrice ? Math.round(product.originalPrice).toLocaleString('en-IN') : null;
  const inWishlist = isInWishlist(product.id);

  const handleClose = () => {
    setQuickViewProduct(null);
  };

  const handleShare = () => {
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
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9500] flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white/95 dark:bg-[#0c1e44]/95 text-slate-800 dark:text-white max-w-2xl w-full rounded-3xl shadow-2xl glass border border-white/20 dark:border-white/10 overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer z-50 font-bold" 
          aria-label="Close Quick View"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-[420px] bg-slate-100 dark:bg-black/20 relative p-4 flex items-center justify-center">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
          <span className="absolute top-4 left-4 bg-slate-800/80 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
            {product.type || 'Saree'}
          </span>
        </div>
        
        {/* Right Side: Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between h-auto md:h-[420px] overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#d9a05b] uppercase tracking-widest">
              <span>{product.origin}</span>
              <span>•</span>
              <span>{product.craft}</span>
            </div>
            <h2 className="text-xl font-anton tracking-wider text-slate-800 dark:text-white uppercase">
              {product.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-900 dark:text-white">₹{formattedPrice}</span>
              {formattedOriginal && (
                <span className="text-sm line-through text-slate-400">₹{formattedOriginal}</span>
              )}
            </div>
            <hr className="border-slate-200 dark:border-slate-800" />
            <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed">
              {product.desc}
            </p>
          </div>
          
          <div className="space-y-2.5 mt-6">
            {/* Stylized WhatsApp Button */}
            <button 
              onClick={handleShare}
              className="w-full bg-[#25D366] hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-full border border-[#25D366] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer text-center text-xs flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M12.012 2c-5.506 0-9.972 4.466-9.972 9.974 0 1.758.459 3.479 1.33 5.003L2.028 22l5.166-1.355a9.92 9.92 0 0 0 4.814 1.258h.004c5.503 0 9.973-4.467 9.973-9.975C21.985 6.467 17.518 2 12.012 2zm5.727 13.993c-.25.707-1.464 1.3-2.025 1.385-.561.085-1.042.348-3.486-.643-2.937-1.196-4.81-4.184-4.957-4.382-.148-.198-1.197-1.591-1.197-3.036 0-1.444.757-2.15 1.026-2.433.269-.283.593-.354.79-.354.198 0 .396.002.567.01.178.008.419-.068.657.506.25.599.852 2.083.926 2.233.074.15.124.325.025.525-.099.2-.148.324-.297.499-.148.175-.313.39-.446.524-.148.15-.304.312-.132.607.172.296.764 1.259 1.636 2.036.873.778 1.611 1.018 1.908 1.168.297.15.469.125.643-.075.172-.2.757-.881.956-1.181.2-.3.4-.25.674-.15.275.1 1.748.824 2.049.975.301.15.501.225.576.35.074.125.074.723-.176 1.43z"/>
              </svg>
              <span>Ask for Second Opinion on WhatsApp</span>
            </button>
            
            {/* Primary Actions */}
            <div className="flex gap-2.5">
              <button 
                onClick={() => {
                  addToCart(product);
                  handleClose();
                }}
                className="flex-1 bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-full border border-[#183fad] transition-colors cursor-pointer text-center text-xs"
              >
                Add to Cart
              </button>
              <button 
                onClick={() => {
                  toggleWishlist(product);
                }}
                className={`py-2.5 px-4 rounded-full border transition-colors cursor-pointer text-center text-xs font-semibold ${
                  inWishlist 
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/40' 
                    : 'bg-slate-100 hover:bg-rose-55 border-slate-200 text-slate-650 hover:text-rose-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700'
                }`}
              >
                {inWishlist ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
