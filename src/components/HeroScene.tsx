import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RECRUITMENT_FORM_LINK } from '../constants.ts';

// ─── Data model ───────────────────────────────────────────────────────────────
// Formation in the XY plane: y increases upward (GK at bottom, FWDs at top).
// Server node sits above the formation as the tactical intelligence hub.

const SERVER_POS: [number, number] = [0.0, 4.1];

// [x, y] — 4-3-3 formation
const NODES: readonly [number, number][] = [
  [0.0, -3.6], // 0  GK
  [-3.0, -2.3],
  [-1.0, -2.3],
  [1.0, -2.3],
  [3.0, -2.3], // 1-4  DEF (LB LCB RCB RB)
  [-2.0, -0.1],
  [0.0, -0.5],
  [2.0, -0.1], // 5-7  MID (LCM CM RCM)
  [-2.8, 2.0],
  [0.0, 2.6],
  [2.8, 2.0] // 8-10 FWD (LW CF RW)
];

// Routes: [fromIdx, toIdx, ctrlX, ctrlY] where -1 = server node
const ROUTES: readonly [number, number, number, number][] = [
  // Server → midfield
  [-1, 5, -1.4, 2.6],
  [-1, 6, 0.0, 2.3],
  [-1, 7, 1.4, 2.6],
  // Server → wide forwards (direct long routes)
  [-1, 8, -2.3, 3.4],
  [-1, 10, 2.3, 3.4],
  // Defensive line (bow outward/below)
  [1, 2, -2.0, -2.9],
  [2, 3, 0.0, -2.9],
  [3, 4, 2.0, -2.9],
  // GK → defense
  [0, 1, -1.5, -3.4],
  [0, 2, -0.4, -3.1],
  [0, 3, 0.4, -3.1],
  [0, 4, 1.5, -3.4],
  // Defense → midfield
  [1, 5, -2.7, -1.3],
  [2, 5, -1.5, -1.4],
  [2, 6, -0.4, -1.2],
  [3, 6, 0.4, -1.2],
  [3, 7, 1.5, -1.4],
  [4, 7, 2.7, -1.3],
  // Midfield triangle
  [5, 6, -1.1, -0.1],
  [6, 7, 1.1, -0.1],
  [5, 7, 0.0, 0.3],
  // Midfield → forward
  [5, 8, -2.5, 1.1],
  [5, 9, -1.0, 1.3],
  [6, 9, 0.0, 1.2],
  [7, 9, 1.0, 1.3],
  [7, 10, 2.5, 1.1],
  // Forward line
  [8, 9, -1.4, 2.8],
  [9, 10, 1.4, 2.8],
  // Wide channels (full-length arcs)
  [1, 8, -3.6, 0.0],
  [4, 10, 3.6, 0.0]
];

// Pulse paths — signal circulation routes through the network (-1 = server)
const PULSE_PATHS: readonly (readonly number[])[] = [
  [-1, 6, 9],
  [-1, 5, 8, 9],
  [-1, 7, 10, 9],
  [0, 2, 6, 9],
  [0, 3, 7, 10],
  [-1, 5, 6, 7],
  [1, 5, 8],
  [4, 7, 10]
];

const PULSE_OFFSETS = [0.0, 0.22, 0.45, 0.67, 0.11, 0.55, 0.33, 0.78];

// ─── Visual constants ──────────────────────────────────────────────────────────

const NODE_R = 0.055;
const NODE_HALO_R = 0.13;
const NODE_EMISSIVE_BASE = 0.5;
const NODE_EMISSIVE_PEAK = 3.6;

const SERVER_R = 0.11;
const SERVER_HALO_R = 0.2;
const SERVER_RING1_R = 0.29;
const SERVER_RING2_R = 0.46;
const SERVER_RING3_R = 0.66;

const PULSE_R = 0.042;
const PULSE_HALO_R = 0.1;

const CURVE_SAMPLES = 28;

