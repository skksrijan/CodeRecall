'use client';

import { Check } from 'lucide-react';

const SPECS = [
  {
    code: 'SPEC.001',
    title: 'SM-2 Adaptive Spaced Decay Engine',
    desc: 'Mathematical model that recalculates interval expansions (1d → 6d → 16d → 40d → 90d) and Ease Factors based on active recall latency.',
    meta: 'ALGORITHM',
  },
  {
    code: 'SPEC.002',
    title: 'In-Browser Monaco Scratchpad Sandbox',
    desc: 'Local execution environment with TypeScript / Python syntax highlighting, zero server round-trip latency, and strict time constraints.',
    meta: 'RUNTIME',
  },
  {
    code: 'SPEC.003',
    title: 'Pattern-Centric Problem Taxonomy',
    desc: 'Hierarchical categorization indexing problems by underlying mental models (Sliding Window, Monotonic Stack, etc.) rather than isolated questions.',
    meta: 'TAXONOMY',
  },
  {
    code: 'SPEC.004',
    title: 'Sub-15-Minute Daily Target Batching',
    desc: 'Queue optimization algorithm that balances new problem ingestion with due reviews to keep daily practice under 15 minutes.',
    meta: 'PACING',
  },
  {
    code: 'SPEC.005',
    title: 'Zero-Friction Ingestion Pipeline',
    desc: 'Single-click import from LeetCode URLs, raw markdown notes, or curated curriculum decks with automated metadata extraction.',
    meta: 'INGESTION',
  },
  {
    code: 'SPEC.006',
    title: 'Offline-First Local Storage Engine',
    desc: 'Deterministic client-side sync engine with IndexedDB persistence, enabling seamless study sessions even without internet connectivity.',
    meta: 'STORAGE',
  },
];

export default function SystemSpecGrid() {
  return (
    <section
      id="specs"
      className="min-h-screen relative flex flex-col justify-between py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#08090b] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Header Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">008</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">THE SYSTEM ARCHITECTURE</span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          CORE MODULE SPECIFICATIONS
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-7xl w-full mx-auto my-auto py-8 space-y-10">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Engineered for <br />
            <span className="text-emerald-600 dark:text-emerald-400">cognitive efficiency.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Every module in CodeRecall is built to eliminate friction and maximize pattern retention.
          </p>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          {SPECS.map((spec) => (
            <div
              key={spec.code}
              className="tech-card rounded-lg p-6 space-y-5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-lg group border-neutral-200 dark:border-white/10"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-neutral-200 dark:border-white/10 pb-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{spec.code}</span>
                  <span className="text-[10px] text-neutral-500">{spec.meta}</span>
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-sans">
                  {spec.title}
                </h3>

                <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed font-sans font-normal">
                  {spec.desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 border-t border-neutral-200 dark:border-white/10 pt-3">
                <Check className="w-3.5 h-3.5" />
                <span>OPERATIONAL SPECIFICATION VERIFIED</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom marker */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex justify-between">
        <span>008 / TECHNICAL SPEC SHEET</span>
        <span>SCROLL FOR 009 / CLI & RUNTIME &darr;</span>
      </div>
    </section>
  );
}
