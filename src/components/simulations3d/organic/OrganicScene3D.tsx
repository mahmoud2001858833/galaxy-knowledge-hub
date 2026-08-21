import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import {
  ELEMENT_COLOR,
  ELEMENT_RADIUS,
  ISOMER_SETS,
  Molecule,
  OrganicMode,
  findMolecule,
  findReactionO,
} from '@/lib/sim-physics/organic';

interface OrganicScene3DProps {
  mode: OrganicMode;
  moleculeId: string;
  isomerSet: number;
  reactionId: string;
  spaceFilling: boolean;
  showHydrogens: boolean;
  showLabels: boolean;
  playing: boolean;
  timeScale: number;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const SCALE = 1.9;

/** One bond drawn as one, two or three parallel cylinders. */
const BondMesh = ({
  from,
  to,
  order,
  quality,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  order: 1 | 2 | 3;
  quality: number;
}) => {
  const { position, quaternion, length, offsets } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const perp = new THREE.Vector3(0, 0, 1).cross(dir).normalize();
    if (perp.lengthSq() < 0.001) perp.set(1, 0, 0);
    const gap = 0.16;
    const offs =
      order === 1
        ? [new THREE.Vector3()]
        : order === 2
          ? [perp.clone().multiplyScalar(gap), perp.clone().multiplyScalar(-gap)]
          : [perp.clone().multiplyScalar(gap * 1.4), new THREE.Vector3(), perp.clone().multiplyScalar(-gap * 1.4)];
    return { position: mid, quaternion: q, length: len, offsets: offs };
  }, [from, to, order]);

  const radius = order === 1 ? 0.085 : 0.06;

  return (
    <>
      {offsets.map((o, i) => (
        <mesh
          key={i}
          position={[position.x + o.x, position.y + o.y, position.z + o.z]}
          quaternion={quaternion}
        >
          <cylinderGeometry args={[radius, radius, length, quality >= 32 ? 12 : 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
    </>
  );
};

/** A full molecule: atoms as spheres, bonds as cylinders. */
const MoleculeMesh = ({
  molecule,
  spaceFilling,
  showHydrogens,
  spin,
  playing,
  timeScale,
  opacity = 1,
}: {
  molecule: Molecule;
  spaceFilling: boolean;
  showHydrogens: boolean;
  spin: boolean;
  playing: boolean;
  timeScale: number;
  opacity?: number;
}) => {
  const { settings } = useSimQuality();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (spin && playing && groupRef.current) groupRef.current.rotation.y += delta * 0.35 * timeScale;
  });

  const positions = useMemo(
    () => molecule.atoms.map((a) => new THREE.Vector3(a.x * SCALE, a.y * SCALE, a.z * SCALE)),
    [molecule]
  );

  const seg = settings.segments >= 32 ? 24 : 12;

  return (
    <group ref={groupRef}>
      {molecule.atoms.map((a, i) => {
        if (!showHydrogens && a.el === 'H') return null;
        const r = ELEMENT_RADIUS[a.el] * (spaceFilling ? 1.85 : 1);
        return (
          <mesh key={i} position={positions[i]} castShadow>
            <sphereGeometry args={[r, seg, seg]} />
            <meshStandardMaterial
              color={ELEMENT_COLOR[a.el]}
              roughness={0.3}
              metalness={0.18}
              transparent={opacity < 1}
              opacity={opacity}
              emissive={ELEMENT_COLOR[a.el]}
              emissiveIntensity={0.12}
            />
          </mesh>
        );
      })}

      {!spaceFilling &&
        molecule.bonds.map((b, i) => {
          if (!showHydrogens && (molecule.atoms[b.a].el === 'H' || molecule.atoms[b.b].el === 'H')) return null;
          return (
            <BondMesh
              key={i}
              from={positions[b.a]}
              to={positions[b.b]}
              order={b.order}
              quality={settings.segments}
            />
          );
        })}
    </group>
  );
};

/** Reaction mode: reactants converge, flash, and become the product. */
const ReactionScene = ({
  reactionId,
  spaceFilling,
  showHydrogens,
  showLabels,
  playing,
  timeScale,
  resetKey,
}: {
  reactionId: string;
  spaceFilling: boolean;
  showHydrogens: boolean;
  showLabels: boolean;
  playing: boolean;
  timeScale: number;
  resetKey: number;
}) => {
  const reaction = findReactionO(reactionId);
  const reactants = reaction.reactants.map(findMolecule);
  const product = findMolecule(reaction.product);

  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const productRef = useRef<THREE.Group>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    if (playing) tRef.current = (tRef.current + delta * 0.12 * timeScale) % 1;
    const t = tRef.current;
    const approach = Math.min(1, t / 0.45);
    const formed = t > 0.5;
    const spread = 5.5 * (1 - approach);

    if (leftRef.current) {
      leftRef.current.position.x = -spread - 0.5;
      leftRef.current.visible = !formed;
    }
    if (rightRef.current) {
      rightRef.current.position.x = spread + 0.5;
      rightRef.current.visible = !formed && reactants.length > 1;
    }
    if (productRef.current) {
      productRef.current.visible = formed;
      const s = formed ? Math.min(1, (t - 0.5) / 0.18) : 0;
      productRef.current.scale.setScalar(0.6 + 0.4 * s);
      productRef.current.rotation.y += delta * 0.35 * timeScale;
    }
    if (flashRef.current) {
      const near = 1 - Math.min(1, Math.abs(t - 0.5) / 0.12);
      const mat = flashRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = near * 0.55;
      flashRef.current.scale.setScalar(1 + near * 2.6);
    }
  });

  return (
    <group position={[0, 4.5, 0]} key={resetKey}>
      <group ref={leftRef}>
        <MoleculeMesh
          molecule={reactants[0]}
          spaceFilling={spaceFilling}
          showHydrogens={showHydrogens}
          spin={false}
          playing={playing}
          timeScale={timeScale}
        />
        {showLabels && (
          <SimLabel3D position={[0, 2.8, 0]} distanceFactor={24}>
            {reactants[0].name}
          </SimLabel3D>
        )}
      </group>

      {reactants[1] && (
        <group ref={rightRef}>
          <MoleculeMesh
            molecule={reactants[1]}
            spaceFilling={spaceFilling}
            showHydrogens={showHydrogens}
            spin={false}
            playing={playing}
            timeScale={timeScale}
          />
          {showLabels && (
            <SimLabel3D position={[0, 2.8, 0]} distanceFactor={24}>
              {reactants[1].name}
            </SimLabel3D>
          )}
        </group>
      )}

      <group ref={productRef}>
        <MoleculeMesh
          molecule={product}
          spaceFilling={spaceFilling}
          showHydrogens={showHydrogens}
          spin={false}
          playing={playing}
          timeScale={timeScale}
        />
        {showLabels && (
          <SimLabel3D position={[0, 3, 0]} variant="accent" distanceFactor={24}>
            الناتج: {product.name}
          </SimLabel3D>
        )}
      </group>

      <mesh ref={flashRef}>
        <sphereGeometry args={[1.2, 20, 20]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0} />
      </mesh>

      {showLabels && (
        <SimLabel3D position={[0, -3.4, 0]} variant="muted" distanceFactor={26}>
          {reaction.equation} · {reaction.conditions}
        </SimLabel3D>
      )}
    </group>
  );
};

