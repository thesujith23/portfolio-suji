import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  SLIDE_W,
  SLIDE_H,
  SLIDE_ROT_X,
  SLIDE_ROT_Y,
  baseX,
  baseY,
  baseZ,
  slideSvgPath,
} from '../lib/slidePath';

const SEGMENTS = 260;
const HALF = 17; // half width of the chute
const WALL = 13; // how far the walls rise
const FLOOR = 4; // thickness of the sliding bed
const THICK = 5.5; // wall thickness

/* The original slide: a plain U-section, walls and bed, nothing else. */
const PROFILE = [
  [HALF, -FLOOR],
  [HALF, WALL],
  [HALF - THICK, WALL],
  [HALF - THICK, FLOOR],
  [-(HALF - THICK), FLOOR],
  [-(HALF - THICK), WALL],
  [-HALF, WALL],
  [-HALF, -FLOOR],
];

/* Frames along the slide: position, travel direction, sideways and up axes. */
function buildFrames() {
  const frames = [];
  const worldUp = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const next = Math.min(1, t + 0.002);
    const p = new THREE.Vector3(baseX(t), baseY(t), baseZ(t));
    const tangent = new THREE.Vector3(
      baseX(next) - p.x,
      baseY(next) - p.y,
      baseZ(next) - p.z,
    ).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, worldUp).normalize();
    const up = new THREE.Vector3().crossVectors(side, tangent).normalize();
    frames.push({ p, tangent, side, up });
  }
  return frames;
}

/* Red plastic shell: the chute swept along the path. */
function shellGeometry(frames) {
  const positions = [];
  const indices = [];
  const ring = PROFILE.length;

  frames.forEach((f) => {
    PROFILE.forEach(([across, out]) => {
      positions.push(
        f.p.x + f.side.x * across + f.up.x * out,
        f.p.y + f.side.y * across + f.up.y * out,
        f.p.z + f.side.z * across + f.up.z * out,
      );
    });
  });

  for (let i = 0; i < SEGMENTS; i++) {
    for (let j = 0; j < ring; j++) {
      const j2 = (j + 1) % ring;
      const a = i * ring + j;
      const b = i * ring + j2;
      const c = (i + 1) * ring + j;
      const d = (i + 1) * ring + j2;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* The chute is static geometry, so one render per change is enough. This used
   to re-render the whole buffer for 700ms (~40 frames) on every stop change. */
function DemandDriver({ tick }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
    const raf = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(raf);
  }, [invalidate, tick]);

  return null;
}

function Scene({ activeIndex }) {
  const frames = useMemo(() => buildFrames(), []);
  const shell = useMemo(() => shellGeometry(frames), [frames]);

  return (
    <>
      <DemandDriver tick={`${activeIndex}`} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#ffe6dc', 0.55]} />
      <directionalLight
        castShadow={false}
        color="#fff3dd"
        intensity={1.9}
        position={[330, -170, 640]}
      />
      <directionalLight color="#d6e2ff" intensity={0.55} position={[-380, -700, 300]} />

      {/* Tilt the geometry, never the camera, so the DOM rider stays aligned. */}
      <group rotation={[SLIDE_ROT_X, SLIDE_ROT_Y, 0]}>
        <mesh geometry={shell} receiveShadow={false}>
          <meshStandardMaterial
            color="#F62440"
            roughness={0.2}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </>
  );
}

/* ── Static chute for reduced motion / no WebGL ────────── */
function StaticSlide() {
  const path = useMemo(() => slideSvgPath(), []);

  return (
    <div className="timeline-slide" aria-hidden="true">
      <svg viewBox={`0 0 ${SLIDE_W} ${SLIDE_H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="slide-static-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4a5e" />
            <stop offset="55%" stopColor="#f62440" />
            <stop offset="100%" stopColor="#c9182f" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke="#c9182f" strokeWidth="40" strokeLinecap="round" opacity="0.45" />
        <path d={path} fill="none" stroke="url(#slide-static-grad)" strokeWidth="36" strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="4"
          strokeLinecap="round"
          transform="translate(-9 0)"
        />
      </svg>
    </div>
  );
}

export default function ThreeSlide({ activeIndex = 0 }) {
  const wrapRef = useRef(null);
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 768,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = (event) => setReduced(event.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const sync = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  if (reduced) return <StaticSlide />;

  return (
    <div className="timeline-slide" ref={wrapRef} aria-hidden="true">
      <Canvas
        orthographic
        frameloop="demand"
        shadows={false}
        dpr={1}
        camera={{
          position: [0, 0, 600],
          near: 1,
          far: 3000,
          left: 0,
          right: SLIDE_W,
          top: 0,
          bottom: -SLIDE_H,
          zoom: 1,
        }}
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene activeIndex={activeIndex} />
      </Canvas>
    </div>
  );
}
