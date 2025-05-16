
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type PuzzleType = {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  image?: string;
  subject: string;
};

export const useUserSolvedPuzzles = () => {
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Fetch solved puzzles from the database
          const { data, error } = await supabase
            .from('user_solved_puzzles')
            .select('puzzle_id')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          // Extract puzzle IDs from the response
          const puzzleIds = data?.map(item => item.puzzle_id) || [];
          setSolvedPuzzles(puzzleIds);
        } else {
          // If no user is logged in, use local storage
          const localSolvedPuzzles = localStorage.getItem('solvedPuzzles');
          if (localSolvedPuzzles) {
            setSolvedPuzzles(JSON.parse(localSolvedPuzzles));
          }
        }
      } catch (err: any) {
        console.error("Error fetching solved puzzles:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        // Fetch solved puzzles when user logs in
        const { data, error } = await supabase
          .from('user_solved_puzzles')
          .select('puzzle_id')
          .eq('user_id', session.user.id);
          
        if (!error && data) {
          const puzzleIds = data.map(item => item.puzzle_id);
          setSolvedPuzzles(puzzleIds);
        }
      } else {
        // If logged out, use local storage
        const localSolvedPuzzles = localStorage.getItem('solvedPuzzles');
        if (localSolvedPuzzles) {
          setSolvedPuzzles(JSON.parse(localSolvedPuzzles));
        } else {
          setSolvedPuzzles([]);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const markAsSolved = async (puzzleId: string, subject: string) => {
    try {
      // Check if already solved
      if (solvedPuzzles.includes(puzzleId)) {
        return;
      }
      
      // Add to solved puzzles
      const updatedSolvedPuzzles = [...solvedPuzzles, puzzleId];
      setSolvedPuzzles(updatedSolvedPuzzles);
      
      if (user) {
        // Add to database if user is logged in
        const { data: puzzle } = await supabase
          .from('subject_puzzles')
          .select('points')
          .eq('id', puzzleId)
          .single();
        
        const pointsToAdd = puzzle?.points || 10;
        
        // Record the solved puzzle
        const { error } = await supabase
          .from('user_solved_puzzles')
          .insert({
            user_id: user.id,
            puzzle_id: puzzleId,
            subject: subject
          });
          
        if (error) throw error;
        
        // Update user's score
        const { error: scoreError } = await supabase.rpc('adjust_user_score', {
          user_id: user.id,
          points_adjustment: pointsToAdd
        });
        
        if (scoreError) throw scoreError;
        
        // Also increment the solved puzzles counter
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('solved_puzzles')
          .eq('id', user.id)
          .single();
          
        if (!profileError && profileData) {
          const currentCount = profileData.solved_puzzles || 0;
          await supabase
            .from('profiles')
            .update({ solved_puzzles: currentCount + 1 })
            .eq('id', user.id);
        }
      } else {
        // Store in local storage if no user is logged in
        localStorage.setItem('solvedPuzzles', JSON.stringify(updatedSolvedPuzzles));
        
        // Show notification that user could earn points by logging in
        toast.info('قم بتسجيل الدخول للحصول على النقاط وحفظ تقدمك!', {
          duration: 5000,
        });
      }
    } catch (err: any) {
      console.error("Error marking puzzle as solved:", err);
      setError(err);
    }
  };

  const checkIfSolved = (puzzleId: string): boolean => {
    return solvedPuzzles.includes(puzzleId);
  };

  return { solvedPuzzles, markAsSolved, checkIfSolved, loading, error };
};
