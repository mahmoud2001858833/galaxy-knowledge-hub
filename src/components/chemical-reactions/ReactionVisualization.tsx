import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Molecule3D } from './Molecule3D';
import { ChemicalReaction } from '@/data/chemical-reactions-data';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

type ReactionStage = 'reactants' | 'approach' | 'breaking' | 'rearrange' | 'forming' | 'products';

interface ReactionVisualizationProps {
  reaction: ChemicalReaction;
  isPlaying: boolean;
  speed: number;
  onStageChange?: (stage: ReactionStage) => void;
}

export const ReactionVisualization = ({ 
  reaction, 
  isPlaying, 
  speed,
  onStageChange 
}: ReactionVisualizationProps) => {
  const [stage, setStage] = useState<ReactionStage>('reactants');
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playSound = (frequency: number, duration: number, volume: number = 0.1) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      setStage('reactants');
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (0.01 * speed);
        
        if (newProgress >= 1) {
          return 0;
        }

        // Stage transitions
        if (newProgress < 0.15) {
          if (stage !== 'reactants') {
            setStage('reactants');
            onStageChange?.('reactants');
          }
        } else if (newProgress < 0.3) {
          if (stage !== 'approach') {
            setStage('approach');
            onStageChange?.('approach');
            playSound(300, 0.2, 0.05);
          }
        } else if (newProgress < 0.45) {
          if (stage !== 'breaking') {
            setStage('breaking');
            onStageChange?.('breaking');
            playSound(200, 0.3, 0.08);
          }
        } else if (newProgress < 0.6) {
          if (stage !== 'rearrange') {
            setStage('rearrange');
            onStageChange?.('rearrange');
          }
        } else if (newProgress < 0.8) {
          if (stage !== 'forming') {
            setStage('forming');
            onStageChange?.('forming');
            playSound(500, 0.3, 0.08);
          }
        } else {
          if (stage !== 'products') {
            setStage('products');
            onStageChange?.('products');
            if (reaction.energyChange === 'exothermic') {
              playSound(600, 0.4, 0.1);
            }
          }
        }
        
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, speed, stage, reaction.energyChange, onStageChange]);

  const calculateMoleculePosition = (index: number, total: number, stageProgress: number): [number, number, number] => {
    const baseSpacing = 4;
    const startX = -(total - 1) * baseSpacing / 2;
    
    if (stage === 'reactants') {
      return [startX + index * baseSpacing, 0, 0];
    }
    
    if (stage === 'approach') {
      const targetX = 0;
      const currentX = startX + index * baseSpacing;
      const interpolatedX = currentX + (targetX - currentX) * stageProgress;
      return [interpolatedX, 0, 0];
    }
    
    // For later stages, molecules are at center
    return [0, 0, 0];
  };

  const getGlowIntensity = () => {
    if (stage === 'breaking' || stage === 'forming') {
      return 1.5;
    }
    return 0.5;
  };

  const shouldShowMolecule = (isReactant: boolean) => {
    if (isReactant) {
      return stage === 'reactants' || stage === 'approach' || stage === 'breaking';
    }
    return stage === 'forming' || stage === 'products';
  };

  return (
    <div className="w-full h-full relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={stage === 'forming' || stage === 'breaking' ? 2 : 1}
          castShadow
          color={reaction.energyChange === 'exothermic' ? '#ff6b6b' : '#4dabf7'}
        />

        <Environment preset="city" />

        {/* Render reactants */}
        {shouldShowMolecule(true) && reaction.reactants.map((molecule, index) => {
          const stageProgress = (progress - 0.15) / 0.15; // Progress within approach stage
          return (
            <Molecule3D
              key={`reactant-${index}`}
              molecule={molecule}
              position={calculateMoleculePosition(index, reaction.reactants.length, Math.max(0, Math.min(1, stageProgress)))}
              showLabels={true}
              animate={stage === 'breaking'}
              glowIntensity={getGlowIntensity()}
            />
          );
        })}

        {/* Render products */}
        {shouldShowMolecule(false) && reaction.products.map((molecule, index) => (
          <Molecule3D
            key={`product-${index}`}
            molecule={molecule}
            position={calculateMoleculePosition(index, reaction.products.length, 1)}
            showLabels={true}
            animate={stage === 'forming'}
            glowIntensity={getGlowIntensity()}
          />
        ))}

        {/* Energy wave effect */}
        {(stage === 'forming' || stage === 'products') && (
          <mesh>
            <sphereGeometry args={[2 + progress * 3, 32, 32]} />
            <meshBasicMaterial
              color={reaction.energyChange === 'exothermic' ? '#ff6b6b' : '#4dabf7'}
              transparent
              opacity={0.1 * (1 - progress)}
              wireframe
            />
          </mesh>
        )}
      </Canvas>

      {/* Stage indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full text-white">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            {stage === 'reactants' && 'المواد المتفاعلة'}
            {stage === 'approach' && 'الاقتراب'}
            {stage === 'breaking' && 'كسر الروابط'}
            {stage === 'rearrange' && 'إعادة الترتيب'}
            {stage === 'forming' && 'تكوين الروابط'}
            {stage === 'products' && 'النواتج'}
          </div>
          <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
