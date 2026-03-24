import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Data ball shaders ────────────────────────────────────────────────────────
// Ball uses the SAME visual language as the pitch:
//   dark base + glowing green seam lines + node markers + ice-blue orbit arcs

const BALL_VERT = `
varying vec3 vN;
varying vec3 vWN;
varying vec3 vWP;
void main() {
  vN  = normalize(normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWP = wp.xyz;
  vWN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

// Voronoi edge detection over the 12 icosahedron vertices (= pentagon centers).
// m1-m2 is 0 on any Voronoi boundary → those boundaries are the seam lines.
// 'patch' is GLSL-reserved; all variables use safe names.
const BALL_FRAG = `
precision highp float;
varying vec3 vN;
varying vec3 vWN;
varying vec3 vWP;
uniform vec3  uCam;
uniform float uTime;

void main() {
  // ── Voronoi: track two largest dot products ──────────────────────────────
  float m1 = -2.0, m2 = -2.0, dv;

  dv = dot(vN, vec3( 0.0,    0.5257,  0.8507)); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3( 0.0,   -0.5257,  0.8507)); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3( 0.0,    0.5257, -0.8507)); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3( 0.0,   -0.5257, -0.8507)); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3( 0.5257,  0.8507,  0.0  )); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3(-0.5257,  0.8507,  0.0  )); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3( 0.5257, -0.8507,  0.0  )); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3(-0.5257, -0.8507,  0.0  )); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3( 0.8507,  0.0,     0.5257)); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3(-0.8507,  0.0,     0.5257)); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3( 0.8507,  0.0,    -0.5257)); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}
  dv = dot(vN, vec3(-0.8507,  0.0,    -0.5257)); if(dv>m1){m2=m1;m1=dv;}else if(dv>m2){m2=dv;}

  // Seam glow: bright at Voronoi boundary (m1 == m2)
  float edgeDist  = m1 - m2;
  float seamGlow  = pow(1.0 - smoothstep(0.0, 0.050, edgeDist), 1.8);

  // Node glow: bright dot at each of the 12 pentagon centers
  float nodeGlow  = smoothstep(0.958, 0.980, m1);

  // ── Great-circle orbit overlays (3 tilted arcs, matches trajectory arcs) ─
  float gc1 = 1.0 - smoothstep(0.0, 0.022, abs(vN.y));
  float gc2 = 1.0 - smoothstep(0.0, 0.018,
              abs(dot(vN, normalize(vec3(0.0, 0.574, 0.819)))));
  float gc3 = 1.0 - smoothstep(0.0, 0.016,
              abs(dot(vN, normalize(vec3(0.819, 0.574, 0.0)))));
  float orbits = max(gc1, max(gc2, gc3));

  // ── Build color — same palette as pitch ──────────────────────────────────
  vec3 base      = vec3(0.036, 0.060, 0.046);   // very dark green-black
  vec3 seamCol   = vec3(0.18,  0.76,  0.16);     // pitch green (#22c55e family)
  vec3 nodeCol   = vec3(0.48,  1.00,  0.40);     // bright node green (#4ade80)
  vec3 orbitCol  = vec3(0.18,  0.52,  0.76);     // ice blue  (#38bdf8 family)

  vec3 col = base
           + seamCol  * seamGlow * 0.95
           + nodeCol  * nodeGlow * 1.30
           + orbitCol * orbits   * 0.26;

  // ── Lighting: minimal — just enough to define the sphere form ────────────
  vec3 N   = normalize(vWN);
  vec3 V   = normalize(uCam - vWP);
  vec3 L   = normalize(vec3(2.5, 5.0, 3.0));
  float df = max(dot(N, L), 0.0) * 0.22 + 0.14;

  // Pitch-green rim matches the field's green upwash
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);

  vec3 color = col * df + vec3(0.22, 0.76, 0.18) * rim * 0.30;

  // Edge darkening to reinforce spherical depth
  color *= 0.78 + 0.22 * pow(max(dot(N, V), 0.0), 0.25);

  gl_FragColor = vec4(color, 1.0);
}
`;

// ─── Pitch geometry (unchanged) ───────────────────────────────────────────────

function buildPitchLines(): THREE.BufferGeometry {
  const v: number[] = [];
  const Y = 0.012;
  function seg(x1: number, z1: number, x2: number, z2: number) {
    v.push(x1, Y, z1, x2, Y, z2);
  }
  const W = 10.0,
    L = 7.0,
    hw = W / 2,
    hl = L / 2;
  seg(-hw, -hl, hw, -hl);
  seg(-hw, hl, hw, hl);
  seg(-hw, -hl, -hw, hl);
  seg(hw, -hl, hw, hl);
  seg(-hw, 0, hw, 0);
  seg(-0.07, 0, 0.07, 0);
  seg(0, -0.07, 0, 0.07);
  const CR = 1.3,
    CS = 64;
  for (let i = 0; i < CS; i++) {
    const a1 = (i / CS) * Math.PI * 2,
      a2 = ((i + 1) / CS) * Math.PI * 2;
    seg(Math.cos(a1) * CR, Math.sin(a1) * CR, Math.cos(a2) * CR, Math.sin(a2) * CR);
  }
  const PAW = 4.0,
    PAD = 1.4;
  seg(-PAW / 2, hl, -PAW / 2, hl - PAD);
  seg(PAW / 2, hl, PAW / 2, hl - PAD);
  seg(-PAW / 2, hl - PAD, PAW / 2, hl - PAD);
  seg(-PAW / 2, -hl, -PAW / 2, -hl + PAD);
  seg(PAW / 2, -hl, PAW / 2, -hl + PAD);
  seg(-PAW / 2, -hl + PAD, PAW / 2, -hl + PAD);
  const GAW = 2.0,
    GAD = 0.45;
  seg(-GAW / 2, hl, -GAW / 2, hl - GAD);
  seg(GAW / 2, hl, GAW / 2, hl - GAD);
  seg(-GAW / 2, hl - GAD, GAW / 2, hl - GAD);
  seg(-GAW / 2, -hl, -GAW / 2, -hl + GAD);
  seg(GAW / 2, -hl, GAW / 2, -hl + GAD);
  seg(-GAW / 2, -hl + GAD, GAW / 2, -hl + GAD);
  const corners: [number, number, number][] = [
    [-hw, -hl, 0],
    [hw, -hl, Math.PI / 2],
    [-hw, hl, -Math.PI / 2],
    [hw, hl, Math.PI]
  ];
  corners.forEach(([cx, cz, sa]) => {
    for (let i = 0; i < 8; i++) {
      const a1 = sa + (i / 8) * (Math.PI / 2),
        a2 = sa + ((i + 1) / 8) * (Math.PI / 2);
      seg(cx + Math.cos(a1) * 0.22, cz + Math.sin(a1) * 0.22, cx + Math.cos(a2) * 0.22, cz + Math.sin(a2) * 0.22);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  return geo;
}

function buildTrajectories(): THREE.BufferGeometry {
  const v: number[] = [];
  const Y = 0.02;
  [
    { cx: -2.5, cz: 1.2, r: 1.8, a0: 0.1, a1: 1.6 },
    { cx: 2.2, cz: -1.8, r: 1.5, a0: 3.4, a1: 5.0 },
    { cx: -0.8, cz: -2.5, r: 2.3, a0: -0.2, a1: 0.9 },
    { cx: 1.8, cz: 2.2, r: 1.0, a0: 3.9, a1: 5.5 }
  ].forEach(({ cx, cz, r, a0, a1 }) => {
    for (let i = 0; i < 20; i++) {
      const at = a0 + (i / 20) * (a1 - a0),
        bt = a0 + ((i + 1) / 20) * (a1 - a0);
      v.push(cx + Math.cos(at) * r, Y, cz + Math.sin(at) * r, cx + Math.cos(bt) * r, Y, cz + Math.sin(bt) * r);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  return geo;
}

function buildMarkers(): THREE.BufferGeometry {
  const pts = [
    -3.5, 1.8, -1.8, 2.8, 1.2, 2.3, 3.8, 1.2, -3.8, -1.2, -1.2, -2.3, 2.2, -1.8, 3.5, -2.8, 0, 3.2, 0, -3.2, -4.5, 0.2,
    4.5, 0.8, 2, 0, -2, 0
  ];
  const pos: number[] = [];
  for (let i = 0; i < pts.length; i += 2) pos.push(pts[i], 0.05, pts[i + 1]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return geo;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [v, setV] = useState(false);
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    setV(q.matches);
    const h = (e: MediaQueryListEvent) => setV(e.matches);
    q.addEventListener('change', h);
    return () => q.removeEventListener('change', h);
  }, []);
  return v;
}

// ─── Football ball ────────────────────────────────────────────────────────────

interface BallProps {
  eulerRef: React.MutableRefObject<THREE.Euler>;
  isDraggingRef: React.MutableRefObject<boolean>;
  velocityRef: React.MutableRefObject<{ x: number; y: number }>;
  noMotion: boolean;
}

function FootballBall({ eulerRef, isDraggingRef, velocityRef, noMotion }: BallProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BALL_VERT,
        fragmentShader: BALL_FRAG,
        uniforms: {
          uCam: { value: new THREE.Vector3() },
          uTime: { value: 0 }
        }
      }),
    []
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const m = meshRef.current;
    material.uniforms.uCam.value.copy(state.camera.position);
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (noMotion) {
      m.rotation.copy(eulerRef.current);
      return;
    }
    if (isDraggingRef.current) {
      m.rotation.copy(eulerRef.current);
    } else {
      velocityRef.current.x *= 0.92;
      velocityRef.current.y *= 0.92;
      eulerRef.current.y += velocityRef.current.x;
      eulerRef.current.x += velocityRef.current.y;
      eulerRef.current.x = Math.max(-0.5, Math.min(0.5, eulerRef.current.x));
      const speed = Math.abs(velocityRef.current.x) + Math.abs(velocityRef.current.y);
      eulerRef.current.y += delta * 0.2 * Math.max(0, 1 - speed * 8);
      m.rotation.copy(eulerRef.current);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1.0, 0]} material={material} castShadow>
      <sphereGeometry args={[1.0, 96, 48]} />
    </mesh>
  );
}

// ─── Pitch environment ────────────────────────────────────────────────────────

function PitchEnvironment() {
  const pitchGeo = useMemo(buildPitchLines, []);
  const trajectGeo = useMemo(buildTrajectories, []);
  const markerGeo = useMemo(buildMarkers, []);
  const trajectRef = useRef<THREE.LineSegments>(null);
  const markerRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (trajectRef.current)
      (trajectRef.current.material as THREE.LineBasicMaterial).opacity = 0.07 + Math.sin(t * 1.1) * 0.04;
    if (markerRef.current)
      (markerRef.current.material as THREE.PointsMaterial).opacity = 0.4 + Math.sin(t * 1.6 + 1) * 0.18;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#050a08" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[2.8, 48]} />
        <meshBasicMaterial color="#0a1f0a" transparent opacity={0.55} />
      </mesh>
      <gridHelper args={[20, 40, '#0a1f0a', '#0a1a0a']} position={[0, 0.004, 0]} />
      <lineSegments geometry={pitchGeo}>
        <lineBasicMaterial color="#22c55e" transparent opacity={0.7} />
      </lineSegments>
      <lineSegments ref={trajectRef} geometry={trajectGeo}>
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.09} depthWrite={false} />
      </lineSegments>
      <points ref={markerRef} geometry={markerGeo}>
        <pointsMaterial color="#4ade80" size={0.055} transparent opacity={0.45} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  );
}

// ─── Lights ───────────────────────────────────────────────────────────────────

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.06} />
      <directionalLight
        position={[4, 7, 5]}
        intensity={2.0}
        color="#fff8ee"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <pointLight position={[-5, 3, -4]} color="#4a6fa5" intensity={1.4} distance={14} />
      <pointLight position={[0, 0.3, 0]} color="#22c55e" intensity={0.7} distance={5} />
      <pointLight position={[0, 3, -6]} color="#84cc16" intensity={1.1} distance={12} />
    </>
  );
}

// ─── Main HeroScene ───────────────────────────────────────────────────────────

interface HeroSceneProps {
  lang: string;
  heroHeader: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
}

export default function HeroScene({ lang, heroHeader, heroCtaPrimary, heroCtaSecondary }: HeroSceneProps) {
  const reducedMotion = useReducedMotion();
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const eulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const [grabbing, setGrabbing] = useState(false);

  const onDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
    setGrabbing(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = (e.clientX - prevPointerRef.current.x) * 0.012;
    const dy = (e.clientY - prevPointerRef.current.y) * 0.012;
    velocityRef.current = { x: dx, y: dy };
    eulerRef.current.y += dx;
    eulerRef.current.x = Math.max(-0.5, Math.min(0.5, eulerRef.current.x + dy));
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onUp = useCallback(() => {
    isDraggingRef.current = false;
    setGrabbing(false);
  }, []);

  return (
    // Layout: flex column so headline (top) and CTAs (bottom) always stay in viewport.
    // The 3D canvas fills the full section behind; content is overlaid with z-10.
    <div className="relative flex flex-col" style={{ height: '100svh', minHeight: '580px' }}>
      {/* Full-screen canvas behind everything */}
      <div
        className="absolute inset-0"
        style={{ cursor: grabbing ? 'grabbing' : 'grab' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerCancel={onUp}
      >
        <Canvas
          shadows
          camera={{ position: [0, 2.8, 6.8], fov: 52 }}
          gl={{ antialias: true, alpha: false }}
          style={{ width: '100%', height: '100%', background: '#070B14' }}
        >
          <fog attach="fog" args={['#070B14', 12, 26]} />
          <SceneLights />
          <Suspense fallback={null}>
            <FootballBall
              eulerRef={eulerRef}
              isDraggingRef={isDraggingRef}
              velocityRef={velocityRef}
              noMotion={reducedMotion}
            />
            <PitchEnvironment />
          </Suspense>
        </Canvas>
      </div>

      {/* ── Content column: headline top, spacer middle, CTAs bottom ─────── */}
      {/* pointer-events-none on the column; restored only on the CTA row */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Top gradient + headline */}
        <div
          className="flex-none pt-24 pb-10 px-6 text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(7,11,20,0.90) 0%, rgba(7,11,20,0.55) 70%, transparent 100%)'
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400 mb-5">
            <span className="block w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" aria-hidden="true" />
            AI · Sport · Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-tight max-w-2xl mx-auto">
            {heroHeader}
          </h1>
        </div>

        {/* Transparent spacer — 3D scene shows through */}
        <div className="flex-1" />

        {/* Bottom gradient + CTAs — always in viewport, pointer events restored */}
        <div
          className="flex-none pb-10 pt-8 px-6 pointer-events-auto"
          style={{
            background: 'linear-gradient(0deg, rgba(7,11,20,0.92) 0%, rgba(7,11,20,0.55) 70%, transparent 100%)'
          }}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`/${lang}/projects`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 hover:-translate-y-px hover:shadow-xl hover:shadow-brand-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
            >
              {heroCtaPrimary}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href={`/${lang}/about`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
            >
              {heroCtaSecondary}
            </a>
          </div>

          {/* Drag hint */}
          <div className="mt-4 flex items-center justify-center gap-1.5 opacity-30" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-3.5 h-3.5 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5"
              />
            </svg>
            <span className="text-[10px] font-medium text-slate-400 tracking-widest uppercase">Drag to rotate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
