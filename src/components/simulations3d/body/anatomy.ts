import * as THREE from 'three';

/**
 * Procedural anatomical geometries for the Human Body 3D simulation.
 * Every builder returns a ready BufferGeometry with recomputed normals so
 * organs read as soft biological tissue instead of primitive spheres.
 */

const noise = (x: number, y: number, z: number) =>
  Math.sin(x * 1.7 + y * 2.3) * Math.sin(y * 2.9 - z * 1.9) * Math.sin(z * 2.1 + x * 1.3);

/** Deform a unit sphere with a per-vertex displacement function. */
const deformedSphere = (
  segW: number,
  segH: number,
  fn: (v: THREE.Vector3, u: number, phi: number, theta: number) => void
) => {
  const geo = new THREE.SphereGeometry(1, segW, segH);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const theta = Math.atan2(v.z, v.x);
    const phi = Math.acos(THREE.MathUtils.clamp(v.y, -1, 1));
    fn(v, i / pos.count, phi, theta);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
};

/** Sweep a circular cross-section of varying radius along a curve. */
export const sweepGeometry = (
  curve: THREE.Curve<THREE.Vector3>,
  radiusAt: (t: number) => number,
  tubular = 96,
  radial = 20
) => {
  const frames = curve.computeFrenetFrames(tubular, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const p = new THREE.Vector3();

  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t, p);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = radiusAt(t);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const sin = Math.sin(a);
      const cos = -Math.cos(a);
      positions.push(p.x + r * (cos * N.x + sin * B.x), p.y + r * (cos * N.y + sin * B.y), p.z + r * (cos * N.z + sin * B.z));
      uvs.push(t, j / radial);
    }
  }
  for (let i = 1; i <= tubular; i++) {
    for (let j = 1; j <= radial; j++) {
      const a = (radial + 1) * (i - 1) + (j - 1);
      const b = (radial + 1) * i + (j - 1);
      const c = (radial + 1) * i + j;
      const d = (radial + 1) * (i - 1) + j;
      indices.push(a, b, d, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
};

/** Whole heart: bilobed base, tapered apex, slight anterior bulge. */
export const heartGeometry = (detail = 64) =>
  deformedSphere(detail, Math.round(detail * 0.75), (v) => {
    const y = v.y;
    // taper towards the apex (bottom), widen at the base
    const taper = 0.55 + 0.62 * Math.pow(THREE.MathUtils.clamp((y + 1) / 2, 0, 1), 0.55);
    v.x *= taper * 1.02;
    v.z *= taper * 0.86;
    v.y = y * 1.25 - 0.12;
    // interventricular groove on the front face
    const groove = Math.exp(-Math.pow(v.x / 0.28, 2)) * Math.max(0, v.z) * 0.22;
    v.z -= groove;
    // atrial lobes at the top
    if (y > 0.45) {
      const lobe = Math.cos(Math.atan2(v.z, v.x) * 2) * (y - 0.45) * 0.5;
      v.x += lobe * 0.35;
    }
    v.multiplyScalar(1 + noise(v.x * 2, v.y * 2, v.z * 2) * 0.02);
  });

/** Lung with apex, costal convexity and a medial hilar concavity. */
export const lungGeometry = (side: 1 | -1, lobes = 3, detail = 56) =>
  deformedSphere(detail, Math.round(detail * 0.8), (v) => {
    const y = v.y;
    // apex narrow, base broad and flat
    const taper = 0.5 + 0.55 * (1 - Math.pow(THREE.MathUtils.clamp((y + 1) / 2, 0, 1), 1.5));
    v.x *= 0.75 + taper * 0.55;
    v.z *= 0.7 + taper * 0.5;
    v.y = y * 1.45;
    if (v.y < -1.15) v.y = -1.15 - (v.y + 1.15) * 0.25; // flat diaphragmatic surface
    // medial concavity (hilum)
    const medial = side > 0 ? -v.x : v.x;
    if (medial > 0) {
      const dent = Math.exp(-Math.pow((v.y + 0.1) / 0.55, 2)) * 0.45;
      v.x += side > 0 ? dent : -dent;
    }
    // lobar fissures
    const f = Math.sin((v.y + 1) * Math.PI * (lobes - 1) * 0.5);
    v.multiplyScalar(1 - Math.pow(Math.abs(f), 12) * 0.12);
  });

/** Cerebrum with gyri/sulci relief and a longitudinal fissure. */
export const brainGeometry = (detail = 96) =>
  deformedSphere(detail, Math.round(detail * 0.75), (v) => {
    const gyri =
      Math.sin(v.x * 7.5 + v.y * 3.1) * 0.045 +
      Math.sin(v.z * 8.2 - v.y * 4.4) * 0.04 +
      Math.sin(v.y * 9.6 + v.x * 2.2) * 0.03;
    v.multiplyScalar(1 + gyri);
    v.x *= 1.02;
    v.z *= 1.18;
    v.y *= 0.9;
    // longitudinal fissure between hemispheres
    const fissure = Math.exp(-Math.pow(v.x / 0.12, 2)) * Math.max(0, v.y) * 0.3;
    v.y -= fissure;
    // frontal lobe slightly narrower than occipital
    if (v.z > 0) v.x *= 1 - v.z * 0.06;
  });

/** Cerebellum: tighter, horizontally foliated. */
export const cerebellumGeometry = (detail = 48) =>
  deformedSphere(detail, Math.round(detail * 0.7), (v) => {
    v.multiplyScalar(1 + Math.sin(v.y * 26) * 0.035);
    v.y *= 0.62;
    v.z *= 0.8;
    const midline = Math.exp(-Math.pow(v.x / 0.13, 2)) * 0.12;
    v.multiplyScalar(1 - midline);
  });

/** Bean-shaped kidney with hilar notch. */
export const kidneyGeometry = (detail = 56) =>
  deformedSphere(detail, Math.round(detail * 0.8), (v) => {
    v.y *= 1.42;
    v.z *= 0.66;
    // concave medial border
    const dent = Math.exp(-Math.pow(v.y / 0.42, 2)) * 0.62;
    v.x = v.x < 0 ? v.x + dent : v.x * (1 + 0.12 * Math.exp(-Math.pow(v.y / 0.9, 2)));
    v.multiplyScalar(1 + noise(v.x * 3, v.y * 3, v.z * 3) * 0.012);
  });

/** J-shaped stomach: fundus, body, pyloric antrum. */
export const stomachGeometry = () => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, 1.5, 0),
    new THREE.Vector3(-0.15, 0.85, 0.05),
    new THREE.Vector3(-0.05, 0.1, 0),
    new THREE.Vector3(0.25, -0.7, -0.05),
    new THREE.Vector3(0.85, -1.15, 0),
    new THREE.Vector3(1.35, -0.9, 0),
  ]);
  return sweepGeometry(curve, (t) => 0.16 + Math.sin(Math.pow(t, 0.85) * Math.PI) * 0.72 * (1 - t * 0.45), 110, 26);
};

