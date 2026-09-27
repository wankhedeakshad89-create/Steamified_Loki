import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from 'zustand';
import { store } from '../state/store.js';
import { makeSpecimenGeometry } from './specimenGeometry.js';

export function FracturedSpecimen() {
  const trueDims = useStore(store, (s) => s.specimen.trueDims);
  const test = useStore(store, (s) => s.test);

  const d0 = trueDims?.d0 ?? 20;
  const L0 = trueDims?.L0 ?? 30;

  const r0 = d0 / 20;
  const L = L0 / 10;

  const failTime = test?.failTime ?? test?.t ?? 0;
  const tSinceFail = Math.max(0, (test?.t ?? 0) - failTime);

  const slip = 0.6 * (1 - Math.exp(-tSinceFail / 0.12));

  // Geometry
  const geometry = useMemo(() => makeSpecimenGeometry(r0, L), [r0, L]);

  // Elliptic Cap Geometry for 45° cut
  const capGeometry = useMemo(() => {
    const rx = r0;
    const ry = r0 * Math.SQRT2;
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
    return new THREE.ShapeGeometry(shape);
  }, [r0]);

  // 45° Clipping Planes
  // n = (0, cos(45°), sin(45°)) = (0, 0.7071, 0.7071)
  const planeLower = useMemo(() => {
    return new THREE.Plane(new THREE.Vector3(0, -0.7071, -0.7071), 0.7071 * (L / 2));
  }, [L]);

  const planeUpper = useMemo(() => {
    return new THREE.Plane(new THREE.Vector3(0, 0.7071, 0.7071), -0.7071 * (L / 2));
  }, [L]);

  const upperOffset = [0, -0.7071 * slip, 0.7071 * slip];

  return (
    <group>
      {/* Lower Half */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#4b4b52"
          roughness={0.4}
          metalness={0.6}
          clippingPlanes={[planeLower]}
          clipShadows
        />
      </mesh>
      {/* Lower Cap */}
      <mesh
        geometry={capGeometry}
        position={[0, L / 2, 0]}
        rotation={[Math.PI / 4, 0, 0]}
      >
        <meshStandardMaterial color="#d4d4d8" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Upper Half (Sliding) */}
      <mesh geometry={geometry} position={upperOffset}>
        <meshStandardMaterial
          color="#4b4b52"
          roughness={0.4}
          metalness={0.6}
          clippingPlanes={[planeUpper]}
          clipShadows
        />
      </mesh>
      {/* Upper Cap */}
      <mesh
        geometry={capGeometry}
        position={[0, L / 2 + upperOffset[1], upperOffset[2]]}
        rotation={[Math.PI / 4, 0, 0]}
      >
        <meshStandardMaterial color="#d4d4d8" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
