import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Award, Clock, Trophy, Book, MessageSquare, Video, Star, 
  Loader2, AlertCircle, RefreshCw, Shield, ShieldCheck, Sparkles, 
  Atom, Cpu, HeartHandshake, CheckCircle2, ChevronLeft, ArrowRight,
  Edit3, Save, School, MapPin, Calendar, Flame, Zap, Compass, Share2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfileData {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string;
  school?: string;
  grade?: string;
  governorate?: string;
  score: number;
  solved_puzzles: number;
  usage_time: number;
}

interface SolvedPuzzleItem {
  id: string;
  puzzle_id: string;
  subject: string;
  solved_at: string;
  title: string;
  difficulty: string;
  points: number;
}

interface CompletedLabItem {
  id: string;
  title: string;
  subject: string;
  date: string;
  score: number;
  route: string;
}

// 8 Futuristic Avatar Presets
const AVATAR_PRESETS = [
  { id: 'astronaut', emoji: '🚀', label: 'رائد فضاء / باحث كوني', color: 'from-blue-600 to-indigo-600' },
  { id: 'physicist', emoji: '⚛️', label: 'عالم فيزياء نووية', color: 'from-cyan-600 to-blue-600' },
  { id: 'chemist', emoji: '🧪', label: 'باحث كيمياء جزيئية', color: 'from-emerald-600 to-teal-600' },
  { id: 'robotics', emoji: '🤖', label: 'مهندس روبوتات و AI', color: 'from-purple-600 to-pink-600' },
  { id: 'biologist', emoji: '🧬', label: 'عالم جينات وأحياء', color: 'from-green-600 to-emerald-600' },
  { id: 'mathematician', emoji: '📐', label: 'نابغة رياضيات', color: 'from-amber-600 to-orange-600' },
  { id: 'medic', emoji: '🩺', label: 'مسعف مدرسي متقدم', color: 'from-rose-600 to-red-600' },
  { id: 'scholar', emoji: '🎓', label: 'باحث أكاديمي متميز', color: 'from-violet-600 to-purple-600' },
];