/** Wedge-shaped liver with an inferior notch. */
export const liverGeometry = (detail = 56) =>
  deformedSphere(detail, Math.round(detail * 0.7), (v) => {
    v.x *= 1.85;
    v.z *= 1.05;
    v.y *= 0.72;
    // flat inferior surface, domed superior surface
    if (v.y < 0) v.y *= 0.5;
    // falciform notch on the anterior border
    const notch = Math.exp(-Math.pow((v.x - 0.15) / 0.28, 2)) * Math.max(0, v.z) * 0.3;
    v.z -= notch;
    // right lobe larger than left
    if (v.x < 0) v.multiplyScalar(0.86);
  });

/** Fusiform skeletal muscle belly with tendon tapers. */
export const muscleGeometry = (bulge = 1, length = 3.2) => {
  const pts: THREE.Vector2[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = 0.09 + Math.pow(Math.sin(t * Math.PI), 1.35) * 0.72 * bulge;
    pts.push(new THREE.Vector2(Math.max(0.045, r), (t - 0.5) * length));
  }
  const geo = new THREE.LatheGeometry(pts, 32);
  geo.computeVertexNormals();
  return geo;
};

/** Long bone with expanded epiphyses. */
export const boneGeometry = (length = 4.6) => {
  const pts: THREE.Vector2[] = [];
  const steps = 44;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ends = Math.pow(Math.abs(t - 0.5) * 2, 3.2);
    const r = 0.24 + ends * 0.34 + Math.sin(t * Math.PI) * 0.03;
    pts.push(new THREE.Vector2(r, (t - 0.5) * length));
  }
  const geo = new THREE.LatheGeometry(pts, 28);
  geo.computeVertexNormals();
  return geo;
};

/** Shared tissue material parameters for a soft, wet, sub-surface look. */
export const tissueMaterial = (color: string, emissive: string, intensity: number, opacity = 1) => ({
  color,
  emissive,
  emissiveIntensity: intensity,
  roughness: 0.42,
  clearcoat: 0.55,
  clearcoatRoughness: 0.35,
  sheen: 0.6,
  sheenColor: '#ffd9d9',
  transparent: opacity < 1,
  opacity,
});
