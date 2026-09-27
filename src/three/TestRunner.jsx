import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from 'zustand';
import { store } from '../state/store.js';
import { stepTest } from '../sim/engine.js';
import { barrelAmplitude } from '../sim/deform.js';

export default function TestRunner() {
  const testState = useStore(store, (s) => s.test);
  const material = useStore(store, (s) => s.material);
  const updateTestState = useStore(store, (s) => s.updateTestState);

  const engineRef = useRef(testState);
  const lastPublishTimeRef = useRef(0);

  // Sync ref when store test state resets or changes externally
  useEffect(() => {
    engineRef.current = testState;
  }, [testState?.t, testState?.status]);

  useFrame((_, dt) => {
    const current = engineRef.current;
    if (!current) return;

    if (current.status === 'running' || current.status === 'failed') {
      // Step simulation physics
      const next = stepTest(current, dt);

      // Calculate deformation parameters
      const L0 = next.spec?.L0 ?? 30;
      const e = next.deltaL / L0;
      const ePlastic = Math.max(0, e - 0.00125);
      const b = barrelAmplitude(material, ePlastic, 0.3);

      next.eDeform = e;
      next.bDeform = b;
      engineRef.current = next;

      // Throttle Zustand store updates to 20 Hz (every 50 ms) or status change
      const now = performance.now();
      if (now - lastPublishTimeRef.current >= 50 || next.status !== current.status) {
        lastPublishTimeRef.current = now;
        updateTestState(next);
      }
    }
  });

  return null;
}
