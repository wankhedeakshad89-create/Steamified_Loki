import { useMemo, useEffect } from 'react';
import { useStore } from 'zustand';
import { store } from '../state/store.js';
import { makeSpecimenGeometry } from './specimenGeometry.js';
import { deformSpecimen, barrelAmplitude } from '../sim/deform.js';
import { FracturedSpecimen } from './Fracture.jsx';
import { Shards } from './Shards.jsx';

export default function Specimen() {
  const trueDims = useStore(store, (s) => s.specimen.trueDims);
  const xOffset = useStore(store, (s) => s.specimen.xOffset ?? 0);
  const zOffset = useStore(store, (s) => s.specimen.zOffset ?? 0);
  const material = useStore(store, (s) => s.material);
  const test = useStore(store, (s) => s.test);

  const d0 = trueDims?.d0 ?? 20;
  const L0 = trueDims?.L0 ?? 30;

  const r0 = d0 / 20;
  const height = L0 / 10;

  const geometry = useMemo(() => {
    return makeSpecimenGeometry(r0, height);
  }, [r0, height]);

  // Deformation calculation
  const deltaL = test?.deltaL ?? 0;
  const e = deltaL / L0;
  const ePlastic = Math.max(0, e - 0.00125);
  const b = material?.brittle ? 0 : barrelAmplitude(material, ePlastic, 0.3);

  // Apply deformation geometry displacement
  useEffect(() => {
    if (geometry) {
      deformSpecimen(geometry, L0, e, b);
    }
  }, [geometry, L0, e, b]);

  const isFailedCastIron = material?.brittle && test?.status === 'failed';
  const position = [xOffset / 10, 0, zOffset / 10]; // 1 scene unit = 10 mm

  if (isFailedCastIron) {
    return (
      <group position={position}>
        <FracturedSpecimen />
        <Shards />
      </group>
    );
  }

  const color = material?.brittle ? '#4b4b52' : '#8b949e';

  return (
    <mesh geometry={geometry} position={position}>
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.6}
      />
    </mesh>
  );
}
