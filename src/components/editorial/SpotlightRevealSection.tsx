'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ArrowUpRight } from 'lucide-react';

const DENSE_BACKGROUND_CODE_MATRIX = `
// REPO ENGINE: SM-2 STATE TRANSFORMATION MATRIX // TAXONOMY: 150+ PATTERNS
export const INTERVAL_EXPANSIONS = [1, 6, 16, 40, 90, 180]; // EXPONENTIAL SCALE
const TWO_POINTERS = { id: '#011', name: 'Container With Most Water', O_time: 'O(N)', O_space: 'O(1)' };
const MONOTONIC_STACK = { id: '#042', name: 'Trapping Rain Water', O_time: 'O(N)', O_space: 'O(N)' };
const SLIDING_WINDOW = { id: '#003', name: 'Longest Substring Without Repeating', O_time: 'O(N)', O_space: 'O(K)' };
const BINARY_SEARCH_ANS = { id: '#875', name: 'Koko Eating Bananas', O_time: 'O(N log M)', O_space: 'O(1)' };
const DYNAMIC_PROGRAMMING = { id: '#322', name: 'Coin Change', O_time: 'O(N*amount)', O_space: 'O(amount)' };
const TREE_DFS_BFS = { id: '#124', name: 'Binary Tree Maximum Path Sum', O_time: 'O(N)', O_space: 'O(H)' };
const UNION_FIND_DSU = { id: '#684', name: 'Redundant Connection', O_time: 'O(N α(N))', O_space: 'O(N)' };
const TOP_K_HEAP = { id: '#347', name: 'Top K Frequent Elements', O_time: 'O(N log K)', O_space: 'O(N)' };
// INTERVAL COMPACTION: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02));
// INGESTION ENGINE: MONACO LOCAL SANDBOX • ZERO NETWORK ROUNDTRIP • STRICT 15M PACING
// RECALL VERIFIED: 96.8% RETENTION AVERAGE AT 30 DAYS • DAY 1 -> DAY 6 -> DAY 16 -> DAY 40 -> DAY 90
// NO ENDLESS RE-SOLVING • JUST THE RIGHT PATTERN AT THE EXACT RIGHT TIME
export function calculateNextReview(interval: number, ef: number, quality: number): number {
  if (quality < 3) return 1; // RESET ON BLACKOUT
  if (interval === 0) return 1;
  if (interval === 1) return 6;
  return Math.round(interval * ef);
}
// INDEXEDDB OFFLINE REPLICATION MATRIX: SYNC STATE DETERMINISTIC
// COMMITTED DECISIONS ARE WHY DEVELOPERS NEVER BLANK OUT IN INTERVIEWS
`.repeat(6);

export default function SpotlightRevealSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 400, y: 300 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <section
      id="spotlight"
      ref={sectionRef}
      onMouseMove={isDark ? handleMouseMove : undefined}
      onMouseEnter={isDark ? () => setIsHovering(true) : undefined}
      onMouseLeave={isDark ? () => setIsHovering(false) : undefined}
      className={`min-h-[85vh] relative flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa] dark:bg-[#050608] text-neutral-900 dark:text-white overflow-hidden border-b border-neutral-200 dark:border-white/10 transition-colors duration-300 ${
        isDark ? 'select-none' : 'bg-tech-grid'
      }`}
    >
      {/* Dark Mode Background Matrix + Spotlight Mask (Dark Mode Only) */}
      {isDark && (
        <>
          {/* Base Layer: Dim background matrix */}
          <div className="absolute inset-0 p-6 sm:p-12 font-mono text-[11px] sm:text-xs text-neutral-800 leading-relaxed overflow-hidden pointer-events-none break-all whitespace-pre-wrap select-none opacity-80">
            {DENSE_BACKGROUND_CODE_MATRIX}
          </div>

          {/* Spotlight Mask Layer */}
          <div
            className="absolute inset-0 p-6 sm:p-12 font-mono text-[11px] sm:text-xs text-emerald-400 font-bold leading-relaxed overflow-hidden pointer-events-none break-all whitespace-pre-wrap select-none transition-opacity duration-200"
            style={{
              maskImage: isTouchDevice
                ? 'radial-gradient(circle 240px at 50% 50%, black 0%, transparent 100%)'
                : `radial-gradient(circle 220px at ${mousePos.x}px ${mousePos.y}px, black 15%, transparent 100%)`,
              WebkitMaskImage: isTouchDevice
                ? 'radial-gradient(circle 240px at 50% 50%, black 0%, transparent 100%)'
                : `radial-gradient(circle 220px at ${mousePos.x}px ${mousePos.y}px, black 15%, transparent 100%)`,
            }}
          >
            {DENSE_BACKGROUND_CODE_MATRIX}
          </div>
        </>
      )}

      {/* Main Big Editorial Statement */}
      <div className="max-w-5xl w-full mx-auto my-auto relative z-10 space-y-8">
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.04]">
          Every pattern already indexed. <br />
          <span className="text-emerald-600 dark:text-emerald-400">So you can skip to the actual retention.</span>
        </h2>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed font-normal">
          The mathematical foundation under your interview prep: 150+ canonical problem structures, SM-2 decay calculations, scratchpad execution, and review queues — built once and committed. 
        </p>

        <div className="pt-2 flex flex-wrap gap-4 font-mono text-xs">
          <Link
            href="/signup"
            className="px-6 py-3.5 rounded-sm bg-neutral-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 group shadow-xl"
          >
            <span>Initialize Your Deck</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400 dark:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
