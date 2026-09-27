import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import UTM from './UTM.jsx';
import Specimen from './Specimen.jsx';
import TestRunner from './TestRunner.jsx';

export default function Scene() {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [9, 6, 11], fov: 35 }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
        className="w-full h-full"
      >
        <color attach="background" args={['#f1f5f9']} />

        {/* Physics Test Simulation Runner */}
        <TestRunner />

        {/* Lighting */}
        <hemisphereLight skyColor="#ffffff" groundColor="#94a3b8" intensity={0.7} />
        <directionalLight position={[6, 10, 5]} intensity={1.6} />

        {/* 3D Scene Geometry */}
        <UTM />
        <Specimen />

        {/* Camera Controls */}
        <OrbitControls
          target={[0, 3, 0]}
          minPolarAngle={0.3}
          maxPolarAngle={1.5}
          enablePan={false}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
}
