'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { auth, googleProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from '../../utils/firebase';

import Script from 'next/script';

export default function Login() {
  const router = useRouter();
  const { userSession, handleLogin, showToast } = useApp();
  
  // Phone auth states
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFastrrLoading, setIsFastrrLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (userSession) {
      router.push('/account');
    }
  }, [userSession, router]);

  const handleFastrrLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsFastrrLoading(true);
    showToast('Initializing Shiprocket Fastrr 1-Click Login...', 'info');

    try {
      // 1. Fetch token from server API
      const res = await fetch('/api/auth/fastrr/token', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.ok || !data.result?.token) {
        throw new Error(data.error || 'Could not generate Fastrr login token.');
      }

      const token = data.result.token;

      // 2. Ensure Login SDK is initialized
      const ensureLoginSdk = () => new Promise((resolve) => {
        const getSdk = () => {
          if (typeof window === 'undefined') return null;
          if (window.ShiprocketLogin && typeof window.ShiprocketLogin.buyNow === 'function') return window.ShiprocketLogin;
          if (window.HeadlessCheckout && typeof window.HeadlessCheckout.buyNow === 'function') return window.HeadlessCheckout;
          return null;
        };

        const existing = getSdk();
        if (existing) { resolve(existing); return; }

        let attempts = 0;
        const poll = setInterval(() => {
          attempts++;
          const sdk = getSdk();
          if (sdk) {
            clearInterval(poll);
            resolve(sdk);
          } else if (attempts >= 40) {
            clearInterval(poll);
            resolve(null);
          }
        }, 100);
      });

      const loginSdk = await ensureLoginSdk();
      if (!loginSdk || typeof loginSdk.buyNow !== 'function') {
        throw new Error('Shiprocket Fastrr SDK is loading. Please try again in a few seconds.');
      }

      const config = {
        amount: 0,
        themecolor: '183fad',
        image: 'https://www.reenattrends.com/saree_kanjivaram.png'
      };

      // 3. Launch Fastrr Login Dialog
      loginSdk.buyNow(e, token, config, async (response) => {
        try {
          setIsFastrrLoading(true);
          showToast('Authenticating user profile...', 'info');

          const authToken = response?.result?.authorised_customer_token || response?.token;
          const payload = authToken ? { token: authToken } : { customerData: response?.data || response };

          const verifyRes = await fetch('/api/auth/fastrr/customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success && verifyData.userSession) {
            handleLogin(verifyData.userSession);
            showToast(`Welcome back! Signed in via Fastrr as ${verifyData.userSession.username}.`, 'success');
            router.push('/account');
          } else {
            throw new Error(verifyData.error || 'Failed to authenticate Fastrr user.');
          }
        } catch (verifyErr) {
          console.error('Fastrr authentication callback error:', verifyErr);
          showToast(`Fastrr Authentication Failed: ${verifyErr.message}`, 'error');
        } finally {
          setIsFastrrLoading(false);
        }
      });
    } catch (err) {
      console.error('Fastrr login initiation error:', err);
      showToast(`Fastrr Login Error: ${err.message}`, 'error');
    } finally {
      setIsFastrrLoading(false);
    }
  };


  useEffect(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
          }
        });
      } catch (err) {
        console.error('Error initializing RecaptchaVerifier:', err);
      }
    }
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error('Error cleaning up RecaptchaVerifier:', e);
        }
      }
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const rawDigits = phone.replace(/\D/g, '');
    if (!phone || rawDigits.length < 10) {
      showToast('Please enter a valid 10-digit phone number.', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    showToast('Sending OTP code via SMS...', 'info');

    try {
      const formattedPhone = `+91${rawDigits}`;
      
      // Ensure recaptchaVerifier is initialized
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      showToast('OTP code sent successfully to your phone!', 'success');
    } catch (err) {
      console.error('Error sending OTP:', err);
      showToast(`Failed to send SMS: ${err.message}`, 'error');
      // Reset reCAPTCHA on error so the user can retry
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error('Error clearing RecaptchaVerifier:', e);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otpCode || otpCode.length < 6) {
      showToast('Please enter the 6-digit OTP code.', 'warning');
      return;
    }

    if (!confirmationResult) {
      showToast('Session expired. Please try sending OTP again.', 'error');
      setOtpSent(false);
      return;
    }

    setIsSubmitting(true);
    showToast('Verifying OTP...', 'info');
    
    try {
      const result = await confirmationResult.confirm(otpCode);
      const user = result.user;
      
      const rawDigits = phone.replace(/\D/g, '');
      const userObj = {
        isLoggedIn: true,
        email: user.email || `${rawDigits}@reenattrends.com`,
        phone: user.phoneNumber || `+91${rawDigits}`,
        username: user.displayName || `Customer (${rawDigits.slice(-4)})`,
        joinedDate: 'July 2026',
        uid: user.uid
      };
      
      handleLogin(userObj);
      showToast('Logged in successfully!', 'success');
      router.push('/account');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      showToast(`Invalid verification code: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    showToast('Connecting to Google account...', 'info');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userObj = {
        isLoggedIn: true,
        email: user.email || '',
        phone: user.phoneNumber || '',
        username: user.displayName || 'Google User',
        joinedDate: 'July 2026',
        uid: user.uid
      };
      
      handleLogin(userObj);
      showToast(`Welcome back! Signed in as ${userObj.username}.`, 'success');
      router.push('/account');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      showToast(`Google Sign-In failed: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto w-full flex-1 flex items-stretch justify-center p-4 py-8">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden bg-white/70 dark:bg-[#0f1f41]/60 border border-black/5 dark:border-white/10 shadow-lg glass min-h-[500px]">
        {/* Left Editorial Image */}
        <div className="hidden md:block relative bg-[#0c1e44]">
          <img src="/login_saree.png" alt="Traditional Weaving" className="w-full h-full object-cover select-none pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1e44]/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
            <span className="text-xs uppercase tracking-widest text-[#F1BF0A] font-semibold">Traditional Weaves</span>
            <h2 className="text-3xl font-anton mt-1 leading-tight">PRESERVED BY HAND,<br />CRAFTED FOR ROYALTY</h2>
            <p className="text-sm text-slate-300 mt-2 max-w-xs">Connecting you directly with weaver networks across traditional Indian silk hubs.</p>
          </div>
        </div>
        
        {/* Right Auth Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center items-center text-center space-y-6">
          <div>
            <h2 className="text-3xl font-anton text-slate-800 dark:text-white uppercase tracking-wide">
              SECURE SIGN IN
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
              Instant 1-Click Mobile OTP verification powered by Shiprocket Fastrr.
            </p>
          </div>

          {/* Primary Fastrr 1-Click Phone Login Button */}
          <div className="w-full max-w-sm space-y-3 pt-2">
            <div
              onClick={handleFastrrLogin}
              role="button"
              tabIndex={0}
              style={{
                backgroundColor: '#0c1e44',
                color: '#ffffff',
                borderColor: '#f59e0b',
                borderWidth: '1px',
                borderStyle: 'solid',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 22px',
                borderRadius: '9999px',
                width: '100%',
                cursor: isFastrrLoading ? 'wait' : 'pointer',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                userSelect: 'none'
              }}
              className="hover:bg-[#183fad] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isFastrrLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '8px', color: '#ffffff', fontWeight: 'bold' }}>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px', display: 'inline-block' }}>Connecting Fastrr...</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.25)', padding: '6px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: '16px', height: '16px', color: '#fbbf24', fill: '#fbbf24' }} viewBox="0 0 24 24">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </div>
                    <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '14px', letterSpacing: '-0.01em', opacity: 1, visibility: 'visible', display: 'inline-block' }}>
                      1-Click Phone Login (Fastrr)
                    </span>
                  </div>

                  <span style={{ color: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.18)', padding: '4px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(255, 255, 255, 0.2)', whiteSpace: 'nowrap' }}>
                    SHIPROCKET
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-2">
              Instant OTP verification & saved delivery addresses powered by Shiprocket Fastrr.
            </p>
          </div>

          <div id="recaptcha-container"></div>
        </div>
      </div>

      {/* Shiprocket Fastrr 1-Click Login SDK */}
      <Script 
        id="shiprocket-login-sdk"
        src="https://checkout-ui.shiprocket.com/assets/js/channels/login.js" 
        strategy="lazyOnload"
      />
    </main>
  );
}
