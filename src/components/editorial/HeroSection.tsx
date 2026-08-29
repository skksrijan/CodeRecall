'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ConcentricRingCanvas from './ConcentricRingCanvas';
import { ArrowUpRight } from 'lucide-react';

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section
      id="hero"
      className="min-h-screen relative flex flex-col justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#08090b] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* 50/50 Split Grid */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6">
        {/* Left Column: High-Conviction Editorial Copy */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8">
          {/* Large Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.04] text-neutral-900 dark:text-white">
            The LeetCode setup <br />
            <span className="text-emerald-600 dark:text-emerald-400">developers don&apos;t forget.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed font-normal">
            You solve problems once. Synaptic decay erases 80% within three weeks. CodeRecall calculates the exact day a pattern is about to decay and serves a 4-minute active recall drill.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4 font-mono text-xs">
            <Link
              href={user ? '/app/dashboard' : '/signup'}
              className="px-6 py-3.5 rounded-sm bg-neutral-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xl flex items-center gap-2 group"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
              <span>{user ? 'Open Your Workbench' : 'GET ACCESS'}</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400 dark:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {!user && (
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-white/15 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/30 transition-all uppercase tracking-wider font-semibold shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Concentric Ring Canvas */}
        <div className="lg:col-span-6 flex items-center justify-center relative">
          <ConcentricRingCanvas />
        </div>
      </div>
    </section>
  );
}
