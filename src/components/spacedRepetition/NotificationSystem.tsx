import React, { useEffect, useCallback, useState } from 'react';
import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SpacedReview, SpacedLesson, SUBJECTS } from './types';
import { isToday, isBefore, startOfDay } from 'date-fns';

interface NotificationSystemProps {
  reviews: SpacedReview[];
  lessons: SpacedLesson[];
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ reviews, lessons }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasShownInitialNotification, setHasShownInitialNotification] = useState(false);
  const { toast } = useToast();

  const getPendingReviews = useCallback(() => {
    const today = startOfDay(new Date());
    return reviews.filter(r => {
      const reviewDate = startOfDay(new Date(r.scheduled_date));
      return (isToday(reviewDate) || isBefore(reviewDate, today)) && !r.is_completed;
    });
  }, [reviews]);

  const getOverdueReviews = useCallback(() => {
    const today = startOfDay(new Date());
    return reviews.filter(r => {
      const reviewDate = startOfDay(new Date(r.scheduled_date));
      return isBefore(reviewDate, today) && !r.is_completed;
    });
  }, [reviews]);

  const getSubjectNames = useCallback((reviewList: SpacedReview[]) => {
    const subjectSet = new Set<string>();
    reviewList.forEach(r => {
      const lesson = lessons.find(l => l.id === r.lesson_id);
      if (lesson) {
        const subject = SUBJECTS.find(s => s.value === lesson.subject_name);
        if (subject) subjectSet.add(subject.label);
      }
    });
    return Array.from(subjectSet).join('، ');
  }, [lessons]);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback to a simple beep using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
      });
    } catch (error) {
      console.log('Could not play notification sound');
    }
  }, [soundEnabled]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: '❌ الإشعارات غير مدعومة',
        description: 'متصفحك لا يدعم الإشعارات',
        variant: 'destructive',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast({
        title: '✅ تم تفعيل الإشعارات',
        description: 'ستتلقى تنبيهات بمواعيد المراجعات',
      });
    } else {
      toast({
        title: '❌ تم رفض الإشعارات',
        description: 'لن تتلقى تنبيهات',
        variant: 'destructive',
      });
    }
  };

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (notificationsEnabled && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'spaced-review-reminder',
        requireInteraction: true,
      });
    }
  }, [notificationsEnabled]);

  // Initial notification on mount
  useEffect(() => {
    if (hasShownInitialNotification) return;

    const pending = getPendingReviews();
    const overdue = getOverdueReviews();

    if (pending.length > 0) {
      setHasShownInitialNotification(true);
      playNotificationSound();

      if (overdue.length > 0) {
        toast({
          title: `⚠️ لديك ${overdue.length} مراجعات متأخرة!`,
          description: `المواد: ${getSubjectNames(overdue)}`,
          variant: 'destructive',
        });
        sendBrowserNotification(
          '⚠️ مراجعات متأخرة!',
          `لديك ${overdue.length} مراجعات متأخرة يجب إكمالها`
        );
      } else {
        toast({
          title: `📚 لديك ${pending.length} مراجعات اليوم!`,
          description: `المواد: ${getSubjectNames(pending)}`,
        });
        sendBrowserNotification(
          '📚 مراجعات اليوم',
          `لديك ${pending.length} مراجعات مجدولة لليوم`
        );
      }
    }
  }, [reviews, hasShownInitialNotification, getPendingReviews, getOverdueReviews, getSubjectNames, playNotificationSound, sendBrowserNotification, toast]);

  // Update document title with pending count
  useEffect(() => {
    const pending = getPendingReviews();
    if (pending.length > 0) {
      document.title = `(${pending.length}) نظام المراجعة الذكي`;
    } else {
      document.title = 'نظام المراجعة الذكي';
    }

    return () => {
      document.title = 'نظام المراجعة الذكي';
    };
  }, [getPendingReviews]);

  // Hourly reminder
  useEffect(() => {
    const checkReminder = () => {
      const pending = getPendingReviews();
      if (pending.length > 0) {
        toast({
          title: `⏰ تذكير: ${pending.length} مراجعات متبقية`,
          description: 'لا تنسى إكمال مراجعاتك اليوم!',
        });
        playNotificationSound();
        sendBrowserNotification(
          '⏰ تذكير بالمراجعات',
          `لديك ${pending.length} مراجعات متبقية لليوم`
        );
      }
    };

    // Check every hour
    const interval = setInterval(checkReminder, 3600000);
    return () => clearInterval(interval);
  }, [getPendingReviews, playNotificationSound, sendBrowserNotification, toast]);

  const pendingCount = getPendingReviews().length;
  const overdueCount = getOverdueReviews().length;

  return (
    <div className="flex items-center gap-2">
      {/* Pending reviews badge */}
      {pendingCount > 0 && (
        <Badge 
          className={`
            px-3 py-1 text-sm font-medium
            ${overdueCount > 0 
              ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' 
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }
          `}
        >
          <Bell className="h-3 w-3 ml-1" />
          {pendingCount} مراجعات
        </Badge>
      )}

      {/* Sound toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="text-slate-400 hover:text-white"
        title={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>

      {/* Browser notifications toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={requestNotificationPermission}
        className={`
          ${notificationsEnabled ? 'text-green-400' : 'text-slate-400'} 
          hover:text-white
        `}
        title={notificationsEnabled ? 'الإشعارات مفعّلة' : 'تفعيل الإشعارات'}
      >
        {notificationsEnabled ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default NotificationSystem;
