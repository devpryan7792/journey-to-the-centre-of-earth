import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollProgress } from '../useScrollProgress';

// Mock Lenis entirely for unit testing the hook
vi.mock('lenis', () => {
  return {
    default: class {
      constructor() {
        this.on = vi.fn((event, callback) => {
          // Store the callback on the instance for manual triggering in tests
          global.__LENIS_CALLBACK__ = callback;
        });
        this.raf = vi.fn();
        this.destroy = vi.fn();
      }
    }
  };
});

describe('useScrollProgress', () => {
  let rafCallbacks = [];
  let originalRAF;
  let originalCAF;

  beforeEach(() => {
    vi.clearAllMocks();
    global.__LENIS_CALLBACK__ = null;
    rafCallbacks = [];

    // Mock requestAnimationFrame to collect callbacks
    originalRAF = window.requestAnimationFrame;
    originalCAF = window.cancelAnimationFrame;
    window.requestAnimationFrame = (cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    };
    window.cancelAnimationFrame = vi.fn();

    // Mock ResizeObserver for Lenis
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCAF;
    delete global.ResizeObserver;
  });

  /**
   * Helper: simulate a Lenis scroll event
   */
  function triggerLenisScroll(scroll, limit) {
    act(() => {
      if (global.__LENIS_CALLBACK__) {
        global.__LENIS_CALLBACK__({ scroll, limit });
      }
      // Flush rAF callbacks to simulate the next frame
      const callbacks = [...rafCallbacks];
      rafCallbacks = [];
      callbacks.forEach(cb => cb(0));
    });
  }

  it('should start at 0', () => {
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
  });

  it('should return 0.5 when scrolled to the middle', () => {
    const { result } = renderHook(() => useScrollProgress());

    // Trigger Lenis scroll: scroll=2000, limit=4000 -> 0.5
    triggerLenisScroll(2000, 4000);

    expect(result.current).toBe(0.5);
  });

  it('should return 1 when scrolled to the bottom', () => {
    const { result } = renderHook(() => useScrollProgress());

    // Trigger Lenis scroll: scroll=4000, limit=4000 -> 1.0
    triggerLenisScroll(4000, 4000);

    expect(result.current).toBe(1);
  });

  it('should clamp to 0 and never go negative', () => {
    const { result } = renderHook(() => useScrollProgress());

    // Trigger Lenis scroll with negative value
    triggerLenisScroll(-100, 4000);

    expect(result.current).toBe(0);
  });

  it('should clamp to 1 and never exceed it', () => {
    const { result } = renderHook(() => useScrollProgress());

    // Trigger Lenis scroll with exceeding value
    triggerLenisScroll(5000, 4000);

    expect(result.current).toBe(1);
  });
});
