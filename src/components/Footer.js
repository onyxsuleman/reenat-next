'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="max-w-5xl w-full mx-auto bg-[#183fad] text-white px-4 sm:px-9.5 pb-4 mt-20 pt-6 sm:pt-10 rounded-t-4xl relative z-0 overflow-hidden glass">
      <nav className="-mb-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs md:text-sm/6 max-w-4xl mx-auto px-4">
        <Link href="/" className="hover:text-[#F1BF0A] transition-colors">Home</Link>
        <Link href="/about" className="hover:text-[#F1BF0A] transition-colors">About</Link>
        <Link href="/new-arrivals" className="hover:text-[#F1BF0A] transition-colors">Collection</Link>
        <a 
          href="https://wa.me/919028571571?text=Hi%2C%20I%27m%20interested%20in%20wholesale%20buying%20from%20Reenat%20Trends." 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-[#F1BF0A] transition-colors text-white/90 font-medium"
        >
          Bulk Purchase
        </a>
        <Link href="/shipping-policy" className="hover:text-[#F1BF0A] transition-colors text-white/80">Shipping Policy</Link>
        <Link href="/refund-policy" className="hover:text-[#F1BF0A] transition-colors text-white/80">Refund Policy</Link>
        <Link href="/privacy-policy" className="hover:text-[#F1BF0A] transition-colors text-white/80">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-[#F1BF0A] transition-colors text-white/80">Terms of Service</Link>
        <Link href="/returns" className="hover:text-[#F1BF0A] transition-colors text-white/80">Returns & Exchanges</Link>
      </nav>

      {/* Bulk Purchase / Wholesale Callout */}
      <div className="mt-12 max-w-2xl mx-auto bg-white/10 dark:bg-black/20 rounded-2xl p-4 sm:p-5 border border-white/15 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="text-[#F1BF0A] font-bold text-[11px] uppercase tracking-wider block mb-0.5">Wholesale Deals & Bulk Orders</span>
          <h4 className="font-bold text-white text-sm sm:text-base">Buying in Bulk?</h4>
          <p className="text-white/80 text-xs mt-0.5 leading-relaxed">
            Get special wholesale pricing, custom packing, and priority shipping for weddings, gifting, or retail.
          </p>
        </div>
        <a 
          href="https://wa.me/919028571571?text=Hi%2C%20I%27m%20interested%20in%20wholesale%20buying%20from%20Reenat%20Trends." 
          target="_blank" 
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full py-2.5 px-5 font-semibold text-xs transition-colors shadow-md hover:no-underline"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0">
            <path d="M17.472 14.382c-.022-.079-.186-.285-.438-.413-.252-.127-1.49-.736-1.72-.818-.23-.082-.397-.123-.564.123-.167.247-.648.818-.795.986-.147.168-.293.188-.545.061-.252-.127-1.066-.393-2.03-1.253-.75-.67-1.257-1.498-1.405-1.75-.147-.253-.015-.39.111-.516.113-.113.252-.293.378-.44.127-.147.168-.253.253-.42.083-.168.041-.314-.02-.44-.061-.127-.564-1.36-.773-1.86-.203-.49-.406-.423-.564-.423-.146-.007-.314-.007-.482-.007-.168 0-.443.063-.674.314-.23.253-.88.86-.88 2.098 0 1.237.9 2.43 1.025 2.6.126.17 1.767 2.698 4.28 3.784.6.257 1.065.41 1.43.527.6.19 1.15.163 1.583.098.483-.072 1.49-.61 1.702-1.2 0 0 .041-.21.015-.285z"/>
            <path d="M12.003 21c-1.63 0-3.176-.426-4.526-1.173l-.324-.192-3.36.88.895-3.277-.21-.335A8.966 8.966 0 013 12c0-4.963 4.037-9 9-9 4.962 0 9 4.037 9 9 0 4.962-4.038 9-9 9zm9.006-18C16.326.31 9.684.31 5.006 4.988 1.309 8.687.312 14.238 2.502 19.06L.5 24.5l5.56-.1.085-.05c4.71 3.25 11.233 2.15 14.654-2.58 3.656-5.06 2.378-12.062-2.79-15.77z"/>
          </svg>
          <span>WhatsApp Wholesale</span>
        </a>
      </div>

      <div className="mt-8 border-t border-white/30 pt-4 md:flex md:items-center md:justify-between">
        {/* Social Icons */}
        <div className="flex gap-x-6 justify-center md:justify-start md:order-2">
          <a href="https://www.facebook.com/people/Reenat-Trends/61592477576586/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#F1BF0A] transition-colors">
            <span className="sr-only">Facebook</span>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-6">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" fillRule="evenodd"></path>
            </svg>
          </a>
          <a href="https://www.instagram.com/reenattrends" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#F1BF0A] transition-colors">
            <span className="sr-only">Instagram</span>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-6">
              <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" fillRule="evenodd"></path>
            </svg>
          </a>
          <a href="#" className="text-white hover:text-[#F1BF0A] transition-colors">
            <span className="sr-only">X</span>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-6">
              <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z"></path>
            </svg>
          </a>
        </div>
        <p className="mt-4 sm:mt-8 text-sm/6 text-white/50 text-center md:text-left md:order-1 md:mt-0">© 2026 Reenat Trends. All rights reserved.</p>
      </div>
    </footer>
  );
}
