import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from 'zustand';
import { store } from '../state/store.js';

const NUM_SHARDS = 28;

function createPRNG(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Shards() {
  const test = useStore(store, (s) => s.test);
  const trueDims = useStore(store, (s) => s.specimen.trueDims);

  const L0 = trueDims?.L0 ?? 30;
  const L = L0 / 10;
  const failTime = test?.failTime ?? test?.t ?? 0;
  const tSinceFail = Math.max(0, (test?.t ?? 0) - failTime);

  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-generate random initial positions, velocities, and rotations for 28 shards
  const shardsData = useMemo(() => {
    const rand = createPRNG(999);
    const data = [];
    for (let i = 0; i < NUM_SHARDS; i++) {
      const angle = rand() * Math.PI * 2;
      const speed = 1.5 + rand() * 2.5;
      const vx = Math.cos(angle) * speed;
      const vz = Math.sin(angle) * speed;
      const vy = 1.0 + rand() * 2.0;

      const initX = (rand() * 2 - 1) * 0.4;
      const initY = L / 2 + (rand() * 2 - 1) * 0.3;
      const initZ = (rand() * 2 - 1) * 0.4;

      const rotAxis = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
      const rotSpeed = 5 + rand() * 10;

      data.push({ initX, initY, initZ, vx, vy, vz, rotAxis, rotSpeed });
    }
    return data;
  }, [L]);

  useFrame(({ camera }) => {
    // Camera shake for 150 ms after fracture
    if (tSinceFail > 0 && tSinceFail <= 0.15) {
      const shakeAmount = 0.05 * (1 - tSinceFail / 0.15);
      camera.position.x += (Math.random() - 0.5) * shakeAmount;
      camera.position.y += (Math.random() - 0.5) * shakeAmount;
    }

    if (!meshRef.current) return;

    for (let i = 0; i < NUM_SHARDS; i++) {
      const s = shardsData[i];
      // Physics motion under gravity
      const x = s.initX + s.vx * tSinceFail;
      const y = Math.max(0.03, s.initY + s.vy * tSinceFail - 0.5 * 9.81 * tSinceFail * tSinceFail);
      const z = s.initZ + s.vz * tSinceFail;

      dummy.position.set(x, y, z);
      dummy.setRotationFromAxisAngle(s.rotAxis, s.rotSpeed * tSinceFail);
      dummy.scale.setScalar(0.1 + (i % 3) * 0.04);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, NUM_SHARDS]}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#a1a1aa" roughness={0.5} metalness={0.4} />
    </instancedMesh>
  );
}
