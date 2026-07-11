'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Test3DPage() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  // Mouse move handler for 3D card tilt effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to the card center (-1 to 1)
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Normalize values
    const rX = (mouseY / (height / 2)) * -15; // Max 15 degrees tilt
    const rY = (mouseX / (width / 2)) * 15;
    
    setCoords({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Top Navbar */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <Link href="/cms" className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
          ← Back to CMS Console
        </Link>
        <span className="text-xs font-extrabold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
          3D Sandbox Route
        </span>
      </nav>

      {/* Hero Content Grid */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 mt-12 lg:mt-0">
        
        {/* Left Side: Copy */}
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            The Zari Craft <br />
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">In Full Dimension</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Move your cursor or finger over the showcase saree on the right. Experience smooth, GPU-accelerated CSS 3D perspective tilt that responds instantly without slowing down mobile devices.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 cursor-pointer border-0">
              Explore Collection
            </button>
            <button className="border border-slate-700 hover:border-slate-500 bg-slate-900/40 text-slate-300 hover:text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-colors">
              How it works
            </button>
          </div>
        </div>

        {/* Right Side: The 3D Interactive Card */}
        <div className="flex justify-center items-center">
          <div 
            style={{ perspective: '1000px' }}
            className="w-full max-w-[360px] aspect-[3/4] flex justify-center items-center"
          >
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${coords.x}deg) rotateY(${coords.y}deg) scale(${isHovered ? 1.05 : 1})`,
                transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                transformStyle: 'preserve-3d'
              }}
              className="w-full h-full rounded-3xl bg-slate-900/60 border border-white/10 p-6 flex flex-col justify-between shadow-2xl relative cursor-grab active:cursor-grabbing group overflow-hidden"
            >
              {/* Gloss shine reflection effect */}
              <div 
                style={{
                  transform: `translateZ(50px) translateX(${coords.y * 3}px) translateY(${coords.x * 3}px)`,
                  transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none rounded-3xl"
              />

              {/* Top Row inside Card */}
              <div 
                style={{ transform: 'translateZ(40px)' }}
                className="flex justify-between items-center z-10"
              >
                <span className="text-[10px] uppercase tracking-widest font-black text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
                  Premium Silk
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  NSY-0042
                </span>
              </div>

              {/* Middle: Saree Image showcasing Depth */}
              <div 
                style={{ 
                  transform: 'translateZ(80px)',
                  filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.7))'
                }}
                className="w-full flex justify-center items-center my-6 z-10 transition-transform duration-500"
              >
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-400/40 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80" 
                    alt="Saree preview"
                    className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700 ease-out" 
                  />
                </div>
              </div>

              {/* Bottom Card Copy */}
              <div 
                style={{ transform: 'translateZ(60px)' }}
                className="space-y-2 z-10"
              >
                <h3 className="text-lg font-bold leading-tight group-hover:text-yellow-400 transition-colors">
                  Classic Kanchipuram Brocade
                </h3>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold">Price</p>
                    <p className="text-xl font-black text-white">₹2,949</p>
                  </div>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 font-bold px-3 py-1.5 rounded-lg border border-blue-500/20">
                    Interact Mode
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Info Notice */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto w-full z-10 text-[10px] text-slate-500 gap-4 border-t border-slate-900 pt-6">
        <span>© 2026 Reenat Trends • 3D CSS Transform Demonstration</span>
        <span>Runs smoothly on iOS, Android, and Desktop</span>
      </div>
    </div>
  );
}
