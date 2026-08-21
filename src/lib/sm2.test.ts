import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateSM2 } from './sm2';

describe('calculateSM2', () => {
  beforeEach(() => {
    // Mock date to ensure consistent nextReviewDate calculation
    const mockDate = new Date('2026-01-01T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  it('perfect recall streak scales intervals exponentially', () => {
    // First review
    const r1 = calculateSM2({ quality: 5, repetitions: 0, previousInterval: 0, easeFactor: 2.5 });
    expect(r1.repetitions).toBe(1);
    expect(r1.interval).toBe(1);
    expect(r1.easeFactor).toBeGreaterThan(2.5);

    // Second review
    const r2 = calculateSM2({ quality: 5, repetitions: r1.repetitions, previousInterval: r1.interval, easeFactor: r1.easeFactor });
    expect(r2.repetitions).toBe(2);
    expect(r2.interval).toBe(6);
    expect(r2.easeFactor).toBeGreaterThan(r1.easeFactor);

    // Third review
    const r3 = calculateSM2({ quality: 5, repetitions: r2.repetitions, previousInterval: r2.interval, easeFactor: r2.easeFactor });
    expect(r3.repetitions).toBe(3);
    expect(r3.interval).toBe(Math.round(6 * r2.easeFactor)); // 6 * ~2.7 = ~16
    expect(r3.easeFactor).toBeGreaterThan(r2.easeFactor);
  });

  it('a lapse (quality < 3) resets repetitions and drops interval to 1', () => {
    // Simulate a problem well-known
    const state = { quality: 2, repetitions: 5, previousInterval: 45, easeFactor: 2.5 };
    const r = calculateSM2(state);

    expect(r.repetitions).toBe(0);
    expect(r.interval).toBe(1);
    // Ease factor should decrease because quality = 2
    expect(r.easeFactor).toBeLessThan(2.5);
  });

  it('ease factor floor is strictly 1.3 even with repeated quality=0', () => {
    let ef = 2.5;
    for (let i = 0; i < 10; i++) {
      const r = calculateSM2({ quality: 0, repetitions: 0, previousInterval: 0, easeFactor: ef });
      ef = r.easeFactor;
    }
    expect(ef).toBe(1.3);
  });

  it('nextReviewDate is correctly set in the future based on interval', () => {
    const r = calculateSM2({ quality: 5, repetitions: 1, previousInterval: 1, easeFactor: 2.5 });
    expect(r.interval).toBe(6);

    const expectedDate = new Date('2026-01-01T12:00:00Z');
    expectedDate.setDate(expectedDate.getDate() + 6);
    
    expect(r.nextReviewDate.toISOString()).toBe(expectedDate.toISOString());
  });
});
