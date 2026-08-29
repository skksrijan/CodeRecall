'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import DecipherText from '@/components/motion/DecipherText';

export default function EditorialFooter() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="border-t border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#060709] py-12 text-xs font-mono text-neutral-500 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Link Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-sm bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px]">
              CR
            </div>
            <span className="font-bold text-neutral-900 dark:text-white tracking-wider">
              <DecipherText text="CODERECALL" />
            </span>
            <span className="text-neutral-400 dark:text-neutral-600">/</span>
            <span className="text-neutral-600 dark:text-neutral-400">SM-2 ACTIVE RECALL SYSTEM</span>
          </div>

          {/* Navigation Links with DecipherText */}
          <nav className="flex flex-wrap items-center justify-center gap-6 uppercase tracking-wider text-[11px]">
            <a href="#patterns" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              <DecipherText text="01.Patterns" />
            </a>
            <a href="#loop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              <DecipherText text="02.Loop" />
            </a>
            <a href="#workbench" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              <DecipherText text="03.Workbench" />
            </a>
            <a href="#faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              <DecipherText text="04.FAQ" />
            </a>
            <Link href="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              <DecipherText text="Sign In" />
            </Link>
            <a
              href="https://github.com/skksrijan/CodeRecall"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <DecipherText text="GitHub" />
              <span>&rarr;</span>
            </a>
          </nav>
        </div>

        {/* Secondary Row: Legal Links (Privacy, Terms, Security) */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] border-b border-neutral-200 dark:border-white/10 pb-6">
          <div className="flex flex-wrap items-center gap-6 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              <DecipherText text="Privacy Policy" />
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
            <Link href="/terms" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              <DecipherText text="Terms of Service" />
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
            <Link href="/security" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              <DecipherText text="Security Architecture" />
            </Link>
          </div>

          <div className="text-neutral-500 uppercase tracking-widest text-[10px]">
            ENGINEERED WITH SUPERMEMO SM-2
          </div>
        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} CodeRecall. &ldquo;Solve to learn. Recall to retain.&rdquo;
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30 hover:text-neutral-950 dark:hover:text-white transition-all uppercase tracking-wider font-semibold group shadow-xs"
          >
            <DecipherText text="BACK TO TOP" />
            <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
