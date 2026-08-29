'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface RingConfig {
  radius: number;
  text: string;
  speed: number;
  direction: number; // 1 or -1
  fontSize: number;
  letterSpacing: number;
}

const RINGS_DATA: RingConfig[] = [
  {
    radius: 45,
    text: 'CODERECALL • ACTIVE RECALL • ',
    speed: 0.003,
    direction: 1,
    fontSize: 9,
    letterSpacing: 1.8,
  },
  {
    radius: 85,
    text: 'SPACED REPETITION • SM-2 ENGINE • RETENTION MATRIX • ',
    speed: 0.0022,
    direction: -1,
    fontSize: 9.5,
    letterSpacing: 2,
  },
  {
    radius: 130,
    text: 'SOLVE TO LEARN • RECALL TO RETAIN • 150+ INTERVIEW PATTERNS • ',
    speed: 0.0016,
    direction: 1,
    fontSize: 10,
    letterSpacing: 2.2,
  },
  {
    radius: 178,
    text: 'TWO POINTERS • SLIDING WINDOW • MONOTONIC STACK • DYNAMIC PROGRAMMING • BINARY SEARCH • ',
    speed: 0.0012,
    direction: -1,
    fontSize: 10.5,
    letterSpacing: 2.4,
  },
  {
    radius: 228,
    text: 'EXPONENTIAL INTERVAL EXPANSION • DAY 1 • DAY 6 • DAY 16 • DAY 40 • DAY 90 • PERMANENT • ',
    speed: 0.0009,
    direction: 1,
    fontSize: 11,
    letterSpacing: 2.6,
  },
  {
    radius: 280,
    text: 'ZERO DRIFT • MATHEMATICAL SCHEDULING • SYNAPTIC CONSOLIDATION • ZERO RE-SOLVING • ',
    speed: 0.0007,
    direction: -1,
    fontSize: 11.5,
    letterSpacing: 2.8,
  },
  {
    radius: 334,
    text: 'ALGORITHMIC INTUITION ON TAP • FAANG INTERVIEW READY • MEMORY REPOSITORY ARCHITECTURE • ',
    speed: 0.0005,
    direction: 1,
    fontSize: 12,
    letterSpacing: 3.0,
  },
];

