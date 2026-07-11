'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductMiniCard({ product }) {
  if (!product) return null;

  const formattedPrice = Math.round(product.price || 0).toLocaleString('en-IN');
  const formattedOriginal = product.originalprice ? Math.round(product.originalprice).toLocaleString('en-IN') : null;
  const discountPercent = product.originalprice 
    ? Math.round(((product.originalprice - product.price) / product.originalprice) * 100)
    : 0;

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 rounded-3xl p-4 shadow-sm backdrop-blur-md flex gap-4 items-center">
      {/* Product Image */}
      <div className="relative size-20 sm:size-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Product Information */}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5">
          {product.type || 'Saree'}
        </span>
        <h2 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base leading-tight truncate">
          {product.name}
        </h2>
        
        {/* Specs snippet */}
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-slate-500 dark:text-slate-400 text-xs mt-1">
          {product.fabric && <span>• {product.fabric}</span>}
          {product.border && <span>• {product.border} Border</span>}
          {product.color && <span>• {product.color}</span>}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-anton text-slate-900 dark:text-[#F1BF0A] text-lg">
            ₹{formattedPrice}
          </span>
          {formattedOriginal && (
            <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
              ₹{formattedOriginal}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-[#25D366]">
              ({discountPercent}% OFF)
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex-shrink-0">
        <Link 
          href={`/product?id=NSY${String(product.id).padStart(4, '0')}`}
          className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-full text-xs font-bold transition-colors hover:no-underline shadow-sm"
        >
          View Product
        </Link>
      </div>
    </div>
  );
}
