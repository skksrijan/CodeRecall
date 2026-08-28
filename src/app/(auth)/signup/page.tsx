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
    <div className="min-h-screen flex items-center justify-center relative bg-background px-4 font-mono">
      <div className="bg-surface border border-border p-8 sm:p-10 rounded-xl shadow-xl max-w-md w-full my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs uppercase font-bold tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              CodeRecall • SM-2
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight font-sans">
            Create Engineering Account
          </h1>
          <p className="text-muted-text text-xs mt-1 font-sans">
            Start retaining coding patterns with spaced repetition
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-lg mb-6 text-xs border border-danger/30">
            <span>[ERROR] {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary transition-colors font-medium placeholder:text-muted-text/50 font-sans"
              value={name}
              placeholder="Jane Doe"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary transition-colors font-medium placeholder:text-muted-text/50 font-sans"
              value={email}
              placeholder="engineer@company.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary transition-colors placeholder:text-muted-text/50 font-sans"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-text text-background py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-wider mt-4 shadow-sm"
          >
            {isSubmitting ? '[ CREATING ACCOUNT... ]' : 'Create Account ->'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="border-b w-[42%] border-border"></span>
          <span className="text-[10px] text-muted-text uppercase">OR</span>
          <span className="border-b w-[42%] border-border"></span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-5 bg-background border border-border py-2.5 rounded-lg font-semibold text-xs text-text hover:bg-surface transition-colors uppercase tracking-wider shadow-sm"
        >
          [ Continue with Google ]
        </button>

        <p className="mt-6 text-center text-xs text-muted-text font-medium font-sans">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold font-mono">Sign in -&gt;</Link>
        </p>
      </div>
    </div>
  );
}
