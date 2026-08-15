import Script from "next/script";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingNav from "../components/FloatingNav";
import QuickViewModal from "../components/QuickViewModal";
import "./globals.css";

export const metadata = {
  title: "Reenat Trends — Handloom Sarees",
  description: "Exquisite handloom sarees crafted with tradition and modern finesse — perfect for every celebration and occasion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-dvh text-base font-normal text-slate-900 dark:text-slate-100 px-3.5 pt-[calc(6px+env(safe-area-inset-top,0px))] flex flex-col justify-between" suppressHydrationWarning>
        <AppProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-0">
            {children}
          </main>
          <Footer />
          <FloatingNav />
          <QuickViewModal />
        </AppProvider>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID || "1600677861596675"}');
            fbq('track', 'PageView');
          `}
        </Script>
        <Script 
          src="https://checkout-ui.shiprocket.com/assets/js/channels/login.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}

