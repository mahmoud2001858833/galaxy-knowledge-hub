import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, MessageSquareWarning, Send, Lock, Loader2, ShieldCheck,
  Trash2, RefreshCcw, Tag, Mail, User, FileText, AlertCircle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useArabicSpeech } from "@/hooks/useArabicSpeech";
import { MicButton } from "@/components/MicButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATUSES = [
  { value: "new", label: "جديد", color: "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30" },
  { value: "in_progress", label: "قيد المعالجة", color: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30" },
  { value: "resolved", label: "تم الحل", color: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30" },
  { value: "rejected", label: "مرفوض", color: "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30" },
];

const CATEGORIES = [
  "تقني/خطأ في المنصة",
  "محتوى تعليمي",
  "اقتراح تحسين",
  "حساب/تسجيل دخول",
  "أخرى",
];

const complaintSchema = z.object({
  name: z.string().trim().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  email: z.string().trim().email("بريد غير صالح").max(255).optional().or(z.literal("")),
  title: z.string().trim().min(3, "العنوان قصير جداً").max(150),
  description: z.string().trim().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل").max(2000),
});

const Complaints = () => {
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#060818] text-slate-900 dark:text-white relative overflow-hidden font-sans transition-colors duration-300">
      <Helmet>
        <title>الشكاوى والاقتراحات | منصة ذروة العلم 2.0</title>
        <meta name="description" content="أرسل شكواك أو اقتراحك وسيتم النظر فيه من قِبَل فريق الإدارة بمدرسة عنبه الثانوية الشاملة للبنين" />
      </Helmet>

      <Navbar />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-rose-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 relative z-10 max-w-4xl">
        {/* Institutional Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <MessageSquareWarning className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                  بوابة التواصل المباشر • مدرسة عنبه الثانوية
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                منظومة الشكاوى والمقترحات التطويرية
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                صوتك يصل مباشرة إلى إدارة المنصة والهيئة الإشرافية لتحسين التجربة التعليمية
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setAdminOpen(true)}
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 gap-2 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shrink-0"
          >
            <Lock className="w-3.5 h-3.5" /> لوحة الإدارة
          </Button>
        </div>

        <ComplaintForm />
      </main>

      <Footer />
      <AdminDialog open={adminOpen} onOpenChange={setAdminOpen} />
    </div>
  );
};

/* ============================== USER FORM ============================== */
const ComplaintForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [activeField, setActiveField] = useState<"name" | "title" | "description" | null>(null);
  const baseRef = useRef({ name: "", title: "", description: "" });

  const handleSpeech = (text: string, isFinal: boolean) => {
    if (!activeField) return;
    if (isFinal) {
      const next = (baseRef.current[activeField] + text).trimStart();
      baseRef.current[activeField] = next;
      if (activeField === "name") setName(next);
      else if (activeField === "title") setTitle(next);
      else setDescription(next);
    } else {
      const preview = (baseRef.current[activeField] + " " + text).trimStart();
      if (activeField === "name") setName(preview);
      else if (activeField === "title") setTitle(preview);
      else setDescription(preview);
    }
  };

  const speech = useArabicSpeech(handleSpeech);

  const startDictation = (field: "name" | "title" | "description", current: string) => {
    if (speech.listening && activeField === field) {
      speech.stop();
      setActiveField(null);
      return;
    }
    if (speech.listening) speech.stop();
    baseRef.current[field] = current ? current + " " : "";
    setActiveField(field);
    setTimeout(() => speech.start(), 100);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = complaintSchema.safeParse({ name, email, title, description });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "بيانات غير صحيحة");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("platform_complaints").insert({
        name: parsed.data.name,
        email: parsed.data.email || null,
        title: parsed.data.title,
        description: parsed.data.description,
        category,
      });
      if (error) throw error;
      setSubmitted(true);
      setName(""); setEmail(""); setTitle(""); setDescription("");
      toast.success("تم إرسال شكواك بنجاح ✨");
    } catch (e: any) {
      toast.error(e.message || "فشل الإرسال");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-10 sm:p-12 shadow-lg"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/25">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">تم استلام رسالتك بنجاح</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          سيتم مراجعتها من قِبَل فريق الإدارة واللجنة الفنية في أقرب وقت ممكن.
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl px-6"
        >
          إرسال ملاحظة أو اقتراح آخر
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">نموذج تقديم الملاحظة أو المقترح</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">يمكنك الكتابة أو التحدث صوتياً باللغة العربية مباشرة</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> الاسم الكامل
            </label>
            <div className="relative">
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); baseRef.current.name = e.target.value; }}
                placeholder="اسمك الثلاثي"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-12 rounded-xl h-11"
                required
              />
              {speech.supported && (
                <MicButton
                  listening={speech.listening && activeField === "name"}
                  onClick={() => startDictation("name", name)}
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" /> البريد الإلكتروني <span className="text-slate-400 font-normal">(اختياري)</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl h-11"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" /> تصنيف الطلب
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" /> عنوان مختصر
            </label>
            <div className="relative">
              <Input
                value={title}
                onChange={(e) => { setTitle(e.target.value); baseRef.current.title = e.target.value; }}
                placeholder="موضوع الملاحظة أو المقترح"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-12 rounded-xl h-11"
                required
                maxLength={150}
              />
              {speech.supported && (
                <MicButton
                  listening={speech.listening && activeField === "title"}
                  onClick={() => startDictation("title", title)}
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> التفاصيل الكاملة
          </label>
          <div className="relative">
            <Textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); baseRef.current.description = e.target.value; }}
              placeholder="اشرح المشكلة أو فكرة التحسين بالتفصيل... (يمكنك الضغط على الميكروفون للتحدث بالعربية)"
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white min-h-[140px] resize-none pl-12 rounded-2xl"
              required
              maxLength={2000}
            />
            {speech.supported && (
              <MicButton
                listening={speech.listening && activeField === "description"}
                onClick={() => startDictation("description", description)}
                className="!top-3 !-translate-y-0"
              />
            )}
          </div>
          <div className="text-[11px] text-slate-400 text-left mt-1 font-mono">{description.length}/2000</div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-bold shadow-md shadow-blue-600/20 h-12 rounded-xl"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="mr-2">{submitting ? "جارٍ الإرسال..." : "إرسال الطلب رسمياً"}</span>
        </Button>
      </div>
    </motion.form>
  );
};

