'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) return;

      const track = trackRef.current;
      if (!track) return;

      const totalScroll = track.scrollWidth - window.innerWidth + 120;

      gsap.to(track, {
        x: () => -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalScroll * 1.2}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="patterns"
      ref={sectionRef}
      className="min-h-screen relative flex flex-col justify-between py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f4f5f7] dark:bg-[#0a0c10] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Header Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">005</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">THE PATTERNS YOU KEEP</span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          HORIZONTAL MEMORY CATALOG [SCROLL VERTICALLY TO NAVIGATE]
        </div>
      </div>

      {/* Horizontal Scrolling Track */}
      <div className="w-full my-auto py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Moving through your algorithmic memory.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-mono mt-1">
            Every pattern tracks problem count, last recall timestamp, and verified retention percentage.
          </p>
        </div>

        <div ref={trackRef} className="flex gap-6 pl-4 sm:pl-8 select-none w-max">
          {PATTERNS.map((p) => (
            <div
              key={p.num}
              className="w-80 sm:w-96 tech-card rounded-lg p-6 space-y-6 shrink-0 shadow-2xl font-mono text-xs flex flex-col justify-between border-neutral-200 dark:border-white/10 hover:border-emerald-500/40 transition-colors group"
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

      {/* Bottom marker */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex justify-between">
        <span>005 / PINNED HORIZONTAL PATTERN STREAM</span>
        <span>SCROLL FOR 006 / PRODUCT WORKBENCH &darr;</span>
      </div>
    </section>
  );
}
