'use client';

import React from 'react';
import Link from 'next/link';

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-8 select-none">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[#F1BF0A] font-bold text-xs uppercase tracking-widest">
          REENAT TRENDS Compliance
        </span>
        <h1 className="text-3xl md:text-5xl font-anton text-slate-800 dark:text-white tracking-wide uppercase">
          Refund Policy
        </h1>
        <div className="w-16 h-1 bg-[#F1BF0A] mx-auto rounded-full mt-2" />
      </div>

      {/* Content */}
      <div className="bg-white/60 dark:bg-[#0c1e44]/30 border border-white/40 dark:border-white/8 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-lg card-fabric-texture text-slate-700 dark:text-slate-200 space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Return & Refund Eligibility
          </h2>
          <p>We offer a hassle-free 7-day return policy for all sarees purchased on our storefront. The 7-day window begins from the day the package delivery confirmation is updated by our courier partner.</p>
          <p>To be eligible for a refund, your saree must satisfy these conditions:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-650 dark:text-slate-350">
            <li>The product must be completely unused, unwashed, and in the exact condition you received it.</li>
            <li>All original packaging tags, product labels, and accessories (such as blouses) must be attached and returned intact.</li>
            <li>Handloom products showing normal natural weaving texture variations or handloom slubs are not considered defective as these are signature marks of handloom crafting.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            2. Non-Refundable Items
          </h2>
          <p>The following categories of products cannot be returned or refunded:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-650 dark:text-slate-355">
            <li>Sarees where the blouse piece has been cut, modified, or stitched.</li>
            <li>Customized, altered, or tailor-adjusted products.</li>
            <li>Products purchased during special Clearance Sales or Flash sales marked as non-returnable.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. Refund Process & Timelines
          </h2>
          <p>Once we receive your returned package at our warehouse, it will undergo a standard quality control inspection within 48 business hours. If approved, we will trigger your refund:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-650 dark:text-slate-355">
            <li><strong>Prepaid Orders:</strong> Refund is credited back to the original payment source (Razorpay bank account, credit card, or UPI ID) within 5 to 7 business days of warehouse inspection approval.</li>
            <li><strong>COD Orders:</strong> You will be sent a secure bank details request form. Once details are submitted, the refund is wired via NEFT/UPI to your designated account within 5 to 7 business days.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            4. Cancellation Policy
          </h2>
          <p>Orders can be cancelled before dispatch from our facility. Once an order is handed over to Shiprocket and a tracking link is generated, cancellations cannot be processed directly, and the package must instead follow our standard return process after delivery.</p>
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
