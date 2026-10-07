import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  AtSign, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Filter, 
  Pin, 
  Radio, 
  BookOpen, 
  Atom, 
  Bot, 
  GraduationCap, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  CommunityMessage, 
  COMMUNITY_CHANNELS, 
  INITIAL_COMMUNITY_MESSAGES, 
  auditMessageSafety, 
  CommunityChannel 
} from '@/types/communityChat';
import { PlatformResourceMention, PLATFORM_MENTION_RESOURCES as PLATFORM_MENTIONS_CATALOG } from '@/data/platformMentionsData';
import { PlatformMentionModal } from '@/components/community/PlatformMentionModal';
import { CommunityMessageCard } from '@/components/community/CommunityMessageCard';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'galaxy_community_messages_v1';
const STUDENT_PROFILE_KEY = 'galaxy_community_student_profile_v1';

export const StudentCommunityForum: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'mentions' | 'images' | 'pinned'>('all');
  
  // Composer State
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMention, setSelectedMention] = useState<PlatformResourceMention | null>(null);
  const [isMentionModalOpen, setIsMentionModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Student Identity State
  const [studentName, setStudentName] = useState<string>('طالب ذروة العلم');
  const [studentGrade, setStudentGrade] = useState<string>('توجيهي علمي');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Initialize and load messages with Supabase Cloud Sync
  useEffect(() => {
    // 1. Instant load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages(INITIAL_COMMUNITY_MESSAGES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_MESSAGES));
      }

      const storedProfile = localStorage.getItem(STUDENT_PROFILE_KEY);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setStudentName(parsed.name || 'طالب ذروة العلم');
        setStudentGrade(parsed.grade || 'توجيهي علمي');
      }
    } catch (e) {
      console.error('Error loading community local cache', e);
      setMessages(INITIAL_COMMUNITY_MESSAGES);
    }

    // 2. Fetch live messages from Supabase
    const fetchCloudMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('community_forum_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const cloudMessages: CommunityMessage[] = data.map((row: any) => {
            if (row.raw_data && row.raw_data.id) {
              return {
                ...row.raw_data,
                id: row.id,
                isPinned: row.is_pinned ?? row.raw_data.isPinned,
                status: row.status ?? row.raw_data.status,
                reactions: row.reactions ?? row.raw_data.reactions,
              };
            }
            return {
              id: row.id,
              studentName: row.student_name || row.author_name || 'طالب ذروة العلم',
              studentAvatar: row.student_avatar || row.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              studentRole: (row.student_role || row.author_role || 'طالب متميز') as any,
              studentGrade: row.student_grade || row.author_grade || 'توجيهي علمي',
              channelId: (row.channel_id || row.channel || 'general') as any,
              content: row.content || '',
              imageUrl: row.image_url || undefined,
              platformMention: row.platform_mention || row.mention || undefined,
              timestamp: row.created_at ? new Date(row.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن',
              createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
              reactions: row.reactions || { thumbsUp: 0, inspiring: 0, question: 0, brilliant: 0 },
              isPinned: !!row.is_pinned,
              status: (row.status || row.moderation_status || 'approved') as any,
              flagReason: row.flag_reason || undefined,
              safetyScore: Number(row.safety_score) || 100,
              replyTo: row.reply_to || undefined
            };
          });

          setMessages(cloudMessages);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudMessages));
        }
      } catch (err) {
        console.warn('Supabase community fetch warning:', err);
      }
    };

    fetchCloudMessages();

    // 3. Subscribe to Realtime Postgres changes
    const channel = supabase
      .channel('public:community_forum_messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_forum_messages' },
        () => {
          fetchCloudMessages();
        }
      )
      .subscribe();

    // 4. Listen for local storage changes or custom broadcast
    const handleUpdate = () => {
      try {
        const updated = localStorage.getItem(STORAGE_KEY);
        if (updated) setMessages(JSON.parse(updated));
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('galaxy_community_updated', handleUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('galaxy_community_updated', handleUpdate);
    };
  }, []);

  const saveMessages = (newMessages: CommunityMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
      window.dispatchEvent(new Event('galaxy_community_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const syncMessageToCloud = async (msg: CommunityMessage) => {
    try {
      await (supabase.from('community_forum_messages') as any).upsert({
        id: msg.id,
        channel_id: msg.channelId,
        channel: msg.channelId,
        student_name: msg.studentName,
        author_name: msg.studentName,
        student_avatar: msg.studentAvatar,
        author_avatar: msg.studentAvatar,
        student_role: msg.studentRole,
        author_role: msg.studentRole,
        student_grade: msg.studentGrade,
        author_grade: msg.studentGrade,
        content: msg.content,
        image_url: msg.imageUrl,
        platform_mention: msg.platformMention,
        mention: msg.platformMention,
        reactions: msg.reactions,
        is_pinned: !!msg.isPinned,
        is_flagged: msg.status === 'flagged',
        status: msg.status,
        moderation_status: msg.status,
        flag_reason: msg.flagReason,
        safety_score: msg.safetyScore,
        reply_to: msg.replyTo,
        raw_data: msg,
        created_at: new Date(msg.createdAt || Date.now()).toISOString(),
      });
    } catch (err) {
      console.warn('Sync message to Supabase cloud warning:', err);
    }
  };

  // Image Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً، الحد الأقصى هو 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      toast.success('تم إرفاق الصورة بنجاح! ستخضع للفحص الآلي قبل النشر.');
    };
    reader.readAsDataURL(file);
  };

  // Preset sample image picker
  const handlePickPresetImage = (url: string) => {
    setSelectedImage(url);
    toast.success('تم اختيار نموذج توضيحي');
  };

  // Post Message Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage && !selectedMention) {
      toast.error('يرجى كتابة نص، أو إرفاق صورة، أو اختيار محاكاة للشرح عنها.');
      return;
    }

    setIsSubmitting(true);

    // AI Safety Scanner
    const safety = auditMessageSafety(inputText, !!selectedImage);
    if (!safety.isSafe) {
      setIsSubmitting(false);
      toast.error(safety.flagReason || 'تم رفض الرسالة بواسطة خوارزمية الأمان المدرسي');
      return;
    }

    const newMessage: CommunityMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentName: studentName,
      studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      studentRole: 'طالب متميز',
      studentGrade: studentGrade,
      channelId: activeChannel as CommunityMessage['channelId'],
      content: inputText.trim(),
      imageUrl: selectedImage || undefined,
      platformMention: selectedMention || undefined,
      timestamp: 'الآن',
      createdAt: Date.now(),
      reactions: {
        thumbsUp: 0,
        inspiring: 0,
        question: 0,
        brilliant: 0,
      },
      isPinned: false,
      status: safety.isSafe ? (safety.score < 80 ? 'flagged' : 'approved') : 'blocked',
      flagReason: safety.isSafe ? (safety.score < 80 ? safety.reason : undefined) : safety.reason,
      safetyScore: safety.score,
    };

    const updated = [newMessage, ...messages];
    saveMessages(updated);
    syncMessageToCloud(newMessage);

    // Reset composer
    setInputText('');
    setSelectedImage(null);
    setSelectedMention(null);
    setIsSubmitting(false);

    if (safety.score < 80) {
      toast.warning('تم إرسال رسالتك وهي قيد المراجعة الفورية من قبل المشرف التربوي.');
    } else {
      toast.success('تم نشر مشاركتك في المنتدى بنجاح! 🚀');
    }
  };

  // Reaction Handler
  const handleReaction = (messageId: string, type: 'thumbsUp' | 'inspiring' | 'question' | 'brilliant') => {
    let targetMsg: CommunityMessage | undefined;
    const updated = messages.map(m => {
      if (m.id === messageId) {
        const mutated = {
          ...m,
          reactions: {
            ...m.reactions,
            [type]: (m.reactions[type] || 0) + 1,
          }
        };
        targetMsg = mutated;
        return mutated;
      }
      return m;
    });
    saveMessages(updated);
    if (targetMsg) {
      syncMessageToCloud(targetMsg);
    }
  };

  // Report Handler
  const handleReport = (messageId: string) => {
    let targetMsg: CommunityMessage | undefined;
    const updated = messages.map(m => {
      if (m.id === messageId) {
        const mutated = {
          ...m,
          status: 'flagged' as const,
          flagReason: 'بلاغ من طالب لمراجعة المشرف الإداري'
        };
        targetMsg = mutated;
        return mutated;
      }
      return m;
    });
    saveMessages(updated);
    if (targetMsg) {
      syncMessageToCloud(targetMsg);
    }
    toast.info('تم تقديم البلاغ للرقابة الإدارية وسيتعامل المشرف معه فوراً.');
  };

  // Save profile
  const handleSaveProfile = () => {
    try {
      localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify({ name: studentName, grade: studentGrade }));
      setIsProfileModalOpen(false);
      toast.success('تم حفظ بطاقة الطالب بنجاح');
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Messages
  const currentChannelInfo = COMMUNITY_CHANNELS.find(c => c.id === activeChannel) || COMMUNITY_CHANNELS[0];
  
  const filteredMessages = messages.filter(m => {
    // Channel filter (allow pinned messages from any channel or current channel)
    const matchesChannel = m.channelId === activeChannel;
    
    // Search query filter
    const matchesQuery = searchQuery.trim() === '' || 
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.platformMention && m.platformMention.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Tab filter
    if (filterType === 'mentions') return matchesChannel && matchesQuery && !!m.platformMention;
    if (filterType === 'images') return matchesChannel && matchesQuery && !!m.imageUrl;
    if (filterType === 'pinned') return (matchesChannel || m.isPinned) && matchesQuery && m.isPinned;

    return matchesChannel && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b18] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans" dir="rtl">
      {/* Top Banner / Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900/20 via-indigo-950/10 to-transparent border-b border-slate-200/80 dark:border-slate-800/80 pt-8 pb-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>ملتقى طلبة ذروة العلم والمناقشات العلمية التفاعلية</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <span>مجتمع الطلبة وغرفة المعرفة العامة</span>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono font-bold shadow-md shadow-blue-500/20">
                  حي ومراقب 24/7
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                تبادل الأفكار، ارفع صور استفساراتك، وأشر إلى أي محاكاة أو صفحة في المنصة لشرحها لزملائك مع إمكانية الانتقال المباشر بنقرة واحدة!
              </p>
            </div>

            {/* Quick Actions & Profile Badge */}
            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm flex items-center gap-2.5 text-xs transition-all"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {studentName[0] || 'ط'}
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">{studentName}</div>
                  <div className="text-[10px] text-slate-400">{studentGrade}</div>
                </div>
                <UserCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
              </button>

              <Link
                to="/control-center"
                className="px-3 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">رقابة الإدارة</span>
              </Link>
            </div>
          </div>

          {/* Guidelines Mini Pill */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                <strong className="text-slate-900 dark:text-white">سياسة الأمان:</strong> المحتوى والصور تخضع للرقابة والتدقيق الآلي المتقدم لحفظ بيئة تعليمية محترمة وآمنة.
              </span>
            </div>
            <span className="text-[11px] text-blue-600 dark:text-cyan-400 font-bold hidden md:inline">
              متصلون الآن: 148 طالب وطالبة 🟢
            </span>
          </div>
        </div>
      </section>

      {/* Main Forum Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Right Sidebar: Channels & Stats */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Channels Card */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  قنوات النقاش التخصصية
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                  {COMMUNITY_CHANNELS.length}
                </span>
              </div>

              <div className="space-y-1">
                {COMMUNITY_CHANNELS.map((channel) => {
                  const isActive = activeChannel === channel.id;
                  const channelMsgCount = messages.filter(m => m.channelId === channel.id).length;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`w-full p-2.5 rounded-2xl text-right transition-all flex items-center justify-between text-xs font-semibold ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base">{channel.icon}</span>
                        <div className="truncate">
                          <div className="truncate">{channel.name}</div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {channel.description}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {channelMsgCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Mention Tip Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200/60 dark:border-slate-800 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-blue-700 dark:text-cyan-400 font-bold text-xs">
                <AtSign className="w-4 h-4" />
                <span>كيف تضع إشارة إلى محاكاة؟</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                اضغط على زر <strong className="text-blue-600 dark:text-cyan-300">@ إشارة لمحاكاة</strong> في صندوق الكتابة، واختر التجربة التي تريد شرحها أو الاستفسار عنها. سيتم تضمين بطاقة تفاعلية تنقل زملاءك فوراً للتجربة!
              </p>
              <Button
                onClick={() => setIsMentionModalOpen(true)}
                variant="outline"
                size="sm"
                className="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border-blue-300 dark:border-slate-700 text-blue-700 dark:text-cyan-300 font-bold"
              >
                تصفح قائمة المحاكيات المتاحة ↗
              </Button>
            </div>

            {/* Community Rules Box */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>ميثاق شرف مجتمع ذروة العلم</span>
              </span>
              <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>الاحترام المتبادل بين جميع الطلبة.</li>
                <li>يمنع منعاً باتاً نشر محتوى غير تربوي أو روابط خارجية مشبوهة.</li>
                <li>يتم حظر أي حساب يخالف المعايير من قبل الإشراف.</li>
              </ul>
            </div>
          </aside>

          {/* Left Main Area: Composer + Feed */}
          <main className="lg:col-span-9 space-y-4">
            
            {/* Active Channel Header HUD */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                  {currentChannelInfo.icon}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{currentChannelInfo.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      #{currentChannelInfo.id}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentChannelInfo.description}</p>
                </div>
              </div>

              {/* Filters and Search Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في الرسائل..."
                    className="h-8 pr-8 pl-3 text-xs w-36 sm:w-44 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      filterType === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFilterType('mentions')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      filterType === 'mentions' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    @ المحاكيات
                  </button>
                  <button
                    onClick={() => setFilterType('images')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      filterType === 'images' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    صور
                  </button>
                  <button
                    onClick={() => setFilterType('pinned')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      filterType === 'pinned' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    المثبتة
                  </button>
                </div>
              </div>
            </div>

            {/* Message Composer Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500/20 dark:border-blue-500/20 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>انشر فكرة أو سؤالاً لزملائك في قناة ({currentChannelInfo.name})</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  كتابة باسم: <strong className="text-slate-700 dark:text-slate-200">{studentName}</strong>
                </span>
              </div>

              {/* Text Area */}
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب رسالتك، استفسارك، أو شرحك هنا... (يمكنك إرفاق صورة أو اختيار أي محاكاة للشرح عنها)"
                className="w-full min-h-[90px] rounded-2xl bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-xs sm:text-sm p-3 focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none"
              />

              {/* Active Selected Mention Preview Badge */}
              {selectedMention && (
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{selectedMention.icon}</span>
                    <div>
                      <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold block">
                        محاكاة / قسم مدمج في الرسالة:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedMention.title}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMention(null)}
                    className="p-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 text-slate-500 hover:text-rose-600 transition-colors"
                    title="إلغاء الإشارة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Selected Image Preview Box */}
              {selectedImage && (
                <div className="relative inline-block rounded-2xl overflow-hidden border-2 border-blue-400 shadow-md">
                  <img
                    src={selectedImage}
                    alt="معاينة الصورة المرفقة"
                    className="h-28 max-w-xs object-cover"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1.5 left-1.5 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white shadow-md transition-colors"
                    title="حذف الصورة"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-mono">
                    صورة مرفقة
                  </span>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* File Upload Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs gap-1.5 text-slate-700 dark:text-slate-300 hover:border-blue-500"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>إرفاق صورة 📷</span>
                  </Button>

                  {/* Mention Simulation / Platform Resource */}
                  <Button
                    type="button"
                    onClick={() => setIsMentionModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className={`rounded-xl text-xs gap-1.5 border ${
                      selectedMention 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950 dark:text-cyan-300 font-bold' 
                        : 'text-slate-700 dark:text-slate-300 hover:border-blue-500'
                    }`}
                  >
                    <AtSign className="w-3.5 h-3.5 text-cyan-500" />
                    <span>@ إشارة لمحاكاة / قسم</span>
                  </Button>

                  {/* Quick Preset Samples Dropdown button */}
                  <div className="hidden md:flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePickPresetImage('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80')}
                      className="px-2 py-1 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="مخطط فيزياء توضيحي"
                    >
                      + مخطط مسألة
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePickPresetImage('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80')}
                      className="px-2 py-1 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="دارة إلكترونية وروبوت"
                    >
                      + دارة أردوينو
                    </button>
                  </div>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={isSubmitting || (!inputText.trim() && !selectedImage && !selectedMention)}
                  className="rounded-2xl text-xs font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 px-6 h-10"
                >
                  <Send className="w-4 h-4 ml-1" />
                  <span>نشر المشاركة 🚀</span>
                </Button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    لا توجد مشاركات في هذا القسم أو الفلتر حتى الآن
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    كن أول من يفتتح النقاش العلمي في هذه القناة! اكتب سؤالك أو أشر لمحاكاة تريد التحدث عنها.
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <CommunityMessageCard
                    key={msg.id}
                    message={msg}
                    onReact={handleReaction}
                    onReport={handleReport}
                  />
                ))
              )}
            </div>

            <div ref={messagesEndRef} />
          </main>
        </div>
      </div>

      {/* Platform Resource Mention Picker Modal */}
      <PlatformMentionModal
        isOpen={isMentionModalOpen}
        onClose={() => setIsMentionModalOpen(false)}
        onSelectMention={(mention) => setSelectedMention(mention)}
      />

      {/* Student Profile Customizer Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span>تعديل بطاقة الطالب في المنتدى</span>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم الطالب / الاسم المستعار:</label>
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="مثال: يزن العبداللات"
                    className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الصف / الفرع الأكاديمي:</label>
                  <Input
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    placeholder="مثال: توجيهي علمي 2008 / بيرسون BTEC هندسة"
                    className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-slate-800/70 border border-blue-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-blue-700 dark:text-cyan-300 block">معاينة بطاقتك:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {studentName[0] || 'ط'}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{studentName}</span>
                    <span className="text-[10px] text-slate-400">({studentGrade})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  إلغاء
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  className="rounded-xl text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  حفظ البطاقة
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentCommunityForum;
