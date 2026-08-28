'use client';

import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider';
import HeaderNav from '@/components/editorial/HeaderNav';
import HeroSection from '@/components/editorial/HeroSection';
import ProblemSection from '@/components/editorial/ProblemSection';
import RecallLoopPinned from '@/components/editorial/RecallLoopPinned';
import Sm2SchedulerSection from '@/components/editorial/Sm2SchedulerSection';
import ComparisonSection from '@/components/editorial/ComparisonSection';
import PatternHorizontalScroll from '@/components/editorial/PatternHorizontalScroll';
import ProductWorkbenchSection from '@/components/editorial/ProductWorkbenchSection';
import CognitiveScienceSection from '@/components/editorial/CognitiveScienceSection';
import SystemSpecGrid from '@/components/editorial/SystemSpecGrid';
import TerminalSection from '@/components/editorial/TerminalSection';
import ArchitectureTreeSection from '@/components/editorial/ArchitectureTreeSection';
import NumberedFaqSection from '@/components/editorial/NumberedFaqSection';
import FinalCtaSection from '@/components/editorial/FinalCtaSection';
import EditorialFooter from '@/components/editorial/EditorialFooter';

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#08090b] text-neutral-900 dark:text-neutral-100 selection:bg-emerald-500 selection:text-black relative font-sans transition-colors">
        {/* Minimal fixed technical navigation */}
        <HeaderNav />

        {/* 100vh Hero + Scroll-Drawn SVG Forgetting Curve */}
        <HeroSection />

        {/* 001 / The Problem (Decaying Memory Card) */}
        <ProblemSection />

        {/* 002 / The Recall Loop (Transforming Workbench Interface) */}
        <RecallLoopPinned />

        {/* 003 / The SM-2 Scheduler (Spatially Growing Exponential Timeline) */}
        <Sm2SchedulerSection />

        {/* 004 / Methodology Comparison (Brute Force vs Spaced Recall) */}
        <ComparisonSection />

        {/* 005 / The Patterns You Keep (Horizontal Memory Stream) */}
        <PatternHorizontalScroll />

        {/* 006 / The Product Workbench (Actual CodeRecall UI Environment) */}
        <ProductWorkbenchSection />

        {/* 007 / The 90-Day Cognitive Journey & Constellation Zoom-Out */}
        <CognitiveScienceSection />

        {/* 008 / System Specification Grid */}
        <SystemSpecGrid />

        {/* 009 / Terminal CLI Status Emulator */}
        <TerminalSection />

        {/* 010 / Memory Architecture Directory Tree */}
        <ArchitectureTreeSection />

        {/* 011 / Numbered Technical FAQ */}
        <NumberedFaqSection />

        {/* Final Statement & Stabilized Forgetting Curve Callback */}
        <FinalCtaSection />

        {/* Editorial Footer */}
        <EditorialFooter />
      </div>
    </SmoothScrollProvider>
  );
}
