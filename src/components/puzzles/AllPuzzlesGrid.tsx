import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Filter, 
  Loader2, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  SlidersHorizontal, 
  ArrowUpDown,
  X,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import PuzzleCard from './PuzzleCard';
import { labSound } from '@/utils/labAudio';

export interface Puzzle {
  id: string;
  title: string;
  question: string;
  difficulty: string;
  points: number;
  subject: string;
  image: string | null;
  hint?: string;
  explanation?: string;
}

interface AttemptedPuzzle {
  puzzle_id: string;
  is_correct: boolean;
}

interface AllPuzzlesGridProps {
  userId?: string;
}

const LOCAL_STORAGE_OVERRIDE_KEY = 'galaxy_active_puzzles_override_v2';

const SUBJECT_TABS = [
  { id: 'all', label: 'كافة المواد', icon: '🎯' },
  { id: 'الفيزياء', label: 'الفيزياء', icon: '⚛️' },
  { id: 'الكيمياء', label: 'الكيمياء', icon: '🧪' },
  { id: 'الأحياء', label: 'الأحياء', icon: '🧬' },
  { id: 'الرياضيات', label: 'الرياضيات', icon: '📐' },
  { id: 'الفلك والفضاء', label: 'الفلك والفضاء', icon: '🌌' },
  { id: 'ذكاء ومنطق', label: 'ذكاء ومنطق', icon: '💡' },
];

const DIFFICULTIES = [
  { value: 'all', label: 'الكل', color: 'bg-primary/20 text-primary' },
  { value: 'سهل', label: 'سهل 🟢', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'متوسط', label: 'متوسط 🟡', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'صعب', label: 'صعب 🔴', color: 'bg-rose-500/20 text-rose-400' },
];

