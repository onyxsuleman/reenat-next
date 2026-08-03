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
      <head>
        <link rel="stylesheet" href="https://checkout-ui.shiprocket.com/assets/styles/shopify.css" />
      </head>
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
        <Script 
          src="https://checkout-ui.shiprocket.com/assets/js/channels/login.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}

