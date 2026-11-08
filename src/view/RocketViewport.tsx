import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import type { Model3 } from '../data/types';
import { makeRocketMesh, matrix3, rotate3, safeOrbit3, startOrbit3, type Mesh3, type Orbit3 } from '../geom/rocketMesh';

export type RocketInfo = { renderer: string; rendererLabel: string; faces: number; parts: number };

export type RocketHandle = {
  getOrbit: () => Orbit3;
  setOrbit: (next: Orbit3) => void;
};

type Props = {
  model: Model3;
  spin: boolean;
  wire: boolean;
  active: boolean;
  onSpin: (value: boolean) => void;
  onZoom: (zoom: number) => void;
  onInfo: (info: RocketInfo) => void;
  children?: ReactNode;
};

function labelFor(mode: string): string {
  if (mode === 'webgl2') return 'WebGL2 三角网格＋深度缓存';
  if (mode === 'webgl') return 'WebGL 三角网格＋深度缓存';
  if (mode === 'canvas2d') return '同一三维网格的平面投影＋三角面深度排序';
  return '三维画布初始化失败，请刷新或更换支持画布的浏览器';
}

function canUseWebGL(): 'webgl2' | 'webgl' | null {
  try {
    const probe = document.createElement('canvas');
    if (probe.getContext('webgl2')) return 'webgl2';
    if (probe.getContext('webgl')) return 'webgl';
  } catch {
    return null;
  }
  return null;
}

