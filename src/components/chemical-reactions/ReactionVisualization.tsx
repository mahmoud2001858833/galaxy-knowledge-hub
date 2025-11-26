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
  showGeometry?: boolean;
  onStageChange?: (stage: ReactionStage) => void;
}

export const ReactionVisualization = ({ 
  reaction, 
  isPlaying, 
  speed,
  showGeometry = false,
  onStageChange 
}: ReactionVisualizationProps) => {
  const [stage, setStage] = useState<ReactionStage>('reactants');
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
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
    if (!isPlaying || isComplete) {
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (0.01 * speed);
        
        if (newProgress >= 1) {
          setIsComplete(true);
          return 1;
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
  }, [isPlaying, speed, stage, reaction.energyChange, onStageChange, isComplete]);

  const handleReset = () => {
    setProgress(0);
    setStage('reactants');
    setIsComplete(false);
  };

  useEffect(() => {
    handleReset();
  }, [reaction]);

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
              showGeometry={false}
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
            showGeometry={showGeometry && stage === 'products'}
          />
        ))}

        {/* Energy burst effect at reaction moment */}
        {stage === 'rearrange' && (
          <>
            {/* Central energy burst */}
            <mesh>
              <sphereGeometry args={[1.5 + Math.sin(progress * 20) * 0.5, 32, 32]} />
              <meshBasicMaterial
                color={reaction.energyChange === 'exothermic' ? '#ff4444' : '#44aaff'}
                transparent
                opacity={0.4}
              />
            </mesh>
            {/* Energy particles */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const radius = 2 + progress * 5;
              return (
                <mesh
                  key={i}
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius * 0.5,
                    Math.sin(angle) * radius
                  ]}
                >
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshBasicMaterial
                    color={reaction.energyChange === 'exothermic' ? '#ffaa00' : '#00aaff'}
                    transparent
                    opacity={0.8 * (1 - progress)}
                  />
                </mesh>
              );
            })}
          </>
        )}

        {/* Energy wave effect */}
        {(stage === 'forming' || stage === 'products') && (
          <>
            <mesh>
              <sphereGeometry args={[2 + progress * 3, 32, 32]} />
              <meshBasicMaterial
                color={reaction.energyChange === 'exothermic' ? '#ff6b6b' : '#4dabf7'}
                transparent
                opacity={0.1 * (1 - progress)}
                wireframe
              />
            </mesh>
            {/* Secondary energy ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.5, 0.2, 16, 100]} />
              <meshBasicMaterial
                color={reaction.energyChange === 'exothermic' ? '#ff8800' : '#0088ff'}
                transparent
                opacity={0.3 * (1 - progress)}
              />
            </mesh>
          </>
        )}
      </Canvas>

      {/* Stage indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full text-white">
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold">
            {stage === 'reactants' && 'المواد المتفاعلة'}
            {stage === 'approach' && 'الاقتراب والتصادم'}
            {stage === 'breaking' && 'كسر الروابط القديمة'}
            {stage === 'rearrange' && 'لحظة التفاعل - إطلاق الطاقة ⚡'}
            {stage === 'forming' && 'تكوين الروابط الجديدة'}
            {stage === 'products' && 'النواتج النهائية ✓'}
          </div>
          <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Completion badge */}
      {isComplete && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500/90 backdrop-blur-sm px-6 py-2 rounded-full text-white font-semibold animate-fade-in">
          ✓ اكتمل التفاعل
        </div>
      )}

      {/* Energy indicator */}
      {(stage === 'rearrange' || stage === 'forming') && (
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg backdrop-blur-sm font-semibold animate-pulse ${
          reaction.energyChange === 'exothermic' 
            ? 'bg-orange-500/90 text-white' 
            : 'bg-blue-500/90 text-white'
        }`}>
          {reaction.energyChange === 'exothermic' ? '🔥 طارد للحرارة' : '❄️ ماص للحرارة'}
        </div>
      )}
    </div>
  );
};
