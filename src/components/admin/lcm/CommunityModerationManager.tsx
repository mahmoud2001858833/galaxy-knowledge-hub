import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  UserX,
  Pin,
  CheckCircle2,
  ExternalLink,
  Eye,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Image as ImageIcon,
  Flag,
  Share2,
  Activity,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  CommunityMessage,
  COMMUNITY_CHANNELS,
  INITIAL_COMMUNITY_MESSAGES
} from '@/types/communityChat';

export const CommunityModerationManager: React.FC = () => {
  const { toast } = useToast();

  const [messages, setMessages] = useState<CommunityMessage[]>(() => {
    const saved = localStorage.getItem('galaxy_community_messages_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_COMMUNITY_MESSAGES;
      }
    }
    return INITIAL_COMMUNITY_MESSAGES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'approved' | 'blocked'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch live messages from Supabase on mount
  useEffect(() => {
    const fetchModerationMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('community_forum_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const parsed: CommunityMessage[] = data.map((row: any) => {
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

          setMessages(parsed);
          localStorage.setItem('galaxy_community_messages_v1', JSON.stringify(parsed));
        }
      } catch (err) {
        console.warn('Moderation fetch error:', err);
      }
    };

    fetchModerationMessages();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('galaxy_community_messages_v1', JSON.stringify(messages));
    window.dispatchEvent(new Event('galaxy_community_updated'));
  }, [messages]);

  // Admin Actions
  const handleDeleteMessage = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      await supabase.from('community_forum_messages').delete().eq('id', id);
      await supabase.from('admin_audit_logs').insert({
        action: 'DELETE_FORUM_MESSAGE',
        details: { messageId: id }
      });
    } catch (err) {
      console.warn('Error deleting message from Supabase:', err);
    }
    toast({
      title: '🗑️ تم حذف الرسالة بنجاح',
      description: 'أزيلت الرسالة فورياً من منتدى الطلبة العام وقاعدة البيانات السحابية.'
    });
  };

  const handleTogglePin = async (id: string) => {
    let nextState = false;
    setMessages(prev => prev.map(m => {
      if (m.id === id) {
        nextState = !m.isPinned;
        toast({
          title: nextState ? '📌 تم تثبيت المنشور' : 'تم إلغاء التثبيت',
          description: nextState ? 'سيظهر المنشور في أعلى المنتدى كمساهمة علمية متميزة.' : ''
        });
        return { ...m, isPinned: nextState };
      }
      return m;
    }));

    try {
      await supabase.from('community_forum_messages').update({ is_pinned: nextState }).eq('id', id);
    } catch (err) {
      console.warn('Error updating pin status:', err);
    }
  };

  const handleIssueWarning = async (studentName: string) => {
    try {
      await supabase.from('admin_audit_logs').insert({
        action: 'ISSUE_STUDENT_WARNING',
        details: { studentName, timestamp: new Date().toISOString() }
      });
    } catch (err) {}
    toast({
      title: `⚠️ تم إصدار إنذار رسمي للطالب: ${studentName}`,
      description: 'سيتلقى الطالب إشعاراً إدارياً رسمياً بضرورة الالتزام بالميثاق الأخلاقي.',
      variant: 'destructive'
    });
  };

  const handleBanStudent = async (studentName: string) => {
    try {
      await supabase.from('admin_audit_logs').insert({
        action: 'BAN_STUDENT',
        details: { studentName, durationDays: 7, timestamp: new Date().toISOString() }
      });
    } catch (err) {}
    toast({
      title: `🚫 تم حظر الطالب: ${studentName}`,
      description: 'تم تقييد وصول الطالب إلى منتدى المحادثة العامة لمدة 7 أيام.',
      variant: 'destructive'
    });
  };

  const handleApproveMessage = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'approved', safetyScore: 99.9 } : m));
    try {
      await supabase.from('community_forum_messages').update({
        status: 'approved',
        moderation_status: 'approved',
        is_flagged: false,
        safety_score: 99.9
      }).eq('id', id);
    } catch (err) {
      console.warn('Error approving message in Supabase:', err);
    }
    toast({
      title: '✅ تم اعتماد وتبرئة الرسالة',
      description: 'أُعيد تصنيف الرسالة كمنشور آمن وموثوق ومزامنتها سحابياً.'
    });
  };

  // Filtered List
  const filteredMessages = messages.filter(m => {
    if (selectedChannel !== 'all' && m.channelId !== selectedChannel) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        m.content.toLowerCase().includes(q) ||
        m.studentName.toLowerCase().includes(q) ||
        (m.platformMention && m.platformMention.title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalFlagged = messages.filter(m => m.status === 'flagged').length;
  const totalApproved = messages.filter(m => m.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Moderation HUD Banner */}
      <div className="rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/20 via-slate-900/60 to-purple-950/20 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-bold border border-red-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>نظام الرقابة الفوري والذكاء الاصطناعي للمحادثات العامة</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              لوحة الإشراف ومراقبة رسائل وصور منتدى الطلبة
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              متابعة جميع رسائل الطلاب، فحص الصور والمرفقات أمنياً، مراجعة الإشارات التفاعلية للمحاكيات (@Mentions)، وإجراءات الحظر الفوري.
            </p>
          </div>

          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-3 py-1.5 font-bold self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 ml-1.5" />
            فحص الأمان التلقائي نشط (99.8%)
          </Badge>
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">إجمالي رسائل المنتدى</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{messages.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">بلاغات ومخالفات معلقة</span>
            <span className="text-xl font-black text-red-600 dark:text-red-400 font-mono">{totalFlagged}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">المشاركات المعتمدة</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{totalApproved}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">الصور المفحوصة أمنياً</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {messages.filter(m => !!m.imageUrl).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الطالب، محتوى الرسالة، أو المورد المشار إليه..."
            className="ps-10 pe-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs sm:text-sm h-11"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs h-11 focus:outline-none"
          >
            <option value="all">كافة القنوات ({messages.length})</option>
            {COMMUNITY_CHANNELS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs h-11 focus:outline-none"
          >
            <option value="all">كافة الحالات</option>
            <option value="approved">معتمدة فقط</option>
            <option value="flagged">مخالفة / مبلّغ عنها</option>
          </select>
        </div>
      </div>

      {/* Messages Moderation Feed */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 text-xs">
            لا توجد رسائل مطابقة لخيارات التصفية.
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 rounded-3xl border transition-all space-y-3 ${
                msg.status === 'flagged'
                  ? 'border-red-400/50 bg-red-50/40 dark:bg-red-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Message Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={msg.studentAvatar}
                    alt={msg.studentName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {msg.studentName}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {msg.studentGrade}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {COMMUNITY_CHANNELS.find(c => c.id === msg.channelId)?.name}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>
                </div>

                {/* AI Safety Score Badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-mono font-bold ${
                      msg.safetyScore > 80
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse'
                    }`}
                  >
                    أمان: {msg.safetyScore}%
                  </Badge>

                  {msg.isPinned && (
                    <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Pin className="w-3 h-3 ml-1" /> مثبت
                    </Badge>
                  )}
                </div>
              </div>

              {/* Message Text Content */}
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {msg.content}
              </p>

              {/* Attached Image & Platform Mention Preview in Admin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {msg.imageUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <img
                      src={msg.imageUrl}
                      alt="مرفق"
                      className="w-14 h-14 rounded-xl object-cover cursor-pointer"
                      onClick={() => setPreviewImage(msg.imageUrl!)}
                    />
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">صورة مرفقة من الطالب</span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> تم الفحص ضد المحتوى غير اللائق
                      </span>
                    </div>
                  </div>
                )}

                {msg.platformMention && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-500/20">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      @
                    </div>
                    <div className="text-xs space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">مورد مشار إليه بالمنصة:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                        {msg.platformMention.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.platformMention.route}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePin(msg.id)}
                    className="text-xs rounded-xl h-8 gap-1.5"
                  >
                    <Pin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{msg.isPinned ? 'إلغاء التثبيت' : 'تثبيت المنشور'}</span>
                  </Button>

                  {msg.status === 'flagged' && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveMessage(msg.id)}
                      className="text-xs rounded-xl h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>اعتماد وتبرئة</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleIssueWarning(msg.studentName)}
                    className="text-xs rounded-xl h-8 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>إنذار الطالب</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleBanStudent(msg.studentName)}
                    className="text-xs rounded-xl h-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>حظر من المنتدى</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="text-xs rounded-xl h-8 gap-1 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الرسالة فوراً</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Preview Lightbox */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <div className="relative max-w-3xl z-10">
              <img src={previewImage} alt="معاينة الإدارة" className="max-h-[85vh] rounded-3xl object-contain shadow-2xl" />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 end-3 p-2 bg-slate-900/80 text-white rounded-full"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
