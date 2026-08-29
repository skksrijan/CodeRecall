'use client';

import { useState } from 'react';
import { Clock, Code2, ListChecks, BarChart3, CheckCircle2 } from 'lucide-react';
import DecipherText from '@/components/motion/DecipherText';

export default function ProductWorkbenchSection() {
  const [activeTab, setActiveTab] = useState<'queue' | 'editor' | 'stats'>('editor');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(4);

  return (
    <section
      id="workbench"
      className="min-h-screen relative flex flex-col justify-between py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#08090b] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Header Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">004</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">
            <DecipherText text="THE WORKBENCH" />
          </span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          ACTUAL PRODUCT ENVIRONMENT
        </div>
      </div>

      {/* Main Section Content */}
      <div className="max-w-7xl w-full mx-auto my-auto py-8 space-y-8">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Built like developer tooling. <br />
            <span className="text-emerald-600 dark:text-emerald-400">Not a flashcard app.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            In-browser scratchpad, Monaco code editor, timed recall constraints, automated test execution, and SuperMemo SM-2 interval calculator in one fluid interface.
          </p>
        </div>

        {/* Workbench Frame */}
        <div className="tech-card rounded-lg border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden font-mono text-xs">
          {/* Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 dark:border-white/10 px-4 sm:px-6 py-3 bg-neutral-100 dark:bg-[#07080a] gap-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-800" />
              </div>
              <span className="text-neutral-500 text-[11px] ml-2">app.coderecall.dev/drill/011</span>
            </div>

            {/* Sub-navigation tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'queue'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/20 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>1. DUE TODAY (3)</span>
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/20 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>2. ACTIVE DRILL</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'stats'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/20 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>3. RETENTION METRICS</span>
              </button>
            </div>
          </div>

          {/* Workbench Body */}
          <div className="p-6 sm:p-8">
            {/* Tab 1: Queue */}
            {activeTab === 'queue' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="text-neutral-500 dark:text-neutral-400 text-[11px]">{"// TODAY'S PACED RECALL QUEUE"}</div>
                {[
                  { title: '#011 Container With Most Water', diff: 'MEDIUM', tag: 'Two Pointers', interval: 'Due Today' },
                  { title: '#042 Trapping Rain Water', diff: 'HARD', tag: 'Monotonic Stack', interval: 'Due Today' },
                  { title: '#146 LRU Cache', diff: 'MEDIUM', tag: 'Design / Linked List', interval: 'Due Today' },
                ].map((q) => (
                  <div key={q.title} className="p-3.5 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-900 dark:text-white font-bold">{q.title}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">{q.diff}</span>
                      <span className="text-neutral-500 text-[10px]">#{q.tag}</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{q.interval}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Active Drill & Monaco Scratchpad */}
            {activeTab === 'editor' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
                {/* Left Column: Problem & Timer */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                        MEDIUM
                      </span>
                      <span className="text-neutral-900 dark:text-white font-bold text-sm">#011 Container With Most Water</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span>04:18 (Threshold 15m)</span>
                    </div>
                  </div>

                  <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed font-sans">
                    Given n non-negative integers a1, a2, ..., an where each represents a point at coordinate (i, ai). Find two lines that together with the x-axis form a container holding the maximum water.
                  </p>

                  {/* Simulated in-browser scratchpad code editor */}
                  <div className="p-4 rounded bg-neutral-100 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 space-y-1 text-neutral-800 dark:text-neutral-300">
                    <div className="text-neutral-500">{'// In-Browser Monaco Scratchpad Sandbox'}</div>
                    <div><span className="text-sky-600 dark:text-sky-400">function</span> <span className="text-emerald-600 dark:text-emerald-400">maxArea</span>(height: <span className="text-sky-600 dark:text-sky-300">number[]</span>): <span className="text-sky-600 dark:text-sky-300">number</span> &#123;</div>
                    <div className="pl-4">let l = 0, r = height.length - 1, max = 0;</div>
                    <div className="pl-4">while (l &lt; r) &#123;</div>
                    <div className="pl-8">max = Math.max(max, Math.min(height[l], height[r]) * (r - l));</div>
                    <div className="pl-8">height[l] &lt; height[r] ? l++ : r--;</div>
                    <div className="pl-4">&#125;</div>
                    <div className="pl-4"><span className="text-sky-600 dark:text-sky-400">return</span> max;</div>
                    <div>&#125;</div>
                  </div>
                </div>

                {/* Right Column: SM-2 Self-Rating Deck */}
                <div className="lg:col-span-6 p-5 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">SM-2 RECALL ASSESSMENT</span>
                      <span className="text-neutral-500">EF: 2.50</span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                      Rate how effortlessly you reconstructed the two-pointer convergence pattern:
                    </p>
                  </div>

                  {/* Grade buttons */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      { val: 0, label: '0: BLACKOUT', desc: 'No memory' },
                      { val: 1, label: '1: HARD', desc: 'Major hesitation' },
                      { val: 2, label: '2: UNCERTAIN', desc: 'Incorrect logic' },
                      { val: 3, label: '3: PASS', desc: 'With struggle' },
                      { val: 4, label: '4: GOOD', desc: 'Clean recall' },
                      { val: 5, label: '5: INSTANT', desc: 'Perfect reflex' },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        onClick={() => setSelectedGrade(btn.val)}
                        className={`p-2 rounded border text-center transition-all ${
                          selectedGrade === btn.val
                            ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold shadow-md'
                            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400'
                        }`}
                      >
                        <div className="text-xs">{btn.val}</div>
                        <div className="text-[8px] truncate">{btn.label.split(': ')[1]}</div>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic calculation result */}
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex justify-between items-center text-[11px]">
                    <span>SCHEDULED NEXT DRILL:</span>
                    <strong className="text-neutral-900 dark:text-white font-bold">+6 DAYS (EF &rarr; 2.50)</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Retention Metrics */}
            {activeTab === 'stats' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 space-y-1">
                    <div className="text-neutral-500 text-[10px]">TOTAL MASTERED</div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">142</div>
                  </div>
                  <div className="p-4 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 space-y-1">
                    <div className="text-neutral-500 text-[10px]">CONSOLIDATION RATE</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">96.8%</div>
                  </div>
                  <div className="p-4 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 space-y-1">
                    <div className="text-neutral-500 text-[10px]">CURRENT STREAK</div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">38 Days</div>
                  </div>
                  <div className="p-4 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 space-y-1">
                    <div className="text-neutral-500 text-[10px]">AVG RECALL TIME</div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">4m 12s</div>
                  </div>
                </div>

                {/* 90-Day Heatmap Activity Grid */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-neutral-500">
                    <span>90-DAY SPACED RETENTION MATRIX (DAILY ACTIVE DRILLS):</span>
                    <div className="flex items-center gap-1.5">
                      <span>Less</span>
                      <div className="w-2.5 h-2.5 rounded-xs bg-neutral-200 dark:bg-neutral-800" />
                      <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/30" />
                      <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/60" />
                      <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                      <span>More</span>
                    </div>
                  </div>

                  <div className="p-4 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 overflow-x-auto">
                    <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[500px] w-full">
                      {Array.from({ length: 91 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-3 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                            i % 7 === 0 || i % 11 === 0
                              ? 'bg-emerald-500'
                              : i % 4 === 0
                              ? 'bg-emerald-500/70'
                              : i % 2 === 0
                              ? 'bg-emerald-500/35'
                              : 'bg-neutral-200 dark:bg-neutral-800'
                          }`}
                          title={`Day ${i + 1}: ${i % 7 === 0 ? '4 Drills Completed (100%)' : i % 2 === 0 ? '2 Drills Completed' : 'Rest / No Decay'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Progress Breakdown */}
                <div className="space-y-3 pt-2">
                  <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                    Core Algorithmic Taxonomy Retention:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { name: 'Two Pointers & Sliding Window', count: '38/38', pct: '98%', color: 'bg-emerald-500' },
                      { name: 'Monotonic Stack & Queue', count: '24/24', pct: '94%', color: 'bg-emerald-500' },
                      { name: 'Binary Search on Answer', count: '31/31', pct: '96%', color: 'bg-emerald-500' },
                      { name: 'Dynamic Programming & Memo', count: '52/52', pct: '92%', color: 'bg-emerald-500' },
                    ].map((cat) => (
                      <div key={cat.name} className="p-3 rounded bg-neutral-50 dark:bg-[#07080a] border border-neutral-200 dark:border-white/10 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-neutral-900 dark:text-white">{cat.name}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cat.pct}</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color}`} style={{ width: cat.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom marker */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex justify-between">
        <span>004 / COMPLETE PRODUCT OPERATING SYSTEM</span>
        <span>SCROLL FOR 005 / PATTERN MEMORY STREAM &darr;</span>
      </div>
    </section>
  );
}
