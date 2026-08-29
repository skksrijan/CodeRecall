'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, Lock } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type StepKey = 'solve' | 'forget' | 'recall' | 'schedule';

export default function RecallLoopPinned() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<StepKey>('solve');
  const [timerDisplay, setTimerDisplay] = useState('00:00');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) return;

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=2400',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress;

          if (progress < 0.25) {
            setActiveStep('solve');
          } else if (progress < 0.50) {
            setActiveStep('forget');
          } else if (progress < 0.75) {
            setActiveStep('recall');
            const drillSecs = Math.min(21, Math.floor((progress - 0.50) * 84));
            setTimerDisplay(`00:${drillSecs < 10 ? '0' + drillSecs : drillSecs}`);
          } else {
            setActiveStep('schedule');
          }
        },
      });

      return () => {
        trigger.kill();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="loop"
      ref={sectionRef}
      className="min-h-screen relative flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#08090b] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Pinned Split Grid */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center my-auto py-8">
        {/* Left Column: Context & Stepper */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
            One problem. <br />
            Four cognitive <br />
            <span className="text-emerald-600 dark:text-emerald-400">stages.</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            The same central workbench continuously evolves as you scroll — demonstrating how CodeRecall turns fleeting solution memory into permanent algorithmic intuition.
          </p>

          {/* Stepper Progress Indicator */}
          <div className="space-y-3 font-mono text-xs pt-2">
            {[
              { id: 'solve', label: 'SOLVE', desc: 'First encounter & initial pattern implementation' },
              { id: 'forget', label: 'FORGET', desc: 'Synaptic decay begins over days of non-exposure' },
              { id: 'recall', label: 'RECALL', desc: 'Prompted test with hidden code & paced stopwatch' },
              { id: 'schedule', label: 'SCHEDULE', desc: 'SM-2 computes personalized exponential interval' },
            ].map((st) => {
              const isCurrent = activeStep === st.id;
              return (
                <div
                  key={st.id}
                  className={`p-3 rounded-sm border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-neutral-900 text-white dark:bg-white/10 border-neutral-900 dark:border-emerald-500/50 dark:text-white shadow-sm'
                      : 'bg-white dark:bg-transparent border-neutral-200 dark:border-white/5 text-neutral-500'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span className={isCurrent ? 'text-emerald-400' : 'text-neutral-500'}>{st.label}</span>
                    {isCurrent && <span className="text-emerald-400 text-[10px]">ACTIVE STATE</span>}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">{st.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Transforming Central UI */}
        <div className="lg:col-span-7">
          <div className="tech-card rounded-lg p-6 sm:p-7 shadow-2xl space-y-6 relative transition-all duration-500 min-h-[440px] flex flex-col justify-between">
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-neutral-900 dark:text-white tracking-wider">CODERECALL / WORKBENCH</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-neutral-500 text-[11px]">LC #11 // TWO POINTERS</span>
                <span className="px-2 py-0.5 rounded-sm bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold">
                  MEDIUM
                </span>
              </div>
            </div>

            {/* Transforming Body */}
            <div className="space-y-4 my-auto">
              {/* STATE 01: SOLVE */}
              {activeStep === 'solve' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Container With Most Water</h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-mono">Status: Initial solve verified (100% correct)</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                      INITIALIZED
                    </span>
                  </div>
                  <div className="p-4 rounded bg-neutral-100 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 font-mono text-xs text-neutral-800 dark:text-neutral-300 space-y-1">
                    <div className="text-neutral-500">{'// Canonical Two-Pointer Ingestion'}</div>
                    <div><span className="text-sky-600 dark:text-sky-400">function</span> <span className="text-emerald-600 dark:text-emerald-400">maxArea</span>(height: <span className="text-sky-600 dark:text-sky-300">number[]</span>): <span className="text-sky-600 dark:text-sky-300">number</span> &#123;</div>
                    <div className="pl-4">let l = 0, r = height.length - 1, max = 0;</div>
                    <div className="pl-4">while (l &lt; r) &#123; ... &#125;</div>
                    <div>&#125;</div>
                  </div>
                </div>
              )}

              {/* STATE 02: FORGET */}
              {activeStep === 'forget' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300">Container With Most Water</h3>
                      <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-mono">Status: Memory decaying without reinforcement...</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 text-xs font-mono font-bold">
                      DECAYING
                    </span>
                  </div>
                  <div className="p-4 rounded bg-neutral-100 dark:bg-[#07080a] border border-rose-500/30 font-mono text-xs text-neutral-500 blur-[2px] opacity-60 space-y-1">
                    <div>{'// Memory hazy: Is the pointer moving on height[l] < height[r]?'}</div>
                    <div>while (l &lt; r) &#123;</div>
                    <div className="pl-4">const area = ???</div>
                    <div>&#125;</div>
                  </div>
                  <div className="text-xs font-mono text-rose-600 dark:text-rose-400/90 text-center border border-rose-500/20 p-2 rounded bg-rose-500/5">
                    Inflection point reached: Spaced review scheduled today
                  </div>
                </div>
              )}

              {/* STATE 03: RECALL */}
              {activeStep === 'recall' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/30 p-3 rounded">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold">
                      <Clock className="w-4 h-4" />
                      <span>DRILL TIMER: {timerDisplay}</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400/80">THRESHOLD: 15:00</span>
                  </div>

                  <div className="p-6 rounded bg-neutral-100 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 text-center space-y-3">
                    <Lock className="w-6 h-6 text-neutral-400 dark:text-neutral-500 mx-auto" />
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">Solution Locked to Test Recall</div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto font-mono">
                      Reconstruct the two-pointer convergence pattern in your mind or scratchpad before checking.
                    </p>
                  </div>
                </div>
              )}

              {/* STATE 04: SCHEDULE */}
              {activeStep === 'schedule' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="font-mono text-xs space-y-2">
                    <div className="text-neutral-600 dark:text-neutral-400 text-[11px] uppercase">
                      RATE RECALL FIDELITY (SM-2 QUALITY):
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 text-center">
                      {[0, 1, 2, 3, 4, 5].map((val) => (
                        <div
                          key={val}
                          className={`p-2 rounded border font-bold text-xs transition-all ${
                            val === 4
                              ? 'bg-emerald-500 text-neutral-950 border-emerald-400 scale-105 shadow-md'
                              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-400'
                          }`}
                        >
                          <div>{val}</div>
                          <div className="text-[8px] font-normal">{val === 4 ? 'GOOD' : val === 5 ? 'EASY' : val === 0 ? 'FAIL' : 'PASS'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scheduled Result */}
                  <div className="p-4 rounded bg-emerald-500/10 border border-emerald-500/30 space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                      <span>NEXT REVIEW INTERVAL:</span>
                      <strong className="text-neutral-900 dark:text-white text-sm font-bold">+6 DAYS</strong>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400 text-[11px]">
                      <span>EASE FACTOR RECALIBRATED:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">2.50 (Consolidating)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="flex items-center justify-between border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500">
              <span>ALGORITHM: SUPERMEMO SM-2</span>
              <span>COGNITIVE ENGINE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
