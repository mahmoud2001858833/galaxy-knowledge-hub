
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import SubjectPuzzlesComponent from '@/components/subjectPuzzles/SubjectPuzzlesComponent';
import SubjectPuzzleAdmin from '@/components/subjectPuzzles/SubjectPuzzleAdmin';

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

  // Animated background elements
  const renderAnimatedElements = () => {
    const elements = [];
    
    // Generate circles
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 200 + 50;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 15 + 15;
      const opacity = Math.random() * 0.1 + 0.05;
      
      elements.push(
        <motion.div
          key={`circle-${i}`}
          className="absolute rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10"
          style={{
            width: size,
            height: size,
            left: `${posX}%`,
            top: `${posY}%`,
            opacity: opacity
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [opacity, opacity * 2, opacity],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
          }}
        />
      );
    }
    
    // Generate stars
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 3 + 1;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 3;
      const duration = Math.random() * 3 + 1;
      
      elements.push(
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: size,
            height: size,
            left: `${posX}%`,
            top: `${posY}%`,
          }}
          animate={{
            opacity: [0.1, 0.8, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
          }}
        />
      );
    }
    
    return elements;
  };

  return (
    <div className="relative min-h-screen overflow-y-auto bg-gradient-to-br from-[#0c0a20] via-[#1c1248] to-[#0c0a20]">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {renderAnimatedElements()}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a20] via-transparent to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="container px-4 py-10 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div
              className="mb-6 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse-glow"></div>
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-3xl">🧩</span>
                </div>
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white">
              الألغاز التعليمية
            </h1>
            
            <p className="text-lg text-white/80 max-w-xl mb-4">
              تحدى نفسك بمجموعة متنوعة من الألغاز العلمية في مختلف المواد وبمستويات صعوبة متدرجة
            </p>
            
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          </div>
        </motion.div>
        
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <SubjectPuzzleAdmin subject="all" />
          </motion.div>
        )}
        
        <SubjectPuzzlesComponent />
      </div>
    </div>
  );
};

export default SubjectPuzzles;
