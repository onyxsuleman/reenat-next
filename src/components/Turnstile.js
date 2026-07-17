'use client';

import React, { useEffect, useRef } from 'react';

export default function Turnstile({ siteKey, onVerify, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!siteKey) return;

    let widgetId = null;

    // Check if script is already injected
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    
    const initializeTurnstile = () => {
      if (window.turnstile && containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
          widgetId = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => {
              if (onVerify) onVerify(token);
            },
          });
        } catch (err) {
          console.error("Turnstile render error:", err);
        }
      }
    };

    if (!window.turnstile) {
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        script.onload = initializeTurnstile;
      } else {
        const interval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(interval);
            initializeTurnstile();
          }
        }, 100);
        return () => clearInterval(interval);
      }
    } else {
      initializeTurnstile();
    }

    return () => {
      if (widgetId !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [siteKey, onVerify]);

  if (!siteKey) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/50 select-none">
          ⚠️ Developer Note: Turnstile site key is missing. CAPTCHA verification will be bypassed server-side.
        </div>
      );
    }
    return null;
  }

  return <div ref={containerRef} className={className} />;
}
