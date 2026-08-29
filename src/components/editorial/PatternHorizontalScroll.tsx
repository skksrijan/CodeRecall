'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PATTERNS = [
  {
    num: '01',
    title: 'Two Pointers & Sliding Window',
    problems: '38 Solved',
    retention: '98%',
    lastRecall: '2d ago',
    mastery: 'MASTERED',
    examples: ['#011 Container With Most Water', '#042 Trapping Rain Water', '#003 Longest Substring Without Repeating'],
  },
  {
    num: '02',
    title: 'Monotonic Stack & Queue',
    problems: '24 Solved',
    retention: '94%',
    lastRecall: '4d ago',
    mastery: 'MASTERED',
    examples: ['#739 Daily Temperatures', '#084 Largest Rectangle in Histogram', '#239 Sliding Window Maximum'],
  },
  {
    num: '03',
    title: 'Binary Search On Answer',
    problems: '31 Solved',
    retention: '96%',
    lastRecall: '1d ago',
    mastery: 'MASTERED',
    examples: ['#875 Koko Eating Bananas', '#410 Split Array Largest Sum', '#033 Search in Rotated Sorted Array'],
  },
  {
    num: '04',
    title: 'Dynamic Programming & Memo',
    problems: '52 Solved',
    retention: '92%',
    lastRecall: '5d ago',
    mastery: 'REVIEW DUE',
    examples: ['#198 House Robber', '#322 Coin Change', '#300 Longest Increasing Subsequence'],
  },
  {
    num: '05',
    title: 'Graph BFS / DFS & Topological',
    problems: '41 Solved',
    retention: '95%',
    lastRecall: '3d ago',
    mastery: 'MASTERED',
    examples: ['#200 Number of Islands', '#207 Course Schedule', '#127 Word Ladder'],
  },
  {
    num: '06',
    title: 'Tree Serialization & Traversal',
    problems: '29 Solved',
    retention: '97%',
    lastRecall: '2d ago',
    mastery: 'MASTERED',
    examples: ['#124 Binary Tree Maximum Path Sum', '#297 Serialize and Deserialize Binary Tree', '#236 Lowest Common Ancestor'],
  },
  {
    num: '07',
    title: 'Union-Find & Disjoint Sets',
    problems: '18 Solved',
    retention: '93%',
    lastRecall: '6d ago',
    mastery: 'MASTERED',
    examples: ['#684 Redundant Connection', '#547 Number of Provinces', '#721 Accounts Merge'],
  },
  {
    num: '08',
    title: 'Heap / Priority Queue & Top-K',
    problems: '22 Solved',
    retention: '96%',
    lastRecall: '1d ago',
    mastery: 'MASTERED',
    examples: ['#347 Top K Frequent Elements', '#295 Find Median from Data Stream', '#373 Find K Pairs with Smallest Sums'],
  },
];

export default function PatternHorizontalScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Delay initialization slightly to allow DOM layout & fonts to measure accurately
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.innerWidth < 768;
        if (isReduced || isMobile) return;

        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;

        const getScrollDistance = () => {
          return track.scrollWidth - window.innerWidth + 140;
        };

        const tween = gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${getScrollDistance() * 1.2}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // Trigger refresh
        ScrollTrigger.refresh();

        return () => {
          tween.kill();
        };
      }, sectionRef);

      return () => ctx.revert();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="patterns"
      ref={sectionRef}
      className="min-h-screen relative flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f4f5f7] dark:bg-[#0a0c10] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Header & Controls */}
      <div className="max-w-7xl w-full mx-auto mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Moving through your algorithmic memory.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-mono mt-1">
            Every pattern tracks problem count, last recall timestamp, and verified retention percentage.
          </p>
        </div>

        {/* Quick Horizontal Nav Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={scrollLeft}
            className="p-2.5 rounded border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/30 transition-all shadow-xs"
            aria-label="Scroll patterns left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2.5 rounded border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/30 transition-all shadow-xs"
            aria-label="Scroll patterns right"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Track Container */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-hidden no-scrollbar py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div ref={trackRef} className="flex gap-6 pl-2 sm:pl-4 select-none w-max">
          {PATTERNS.map((p) => (
            <div
              key={p.num}
              className="w-80 sm:w-96 tech-card rounded-lg p-6 space-y-6 shrink-0 shadow-2xl font-mono text-xs flex flex-col justify-between border border-neutral-200 dark:border-white/10 hover:border-emerald-500/40 transition-colors group bg-white dark:bg-[#08090b]"
            >
              <div className="flex justify-between items-start border-b border-neutral-200 dark:border-white/10 pb-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{p.num}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {p.mastery}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-sans">
                  {p.title}
                </h3>
                <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400 text-[11px] mt-2">
                  <span>{p.problems}</span>
                  <span>&bull;</span>
                  <span>Last Drill: {p.lastRecall}</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-neutral-100 dark:bg-[#07080a] p-3 rounded border border-neutral-200 dark:border-white/10 text-[11px]">
                <div className="text-neutral-500 uppercase text-[10px]">Canonical Patterns:</div>
                {p.examples.map((ex) => (
                  <div key={ex} className="text-neutral-700 dark:text-neutral-300 truncate">
                    &bull; {ex}
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 dark:border-white/10 pt-3 flex items-center justify-between">
                <span className="text-neutral-500">RETENTION:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{p.retention}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
