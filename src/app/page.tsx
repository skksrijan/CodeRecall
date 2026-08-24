'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import {
  Brain,
  Zap,
  Clock,
  Code2,
  Layers,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Flame,
  ShieldCheck,
  ChevronDown,
  Terminal,
  PlayCircle,
  TrendingUp,
  Moon,
  Sun,
  Laptop,
  Check,
  Repeat,
  Compass,
  Cpu,
  Star
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoRating, setDemoRating] = useState<number>(4);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary selection:text-white relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-primary/15 via-secondary/15 to-transparent blur-3xl opacity-70 dark:opacity-40 rounded-full" />
        <div className="absolute top-[35%] -right-40 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full" />
        <div className="absolute top-[65%] -left-40 w-[600px] h-[600px] bg-secondary/10 blur-[140px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/70 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-secondary">
              CodeRecall
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-text">
            <a href="#features" className="hover:text-text transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-text transition-colors">How It Works</a>
            <a href="#spaced-repetition" className="hover:text-text transition-colors">The Science</a>
            <a href="#faq" className="hover:text-text transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-muted-text hover:text-text hover:bg-surface border border-transparent hover:border-border transition-all active:scale-95"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {user ? (
              <Link
                href="/app/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/25 hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-muted-text hover:text-text hover:bg-surface transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/25 hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        {/* Release / Highlight Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary mb-8 animate-fade-in shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>SM-2 Adaptive Spaced Repetition for LeetCode</span>
          <span className="hidden sm:inline text-muted-text">•</span>
          <span className="hidden sm:inline text-text/80 font-normal">Ace your technical interviews</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6 text-balance">
          Never Forget a{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-secondary">
            Coding Pattern
          </span>{' '}
          Again.
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-muted-text max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
          Stop grinding 500+ LeetCode problems blindly. CodeRecall schedules reviews at the exact mathematical moment before you forget them — cutting prep time in half with permanent retention.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href={user ? "/app/dashboard" : "/signup"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/30 hover:shadow-primary/45 hover:scale-[1.03] active:scale-[0.98] transition-all group"
          >
            <span>{user ? "Go to Your Dashboard" : "Get Started for Free"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base bg-surface/80 hover:bg-surface border border-border text-text hover:border-primary/40 transition-all shadow-sm"
          >
            <PlayCircle className="w-4 h-4 text-primary" />
            <span>See How It Works</span>
          </a>
        </div>

        {/* Feature Pills under CTA */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-muted-text font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>100% Free & Open</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>1-Click LeetCode & Study Plan Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No Credit Card Required</span>
          </div>
        </div>

        {/* Hero Interactive App Window Mockup */}
        <div className="mt-14 sm:mt-18 relative mx-auto max-w-5xl text-left">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 via-indigo-500/20 to-secondary/30 blur-xl opacity-70 -z-10" />
          
          <div className="rounded-2xl border border-border/80 bg-surface/90 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border text-xs text-muted-text select-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-muted-text/80 hidden sm:inline">coderecall.app / study / session</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                  <Repeat className="w-3 h-3" /> Due for Recall
                </span>
                <span className="font-mono text-primary font-bold">14:22 elapsed</span>
              </div>
            </div>

            {/* Mock Study Session Body */}
            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Problem & Hints */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20">Medium</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">Two Pointers</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary/10 text-secondary border border-secondary/20">Dynamic Programming</span>
                  <span className="text-xs text-muted-text ml-auto font-mono">LC #11</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-text">Container With Most Water</h3>
                  <p className="text-sm text-muted-text mt-2 leading-relaxed">
                    You are given an integer array <code className="bg-background/80 px-1 py-0.5 rounded font-mono text-xs text-primary">height</code> of length <code className="bg-background/80 px-1 py-0.5 rounded font-mono text-xs">n</code>. Find two lines that together with the x-axis form a container, such that the container contains the most water.
                  </p>
                </div>

                {/* Solution Code Preview */}
                <div className="rounded-xl bg-background border border-border/80 p-4 font-mono text-xs sm:text-[13px] overflow-x-auto space-y-1 shadow-inner">
                  <div className="text-muted-text/60">{`// Optimal O(n) Two Pointers Approach`}</div>
                  <div><span className="text-indigo-400">function</span> <span className="text-emerald-400">maxArea</span>(<span className="text-amber-300">height</span>: <span className="text-cyan-400">number[]</span>): <span className="text-cyan-400">number</span> &#123;</div>
                  <div className="pl-4"><span className="text-indigo-400">let</span> left = <span className="text-amber-300">0</span>, right = height.length - <span className="text-amber-300">1</span>, max = <span className="text-amber-300">0</span>;</div>
                  <div className="pl-4"><span className="text-indigo-400">while</span> (left &lt; right) &#123;</div>
                  <div className="pl-8"><span className="text-indigo-400">const</span> current = Math.min(height[left], height[right]) * (right - left);</div>
                  <div className="pl-8">max = Math.max(max, current);</div>
                  <div className="pl-8">height[left] &lt; height[right] ? left++ : right--;</div>
                  <div className="pl-4">&#125;</div>
                  <div className="pl-4"><span className="text-indigo-400">return</span> max;</div>
                  <div>&#125;</div>
                </div>
              </div>

              {/* Right Column: SM-2 Calibration Widget */}
              <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-background/50 border border-border space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-text">SM-2 Spaced Repetition</span>
                    <span className="text-xs font-mono font-bold text-emerald-500">Ease Factor: 2.50</span>
                  </div>
                  <h4 className="text-sm font-bold text-text">How well did you recall this pattern?</h4>
                  <p className="text-xs text-muted-text mt-1">Select your rating to calculate the next optimal review interval:</p>
                </div>

                {/* Rating Selector Interactive Demo */}
                <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setDemoRating(grade)}
                      className={`p-2 rounded-lg text-center transition-all border ${
                        demoRating === grade
                          ? 'bg-primary text-white border-primary shadow-md shadow-primary/30 scale-105'
                          : 'bg-surface hover:bg-surface/80 border-border text-muted-text hover:text-text'
                      }`}
                    >
                      <div className="text-xs font-bold">{grade}</div>
                      <div className="text-[9px] font-mono mt-0.5 opacity-80">
                        {grade === 0 && 'Blank'}
                        {grade === 1 && 'Failed'}
                        {grade === 2 && 'Hard'}
                        {grade === 3 && 'Pass'}
                        {grade === 4 && 'Good'}
                        {grade === 5 && 'Perfect'}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Dynamic Outcome Preview */}
                <div className="p-3 rounded-lg bg-surface border border-border text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-muted-text">
                    <span>Next Review Date:</span>
                    <span className="font-bold text-text">
                      {demoRating < 3 ? 'Today (Reset to Interval 1)' : demoRating === 3 ? 'In 3 Days' : demoRating === 4 ? 'In 6 Days' : 'In 12 Days'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-text">
                    <span>Algorithm Action:</span>
                    <span className={`font-semibold ${demoRating >= 3 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {demoRating >= 3 ? 'Retained (Interval Multiplied)' : 'Pattern Forgotten (Recalibrating)'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-center text-muted-text">
                  ⚡ Calculates personalized recall curves tailored to your speed and accuracy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Solution Section */}
      <section className="py-20 border-y border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Why Traditional LeetCoding Fails</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
              The Forgetting Curve is Killing Your Interview Prep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface/60 border border-rose-500/20 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <span className="text-xl font-bold">✕</span>
              </div>
              <h3 className="text-xl font-bold text-text mb-3">The Traditional LeetCode Grind</h3>
              <ul className="space-y-3.5 text-sm text-muted-text">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Solve 300+ problems, but forget 80% of solutions after 3 weeks.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>No system to track what to review when — leading to blind guessing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Interview anxiety: &ldquo;I solved this problem months ago, why can&apos;t I write it now?&rdquo;</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Massive burnout from cramming right before technical loops.</span>
                </li>
              </ul>
            </div>

            {/* The CodeRecall Way */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface/60 border border-emerald-500/30 relative overflow-hidden shadow-lg shadow-emerald-500/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">The CodeRecall Method</h3>
              <ul className="space-y-3.5 text-sm text-muted-text">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong className="text-text">SM-2 Spaced Repetition</strong> prompts reviews right when neural pathways begin to decay.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong className="text-text">95%+ Long-Term Recall</strong> with only 15–20 minutes of targeted daily practice.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong className="text-text">Paced Intake Queue</strong> guarantees you never get overwhelmed with infinite backlogs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Walk into FAANG/startup interviews knowing every key pattern by reflex.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Built for Modern Software Engineers</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text mb-4">
            Everything You Need to Master DSA
          </h2>
          <p className="text-base sm:text-lg text-muted-text">
            Engineered from the ground up for high-efficiency algorithm mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">1-Click LeetCode Import</h3>
            <p className="text-sm text-muted-text leading-relaxed">
              Import study plans like Blind 75, NeetCode 150, Top Interview 150, or custom URLs. Problem descriptions, examples, and tags are fetched automatically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">SM-2 Spaced Repetition Engine</h3>
            <p className="text-sm text-muted-text leading-relaxed">
              Proven SuperMemo SM-2 algorithm calculates personalized review intervals based on problem difficulty, elapsed time, and confidence ratings.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Paced Timer & Suggested Ratings</h3>
            <p className="text-sm text-muted-text leading-relaxed">
              Active timer with visual threshold alerts based on problem difficulty. Suggests objective self-grades so you stay honest and never overestimate recall.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Custom Decks & Multi-Tag Taxonomy</h3>
            <p className="text-sm text-muted-text leading-relaxed">
              Categorize problems into custom decks (e.g. &ldquo;Google System Design&rdquo;, &ldquo;Dynamic Programming&rdquo;) and filter instantly by company, pattern, or review state.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Upcoming Load & Retention Stats</h3>
            <p className="text-sm text-muted-text leading-relaxed">
              Visual 7-day upcoming review load projections, retention curve tracking, and breakdown of review cards vs new problem discovery.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Burnout Prevention & Queue Pacing</h3>
            <p className="text-sm text-muted-text leading-relaxed">
              Reviews always take priority over new problems. Set daily new intake limits or pause new questions entirely to clear review backlogs with ease.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (3 Simple Steps) */}
      <section id="how-it-works" className="py-20 border-t border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Simple 3-Step Workflow</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
              How CodeRecall Supercharges Your Preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border relative">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mb-5 shadow-md shadow-primary/20">
                1
              </div>
              <h3 className="text-lg font-bold text-text mb-2">Import Your Target Problems</h3>
              <p className="text-sm text-muted-text leading-relaxed">
                Paste any LeetCode problem or study plan URL. Choose your familiarity (New, Mixed, or Studied) to initialize your custom deck.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border relative">
              <div className="w-10 h-10 rounded-full bg-secondary text-white font-bold flex items-center justify-center mb-5 shadow-md shadow-secondary/20">
                2
              </div>
              <h3 className="text-lg font-bold text-text mb-2">Solve in Focused Study Mode</h3>
              <p className="text-sm text-muted-text leading-relaxed">
                Work through your daily queue with an integrated timer, scratchpad code editor, and progressive hint revealers.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mb-5 shadow-md shadow-emerald-500/20">
                3
              </div>
              <h3 className="text-lg font-bold text-text mb-2">Rate & Forget the Scheduling</h3>
              <p className="text-sm text-muted-text leading-relaxed">
                Provide a quick rating after solving. The algorithm dynamically schedules the next review right before the pattern slips from memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Science / Algorithm Deep-Dive */}
      <section id="spaced-repetition" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-surface via-surface/90 to-background border border-border/80 p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                <Brain className="w-3.5 h-3.5" />
                <span>Cognitive Science & SM-2</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
                Backed by 130+ Years of Memory Science
              </h2>
              <p className="text-base text-muted-text leading-relaxed">
                Hermann Ebbinghaus discovered that humans forget up to 80% of newly learned information within 48 hours unless it is actively reinforced.
              </p>
              <p className="text-base text-muted-text leading-relaxed">
                CodeRecall implements the <strong>SuperMemo SM-2 algorithm</strong>, which computes an individual <code className="bg-background px-1.5 py-0.5 rounded text-xs font-mono text-primary">Ease Factor</code> and exponential review intervals for each coding problem. Every successful review expands the interval (e.g. 1 day &rarr; 6 days &rarr; 16 days &rarr; 40 days), converting short-term recognition into deep algorithmic intuition.
              </p>
              <div className="pt-2">
                <Link
                  href={user ? "/app/dashboard" : "/signup"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  Start Mastering Patterns Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Retention Comparison Visualizer */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-background border border-border space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-text">Without Spaced Repetition</span>
                  <span className="text-rose-500 font-mono">18% Retention @ 30 days</span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface border border-border overflow-hidden">
                  <div className="h-full bg-rose-500/80 rounded-full transition-all duration-1000" style={{ width: '18%' }} />
                </div>
                <p className="text-[11px] text-muted-text">Most solutions are forgotten and have to be relearned from scratch.</p>
              </div>

              <div className="p-5 rounded-2xl bg-background border border-emerald-500/30 space-y-3 shadow-lg shadow-emerald-500/5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-text">With CodeRecall SM-2</span>
                  <span className="text-emerald-500 font-mono">96% Retention @ 30 days</span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface border border-border overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '96%' }} />
                </div>
                <p className="text-[11px] text-muted-text">Intervals compound automatically so patterns remain crystal clear on interview day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Got Questions?</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Is CodeRecall completely free?",
              a: "Yes! CodeRecall is free to use. You can create unlimited decks, import study plans, and run spaced repetition study queues without any subscription or payment."
            },
            {
              q: "How does the LeetCode import work?",
              a: "You can import problem lists by pasting either the URL of a study plan (e.g. NeetCode 150, Blind 75), a LeetCode problem list URL, or individual problem links. CodeRecall fetches the title, description, difficulty, examples, and tags automatically."
            },
            {
              q: "What if I miss a day or fall behind on reviews?",
              a: "No stress! CodeRecall prioritizes overdue reviews first and allows you to set your Daily New Question Limit to 0 in Settings so you can comfortably clear your backlog without new cards piling up."
            },
            {
              q: "Can I use CodeRecall alongside my usual code editor or LeetCode?",
              a: "Absolutely. You can write your solution inside CodeRecall's embedded editor, or solve directly on LeetCode and use CodeRecall to record your interval rating and notes."
            },
            {
              q: "How are the review intervals calculated?",
              a: "CodeRecall implements the SM-2 algorithm. When you rate a problem (0 to 5), the algorithm calculates an updated Ease Factor and schedules the next review date (e.g., 1 day for first review, 6 days for second review, and compounding intervals thereafter based on your ease factor)."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-surface overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between font-semibold text-text hover:text-primary transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-text shrink-0 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180 text-primary' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-muted-text leading-relaxed border-t border-border/50 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-primary via-indigo-600 to-secondary p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
            Ready to Ace Your Next Tech Interview?
          </h2>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 relative z-10 leading-relaxed">
            Join engineers using CodeRecall to master algorithmic problem solving with permanent retention and zero burnout.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? "/app/dashboard" : "/signup"}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base bg-white text-gray-900 shadow-xl hover:bg-white/90 hover:scale-105 active:scale-95 transition-all"
            >
              {user ? "Open Dashboard" : "Get Started for Free — It's Free"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-surface/50 text-xs text-muted-text">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-text">CodeRecall</span>
            <span>— Spaced Repetition for LeetCode</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/login" className="hover:text-text transition-colors">Log In</Link>
            <Link href="/signup" className="hover:text-text transition-colors">Sign Up</Link>
            <a href="https://github.com/skksrijan/CodeRecall" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
