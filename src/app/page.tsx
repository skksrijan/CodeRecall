'use client';

import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider';
import HeaderNav from '@/components/editorial/HeaderNav';
import HeroSection from '@/components/editorial/HeroSection';
import SpotlightRevealSection from '@/components/editorial/SpotlightRevealSection';
import RecallLoopPinned from '@/components/editorial/RecallLoopPinned';
import ProductWorkbenchSection from '@/components/editorial/ProductWorkbenchSection';
import PatternHorizontalScroll from '@/components/editorial/PatternHorizontalScroll';
import NumberedFaqSection from '@/components/editorial/NumberedFaqSection';
import FinalCtaSection from '@/components/editorial/FinalCtaSection';
import EditorialFooter from '@/components/editorial/EditorialFooter';

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#08090b] text-neutral-900 dark:text-neutral-100 selection:bg-emerald-500 selection:text-black relative font-sans transition-colors overflow-x-hidden">
        {/* Floating Centered Pill Navigation with Live Marquee Ticker */}
        <HeaderNav />

        {/* 1. Hero: 50/50 Split + Interactive Concentric Ring Wave Canvas */}
        <HeroSection />

        {/* 2. Spotlight: Darkness into Light Flashlight Illumination Mask */}
        <SpotlightRevealSection />

        {/* 3. The 4-Stage Recall Loop Machine */}
        <RecallLoopPinned />

        {/* 4. The Live Product Workbench & Scratchpad Preview */}
        <ProductWorkbenchSection />

        {/* 5. The Canonical Patterns Stream */}
        <PatternHorizontalScroll />

        {/* 6. Numbered FAQ */}
        <NumberedFaqSection />

        {/* 7. Final Directive CTA */}
        <FinalCtaSection />

        {/* 8. Editorial Footer */}
        <EditorialFooter />
      </div>
    </SmoothScrollProvider>
  );
}
