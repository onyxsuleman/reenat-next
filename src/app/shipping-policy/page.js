'use client';

import React from 'react';
import Link from 'next/link';

export default function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-8 select-none">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[#F1BF0A] font-bold text-xs uppercase tracking-widest">
          REENAT TRENDS Compliance
        </span>
        <h1 className="text-3xl md:text-5xl font-anton text-slate-800 dark:text-white tracking-wide uppercase">
          Shipping Policy
        </h1>
        <div className="w-16 h-1 bg-[#F1BF0A] mx-auto rounded-full mt-2" />
      </div>

      {/* Content */}
      <div className="bg-white/60 dark:bg-[#0c1e44]/30 border border-white/40 dark:border-white/8 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-lg card-fabric-texture text-slate-700 dark:text-slate-200 space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Shipping Rates & Delivery Time
          </h2>
          <p>We process all orders within 24 to 48 business hours. We offer free standard delivery across all of India on all prepaid transactions. For Cash on Delivery (COD) order placements, a nominal COD handling fee of ₹50 will be applicable.</p>
          <p>Estimated shipping transit times vary by customer delivery pin-code:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-650 dark:text-slate-355">
            <li><strong>Metro Cities (Mumbai, Delhi, Bangalore, etc.):</strong> 3 to 5 business days.</li>
            <li><strong>Rest of India:</strong> 5 to 7 business days.</li>
            <li><strong>Remote Locations:</strong> Up to 10 business days.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            2. Shipment Tracking
          </h2>
          <p>Once your order has been handed over to our shipping partner (Shiprocket), a unique tracking ID and confirmation link will be sent to you automatically via SMS, WhatsApp message, and Email. You can trace your shipment's live route status using that tracking ID.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. Cash on Delivery (COD) Rules
          </h2>
          <p>To ensure smooth delivery coordinates for COD orders, an automated OTP verification check is performed at checkout. Please make sure that your phone number is correct and active. COD packages are not allowed to be opened or tried prior to full payment processing to the delivery courier person.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            4. Damaged or Lost Shipments
          </h2>
          <p>If your package arrives with damaged or tampered seals, please do not accept the package from the delivery agent and capture photo/video proof. Reach out immediately to our customer care team at <a href="mailto:support@reenattrends.com" className="text-[#183fad] dark:text-[#F1BF0A] font-semibold hover:underline">support@reenattrends.com</a> or WhatsApp us at +91 90285 71571 with details of the damaged box.</p>
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
