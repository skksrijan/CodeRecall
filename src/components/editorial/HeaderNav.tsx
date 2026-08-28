'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Terminal, Sun, Moon } from 'lucide-react';

export default function HeaderNav() {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 bg-white/90 dark:bg-[#08090b]/90 backdrop-blur-md border-b border-neutral-200 dark:border-white/10 shadow-xs'
          : 'py-4 sm:py-6 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between font-mono text-xs">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-neutral-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group">
          <div className="w-5 h-5 rounded-sm bg-neutral-900 text-white dark:bg-white/10 dark:text-white border border-neutral-300 dark:border-white/20 flex items-center justify-center text-[10px] font-bold group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">
            CR
          </div>
          <span className="font-bold tracking-tight text-sm">CODERECALL</span>
          <span className="hidden sm:inline-block text-[10px] text-neutral-400 dark:text-neutral-500 border-l border-neutral-300 dark:border-neutral-800 pl-2">
            SM-2.V2
          </span>
        </Link>

        {/* Center Technical Links */}
        <nav className="hidden md:flex items-center space-x-6 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
          <a href="#problem" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            <span className="text-neutral-400 dark:text-neutral-600 mr-1">01</span>Problem
          </a>
          <a href="#loop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            <span className="text-neutral-400 dark:text-neutral-600 mr-1">02</span>Loop
          </a>
          <a href="#scheduler" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            <span className="text-neutral-400 dark:text-neutral-600 mr-1">03</span>Scheduler
          </a>
          <a href="#patterns" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            <span className="text-neutral-400 dark:text-neutral-600 mr-1">04</span>Patterns
          </a>
          <a href="#specs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            <span className="text-neutral-400 dark:text-neutral-600 mr-1">05</span>System
          </a>
        </nav>

        {/* Right Controls & CTA */}
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white border border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30 transition-colors"
              aria-label="Toggle theme"
            >
              {currentTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-700" />}
            </button>
          )}

          {user ? (
            <Link
              href="/app/dashboard"
              className="px-3.5 py-1.5 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors uppercase tracking-wider font-semibold text-[11px] flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Workbench &rarr;</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors uppercase tracking-wider text-[11px] px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 rounded-sm bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors uppercase tracking-wider font-semibold text-[11px] flex items-center gap-1 shadow-xs"
              >
                <span>Start Recall</span>
                <span className="text-emerald-500 dark:text-emerald-600 font-bold">&rarr;</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
