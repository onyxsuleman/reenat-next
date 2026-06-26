'use client';

import React from 'react';

export default function ProductSkeleton() {
  return (
    <li className="col-span-1 flex flex-col rounded-3xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-white/5 animate-pulse bg-white/40 dark:bg-black/10">
      {/* Image Skeleton */}
      <div className="relative overflow-hidden aspect-[3/4] bg-slate-200 dark:bg-slate-800/80 m-2 rounded-2xl"></div>

      {/* Details Skeleton */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 relative">
        <div className="space-y-2">
          {/* Title Line */}
          <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded-md w-3/4"></div>
          {/* Subtitle / Off badge */}
          <div className="h-3 bg-slate-200 dark:bg-slate-800/80 rounded-md w-1/4"></div>
        </div>
        
        <div className="mt-4 flex items-end justify-between">
          <div className="space-y-2 flex-1">
            {/* Price lines */}
            <div className="flex gap-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800/80 rounded-md w-1/4"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-800/80 rounded-md w-1/3"></div>
            </div>
            {/* Hot deal tag */}
            <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded-md w-16"></div>
          </div>
          {/* Add to cart circular button */}
          <div className="size-9 bg-slate-200 dark:bg-slate-800/80 rounded-full flex-shrink-0"></div>
        </div>
      </div>
    </li>
  );
}

export function ProductSkeletonGrid({ count = 6 }) {
  const skeletons = Array.from({ length: count });
  return (
    <>
      {skeletons.map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </>
  );
}