export const RocketViewport = forwardRef<RocketHandle, Props>(function RocketViewport(
  { model, spin, wire, active, onSpin, onZoom, onInfo, children },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<Orbit3>({ ...startOrbit3 });
  const spinRef = useRef(spin);
  const wireRef = useRef(wire);
  const activeRef = useRef(active);
  const onSpinRef = useRef(onSpin);
  const onZoomRef = useRef(onZoom);
  const onInfoRef = useRef(onInfo);
  spinRef.current = spin;
  wireRef.current = wire;
  activeRef.current = active;
  onSpinRef.current = onSpin;
  onZoomRef.current = onZoom;
  onInfoRef.current = onInfo;

  useImperativeHandle(ref, () => ({
    getOrbit: () => ({ ...orbitRef.current }),
    setOrbit: (next: Orbit3) => {
      orbitRef.current = safeOrbit3(next);
      onZoomRef.current(orbitRef.current.zoom);
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const built = makeRocketMesh(model);
    const canvas = document.createElement('canvas');
    canvas.className = 'rocket-canvas';
    canvas.tabIndex = 0;
    canvas.setAttribute('data-rocket-canvas', 'true');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute(
      'aria-label',
      `${model.title}。真实三维网格，可左右上下拖动旋转，滚轮或双指缩放。方向键旋转，加减号缩放，Home 复位。`,
    );
    host.replaceChildren(canvas);

    let stopped = false;
    let raf = 0;
    const mode = canUseWebGL();
    const rendererMode = mode ?? 'canvas2d';
    canvas.dataset.renderer = rendererMode;
    canvas.dataset.faces = String(built.faces.length);
    canvas.dataset.model = model.id;
    onInfoRef.current({
      renderer: rendererMode,
      rendererLabel: labelFor(rendererMode),
      faces: built.faces.length,
      parts: built.parts,
    });

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let geometry: THREE.BufferGeometry | null = null;
    let solidMat: THREE.Material | null = null;
    let wireMat: THREE.Material | null = null;
    let ctx2d: CanvasRenderingContext2D | null = null;
    const disposables: { dispose: () => void }[] = [];
    let paint: (w: number, h: number, orbit: Orbit3) => void = () => {};

    if (mode) {
      try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
      renderer.setClearColor(0x0b1426, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(35, 1, 0.05, 40);
      camera.position.set(0, 0, 4.2);
      camera.lookAt(0, 0, 0);

      const hemi = new THREE.HemisphereLight(0xe7f1ff, 0x2a2118, 0.72);
      const key = new THREE.DirectionalLight(0xffffff, 1.55);
      key.position.set(-2.4, 3.6, 5.2);
      const fill = new THREE.DirectionalLight(0x8ec8ff, 0.55);
      fill.position.set(4.2, 0.6, 1.2);
      const rim = new THREE.DirectionalLight(0xffd7a1, 0.42);
      rim.position.set(0.2, -1.4, -4.5);
      scene.add(hemi, key, fill, rim);

      const starPositions: number[] = [];
      for (let i = 0; i < 180; i++) {
        starPositions.push((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, -2.2 - Math.random() * 3.5);
      }
      const stars = new THREE.BufferGeometry();
      stars.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xd5e4f7, size: 0.015, sizeAttenuation: true });
      scene.add(new THREE.Points(stars, starMat));
      disposables.push(stars, starMat);

      geometry = new THREE.BufferGeometry();
      const pos = new Float32Array(built.faces.length * 9);
      const nor = new Float32Array(built.faces.length * 9);
      const col = new Float32Array(built.faces.length * 9);
      built.faces.forEach((face, i) => {
        for (let k = 0; k < 3; k++) {
          const o = (i * 3 + k) * 3;
          pos[o] = face.v[k][0];
          pos[o + 1] = face.v[k][1];
          pos[o + 2] = face.v[k][2];
          nor[o] = face.n[0];
          nor[o + 1] = face.n[1];
          nor[o + 2] = face.n[2];
          col[o] = face.col[0];
          col[o + 1] = face.col[1];
          col[o + 2] = face.col[2];
        }
      });
      geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
      solidMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.58,
        metalness: 0.12,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
      wireMat = new THREE.MeshBasicMaterial({
        color: 0xd5e7f8,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const rocket = new THREE.Mesh(geometry, solidMat);
      const wires = new THREE.Mesh(geometry, wireMat);
      rocket.matrixAutoUpdate = false;
      wires.matrixAutoUpdate = false;
      scene.add(rocket, wires);
      disposables.push(geometry, solidMat, wireMat);
      const glRenderer = renderer;
      const glScene = scene;
      const glCamera = camera;
      paint = (w, h, orbit) => {
        const mat = matrix3(orbit);
        const m4 = new THREE.Matrix4().set(
          mat[0], mat[3], mat[6], 0,
          mat[1], mat[4], mat[7], 0,
          mat[2], mat[5], mat[8], 0,
          0, 0, 0, 1,
        );
        rocket.matrix.copy(m4);
        wires.matrix.copy(m4);
        wires.visible = wireRef.current;
        glCamera.aspect = w / h;
        glCamera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(1 / (3.2 * orbit.zoom)));
        glCamera.updateProjectionMatrix();
        glRenderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        glRenderer.setSize(w, h, false);
        glRenderer.render(glScene, glCamera);
      };
      } catch {
        renderer = null;
        canvas.dataset.renderer = 'canvas2d';
        ctx2d = canvas.getContext('2d');
        onInfoRef.current({
          renderer: ctx2d ? 'canvas2d' : 'failed',
          rendererLabel: labelFor(ctx2d ? 'canvas2d' : 'failed'),
          faces: built.faces.length,
          parts: built.parts,
        });
        paint = (w, h, orbit) => paint2d(ctx2d, built, w, h, orbit, wireRef.current);
      }
    } else {
      ctx2d = canvas.getContext('2d');
      canvas.dataset.renderer = ctx2d ? 'canvas2d' : 'failed';
      onInfoRef.current({
        renderer: canvas.dataset.renderer || 'failed',
        rendererLabel: labelFor(canvas.dataset.renderer || 'failed'),
        faces: built.faces.length,
        parts: built.parts,
      });
      paint = (w, h, orbit) => paint2d(ctx2d, built, w, h, orbit, wireRef.current);
    }

    const pointers = new Map<number, { x: number; y: number }>();
    let drag: { id: number; x: number; y: number } | null = null;
    let pinchDist = 0;
    let pinchZoom = 1;

    const publishZoom = () => onZoomRef.current(orbitRef.current.zoom);
    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture?.(e.pointerId);
      canvas.focus();
      if (pointers.size >= 2) {
        const pts = [...pointers.values()];
        pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        pinchZoom = orbitRef.current.zoom;
        drag = null;
        onSpinRef.current(false);
      } else {
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
        onSpinRef.current(false);
      }
    };
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2) {
        const pts = [...pointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        orbitRef.current = safeOrbit3({ ...orbitRef.current, zoom: pinchZoom * (dist / pinchDist) });
        publishZoom();
        return;
      }
      if (!drag || drag.id !== e.pointerId) return;
      const v = orbitRef.current;
      orbitRef.current = safeOrbit3({
        ...v,
        yaw: v.yaw + (e.clientX - drag.x) * 0.009,
        pitch: v.pitch + (e.clientY - drag.y) * 0.007,
      });
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (drag?.id === e.pointerId) drag = null;
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 1) {
        const only = [...pointers.entries()][0];
        drag = { id: only[0], x: only[1].x, y: only[1].y };
      }
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const v = orbitRef.current;
      orbitRef.current = safeOrbit3({ ...v, zoom: v.zoom * Math.exp(-e.deltaY * 0.001) });
      publishZoom();
    };
    const key = (e: KeyboardEvent) => {
      const v = orbitRef.current;
      let next = v;
      if (e.key === 'ArrowLeft') next = { ...v, yaw: v.yaw - 0.2 };
      else if (e.key === 'ArrowRight') next = { ...v, yaw: v.yaw + 0.2 };
      else if (e.key === 'ArrowUp') next = { ...v, pitch: v.pitch + 0.15 };
      else if (e.key === 'ArrowDown') next = { ...v, pitch: v.pitch - 0.15 };
      else if (e.key === '+' || e.key === '=') next = { ...v, zoom: v.zoom + 0.15 };
      else if (e.key === '-') next = { ...v, zoom: v.zoom - 0.15 };
      else if (e.key === 'Home') next = { ...startOrbit3 };
      else return;
      e.preventDefault();
      onSpinRef.current(false);
      orbitRef.current = safeOrbit3(next);
      publishZoom();
    };
    const blockMenu = (e: Event) => e.preventDefault();
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', wheel, { passive: false });
    canvas.addEventListener('keydown', key);
    canvas.addEventListener('contextmenu', blockMenu);

    let last = 0;
    const frame = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(50, now - last) : 0;
      last = now;
      if (spinRef.current && !drag && pointers.size === 0) {
        const v = orbitRef.current;
        orbitRef.current = safeOrbit3({ ...v, yaw: v.yaw + dt * 0.00028 });
      }
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (!activeRef.current || rect.width < 2 || rect.height < 2) return;
      const orbit = orbitRef.current;
      canvas.dataset.yaw = orbit.yaw.toFixed(4);
      canvas.dataset.pitch = orbit.pitch.toFixed(4);
      canvas.dataset.zoom = orbit.zoom.toFixed(4);
      paint(w, h, orbit);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('wheel', wheel);
      canvas.removeEventListener('keydown', key);
      canvas.removeEventListener('contextmenu', blockMenu);
      for (const item of disposables) item.dispose();
      renderer?.dispose();
      canvas.remove();
    };
  }, [model]);

  return (
    <div className="viewport-wrap">
      <div className="viewport-stage">
        <div ref={hostRef} className="viewport" />
        {children}
      </div>
      <p className="drag-hint">按住拖动可以转一圈 · 上下看顶部和喷口 · 滚轮或双指缩放</p>
    </div>
  );
});

