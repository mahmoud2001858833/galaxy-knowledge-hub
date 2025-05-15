
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import SubjectPuzzlesComponent from '@/components/subjectPuzzles/SubjectPuzzlesComponent';
import SubjectPuzzleAdmin from '@/components/subjectPuzzles/SubjectPuzzleAdmin';
import { Card, CardContent } from '@/components/ui/card';

const SubjectPuzzles = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === 'jowmahmoud6@gmail.com') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Particle effect for background
  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < 30; i++) {
      const size = Math.random() * 5 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 50 + 20;
      const delay = Math.random() * 20;
      
      particles.push(
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: size,
            height: size,
            left: `${posX}%`,
            top: `${posY}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
          }}
        />
      );
    }
    return particles;
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        {generateParticles()}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full relative z-10"
      >
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-lg border-white/10 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[radial-gradient(circle_at_50%_120%,#3a3af3,#121287)]"></div>
          </div>
          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-4"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-xl">🧩</div>
                  </div>
                </motion.div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white/80">الألغاز التعليمية</h1>
              </div>
              <motion.p 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 max-w-md text-center md:text-right"
              >
                اختبر معلوماتك في مختلف المواد العلمية من خلال مجموعة من الألغاز التعليمية المتنوعة
              </motion.p>
            </div>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <SubjectPuzzleAdmin subject="all" />
          </motion.div>
        )}
        
        <SubjectPuzzlesComponent />
      </motion.div>
    </div>
  );
};

export default SubjectPuzzles;
