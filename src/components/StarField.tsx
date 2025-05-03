
import React, { useEffect, useState } from 'react';

interface Star {
  id: number;
  size: 'sm' | 'md' | 'lg';
  top: string;
  left: string;
  delay: string;
}

const StarField: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);
  
  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const starCount = Math.floor(window.innerWidth * window.innerHeight / 6000);
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
    
    generateStars();
    
    const handleResize = () => {
      generateStars();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
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
    </div>
  );
};

export default StarField;
