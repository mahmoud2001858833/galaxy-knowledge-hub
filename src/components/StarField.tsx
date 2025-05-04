
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Star {
  id: number;
  size: 'sm' | 'md' | 'lg';
  top: string;
  left: string;
  delay: string;
}

interface SpaceObject {
  id: number;
  type: 'planet' | 'meteor' | 'comet';
  top: string;
  left: string;
  size: string;
  rotation: number;
  duration: number;
  delay: number;
}

const StarField: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [spaceObjects, setSpaceObjects] = useState<SpaceObject[]>([]);
  
  useEffect(() => {
    // Generate random stars - increased density
    const generateStars = () => {
      const starCount = Math.floor(window.innerWidth * window.innerHeight / 3000); // More stars
      const newStars: Star[] = [];
      
      for (let i = 0; i < starCount; i++) {
        const sizes = ['sm', 'md', 'lg'] as const;
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const top = `${Math.random() * 100}%`;
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 4}s`;
        
        newStars.push({
          id: i,
          size,
          top,
          left,
          delay,
        });
      }
      
      setStars(newStars);
    };
    
    // Generate space objects (planets, meteors, comets)
    const generateSpaceObjects = () => {
      const objectCount = Math.floor((window.innerWidth + window.innerHeight) / 500);
      const newObjects: SpaceObject[] = [];
      
      for (let i = 0; i < objectCount; i++) {
        const types = ['planet', 'meteor', 'comet'] as const;
        const type = types[Math.floor(Math.random() * types.length)];
        const top = `${Math.random() * 100}%`;
        const left = `${Math.random() * 100}%`;
        const size = `${Math.random() * 2 + 0.5}rem`;
        const rotation = Math.random() * 360;
        const duration = Math.random() * 60 + 40;
        const delay = Math.random() * 30;
        
        newObjects.push({
          id: i,
          type,
          top,
          left,
          size,
          rotation,
          duration,
          delay
        });
      }
      
      setSpaceObjects(newObjects);
    };
    
    generateStars();
    generateSpaceObjects();
    
    const handleResize = () => {
      generateStars();
      generateSpaceObjects();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Render space object based on type
  const renderSpaceObject = (object: SpaceObject) => {
    switch(object.type) {
      case 'planet':
        return (
          <div 
            className="rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 absolute"
            style={{ 
              width: object.size, 
              height: object.size,
              boxShadow: '0 0 10px rgba(155, 135, 245, 0.3)'
            }} 
          />
        );
      case 'meteor':
        return (
          <div className="relative">
            <div 
              className="h-1 w-10 bg-gradient-to-r from-orange-500/30 to-transparent rounded absolute"
              style={{ transform: `rotate(${object.rotation}deg)` }}
            />
          </div>
        );
      case 'comet':
        return (
          <motion.div
            animate={{
              x: [0, window.innerWidth],
              y: [0, window.innerHeight / 2]
            }}
            transition={{
              duration: object.duration,
              delay: object.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear"
            }}
            className="absolute"
          >
            <div className="h-1 w-20 bg-gradient-to-r from-blue-400/60 to-transparent rounded" />
            <div className="h-2 w-2 rounded-full bg-blue-300/60 absolute -left-1 -top-0.5" />
          </motion.div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star star-${star.size}`}
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
          }}
        />
      ))}
      
      {/* Space objects */}
      {spaceObjects.map((object) => (
        <div
          key={object.id}
          style={{
            top: object.top,
            left: object.left,
            position: 'absolute',
            zIndex: object.type === 'planet' ? 1 : 2,
          }}
        >
          {renderSpaceObject(object)}
        </div>
      ))}
    </div>
  );
};

export default StarField;
