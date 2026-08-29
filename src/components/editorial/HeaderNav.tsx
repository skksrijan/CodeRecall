'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import DecipherText from '@/components/motion/DecipherText';

export default function HeaderNav() {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';

  return (
    <header className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl transition-all duration-300 font-mono">
      {/* Floating Centered Pill Container with Inverting Theme Styles */}
      <div className="bg-white/95 text-neutral-900 border-neutral-300/80 shadow-xl dark:bg-[#0b0d12]/95 dark:text-white dark:border-white/15 dark:shadow-2xl backdrop-blur-xl border rounded-lg overflow-hidden transition-colors duration-300">
        {/* Top Button Row */}
        <div className="px-3 py-2 flex items-center justify-between gap-1 text-[11px] select-none">
          {/* Left Brand Hatched Badge */}
          <Link href="/" className="flex items-center gap-2 group shrink-0 pr-1">
            <div className="w-5 h-5 rounded-xs bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-extrabold text-[10px] tracking-tighter group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400 transition-colors">
              CR
            </div>
            <span className="font-bold tracking-wider hidden sm:inline text-xs text-neutral-900 dark:text-white">
              <DecipherText text="CODERECALL" />
            </span>
          </Link>

          {/* Navigation Links with Cryptic Decipher Hover Effect */}
          <nav className="flex items-center space-x-2 sm:space-x-3 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider text-[10px] sm:text-[11px]">
            <a href="#patterns" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
              <DecipherText text="PATTERNS" />
            </a>
            <a href="#loop" className="hover:text-neutral-950 dark:hover:text-white transition-colors hidden xs:inline">
              <DecipherText text="LOOP" />
            </a>
            <a href="#workbench" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
              <DecipherText text="WORKBENCH" />
            </a>
            <a href="#faq" className="hover:text-neutral-950 dark:hover:text-white transition-colors hidden sm:inline">
              <DecipherText text="FAQ" />
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                className="p-1 rounded text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
                title="Toggle Theme"
              >
                {currentTheme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-neutral-800" />
                )}
              </button>
            )}

            {user ? (
              <Link
                href="/app/dashboard"
                className="px-2.5 py-1 rounded-xs bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black font-bold uppercase tracking-wider hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all text-[10px] flex items-center gap-1 shadow-sm"
              >
                <DecipherText text="WORKBENCH" />
                <span>&rarr;</span>
              </Link>
            ) : (
              <Link
                href="/signup"
                className="px-2.5 py-1 rounded-xs bg-neutral-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all text-[10px] flex items-center gap-1.5 shadow-sm group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:animate-ping shrink-0" />
                <DecipherText text="GET ACCESS" />
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Ticker Marquee Strip */}
        <div className="border-t border-neutral-200 bg-neutral-100/90 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 py-0.5 px-3 overflow-hidden text-[9px] tracking-widest uppercase flex whitespace-nowrap select-none transition-colors duration-300">
          <div className="flex gap-4 animate-marquee items-center font-mono">
            <span>NOW LIVE: SM-2 ACTIVE RECALL ENGINE</span>
            <span className="text-emerald-600 dark:text-emerald-400">&bull;</span>
            <span>SUB-15M DAILY TARGETS</span>
            <span className="text-emerald-600 dark:text-emerald-400">&bull;</span>
            <span>150+ INTERVIEW PATTERNS</span>
            <span className="text-emerald-600 dark:text-emerald-400">&bull;</span>
            <span>OFFLINE INDEXEDDB REPLICATION</span>
            <span className="text-emerald-600 dark:text-emerald-400">&bull;</span>
            <span>NOW LIVE: SM-2 ACTIVE RECALL ENGINE</span>
            <span className="text-emerald-600 dark:text-emerald-400">&bull;</span>
            <span>SUB-15M DAILY TARGETS</span>
            <span className="text-emerald-600 dark:text-emerald-400">&bull;</span>
            <span>150+ INTERVIEW PATTERNS</span>
          </div>
        </div>
      </div>
    </header>
  );
}
