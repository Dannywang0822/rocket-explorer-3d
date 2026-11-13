import { bodyPartAt } from '../data/lessons';
import type { Model3 } from '../data/types';

export type V3 = [number, number, number];
export type Ring3 = [number, number, number];

export type Face3 = { v: [V3, V3, V3]; n: V3; col: V3; part: string };

export type Mesh3 = { faces: Face3[]; parts: number };

export type Orbit3 = { yaw: number; pitch: number; zoom: number };

export const startOrbit3: Orbit3 = { yaw: 0.65, pitch: 0.13, zoom: 1 };
export const zoomMin = 0.55;
export const zoomMax = 2.8;

const COLORS: V3[] = [
  [0.91, 0.925, 0.94],
  [0.1, 0.12, 0.15],
  [0.49, 0.54, 0.57],
  [0.73, 0.32, 0.13],
  [0.7, 0.13, 0.12],
];

export function clamp3(x: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, x));
}

export function safeOrbit3(v: Orbit3): Orbit3 {
  return {
    yaw: ((v.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
    pitch: clamp3(v.pitch, -1.55, 1.55),
    zoom: clamp3(v.zoom, zoomMin, zoomMax),
  };
}

/** Same view matrix as the original exhibit. Positive pitch looks onto the nose. */
export function matrix3(v: Orbit3): number[] {
  const c = Math.cos(v.yaw);
  const s = Math.sin(v.yaw);
  const p = Math.cos(v.pitch);
  const q = Math.sin(v.pitch);
  return [c, q * s, -p * s, 0, p, q, s, -q * c, p * c];
}

export function rotate3(v: V3, m: number[]): V3 {
  return [
    m[0] * v[0] + m[3] * v[1] + m[6] * v[2],
    m[1] * v[0] + m[4] * v[1] + m[7] * v[2],
    m[2] * v[0] + m[5] * v[1] + m[8] * v[2],
  ];
}

/**
 * Parametric XYZ mesh for one published rocket outline.
 * Profile tuples are [height from the tail in meters, radius in meters, material].
 * Material 5 paints alternating light and dark bands. This is a simplified
 * educational reconstruction, not an official engineering mesh.
 */
export function makeRocketMesh(m: Model3): Mesh3 {
  const faces: Face3[] = [];
  const scale = 2 / m.height;
  let parts = 0;

  const triangle = (a: V3, b: V3, c: V3, material: number, part: string): void => {
    const u: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v: V3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n: V3 = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const len = Math.hypot(n[0], n[1], n[2]);
    if (len < 1e-9) return;
    const pt = (p: V3): V3 => [p[0] * scale, (p[1] - m.height / 2) * scale, p[2] * scale];
    faces.push({
      v: [pt(a), pt(b), pt(c)],
      n: [n[0] / len, n[1] / len, n[2] / len],
      col: COLORS[material] || COLORS[0],
      part,
    });
  };

  const lathe = (
    profile: Ring3[],
    offset = 0,
    angle = 0,
    lean = 0,
    segments = 32,
    partFor: (y0: number, y1: number) => string = () => 'body',
  ): void => {
    parts += 1;
    const baseY = profile[0][0];
    const topY = Math.max(...profile.map((p) => p[0]));
    const vertex = (p: Ring3, a: number): V3 => {
      const d = offset - (lean * (p[0] - baseY)) / Math.max(1e-6, topY - baseY);
      return [Math.cos(angle) * d + Math.cos(a) * p[1], p[0], Math.sin(angle) * d + Math.sin(a) * p[1]];
    };
    for (let j = 0; j < profile.length - 1; j++) {
      const p = profile[j];
      const q = profile[j + 1];
      const steps = Math.max(1, Math.ceil(Math.abs(q[0] - p[0]) / (m.height / 25)));
      for (let k = 0; k < steps; k++) {
        const lerp = (f: number): Ring3 => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, p[2]];
        const lo = lerp(k / steps);
        const hi = lerp((k + 1) / steps);
        const part = partFor(lo[0], hi[0]);
        for (let i = 0; i < segments; i++) {
          const a = (i * Math.PI * 2) / segments;
          const b = ((i + 1) * Math.PI * 2) / segments;
          const c = p[2] === 5 ? (Math.floor(i / 4) % 2 === 0 ? 1 : 0) : p[2];
          const v0 = vertex(lo, a);
          const v1 = vertex(hi, a);
          const v2 = vertex(hi, b);
          const v3 = vertex(lo, b);
          triangle(v0, v1, v3, c, part);
          triangle(v1, v2, v3, c, part);
        }
      }
    }
  };

  const bell = (cx: number, cz: number, r: number, len: number, part: string): void => {
    const p: Ring3[] = [
      [0.03, r, 2],
      [0.12, r, 2],
      [len * 0.65, r * 0.65, 2],
      [len, r * 0.38, 1],
      [len, r * 0.24, 1],
      [len * 0.65, r * 0.5, 1],
      [0.12, r * 0.83, 1],
      [0.03, r * 0.83, 2],
      [0.03, r, 2],
    ];
    parts += 1;
    for (let j = 0; j < p.length - 1; j++) {
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8;
        const b = ((i + 1) * Math.PI) / 8;
        const get = (v: Ring3, t: number): V3 => [cx + Math.cos(t) * v[1], v[0], cz + Math.sin(t) * v[1]];
        triangle(get(p[j], a), get(p[j + 1], a), get(p[j], b), p[j][2], part);
        triangle(get(p[j + 1], a), get(p[j + 1], b), get(p[j], b), p[j][2], part);
      }
    }
  };

  const engines = (count: number, cx: number, cz: number, bodyR: number, part: string): void => {
    if (count === 0) return;
    const rr = count === 30 ? 0.57 : count === 9 ? 0.37 : count === 5 ? 1.25 : count === 4 ? bodyR * 0.27 : bodyR * 0.32;
    const len = count === 30 ? 2 : count === 5 ? 2 : 1.35;
    if (count === 30) {
      for (let i = 0; i < 24; i++) {
        const a = (i * Math.PI) / 12;
        bell(cx + 6.65 * Math.cos(a), cz + 6.65 * Math.sin(a), rr, len, part);
      }
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        bell(cx + 3.1 * Math.cos(a), cz + 3.1 * Math.sin(a), rr, len, part);
      }
      return;
    }
    if (count === 9 || count === 5) {
      bell(cx, cz, rr, len, part);
      const n = count - 1;
      const orbit = count === 9 ? 1.12 : 3.05;
      for (let i = 0; i < n; i++) {
        const a = ((i + 0.5) * Math.PI * 2) / n;
        bell(cx + orbit * Math.cos(a), cz + orbit * Math.sin(a), rr, len, part);
      }
      return;
    }
    for (let i = 0; i < count; i++) {
      const a = count === 2 ? i * Math.PI : ((i + 0.5) * Math.PI * 2) / count;
      const d = count === 1 ? 0 : bodyR * 0.52;
      bell(cx + d * Math.cos(a), cz + d * Math.sin(a), rr, len, part);
    }
  };

  const plate = (angle: number, base: number, outer: number, y0: number, y1: number, y2: number, material = 2, part = 'body'): void => {
    parts += 1;
    const p = (r: number, y: number, t: number): V3 => [
      Math.cos(angle) * r - Math.sin(angle) * t,
      y,
      Math.sin(angle) * r + Math.cos(angle) * t,
    ];
    const thickness = m.height * 0.0009;
    const v = [
      p(base, y0, -thickness),
      p(outer, y1, -thickness),
      p(base, y2, -thickness),
      p(base, y0, thickness),
      p(outer, y1, thickness),
      p(base, y2, thickness),
    ];
    const idx = [
      [0, 2, 1],
      [3, 4, 5],
      [0, 1, 4],
      [0, 4, 3],
      [1, 2, 5],
      [1, 5, 4],
      [2, 0, 3],
      [2, 3, 5],
    ];
    for (const f of idx) triangle(v[f[0]], v[f[1]], v[f[2]], material, part);
  };

  lathe(m.profile, 0, 0, 0, 32, (y0, y1) => bodyPartAt(m.id, (y0 + y1) / 2));
  const bodyR = m.id === 'saturnv' ? 5.03 : m.id === 'soyuzfg' ? 1.475 : m.id === 'cz5b' ? 2.5 : 1.675;
  engines(m.engines, 0, 0, bodyR, 'engines');

  if (m.boost) {
    const b = m.boost;
    for (let i = 0; i < b.n; i++) {
      const angle = (i * Math.PI * 2) / b.n;
      let p: Ring3[];
      if (b.style === 'soyuz') {
        p = [
          [1.2, 0, 2],
          [1.2, b.r, 3],
          [3, b.r, 2],
          [9, b.r * 0.88, 2],
          [15, b.r * 0.44, 2],
          [b.height, b.r * 0.035, 2],
          [b.height, 0, 2],
        ];
      } else if (b.style === 'tank') {
        p = [
          [1.35, 0, 2],
          [1.35, b.r * 0.9, 0],
          [3, b.r, 0],
          [b.height - 3, b.r, 0],
          [b.height - 1, b.r * 0.7, 0],
          [b.height, 0, 0],
        ];
      } else if (b.style === 'falcon') {
        p = [
          [1.3, 0, 2],
          [1.3, b.r, 0],
          [39.7, b.r, 1],
          [41.5, b.r, 0],
          [43.7, b.r * 0.6, 0],
          [b.height, 0, 0],
        ];
      } else {
        p = [
          [1.3, 0, 2],
          [1.3, b.r, 0],
          [b.height * 0.78, b.r, 0],
          [b.height * 0.9, b.r * 0.7, 0],
          [b.height, 0, 0],
        ];
      }
      const sidePart = m.id === 'proton' ? 'tanks' : 'boosters';
      const sideEngines = m.id === 'proton' ? 'engines' : 'booster-engines';
      lathe(p, b.offset, angle, b.lean || 0, 32, () => sidePart);
      engines(b.engines, Math.cos(angle) * b.offset, Math.sin(angle) * b.offset, b.r, sideEngines);
      if (b.style === 'falcon') {
        for (let j = 0; j < 4; j++) {
          const a = (j * Math.PI) / 2;
          const cx = Math.cos(angle) * b.offset;
          const cz = Math.sin(angle) * b.offset;
          const old = faces.length;
          plate(a, 1.8, 2.05, 2, 3, 11, 1, 'boosters');
          for (let k = old; k < faces.length; k++) {
            for (const vert of faces[k].v) {
              vert[0] += cx * scale;
              vert[2] += cz * scale;
            }
          }
        }
      }
    }
  }

  if (m.id === 'heavy') {
    for (const a of [0, Math.PI]) {
      plate(a, 1.8, 2.28, 11, 11.3, 11.6, 2, 'links');
      plate(a, 1.8, 2.28, 37.5, 37.8, 38.1, 2, 'links');
    }
  }
  if (m.fins) {
    const finPart = m.id === 'soyuzfg' ? 'fins' : 's1';
    for (let i = 0; i < 4; i++) plate((i * Math.PI) / 2, m.fins.base, m.fins.outer, m.fins.y0, m.fins.y1, m.fins.y2, 2, finPart);
  }
  if (m.id === 'falcon9' || m.id === 'heavy') {
    for (let i = 0; i < 4; i++) {
      plate((i * Math.PI) / 2, 1.81, 2.05, 2, 3, 11, 1, 'legs');
      plate((i * Math.PI) / 2, 1.83, 2.36, 40.5, 40.9, 41.4, 1, 'grids');
    }
  }

  return { faces, parts };
}

export function meshBounds(mesh: Mesh3): { min: V3; max: V3 } {
  const min: V3 = [Infinity, Infinity, Infinity];
  const max: V3 = [-Infinity, -Infinity, -Infinity];
  for (const f of mesh.faces) {
    for (const p of f.v) {
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], p[i]);
        max[i] = Math.max(max[i], p[i]);
      }
    }
  }
  return { min, max };
}
