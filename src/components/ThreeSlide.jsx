import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

class SlideCurve extends THREE.Curve {
  getPoint(t, optionalTarget = new THREE.Vector3()) {
    // Exact same math as the SVG viewBox "0 0 200 1000"
    const y = -(t * 1000); // 0 to -1000
    const x = 100 + Math.sin(t * Math.PI * 3.5) * 65;
    // Add some Z depth for a cool 3D effect!
    const z = Math.sin(t * Math.PI * 6) * 15; 
    return optionalTarget.set(x, y, z);
  }
}

function SlideMesh() {
  const meshRef = useRef();

  const { geometry } = useMemo(() => {
    // Create a U-shaped profile for the slide
    const shape = new THREE.Shape();
    // width is proportional to the 200 unit viewBox. SVG was strokeWidth="48".
    // 48 units out of 200 is about 24 units radius.
    const width = 16;
    const height = 12;
    const thickness = 2;
    
    // Outer shell
    shape.moveTo(-width, height);
    shape.lineTo(-width, -height);
    shape.lineTo(width, -height);
    shape.lineTo(width, height);
    // Inner shell (the bed)
    shape.lineTo(width - thickness, height);
    shape.lineTo(width - thickness, -height + thickness);
    shape.lineTo(-width + thickness, -height + thickness);
    shape.lineTo(-width + thickness, height);
    shape.lineTo(-width, height); // Close path

    const path = new SlideCurve();
    const extrudeSettings = {
      steps: 300,
      bevelEnabled: false,
      extrudePath: path,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.computeVertexNormals();
    return { geometry };
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        color="#ef4444" // red
        roughness={0.2}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function DynamicCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    // We want the view width to map to 200 units exactly, and top to be 0, bottom to be -1000...
    // But since the canvas aspect ratio isn't 200:1000, we map the canvas to the SVG viewBox logic.
    // SVG preserveAspectRatio="none" stretches the SVG to fit the container.
    // Three.js orthographic doesn't stretch unless we manually scale the scene.
    // It's better to render it with actual proportions.
    
    // Actually, orthographic camera can stretch if we force left, right, top, bottom!
    camera.left = 0;
    camera.right = 200;
    camera.top = 0;
    camera.bottom = -1000;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

export default function ThreeSlide() {
  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 w-full overflow-visible pointer-events-none" style={{ zIndex: -1 }}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], near: -500, far: 500 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <DynamicCamera />
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 100, 100]} intensity={1} />
        <directionalLight position={[-100, 100, -100]} intensity={0.5} />
        <Environment preset="city" />
        
        {/* Scale Y to stretch just like preserveAspectRatio="none" */}
        <group>
          <SlideMesh />
        </group>
      </Canvas>
    </div>
  );
}
