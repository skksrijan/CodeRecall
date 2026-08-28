'use client';

import { useState } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';

const TREE_DATA = [
  {
    name: 'recall-engine',
    desc: 'Core SuperMemo SM-2 math & scheduling routines',
    children: [
      { name: 'sm2-decay-matrix.ts', desc: 'Calculates next repetition intervals' },
      { name: 'ease-factor-optimizer.ts', desc: 'Updates dynamic EF values' },
      { name: 'daily-queue-scheduler.ts', desc: 'Batches 15-minute review sessions' },
    ],
  },
  {
    name: 'problems-taxonomy',
    desc: 'Categorized pattern definitions & test suites',
    children: [
      { name: '01-two-pointers.ts', desc: 'Container Most Water, 3Sum, Trapping Rain Water' },
      { name: '02-sliding-window.ts', desc: 'Longest Substring, Min Window Substring' },
      { name: '03-binary-search.ts', desc: 'Search Rotated Array, Koko Bananas' },
      { name: '04-monotonic-stack.ts', desc: 'Daily Temperatures, Largest Rectangle' },
      { name: '05-dynamic-programming.ts', desc: 'Coin Change, Longest Increasing Subseq' },
    ],
  },
  {
    name: 'analytics-telemetry',
    desc: 'Cognitive retention tracking & consolidation stats',
    children: [
      { name: 'retention-health.ts', desc: 'Calculates 30-day memory integrity' },
      { name: 'matrix-constellation.ts', desc: '150-node cognitive visualizer' },
    ],
  },
  {
    name: 'user-workbench',
    desc: 'Local browser IDE, timers & execution bridge',
    children: [
      { name: 'monaco-scratchpad.tsx', desc: 'Zero-latency local code sandbox' },
      { name: 'active-drill-timer.tsx', desc: 'Paced recall countdown threshold' },
      { name: 'indexeddb-storage.ts', desc: 'Offline-first client-side replication' },
    ],
  },
];

export default function ArchitectureTreeSection() {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'recall-engine': true,
    'problems-taxonomy': true,
  });

  const toggle = (name: string) => {
    setOpenFolders((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <section
      id="architecture"
      className="min-h-screen relative flex flex-col justify-between py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#08090b] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Header Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">010</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">MEMORY REPOSITORY STRUCTURE</span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          TAXONOMY DIRECTORY TREE
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Structured like a code repository.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Every pattern, interval record, review timestamp, and solution invariant is stored in a clean, hierarchical taxonomy.
          </p>
        </div>

        {/* Directory Explorer Card */}
        <div className="tech-card rounded-lg p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-white/10 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3 text-neutral-500">
            <span>REPOSITORY TREE: coderecall-core/</span>
            <span className="text-[10px]">CLICK FOLDERS TO EXPAND</span>
          </div>

          <div className="space-y-1 select-none">
            {TREE_DATA.map((folder) => {
              const isOpen = openFolders[folder.name];
              return (
                <div key={folder.name} className="space-y-1">
                  <button
                    onClick={() => toggle(folder.name)}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      <Folder className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-neutral-900 dark:text-white font-bold">{folder.name}/</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 hidden sm:inline">{folder.desc}</span>
                  </button>

                  {isOpen && (
                    <div className="pl-6 space-y-1 border-l border-neutral-200 dark:border-white/10 ml-3 py-1">
                      {folder.children.map((child) => (
                        <div
                          key={child.name}
                          className="flex items-center justify-between p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileCode className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>{child.name}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{child.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom marker */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex justify-between">
        <span>010 / MEMORY FILE SYSTEM TAXONOMY</span>
        <span>SCROLL FOR 011 / FREQUENTLY ASKED QUESTIONS &darr;</span>
      </div>
    </section>
  );
}