/** Isomer mode: two molecules with the same formula side by side. */
const IsomerScene = ({
  isomerSet,
  spaceFilling,
  showHydrogens,
  showLabels,
  playing,
  timeScale,
}: {
  isomerSet: number;
  spaceFilling: boolean;
  showHydrogens: boolean;
  showLabels: boolean;
  playing: boolean;
  timeScale: number;
}) => {
  const set = ISOMER_SETS[isomerSet] ?? ISOMER_SETS[0];
  const mols = set.ids.map(findMolecule);

  return (
    <group position={[0, 4.5, 0]}>
      {mols.map((m, i) => (
        <group key={m.id} position={[(i - (mols.length - 1) / 2) * 7, 0, 0]}>
          <MoleculeMesh
            molecule={m}
            spaceFilling={spaceFilling}
            showHydrogens={showHydrogens}
            spin
            playing={playing}
            timeScale={timeScale}
          />
          {showLabels && (
            <>
              <SimLabel3D position={[0, 3, 0]} distanceFactor={26}>
                {m.name}
              </SimLabel3D>
              <SimLabel3D position={[0, -3, 0]} variant="muted" distanceFactor={26}>
                درجة الغليان {m.bp}°م
              </SimLabel3D>
            </>
          )}
        </group>
      ))}
      {showLabels && (
        <SimLabel3D position={[0, 4.4, 0]} variant="accent" distanceFactor={28}>
          الصيغة المشتركة: {set.formula} — {set.label}
        </SimLabel3D>
      )}
    </group>
  );
};

export const OrganicScene3D = ({
  mode,
  moleculeId,
  isomerSet,
  reactionId,
  spaceFilling,
  showHydrogens,
  showLabels,
  playing,
  timeScale,
  view,
  autoRotate,
  resetKey,
}: OrganicScene3DProps) => {
  const molecule = findMolecule(moleculeId);

  return (
    <>
      <SimControls
        view={view}
        autoRotate={autoRotate}
        target={[0, 4.5, 0]}
        scale={mode === 'isomers' ? 1.25 : 0.9}
        minDistance={6}
        maxDistance={60}
        clampGround
      />
      <SimStage size={40} showGrid showAxes={false} />

      {mode === 'model' && (
        <group position={[0, 4.5, 0]}>
          <MoleculeMesh
            molecule={molecule}
            spaceFilling={spaceFilling}
            showHydrogens={showHydrogens}
            spin
            playing={playing}
            timeScale={timeScale}
          />
          {showLabels && (
            <>
              <SimLabel3D position={[0, 3.4, 0]} variant="accent" distanceFactor={24}>
                {molecule.name} — {molecule.formula}
              </SimLabel3D>
              <SimLabel3D position={[0, -3.2, 0]} variant="muted" distanceFactor={26}>
                {molecule.family} · المجموعة الوظيفية: {molecule.group}
              </SimLabel3D>
            </>
          )}
        </group>
      )}

      {mode === 'isomers' && (
        <IsomerScene
          isomerSet={isomerSet}
          spaceFilling={spaceFilling}
          showHydrogens={showHydrogens}
          showLabels={showLabels}
          playing={playing}
          timeScale={timeScale}
        />
      )}

      {mode === 'reaction' && (
        <ReactionScene
          reactionId={reactionId}
          spaceFilling={spaceFilling}
          showHydrogens={showHydrogens}
          showLabels={showLabels}
          playing={playing}
          timeScale={timeScale}
          resetKey={resetKey}
        />
      )}
    </>
  );
};

export default OrganicScene3D;
