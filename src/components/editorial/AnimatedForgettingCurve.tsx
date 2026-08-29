'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
  day: string;
  label: string;
  pct: string;
  interval: string;
  desc: string;
}

const POINTS: Point[] = [
  { x: 30, y: 25, day: 'Day 0', label: 'Initial Solve', pct: '100%', interval: '1d', desc: 'First exposure to pattern' },
  { x: 130, y: 25, day: 'Day 1', label: '1st Recall Drill', pct: '92%', interval: '+5d', desc: 'Re-calibrate memory trace' },
  { x: 270, y: 24, day: 'Day 6', label: '2nd Recall Drill', pct: '94%', interval: '+10d', desc: 'Synaptic stabilization' },
  { x: 430, y: 22, day: 'Day 16', label: '3rd Recall Drill', pct: '96%', interval: '+24d', desc: 'Long-term consolidation' },
  { x: 570, y: 22, day: 'Day 40+', label: 'Mastered Reflex', pct: '96.8%', interval: 'Permanent', desc: 'Subconscious recognition' },
];

export default function AnimatedForgettingCurve() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const fillPathRef = useRef<SVGPathElement>(null);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [headPos, setHeadPos] = useState<{ x: number; y: number } | null>(null);

  const applyProgress = useCallback((p: number) => {
    const clampedP = Math.max(0, Math.min(1, p));
    setProgress(clampedP);

    const path = pathRef.current;
    if (!path) return;

    let pathLength = 600;
    try {
      pathLength = path.getTotalLength() || 600;
    } catch {}

    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength * (1 - clampedP)}`;

    if (fillPathRef.current) {
      fillPathRef.current.style.opacity = `${clampedP * 0.45}`;
    }

    try {
      const pt = path.getPointAtLength(pathLength * clampedP);
      setHeadPos({ x: pt.x, y: pt.y });
    } catch {}
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Start drawing when top of container enters 95% of viewport height
      // Complete drawing when top of container reaches 40% of viewport height
      const startThreshold = windowHeight * 0.95;
      const endThreshold = windowHeight * 0.35;

      const rawP = (startThreshold - rect.top) / (startThreshold - endThreshold);
      applyProgress(rawP);
    };

    // Run on initial mount
    handleScroll();

    // Listen to native scroll, touchmove, wheel and resize events
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    window.addEventListener('touchmove', handleScroll, { passive: true });
    window.addEventListener('wheel', handleScroll, { passive: true });

    // Periodic safety check during smooth scroll
    const interval = setInterval(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      window.removeEventListener('wheel', handleScroll);
      clearInterval(interval);
    };
  }, [applyProgress]);

  const getCurrentStageText = () => {
    if (progress >= 0.95) return '● PERMANENT REFLEX STABILIZED (96.8% RETENTION)';
    if (progress >= 0.72) return '● 3RD RECALL DRILL (EXPONENTIAL INTERVAL: +24 DAYS)';
    if (progress >= 0.45) return '● 2ND RECALL DRILL (SYNAPTIC CONSOLIDATION: +10 DAYS)';
    if (progress >= 0.2) return '● 1ST RECALL DRILL (PREVENTING RAPID SYNAPTIC DECAY)';
    if (progress > 0) return `● SCROLLING: DRAWING ACTIVE RECALL INTERVALS (${Math.round(progress * 100)}%)`;
    return '● SCROLL DOWN TO BUILD RETENTION GRAPH';
  };

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto space-y-3 font-mono text-xs select-none">
      {/* Live Header Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest pb-1 border-b border-neutral-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span className="font-bold text-neutral-900 dark:text-white">[ ACTIVE RECALL STABILIZATION GRAPH ]</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold transition-all">
            {getCurrentStageText()}
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="h-36 sm:h-44 w-full relative p-3 rounded-lg bg-neutral-100/80 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 shadow-inner overflow-visible">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 600 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="curve-fill-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            <filter id="emerald-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>

            <radialGradient id="laser-head-grad">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Reference Horizontal Grid Lines */}
          <line x1="30" y1="25" x2="570" y2="25" stroke="currentColor" className="text-neutral-300/80 dark:text-white/10" strokeDasharray="3 3" />
          <line x1="30" y1="65" x2="570" y2="65" stroke="currentColor" className="text-neutral-300/80 dark:text-white/10" strokeDasharray="3 3" />
          <line x1="30" y1="100" x2="570" y2="100" stroke="currentColor" className="text-neutral-400 dark:text-white/20" />

          {/* Axis Labels */}
          <text x="5" y="28" className="fill-neutral-500 dark:fill-neutral-500 text-[8px] font-mono font-bold">100%</text>
          <text x="5" y="68" className="fill-neutral-400 dark:fill-neutral-600 text-[8px] font-mono">50%</text>
          <text x="5" y="103" className="fill-neutral-400 dark:fill-neutral-600 text-[8px] font-mono">0%</text>

          {/* Day Vertical Ticks & Milestones */}
          {POINTS.map((pt) => (
            <g key={pt.day}>
              <line x1={pt.x} y1="20" x2={pt.x} y2="102" stroke="currentColor" className="text-neutral-300 dark:text-white/10" strokeDasharray="2 4" />
              <text x={pt.x} y="114" textAnchor="middle" className="fill-neutral-600 dark:fill-neutral-400 text-[8px] font-mono font-bold">
                {pt.day}
              </text>
            </g>
          ))}

          {/* Unrecalled Exponential Decay Ghost Curve (The Forgetting Curve) */}
          <path
            d="M 30 25 Q 110 95, 230 100 L 570 100"
            stroke="currentColor"
            className="text-rose-500/35 dark:text-rose-500/30"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
          <text x="135" y="93" className="fill-rose-600/70 dark:fill-rose-400/60 text-[8px] font-mono font-bold">
            WITHOUT RECALL: 80% SYNAPTIC DECAY IN 48H
          </text>

          {/* Shaded Fill Area under the curve */}
          <path
            ref={fillPathRef}
            d="M 30 25 Q 90 70, 130 80 L 130 25 Q 220 60, 270 70 L 270 24 Q 380 40, 430 45 L 430 22 L 570 22 L 570 100 L 30 100 Z"
            fill="url(#curve-fill-gradient)"
            style={{ opacity: 0 }}
            className="transition-opacity duration-150 pointer-events-none"
          />

          {/* Active Animated Spaced Repetition Curve */}
          <path
            ref={pathRef}
            d="M 30 25 Q 90 70, 130 80 L 130 25 Q 220 60, 270 70 L 270 24 Q 380 40, 430 45 L 430 22 L 570 22"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#emerald-glow)"
          />

          {/* Glowing Laser Scanhead (moving with path length on scroll) */}
          {headPos && progress > 0.01 && progress < 0.99 && (
            <g transform={`translate(${headPos.x}, ${headPos.y})`}>
              <circle r="9" fill="url(#laser-head-grad)" className="animate-pulse" />
              <circle r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
            </g>
          )}

          {/* Interactive Recall Drill Nodes */}
          {POINTS.map((pt, idx) => {
            const isRevealed = progress >= (idx * 0.21);
            return (
              <g
                key={pt.day}
                onMouseEnter={() => setActivePoint(idx)}
                onMouseLeave={() => setActivePoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activePoint === idx ? 9 : 6}
                  className={`transition-all duration-150 ${
                    isRevealed
                      ? 'fill-emerald-500/25 stroke-emerald-400 stroke-1'
                      : 'fill-neutral-300 dark:fill-neutral-800'
                  }`}
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activePoint === idx ? 4.5 : 3}
                  className={`transition-all duration-150 ${
                    isRevealed ? 'fill-emerald-400' : 'fill-neutral-400 dark:fill-neutral-600'
                  }`}
                />
              </g>
            );
          })}

          {/* Stabilized Flag Label at the end */}
          {progress >= 0.92 && (
            <g className="animate-in fade-in zoom-in-95 duration-200">
              <rect x="475" y="30" width="105" height="20" rx="3" className="fill-emerald-500/20 stroke-emerald-500/50 stroke-1" />
              <text x="527" y="43" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-mono font-extrabold tracking-wider">
                PERMANENT REFLEX
              </text>
            </g>
          )}
        </svg>

        {/* Hover Coordinate Card Tooltip */}
        {activePoint !== null && (
          <div
            className="absolute -top-12 z-30 font-mono text-[10px] px-3 py-1.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-black shadow-2xl -translate-x-1/2 flex flex-col items-start gap-0.5 animate-in fade-in zoom-in-95 pointer-events-none border border-neutral-700 dark:border-neutral-200"
            style={{ left: `${(POINTS[activePoint].x / 600) * 100}%` }}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-emerald-400 dark:text-emerald-600">{POINTS[activePoint].day}:</span>
              <span>{POINTS[activePoint].label}</span>
            </div>
            <div className="text-[9px] opacity-80">
              Retention: {POINTS[activePoint].pct} • Interval: {POINTS[activePoint].interval}
            </div>
          </div>
        )}
      </div>

      {/* Trajectory Metrics Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
        <div className="p-2 rounded bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
          <span className="text-neutral-500 block">START EFFORT</span>
          <span className="font-bold text-neutral-900 dark:text-white">10-15 min / solve</span>
        </div>
        <div className="p-2 rounded bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
          <span className="text-neutral-500 block">RECALL COMPOUND</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">2.5x per session</span>
        </div>
        <div className="p-2 rounded bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
          <span className="text-neutral-500 block">FINAL DRILL TIME</span>
          <span className="font-bold text-neutral-900 dark:text-white">&lt; 30 sec reflex</span>
        </div>
        <div className="p-2 rounded bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
          <span className="text-neutral-500 block">LONG-TERM RETENTION</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">96.8% Permanent</span>
        </div>
      </div>
    </div>
  );
}
