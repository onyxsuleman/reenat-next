'use client';

import React from 'react';
import Link from 'next/link';

export default function ReturnsPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-8 select-none">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[#F1BF0A] font-bold text-xs uppercase tracking-widest">
          REENAT TRENDS Compliance
        </span>
        <h1 className="text-3xl md:text-5xl font-anton text-slate-800 dark:text-white tracking-wide uppercase">
          Return & Exchange Policy
        </h1>
        <div className="w-16 h-1 bg-[#F1BF0A] mx-auto rounded-full mt-2" />
      </div>

      {/* Content */}
      <div className="bg-white/60 dark:bg-[#0c1e44]/30 border border-white/40 dark:border-white/8 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-lg card-fabric-texture text-slate-700 dark:text-slate-200 space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Return & Exchange Request Instructions
          </h2>
          <p>We want you to love your Paithani saree. If for any reason you are not satisfied, you can request a return or size/color exchange within 7 days of package delivery.</p>
          <p>Follow these quick steps to submit a request:</p>
          <ol className="list-decimal pl-5 space-y-2 mt-1 text-slate-650 dark:text-slate-350">
            <li><strong>Initiate Request:</strong> Message our support team via WhatsApp at +91 90285 71571 or email us at <a href="mailto:support@reenattrends.com" className="text-[#183fad] dark:text-[#F1BF0A] font-semibold hover:underline">support@reenattrends.com</a>. Make sure to specify your unique Order ID and the Product code (e.g., NSY0042).</li>
            <li><strong>Provide Media Proof:</strong> Attach a clean photo or video of the product highlighting that tags, fold borders, and blouses remain uncut and undamaged.</li>
            <li><strong>Reverse Pickup Scheduling:</strong> Once verified, we will arrange a reverse courier pickup from your address within 24 to 48 business hours via our delivery partners. Reverse shipping is completely free for customers!</li>
          </ol>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            2. Exchange Saree Options
          </h2>
          <p>If you request an exchange (e.g. swap Mango Rani Paithani for classic Gold Cotton Silk):</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-650 dark:text-slate-355">
            <li>Exchanges are subject to inventory stock levels at our warehouse.</li>
            <li>If the preferred exchange variation is out of stock, we will issue a store credit coupon or a full refund back to your account.</li>
            <li>Exchange items will be shipped out within 24 hours of receiving and approving the original return box at our facility.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. Guidelines for Handloom Protection
          </h2>
          <p>Our Paithani and Cotton Silk sarees are carefully pressed and folded inside premium cases. To prevent creases and fabric fatigue during reverse transit, please pack the saree carefully inside its original cover and cardboard box before handing it over to the Shiprocket delivery courier.</p>
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
