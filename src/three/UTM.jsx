import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function UTM() {
  const trueDims = useStore(store, (s) => s.specimen.trueDims);
  const headTravel = useStore(store, (s) => s.utm.headTravel ?? 0);
  const contactTravel = useStore(store, (s) => s.utm.contactTravel ?? 40.0);
  const cleanProgress = useStore(store, (s) => s.cleanProgress ?? 0);

  const L0 = trueDims?.L0 ?? 30;
  const specimenTopY = L0 / 10;
  const gap = Math.max(0, (contactTravel - headTravel) * 0.1);

  const upperPlatenCenterY = specimenTopY + gap + 0.2;
  const crossheadCenterY = specimenTopY + gap + 0.4 + 0.4;
  const specksOpacity = Math.max(0, 1 - cleanProgress);

  return (
    <group>
      {/* Base Plinth */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[12, 1, 6]} />
        <meshStandardMaterial color="#52525b" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Lower Platen */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[3, 3, 0.4, 64]} />
        <meshStandardMaterial color="#71717a" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Dust/Speckle Overlay on Lower Platen */}
      {specksOpacity > 0.01 && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, 2.9, 32]} />
          <meshBasicMaterial color="#334155" opacity={specksOpacity * 0.7} transparent side={2} />
        </mesh>
      )}

      {/* Thin Concentric Centering Ring */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.02, 64]} />
        <meshBasicMaterial color="#3f3f46" side={2} />
      </mesh>

      {/* Dual Columns */}
      <mesh position={[-4.2, 6.6, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 14, 32]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[4.2, 6.6, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 14, 32]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Top Beam */}
      <mesh position={[0, 14.4, 0]}>
        <boxGeometry args={[10.4, 0.8, 3.2]} />
        <meshStandardMaterial color="#52525b" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Moving Crosshead Assembly */}
      <mesh position={[0, upperPlatenCenterY, 0]}>
        <cylinderGeometry args={[3, 3, 0.4, 64]} />
        <meshStandardMaterial color="#71717a" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Dust Overlay on Upper Platen Bottom */}
      {specksOpacity > 0.01 && (
        <mesh position={[0, upperPlatenCenterY - 0.201, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, 2.9, 32]} />
          <meshBasicMaterial color="#334155" opacity={specksOpacity * 0.7} transparent side={2} />
        </mesh>
      )}

      {/* Crosshead */}
      <mesh position={[0, crossheadCenterY, 0]}>
        <boxGeometry args={[9, 0.8, 3]} />
        <meshStandardMaterial color="#52525b" metalness={0.5} roughness={0.55} />
      </mesh>
    </group>
  );
}
