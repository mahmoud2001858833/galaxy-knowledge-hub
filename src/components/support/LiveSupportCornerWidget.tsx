import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  User,
  Mail,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { liveSupportService, type SupportSession } from '@/services/liveSupportService';
import { toast } from 'sonner';

export const LiveSupportCornerWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem('galaxy_active_support_session_id');
  });

  const [session, setSession] = useState<SupportSession | null>(null);

  // Form inputs for new inquiry
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSessionId) {
      const sess = liveSupportService.getSessionById(activeSessionId);
      if (sess) {
        setSession(sess);
      }
    }
  }, [activeSessionId]);

  useEffect(() => {
    const handleUpdate = () => {
      if (activeSessionId) {
        const sess = liveSupportService.getSessionById(activeSessionId);
        if (sess) setSession({ ...sess });
      }
    };
    window.addEventListener('galaxy_live_support_updated' as any, handleUpdate);
    return () => {
      window.removeEventListener('galaxy_live_support_updated' as any, handleUpdate);
    };
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error('يرجى كتابة الاسم ورسالتك للإدارة');
      return;
    }

    const newSess = liveSupportService.createSession({
      userName: name,
      userEmail: email,
      topic: topic || 'استفسار عام للمنصة',
      initialMessage: message,
    });

    setActiveSessionId(newSess.id);
    localStorage.setItem('galaxy_active_support_session_id', newSess.id);
    setSession(newSess);
    setMessage('');
    toast.success('تم إرسال استفسارك للإدارة وسنوافيك بالرد قريباً!');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSessionId || !session) return;

    liveSupportService.sendMessage(activeSessionId, replyText, 'user', session.userName);
    setReplyText('');
  };

  const handleCloseSessionView = () => {
    setActiveSessionId(null);
    localStorage.removeItem('galaxy_active_support_session_id');
    setSession(null);
  };

  return (
    <div className="fixed bottom-6 start-6 z-40 select-none font-sans" dir="rtl">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-500 via-emerald-600 to-cyan-600 text-white shadow-xl shadow-teal-500/25 border border-teal-300/40 backdrop-blur-xl"
          title="تواصل مع إدارة المنصة مباشرة"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-200 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="text-xs font-bold hidden sm:inline">تواصل مع الإدارة</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono">24/7</span>
        </motion.button>
      )}

      {/* Expanded Support Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[330px] sm:w-[380px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col max-h-[560px]"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-teal-600 to-cyan-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                  <ShieldCheck className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h4 className="text-sm font-black">مركز التواصل مع الإدارة</h4>
                  <p className="text-[11px] text-teal-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    فريق دعم ذروة العلم متاح للإجابة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content Body: Either active chat or new inquiry form */}
            {session ? (
              <div className="flex-1 flex flex-col p-4 overflow-hidden bg-slate-50 dark:bg-slate-900/60">
                {/* Session Meta */}
                <div className="p-2.5 mb-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{session.topic}</span>
                    <div className="text-[10px] text-slate-500">جلسة رقم: {session.id.slice(-6)}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      session.status === 'resolved' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}>
                      {session.status === 'resolved' ? 'مكتملة ✓' : 'قيد المتابعة'}
                    </span>
                    <button
                      onClick={handleCloseSessionView}
                      className="text-[10px] text-rose-500 hover:underline p-1"
                      title="فتح استفسار جديد"
                    >
                      إنهاء
                    </button>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[300px]">
                  {session.messages.map((msg) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-teal-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                          }`}
                        >
                          <div className="text-[10px] font-bold opacity-75 mb-0.5">
                            {msg.senderName}
                          </div>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب ردك أو استفسارك..."
                    className="h-9 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                  <Button type="submit" size="sm" className="h-9 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleStartSession} className="p-4 space-y-3 flex-1 overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">الاسم الكريم:</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك أو لقبك..."
                      className="pr-9 text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">البريد الإلكتروني (اختياري للرد):</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="pr-9 text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">موضوع الاستفسار:</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="مثال: اقتراح تجربة جديدة، سؤال عن مادة..."
                    className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">رسالتك للإدارة:</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب كل ما تحتاج بتفصيل..."
                    className="text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 min-h-[80px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  <Send className="w-3.5 h-3.5 ml-1.5" />
                  إرسال الرسالة إلى لوحة الإدارة
                </Button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
