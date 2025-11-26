import { Atom3D } from './Atom3D';
import { Bond3D } from './Bond3D';
import { Molecule } from '@/data/chemical-reactions-data';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Molecule3DProps {
  molecule: Molecule;
  position?: [number, number, number];
  showLabels?: boolean;
  animate?: boolean;
  glowIntensity?: number;
  showGeometry?: boolean;
}

export const Molecule3D = ({ 
  molecule, 
  position = [0, 0, 0],
  showLabels = true,
  animate = false,
  glowIntensity = 0.5,
  showGeometry = false
}: Molecule3DProps) => {
  
  const calculateBondAngles = () => {
    const angles: Array<{ angle: number; atoms: string[] }> = [];
    
    // Find central atoms (atoms with multiple bonds)
    const bondCounts = new Map<number, number>();
    molecule.bonds.forEach(bond => {
      bondCounts.set(bond.from, (bondCounts.get(bond.from) || 0) + 1);
      bondCounts.set(bond.to, (bondCounts.get(bond.to) || 0) + 1);
    });

    // Calculate angles for atoms with 2+ bonds
    bondCounts.forEach((count, atomIndex) => {
      if (count >= 2) {
        const connectedBonds = molecule.bonds.filter(
          b => b.from === atomIndex || b.to === atomIndex
        );
        
        if (connectedBonds.length >= 2) {
          const atom = molecule.atoms[atomIndex];
          const atomPos = new THREE.Vector3(...atom.position);
          
          for (let i = 0; i < connectedBonds.length - 1; i++) {
            const bond1 = connectedBonds[i];
            const bond2 = connectedBonds[i + 1];
            
            const other1Index = bond1.from === atomIndex ? bond1.to : bond1.from;
            const other2Index = bond2.from === atomIndex ? bond2.to : bond2.from;
            
            const other1Pos = new THREE.Vector3(...molecule.atoms[other1Index].position);
            const other2Pos = new THREE.Vector3(...molecule.atoms[other2Index].position);
            
            const vec1 = other1Pos.sub(atomPos).normalize();
            const vec2 = other2Pos.sub(atomPos).normalize();
            
            const angle = Math.acos(vec1.dot(vec2)) * (180 / Math.PI);
            
            angles.push({
              angle: Math.round(angle),
              atoms: [
                molecule.atoms[other1Index].symbol,
                atom.symbol,
                molecule.atoms[other2Index].symbol
              ]
            });
          }
        }
      }
    });
    
    return angles;
  };

  const bondAngles = showGeometry ? calculateBondAngles() : [];

  return (
    <group position={position}>
      {/* Render bonds first (so they appear behind atoms) */}
      {molecule.bonds.map((bond, index) => {
        const fromAtom = molecule.atoms[bond.from];
        const toAtom = molecule.atoms[bond.to];
        return (
          <Bond3D
            key={`bond-${index}`}
            start={fromAtom.position}
            end={toAtom.position}
            type={bond.type}
            animate={animate}
          />
        );
      })}

      {/* Render atoms */}
      {molecule.atoms.map((atom, index) => (
        <Atom3D
          key={`atom-${index}`}
          position={atom.position}
          color={atom.color}
          symbol={atom.symbol}
          element={atom.element}
          showLabel={showLabels}
          glowIntensity={glowIntensity}
        />
      ))}

      {/* Show geometry information */}
      {showGeometry && bondAngles.length > 0 && (
        <Html center position={[0, -3, 0]}>
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm space-y-1">
            <div className="font-bold text-center mb-2">الزوايا والشكل الهندسي</div>
            {bondAngles.map((info, i) => (
              <div key={i} className="font-mono text-xs">
                {info.atoms.join('-')}: {info.angle}°
              </div>
            ))}
            <div className="text-xs text-center mt-2 text-gray-300">
              {bondAngles[0]?.angle >= 100 && bondAngles[0]?.angle <= 120 
                ? 'شكل رباعي السطوح' 
                : bondAngles[0]?.angle >= 170 
                ? 'شكل خطي' 
                : 'شكل منحني'}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