function paint2d(
  ctx: CanvasRenderingContext2D | null,
  mesh: Mesh3,
  cssW: number,
  cssH: number,
  orbit: Orbit3,
  wire: boolean,
) {
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(cssW * dpr));
  const h = Math.max(1, Math.round(cssH * dpr));
  const canvas = ctx.canvas;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const mat = matrix3(orbit);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0b1426';
  ctx.fillRect(0, 0, w, h);
  const projected = mesh.faces
    .map((f) => {
      const pts = f.v.map((p) => rotate3(p, mat));
      return { f, pts, z: (pts[0][2] + pts[1][2] + pts[2][2]) / 3 };
    })
    .sort((a, b) => a.z - b.z);
  for (const p of projected) {
    const n = rotate3(p.f.n, mat);
    const light = 0.32 + 0.68 * Math.abs((-0.7 * n[0] + 0.8 * n[1] + 1.2 * n[2]) / 1.603);
    ctx.beginPath();
    p.pts.forEach((a, i) => {
      const k = (h * 1.6 * orbit.zoom) / (4.2 - a[2]);
      const x = w / 2 + a[0] * k;
      const y = h / 2 - a[1] * k;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    const rgb = p.f.col.map((x) => Math.round(Math.max(0, Math.min(1, x * light)) * 255)).join(',');
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.fill();
    if (wire) {
      ctx.strokeStyle = 'rgba(213,231,248,0.55)';
      ctx.lineWidth = 0.6 * dpr;
      ctx.stroke();
    }
  }
}
