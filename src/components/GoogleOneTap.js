'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { auth, isFirebaseConfigured } from '../utils/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

export default function GoogleOneTap() {
  const router = useRouter();
  const { userSession, handleLogin, showToast } = useApp();

  useEffect(() => {
    // 1. If user is already logged in, do not prompt
    if (userSession) return;

    // 2. Check if Firebase configuration is active
    if (!isFirebaseConfigured) {
      console.warn("[Google One-Tap] Firebase is not fully configured, skipping GSI prompt.");
      return;
    }

    // 3. Retrieve Google Client ID from environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("[Google One-Tap] Configuration warning: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured in environment variables.");
      return;
    }

    // 4. Handle sign-in callback response from Google
    const handleCredentialResponse = async (response) => {
      try {
        showToast('Signing in with Google One-Tap...', 'info');
        const credential = GoogleAuthProvider.credential(response.credential);
        const result = await signInWithCredential(auth, credential);
        const user = result.user;

        // Persist session to localStorage via AppContext
        const username = user.displayName || user.email?.split('@')[0] || 'Google User';
        handleLogin({
          isLoggedIn: true,
          email: user.email || '',
          phone: user.phoneNumber || '',
          username: username,
          joinedDate: 'July 2026',
          uid: user.uid
        });
        showToast(`Welcome ${username}!`, 'success');
        router.push('/account');
      } catch (error) {
        console.error("Google One-Tap login error:", error);
        showToast('Google One-Tap sign-in failed.', 'error');
      }
    };

    const initOneTap = () => {
      if (window.google?.accounts?.id) {
        // Prevent double initialization during React Strict Mode render cycles
        if (window.googleOneTapInitialized) {
          window.google.accounts.id.prompt();
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false, // Prevents automatic login bugs on page reload
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, // Disable FedCM to prevent AbortError/NetworkError conflicts in dev
        });

        window.googleOneTapInitialized = true;

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log("[Google One-Tap] Prompt not displayed:", notification.getNotDisplayedReason());
          } else if (notification.isSkippedMoment()) {
            console.log("[Google One-Tap] Prompt skipped:", notification.getSkippedReason());
          } else if (notification.isDismissedMoment()) {
            console.log("[Google One-Tap] Prompt dismissed:", notification.getDismissedReason());
          }
        });
      }
    };

    // Initialize GSI if script is already parsed
    if (window.google?.accounts?.id) {
      initOneTap();
    } else {
      // Retry in 1.5 seconds if script is still parsing
      const timer = setTimeout(() => {
        if (window.google?.accounts?.id) {
          initOneTap();
        }
      }, 1500);
      return () => {
        clearTimeout(timer);
        // Cancel the One-Tap prompt when component unmounts or user logs in
        if (window.google?.accounts?.id) {
          window.google.accounts.id.cancel();
        }
      };
    }

    // Cleanup: cancel the One-Tap prompt
    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [userSession]);

  return null;
}

