'use client';

export default function TerminalSection() {
  return (
    <section
      id="terminal"
      className="min-h-screen relative flex flex-col justify-between py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f4f5f7] dark:bg-[#0a0c10] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Header Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">009</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">CLI & RUNTIME TELEMETRY</span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          DEVELOPER INTERFACE &bull; REPO ENGINE
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl w-full mx-auto my-auto py-8 space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Instant telemetry from your terminal.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-mono">
            Inspect your personal memory index, due queues, and retention decay rates directly from the CLI.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="tech-card rounded-lg overflow-hidden border border-neutral-200 dark:border-white/10 shadow-2xl font-mono text-xs">
          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-100 dark:bg-[#07080a] border-b border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-neutral-600 dark:text-neutral-400 text-[11px] ml-2">bash - coderecall-cli v2.4.0</span>
            </div>
            <span className="text-neutral-500 text-[10px]">UTF-8 &bull; 60fps</span>
          </div>

          {/* Terminal Screen Body */}
          <div className="p-6 space-y-3 bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">skk@macbook-pro</span>
              <span className="text-neutral-500">:</span>
              <span className="text-sky-400">~/dsa-recall</span>
              <span className="text-neutral-400">$</span>
              <span className="text-white font-bold">coderecall status --verbose</span>
            </div>

            <div className="text-neutral-400 space-y-1 pt-1">
              <div>[INFO] Loading local SM-2 state matrix from IndexedDB...</div>
              <div>[OK] Found 142 total indexed patterns across 8 taxonomies.</div>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-1.5 text-neutral-300">
              <div className="text-emerald-400 font-bold">== TODAY&apos;S PACED RECALL BATCH ==</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1">
                <div className="p-2 rounded bg-neutral-900 border border-white/10">
                  <div className="text-neutral-400 text-[10px]">QUEUED DRILLS</div>
                  <div className="text-white font-bold text-sm">3 DUE (15m)</div>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/10">
                  <div className="text-neutral-400 text-[10px]">PROJECTED 30D RETENTION</div>
                  <div className="text-emerald-400 font-bold text-sm">96.8% (Target &gt;90%)</div>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/10">
                  <div className="text-neutral-400 text-[10px]">AVG INTERVAL STABILITY</div>
                  <div className="text-white font-bold text-sm">24.2 Days / Problem</div>
                </div>
              </div>

              <div className="pt-2 text-neutral-400 space-y-1">
                <div>&bull; [DUE] #011 Container With Most Water (Two Pointers) &rarr; Next: +6d</div>
                <div>&bull; [DUE] #042 Trapping Rain Water (Monotonic Stack) &rarr; Next: +6d</div>
                <div>&bull; [DUE] #146 LRU Cache (Doubly Linked List + Map) &rarr; Next: +1d</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-neutral-400">
              <span className="text-emerald-400 font-bold">skk@macbook-pro</span>
              <span className="text-neutral-500">:</span>
              <span className="text-sky-400">~/dsa-recall</span>
              <span className="text-neutral-400">$</span>
              <span className="text-neutral-300">coderecall drill --auto-timer</span>
              <span className="terminal-cursor ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom marker */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex justify-between">
        <span>009 / CLI TOOLING & LOCAL EXECUTION</span>
        <span>SCROLL FOR 010 / REPO DIRECTORY TREE &darr;</span>
      </div>
    </section>
  );
}
