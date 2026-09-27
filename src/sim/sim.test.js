import { describe, it, expect } from 'vitest';
import { MATERIALS, evaluate } from './materials.js';
import { radialFactor } from './deform.js';
import { canAdvance } from '../state/procedure.js';

describe('Compression Test Simulation', () => {
  it('evaluates mild steel at e = 0.0012492 (yield point)', () => {
    const d0 = 20;
    const A0 = (Math.PI * d0 * d0) / 4;
    const res = evaluate(MATERIALS.steel, A0, 0.0012492);
    expect(res.loadkN).toBeCloseTo(78.6, 0);
    expect(Math.abs(res.loadkN - 78.6)).toBeLessThan(0.5);
  });

  it('evaluates mild steel at e = 0.5 (strain limit)', () => {
    const d0 = 20;
    const A0 = (Math.PI * d0 * d0) / 4;
    const res = evaluate(MATERIALS.steel, A0, 0.5);
    expect(Math.abs(res.loadkN - 420)).toBeLessThan(5);
  });

  it('evaluates cast iron fracture at e ≈ 0.0103', () => {
    const d0 = 20;
    const A0 = (Math.PI * d0 * d0) / 4;
    const res = evaluate(MATERIALS.castIron, A0, 0.0103);
    expect(res.failed).toBe(true);
    expect(Math.abs(res.loadkN - 206)).toBeLessThan(3);
  });

  it('conserves volume under 2000 slice integration with radialFactor', () => {
    const d0 = 20;
    const L0 = 30;
    const R0 = d0 / 2;
    const V0 = Math.PI * R0 * R0 * L0;
    const numSlices = 2000;
    const testCases = [
      { e: 0.2, b: 0.1 },
      { e: 0.5, b: 0.2 },
      { e: 0.3, b: 0.0 },
    ];

    for (const { e, b } of testCases) {
      const L = L0 * (1 - e);
      const dt = 1 / numSlices;
      let integratedVol = 0;

      for (let i = 0; i < numSlices; i++) {
        const t = (i + 0.5) * dt;
        const r = R0 * radialFactor(t, e, b);
        const area = Math.PI * r * r;
        integratedVol += area * (L * dt);
      }

      const relError = Math.abs(integratedVol - V0) / V0;
      expect(relError).toBeLessThan(0.001);
    }
  });

  it('canAdvance() blocks transition until each guard evaluates to true', () => {
    const baseState = {
      platensClean: false,
      measure: { validated: false },
      specimen: { offsetMm: 1.0 },
      utm: { inContact: false, tared: false },
      safety: { approved: false, faults: ['fault'] },
      test: { status: 'idle' },
      stepIndex: 0,
    };

    // Step 0: CLEAN
    expect(canAdvance({ ...baseState, stepIndex: 0 })).toBe(false);
    expect(canAdvance({ ...baseState, stepIndex: 0, platensClean: true })).toBe(true);

    // Step 1: MEASURE
    expect(canAdvance({ ...baseState, stepIndex: 1 })).toBe(false);
    expect(canAdvance({ ...baseState, stepIndex: 1, measure: { validated: true } })).toBe(true);

    // Step 2: CENTER
    expect(canAdvance({ ...baseState, stepIndex: 2 })).toBe(false);
    expect(canAdvance({ ...baseState, stepIndex: 2, specimen: { offsetMm: 0.2 } })).toBe(true);

    // Step 3: APPROACH
    expect(canAdvance({ ...baseState, stepIndex: 3 })).toBe(false);
    expect(canAdvance({ ...baseState, stepIndex: 3, utm: { inContact: true, tared: false } })).toBe(false);
    expect(canAdvance({ ...baseState, stepIndex: 3, utm: { inContact: true, tared: true } })).toBe(true);

    // Step 4: SAFETY
    expect(canAdvance({ ...baseState, stepIndex: 4 })).toBe(false);
    expect(canAdvance({ ...baseState, stepIndex: 4, safety: { approved: true, faults: [] } })).toBe(true);

    // Step 5: TEST
    expect(canAdvance({ ...baseState, stepIndex: 5 })).toBe(false);
    expect(canAdvance({ ...baseState, stepIndex: 5, test: { status: 'failed' } })).toBe(true);
    expect(canAdvance({ ...baseState, stepIndex: 5, test: { status: 'limit' } })).toBe(true);

    // Step 6: RECORD
    expect(canAdvance({ ...baseState, stepIndex: 6 })).toBe(true);
  });
});
