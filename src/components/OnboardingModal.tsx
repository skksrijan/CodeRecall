'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FolderPlus, FileCode2, BrainCircuit, ArrowRight, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Progress Bar */}
        <div className="flex h-1.5 w-full bg-background">
          <div className="bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <div className="p-8 pb-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner">
              {step === 1 && <FolderPlus className="w-10 h-10 animate-in zoom-in" />}
              {step === 2 && <FileCode2 className="w-10 h-10 animate-in zoom-in" />}
              {step === 3 && <BrainCircuit className="w-10 h-10 animate-in zoom-in" />}
            </div>
          </div>

          <div className="text-center space-y-3 min-h-[120px]">
            {step === 1 && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-text">Welcome to CodeRecall!</h2>
                <p className="text-muted-text mt-2 leading-relaxed">
                  The smartest way to master LeetCode problems through spaced repetition. 
                  Let&apos;s start by organizing your knowledge. Create a <strong className="text-text">Deck</strong> to group related problems together (e.g. "Blind 75" or "Graphs").
                </p>
              </div>
            )}
            {step === 2 && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-text">Add your Problems</h2>
                <p className="text-muted-text mt-2 leading-relaxed">
                  Inside your deck, you can add problems you want to practice. 
                  Just type the <strong className="text-primary">LeetCode URL</strong> and click "Autofill" — we&apos;ll automatically pull the title, difficulty, and topic tags for you!
                </p>
              </div>
            )}
            {step === 3 && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-text">Review & Grade</h2>
                <p className="text-muted-text mt-2 leading-relaxed text-sm">
                  When you study, you&apos;ll grade how well you remembered the solution using the SM-2 algorithm:
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  {[0, 1, 2, 3, 4, 5].map((g) => (
                    <div key={g} className="flex flex-col items-center">
                      <span className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold shadow-sm ${
                        g < 3 ? 'bg-danger/10 text-danger border border-danger/20' : 
                        g < 4 ? 'bg-warning/10 text-warning border border-warning/20' : 
                        'bg-success/10 text-success border border-success/20'
                      }`}>{g}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-text mt-2">
                  0 = Total Blackout, 5 = Perfect Recall. <br /> Use keys <kbd className="bg-background px-1 rounded font-mono">0</kbd>-<kbd className="bg-background px-1 rounded font-mono">5</kbd> for quick grading!
                </p>
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={nextStep}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center gap-2 w-full justify-center"
            >
              {step < 3 ? (
                <>Continue <ArrowRight className="w-5 h-5" /></>
              ) : (
                <>Get Started <Check className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
