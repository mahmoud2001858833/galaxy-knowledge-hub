import { Atom3D } from './Atom3D';
import { Bond3D } from './Bond3D';
import { Molecule } from '@/data/chemical-reactions-data';

interface Molecule3DProps {
  molecule: Molecule;
  position?: [number, number, number];
  showLabels?: boolean;
  animate?: boolean;
  glowIntensity?: number;
}

export const Molecule3D = ({ 
  molecule, 
  position = [0, 0, 0],
  showLabels = true,
  animate = false,
  glowIntensity = 0.5
}: Molecule3DProps) => {
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
    </group>
  );
};