export default function ConcentricRingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Animation state references
  const animFrameRef = useRef<number | null>(null);
  const anglesRef = useRef<number[]>(RINGS_DATA.map(() => 0));
  const waveTimeRef = useRef<number>(0);
  const waveIntensityRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isHoldingRef = useRef<boolean>(false);

  const handlePointerDown = useCallback(() => {
    isHoldingRef.current = true;
    setIsHolding(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    isHoldingRef.current = false;
    setIsHolding(false);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 700;
    let height = 700;

    const resize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = Math.min(rect.width, rect.height || rect.width, 720);
      width = size;
      height = size;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Render loop
    const render = (time: number) => {
      // Check if dark mode is active on document
      const isDark = document.documentElement.classList.contains('dark');

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Update wave intensity
      if (isHoldingRef.current) {
        waveIntensityRef.current = Math.min(waveIntensityRef.current + 0.08, 1);
        waveTimeRef.current += 0.08;
      } else {
        waveIntensityRef.current = Math.max(waveIntensityRef.current - 0.03, 0);
        waveTimeRef.current += 0.02;
      }

      // Draw background ambient concentric guide circles
      RINGS_DATA.forEach((ring, idx) => {
        const baseRadius = (ring.radius / 360) * (width * 0.46);
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(255, 255, 255, ${0.03 + (idx % 2 === 0 ? 0.02 : 0)})`
          : `rgba(0, 0, 0, ${0.04 + (idx % 2 === 0 ? 0.02 : 0)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw active ripple rings if holding
      if (waveIntensityRef.current > 0.01) {
        const rippleCount = 3;
        for (let i = 0; i < rippleCount; i++) {
          const progress = ((waveTimeRef.current * 0.5 + i / rippleCount) % 1);
          const rippleRadius = progress * (width * 0.48);
          const alpha = (1 - progress) * 0.35 * waveIntensityRef.current;

          ctx.beginPath();
          ctx.arc(cx, cy, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
          ctx.lineWidth = 1.5 + (1 - progress) * 2;
          ctx.stroke();
        }
      }

      // Draw concentric rotating text
      RINGS_DATA.forEach((ring, idx) => {
        // Update angle
        anglesRef.current[idx] += ring.speed * ring.direction;
        const currentAngle = anglesRef.current[idx];

        const baseRadius = (ring.radius / 360) * (width * 0.46);
        const text = ring.text;
        const fontSize = Math.max(8, (ring.fontSize / 360) * (width * 0.46));
        
        ctx.font = `bold ${fontSize}px var(--font-geist-mono), monospace`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        // Calculate total text length on circumference
        const chars = text.split('');
        const charStep = (Math.PI * 2) / chars.length;

        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          const charAngle = currentAngle + i * charStep;

          // Wave radial displacement calculation
          let displacement = 0;
          if (waveIntensityRef.current > 0.001) {
            // Harmonic wave from center outward
            const waveFrequency = 0.04;
            const waveSpeed = 8;
            const waveAmp = 14 * waveIntensityRef.current;
            displacement = Math.sin(baseRadius * waveFrequency - waveTimeRef.current * waveSpeed) * waveAmp;
          }

          // Subtle cursor magnetic displacement
          const charX = cx + Math.cos(charAngle) * (baseRadius + displacement);
          const charY = cy + Math.sin(charAngle) * (baseRadius + displacement);
          const dx = charX - (cx + mousePosRef.current.x);
          const dy = charY - (cy + mousePosRef.current.y);
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          let mouseInfluence = 0;
          if (distToMouse < 90) {
            mouseInfluence = (1 - distToMouse / 90) * 8;
          }

          const finalRadius = baseRadius + displacement + mouseInfluence;
          const x = cx + Math.cos(charAngle) * finalRadius;
          const y = cy + Math.sin(charAngle) * finalRadius;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(charAngle + Math.PI / 2);

          // Color calculation: brighter on emerald wave, crisp in light/dark
          if (waveIntensityRef.current > 0.1 && Math.abs(displacement) > 4) {
            ctx.fillStyle = isDark ? '#34d399' : '#059669';
          } else if (idx === 0) {
            ctx.fillStyle = isDark ? '#10b981' : '#059669';
          } else if (idx % 2 === 1) {
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)';
          } else {
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.55)' : 'rgba(15, 23, 42, 0.55)';
          }

          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
      });

      // Draw Center Core Node
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#08090b' : '#f8f9fa';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing core dot
      const pulseSize = 4 + (Math.sin(time * 0.005) + 1) * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = isHoldingRef.current ? '#34d399' : '#10b981';
      ctx.fill();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        setHovered(false);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerMove={handlePointerMove}
      className="relative w-full aspect-square max-w-[620px] mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing select-none group"
      title="Click and hold to emit active memory recall waves"
    >
      {/* Background glow when holding */}
      <div
        className={`absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl transition-opacity duration-300 pointer-events-none ${
          isHolding ? 'opacity-100 scale-105' : hovered ? 'opacity-60 scale-100' : 'opacity-20 scale-95'
        }`}
      />

      {/* Main interactive canvas */}
      <canvas ref={canvasRef} className="relative z-10 w-full h-full block" />

      {/* Floating Bottom Prompt Badge */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 font-mono text-[10px] px-2.5 py-1 rounded bg-white/80 dark:bg-black/80 backdrop-blur-md border border-neutral-200 dark:border-white/15 text-neutral-700 dark:text-neutral-300 shadow-lg flex items-center gap-1.5 pointer-events-none transition-all">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isHolding ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'
          }`}
        />
        <span>{isHolding ? 'RECALL WAVE ACTIVE • 60FPS' : 'CLICK & HOLD TO EMIT WAVE'}</span>
      </div>
    </div>
  );
}
