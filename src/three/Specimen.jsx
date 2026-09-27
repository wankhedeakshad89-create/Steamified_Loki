import { useMemo } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';
import { makeSpecimenGeometry } from './specimenGeometry.js';

export default function Specimen() {
  const trueDims = useStore(store, (s) => s.specimen.trueDims);
  const material = useStore(store, (s) => s.material);

  const d0 = trueDims?.d0 ?? 20;
  const L0 = trueDims?.L0 ?? 30;

  // 1 scene unit = 10 mm
  const r0 = d0 / 20;
  const height = L0 / 10;

  const geometry = useMemo(() => {
    return makeSpecimenGeometry(r0, height);
  }, [r0, height]);

  const color = material?.brittle ? '#4b4b52' : '#8b949e';

  return (
    <mesh geometry={geometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.6}
      />
    </mesh>
  );
}
