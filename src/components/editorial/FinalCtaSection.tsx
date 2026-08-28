'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function FinalCtaSection() {
  const { user } = useAuth();

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="tech-card rounded-xl p-8 sm:p-16 border border-neutral-200 dark:border-white/15 shadow-2xl relative space-y-10 overflow-hidden text-center">
        {/* Subtle grid in background */}
        <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

        {/* Visual callback to stabilized curve */}
        <div className="max-w-2xl mx-auto space-y-3 font-mono text-xs">
          <div className="text-[10px] text-neutral-500 uppercase tracking-widest">
            [ FINAL EQUILIBRIUM: REPEATED CONSOLIDATION ]
          </div>

          <div className="h-28 w-full relative">
            <svg
              className="w-full h-full"
              viewBox="0 0 600 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Reference Grid */}
              <line x1="30" y1="20" x2="570" y2="20" stroke="currentColor" className="text-neutral-200 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="30" y1="80" x2="570" y2="80" stroke="currentColor" className="text-neutral-300 dark:text-white/15" />

              {/* Stabilizing Curve Spikes */}
              <path
                d="M 30 25 Q 90 70, 130 80 L 130 25 Q 220 60, 270 70 L 270 24 Q 380 40, 430 45 L 430 22 L 570 22"
                stroke="#10b981"
                strokeWidth="2.5"
                fill="none"
              />

              {/* Recall Markers */}
              <circle cx="130" cy="25" r="3.5" className="fill-emerald-500" />
              <circle cx="270" cy="24" r="3.5" className="fill-emerald-500" />
              <circle cx="430" cy="22" r="3.5" className="fill-emerald-500" />
              <circle cx="570" cy="22" r="4.5" className="fill-emerald-500 stroke-neutral-900 dark:stroke-white stroke-1" />

              <text x="490" y="42" className="fill-emerald-600 dark:fill-emerald-400 text-[11px] font-mono font-bold">
                RETAINED.
              </text>
            </svg>
          </div>
        </div>

        {/* Big Editorial Statement */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
            You already solved the problems. <br />
            <span className="text-emerald-600 dark:text-emerald-400">Now remember them.</span>
          </h2>

          <div className="text-sm sm:text-base font-mono text-neutral-600 dark:text-neutral-400 uppercase tracking-widest pt-2 font-bold">
            SOLVE TO LEARN. RECALL TO RETAIN.
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-xs">
          <Link
            href={user ? '/app/dashboard' : '/signup'}
            className="w-full sm:w-auto px-8 py-4 rounded-sm bg-neutral-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xl flex items-center justify-center gap-2 group"
          >
            <span>{user ? 'Open Your Workbench' : 'Start CodeRecall Free'}</span>
            <span className="text-emerald-400 dark:text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        {/* Underneath Assurance */}
        <p className="text-xs text-neutral-500 font-mono">
          No endless grinding. Just the right problem, at the exact right time.
        </p>
      </div>
    </section>
  );
}