/* ============================== ADMIN DIALOG ============================== */
const AdminDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchComplaints = async (pwd: string) => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints-admin`;
      const resp = await fetch(url, {
        method: "GET",
        headers: { "x-admin-password": pwd },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "فشل الاتصال");
      setComplaints(data.complaints || []);
      setAuthenticated(true);
    } catch (e: any) {
      toast.error(e.message);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const tryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    await fetchComplaints(password);
  };

  const updateComplaint = async (id: string, updates: any) => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints-admin`;
      const resp = await fetch(url, {
        method: "PATCH",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!resp.ok) throw new Error("فشل التحديث");
      toast.success("تم التحديث");
      await fetchComplaints(password);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteComplaint = async (id: string) => {
    if (!confirm("حذف الشكوى نهائياً؟")) return;
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints-admin`;
      const resp = await fetch(url, {
        method: "DELETE",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!resp.ok) throw new Error("فشل الحذف");
      toast.success("تم الحذف");
      await fetchComplaints(password);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    if (!open) {
      setAuthenticated(false);
      setPassword("");
      setComplaints([]);
    }
  }, [open]);

  const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <ShieldCheck className="w-6 h-6 text-blue-600" /> لوحة إدارة الشكاوى والمقترحات
          </DialogTitle>
        </DialogHeader>

        {!authenticated ? (
          <form onSubmit={tryLogin} className="py-8 max-w-sm mx-auto space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-3 shadow-md">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">أدخل كلمة مرور المشرف للمتابعة</p>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة السر"
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center rounded-xl h-11"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl h-11"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "دخول"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    filter === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  الكل ({complaints.length})
                </button>
                {STATUSES.map((s) => {
                  const count = complaints.filter((c) => c.status === s.value).length;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setFilter(s.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        filter === s.value ? s.color : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {s.label} ({count})
                    </button>
                  );
                })}
              </div>
              <Button size="sm" variant="outline" onClick={() => fetchComplaints(password)} className="rounded-xl text-xs font-bold">
                <RefreshCcw className="w-3.5 h-3.5 ml-1" /> تحديث
              </Button>
            </div>

            <AnimatePresence>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <MessageSquareWarning className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  لا توجد شكاوى في هذا التصنيف
                </div>
              ) : (
                filtered.map((c) => {
                  const status = STATUSES.find((s) => s.value === c.status) || STATUSES[0];
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white">{c.title}</h3>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                            <span>👤 {c.name}</span>
                            {c.email && <span>✉️ {c.email}</span>}
                            <span>🏷️ {c.category || "بدون تصنيف"}</span>
                            <span>📅 {new Date(c.created_at).toLocaleString("ar-EG")}</span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl p-3">
                        {c.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">الحالة:</span>
                        {STATUSES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => updateComplaint(c.id, { status: s.value })}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${
                              c.status === s.value ? s.color : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteComplaint(c.id)}
                          className="ms-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Complaints;
