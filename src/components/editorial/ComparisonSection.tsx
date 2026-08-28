'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { XCircle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ComparisonSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [problemCount, setProblemCount] = useState(1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'bottom 20%',
        onUpdate: (self) => {
          const count = Math.round(1 + self.progress * 348);
          setProblemCount(count);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="comparison"
      ref={sectionRef}
      className="min-h-screen relative flex flex-col justify-between py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#08090b] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Header Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">004</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">METHODOLOGY COMPARISON</span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          BRUTE FORCE VS SPACED RETENTION
        </div>
      </div>

      {/* Split Comparison Grid */}
      <div className="max-w-7xl w-full mx-auto my-auto py-8 space-y-10">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Quantity vs. <br />
            <span className="text-emerald-600 dark:text-emerald-400">Retention.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Solving 300+ problems once creates the illusion of preparation. CodeRecall ensures you actually remember the patterns when you sit down for the interview.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-mono">
          {/* Left Side: Brute Force Grind */}
          <div className="tech-card rounded-lg p-6 sm:p-8 space-y-6 border-rose-500/30 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3 text-xs">
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                CONVENTIONAL GRIND
              </span>
              <span className="text-neutral-500 text-[11px]">SOLVE & FORGET</span>
            </div>

            {/* Simulated problem stream */}
            <div className="p-4 rounded bg-neutral-100 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 text-xs space-y-1.5 max-h-48 overflow-hidden relative">
              <div className="text-neutral-500 text-[11px]">{'// Continuous Blind Grind'}</div>
              <div className="text-neutral-600 dark:text-neutral-400">Solve #001 Two Sum &rarr; Solved</div>
              <div className="text-neutral-600 dark:text-neutral-400">Solve #042 Trapping Rain Water &rarr; Solved</div>
              <div className="text-neutral-600 dark:text-neutral-400">Solve #146 LRU Cache &rarr; Solved</div>
              <div className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                Solve #{problemCount < 10 ? '00' + problemCount : problemCount < 100 ? '0' + problemCount : problemCount} Problem &rarr; Solved
              </div>
              <div className="text-neutral-500 text-[10px] italic pt-1">
                ... 80% of earlier solutions forgotten after 3 weeks
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 text-xs border-t border-neutral-200 dark:border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">PROBLEMS SOLVED:</span>
                <strong className="text-rose-600 dark:text-rose-400 text-lg font-bold">{problemCount}</strong>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-600 dark:text-neutral-400">RETENTION AT 30 DAYS:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">18% (Severe Decay)</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-900 rounded overflow-hidden border border-neutral-300 dark:border-white/10">
                  <div className="h-full bg-rose-500 w-[18%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: CodeRecall SM-2 System */}
          <div className="tech-card rounded-lg p-6 sm:p-8 space-y-6 border-emerald-500/30 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3 text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CODERECALL SM-2
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">SPACED ACTIVE RECALL</span>
            </div>

            {/* Targeted daily queue */}
            <div className="p-4 rounded bg-neutral-100 dark:bg-[#07080a] border border-emerald-500/20 text-xs space-y-2">
              <div className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                {"// TODAY'S TARGETED RECALL QUEUE (15m):"}
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-[11px]">
                <span className="text-neutral-900 dark:text-white font-bold">#011 Container With Most Water</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Review 3 (+16d)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-[11px]">
                <span className="text-neutral-900 dark:text-white font-bold">#042 Trapping Rain Water</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Review 2 (+6d)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-[11px]">
                <span className="text-neutral-900 dark:text-white font-bold">#146 LRU Cache</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Review 1 (+1d)</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 text-xs border-t border-neutral-200 dark:border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">TOTAL REVIEWS DUE TODAY:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-lg font-bold">3 Problems (15 Mins)</strong>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-600 dark:text-neutral-400">RETENTION AT 30 DAYS:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">96% (Permanent Pattern Recall)</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-900 rounded overflow-hidden border border-neutral-300 dark:border-white/10">
                  <div className="h-full bg-emerald-500 w-[96%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom marker */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex justify-between">
        <span>004 / 349 PROBLEMS VS 3 TARGETED REVIEWS</span>
        <span>SCROLL FOR 005 / PATTERN MEMORY STREAM &darr;</span>
      </div>
    </section>
  );
}