export const AllPuzzlesGrid: React.FC<AllPuzzlesGridProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [attemptedPuzzles, setAttemptedPuzzles] = useState<AttemptedPuzzle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unsolved' | 'solved' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'points-desc' | 'points-asc'>('newest');

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch from Supabase
      const { data: puzzlesData, error: puzzlesError } = await supabase
        .from('subject_puzzles')
        .select('*')
        .order('created_at', { ascending: false });

      let loadedPuzzles: Puzzle[] = puzzlesData || [];

      // 2. Merge with locally saved AI / admin overrides
      const localStr = localStorage.getItem(LOCAL_STORAGE_OVERRIDE_KEY);
      if (localStr) {
        try {
          const localItems: Puzzle[] = JSON.parse(localStr);
          localItems.forEach(item => {
            if (!loadedPuzzles.some(p => p.id === item.id)) {
              loadedPuzzles.unshift(item);
            }
          });
        } catch(e) {}
      }

      setPuzzles(loadedPuzzles);

      // 3. Fetch user attempts
      if (userId) {
        const { data: attemptedData, error: attemptedError } = await supabase
          .from('user_solved_puzzles')
          .select('puzzle_id, is_correct')
          .eq('user_id', userId);

        if (!attemptedError && attemptedData) {
          setAttemptedPuzzles(attemptedData);
        }
      }
    } catch (error) {
      console.error('Error fetching puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttemptStatus = (puzzleId: string) => {
    const attempt = attemptedPuzzles.find(a => a.puzzle_id === puzzleId);
    return {
      isAttempted: !!attempt,
      isCorrect: attempt?.is_correct ?? false
    };
  };

  // Filter & Sort logic
  const filteredAndSortedPuzzles = useMemo(() => {
    let result = puzzles.filter(puzzle => {
      // Subject filter
      const matchSubject = selectedSubject === 'all' || 
        puzzle.subject.toLowerCase().includes(selectedSubject.toLowerCase());

      // Difficulty filter
      const matchDiff = selectedDifficulty === 'all' || puzzle.difficulty === selectedDifficulty;

      // Status filter
      const status = getAttemptStatus(puzzle.id);
      let matchStatus = true;
      if (selectedStatus === 'unsolved') matchStatus = !status.isAttempted;
      if (selectedStatus === 'solved') matchStatus = status.isAttempted && status.isCorrect;
      if (selectedStatus === 'failed') matchStatus = status.isAttempted && !status.isCorrect;

      // Search query
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        puzzle.title.toLowerCase().includes(q) || 
        puzzle.question.toLowerCase().includes(q) ||
        puzzle.subject.toLowerCase().includes(q);

      return matchSubject && matchDiff && matchStatus && matchSearch;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'points-desc') return (b.points || 0) - (a.points || 0);
      if (sortBy === 'points-asc') return (a.points || 0) - (b.points || 0);
      return 0; // default newest
    });

    return result;
  }, [puzzles, attemptedPuzzles, selectedSubject, selectedDifficulty, selectedStatus, searchQuery, sortBy]);

  const handlePuzzleClick = (puzzleId: string) => {
    try { labSound?.click(); } catch(e) {}
    navigate(`/puzzle/${puzzleId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 justify-center flex-wrap">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none" dir="rtl">
      
      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECT_TABS.map(tab => {
          const isActive = selectedSubject === tab.id;
          const count = tab.id === 'all' 
            ? puzzles.length 
            : puzzles.filter(p => p.subject.includes(tab.id)).length;

          return (
            <button
              key={tab.id}
              onClick={() => { setSelectedSubject(tab.id); try { labSound?.click(); } catch(e){} }}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 border ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-indigo-600 text-white border-primary shadow-md shadow-primary/20 scale-102'
                  : 'bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border-border/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Control Toolbar: Search, Difficulty, Status, Sorting */}
      <div className="p-4 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/60 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأسئلة والمفاهيم..."
              className="pr-9 pl-8 h-9 text-xs rounded-xl bg-background border-border/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Difficulty Chips */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDifficulty(d.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedDifficulty === d.value
                      ? 'bg-background text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Status Dropdown / Chips */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="text-xs h-9 px-3 rounded-xl bg-background border border-border/60 text-foreground"
            >
              <option value="all">كافة الحالات</option>
              <option value="unsolved">⚡ غير محلولة (جديدة)</option>
              <option value="solved">✅ تم حلها بنجاح</option>
              <option value="failed">❌ محاولة غير موفقة</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs h-9 px-3 rounded-xl bg-background border border-border/60 text-foreground"
            >
              <option value="newest">الأحدث إضافة</option>
              <option value="points-desc">الأعلى نقاطاً 🌟</option>
              <option value="points-asc">الأقل نقاطاً</option>
            </select>
          </div>
        </div>

        {/* Counter status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
          <span>يتم عرض {filteredAndSortedPuzzles.length} لغز من أصل {puzzles.length}</span>
          {(selectedSubject !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedDifficulty('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="text-primary hover:underline font-bold"
            >
              إلغاء عوامل التصفية
            </button>
          )}
        </div>
      </div>

      {/* Grid of Puzzles */}
      {filteredAndSortedPuzzles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card/50 border border-dashed border-border/60 space-y-3">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <h4 className="text-base font-bold text-foreground">لا توجد ألغاز مطابقة لمعايير البحث</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            جرّب تغيير مادة البحث أو مستوى الصعوبة لاستكشاف المزيد من التحديات الشيقة.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSubject('all');
              setSelectedDifficulty('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="rounded-xl text-xs"
          >
            عرض كافة الألغاز
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredAndSortedPuzzles.map((puzzle, index) => {
              const status = getAttemptStatus(puzzle.id);
              return (
                <PuzzleCard
                  key={puzzle.id}
                  puzzle={puzzle}
                  isAttempted={status.isAttempted}
                  isCorrect={status.isCorrect}
                  onClick={() => handlePuzzleClick(puzzle.id)}
                  index={index}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};

export default AllPuzzlesGrid;
