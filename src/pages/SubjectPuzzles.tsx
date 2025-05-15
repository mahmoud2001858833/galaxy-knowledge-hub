
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">الألغاز التعليمية</h1>
              <p className="text-white/70 max-w-md text-center md:text-right">
                اختبر معلوماتك في مختلف المواد العلمية من خلال مجموعة من الألغاز التعليمية المتنوعة
              </p>
            </div>
          </CardContent>
        </Card>
        
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
