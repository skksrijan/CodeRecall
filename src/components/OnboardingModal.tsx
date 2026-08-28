'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function OnboardingModal() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (user) {
      user.getIdToken().then(t => {
        setToken(t);
        checkOnboarding(t);
      });
    }
  }, [user]);

  const checkOnboarding = async (t: string) => {
    try {
      const res = await fetch('/api/user/settings', { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        if (data && !data.hasCompletedOnboarding) {
          setIsOpen(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ hasCompletedOnboarding: true })
      });
      setIsOpen(false);
      toast.success("You're all set!");
      router.push('/app/decks');
    } catch (e) {
      console.error(e);
      setIsOpen(false);
    }
  };

  if (!isOpen || loading) return null;

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200 font-mono">

        {/* Step Progress Bar */}
        <div className="flex h-1 w-full bg-background">
          <div className="bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <div className="p-7">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              [ORIENTATION • STEP 0{step} / 03]
            </span>
            <span className="text-[10px] text-muted-text uppercase">SM-2 Spaced Recall</span>
          </div>

          <div className="space-y-3 min-h-[140px] text-center">
            {step === 1 && (
              <div className="animate-in slide-in-from-right-4 duration-200">
                <h2 className="text-lg font-bold text-text font-sans">1. Curate Your Card Decks</h2>
                <p className="text-muted-text text-sm mt-2 leading-relaxed max-w-md mx-auto font-sans">
                  CodeRecall organizes algorithm patterns into dedicated <strong className="text-text font-mono">Practice Decks</strong> (such as <em>&quot;Blind 75&quot;</em>, <em>&quot;Two Pointers&quot;</em>, or <em>&quot;Meta Technical Prep&quot;</em>).
                </p>
              </div>
            )}
            {step === 2 && (
              <div className="animate-in slide-in-from-right-4 duration-200">
                <h2 className="text-lg font-bold text-text font-sans">2. 1-Click Problem Autofill</h2>
                <p className="text-muted-text text-sm mt-2 leading-relaxed max-w-md mx-auto font-sans">
                  Add target problems individually by entering their <strong className="text-text font-mono">LeetCode ID or URL</strong>, or batch import entire study plans with automatic description &amp; tag scraping.
                </p>
              </div>
            )}
            {step === 3 && (
              <div className="animate-in slide-in-from-right-4 duration-200">
                <h2 className="text-lg font-bold text-text font-sans">3. Calibrated SM-2 Spaced Recall</h2>
                <p className="text-muted-text text-xs mt-1 leading-relaxed max-w-md mx-auto font-sans">
                  During daily study, solve in the code scratchpad and self-grade your recall quality:
                </p>
                <div className="flex justify-center gap-1.5 mt-3">
                  {[
                    { score: 0, label: 'Blackout', color: 'text-danger bg-danger/10 border-danger/30' },
                    { score: 1, label: 'Failed', color: 'text-danger bg-danger/10 border-danger/30' },
                    { score: 2, label: 'Lapsed', color: 'text-warning bg-warning/10 border-warning/30' },
                    { score: 3, label: 'Hard', color: 'text-warning bg-warning/10 border-warning/30' },
                    { score: 4, label: 'Good', color: 'text-success bg-success/10 border-success/30' },
                    { score: 5, label: 'Perfect', color: 'text-success bg-success/10 border-success/30' },
                  ].map((g) => (
                    <div key={g.score} className="flex flex-col items-center">
                      <span className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center border ${g.color}`}>
                        {g.score}
                      </span>
                      <span className="text-[9px] text-muted-text mt-0.5">{g.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-text mt-2">
                  Quick keys: <kbd className="bg-background px-1 rounded border border-border">0</kbd>-<kbd className="bg-background px-1 rounded border border-border">5</kbd> • Reveal: <kbd className="bg-background px-1 rounded border border-border">Ctrl + &apos;</kbd>
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-border flex justify-end">
            <button
              onClick={nextStep}
              className="px-5 py-2.5 rounded-lg bg-text text-background font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
            >
              {step === 3 ? "Complete & Open Decks ->" : "Next Step ->"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
