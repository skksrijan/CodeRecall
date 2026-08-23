'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp(email, password, name);
    } catch {
      setError('Failed to create an account. It may already exist.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      setError('Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] mix-blend-normal pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-normal pointer-events-none" />

      <div className="relative z-10 bg-surface/60 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary mb-2">
            Join CodeRecall
          </h2>
          <p className="text-muted-text text-sm">Create an account to start mastering algorithms</p>
        </div>
        
        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-lg mb-6 text-sm font-medium border border-danger/20 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-text">Name (optional)</label>
            <input
              type="text"
              className="w-full p-2.5 rounded-lg bg-background/50 border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={name}
              placeholder="Jane Doe"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-text">Email</label>
            <input
              type="email"
              required
              className="w-full p-2.5 rounded-lg bg-background/50 border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-text">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full p-2.5 rounded-lg bg-background/50 border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none mt-4"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="border-b w-[45%] border-border"></span>
          <span className="text-xs text-muted-text font-medium uppercase">or</span>
          <span className="border-b w-[45%] border-border"></span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-6 bg-surface border border-border py-2.5 rounded-lg font-medium text-text hover:bg-background transition-colors flex justify-center items-center gap-3 shadow-sm hover:shadow"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-muted-text font-medium">
          Already have an account? <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
