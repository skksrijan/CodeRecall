'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-5 right-5 z-40 p-2.5 rounded-sm bg-white/95 text-neutral-900 border border-neutral-300 shadow-xl dark:bg-[#0b0d12]/95 dark:text-white dark:border-white/20 dark:shadow-2xl backdrop-blur-md hover:bg-neutral-100 dark:hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider group animate-in fade-in slide-in-from-bottom-2"
      aria-label="Back to top"
      title="Scroll back to top"
    >
      <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
      <span className="hidden sm:inline">TOP</span>
    </button>
  );
}
