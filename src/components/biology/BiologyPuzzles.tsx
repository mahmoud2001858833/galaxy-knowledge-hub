import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Puzzle, DatabasePuzzle } from './types/puzzleTypes';
import { motion } from 'framer-motion';
import PuzzleItem from './PuzzleItem';
import BiologyAIAssistant from './BiologyAIAssistant';
import PuzzleDetails from './PuzzleDetails';
import PuzzleAdminPanel from './PuzzleAdminPanel';
import { toast } from 'sonner';

const BiologyPuzzles = () => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchPuzzles();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (data) setIsAdmin(true);
  };

  const fetchPuzzles = async () => {
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .select('*');
        
      if (error) throw error;
      
      // Properly type the data and map to Puzzle type
      const puzzlesData: Puzzle[] = data?.map(item => {
        // Type assertion to make TypeScript happy
        const dbPuzzle = item as unknown as DatabasePuzzle;
        
        return {
          id: dbPuzzle.id || '',
          title: dbPuzzle.title || '',
          question: dbPuzzle.question || '',
          description: dbPuzzle.question || '', // Map question to description
          options: dbPuzzle.options || [],
          correct_answer: dbPuzzle.correct_answer || '',
          answer: dbPuzzle.correct_answer || '', // Map correct_answer to answer
          difficulty: dbPuzzle.difficulty || '',
          points: dbPuzzle.points || 0,
          image: dbPuzzle.image || null,
          created_at: dbPuzzle.created_at || '',
          created_by: dbPuzzle.created_by || null,
          admin_password: dbPuzzle.admin_password || '',
          subject: 'biology', // Set a default subject
          hint: dbPuzzle.hint || '' // Use hint if exists in database, otherwise empty string
        };
      }) || [];
      
      setPuzzles(puzzlesData);
    } catch (error: any) {
      toast.error(`Error fetching puzzles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePuzzleClick = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle);
  };

  const handleCloseDetails = () => {
    setSelectedPuzzle(null);
  };


  const addPuzzle = async (newPuzzle: Puzzle) => {
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .insert([{
          title: newPuzzle.title,
          question: newPuzzle.question || newPuzzle.description,
          options: newPuzzle.options,
          correct_answer: newPuzzle.correct_answer || newPuzzle.answer,
          difficulty: newPuzzle.difficulty,
          points: newPuzzle.points,
          image: newPuzzle.image,
          subject: 'biology',
          hint: newPuzzle.hint
        }]);

      if (error) {
        throw new Error(`Could not add puzzle: ${error.message}`);
      }

      fetchPuzzles();
      toast.success('Puzzle added successfully!');
    } catch (error: any) {
      toast.error(`Error adding puzzle: ${error.message}`);
    }
  };

  const updatePuzzle = async (updatedPuzzle: Puzzle) => {
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .update({
          title: updatedPuzzle.title,
          question: updatedPuzzle.question || updatedPuzzle.description,
          options: updatedPuzzle.options,
          correct_answer: updatedPuzzle.correct_answer || updatedPuzzle.answer,
          difficulty: updatedPuzzle.difficulty,
          points: updatedPuzzle.points,
          image: updatedPuzzle.image,
          hint: updatedPuzzle.hint
        })
        .eq('id', updatedPuzzle.id);

      if (error) {
        throw new Error(`Could not update puzzle: ${error.message}`);
      }

      fetchPuzzles();
      toast.success('Puzzle updated successfully!');
    } catch (error: any) {
      toast.error(`Error updating puzzle: ${error.message}`);
    }
  };

  const deletePuzzle = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Could not delete puzzle: ${error.message}`);
      }

      fetchPuzzles();
      toast.success('Puzzle deleted successfully!');
    } catch (error: any) {
      toast.error(`Error deleting puzzle: ${error.message}`);
    }
  };
  
  // Utility function for PuzzleAdminPanel
  const difficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'سهل': return 'bg-green-600';
      case 'متوسط': return 'bg-yellow-600';
      case 'صعب': return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-gray-800 mb-8"
        >
          Biology Puzzles
        </motion.h1>

        <div className="flex justify-between items-center mb-4">
          {isAdmin && (
            <button
              onClick={() => setIsAdmin(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Admin Panel
            </button>
          )}
          <BiologyAIAssistant />
        </div>

        {loading ? (
          <div className="text-center">Loading puzzles...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {puzzles.map((puzzle) => (
              <PuzzleItem
                key={puzzle.id}
                puzzle={puzzle}
                isSelected={false}
                onSelect={() => handlePuzzleClick(puzzle)}
                difficultyColor={difficultyColor}
              />
            ))}
          </motion.div>
        )}

        {selectedPuzzle && (
          <PuzzleDetails selectedPuzzle={selectedPuzzle} />
        )}

        {isAdmin && (
          <PuzzleAdminPanel
            puzzles={puzzles}
            fetchPuzzles={fetchPuzzles}
            difficultyColor={difficultyColor}
          />
        )}
      </div>
    </div>
  );
};

export default BiologyPuzzles;
