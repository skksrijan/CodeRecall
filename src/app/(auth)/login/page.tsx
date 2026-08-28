'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Login() {
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    if (isForgotPassword) {
      try {
        await resetPassword(email);
        setMessage('Password reset email sent! Check your inbox.');
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          setError('No user found with this email.');
        } else {
          setError('Failed to send reset email. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        await signIn(email, password);
      } catch {
        setError('Failed to sign in. Please check your credentials.');
        setIsSubmitting(false);
      }
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
            {isForgotPassword ? 'Reset Password' : 'Sign in to Workbench'}
          </h1>
          <p className="text-muted-text text-xs mt-1 font-sans">
            {isForgotPassword ? 'Enter your registered email to receive a password reset link' : 'Access your daily review queue and practice decks'}
          </p>
        </div>
        
        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-lg mb-6 text-xs border border-danger/30">
            <span>[ERROR] {error}</span>
          </div>
        )}

        {message && (
          <div className="bg-success/10 text-success p-3 rounded-lg mb-6 text-xs border border-success/30">
            <span>[✓] {message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(true); setError(''); setMessage(''); }}
                  className="text-xs text-primary hover:underline font-medium uppercase text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary transition-colors placeholder:text-muted-text/50 font-sans"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-text text-background py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-wider mt-2 shadow-sm"
          >
            {isSubmitting 
              ? (isForgotPassword ? '[ SENDING LINK... ]' : '[ AUTHENTICATING... ]') 
              : (isForgotPassword ? 'Send Reset Link ->' : 'Sign In ->')}
          </button>
        </form>

        {isForgotPassword ? (
          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => { setIsForgotPassword(false); setError(''); setMessage(''); }}
              className="text-xs text-muted-text hover:text-text transition-colors uppercase"
            >
              &lt;- Back to login
            </button>
          </div>
        ) : (
          <>
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
              Don&apos;t have an account? <Link href="/signup" className="text-primary hover:underline font-semibold font-mono">Create one -&gt;</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
