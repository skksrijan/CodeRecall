'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertCircle, CheckCircle, RefreshCw, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const retentionBarRef = useRef<HTMLDivElement>(null);
  const retentionTextRef = useRef<HTMLSpanElement>(null);
  const alertBadgeRef = useRef<HTMLDivElement>(null);
  const [decayState, setDecayState] = useState<'fresh' | 'decaying' | 'recalled'>('fresh');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Stage 1: Card gradually blurs and retention drops
      tl.to(codeBlockRef.current, {
        filter: 'blur(4px)',
        opacity: 0.35,
        duration: 1,
        onUpdate: function () {
          const p = this.progress();
          const ret = Math.round(100 - p * 82);
          if (retentionTextRef.current) {
            retentionTextRef.current.textContent = `${ret}%`;
          }
          if (retentionBarRef.current) {
            retentionBarRef.current.style.width = `${ret}%`;
          }
          if (p > 0.4 && p < 0.85) {
            setDecayState('decaying');
          }
        },
      })
      // Stage 2: Trigger RECALL REQUIRED event and snap back
      .to(alertBadgeRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        onStart: () => setDecayState('recalled'),
      })
      .to(codeBlockRef.current, {
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: function () {
          const p = this.progress();
          const ret = Math.round(18 + p * 78);
          if (retentionTextRef.current) {
            retentionTextRef.current.textContent = `${ret}%`;
          }
          if (retentionBarRef.current) {
            retentionBarRef.current.style.width = `${ret}%`;
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="min-h-screen relative flex flex-col justify-between py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f4f5f7] dark:bg-[#0a0c10] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Section Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">001</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">THE PROBLEM</span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          MEMORY DECAY SIMULATION
        </div>
      </div>

      {/* Main Split Content */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center my-auto py-8">
        {/* Left Column: Big Editorial Headline */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.06] text-neutral-900 dark:text-white">
            You solved it. <br />
            <span className="text-rose-500 dark:text-rose-400">Your brain</span> <br />
            didn&apos;t keep it.
          </h2>

          <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed font-normal">
            Most DSA practice optimizes for solving more problems. <br />
            <strong className="text-neutral-900 dark:text-white font-medium">CodeRecall optimizes for remembering the patterns you&apos;ve already learned.</strong>
          </p>

          <div className="p-4 rounded-sm bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-white/10 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-neutral-500 text-[10px] uppercase">COGNITIVE OBSERVATION:</div>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Without spaced recall, an engineer solves 300+ problems but retains fewer than 20% on interview day. Solving 10 new problems yields less retention than reinforcing 3 due patterns.
            </p>
          </div>
        </div>

        {/* Right Column: Decaying Problem Card */}
        <div className="lg:col-span-6" ref={cardRef}>
          <div className="tech-card rounded-lg p-6 space-y-5 shadow-2xl relative overflow-hidden transition-all duration-300">
            {/* Top Card Meta */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                  MEDIUM
                </span>
                <span className="text-neutral-900 dark:text-neutral-300 font-bold">PROBLEM #011</span>
              </div>
              <span className="text-neutral-500 text-[11px]">PATTERN: TWO POINTERS</span>
            </div>

            {/* Problem Title & Last Solved */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Container With Most Water</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono mt-0.5">
                  Last solved: <span className="text-rose-500 dark:text-rose-400 font-bold">17 DAYS AGO</span>
                </p>
              </div>

              {/* Status Badge */}
              <div ref={alertBadgeRef} style={{ opacity: 0 }} className="font-mono text-xs">
                <span className="px-2.5 py-1 rounded-sm bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5" />
                  RECALL REQUIRED
                </span>
              </div>
            </div>

            {/* Code Block that blurs/fades on scroll */}
            <div
              ref={codeBlockRef}
              className="p-4 rounded bg-neutral-100 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 font-mono text-xs text-neutral-800 dark:text-neutral-300 space-y-1 overflow-x-auto transition-all"
            >
              <div className="text-neutral-500">{'// Canonical Two-Pointers Convergence'}</div>
              <div><span className="text-sky-600 dark:text-sky-400">while</span> (left &lt; right) &#123;</div>
              <div className="pl-4">
                <span className="text-neutral-600 dark:text-neutral-400">const</span> area = Math.min(height[left], height[right]) * (right - left);
              </div>
              <div className="pl-4">
                maxArea = Math.max(maxArea, area);
              </div>
              <div className="pl-4">
                height[left] &lt; height[right] ? left++ : right--;
              </div>
              <div>&#125;</div>
            </div>

            {/* Dynamic Retention Meter */}
            <div className="space-y-2 font-mono text-xs border-t border-neutral-200 dark:border-white/10 pt-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">RETENTION INTEGRITY</span>
                <span ref={retentionTextRef} className="text-emerald-600 dark:text-emerald-400 font-bold">
                  100%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-900 rounded-sm overflow-hidden border border-neutral-300 dark:border-white/10">
                <div
                  ref={retentionBarRef}
                  className="h-full bg-emerald-500 transition-all duration-100"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="text-[10px] text-neutral-500 flex justify-between">
                <span>Inflection threshold: 20%</span>
                <span>Algorithm: SM-2 Spaced Matrix</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status note */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex items-center justify-between">
        <span>001 / PREDICTABLE NEURAL DECAY</span>
        <span>SCROLL FOR 002 / THE RECALL LOOP &darr;</span>
      </div>
    </section>
  );
}
