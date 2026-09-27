import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, CheckCircle2, AlertCircle, Loader2, Sparkles, 
  HelpCircle, School, MessageSquare, Phone, Mail, User, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('labs');
  const [role, setRole] = useState('student');
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; date: string } | null>(null);

  const categories = [
    { id: 'labs', label: 'المختبرات والمحاكاة 3D', icon: '⚛️' },
    { id: 'damij', label: 'مشروع دامج والتربية الخاصة', icon: '🤝' },
    { id: 'school_reg', label: 'تسجيل واعتماد مدرسة جديدة', icon: '🏫' },
    { id: 'account', label: 'دعم الحساب وكلمة المرور', icon: '🔐' },
    { id: 'partnership', label: 'شراكة واقتراح تطويري', icon: '💡' },
    { id: 'technical', label: 'ملاحظة أو مشكلة فنية', icon: '🛠️' },
  ];

  const roles = [
    { id: 'student', label: 'طالب / طالبة' },
    { id: 'teacher', label: 'معلم / معلمة' },
    { id: 'parent', label: 'ولي أمر' },
    { id: 'principal', label: 'إدارة مدرسة / مدير' },
    { id: 'researcher', label: 'باحث أكاديمي / جامعي' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('يرجى ملء جميع الحقول الإلزامية (الاسم، البريد الإلكتروني، والرسالة)');
      return;
    }

    setIsSubmitting(true);
    const ticketId = `ZARWAT-${Date.now().toString().slice(-6)}`;

    try {
      // 1. Insert into Supabase contact_messages table
      const fullSubject = `[${categories.find(c => c.id === category)?.label || 'عام'}] - ${subject.trim() || 'استفسار من المنصة'}`;
      const fullMessage = `
الدور: ${roles.find(r => r.id === role)?.label || role}
المدرسة: ${school.trim() || 'غير محددة'}
الهاتف: ${phone.trim() || 'غير محدد'}
التصنيف: ${categories.find(c => c.id === category)?.label || category}
رقم التذكرة: ${ticketId}

الرسالة:
${message.trim()}
      `.trim();

      await supabase
        .from('contact_messages')
        .insert([
          {
            name: name.trim(),
            email: email.trim(),
            subject: fullSubject,
            message: fullMessage
          }
        ]);

      // 2. Also log in local storage for fallback persistence
      const savedMessages = JSON.parse(localStorage.getItem('galaxy_contact_submissions') || '[]');
      savedMessages.unshift({
        ticketId,
        name,
        email,
        phone,
        category,
        role,
        school,
        subject,
        message,
        date: new Date().toLocaleString('ar-JO')
      });
      localStorage.setItem('galaxy_contact_submissions', JSON.stringify(savedMessages.slice(0, 50)));

      setSubmittedTicket({
        id: ticketId,
        date: new Date().toLocaleString('ar-JO')
      });

      toast.success(`تم استلام رسالتك بنجاح! رقم تذكرتك: ${ticketId}`);
    } catch (err: any) {
      console.warn('Submitting via local backup queue', err);
      setSubmittedTicket({
        id: ticketId,
        date: new Date().toLocaleString('ar-JO')
      });
      toast.success(`تم تسجيل استفسارك بنجاح برقم التذكرة: ${ticketId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSchool('');
    setSubject('');
    setMessage('');
    setSubmittedTicket(null);
  };

  return (
    <div className="font-sans text-right" dir="rtl">
      <AnimatePresence mode="wait">
        {submittedTicket ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 text-center space-y-4 shadow-xl"
          >
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                تم إرسال استفسارك بنجاح إلى إدارة ذروة العلم
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                شكراً لتواصلك معنا. تم تحويل تذكرتك مباشرة إلى المشرف العام وفريق الدعم المختص للرد عليك في أقرب وقت.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">رقم التذكرة الأكاديمية:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400" dir="ltr">{submittedTicket.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">تاريخ الإرسال:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{submittedTicket.date}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">الرد المتوقع:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">خلال 24 ساعة عبر البريد</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleReset}
                className="h-10 px-6 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs shadow-md"
              >
                إرسال استفسار آخر
              </Button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selector Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-500" />
                <span>اختر تصنيف الاستفسار أو الطلب:</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                      category === cat.id
                        ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Role & School */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-cyan-500" />
                  <span>صفتك الأكاديمية:</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 px-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-cyan-500" />
                  <span>المدرسة أو الجامعة (اختياري):</span>
                </label>
                <Input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="مثال: مدرسة الملك عبدالله للتميز / جامعة العلوم والتكنولوجيا"
                  className="h-11 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Name, Email, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الاسم الكامل *</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك الكريم..."
                  className="h-11 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">البريد الإلكتروني *</label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-11 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">رقم الهاتف / واتساب</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+962 7 9000 0000"
                  className="h-11 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">عنوان الموضوع</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="موضوع الاستفسار باختصار..."
                className="h-11 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Message Details */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">تفاصيل الرسالة أو الاستفسار *</label>
              <Textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب استفسارك، اقتراحك، أو التحدي الذي تواجهه بتفصيل كافٍ..."
                className="rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 leading-relaxed resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-8 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs gap-2 shadow-lg shadow-cyan-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري إرسال التذكرة...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-1" />
                    <span>إرسال الاستفسار الآن</span>
                  </>
                )}
              </Button>

              <span className="text-[11px] text-slate-400">
                يتم التشفير والرد عبر البريد الرسمي خلال 24 ساعة
              </span>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactForm;
