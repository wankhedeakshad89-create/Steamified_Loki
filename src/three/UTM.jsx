import { useStore } from 'zustand';
import { store } from '../state/store.js';

export default function UTM() {
  const trueDims = useStore(store, (s) => s.specimen.trueDims);
  const headTravel = useStore(store, (s) => s.utm.headTravel ?? 0);
  const contactTravel = useStore(store, (s) => s.utm.contactTravel ?? 40.0);

  const L0 = trueDims?.L0 ?? 30;
  // Specimen top Y position in scene units (1 unit = 10 mm)
  const specimenTopY = L0 / 10;

  // gap in scene units (1 unit = 10 mm)
  const gap = Math.max(0, (contactTravel - headTravel) * 0.1);

  // Upper platen bottom is at y = specimenTopY + gap
  const upperPlatenCenterY = specimenTopY + gap + 0.2; // height = 0.4
  const crossheadCenterY = specimenTopY + gap + 0.4 + 0.4; // height = 0.8 above upper platen

  return (
    <group>
      {/* Base Plinth: Box 12 x 1 x 6, top face at y = -0.4 -> center y = -0.9 */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[12, 1, 6]} />
        <meshStandardMaterial color="#52525b" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Lower Platen: Cylinder radius = 3, height = 0.4, top face at y = 0 -> center y = -0.2 */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[3, 3, 0.4, 64]} />
        <meshStandardMaterial color="#71717a" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Thin Concentric Centering Ring on top face of Lower Platen (y = 0.001) */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.02, 64]} />
        <meshBasicMaterial color="#3f3f46" side={2} />
      </mesh>

      {/* Dual Columns: Two cylinders radius = 0.35, height = 14, at x = -4.2 and x = +4.2 */}
      <mesh position={[-4.2, 6.6, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 14, 32]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[4.2, 6.6, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 14, 32]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Top Beam: Fixed box 10.4 x 0.8 x 3.2 at y = 14 (center y = 14.4) */}
      <mesh position={[0, 14.4, 0]}>
        <boxGeometry args={[10.4, 0.8, 3.2]} />
        <meshStandardMaterial color="#52525b" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Moving Crosshead Assembly */}
      {/* Upper Platen: Cylinder radius = 3, height = 0.4 */}
      <mesh position={[0, upperPlatenCenterY, 0]}>
        <cylinderGeometry args={[3, 3, 0.4, 64]} />
        <meshStandardMaterial color="#71717a" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Crosshead: Box 9 x 0.8 x 3 */}
      <mesh position={[0, crossheadCenterY, 0]}>
        <boxGeometry args={[9, 0.8, 3]} />
        <meshStandardMaterial color="#52525b" metalness={0.5} roughness={0.55} />
      </mesh>
    </group>
  );
}
