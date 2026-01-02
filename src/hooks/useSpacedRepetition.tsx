import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SpacedLesson, SpacedReview, SpacedStats, LessonFormData, REVIEW_INTERVALS, DIFFICULTY_LEVELS } from '@/components/spacedRepetition/types';
import { addDays, format, isToday, isBefore, startOfDay } from 'date-fns';

const LOCAL_STORAGE_KEY = 'spaced_repetition_data';

interface LocalData {
  lessons: SpacedLesson[];
  reviews: SpacedReview[];
  stats: SpacedStats[];
}

export const useSpacedRepetition = () => {
  const [lessons, setLessons] = useState<SpacedLesson[]>([]);
  const [reviews, setReviews] = useState<SpacedReview[]>([]);
  const [stats, setStats] = useState<SpacedStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Get local data
  const getLocalData = (): LocalData => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : { lessons: [], reviews: [], stats: [] };
  };

  // Save local data
  const saveLocalData = (data: LocalData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  // Calculate review dates based on difficulty
  const calculateReviewDates = (firstStudyDate: Date, difficulty: 'easy' | 'medium' | 'hard') => {
    const difficultyConfig = DIFFICULTY_LEVELS.find(d => d.value === difficulty);
    const multiplier = difficultyConfig?.multiplier || 1;

    return REVIEW_INTERVALS.map((days, index) => ({
      reviewNumber: index + 1,
      scheduledDate: addDays(firstStudyDate, Math.round(days * multiplier)),
      estimatedRetention: calculateRetention(days, index),
    }));
  };

  // Calculate memory retention using Ebbinghaus formula
  const calculateRetention = (days: number, reviewCount: number) => {
    const strength = 1 + reviewCount * 0.5;
    return Math.round(Math.exp(-days / (strength * 15)) * 100);
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // Fetch from Supabase
        const [lessonsRes, reviewsRes, statsRes] = await Promise.all([
          supabase.from('spaced_lessons').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
          supabase.from('spaced_reviews').select('*, lesson:spaced_lessons(*)').eq('user_id', currentUser.id).order('scheduled_date', { ascending: true }),
          supabase.from('spaced_stats').select('*').eq('user_id', currentUser.id).order('date', { ascending: false }),
        ]);

        if (lessonsRes.data) setLessons(lessonsRes.data as SpacedLesson[]);
        if (reviewsRes.data) setReviews(reviewsRes.data as SpacedReview[]);
        if (statsRes.data) setStats(statsRes.data as SpacedStats[]);
      } else {
        // Load from localStorage
        const localData = getLocalData();
        setLessons(localData.lessons);
        setReviews(localData.reviews);
        setStats(localData.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add new lesson
  const addLesson = async (formData: LessonFormData) => {
    const lessonId = crypto.randomUUID();
    const userId = user?.id || 'local-user';
    const now = new Date().toISOString();

    const newLesson: SpacedLesson = {
      id: lessonId,
      user_id: userId,
      subject_name: formData.subject_name,
      lesson_name: formData.lesson_name,
      first_study_date: format(formData.first_study_date, 'yyyy-MM-dd'),
      study_duration: formData.study_duration,
      difficulty: formData.difficulty,
      current_review_index: 0,
      is_completed: false,
      created_at: now,
      updated_at: now,
    };

    const reviewDates = calculateReviewDates(formData.first_study_date, formData.difficulty);
    const newReviews: SpacedReview[] = reviewDates.map((review) => ({
      id: crypto.randomUUID(),
      lesson_id: lessonId,
      user_id: userId,
      review_number: review.reviewNumber,
      scheduled_date: format(review.scheduledDate, 'yyyy-MM-dd'),
      is_completed: false,
      completed_at: null,
      memory_retention: review.estimatedRetention,
      created_at: now,
    }));

    try {
      if (user) {
        // Save to Supabase
        const { error: lessonError } = await supabase.from('spaced_lessons').insert(newLesson);
        if (lessonError) throw lessonError;

        const { error: reviewsError } = await supabase.from('spaced_reviews').insert(newReviews);
        if (reviewsError) throw reviewsError;
      } else {
        // Save to localStorage
        const localData = getLocalData();
        localData.lessons.push(newLesson);
        localData.reviews.push(...newReviews);
        saveLocalData(localData);
      }

      setLessons(prev => [newLesson, ...prev]);
      setReviews(prev => [...prev, ...newReviews].sort((a, b) => 
        new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
      ));

      toast({
        title: '✅ تم إضافة الدرس بنجاح!',
        description: `تم إنشاء ${newReviews.length} مواعيد مراجعة`,
      });

      return true;
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast({
        title: '❌ حدث خطأ',
        description: 'لم نتمكن من إضافة الدرس',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Complete a review
  const completeReview = async (reviewId: string) => {
    const now = new Date().toISOString();

    try {
      if (user) {
        const { error } = await supabase
          .from('spaced_reviews')
          .update({ is_completed: true, completed_at: now })
          .eq('id', reviewId);
        if (error) throw error;

        // Update stats
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: existingStats } = await supabase
          .from('spaced_stats')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (existingStats) {
          await supabase
            .from('spaced_stats')
            .update({ completed_reviews: existingStats.completed_reviews + 1 })
            .eq('id', existingStats.id);
        } else {
          await supabase.from('spaced_stats').insert({
            user_id: user.id,
            date: today,
            completed_reviews: 1,
            streak_days: 1,
          });
        }
      } else {
        const localData = getLocalData();
        const reviewIndex = localData.reviews.findIndex(r => r.id === reviewId);
        if (reviewIndex !== -1) {
          localData.reviews[reviewIndex].is_completed = true;
          localData.reviews[reviewIndex].completed_at = now;
          saveLocalData(localData);
        }
      }

      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, is_completed: true, completed_at: now } : r
      ));

      // Play success sound
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});

      toast({
        title: '🎉 أحسنت!',
        description: 'تم تسجيل المراجعة بنجاح',
      });

      return true;
    } catch (error) {
      console.error('Error completing review:', error);
      return false;
    }
  };

  // Delete lesson
  const deleteLesson = async (lessonId: string) => {
    try {
      if (user) {
        const { error } = await supabase.from('spaced_lessons').delete().eq('id', lessonId);
        if (error) throw error;
      } else {
        const localData = getLocalData();
        localData.lessons = localData.lessons.filter(l => l.id !== lessonId);
        localData.reviews = localData.reviews.filter(r => r.lesson_id !== lessonId);
        saveLocalData(localData);
      }

      setLessons(prev => prev.filter(l => l.id !== lessonId));
      setReviews(prev => prev.filter(r => r.lesson_id !== lessonId));

      toast({
        title: '🗑️ تم الحذف',
        description: 'تم حذف الدرس وجميع مراجعاته',
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  // Get today's reviews
  const getTodaysReviews = useCallback(() => {
    const today = startOfDay(new Date());
    return reviews.filter(r => {
      const reviewDate = startOfDay(new Date(r.scheduled_date));
      return (isToday(reviewDate) || isBefore(reviewDate, today)) && !r.is_completed;
    });
  }, [reviews]);

  // Get upcoming reviews
  const getUpcomingReviews = useCallback(() => {
    const today = startOfDay(new Date());
    return reviews.filter(r => {
      const reviewDate = startOfDay(new Date(r.scheduled_date));
      return !isBefore(reviewDate, today) && !isToday(reviewDate);
    }).slice(0, 10);
  }, [reviews]);

  // Calculate streak
  const calculateStreak = useCallback(() => {
    if (stats.length === 0) return 0;
    let streak = 0;
    const sortedStats = [...stats].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const stat of sortedStats) {
      if (stat.completed_reviews > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [stats]);

  return {
    lessons,
    reviews,
    stats,
    loading,
    user,
    addLesson,
    completeReview,
    deleteLesson,
    getTodaysReviews,
    getUpcomingReviews,
    calculateStreak,
    refetch: fetchData,
  };
};
