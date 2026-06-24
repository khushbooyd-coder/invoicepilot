'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();

  // If already logged in, go straight to dashboard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) router.push('/dashboard');
    });
    return () => unsub();
  }, [router]);

  async function handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-[#1a1f2e] border border-gray-800 rounded-2xl p-10 w-full max-w-sm text-center">

        <h1 className="text-3xl font-bold text-white mb-1">DOTSOL</h1>
        <p className="text-gray-400 text-sm mb-8">ONE Platform</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.9 29.3 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 15.5l6.6 4.8C14.5 16.9 19 14 24 14c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 8.9 29.3 7 24 7 16.3 7 9.6 10.3 6.3 15.5z"/>
            <path fill="#4CAF50" d="M24 43c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 34.5 26.8 35 24 35c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.5 39.5 16.3 43 24 43z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C41 35.2 45 30 45 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="text-gray-600 text-xs mt-6">
          Only authorised Dot Solutions accounts can sign in.
        </p>
      </div>
    </div>
  );
}