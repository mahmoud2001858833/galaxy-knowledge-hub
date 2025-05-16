
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSolvedPuzzlesResult {
  solvedPuzzles: string[];
  loading: boolean;
  checkIfSolved: (puzzleId: string) => boolean;
  markAsSolved: (puzzleId: string, subject: string) => Promise<void>;
  error: Error | null;
}

export function useUserSolvedPuzzles(): UseSolvedPuzzlesResult {
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        fetchSolvedPuzzles(session.user.id);
      } else {
        // If no logged-in user, try to get from localStorage
        try {
          const storedPuzzles = localStorage.getItem('solvedPuzzles');
          if (storedPuzzles) {
            setSolvedPuzzles(JSON.parse(storedPuzzles));
          }
        } catch (e) {
          console.error('Error reading from localStorage:', e);
        } finally {
          setLoading(false);
        }
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUserId(session.user.id);
          fetchSolvedPuzzles(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserId(null);
          setSolvedPuzzles([]);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchSolvedPuzzles(uid: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_solved_puzzles')
        .select('puzzle_id')
        .eq('user_id', uid);

      if (error) {
        throw error;
      }

      if (data) {
        const puzzleIds = data.map((item) => item.puzzle_id);
        setSolvedPuzzles(puzzleIds);
      }
    } catch (err: any) {
      setError(err);
      console.error('Error fetching solved puzzles:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function markAsSolved(puzzleId: string, subject: string) {
    try {
      // Check if already solved to avoid duplicates
      if (solvedPuzzles.includes(puzzleId)) return;
      
      if (userId) {
        // User is logged in, save to database
        const { error } = await supabase
          .from('user_solved_puzzles')
          .insert({
            user_id: userId,
            puzzle_id: puzzleId,
            subject: subject
          });

        if (error) {
          throw error;
        }
      } else {
        // User is not logged in, save to localStorage
        const newSolvedPuzzles = [...solvedPuzzles, puzzleId];
        localStorage.setItem('solvedPuzzles', JSON.stringify(newSolvedPuzzles));
      }

      // Update local state
      setSolvedPuzzles((prev) => [...prev, puzzleId]);
    } catch (err: any) {
      setError(err);
      console.error('Error marking puzzle as solved:', err.message);
    }
  }

  function checkIfSolved(puzzleId: string): boolean {
    return solvedPuzzles.includes(puzzleId);
  }

  return {
    solvedPuzzles,
    loading,
    checkIfSolved,
    markAsSolved,
    error
  };
}
