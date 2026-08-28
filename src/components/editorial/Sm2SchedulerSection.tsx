'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Sm2SchedulerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bar1Ref = useRef<HTMLDivElement>(null);
  const bar2Ref = useRef<HTMLDivElement>(null);
  const bar3Ref = useRef<HTMLDivElement>(null);
  const bar4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'bottom 50%',
          scrub: 0.5,
        },
      });

      tl.fromTo(bar1Ref.current, { width: '10%' }, { width: '100%', duration: 1 })
        .fromTo(bar2Ref.current, { width: '10%' }, { width: '100%', duration: 1 }, '+=0.2')
        .fromTo(bar3Ref.current, { width: '10%' }, { width: '100%', duration: 1 }, '+=0.2')
        .fromTo(bar4Ref.current, { width: '10%' }, { width: '100%', duration: 1 }, '+=0.2');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="scheduler"
      ref={sectionRef}
      className="min-h-screen relative flex flex-col justify-between py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f4f5f7] dark:bg-[#0a0c10] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Header Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">003</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">THE SCHEDULER</span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          EXPONENTIAL INTERVAL EXPANSION
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl w-full mx-auto my-auto py-8 space-y-10">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
            The next review <br />
            <span className="text-emerald-600 dark:text-emerald-400">isn&apos;t random.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Physical distance on this timeline represents real cognitive retention. Each successful recall compounds the interval by your personalized Ease Factor.
          </p>
        </div>

        {/* Giant Spatially Expanding Timeline */}
        <div className="tech-card rounded-lg p-6 sm:p-8 space-y-8 shadow-2xl overflow-hidden font-mono text-xs">
          {/* Stage 1: Day 1 -> Day 6 */}
          <div className="space-y-2">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400 text-[11px]">
              <span className="text-neutral-900 dark:text-white font-bold">FIRST RECALL &rarr; DAY 1</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+5 DAYS (EF = 2.50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-900 dark:bg-white shrink-0" />
              <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full w-48 overflow-hidden">
                <div ref={bar1Ref} className="h-full bg-emerald-500 w-full" />
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-neutral-900 dark:text-white font-bold ml-2">DAY 6</span>
            </div>
          </div>

          {/* Stage 2: Day 6 -> Day 16 */}
          <div className="space-y-2">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400 text-[11px]">
              <span className="text-neutral-900 dark:text-white font-bold">SECOND RECALL &rarr; DAY 6</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+10 DAYS (EF = 2.50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-900 dark:bg-white shrink-0" />
              <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full w-72 overflow-hidden">
                <div ref={bar2Ref} className="h-full bg-emerald-500 w-full" />
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-neutral-900 dark:text-white font-bold ml-2">DAY 16</span>
            </div>
          </div>

          {/* Stage 3: Day 16 -> Day 40 */}
          <div className="space-y-2">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400 text-[11px]">
              <span className="text-neutral-900 dark:text-white font-bold">THIRD RECALL &rarr; DAY 16</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+24 DAYS (EF = 2.50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-900 dark:bg-white shrink-0" />
              <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full w-96 overflow-hidden">
                <div ref={bar3Ref} className="h-full bg-emerald-500 w-full" />
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-neutral-900 dark:text-white font-bold ml-2">DAY 40</span>
            </div>
          </div>

          {/* Stage 4: Day 40 -> Day 90 */}
          <div className="space-y-2">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400 text-[11px]">
              <span className="text-neutral-900 dark:text-white font-bold">CONSOLIDATED MEMORY &rarr; DAY 40</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+50 DAYS &rarr; PERMANENT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-900 dark:bg-white shrink-0" />
              <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full w-full max-w-lg overflow-hidden">
                <div ref={bar4Ref} className="h-full bg-emerald-500 w-full" />
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-neutral-900 dark:text-white font-bold ml-2">DAY 90 (MASTERED)</span>
            </div>
          </div>

          {/* Formula Callout */}
          <div className="p-4 rounded bg-neutral-100 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-neutral-900 dark:text-white font-bold">1d &rarr; 6d &rarr; 16d &rarr; 40d &rarr; 90d</div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">Total review time over 3 months: ~18 minutes</div>
              </div>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              SUPERMEMO SM-2 FORMULA &bull; EF 2.50
            </div>
          </div>
        </div>
      </div>

      {/* Bottom marker */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex justify-between">
        <span>003 / EXPONENTIAL SPAN EXPANSION</span>
        <span>SCROLL FOR 004 / METHODOLOGY COMPARISON &darr;</span>
      </div>
    </section>
  );
}
