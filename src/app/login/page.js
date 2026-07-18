'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { auth, isFirebaseConfigured } from '../../utils/firebase';

export default function Login() {
  const router = useRouter();
  const { userSession, handleLogin, showToast } = useApp();
  
  // Phone auth states
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userSession) {
      router.push('/account');
    }
  }, [userSession, router]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth) {
      showToast('Authentication is currently offline. Please configure Firebase settings in .env.local.', 'error');
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit phone number.', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    const rawDigits = phone.replace(/\D/g, '');
    const formattedPhone = `+91${rawDigits}`;
    
    // MOCK BYPASS FOR TESTING: Bypasses Firebase reCAPTCHA and SMS gateways for test numbers starting with 9999 or 9900
    if (rawDigits.startsWith('9999') || rawDigits.startsWith('9900')) {
      showToast('Local test mode: Bypassing reCAPTCHA...', 'info');
      window.confirmationResult = {
        confirm: async (code) => {
          return {
            user: {
              uid: `mock-test-uid-${rawDigits}`,
              phoneNumber: formattedPhone,
              displayName: "Reenat Test User",
              email: "tester@reenattrends.com",
              metadata: {
                creationTime: new Date().toISOString()
              }
            }
          };
        }
      };
      setTimeout(() => {
        setOtpSent(true);
        setIsSubmitting(false);
        showToast('OTP sent successfully (Test Mode)!', 'success');
      }, 800);
      return;
    }
    
    try {
      const { RecaptchaVerifier, signInWithPhoneNumber } = require('firebase/auth');
      
      // Destroy old verifier instance completely
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // Ignore — container may already be gone
        }
        window.recaptchaVerifier = null;
      }

      // CRITICAL FIX: Destroy the old container and create a fresh DOM node.
      // reCAPTCHA's internal registry remembers rendered elements by reference,
      // so innerHTML='' is NOT enough — we must replace the entire node.
      const oldContainer = document.getElementById('recaptcha-container');
      if (oldContainer) {
        const freshContainer = document.createElement('div');
        freshContainer.id = 'recaptcha-container';
        freshContainer.className = 'hidden';
        oldContainer.parentNode.replaceChild(freshContainer, oldContainer);
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
      
      showToast('Sending OTP...', 'info');
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      showToast('OTP sent successfully!', 'success');
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error.code === 'auth/network-request-failed' || error.message?.includes('network-request-failed')) {
        showToast("Network/API blocked: Please check your internet, disable ad-blockers, or verify billing/domain settings.", 'error');
      } else {
        showToast(error.message || "Failed to send OTP.", 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!window.confirmationResult) {
      showToast('Authentication session is invalid or has expired. Please try again.', 'error');
      return;
    }

    if (!otpCode || otpCode.length < 6) {
      showToast('Please enter the 6-digit OTP code.', 'warning');
      return;
    }

    setIsSubmitting(true);
    
    try {
      showToast('Verifying OTP...', 'info');
      const result = await window.confirmationResult.confirm(otpCode);
      const user = result.user;
      
      const username = user.displayName || user.phoneNumber || 'User';
      const userObj = {
        isLoggedIn: true,
        email: user.email || '',
        phone: user.phoneNumber || '',
        username: username,
        joinedDate: 'July 2026',
        uid: user.uid
      };
      handleLogin(userObj);
      router.push('/account');
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showToast(error.message || "Invalid OTP code. Please try again.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured || !auth) {
      showToast('Authentication is currently offline. Please configure Firebase settings in .env.local.', 'error');
      return;
    }

    try {
      const { signInWithPopup, GoogleAuthProvider } = require('firebase/auth');
      showToast('Connecting to Google...', 'info');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const username = user.displayName || user.email?.split('@')[0] || 'Google User';
      const userObj = {
        isLoggedIn: true,
        email: user.email || '',
        phone: user.phoneNumber || '',
        username: username,
        joinedDate: 'July 2026',
        uid: user.uid
      };
      handleLogin(userObj);
      showToast(`Welcome ${username}!`, 'success');
      router.push('/account');
    } catch (error) {
      console.error("Google sign in error:", error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        showToast('Google sign-in was cancelled. Please try again.', 'warning');
      } else if (error.code === 'auth/network-request-failed') {
        showToast('Network error: Please check your internet connection and try again.', 'error');
      } else {
        showToast(error.message || "Google sign in failed.", 'error');
      }
    }
  };

  return (
    <main className="max-w-5xl mx-auto w-full flex-1 flex items-stretch justify-center p-4 py-8">
      {/* Hidden container for Firebase Invisible Recaptcha */}
      <div id="recaptcha-container" className="hidden"></div>
      
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
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-2xl font-anton text-slate-800 dark:text-white uppercase">
              Secure Sign In
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign in via OTP code or your Google Account to manage orders.
            </p>
          </div>

          {!isFirebaseConfigured && (
            <div className="bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-2xl p-4 text-xs text-rose-600 dark:text-rose-450 leading-relaxed shadow-sm">
              <p className="font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                Firebase Configuration Required
              </p>
              Please configure `NEXT_PUBLIC_FIREBASE_API_KEY` and `NEXT_PUBLIC_FIREBASE_APP_ID` environment variables in your local setting file to activate live authentication.
            </div>
          )}
          
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4 text-slate-800 dark:text-white">
            {!otpSent ? (
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number (10 Digits)</label>
                <div className="flex gap-2">
                  <span className="bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400 flex items-center font-semibold select-none">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    id="phone" 
                    required 
                    maxLength={10}
                    disabled={!isFirebaseConfigured}
                    placeholder="9876543210" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A] transition-all disabled:opacity-50" 
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="otpCode" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  id="otpCode" 
                  required 
                  maxLength={6}
                  disabled={isSubmitting}
                  placeholder="••••••" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full tracking-[0.5em] text-center font-bold bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-lg text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A] transition-all disabled:opacity-50" 
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">OTP sent to +91 {phone}</span>
                  <button 
                    type="button" 
                    onClick={() => setOtpSent(false)} 
                    disabled={isSubmitting}
                    className="text-xs text-[#183fad] dark:text-[#F1BF0A] hover:underline bg-transparent border-0 cursor-pointer font-semibold disabled:opacity-50"
                  >
                    Change Number
                  </button>
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={!isFirebaseConfigured || isSubmitting}
              className="w-full bg-[#183fad] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-full border border-[#183fad] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer mt-2 text-sm"
            >
              {otpSent ? 'Verify OTP Code' : 'Get SMS Verification Code'}
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5 dark:border-white/10"></div>
            </div>
            <span className="relative px-3 text-[10px] text-slate-400 dark:text-slate-500 bg-white/90 dark:bg-[#0c1e44] rounded-full font-semibold uppercase tracking-wider select-none">
              Or
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={!isFirebaseConfigured}
            className="w-full flex items-center justify-center gap-3 bg-white/90 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 py-2.5 px-6 rounded-full font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="size-5 select-none" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </main>
  );
}
