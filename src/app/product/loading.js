/**
 * loading.js — Suspense skeleton for the product detail page.
 *
 * Shown automatically by Next.js while the async Server Component (page.js)
 * is fetching product data from Supabase on the first request.
 * Matches the two-column layout (image gallery left, specs right) so the
 * page feels instant with zero layout shift when real content arrives.
 */
export default function ProductLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left column — image gallery skeleton */}
        <div className="col-span-1 md:col-span-5 space-y-4">
          {/* Main image */}
          <div className="relative aspect-[3/4] bg-slate-200 dark:bg-slate-800 md:rounded-2xl overflow-hidden">
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
              ))}
            </div>
          </div>
          {/* Variant row skeleton */}
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2">
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-16 aspect-[4/5] rounded-xl bg-slate-200 dark:bg-slate-700" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column — specs skeleton */}
        <div className="col-span-1 md:col-span-7 space-y-4">
          {/* Title card */}
          <div className="bg-white/40 dark:bg-slate-800/30 rounded-3xl p-5 space-y-4 border border-black/5 dark:border-white/5">
            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="space-y-2">
              <div className="h-6 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="flex gap-3">
                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            {/* Discount banner skeleton */}
            <div className="h-14 w-full bg-slate-100 dark:bg-slate-700/40 rounded-2xl" />
          </div>

          {/* Value props skeleton */}
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex flex-col items-center p-3.5 rounded-2xl bg-white/70 dark:bg-white/8 border border-white/60 dark:border-white/10 space-y-2">
                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-2 w-12 bg-slate-100 dark:bg-slate-600 rounded" />
              </div>
            ))}
          </div>

          {/* Specs table skeleton */}
          <div className="bg-white/40 dark:bg-slate-800/30 rounded-3xl p-5 space-y-4 border border-black/5 dark:border-white/5">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            {[0, 1, 2].map(i => (
              <div key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-3">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>

          {/* CTA buttons skeleton */}
          <div className="flex gap-3 pt-3">
            <div className="flex-[1.5] h-14 rounded-2xl bg-yellow-200 dark:bg-yellow-900/30" />
            <div className="flex-1 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-14 w-20 rounded-2xl bg-slate-100 dark:bg-slate-700/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
