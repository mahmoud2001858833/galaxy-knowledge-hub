import { motion } from 'framer-motion';
import { Nucleus } from '@/data/nuclear-data';

interface NucleusVisualizationProps {
  nucleus: Nucleus;
  size?: 'small' | 'medium' | 'large' | number;
  animated?: boolean;
  showLabel?: boolean;
}

export const NucleusVisualization = ({ 
  nucleus, 
  size = 'medium',
  animated = true,
  showLabel = true
}: NucleusVisualizationProps) => {
  const sizeMap = {
    small: 60,
    medium: 100,
    large: 150
  };
  
  const diameter = typeof size === 'number' ? size : sizeMap[size];
  const particleSize = diameter / 6;

  // توزيع البروتونات والنيوترونات في دوائر متحدة المركز
  const particlePositions = () => {
    const positions = [];
    const totalParticles = nucleus.protons + nucleus.neutrons;
    const layers = Math.ceil(Math.sqrt(totalParticles / 3));
    
    for (let layer = 0; layer < layers; layer++) {
      const radius = (diameter / 2) * (0.3 + layer * 0.2);
      const particlesInLayer = Math.ceil(totalParticles / layers);
      
      for (let i = 0; i < particlesInLayer && positions.length < totalParticles; i++) {
        const angle = (i / particlesInLayer) * Math.PI * 2;
        positions.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          isProton: positions.length < nucleus.protons
        });
      }
    }
    
    return positions;
  };

  const particles = particlePositions();

  return (
    <div className="relative flex flex-col items-center gap-2">
      <motion.div
        className="relative"
        style={{ width: diameter, height: diameter }}
        animate={animated ? {
          rotate: 360,
          scale: [1, 1.05, 1]
        } : {}}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* توهج الخلفية */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl opacity-40"
          style={{ backgroundColor: nucleus.glowColor }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* النواة الخارجية */}
        <div
          className="absolute inset-0 rounded-full border-2 opacity-30"
          style={{ 
            borderColor: nucleus.color,
            boxShadow: `0 0 20px ${nucleus.glowColor}`
          }}
        />

        {/* البروتونات والنيوترونات */}
        {particles.map((pos, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              width: particleSize,
              height: particleSize,
              left: '50%',
              top: '50%',
              background: pos.isProton 
                ? 'radial-gradient(circle, #fca5a5, #ef4444)' 
                : 'radial-gradient(circle, #93c5fd, #3b82f6)',
              boxShadow: pos.isProton 
                ? '0 0 20px #ef4444, 0 0 40px #ef4444, inset 0 0 15px rgba(255,255,255,0.4)'
                : '0 0 20px #3b82f6, 0 0 40px #3b82f6, inset 0 0 15px rgba(255,255,255,0.4)',
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
            }}
            animate={animated ? {
              scale: [1, 1.15, 1],
            } : {}}
            transition={{
              duration: 1 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            {/* نواة الجسيم */}
            <div 
              className="absolute inset-[3px] rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${
                  pos.isProton ? 'rgba(255,255,255,0.6)' : 'rgba(200,220,255,0.6)'
                }, transparent)`
              }}
            />
          </motion.div>
        ))}

        {/* مركز النواة */}
        <motion.div
          className="absolute inset-[35%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${nucleus.color}, ${nucleus.glowColor})`,
            boxShadow: `0 0 40px ${nucleus.glowColor}, 0 0 60px ${nucleus.glowColor}, inset 0 0 30px rgba(255,255,255,0.4)`
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.9, 1, 0.9]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity
          }}
        />
      </motion.div>

      {showLabel && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-lg font-bold" style={{ color: nucleus.color }}>
            {nucleus.symbol}-{nucleus.massNumber}
          </div>
          <div className="text-sm text-muted-foreground">
            {nucleus.element}
          </div>
          <div className="text-xs text-muted-foreground">
            {nucleus.protons}p • {nucleus.neutrons}n
          </div>
        </motion.div>
      )}
    </div>
  );
};
