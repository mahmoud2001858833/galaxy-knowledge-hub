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
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    fetchPuzzles();
  }, []);

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

  const handleAdminPanel = () => {
    setShowAdmin(true);
  };

  const handleCloseAdminPanel = () => {
    setShowAdmin(false);
    setAdminPassword('');
  };

  const handleSubmitPassword = () => {
    if (adminPassword === 'admin123') {
      handleAdminPanel();
    } else {
      toast.error('Incorrect admin password.');
    }
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
          <button
            onClick={() => setShowAdmin(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Admin Panel
          </button>
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

        {showAdmin && (
          <PuzzleAdminPanel
            puzzles={puzzles}
            fetchPuzzles={fetchPuzzles}
            difficultyColor={difficultyColor}
            onClose={handleCloseAdminPanel}
          />
        )}

        {/* Admin Password Modal */}
        {showAdmin && !adminPassword && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Enter Admin Password
                      </h3>
                      <div className="mt-2">
                        <input
                          type="password"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="admin-password"
                          placeholder="Password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleSubmitPassword}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={handleCloseAdminPanel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiologyPuzzles;