const PULSE_SPEED = 1.1;
const WAVE_SPEED = 0.48;
const ACTIVATION_DECAY = 2.0;
const EDGE_DECAY_MULT = 3.5;

// Colors — deep navy background, sky-blue network
const C_NODE = '#38bdf8';
const C_NODE_HALO = '#7dd3fc';
const C_SERVER = '#f0f9ff';
const C_SERVER_RING = '#38bdf8';
const C_PULSE = '#f0f9ff';
const C_PULSE_HALO = '#7dd3fc';
const C_EDGE_BASE = new THREE.Color(0.03, 0.09, 0.18);
const C_EDGE_ACTIVE = new THREE.Color(0.22, 0.75, 0.97);

const _c = new THREE.Color();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const _SRV = NODES.length; // 11 — sentinel key for server node

function getNodeXY(idx: number): [number, number] {
  return idx === -1 ? SERVER_POS : NODES[idx];
}

function quadBezierPt(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  t: number
): [number, number] {
  const mt = 1 - t;
  return [mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x, mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y];
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ─── Pre-computed bezier curves ───────────────────────────────────────────────

const ROUTE_CURVES: THREE.Vector3[][] = ROUTES.map(([ai, bi, cx, cy]) => {
  const [ax, ay] = getNodeXY(ai);
  const [bx, by] = getNodeXY(bi);
  const pts: THREE.Vector3[] = [];
  for (let s = 0; s <= CURVE_SAMPLES; s++) {
    const t = s / CURVE_SAMPLES;
    const [x, y] = quadBezierPt(ax, ay, cx, cy, bx, by, t);
    pts.push(new THREE.Vector3(x, y, 0));
  }
  return pts;
});

// Directed lookup: pairKey(src, dst) → { routeIdx, reversed }
function pairKey(a: number, b: number): number {
  return (a === -1 ? _SRV : a) * 16 + (b === -1 ? _SRV : b);
}

const ROUTE_FOR_PAIR = new Map<number, { routeIdx: number; reversed: boolean }>();
ROUTES.forEach(([ai, bi], i) => {
  ROUTE_FOR_PAIR.set(pairKey(ai, bi), { routeIdx: i, reversed: false });
  ROUTE_FOR_PAIR.set(pairKey(bi, ai), { routeIdx: i, reversed: true });
});

// Undirected lookup for activation: undirKey(a, b) → routeIdx
function undirKey(a: number, b: number): number {
  const ka = a === -1 ? _SRV : a;
  const kb = b === -1 ? _SRV : b;
  return Math.min(ka, kb) * 16 + Math.max(ka, kb);
}

const ROUTE_ACTIVATION_IDX = new Map<number, number>();
ROUTES.forEach(([ai, bi], i) => {
  const key = undirKey(ai, bi);
  if (!ROUTE_ACTIVATION_IDX.has(key)) ROUTE_ACTIVATION_IDX.set(key, i);
});

function sampleRoute(routeIdx: number, t: number, reversed: boolean): THREE.Vector3 {
  const pts = ROUTE_CURVES[routeIdx];
  const ti = reversed ? 1 - t : t;
  const fi = ti * (pts.length - 1);
  const lo = Math.floor(fi);
  const hi = Math.min(lo + 1, pts.length - 1);
  return new THREE.Vector3().lerpVectors(pts[lo], pts[hi], fi - lo);
}

// ─── useReducedMotion ─────────────────────────────────────────────────────────

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

// ─── FieldHints ───────────────────────────────────────────────────────────────
// Very faint pitch outline — secondary to the network, just enough to ground
// the formation visually.

function buildFieldGeometry(): THREE.BufferGeometry {
  const v: number[] = [];
  const Z = -0.18;
  function seg(x1: number, y1: number, x2: number, y2: number) {
    v.push(x1, y1, Z, x2, y2, Z);
  }
  const W = 8.2,
    H = 12.0,
    hw = W / 2,
    hh = H / 2;
  // Boundary
  seg(-hw, -hh, hw, -hh);
  seg(-hw, hh, hw, hh);
  seg(-hw, -hh, -hw, hh);
  seg(hw, -hh, hw, hh);
  // Halfway line
  seg(-hw, 0, hw, 0);
  // Center circle
  const CR = 1.5,
    CS = 40;
  for (let i = 0; i < CS; i++) {
    const a1 = (i / CS) * Math.PI * 2,
      a2 = ((i + 1) / CS) * Math.PI * 2;
    seg(Math.cos(a1) * CR, Math.sin(a1) * CR, Math.cos(a2) * CR, Math.sin(a2) * CR);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  return geo;
}

function FieldHints() {
  const geo = useMemo(buildFieldGeometry, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#1a3560" transparent opacity={0.16} />
    </lineSegments>
  );
}

// ─── ServerNode ───────────────────────────────────────────────────────────────

function ServerNode({ activationRef }: { activationRef: React.MutableRefObject<number> }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const r1Ref = useRef<THREE.Mesh>(null);
  const r2Ref = useRef<THREE.Mesh>(null);
  const r3Ref = useRef<THREE.Mesh>(null);
  const [sx, sy] = SERVER_POS;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const a = activationRef.current;
    if (coreRef.current) {
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.4 + a * 2.2 + Math.sin(t * 2.1) * 0.18;
      coreRef.current.scale.setScalar(1 + a * 0.22);
    }
    if (haloRef.current) {
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.13 + a * 0.18;
    }
    if (r1Ref.current) {
      r1Ref.current.rotation.z = t * 0.65;
      (r1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.28 + a * 0.32;
    }
    if (r2Ref.current) {
      r2Ref.current.rotation.z = -t * 0.38;
      (r2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.16 + a * 0.2;
    }
    if (r3Ref.current) {
      r3Ref.current.rotation.z = t * 0.22;
      (r3Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + a * 0.11;
    }
  });

  return (
    <group position={[sx, sy, 0]}>
      <mesh ref={r3Ref}>
        <ringGeometry args={[SERVER_RING3_R * 0.88, SERVER_RING3_R, 64]} />
        <meshBasicMaterial color={C_SERVER_RING} transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh ref={r2Ref}>
        <ringGeometry args={[SERVER_RING2_R * 0.86, SERVER_RING2_R, 48]} />
        <meshBasicMaterial color={C_SERVER_RING} transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh ref={r1Ref}>
        <ringGeometry args={[SERVER_RING1_R * 0.84, SERVER_RING1_R, 32]} />
        <meshBasicMaterial color={C_SERVER_RING} transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[SERVER_HALO_R, 14, 14]} />
        <meshBasicMaterial color={C_NODE_HALO} transparent opacity={0.13} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[SERVER_R, 18, 18]} />
        <meshStandardMaterial
          color={C_SERVER}
          emissive={C_SERVER}
          emissiveIntensity={1.4}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

// ─── NetworkScene ─────────────────────────────────────────────────────────────

function NetworkScene({ noMotion }: { noMotion: boolean }) {
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const routeLinesRef = useRef<THREE.LineSegments>(null);
  const pulseRefs = useRef<(THREE.Group | null)[]>([]);

  const nodeActivation = useRef(new Float32Array(NODES.length));
  const routeActivation = useRef(new Float32Array(ROUTES.length));
  const serverActivation = useRef(0);

  const { routeGeo, routeVertexStart } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const starts: number[] = [];

    ROUTES.forEach((_, ri) => {
      starts.push(positions.length / 3);
      const pts = ROUTE_CURVES[ri];
      for (let s = 0; s < pts.length - 1; s++) {
        const a = pts[s],
          b = pts[s + 1];
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        colors.push(C_EDGE_BASE.r, C_EDGE_BASE.g, C_EDGE_BASE.b, C_EDGE_BASE.r, C_EDGE_BASE.g, C_EDGE_BASE.b);
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const colAttr = new THREE.Float32BufferAttribute(colors, 3);
    colAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('color', colAttr);
    return { routeGeo: geo, routeVertexStart: starts };
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    // Decay
    for (let i = 0; i < NODES.length; i++) {
      nodeActivation.current[i] = Math.max(0, nodeActivation.current[i] - delta * ACTIVATION_DECAY);
    }
    for (let i = 0; i < ROUTES.length; i++) {
      routeActivation.current[i] = Math.max(0, routeActivation.current[i] - delta * ACTIVATION_DECAY * EDGE_DECAY_MULT);
    }
    serverActivation.current = Math.max(0, serverActivation.current - delta * ACTIVATION_DECAY * 0.5);

    // Wave shimmer — y-based ripple through formation (bottom to top)
    for (let i = 0; i < NODES.length; i++) {
      const [, y] = NODES[i];
      const wave = (Math.sin(t * WAVE_SPEED + y * 0.65) * 0.5 + 0.5) * 0.24;
      if (wave > nodeActivation.current[i]) nodeActivation.current[i] = wave;
    }
    const srvWave = (Math.sin(t * WAVE_SPEED * 0.75) * 0.5 + 0.5) * 0.17;
    if (srvWave > serverActivation.current) serverActivation.current = srvWave;

    // Animate signal pulses
    if (!noMotion) {
      PULSE_PATHS.forEach((path, pi) => {
        const pathLen = path.length - 1;
        const cycleT = (t / PULSE_SPEED + PULSE_OFFSETS[pi] * pathLen) % pathLen;
        const segIdx = Math.min(Math.floor(cycleT), pathLen - 1);
        const segT = cycleT - Math.floor(cycleT);
        const src = path[segIdx];
        const dst = path[segIdx + 1];
        if (src === undefined || dst === undefined) return;

        const te = easeInOut(segT);

        // Activate nodes
        const srcAct = (1 - segT) * 0.95;
        const dstAct = segT * 0.95;
        if (src === -1) {
          if (srcAct > serverActivation.current) serverActivation.current = srcAct;
        } else {
          if (srcAct > nodeActivation.current[src]) nodeActivation.current[src] = srcAct;
        }
        if (dst === -1) {
          if (dstAct > serverActivation.current) serverActivation.current = dstAct;
        } else {
          if (dstAct > nodeActivation.current[dst]) nodeActivation.current[dst] = dstAct;
        }

        // Activate route (undirected)
        const ri = ROUTE_ACTIVATION_IDX.get(undirKey(src, dst));
        if (ri !== undefined) routeActivation.current[ri] = 1.0;

        // Position packet along bezier curve
        const pRef = pulseRefs.current[pi];
        if (pRef) {
          const routeInfo = ROUTE_FOR_PAIR.get(pairKey(src, dst));
          if (routeInfo) {
            const pos = sampleRoute(routeInfo.routeIdx, te, routeInfo.reversed);
            pRef.position.copy(pos);
          } else {
            // Fallback: linear interpolation
            const [sx2, sy2] = getNodeXY(src);
            const [dx2, dy2] = getNodeXY(dst);
            pRef.position.set(sx2 + (dx2 - sx2) * te, sy2 + (dy2 - sy2) * te, 0);
          }
          pRef.visible = true;
        }
      });
    } else {
      pulseRefs.current.forEach((r) => {
        if (r) r.visible = false;
      });
    }

    // Apply node activations
    for (let i = 0; i < NODES.length; i++) {
      const mesh = nodeRefs.current[i];
      if (!mesh) continue;
      const a = nodeActivation.current[i];
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
        NODE_EMISSIVE_BASE + a * (NODE_EMISSIVE_PEAK - NODE_EMISSIVE_BASE);
      mesh.scale.setScalar(1 + a * 0.28);
    }

    // Apply route activations via vertex colors
    if (routeLinesRef.current) {
      const colorAttr = routeLinesRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
      for (let ri = 0; ri < ROUTES.length; ri++) {
        _c.copy(C_EDGE_BASE).lerp(C_EDGE_ACTIVE, routeActivation.current[ri]);
        const vStart = routeVertexStart[ri];
        const vEnd = ri < ROUTES.length - 1 ? routeVertexStart[ri + 1] : colorAttr.count;
        for (let vi = vStart; vi < vEnd; vi++) {
          colorAttr.setXYZ(vi, _c.r, _c.g, _c.b);
        }
      }
      (colorAttr as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  return (
    <group>
      <FieldHints />
      <ServerNode activationRef={serverActivation} />

      {/* Curved routes — vertex colors updated each frame */}
      <lineSegments ref={routeLinesRef} geometry={routeGeo}>
        <lineBasicMaterial vertexColors transparent opacity={0.85} />
      </lineSegments>

      {/* Formation nodes */}
      {NODES.map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          {/* Outer halo */}
          <mesh>
            <sphereGeometry args={[NODE_HALO_R, 10, 10]} />
            <meshBasicMaterial color={C_NODE_HALO} transparent opacity={0.07} depthWrite={false} />
          </mesh>
          {/* Core node — emissiveIntensity driven by useFrame */}
          <mesh
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[NODE_R, 12, 12]} />
            <meshStandardMaterial
              color={C_NODE}
              emissive={C_NODE}
              emissiveIntensity={NODE_EMISSIVE_BASE}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Signal packets */}
      {PULSE_PATHS.map((_, pi) => (
        <group
          key={pi}
          ref={(el) => {
            pulseRefs.current[pi] = el;
          }}
          visible={false}
        >
          <mesh>
            <sphereGeometry args={[PULSE_R, 8, 8]} />
            <meshBasicMaterial color={C_PULSE} transparent opacity={0.95} depthWrite={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[PULSE_HALO_R, 8, 8]} />
            <meshBasicMaterial color={C_PULSE_HALO} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── SceneLights ──────────────────────────────────────────────────────────────

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 4, 5]} color="#38bdf8" intensity={0.55} distance={16} />
      <pointLight position={[-5, 2, 3]} color="#818cf8" intensity={0.22} distance={14} />
      <pointLight position={[5, 2, 3]} color="#22d3ee" intensity={0.22} distance={14} />
    </>
  );
}

// ─── HeroScene ────────────────────────────────────────────────────────────────

interface HeroSceneProps {
  lang: string;
  heroHeader: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroBadge: string;
  heroDragHint: string; // kept for API compatibility
}

export default function HeroScene({ lang, heroHeader, heroCtaPrimary, heroCtaSecondary, heroBadge }: HeroSceneProps) {
  const noMotion = useReducedMotion();

  return (
    <div className="relative flex flex-col">
      {/* Full-screen canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0.25, 12], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
          style={{ width: '100%', height: '100%', background: '#060810' }}
        >
          <fog attach="fog" args={['#060810', 18, 32]} />
          <SceneLights />
          <Suspense fallback={null}>
            <NetworkScene noMotion={noMotion} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Top: badge + headline */}
        <div
          className="flex-none pt-24 pb-10 px-6 text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(6,8,16,0.92) 0%, rgba(6,8,16,0.55) 70%, transparent 100%)'
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400 mb-5">
            <span className="block w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" aria-hidden="true" />
            {heroBadge}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-tight max-w-2xl mx-auto">
            {heroHeader}
          </h1>
        </div>

        {/* Bottom: CTAs */}
        <div
          className="flex-none pb-10 pt-8 px-6 pointer-events-auto"
          style={{
            background: 'linear-gradient(0deg, rgba(6,8,16,0.92) 0%, rgba(6,8,16,0.55) 70%, transparent 100%)'
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
              href={RECRUITMENT_FORM_LINK}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
            >
              {heroCtaSecondary}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
