import React from 'react';

export const metadata = {
  title: "Our Boutiques — Reenat Trends",
  description: "Experience the weight of authentic zari and luxury silks. Visit our experiential weave salons.",
};

export default function Stores() {
  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 mt-6 space-y-10 text-slate-800 dark:text-white">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#d9a05b] font-semibold">Flagship Locations</span>
        <h1 className="text-4xl font-anton text-slate-850 dark:text-white uppercase">OUR BOUTIQUES</h1>
        <p className="text-slate-700 dark:text-slate-350 text-sm max-w-xl mx-auto leading-relaxed">
          Experience the weight of authentic zari and luxury silks. Visit our experiential weave salons.
        </p>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Store 1 */}
        <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 rounded-3xl shadow-md overflow-hidden flex flex-col justify-between glass">
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2 font-anton uppercase tracking-wide">
              Kanchipuram flagship
            </h3>
            <div className="text-sm text-slate-650 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-white">Temple Town Salon</p>
              <p>45, Car Street, Gandhi Nagar</p>
              <p>Kanchipuram - 631501</p>
              <p className="pt-2"><strong>Phone:</strong> +91 44 2723 9081</p>
              <p><strong>Hours:</strong> 10:00 AM - 8:30 PM (Daily)</p>
            </div>
          </div>
          <div className="h-32 bg-[#e9ecf6] dark:bg-black/20 flex items-center justify-center text-xs font-semibold text-slate-500">
            [ Map: Temple Town District ]
          </div>
        </div>

        {/* Store 2 */}
        <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 rounded-3xl shadow-md overflow-hidden flex flex-col justify-between glass">
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2 font-anton uppercase tracking-wide">
              Banaras Heritage
            </h3>
            <div className="text-sm text-slate-650 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-white">Ghat Road Boutique</p>
              <p>12, Manikarnika Lane, Chowk</p>
              <p>Varanasi - 221001</p>
              <p className="pt-2"><strong>Phone:</strong> +91 542 240 8741</p>
              <p><strong>Hours:</strong> 11:00 AM - 9:00 PM (Mon-Sat)</p>
            </div>
          </div>
          <div className="h-32 bg-[#e9ecf6] dark:bg-black/20 flex items-center justify-center text-xs font-semibold text-slate-500">
            [ Map: Ghats & Chowk Market ]
          </div>
        </div>

        {/* Store 3 */}
        <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 rounded-3xl shadow-md overflow-hidden flex flex-col justify-between glass">
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2 font-anton uppercase tracking-wide">
              New Delhi Experience
            </h3>
            <div className="text-sm text-slate-650 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-white">South Extension Studio</p>
              <p>H-18, South Extension Part I</p>
              <p>New Delhi - 110049</p>
              <p className="pt-2"><strong>Phone:</strong> +91 11 4164 1210</p>
              <p><strong>Hours:</strong> 11:00 AM - 8:30 PM (Daily)</p>
            </div>
          </div>
          <div className="h-32 bg-[#e9ecf6] dark:bg-black/20 flex items-center justify-center text-xs font-semibold text-slate-500">
            [ Map: Ring Road Metro Enclave ]
          </div>
        </div>
      </div>
    </main>
  );
}
