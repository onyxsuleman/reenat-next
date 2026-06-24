'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const router = useRouter();
  const { userSession, handleLogin } = useApp();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (userSession) {
      router.push('/account');
    }
  }, [userSession]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = email.split('@')[0];
    const userObj = {
      isLoggedIn: true,
      email: email,
      username: username,
      joinedDate: 'June 2026'
    };
    handleLogin(userObj);
    router.push('/account');
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
            <p className="text-sm text-slate-305 mt-2 max-w-xs">Connecting you directly with weaver networks across traditional Indian silk hubs.</p>
          </div>
        </div>
        
        {/* Right Auth Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-2xl font-anton text-slate-800 dark:text-white uppercase">
              {isLoginMode ? 'Welcome Back' : 'Join Our Lineage'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isLoginMode ? 'Please enter your details to sign in.' : 'Register to get exclusive access to new sarees.'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 dark:text-white">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
              <input 
                type="email" 
                id="email" 
                required 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A] transition-all" 
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Password</label>
              <input 
                type="password" 
                id="password" 
                required 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/10 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#183fad] dark:focus:ring-[#F1BF0A] transition-all" 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#183fad] hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded-full border border-[#183fad] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer mt-2 text-sm"
            >
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            <span>{isLoginMode ? "Don't have an account?" : "Already have an account?"}</span>
            <button 
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-[#183fad] dark:text-[#F1BF0A] hover:underline font-semibold ml-1 cursor-pointer bg-transparent border-0"
            >
              {isLoginMode ? 'Sign up free' : 'Sign in here'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
