
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center">الألغاز التعليمية</h1>
        
        {isAdmin && (
          <div className="mb-8">
            <SubjectPuzzleAdmin subject="all" />
          </div>
        )}
        
        <SubjectPuzzlesComponent />
      </motion.div>
    </div>
  );
};

export default SubjectPuzzles;
