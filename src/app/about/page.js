import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: "About Us — Reenat Trends",
  description: "At Reenat Trends, we believe a saree is not just an attire—it is a timeless canvas of art, heritage, and self-expression.",
};

export default function About() {
  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 mt-6 space-y-16">
      {/* Brand Logo & Hero Header */}
      <section className="text-center space-y-6 relative py-8 overflow-hidden">
        {/* Subtle radial glow background behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#F1BF0A]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex justify-center">
          <div className="relative group shrink-0">
            {/* Glowing borders */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#F1BF0A] to-[#183fad] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <div className="relative size-36 sm:size-44 rounded-full bg-white dark:bg-[#090e1a] p-2 shadow-2xl flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50 transition-transform duration-500 hover:scale-[1.05]">
              <Image 
                src="/logo.png" 
                alt="Reenat Trends Logo" 
                width={160} 
                height={160} 
                className="rounded-full object-contain"
                priority
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#d9a05b] font-bold block">
            Premium Handloom Label
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-anton text-slate-855 dark:text-white uppercase tracking-wide">
            REENAT TRENDS
          </h1>
          <p className="text-lg sm:text-xl font-medium text-[#183fad] dark:text-[#F1BF0A] tracking-wider italic font-sans max-w-2xl mx-auto">
            Where Tradition Meets Contemporary Elegance
          </p>
        </div>
      </section>

      {/* Brand Identity / Welcome Intro */}
      <section className="bg-white/50 dark:bg-[#0f1f41]/40 border border-black/5 dark:border-white/10 p-6 sm:p-10 rounded-[32px] glass shadow-md space-y-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-anton text-slate-855 dark:text-white uppercase tracking-wider">
            Welcome to Reenat Trends
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-[#F1BF0A] to-[#d9a05b] mx-auto rounded-full" />
          <p className="text-slate-700 dark:text-slate-355 text-base sm:text-lg leading-relaxed font-normal">
            At Reenat Trends, we believe a saree is not just an attire—it is a timeless canvas of art, heritage, and self-expression. As a premium registered trademark and proud flagship brand of <span className="font-semibold text-slate-900 dark:text-white">Onyx Enterprises</span>, we are dedicated to reviving and redefining the rich legacy of Indian textiles for the modern connoisseur.
          </p>
          <p className="text-slate-700 dark:text-slate-355 text-base sm:text-lg leading-relaxed font-normal">
            From the intricacy of traditional weaves to contemporary drapes, every single creation under our label reflects absolute perfection, luxury, and grace.
          </p>
        </div>
      </section>

      {/* The Power of In-House Manufacturing */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[#d9a05b] font-semibold">Craftsmanship Redefined</span>
          <h2 className="text-3xl sm:text-4xl font-anton text-slate-855 dark:text-white uppercase">
            The Power of In-House Manufacturing
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Unlike traditional retailers, we take immense pride in our complete in-house manufacturing process. By cutting out middlemen, we oversee every single stage of production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="group relative bg-white/60 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-[28px] glass shadow-sm hover:shadow-xl hover:border-[#F1BF0A]/55 dark:hover:border-[#F1BF0A]/50 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-[#183fad]/10 dark:bg-[#F1BF0A]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="size-6 text-[#183fad] dark:text-[#F1BF0A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-sans">
                Uncompromising Quality Control
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                From sourcing the finest raw silk and cotton yarns to the final delicate touches of packaging, we maintain strict quality control at every phase of creation.
              </p>
            </div>
            <div className="text-3xl font-anton text-[#F1BF0A]/20 group-hover:text-[#F1BF0A]/40 transition-colors duration-300 text-right mt-4 select-none">
              01
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-white/60 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-[28px] glass shadow-sm hover:shadow-xl hover:border-[#F1BF0A]/55 dark:hover:border-[#F1BF0A]/50 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-[#183fad]/10 dark:bg-[#F1BF0A]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="size-6 text-[#183fad] dark:text-[#F1BF0A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-sans">
                Luxurious Yet Accessible
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                By eliminating intermediaries and managing manufacturing internally, we deliver premium, designer-grade sarees at exceptionally competitive pricing.
              </p>
            </div>
            <div className="text-3xl font-anton text-[#F1BF0A]/20 group-hover:text-[#F1BF0A]/40 transition-colors duration-300 text-right mt-4 select-none">
              02
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-white/60 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-[28px] glass shadow-sm hover:shadow-xl hover:border-[#F1BF0A]/55 dark:hover:border-[#F1BF0A]/50 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-[#183fad]/10 dark:bg-[#F1BF0A]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="size-6 text-[#183fad] dark:text-[#F1BF0A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-sans">
                Setting Design Trends
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Our design studio constantly experiments with textures, colors, and weaves, introducing fresh, exclusive styles that lead the Indian handloom market.
              </p>
            </div>
            <div className="text-3xl font-anton text-[#F1BF0A]/20 group-hover:text-[#F1BF0A]/40 transition-colors duration-300 text-right mt-4 select-none">
              03
            </div>
          </div>
        </div>
      </section>

      {/* Our Global Footprint */}
      <section className="space-y-8 bg-white/40 dark:bg-[#0f1f41]/30 border border-black/5 dark:border-white/5 p-6 sm:p-10 rounded-[32px] glass">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[#d9a05b] font-semibold">Availability</span>
          <h2 className="text-3xl sm:text-4xl font-anton text-slate-855 dark:text-white uppercase">
            Our Global Footprint
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            To bring the magic of Reenat Trends straight to your wardrobe, we have partnered with India’s leading e-commerce marketplaces. You can browse and shop our authentic collections across:
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* Amazon */}
          <div className="flex items-center justify-center p-3 bg-white border border-slate-200/50 rounded-2xl shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-[#F1BF0A]/50 h-20 overflow-hidden relative">
            <div className="w-full h-full" style={{
              backgroundImage: 'url(/partners_strip.png)',
              backgroundSize: '150px auto',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center 5%'
            }} />
          </div>

          {/* Flipkart */}
          <div className="flex items-center justify-center p-3 bg-white border border-slate-200/50 rounded-2xl shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-[#F1BF0A]/50 h-20 overflow-hidden relative">
            <div className="w-full h-full" style={{
              backgroundImage: 'url(/partners_strip.png)',
              backgroundSize: '150px auto',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center 50%'
            }} />
          </div>

          {/* Ajio */}
          <div className="flex items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850/50 rounded-2xl shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-[#F1BF0A]/50 h-20 relative">
            <div className="relative w-full h-10 max-w-[120px]">
              <Image 
                src="/ajio_logo.png" 
                alt="Ajio" 
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain dark:invert dark:brightness-200"
              />
            </div>
          </div>

          {/* Meesho */}
          <div className="flex items-center justify-center p-3 bg-white border border-slate-200/50 rounded-2xl shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-[#F1BF0A]/50 h-20 overflow-hidden relative">
            <div className="w-full h-full" style={{
              backgroundImage: 'url(/partners_strip.png)',
              backgroundSize: '150px auto',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center 95%'
            }} />
          </div>
        </div>
      </section>

      {/* Connect With Us */}
      <section className="bg-white/80 dark:bg-slate-900/95 border border-slate-200/60 dark:border-white/10 rounded-[32px] text-slate-800 dark:text-white p-6 sm:p-10 shadow-xl relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F1BF0A]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#d9a05b] dark:text-[#F1BF0A] font-bold">Get In Touch</span>
            <h2 className="text-3xl sm:text-4xl font-anton uppercase tracking-wider">
              Connect With Us
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Whether you are a customer looking for the perfect festive drape or a business seeking collaboration, we would love to hear from you. Reach out via support or corporate channels.
            </p>
          </div>

          <div className="bg-slate-50/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-6 rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-200/60 dark:bg-white/10 flex items-center justify-center shrink-0 text-slate-600 dark:text-[#F1BF0A]">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Corporate Entity</span>
                <span className="text-base font-bold text-slate-800 dark:text-white font-sans">Onyx Enterprises</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-200/60 dark:bg-white/10 flex items-center justify-center shrink-0 text-slate-600 dark:text-[#F1BF0A]">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Brand</span>
                <span className="text-base font-bold text-slate-800 dark:text-white font-sans">Reenat Trends</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-200/60 dark:bg-white/10 flex items-center justify-center shrink-0 text-slate-600 dark:text-[#F1BF0A]">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Email Support</span>
                <a href="mailto:reenattrends@gmail.com" className="text-base font-bold text-[#183fad] dark:text-[#F1BF0A] hover:underline break-all font-sans">
                  reenattrends@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
