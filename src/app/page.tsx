'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { Moon, Sun } from 'lucide-react';

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

  const ratingIntervals: Record<number, { label: string; interval: string; action: string; badgeColor: string }> = {
    0: { label: 'Blackout', interval: 'Reset to Today', action: 'Complete Memory Lapse (Interval reset to 1d)', badgeColor: 'text-danger bg-danger/10 border-danger/30' },
    1: { label: 'Failed', interval: 'Review Today', action: 'Incorrect Recall (Ease factor decreased)', badgeColor: 'text-danger bg-danger/10 border-danger/30' },
    2: { label: 'Lapsed', interval: 'In 1 Day', action: 'Struggled Recall (Interval set to 1d)', badgeColor: 'text-warning bg-warning/10 border-warning/30' },
    3: { label: 'Hard', interval: 'In 3 Days', action: 'Retained with effort (Interval scaled by 1.2x)', badgeColor: 'text-warning bg-warning/10 border-warning/30' },
    4: { label: 'Good', interval: 'In 6 Days', action: 'Solid Recall (Interval compounded by Ease Factor)', badgeColor: 'text-success bg-success/10 border-success/30' },
    5: { label: 'Perfect', interval: 'In 14 Days', action: 'Effortless Reflex (Interval maximized, Ease Factor +0.1)', badgeColor: 'text-success bg-success/10 border-success/30' },
  };

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-text text-background flex items-center justify-center font-bold font-mono text-sm shadow-sm">
              CR
            </div>
            <span className="text-base font-bold tracking-tight text-text font-mono">
              CodeRecall
            </span>
            <span className="font-mono text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              SM-2
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-7 text-xs font-mono uppercase tracking-wider text-muted-text">
            <a href="#features" className="hover:text-text transition-colors">Features</a>
            <a href="#spaced-repetition" className="hover:text-text transition-colors">The Science</a>
            <a href="#how-it-works" className="hover:text-text transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-text transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3 font-mono">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-muted-text hover:text-text hover:bg-background border border-border transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {user ? (
              <Link
                href="/app/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-text text-background hover:opacity-90 transition-opacity shadow-sm uppercase tracking-wider"
              >
                Dashboard -&gt;
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-muted-text hover:text-text hover:bg-surface transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:opacity-90 transition-opacity shadow-sm uppercase tracking-wider"
                >
                  Start Free -&gt;
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Technical Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-primary/10 border border-primary/20 text-primary mb-8">
          <span>[SYSTEM: SM-2 ACTIVE RECALL FOR LEETCODE &amp; CODING INTERVIEWS]</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6 text-balance text-text">
          The Forgetting Curve is Predictable.{' '}
          <span className="text-primary underline decoration-primary/40 underline-offset-8">
            Your Retention Should Be Too.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-muted-text max-w-2xl mx-auto mb-10 leading-relaxed text-balance font-normal">
          Stop grinding 400+ LeetCode problems blindly. CodeRecall schedules reviews at the exact mathematical inflection point before neural decay sets in — cutting prep time in half with permanent pattern mastery.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12 font-mono">
          <Link
            href={user ? "/app/dashboard" : "/signup"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-text text-background hover:opacity-90 transition-opacity shadow-sm uppercase tracking-wider"
          >
            <span>{user ? "Open Workbench ->" : "Start Practicing Free ->"}</span>
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm bg-surface hover:bg-background border border-border text-text transition-colors uppercase tracking-wider"
          >
            <span>[ See Workflow ]</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-muted-text font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-success font-bold">[✓]</span>
            <span>100% Free &amp; Open System</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-success font-bold">[✓]</span>
            <span>1-Click Blind 75 / NeetCode Import</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-success font-bold">[✓]</span>
            <span>Zero Credit Card Required</span>
          </div>
        </div>

        {/* Interactive SM-2 Simulator / Card Workbench Preview */}
        <div className="mt-14 text-left border border-border rounded-xl bg-surface shadow-2xl overflow-hidden">
          {/* Card Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-background border-b border-border text-xs font-mono text-muted-text">
            <div className="flex items-center gap-2">
              <span className="text-muted-text">[WORKSPACE]</span>
              <span className="font-medium text-text">coderecall.workbench / active_drill</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-warning/10 text-warning border border-warning/20">
                [DUE FOR RECALL]
              </span>
              <span className="font-mono text-text">04:18 elapsed</span>
            </div>
          </div>

          {/* Workbench Body */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Problem & Canonical Code */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-warning/10 text-warning border border-warning/20">
                  MEDIUM
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-background border border-border text-muted-text">
                  #Two Pointers
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-background border border-border text-muted-text">
                  #Array
                </span>
                <span className="text-xs font-mono text-muted-text ml-auto">LC #11</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-text">Container With Most Water</h3>
                <p className="text-xs text-muted-text mt-1 leading-relaxed">
                  Given an array <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">height</code> of length <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">n</code>, find two lines that form a container containing the maximum water.
                </p>
              </div>

              {/* Solution Code Snippet */}
              <div className="rounded-lg bg-[#0D1117] border border-border/80 p-3.5 font-mono text-xs text-slate-200 overflow-x-auto space-y-0.5">
                <div className="text-slate-500">{`// Canonical O(N) Two Pointers Solution`}</div>
                <div><span className="text-sky-400">function</span> <span className="text-emerald-400">maxArea</span>(<span className="text-amber-300">height</span>: <span className="text-sky-300">number[]</span>): <span className="text-sky-300">number</span> &#123;</div>
                <div className="pl-4"><span className="text-sky-400">let</span> l = <span className="text-amber-300">0</span>, r = height.length - <span className="text-amber-300">1</span>, max = <span className="text-amber-300">0</span>;</div>
                <div className="pl-4"><span className="text-sky-400">while</span> (l &lt; r) &#123;</div>
                <div className="pl-8">max = Math.max(max, Math.min(height[l], height[r]) * (r - l));</div>
                <div className="pl-8">height[l] &lt; height[r] ? l++ : r--;</div>
                <div className="pl-4">&#125;</div>
                <div className="pl-4"><span className="text-sky-400">return</span> max;</div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Right Column: SM-2 Calibration & Predictive Output */}
            <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-lg bg-background border border-border space-y-4 font-mono">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">
                    [SM-2 INTERVAL PREDICTOR]
                  </span>
                  <span className="text-[11px] font-bold text-primary">EF: 2.50</span>
                </div>
                <h4 className="text-xs font-bold text-text">How well did you recall this pattern?</h4>
                <p className="text-[11px] text-muted-text mt-0.5">
                  Click a rating to preview the dynamic mathematically scheduled review date:
                </p>
              </div>

              {/* Rating Selector */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((grade) => {
                  const isSelected = demoRating === grade;
                  const item = ratingIntervals[grade];
                  return (
                    <button
                      key={grade}
                      onClick={() => setDemoRating(grade)}
                      className={`p-2 rounded-md text-center transition-all border ${
                        isSelected
                          ? 'bg-text text-background font-bold border-text shadow-sm'
                          : 'bg-surface hover:bg-background border-border text-muted-text hover:text-text'
                      }`}
                    >
                      <div className="text-xs font-bold">{grade}</div>
                      <div className="text-[9px] mt-0.5 truncate">{item.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Math Outcome */}
              <div className="p-3 rounded-lg bg-surface border border-border text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-text text-[11px]">Next Scheduled Date:</span>
                  <span className="font-bold text-text text-xs">{ratingIntervals[demoRating].interval}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-text">Algorithm Action:</span>
                  <span className="font-semibold text-text">{ratingIntervals[demoRating].action}</span>
                </div>
              </div>

              <div className="text-[10px] text-center text-muted-text">
                Formula: I(n) = I(n-1) × EF • Exponential consolidation curve
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Solution Section */}
      <section className="py-20 border-y border-border bg-surface/50 font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              [ANALYSIS: WHY TRADITIONAL GRINDING FAILS]
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-sans">
              The Ebbinghaus Forgetting Curve Decays 80% of Unreviewed Problems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* The Old Way */}
            <div className="p-6 rounded-xl bg-background border border-border space-y-3">
              <div className="font-mono text-xs font-bold text-danger">[ ✕ BRUTE FORCE GRIND ]</div>
              <h3 className="text-base font-bold text-text font-sans">Solve Once, Forget Fast</h3>
              <ul className="space-y-2.5 text-xs text-muted-text leading-relaxed font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-danger font-bold font-mono">•</span>
                  <span>Solve 300+ problems, but forget 80% of solutions after 3 weeks of inactivity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger font-bold font-mono">•</span>
                  <span>No system to track what to review when — leading to blind guessing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger font-bold font-mono">•</span>
                  <span>Interview anxiety: &ldquo;I solved this 2 months ago, why can&apos;t I recall it on the whiteboard?&rdquo;</span>
                </li>
              </ul>
            </div>

            {/* The CodeRecall Way */}
            <div className="p-6 rounded-xl bg-background border border-border space-y-3">
              <div className="font-mono text-xs font-bold text-success">[ ✓ SM-2 ACTIVE RECALL ]</div>
              <h3 className="text-base font-bold text-text font-sans">Mathematical Reinforcement</h3>
              <ul className="space-y-2.5 text-xs text-muted-text leading-relaxed font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-success font-bold font-mono">•</span>
                  <span><strong className="text-text">SM-2 Spaced Repetition</strong> prompts reviews right when neural pathways begin to decay.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success font-bold font-mono">•</span>
                  <span><strong className="text-text">95%+ Long-Term Recall</strong> with only 15–20 minutes of targeted daily practice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success font-bold font-mono">•</span>
                  <span><strong className="text-text">Paced Intake Queue</strong> prevents infinite backlogs and study burnout.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-2">
            <span>[SPEC SHEET: CORE MODULES]</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
            Everything Required for Algorithmic Mastery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5">
            <div className="font-mono text-xs font-bold text-primary">[MODULE 01]</div>
            <h3 className="text-sm font-bold text-text">1-Click LeetCode Import</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Import study plans like Blind 75, NeetCode 150, or custom URLs. Problem descriptions, examples, and tags are scraped and indexed automatically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5">
            <div className="font-mono text-xs font-bold text-success">[MODULE 02]</div>
            <h3 className="text-sm font-bold text-text">SM-2 Spaced Repetition Engine</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Proven SuperMemo algorithm calculates personalized review intervals based on problem difficulty, elapsed solve time, and recall confidence.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5">
            <div className="font-mono text-xs font-bold text-warning">[MODULE 03]</div>
            <h3 className="text-sm font-bold text-text">Paced Timer &amp; Suggested Ratings</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Active timer with visual threshold alerts based on problem difficulty. Suggests objective self-grades so you stay honest and never overestimate recall.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5">
            <div className="font-mono text-xs font-bold text-primary">[MODULE 04]</div>
            <h3 className="text-sm font-bold text-text">Custom Decks &amp; Multi-Tag Taxonomy</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Categorize problems into custom decks (e.g. &ldquo;Google System Design&rdquo;, &ldquo;Dynamic Programming&rdquo;) and filter instantly by pattern, company, or interval.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5">
            <div className="font-mono text-xs font-bold text-primary">[MODULE 05]</div>
            <h3 className="text-sm font-bold text-text">Upcoming Load &amp; Retention Stats</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Visual 7-day upcoming review load projections, 90-day activity heatmap, and breakdown of review cards vs new problem discovery.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5">
            <div className="font-mono text-xs font-bold text-danger">[MODULE 06]</div>
            <h3 className="text-sm font-bold text-text">Burnout Prevention &amp; Queue Pacing</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Reviews always take priority over new problems. Set daily new intake limits or pause new questions entirely to clear review backlogs with ease.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-border bg-surface/30 font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              [PRACTICE WORKFLOW]
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-sans">
              How CodeRecall Accelerates Your Prep
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface border border-border space-y-3">
              <div className="text-xs font-bold text-primary">STAGE 01 // INTAKE</div>
              <h3 className="text-base font-bold text-text font-sans">Import Target Decks</h3>
              <p className="text-xs text-muted-text leading-relaxed font-sans">
                Paste any LeetCode list or problem URL. Choose your prior familiarity (Brand New, Mixed, or Studied) to initialize your catalog.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border space-y-3">
              <div className="text-xs font-bold text-primary">STAGE 02 // WORKBENCH</div>
              <h3 className="text-base font-bold text-text font-sans">Solve in Study Workbench</h3>
              <p className="text-xs text-muted-text leading-relaxed font-sans">
                Work through your daily queue with an integrated timer, scratchpad code editor, and progressive hint revealers.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border space-y-3">
              <div className="text-xs font-bold text-primary">STAGE 03 // CALIBRATION</div>
              <h3 className="text-base font-bold text-text font-sans">Calibrate &amp; Retain</h3>
              <p className="text-xs text-muted-text leading-relaxed font-sans">
                Grade your recall. The algorithm dynamically schedules the next review date right before the neural pathway decays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Science */}
      <section id="spaced-repetition" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-surface border border-border p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-primary/10 text-primary">
                <span>[SUPERMEMO SM-2 MATHEMATICS]</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
                Backed by 130+ Years of Cognitive Science
              </h2>
              <p className="text-xs text-muted-text leading-relaxed">
                Hermann Ebbinghaus discovered that humans forget up to 80% of newly learned information within 48 hours unless it is actively reinforced at compounding intervals.
              </p>
              <p className="text-xs text-muted-text leading-relaxed">
                CodeRecall implements the <strong>SuperMemo SM-2 algorithm</strong>, computing an individual <code className="bg-background px-1.5 py-0.5 rounded font-mono text-xs text-primary">Ease Factor</code> and exponential review intervals for each coding problem. Every successful recall expands the interval (1 day &rarr; 6 days &rarr; 16 days &rarr; 40 days).
              </p>
              <div className="pt-2">
                <Link
                  href={user ? "/app/dashboard" : "/signup"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-text text-background hover:opacity-90 transition-opacity"
                >
                  Start Mastering Patterns Now -&gt;
                </Link>
              </div>
            </div>

            {/* Retention Comparison Progress */}
            <div className="lg:col-span-5 space-y-3 font-mono">
              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-text">Without Spaced Repetition</span>
                  <span className="text-danger">18% Retention @ 30d</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-border overflow-hidden">
                  <div className="h-full bg-danger rounded-full" style={{ width: '18%' }} />
                </div>
                <p className="text-[10px] text-muted-text">Solutions forgotten, requiring full relearning.</p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-text">With CodeRecall SM-2</span>
                  <span className="text-success">96% Retention @ 30d</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-border overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: '96%' }} />
                </div>
                <p className="text-[10px] text-muted-text">Compounding intervals convert recognition into deep reflex.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-2">[FAQ]</h2>
          <p className="text-2xl font-extrabold tracking-tight text-text">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-3 font-mono">
          {[
            {
              q: "Is CodeRecall completely free?",
              a: "Yes. CodeRecall is free to use. You can create unlimited decks, import study plans, and run spaced repetition study queues without any subscription or paywall."
            },
            {
              q: "How does the LeetCode import work?",
              a: "You can import problem lists by pasting either the URL of a study plan (e.g. NeetCode 150, Blind 75), a LeetCode problem list URL, or individual problem links. CodeRecall fetches title, description, difficulty, and tags automatically."
            },
            {
              q: "What if I miss a day or fall behind on reviews?",
              a: "CodeRecall prioritizes overdue reviews first and allows you to set your Daily New Question Limit to 0 in Settings so you can comfortably clear your backlog without new cards piling up."
            },
            {
              q: "Can I use CodeRecall alongside my usual code editor or LeetCode?",
              a: "Absolutely. You can write your solution inside CodeRecall's embedded Monaco editor, or solve directly on LeetCode and use CodeRecall to record your interval rating and notes."
            },
            {
              q: "How are the review intervals calculated?",
              a: "CodeRecall implements the SM-2 algorithm. When you rate a problem (0 to 5), the algorithm calculates an updated Ease Factor and schedules the next review date (e.g. 1 day for first review, 6 days for second review, and compounding intervals thereafter based on your ease factor)."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between font-semibold text-sm text-text hover:text-primary transition-colors font-sans"
              >
                <span>{item.q}</span>
                <span className="font-mono text-xs text-muted-text shrink-0 ml-2">
                  {activeFaq === idx ? '[ - ]' : '[ + ]'}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-muted-text leading-relaxed border-t border-border pt-3 font-sans">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-2xl bg-text text-background p-8 sm:p-12 text-center relative overflow-hidden shadow-xl font-mono">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 font-sans">
            Ready to Retain Every Pattern for Good?
          </h2>
          <p className="text-sm text-background/80 max-w-xl mx-auto mb-8 leading-relaxed font-sans">
            Join engineers using CodeRecall to master algorithmic problem solving with permanent retention and zero burnout.
          </p>

          <Link
            href={user ? "/app/dashboard" : "/signup"}
            className="inline-block px-7 py-3 rounded-lg font-bold text-sm bg-background text-text hover:opacity-90 transition-opacity uppercase tracking-wider shadow-sm"
          >
            {user ? "Open Dashboard ->" : "Start Practicing for Free ->"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-surface text-xs font-mono text-muted-text">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text">CodeRecall</span>
            <span>— Spaced Repetition for LeetCode</span>
          </div>

          <div className="flex items-center space-x-5">
            <Link href="/login" className="hover:text-text transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-text transition-colors">Sign Up</Link>
            <a href="https://github.com/skksrijan/CodeRecall" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">GitHub -&gt;</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
