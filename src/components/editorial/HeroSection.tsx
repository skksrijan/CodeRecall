'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '@/context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);
  const recallMarkerRef = useRef<SVGGElement>(null);
  const recallMarker2Ref = useRef<SVGGElement>(null);
  const retentionValRef = useRef<SVGTextElement>(null);
  const statusLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const path = pathRef.current;
      if (!path) return;

      const pathLength = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=120%',
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 1. Draw initial forgetting curve & move marker
      tl.to(path, {
        strokeDashoffset: pathLength * 0.55,
        ease: 'none',
        duration: 1,
      })
      .to(
        markerRef.current,
        {
          motionPath: undefined,
          attr: { cx: 280, cy: 190 },
          ease: 'none',
          duration: 1,
          onUpdate: function () {
            const progress = this.progress();
            const retention = Math.round(100 - progress * 55);
            if (retentionValRef.current) {
              retentionValRef.current.textContent = `${retention}%`;
            }
            if (statusLabelRef.current) {
              if (progress > 0.7) {
                statusLabelRef.current.textContent = 'STATUS: DECAY DETECTED';
                statusLabelRef.current.className = 'text-rose-400 font-mono';
              } else {
                statusLabelRef.current.textContent = 'STATUS: MEMORY MONITORING';
                statusLabelRef.current.className = 'text-neutral-400 font-mono';
              }
            }
          },
        },
        '<'
      )
      // 2. Trigger Recall Spike 1
      .to(recallMarkerRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        onStart: () => {
          if (statusLabelRef.current) {
            statusLabelRef.current.textContent = 'EVENT: RECALL TRIGGERED (+6d EXPANSION)';
            statusLabelRef.current.className = 'text-emerald-400 font-mono font-bold';
          }
        },
      })
      .to(
        markerRef.current,
        {
          attr: { cx: 280, cy: 50 },
          duration: 0.4,
          ease: 'power2.out',
        },
        '<'
      )
      // 3. Draw second reinforced flatter decay
      .to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        duration: 1.2,
      })
      .to(
        markerRef.current,
        {
          attr: { cx: 680, cy: 95 },
          ease: 'none',
          duration: 1.2,
          onUpdate: function () {
            const progress = this.progress();
            const retention = Math.round(98 - progress * 18);
            if (retentionValRef.current) {
              retentionValRef.current.textContent = `${retention}%`;
            }
          },
        },
        '<'
      )
      // 4. Reveal second recall marker
      .to(recallMarker2Ref.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen relative flex flex-col justify-between pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#08090b] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Metadata Header */}
      <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-neutral-900 dark:text-white font-bold tracking-wider">SM-2 ACTIVE RECALL ENGINE</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-500 dark:text-neutral-400">SYS.VER.2.4</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span ref={statusLabelRef} className="text-neutral-600 dark:text-neutral-400">STATUS: INITIALIZING GRAPH</span>
          <span className="text-neutral-300 dark:text-neutral-600 hidden sm:inline">|</span>
          <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline">PHILOSOPHY: &ldquo;Solve to learn. Recall to retain.&rdquo;</span>
        </div>
      </div>

      {/* Hero Core Content */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center my-auto py-8">
        {/* Left Column: Editorial Headline & Copy */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 tracking-widest uppercase font-bold">
              [ 000 // CORE DIRECTIVE ]
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.04] text-neutral-900 dark:text-white">
              The Forgetting Curve <br />
              <span className="text-neutral-500 dark:text-neutral-400">Is Predictable.</span> <br />
              Your Retention <br />
              <span className="text-emerald-600 dark:text-emerald-400">Should Be Too.</span>
            </h1>
          </div>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed font-normal">
            CodeRecall turns solved DSA problems into a spaced-repetition system that brings the right patterns back before neural decay sets in.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
            <Link
              href={user ? '/app/dashboard' : '/signup'}
              className="px-6 py-3 rounded-sm bg-neutral-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-md flex items-center gap-2 group"
            >
              <span>{user ? 'Open Workbench' : 'Start Recall'}</span>
              <span className="text-emerald-400 dark:text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>

            <a
              href="#problem"
              className="px-5 py-3 rounded-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/30 transition-colors uppercase tracking-wider shadow-xs"
            >
              See How It Works &darr;
            </a>
          </div>

          {/* Micro stats strip */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200 dark:border-white/10 font-mono text-xs">
            <div>
              <div className="text-neutral-500 text-[10px] uppercase">Retention</div>
              <div className="text-neutral-900 dark:text-white font-bold text-sm">96.4% @ 30d</div>
            </div>
            <div>
              <div className="text-neutral-500 text-[10px] uppercase">Daily Target</div>
              <div className="text-neutral-900 dark:text-white font-bold text-sm">15 Mins / Day</div>
            </div>
            <div>
              <div className="text-neutral-500 text-[10px] uppercase">Intake System</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">1-Click Sync</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Scroll-Drawn Scientific Curve */}
        <div className="lg:col-span-6 tech-card rounded-lg p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">[FIG.001]</span>
              <span>NEURAL RETENTION DYNAMICS</span>
            </div>
            <div className="text-[11px] text-neutral-500">SCROLL TO ADVANCE &darr;</div>
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full h-64 sm:h-72">
            <svg
              className="w-full h-full"
              viewBox="0 0 720 260"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Reference Grid */}
              <line x1="40" y1="40" x2="700" y2="40" stroke="currentColor" className="text-neutral-200 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="700" y2="100" stroke="currentColor" className="text-neutral-200 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="40" y1="160" x2="700" y2="160" stroke="currentColor" className="text-neutral-200 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="40" y1="220" x2="700" y2="220" stroke="currentColor" className="text-neutral-300 dark:text-white/15" />
              <line x1="40" y1="30" x2="40" y2="220" stroke="currentColor" className="text-neutral-300 dark:text-white/15" />

              {/* Y Axis */}
              <text x="10" y="44" className="fill-neutral-600 dark:fill-neutral-400 text-[10px] font-mono font-medium">100%</text>
              <text x="15" y="104" className="fill-neutral-600 dark:fill-neutral-400 text-[10px] font-mono font-medium">75%</text>
              <text x="15" y="164" className="fill-neutral-600 dark:fill-neutral-400 text-[10px] font-mono font-medium">50%</text>
              <text x="15" y="224" className="fill-neutral-600 dark:fill-neutral-400 text-[10px] font-mono font-medium">0%</text>

              {/* X Axis */}
              <text x="40" y="242" className="fill-neutral-600 dark:fill-neutral-400 text-[10px] font-mono font-medium">DAY 0</text>
              <text x="270" y="242" className="fill-neutral-600 dark:fill-neutral-400 text-[10px] font-mono font-medium">DAY 1</text>
              <text x="480" y="242" className="fill-neutral-600 dark:fill-neutral-400 text-[10px] font-mono font-medium">DAY 6</text>
              <text x="660" y="242" className="fill-neutral-600 dark:fill-neutral-400 text-[10px] font-mono font-medium">DAY 16</text>

              {/* Theoretical decay without review (red dashed) */}
              <path
                d="M 40 50 Q 160 170, 280 190 T 700 215"
                stroke="rgba(239, 68, 68, 0.6)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
              />
              <text x="560" y="210" className="fill-rose-600 dark:fill-rose-500 text-[9px] font-mono font-bold">UNREVIEWED DECAY &rarr; 18%</text>

              {/* Main SVG Scroll-Drawn Curve (SM-2 Spaced Reinforcement) */}
              <path
                ref={pathRef}
                d="M 40 50 Q 160 160, 280 190 L 280 50 Q 420 85, 480 110 L 480 48 Q 580 70, 680 95"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Recall Event 1 */}
              <g ref={recallMarkerRef} style={{ opacity: 0 }} className="transition-opacity">
                <line x1="280" y1="190" x2="280" y2="50" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="280" cy="50" r="4" className="fill-emerald-600 dark:fill-emerald-500" />
                <rect x="235" y="22" width="90" height="18" rx="2" className="fill-white dark:fill-[#08090b] stroke-emerald-600 dark:stroke-emerald-500 stroke-1" />
                <text x="242" y="34" className="fill-emerald-700 dark:fill-emerald-400 text-[9px] font-mono font-bold">RECALL EVENT 1</text>
              </g>

              {/* Recall Event 2 */}
              <g ref={recallMarker2Ref} style={{ opacity: 0 }} className="transition-opacity">
                <line x1="480" y1="110" x2="480" y2="48" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="480" cy="48" r="4" className="fill-emerald-600 dark:fill-emerald-500" />
                <rect x="435" y="20" width="90" height="18" rx="2" className="fill-white dark:fill-[#08090b] stroke-emerald-600 dark:stroke-emerald-500 stroke-1" />
                <text x="442" y="32" className="fill-emerald-700 dark:fill-emerald-400 text-[9px] font-mono font-bold">RECALL EVENT 2</text>
              </g>

              {/* Animated Progress Marker */}
              <circle ref={markerRef} cx="40" cy="50" r="5" className="fill-emerald-500 stroke-neutral-900 dark:stroke-white stroke-2 shadow-sm" />

              {/* Live dynamic retention indicator text */}
              <text ref={retentionValRef} x="640" y="45" className="fill-emerald-700 dark:fill-emerald-400 font-mono text-sm font-bold">
                100%
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-white/10 pt-3">
            <span>Interval Multiplier: <strong className="text-neutral-900 dark:text-white">EF = 2.50</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Formula: I(n) = I(n-1) × EF</span>
          </div>
        </div>
      </div>

      {/* Bottom Loop Indicators */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="text-neutral-500">THE RECALL CYCLE:</span>
          <span className="text-neutral-900 dark:text-white font-bold">SOLVE</span>
          <span>&rarr;</span>
          <span className="text-rose-500 dark:text-rose-400">FORGET</span>
          <span>&rarr;</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">RECALL</span>
          <span>&rarr;</span>
          <span className="text-neutral-900 dark:text-white">RATE</span>
          <span>&rarr;</span>
          <span className="text-indigo-600 dark:text-indigo-300">SCHEDULE</span>
          <span>&rarr;</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">RETAIN</span>
        </div>
        <div className="text-neutral-500">
          [SCROLL DOWN TO INITIALIZE PRODUCT SEQUENCE &darr;]
        </div>
      </div>
    </section>
  );
}
