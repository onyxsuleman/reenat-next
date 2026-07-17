'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-8 select-none">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[#F1BF0A] font-bold text-xs uppercase tracking-widest">
          REENAT TRENDS Compliance
        </span>
        <h1 className="text-3xl md:text-5xl font-anton text-slate-800 dark:text-white tracking-wide uppercase">
          Privacy Policy
        </h1>
        <div className="w-16 h-1 bg-[#F1BF0A] mx-auto rounded-full mt-2" />
      </div>

      {/* Content */}
      <div className="bg-white/60 dark:bg-[#0c1e44]/30 border border-white/40 dark:border-white/8 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-lg card-fabric-texture text-slate-700 dark:text-slate-200 space-y-6 text-sm leading-relaxed">
        <p>At REENAT TRENDS, we value the trust you place in us. This Privacy Policy details how we collect, use, and protect your personal information when you browse and purchase cotton silk sarees on our storefront.</p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Information Collection
          </h2>
          <p>We collect essential information to process your orders, including:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-650 dark:text-slate-350">
            <li><strong>Customer Profile:</strong> Name, email address, mobile phone number.</li>
            <li><strong>Shipping Coordinates:</strong> Delivery address, billing address, zip code/pin-code.</li>
            <li><strong>Transaction Details:</strong> Saree purchase history, order value, payment status. (We do NOT store credit card details or bank passwords; all transactions are processed securely through RBI-approved payment gateways).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            2. How We Use Your Data
          </h2>
          <p>Your details are used strictly to run our store services, including:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-650 dark:text-slate-355">
            <li>Fulfilling orders, managing shipping coordinates, and tracking delivery status.</li>
            <li>Verifying Cash on Delivery (COD) orders via OTP check to prevent catalog abuse.</li>
            <li>Sending important updates (order status, tracking links) via WhatsApp, SMS, or Email.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. Sharing With Third Parties
          </h2>
          <p>We respect your privacy. We never sell or lease your database details. Data is only shared with verified partners for operational execution:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-650 dark:text-slate-355">
            <li><strong>Logistics Partners:</strong> Shiprocket (to calculate shipping rates, generate labels, and deliver packages).</li>
            <li><strong>Payment Gateways:</strong> Razorpay (to securely process online UPI and card payments).</li>
            <li><strong>OTP Verification:</strong> SMS/WhatsApp gateways (for secure customer login authentication).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            4. Data Security
          </h2>
          <p>We implement Secure Socket Layer (SSL) encryption for all browser traffic and strictly control database access controls to safeguard your transaction records. If you want us to update or delete your user account details, you can contact us at <a href="mailto:support@reenattrends.com" className="text-[#183fad] dark:text-[#F1BF0A] font-semibold hover:underline">support@reenattrends.com</a>.</p>
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
