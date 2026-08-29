'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, ArrowUpRight } from 'lucide-react';

const FAQS = [
  {
    num: 'Q.001',
    question: 'How does CodeRecall calculate when a problem is due for review?',
    answer:
      'We use the SuperMemo SM-2 algorithm. Each recall drill you perform modifies your Ease Factor (EF, starting at 2.50) based on your self-reported retrieval score and latency. Subsequent review intervals expand exponentially (1d → 6d → 16d → 40d → 90d).',
  },
  {
    num: 'Q.002',
    question: 'How is this different from traditional flashcard apps like Anki?',
    answer:
      'CodeRecall is tailored specifically for software engineers and DSA problems. It integrates an in-browser Monaco IDE scratchpad with automated code verification, test cases, and algorithmic pattern taxonomies rather than simple front/back text cards.',
  },
  {
    num: 'Q.003',
    question: 'How much time do I need to spend on CodeRecall each day?',
    answer:
      'Our queue batching algorithm is tuned for high retention with a strict daily target of under 15 minutes (typically 3–4 targeted active recall drills per day).',
  },
  {
    num: 'Q.004',
    question: 'What happens if I fail a recall drill?',
    answer:
      'If your recall score is 0 or 1, the SM-2 engine detects synaptic decay and resets the problem interval back to Day 1, scheduling an immediate review drill within 24 hours to re-anchor the pattern.',
  },
];

export default function NumberedFaqSection() {
  const [openIdx, setOpenIdx] = useState<string | null>('Q.001');

  const toggle = (num: string) => {
    setOpenIdx(openIdx === num ? null : num);
  };

  return (
    <section
      id="faq"
      className="min-h-screen relative flex flex-col justify-between py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 dark:border-white/10 bg-[#f4f5f7] dark:bg-[#0a0c10] text-neutral-900 dark:text-neutral-100 bg-tech-grid overflow-hidden transition-colors"
    >
      {/* Top Header Index */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">006</span>
          <span className="text-neutral-400 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-white uppercase tracking-wider font-bold">FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <div className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          NUMBERED TECHNICAL SPECIFICATION
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Architecture and methodology.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed">
            Concise answers on memory curves, time commitments, and LeetCode intake mechanics.
          </p>
        </div>

        {/* Numbered Accordion */}
        <div className="space-y-3 font-mono text-xs">
          {FAQS.map((faq) => {
            const isOpen = openIdx === faq.num;
            return (
              <div
                key={faq.num}
                className="tech-card rounded-lg overflow-hidden border border-neutral-200 dark:border-white/10 shadow-xs transition-colors"
              >
                <button
                  onClick={() => toggle(faq.num)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{faq.num}</span>
                    <span className="text-neutral-900 dark:text-white font-bold text-sm sm:text-base font-sans">
                      {faq.question}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-neutral-200 dark:border-white/10 font-sans text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2 animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 pt-2 flex items-center justify-between">
                      <span>&bull; SPEC_REF: {faq.num}.01_VERIFIED</span>
                      <Link
                        href="/app/settings"
                        className="hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>View Mathematical Derivation</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom marker */}
      <div className="max-w-7xl w-full mx-auto border-t border-neutral-200 dark:border-white/10 pt-3 font-mono text-[11px] text-neutral-500 flex justify-between">
        <span>006 / SPECIFICATION VERIFICATION</span>
        <span>SCROLL FOR 007 / FINAL DIRECTIVE &darr;</span>
      </div>
    </section>
  );
}
