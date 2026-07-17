'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-8 select-none">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[#F1BF0A] font-bold text-xs uppercase tracking-widest">
          REENAT TRENDS Compliance
        </span>
        <h1 className="text-3xl md:text-5xl font-anton text-slate-800 dark:text-white tracking-wide uppercase">
          Terms of Service
        </h1>
        <div className="w-16 h-1 bg-[#F1BF0A] mx-auto rounded-full mt-2" />
      </div>

      {/* Content */}
      <div className="bg-white/60 dark:bg-[#0c1e44]/30 border border-white/40 dark:border-white/8 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-lg card-fabric-texture text-slate-700 dark:text-slate-200 space-y-6 text-sm leading-relaxed">
        <p>Welcome to REENAT TRENDS. By accessing and purchasing cotton silk sarees from our online store, you agree to comply with and be bound by the following terms and conditions.</p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. User Registration & OTP Checks
          </h2>
          <p>To place orders, track shipments, and request refunds on our storefront, you may be required to log in via secure OTP (One-Time Password) checks. You are responsible for ensuring that the phone number you provide is active, correct, and belongs to you.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            2. Product Quality & Handloom Disclosure
          </h2>
          <p>Reenat Trends specializes in traditional Paithani and handloom weaving styles. We make every effort to display the colors, fabrics, and textures of our sarees as accurately as possible. However:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-650 dark:text-slate-350">
            <li>Actual colors may vary slightly depending on your screen settings and digital photography lightning.</li>
            <li>Natural variations in weaving patterns, minor thread pulls, or handloom slubs are part of the artistic handloom process and are not classified as quality defects.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. Pricing & Billing Terms
          </h2>
          <p>All prices listed on our storefront are inclusive of GST (where applicable) and listed in Indian Rupees (INR). We reserve the right to correct pricing errors, update saree catalog listings, or cancel orders arising from system database inventory glitches.</p>
          <p>We support secure prepaid billing (UPI, cards) powered by Razorpay, alongside Cash on Delivery options.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            4. Limitations of Liability
          </h2>
          <p>Reenat Trends shall not be liable for any delivery delays caused by shipping logistics bottlenecks (Shiprocket) or regional courier issues beyond our control. Our total liability for any order issue is limited strictly to the price paid for that order.</p>
        </section>
      </div>

      {/* Back button */}
      <div className="text-center pt-4">
        <Link href="/" className="inline-flex items-center gap-2 btn-primary rounded-full py-2 px-6 font-semibold transition-transform duration-300 hover:scale-105 shadow-sm text-sm">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
