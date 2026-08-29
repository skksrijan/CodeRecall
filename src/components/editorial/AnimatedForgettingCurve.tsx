'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AnimatedForgettingCurve() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const fillPathRef = useRef<SVGPathElement>(null);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const POINTS = [
    { x: 30, y: 25, day: 'Day 0', label: 'Initial Solve', pct: '100%' },
    { x: 130, y: 25, day: 'Day 1', label: '1st Recall Drill', pct: '+6d Interval' },
    { x: 270, y: 24, day: 'Day 6', label: '2nd Recall Drill', pct: '+16d Interval' },
    { x: 430, y: 22, day: 'Day 16', label: '3rd Recall Drill', pct: '+40d Interval' },
    { x: 570, y: 22, day: 'Day 40+', label: 'Consolidated Reflex', pct: 'Permanent (96.8%)' },
  ];

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setProgress(1);
      return;
    }

    const path = pathRef.current;
    if (!path) return;

    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 85%',
      end: 'top 35%',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        setProgress(p);
        path.style.strokeDashoffset = `${pathLength * (1 - p)}`;

        if (fillPathRef.current) {
          fillPathRef.current.style.opacity = `${p * 0.4}`;
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto space-y-3 font-mono text-xs select-none">
      {/* Live Header Status */}
      <div className="flex justify-between items-center text-[10px] text-neutral-500 uppercase tracking-widest">
        <span>[ SPATIAL RECALL REPETITION TRAJECTORY ]</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          {progress >= 0.95 ? '● STABILIZED (96.8% RETENTION)' : `● DRAWING INTERVALS (${Math.round(progress * 100)}%)`}
        </span>
      </div>

      {/* SVG Canvas Area */}
      <div className="h-32 sm:h-36 w-full relative p-2 rounded-lg bg-neutral-100/60 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 shadow-inner">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 600 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shaded Area Gradient */}
            <linearGradient id="curve-fill-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Reference Horizontal Grid Lines */}
          <line x1="30" y1="25" x2="570" y2="25" stroke="currentColor" className="text-neutral-200 dark:text-white/5" strokeDasharray="3 3" />
          <line x1="30" y1="65" x2="570" y2="65" stroke="currentColor" className="text-neutral-200 dark:text-white/5" strokeDasharray="3 3" />
          <line x1="30" y1="100" x2="570" y2="100" stroke="currentColor" className="text-neutral-300 dark:text-white/15" />

          {/* Axis Labels */}
          <text x="5" y="28" className="fill-neutral-400 dark:fill-neutral-600 text-[8px] font-mono">100%</text>
          <text x="5" y="68" className="fill-neutral-400 dark:fill-neutral-600 text-[8px] font-mono">50%</text>
          <text x="5" y="103" className="fill-neutral-400 dark:fill-neutral-600 text-[8px] font-mono">0%</text>

          {/* Day Vertical Ticks */}
          {POINTS.map((pt) => (
            <g key={pt.day}>
              <line x1={pt.x} y1="20" x2={pt.x} y2="102" stroke="currentColor" className="text-neutral-200 dark:text-white/5" strokeDasharray="2 4" />
              <text x={pt.x} y="114" textAnchor="middle" className="fill-neutral-500 text-[8px] font-mono font-bold">
                {pt.day}
              </text>
            </g>
          ))}

          {/* Unrecalled Exponential Decay Ghost Curve */}
          <path
            d="M 30 25 Q 120 95, 240 100 L 570 100"
            stroke="currentColor"
            className="text-rose-500/25 dark:text-rose-500/20"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
          <text x="145" y="94" className="fill-rose-500/60 dark:fill-rose-400/50 text-[8px] font-mono">
            Without Recall: 80% Synaptic Decay
          </text>

          {/* Shaded Fill Area under the curve */}
          <path
            ref={fillPathRef}
            d="M 30 25 Q 90 70, 130 80 L 130 25 Q 220 60, 270 70 L 270 24 Q 380 40, 430 45 L 430 22 L 570 22 L 570 100 L 30 100 Z"
            fill="url(#curve-fill-gradient)"
            style={{ opacity: 0 }}
            className="transition-opacity duration-300 pointer-events-none"
          />

          {/* Active Animated Spaced Repetition Curve */}
          <path
            ref={pathRef}
            d="M 30 25 Q 90 70, 130 80 L 130 25 Q 220 60, 270 70 L 270 24 Q 380 40, 430 45 L 430 22 L 570 22"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#glow)"
          />

          {/* Interactive Recall Drill Nodes */}
          {POINTS.map((pt, idx) => {
            const isRevealed = progress >= (idx * 0.22);
            return (
              <g
                key={pt.day}
                onMouseEnter={() => setActivePoint(idx)}
                onMouseLeave={() => setActivePoint(null)}
                className="cursor-pointer"
              >
                {/* Outer halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activePoint === idx ? 8 : 5}
                  className={`transition-all duration-200 ${
                    isRevealed
                      ? 'fill-emerald-500/20 stroke-emerald-400 stroke-1'
                      : 'fill-neutral-300 dark:fill-neutral-800'
                  }`}
                />
                {/* Inner center dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activePoint === idx ? 4 : 2.5}
                  className={`transition-all duration-200 ${
                    isRevealed ? 'fill-emerald-400' : 'fill-neutral-400 dark:fill-neutral-600'
                  }`}
                />
              </g>
            );
          })}

          {/* Stabilized Flag Label at the end */}
          {progress >= 0.9 && (
            <g className="animate-in fade-in duration-300">
              <rect x="480" y="32" width="95" height="18" rx="2" className="fill-emerald-500/10 stroke-emerald-500/30 stroke-1" />
              <text x="528" y="44" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-mono font-bold">
                PERMANENT.
              </text>
            </g>
          )}
        </svg>

        {/* Hover Coordinate Card Tooltip */}
        {activePoint !== null && (
          <div
            className="absolute -top-10 z-30 font-mono text-[10px] px-2.5 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xl -translate-x-1/2 flex items-center gap-1.5 animate-in fade-in zoom-in-95 pointer-events-none"
            style={{ left: `${(POINTS[activePoint].x / 600) * 100}%` }}
          >
            <span className="font-bold text-emerald-400 dark:text-emerald-600">{POINTS[activePoint].day}:</span>
            <span>{POINTS[activePoint].label} ({POINTS[activePoint].pct})</span>
          </div>
        )}
      </div>
    </div>
  );
}
