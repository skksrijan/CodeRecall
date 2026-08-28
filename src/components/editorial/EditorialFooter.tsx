'use client';

import Link from 'next/link';

export default function EditorialFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#060709] py-12 text-xs font-mono text-neutral-500 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-sm bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px]">
              CR
            </div>
            <span className="font-bold text-neutral-900 dark:text-white tracking-wider">CODERECALL</span>
            <span className="text-neutral-400 dark:text-neutral-600">/</span>
            <span className="text-neutral-600 dark:text-neutral-400">SM-2 ACTIVE RECALL SYSTEM</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 uppercase tracking-wider text-[11px]">
            <a href="#problem" className="hover:text-neutral-900 dark:hover:text-white transition-colors">01.Problem</a>
            <a href="#loop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">02.Loop</a>
            <a href="#scheduler" className="hover:text-neutral-900 dark:hover:text-white transition-colors">03.Scheduler</a>
            <a href="#patterns" className="hover:text-neutral-900 dark:hover:text-white transition-colors">04.Patterns</a>
            <a href="#specs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">05.Specs</a>
            <a href="#faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">06.FAQ</a>
            <Link href="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Sign In</Link>
            <a
              href="https://github.com/skksrijan/CodeRecall"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <span>&rarr;</span>
            </a>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} CodeRecall. &ldquo;Solve to learn. Recall to retain.&rdquo;
          </div>
          <div className="text-neutral-500">
            ENGINEERED WITH SUPERMEMO SM-2 COGNITIVE ARCHITECTURE
          </div>
        </div>
      </div>
    </footer>
  );
}