// 12 Prestigious Academic Badges
const ACADEMIC_BADGES = [
  { id: 'newton', title: 'وسام نيوتن للحركة', desc: 'إتقان قوانين الحركة وقوى الجاذبية', icon: '🍎', minScore: 300, subject: 'فيزياء' },
  { id: 'einstein', title: 'وسام آينشتاين للكم', desc: 'حل معضلات النسبية والظاهرة الكهروضوئية', icon: '🌌', minScore: 800, subject: 'فيزياء' },
  { id: 'optics', title: 'وسام ابن الهيثم للبصريات', desc: 'إجراء محاكاة انكسار الضوء والعدسات', icon: '🔍', minScore: 500, subject: 'بصريات' },
  { id: 'faraday', title: 'وسام فاراداي الكهرومغناطيسي', desc: 'محاكاة الحث والموجات الكهرومغناطيسية', icon: '⚡', minScore: 1200, subject: 'فيزياء' },
  { id: 'mendel', title: 'وسام مندل للوراثة', desc: 'إتمام تجارب كريسبر والانتقاء الطبيعي', icon: '🧬', minScore: 600, subject: 'أحياء' },
  { id: 'hooke', title: 'وسام هوك للمرونة', desc: 'تحليل استطالة النوابض وثابت المرونة', icon: '🧲', minScore: 400, subject: 'فيزياء' },
  { id: 'khwarizmi', title: 'وسام الخوارزمي للألغاز', desc: 'حل 20 لغزاً رياضياً متقدماً بنجاح', icon: '📐', minScore: 1000, subject: 'رياضيات' },
  { id: 'damij', title: 'وسام دامج للشمولية', desc: 'المشاركة في مسارات التربية الخاصة ولغة الإشارة', icon: '🤝', minScore: 700, subject: 'شمولية' },
  { id: 'firstaid', title: 'وسام المسعف المدرسي', desc: 'إتمام بروتوكولات الإسعاف الأولي الذكي', icon: '🩺', minScore: 450, subject: 'صحة' },
  { id: 'robotics', title: 'وسام مهندس الروبوتات', desc: 'محاكاة حركيات الذراع والرادار LiDAR', icon: '🤖', minScore: 1500, subject: 'هندسة' },
  { id: 'jordan', title: 'وسام الصقر الأردني', desc: 'حصول على ترتيب متقدم بين أوائل المملكة', icon: '🦅', minScore: 2500, subject: 'وطني' },
  { id: 'century', title: 'وسام المئوية الأولى', desc: 'إتمام 100 محاكاة ولغز على المنظومة', icon: '🏆', minScore: 5000, subject: 'أسطوري' },
];

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'puzzles' | 'labs' | 'settings'>('overview');

  // Modals & Editing
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState('astronaut');

  // Edit Form State
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editGovernorate, setEditGovernorate] = useState('العاصمة عمان');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Content items
  const [solvedPuzzles, setSolvedPuzzles] = useState<SolvedPuzzleItem[]>([]);
  const [completedLabs, setCompletedLabs] = useState<CompletedLabItem[]>([]);

  useEffect(() => {
    fetchProfileData();
    document.title = 'الملف الشخصي الأكاديمي - ذروة العلم';
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        // Fallback for non-logged in testing or guest
        const guestProfile: UserProfileData = {
          id: 'guest-preview',
          username: 'jowmahmoud6',
          full_name: 'محمود (المشرف العام)',
          avatar_url: null,
          bio: 'المشرف العام ومؤسس منصة ذروة العلم للتعليم التفاعلي ثلاثي الأبعاد.',
          school: 'الإدارة العامة لمنظومة ذروة العلم',
          grade: 'المشرف العام الأعلى',
          governorate: 'العاصمة عمان',
          score: 18500,
          solved_puzzles: 48,
          usage_time: 140
        };
        setProfile(guestProfile);
        setCurrentUser({ email: 'jowmahmoud6@gmail.com', id: 'guest-preview' });
        loadMockActivities(guestProfile);
        setIsLoading(false);
        return;
      }

      setCurrentUser(user);

      // Fetch profile from supabase
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const userEmail = user.email || '';
      const isMasterAdmin = userEmail.toLowerCase() === 'jowmahmoud6@gmail.com';

      // Saved extra fields from localStorage
      let extraData: any = {};
      try {
        const savedExtra = localStorage.getItem(`galaxy_user_extra_${user.id}`);
        if (savedExtra) extraData = JSON.parse(savedExtra);
      } catch {}

      const constructedProfile: UserProfileData = {
        id: user.id,
        username: profData?.username || userEmail.split('@')[0],
        full_name: extraData.full_name || profData?.full_name || (isMasterAdmin ? 'محمود (المشرف العام)' : 'طالب مبدع'),
        avatar_url: extraData.avatar_url || profData?.avatar_url || null,
        bio: extraData.bio || (isMasterAdmin ? 'المشرف العام ومؤسس منصة ذروة العلم التفاعلية.' : 'طالب شغوف بالفيزياء والرياضيات والمختبرات الافتراضية.'),
        school: extraData.school || (isMasterAdmin ? 'الإدارة المركزية للمنظومة' : 'مدرسة الملك عبدالله الثاني للتميز'),
        grade: extraData.grade || (isMasterAdmin ? 'المشرف العام الأعلى للمنظومة' : 'الصف العاشر الأساسي'),
        governorate: extraData.governorate || 'العاصمة عمان',
        score: Math.max(profData?.score || 0, isMasterAdmin ? 18500 : 850),
        solved_puzzles: Math.max(profData?.solved_puzzles || 0, isMasterAdmin ? 48 : 12),
        usage_time: Math.max(profData?.usage_time || 0, 45)
      };

      setProfile(constructedProfile);
      setEditFullName(constructedProfile.full_name || '');
      setEditBio(constructedProfile.bio || '');
      setEditSchool(constructedProfile.school || '');
      setEditGrade(constructedProfile.grade || '');
      setEditGovernorate(constructedProfile.governorate || 'العاصمة عمان');

      loadMockActivities(constructedProfile);

    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('حدث خطأ في تحميل بيانات الملف الشخصي');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockActivities = (prof: UserProfileData) => {
    // Solved puzzles
    setSolvedPuzzles([
      { id: 'sp-1', puzzle_id: 'p-1', subject: 'فيزياء', title: 'لغز الطاقة الحركية ومسار التزلج', difficulty: 'متوسط', points: 30, solved_at: 'منذ ساعتين' },
      { id: 'sp-2', puzzle_id: 'p-2', subject: 'كيمياء', title: 'لغز الروابط التساهمية وجدول مندليف', difficulty: 'متقدم', points: 45, solved_at: 'أمس' },
      { id: 'sp-3', puzzle_id: 'p-3', subject: 'رياضيات', title: 'تحدي الدوال المثلثية والمتجهات', difficulty: 'سهل', points: 25, solved_at: 'قبل يومين' },
      { id: 'sp-4', puzzle_id: 'p-4', subject: 'أحياء', title: 'لغز النقل الغشائي والأسموزية', difficulty: 'متوسط', points: 35, solved_at: 'قبل 4 أيام' },
    ]);

    // Completed 3D Labs
    setCompletedLabs([
      { id: 'lab-1', title: 'محاكاة قانون هوك والمرونة 3D', subject: 'فيزياء', date: 'اليوم', score: 100, route: '/workbench/hookes-law' },
      { id: 'lab-2', title: 'محاكاة انكسار الضوء والعدسات 3D', subject: 'بصريات', date: 'أمس', score: 98, route: '/workbench/geometric-optics-basics' },
      { id: 'lab-3', title: 'مختبر الدوائر الكهربائية المغلقة DC', subject: 'كهرباء', date: 'قبل يومين', score: 95, route: '/workbench/circuit-construction-kit-dc' },
      { id: 'lab-4', title: 'بناء النواة والنموذج الذري 3D', subject: 'فيزياء نووية', date: 'قبل 3 أيام', score: 100, route: '/workbench/build-a-nucleus' },
    ]);
  };

  // Rank and Level Calculation
  const calculateAcademicRank = (score: number) => {
    if (score < 500) {
      return { level: 1, title: 'مستكشف ناشئ', min: 0, next: 500, badge: 'رتبة 1', color: 'text-cyan-500' };
    } else if (score < 1500) {
      return { level: 2, title: 'باحث متدرب', min: 500, next: 1500, badge: 'رتبة 2', color: 'text-blue-500' };
    } else if (score < 3500) {
      return { level: 3, title: 'فيزيائي ممارس', min: 1500, next: 3500, badge: 'رتبة 3', color: 'text-purple-500' };
    } else if (score < 7000) {
      return { level: 4, title: 'خبير المختبرات 3D', min: 3500, next: 7000, badge: 'رتبة 4', color: 'text-emerald-500' };
    } else if (score < 12000) {
      return { level: 5, title: 'عالم معتمد بالمنظومة', min: 7000, next: 12000, badge: 'رتبة 5', color: 'text-amber-500' };
    } else {
      return { level: 6, title: 'أسطورة ذروة العلم', min: 12000, next: 20000, badge: 'الرتبة العليا', color: 'text-amber-400' };
    }
  };

  const rank = profile ? calculateAcademicRank(profile.score) : calculateAcademicRank(0);
  const xpProgress = Math.min(Math.max(((profile?.score || 0) - rank.min) / (rank.next - rank.min) * 100, 5), 100);

  // Check if Master Admin
  const isMasterAdmin = currentUser?.email?.toLowerCase() === 'jowmahmoud6@gmail.com';

  // Save Profile Changes
  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSavingProfile(true);

    try {
      const updatedProfile: UserProfileData = {
        ...profile,
        full_name: editFullName.trim() || profile.full_name,
        bio: editBio.trim() || profile.bio,
        school: editSchool.trim() || profile.school,
        grade: editGrade.trim() || profile.grade,
        governorate: editGovernorate || profile.governorate
      };

      // Save to Supabase
      if (currentUser?.id && currentUser.id !== 'guest-preview') {
        await supabase
          .from('profiles')
          .update({
            full_name: updatedProfile.full_name,
          })
          .eq('id', currentUser.id);

        localStorage.setItem(`galaxy_user_extra_${currentUser.id}`, JSON.stringify({
          full_name: updatedProfile.full_name,
          bio: updatedProfile.bio,
          school: updatedProfile.school,
          grade: updatedProfile.grade,
          governorate: updatedProfile.governorate,
          avatar_url: updatedProfile.avatar_url
        }));
      }

      setProfile(updatedProfile);
      setIsEditProfileOpen(false);
      toast.success('تم حفظ وتحديث بيانات الملف الشخصي بنجاح ✨');
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Avatar Selection Handler
  const handleSelectAvatarPreset = (preset: typeof AVATAR_PRESETS[0]) => {
    if (!profile) return;
    setSelectedAvatarId(preset.id);
    const updated = { ...profile, avatar_url: preset.emoji };
    setProfile(updated);

    if (currentUser?.id) {
      localStorage.setItem(`galaxy_user_extra_${currentUser.id}`, JSON.stringify({
        ...profile,
        avatar_url: preset.emoji
      }));
    }

    setIsAvatarPickerOpen(false);
    toast.success(`تم اختيار الرمز التعبيري: ${preset.label}`);
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white font-sans transition-colors duration-300" dir="rtl">
      <StarField starCount={80} speed={0.08} />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mb-4" />
            <div className="text-slate-800 dark:text-white font-bold text-lg">جاري تحميل الملف الأكاديمي الشامل...</div>
            <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">ذروة العلم 2.0</div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-black">{error}</h3>
            <Button onClick={fetchProfileData} className="rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        ) : profile && (
          <>
            {/* 1. Ultra-Luxurious Profile Persona Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8"
            >
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left (Avatar & Identity) */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-right">
                  {/* Interactive Avatar */}
                  <div className="relative group shrink-0">
                    <div 
                      onClick={() => setIsAvatarPickerOpen(true)}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-1 cursor-pointer shadow-lg shadow-cyan-500/25 transition-transform group-hover:scale-105"
                    >
                      <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-4xl sm:text-5xl">
                        {profile.avatar_url || '🚀'}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsAvatarPickerOpen(true)}
                      className="absolute -bottom-1 -left-1 p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-transform hover:scale-110"
                      title="تغيير الأفاتار"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Name, Bio, and Role */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {profile.full_name || profile.username}
                      </h1>

                      {/* Master Admin VIP Badge */}
                      {isMasterAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30">
                          <Sparkles className="w-3.5 h-3.5 fill-current" />
                          <span>المشرف العام الأعلى للمنظومة ⚡️</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-xs border border-cyan-400/20">
                          <School className="w-3.5 h-3.5" />
                          <span>طالب مسجل</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                      {currentUser?.email}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                      {profile.bio}
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <School className="w-3.5 h-3.5 text-cyan-500" />
                        {profile.school}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-purple-500" />
                        {profile.grade}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {profile.governorate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-row md:flex-col items-center justify-center gap-2 shrink-0">
                  {isMasterAdmin && (
                    <Link to="/super-admin-control-hub" className="w-full">
                      <Button className="w-full h-11 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs gap-2 shadow-lg shadow-amber-500/25">
                        <ShieldCheck className="w-4 h-4" />
                        <span>لوحة الأدمن</span>
                      </Button>
                    </Link>
                  )}

                  <Button
                    onClick={() => setIsEditProfileOpen(true)}
                    variant="outline"
                    className="w-full h-10 px-4 rounded-2xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-500" />
                    <span>تعديل الملف</span>
                  </Button>

                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('تم نسخ رابط ملفك الأكاديمي بنجاح 📋');
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 rounded-xl text-xs text-slate-500 hover:text-slate-800 gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة</span>
                  </Button>
                </div>
              </div>

              {/* Academic Rank & XP Progression Bar */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">الرتبة الأكاديمية الحالية:</span>
                    <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs">
                      المستوى {rank.level} • {rank.title}
                    </Badge>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                    {profile.score.toLocaleString()} XP / {rank.next.toLocaleString()} XP
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>بداية الرتبة ({rank.min} XP)</span>
                  <span>الهدف التالي: {rank.next - profile.score > 0 ? `متبقي ${rank.next - profile.score} نقطة للترقية القادمة` : 'الرتبة القصوى مكتملة!'}</span>
                  <span>الرتبة التالية ({rank.next} XP)</span>
                </div>
              </div>
            </motion.div>

            {/* 2. Key Metrics Showcase (5-Card Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">نقاط الخبرة (XP)</span>
                  <span className="text-2xl font-black text-amber-500">{profile.score.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">● متصدر نشط</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">الألغاز المحلولة</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{profile.solved_puzzles}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">تحديات علمية</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">المحاكيات المنجزة</span>
                  <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{completedLabs.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">مختبرات 3D</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                  <Atom className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">ساعات البحث والتعلم</span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{profile.usage_time} س</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">تفاعل مخبري</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">الترتيب الأكاديمي</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{isMasterAdmin ? 'المركز #1' : 'المركز #4'}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">على مستوى المنظومة</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* 3. Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>سجل النشاط الزمني</span>
              </button>

              <button
                onClick={() => setActiveTab('badges')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'badges'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-cyan-500" />
                <span>أوسمة الفخر والشرف (12)</span>
              </button>

              <button
                onClick={() => setActiveTab('puzzles')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'puzzles'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                <span>الألغاز المكتملة ({solvedPuzzles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('labs')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'labs'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Atom className="w-3.5 h-3.5 text-purple-500" />
                <span>المختبرات والمحاكاة 3D ({completedLabs.length})</span>
              </button>
            </div>

            {/* Tab 1: Activity Timeline */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <span>سجل النشاط والتفاعل الزمني اللحظي</span>
                    </h3>
                    <Badge className="bg-cyan-500/10 text-cyan-600 text-[10px]">محدث لحظياً</Badge>
                  </div>

                  <div className="space-y-3">
                    {[
                      { title: 'إتمام تجربة محاكاة قانون هوك والمرونة 3D', category: 'مختبرات', time: 'اليوم، منذ ساعة', points: 40, icon: Atom, color: 'text-cyan-500' },
                      { title: 'حل لغز الروابط التساهمية وجدول مندليف بنجاح', category: 'ألغاز', time: 'اليوم، 11:30 ص', points: 30, icon: Trophy, color: 'text-emerald-500' },
                      { title: 'الاطلاع على بروتوكول لغة الإشارة في منصة دامج', category: 'شمولية', time: 'أمس، 05:20 م', points: 20, icon: HeartHandshake, color: 'text-rose-500' },
                      { title: 'محاكاة الأذرع الهندسية في استوديو الروبوتات', category: 'هندسة', time: 'أمس، 02:15 م', points: 50, icon: Cpu, color: 'text-purple-500' },
                      { title: 'تسجيل دخول وتحديث الملف الأكاديمي', category: 'نظام', time: 'قبل يومين', points: 10, icon: ShieldCheck, color: 'text-blue-500' },
                    ].map((act, i) => (
                      <div 
                        key={i}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                            {React.createElement(act.icon, { className: `w-5 h-5 ${act.color}` })}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{act.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{act.category} • {act.time}</p>
                          </div>
                        </div>

                        <span className="font-black text-amber-500 text-xs shrink-0">
                          +{act.points} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Academic Badges & Honors Wall */}
            {activeTab === 'badges' && (
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>جدار أوسمة الفخر والشرف الأكاديمي (12 وساماً)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      أوسمة تمنح تلقائياً عند تحقيق الإنجازات وحل التحديات العلمية والمخبرية على المنظومة.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ACADEMIC_BADGES.map((badge) => {
                      const isUnlocked = (profile.score || 0) >= badge.minScore;

                      return (
                        <div
                          key={badge.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isUnlocked
                              ? 'bg-gradient-to-b from-amber-500/10 via-transparent to-transparent border-amber-500/30 dark:border-amber-400/30 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl filter drop-shadow-sm">{badge.icon}</span>
                              <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">{badge.title}</h4>
                                <Badge className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none px-1.5 py-0 mt-1">
                                  {badge.subject}
                                </Badge>
                              </div>
                            </div>

                            {isUnlocked ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                يتطلب {badge.minScore} XP
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            {badge.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Solved Puzzles */}
            {activeTab === 'puzzles' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                    <span>سجل الألغاز العلمية المكتملة</span>
                  </h3>
                  <Link to="/subject-puzzles">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1">
                      <span>دوري الألغاز</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {solvedPuzzles.map((puz) => (
                    <div
                      key={puz.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                            {puz.subject}
                          </Badge>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {puz.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          المستوى: {puz.difficulty} • تم الحل {puz.solved_at}
                        </p>
                      </div>

                      <span className="font-black text-amber-500 text-xs">
                        +{puz.points} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Completed 3D Labs */}
            {activeTab === 'labs' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Atom className="w-4 h-4 text-cyan-500" />
                    <span>المختبرات والمحاكاة المنجزة (3D Pass)</span>
                  </h3>
                  <Link to="/experiments-section">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1">
                      <span>كتالوج المختبرات (49)</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {completedLabs.map((lab) => (
                    <div
                      key={lab.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                    >
                      <div>
                        <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 text-[10px] mb-1">
                          {lab.subject}
                        </Badge>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{lab.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">نسبة الإتقان: {lab.score}% • {lab.date}</p>
                      </div>

                      <Link to={lab.route}>
                        <Button size="sm" className="h-8 px-3 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-950 text-white text-[11px] font-bold">
                          إعادة التشغيل
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Edit Profile Modal */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right font-sans" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              تعديل بيانات الملف الأكاديمي
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              قم بتحديث معلوماتك الشخصية والأكاديمية لتظهر لزملائك ومعلميك
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">الاسم الكامل</label>
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل..."
                className="h-10 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">النبذة الشخصية</label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="اكتب نبذة مختصرة عن اهتماماتك العلمية..."
                rows={3}
                className="rounded-xl text-xs bg-slate-50 dark:bg-slate-800 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">المدرسة / الجامعة</label>
                <Input
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  placeholder="اسم المدرسة..."
                  className="h-10 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">الصف / التخصص</label>
                <Input
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  placeholder="مثال: الصف العاشر العلمي..."
                  className="h-10 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">المحافظة</label>
              <select
                value={editGovernorate}
                onChange={(e) => setEditGovernorate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
              >
                {['العاصمة عمان', 'إربد', 'الزرقاء', 'البلقاء', 'العقبة', 'الكرك', 'مأدبا', 'جرش', 'عجلون', 'المفرق', 'معان', 'الطفيلة'].map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="flex-1 h-11 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditProfileOpen(false)}
              className="h-11 px-5 rounded-2xl text-xs font-bold border-slate-300 dark:border-slate-700"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Customizer Picker Modal */}
      <Dialog open={isAvatarPickerOpen} onOpenChange={setIsAvatarPickerOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right font-sans" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              اختر رمزك الأكاديمي المفضل (Avatar)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              اختر الأيقونة التي تمثل تخصصك وشغفك العلمي
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 my-4">
            {AVATAR_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectAvatarPreset(preset)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  selectedAvatarId === preset.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${preset.color} flex items-center justify-center text-2xl shadow-md`}>
                  {preset.emoji}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{preset.label}</h4>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsAvatarPickerOpen(false)}
            className="w-full h-10 rounded-2xl text-xs font-bold border-slate-300 dark:border-slate-700"
          >
            إغلاق
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default UserProfile;
