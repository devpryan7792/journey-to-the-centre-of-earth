import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CHECKPOINTS } from '../data/checkpoints';

/**
 * Transition.test.jsx
 * 
 * Tests the checkpoint transition logic, bipolar scroll behavior,
 * and boundary conditions at the Library → Study handoff (scrollProgress = 0.11).
 * 
 * Note: These are unit tests against the pure data/logic layer rather than
 * rendering R3F components (which require a WebGL context). The checkpoint
 * resolution logic from ScrollContext is replicated here for isolated testing.
 */

// Pure function matching the checkpoint resolution logic from ScrollContext.jsx
function resolveCheckpoint(scrollProgress) {
  let found = CHECKPOINTS.find(
    (cp) => scrollProgress >= cp.scrollStart && scrollProgress < cp.scrollEnd
  );
  if (!found) {
    if (scrollProgress >= 1) {
      found = CHECKPOINTS[CHECKPOINTS.length - 1];
    } else {
      found = CHECKPOINTS[0];
    }
  }
  return found;
}

function resolveLocalProgress(scrollProgress) {
  const cp = resolveCheckpoint(scrollProgress);
  const range = cp.scrollEnd - cp.scrollStart;
  if (range <= 0) return 0;
  return Math.max(0, Math.min(1, (scrollProgress - cp.scrollStart) / range));
}

describe('Transition: Checkpoint Resolution', () => {
  it('should resolve to Library (id:0) at scrollProgress 0.0', () => {
    const cp = resolveCheckpoint(0.0);
    expect(cp.id).toBe(0);
    expect(cp.envKey).toBe('library');
  });

  it('should resolve to Library (id:0) at scrollProgress 0.10', () => {
    const cp = resolveCheckpoint(0.10);
    expect(cp.id).toBe(0);
    expect(cp.envKey).toBe('library');
  });

  it('should transition to Study (id:1) at exactly scrollProgress 0.11', () => {
    const cp = resolveCheckpoint(0.11);
    expect(cp.id).toBe(1);
    expect(cp.envKey).toBe('study');
  });

  it('should resolve to Tunnels (id:3) at scrollProgress 0.40', () => {
    const cp = resolveCheckpoint(0.40);
    expect(cp.id).toBe(3);
    expect(cp.envKey).toBe('tunnels');
  });

  it('should resolve to Credits (id:8) at scrollProgress 1.0', () => {
    const cp = resolveCheckpoint(1.0);
    expect(cp.id).toBe(8);
    expect(cp.envKey).toBe('credits');
  });
});

describe('Transition: Bipolar Scroll (Forward and Reverse)', () => {
  it('should transition forward through all 9 checkpoints in order', () => {
    const testPoints = [0.0, 0.15, 0.30, 0.44, 0.55, 0.68, 0.80, 0.90, 0.97];
    const expectedIds = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    testPoints.forEach((p, i) => {
      const cp = resolveCheckpoint(p);
      expect(cp.id).toBe(expectedIds[i]);
    });
  });

  it('should reverse back through checkpoints when scrolling up', () => {
    // Simulate scrolling down to Explosion...
    expect(resolveCheckpoint(0.80).envKey).toBe('explosion');
    
    // ...then scrolling back up
    expect(resolveCheckpoint(0.65).envKey).toBe('prehistoric');
    expect(resolveCheckpoint(0.55).envKey).toBe('sea');
    expect(resolveCheckpoint(0.44).envKey).toBe('tunnels');
    expect(resolveCheckpoint(0.30).envKey).toBe('iceland');
    expect(resolveCheckpoint(0.15).envKey).toBe('study');
    expect(resolveCheckpoint(0.05).envKey).toBe('library');
  });

  it('should handle rapid forward-reverse without getting stuck', () => {
    // Quick oscillation around a boundary
    expect(resolveCheckpoint(0.49).envKey).toBe('tunnels');
    expect(resolveCheckpoint(0.51).envKey).toBe('sea');
    expect(resolveCheckpoint(0.49).envKey).toBe('tunnels');
    expect(resolveCheckpoint(0.51).envKey).toBe('sea');
  });
});

describe('Transition: Local Progress Calculation', () => {
  it('should compute localProgress 0 at the start of a checkpoint', () => {
    // Library starts at 0.00
    expect(resolveLocalProgress(0.00)).toBeCloseTo(0.0, 2);
  });

  it('should compute localProgress ~0.5 at the midpoint of Library', () => {
    // Library: 0.00 to 0.11, midpoint is 0.055
    expect(resolveLocalProgress(0.055)).toBeCloseTo(0.5, 2);
  });

  it('should compute localProgress ~1.0 just before the end of Library', () => {
    // Just before 0.11
    expect(resolveLocalProgress(0.109)).toBeCloseTo(0.99, 1);
  });

  it('should clamp localProgress between 0 and 1', () => {
    const lp = resolveLocalProgress(0.0);
    expect(lp).toBeGreaterThanOrEqual(0);
    expect(lp).toBeLessThanOrEqual(1);
  });
});

describe('Transition: Boundary Edge Cases', () => {
  it('should handle negative scrollProgress gracefully', () => {
    const cp = resolveCheckpoint(-0.1);
    expect(cp.id).toBe(0); // Falls back to Library
  });

  it('should handle scrollProgress > 1.0 gracefully', () => {
    const cp = resolveCheckpoint(1.5);
    expect(cp.id).toBe(8); // Credits
  });

  it('should handle exact boundary between Library and Study', () => {
    // 0.11 is scrollStart of Study, scrollEnd of Library
    // Library: [0.00, 0.11), Study: [0.11, 0.24)
    const atBoundary = resolveCheckpoint(0.11);
    expect(atBoundary.envKey).toBe('study');
    
    const justBefore = resolveCheckpoint(0.1099);
    expect(justBefore.envKey).toBe('library');
  });
});
