'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CognitiveScienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) return;

      gsap.from(journeyRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        scrollTrigger: {
          trigger: journeyRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="science"
      ref={sectionRef}
      className="min-h-screen relative flex flex-col justify-between py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f4f5f7] dark:bg-[#0a0c10] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Header Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">007</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">THE 90-DAY MEMORY JOURNEY</span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          COGNITIVE CONSTELLATION
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl w-full mx-auto my-auto py-8 space-y-10">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            From cognitive friction <br />
            <span className="text-emerald-600 dark:text-emerald-400">to permanent reflex.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Track a single problem from Day 1 to Day 90, then zoom out into the complete memory matrix of all 150+ mastered interview patterns.
          </p>
        </div>

        {/* 90-Day Problem Tracking Journey */}
        <div ref={journeyRef} className="tech-card rounded-lg p-6 sm:p-8 shadow-2xl font-mono text-xs space-y-8 transition-transform">
          <div className="text-[11px] text-neutral-600 dark:text-neutral-400">{'// TRACKING: #011 CONTAINER WITH MOST WATER'}</div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { day: 'DAY 0', status: 'FIRST SOLVED', eff: 'Effort: High (12m)', state: 'Initial Code Ingested', color: 'text-neutral-900 dark:text-white' },
              { day: 'DAY 1', status: 'DRILL 1 (PASS)', eff: 'Effort: Medium (4m)', state: 'Rebuilt 2-pointer bounds', color: 'text-amber-600 dark:text-amber-400' },
              { day: 'DAY 6', status: 'DRILL 2 (GOOD)', eff: 'Effort: Low (90s)', state: 'Immediate pointer shift reflex', color: 'text-emerald-600 dark:text-emerald-400' },
              { day: 'DAY 16', status: 'DRILL 3 (INSTANT)', eff: 'Effort: None (30s)', state: 'Pattern permanently indexed', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
              { day: 'DAY 90', status: 'MASTERED', eff: 'Effort: Zero (15s)', state: 'Subconscious algorithmic reflex', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
            ].map((st) => (
              <div key={st.day} className="p-3.5 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">{st.day}</span>
                  <span className={st.color}>{st.status}</span>
                </div>
                <div className="text-neutral-700 dark:text-neutral-300 text-[11px] font-sans">{st.state}</div>
                <div className="text-neutral-500 text-[10px]">{st.eff}</div>
              </div>
            ))}
          </div>

          {/* Micro memory matrix preview */}
          <div className="border-t border-neutral-200 dark:border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-neutral-500 text-[11px]">
              <span>ZOOM-OUT: COMPLETE 150-PROBLEM MEMORY CONSTELLATION</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">96.8% RETENTION AVERAGE</span>
            </div>
            <div className="grid grid-cols-20 sm:grid-cols-30 gap-1 p-3 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 rounded-xs ${
                    i % 5 === 0 ? 'bg-emerald-500' : i % 3 === 0 ? 'bg-emerald-500/70' : 'bg-emerald-500/30'
                  }`}
                  title={`Pattern Node #${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom marker */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex justify-between">
        <span>007 / COGNITIVE CONSOLIDATION MATRIX</span>
        <span>SCROLL FOR 008 / SYSTEM SPECIFICATIONS &darr;</span>
      </div>
    </section>
  );
}
