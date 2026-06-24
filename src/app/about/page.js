import React from 'react';

export const metadata = {
  title: "About Us — Reenat Trends",
  description: "Bridging the gap between luxury seekers and remote weaver clusters, sustaining ancient weaving traditions.",
};

export default function About() {
  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 mt-6 space-y-12">
      {/* Header Block */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#d9a05b] font-semibold">Our Heritage</span>
        <h1 className="text-4xl sm:text-5xl font-anton text-slate-850 dark:text-white uppercase">
          THREADING TRADITIONS
        </h1>
        <p className="text-slate-700 dark:text-slate-350 text-sm max-w-xl mx-auto leading-relaxed">
          For generations, Reenat Trends has bridged the gap between luxury seekers and remote weaver clusters, sustaining ancient weaving traditions.
        </p>
      </div>

      {/* The Craft Process Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-sm space-y-2">
          <span className="text-3xl font-anton text-[#F1BF0A]">01.</span>
          <h3 className="font-bold text-slate-800 dark:text-white">Thread Spun</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Raw mulberry or wild tussar silk fibers are hand-reeled, dyed, and spun using spindle wheels into uniform spools.
          </p>
        </div>

        <div className="bg-white/60 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-sm space-y-2">
          <span className="text-3xl font-anton text-[#F1BF0A]">02.</span>
          <h3 className="font-bold text-slate-800 dark:text-white">Loom Drafting</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Artisans align thousands of warp threads parallelly on wooden frame looms, mapping the structural brocade cards.
          </p>
        </div>

        <div className="bg-white/60 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 rounded-3xl glass shadow-sm space-y-2">
          <span className="text-3xl font-anton text-[#F1BF0A]">03.</span>
          <h3 className="font-bold text-slate-800 dark:text-white">Interlace Weft</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            With precise foot-pedal work and shuttling, gold zari and colored wefts interlock, completing a single saree over 3-4 weeks.
          </p>
        </div>
      </div>

      {/* Spotlight Section */}
      <div className="bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 sm:p-10 rounded-3xl glass shadow-md flex flex-col md:flex-row items-center gap-8">
        <div className="size-36 rounded-full bg-gradient-to-tr from-[#183fad] to-indigo-600 text-white flex items-center justify-center text-4xl font-anton shadow-md shrink-0">
          R.B
        </div>
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-wider text-[#d9a05b] font-semibold">Artisan Spotlight</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ramanathan Balaji, Master Weaver</h3>
          <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
            "Woven threads tell a story. When you wear a handloom saree, you aren't wearing mere cloth; you are wearing weeks of human design, breath, and focus. Reenat Trends ensures our loom houses get fair pay to keep our heritage alive."
          </p>
        </div>
      </div>
    </main>
  );
}
