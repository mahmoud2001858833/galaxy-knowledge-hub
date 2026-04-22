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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useArabicSpeech } from "@/hooks/useArabicSpeech";
import { MicButton } from "@/components/MicButton";

const STATUSES = [
  { value: "new", label: "جديد", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  { value: "in_progress", label: "قيد المعالجة", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { value: "resolved", label: "تم الحل", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { value: "rejected", label: "مرفوض", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
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
    <div dir="rtl" className="min-h-screen bg-[#05060f] text-white relative overflow-hidden">
      <Helmet>
        <title>الشكاوى والاقتراحات</title>
        <meta name="description" content="أرسل شكواك أو اقتراحك وسيتم النظر فيه من قِبَل فريق الإدارة" />
      </Helmet>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[120px]" />
      </div>

      <header className="border-b border-white/5 backdrop-blur-xl bg-black/30 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white/70 hover:text-white hover:bg-white/5 gap-2">
            <ArrowLeft className="w-4 h-4" /> الرئيسية
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/40">
              <MessageSquareWarning className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-l from-rose-400 to-amber-400 bg-clip-text text-transparent">
                الشكاوى والاقتراحات
              </h1>
              <p className="text-xs text-white/50">صوتك يصلنا</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setAdminOpen(true)}
            className="bg-white/5 border-white/10 hover:bg-white/10 gap-2 text-white/80"
          >
            <Lock className="w-4 h-4" /> لوحة الأدمن
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <ComplaintForm />
      </main>

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

  // Speech-to-text — separate base values to support interim text without losing typed content
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20 rounded-3xl p-12 backdrop-blur-xl"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-3">تم استلام شكواك</h2>
        <p className="text-white/70 mb-6">سيتم مراجعتها من قِبَل فريق الإدارة في أقرب وقت ممكن</p>
        <Button
          onClick={() => setSubmitted(false)}
          className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
        >
          إرسال شكوى أخرى
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-8 shadow-2xl space-y-5">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold mb-2">شاركنا شكواك أو اقتراحك</h2>
          <p className="text-sm text-white/60">سنعمل على معالجتها بأسرع ما يمكن</p>
        </div>

        <div>
          <label className="text-xs text-white/60 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> الاسم
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك الكامل"
            className="bg-black/40 border-white/10 text-white"
            required
          />
        </div>

        <div>
          <label className="text-xs text-white/60 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> البريد الإلكتروني <span className="text-white/40">(اختياري)</span>
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="bg-black/40 border-white/10 text-white"
          />
        </div>

        <div>
          <label className="text-xs text-white/60 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> التصنيف
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-black/40 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0b18] border-white/10 text-white">
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-white/60 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> عنوان الشكوى
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان مختصر"
            className="bg-black/40 border-white/10 text-white"
            required
            maxLength={150}
          />
        </div>

        <div>
          <label className="text-xs text-white/60 mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> وصف الشكوى
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اشرح المشكلة أو الاقتراح بالتفصيل..."
            className="bg-black/40 border-white/10 text-white min-h-[140px] resize-none"
            required
            maxLength={2000}
          />
          <div className="text-xs text-white/40 text-left mt-1">{description.length}/2000</div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-lg shadow-rose-500/30 h-12"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="mr-2">{submitting ? "جارٍ الإرسال..." : "إرسال الشكوى"}</span>
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
      <DialogContent dir="rtl" className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0a0b18] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="w-6 h-6 text-rose-400" /> لوحة إدارة الشكاوى
          </DialogTitle>
        </DialogHeader>

        {!authenticated ? (
          <form onSubmit={tryLogin} className="py-8 max-w-sm mx-auto space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center mb-3">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm text-white/70">أدخل كلمة سر الأدمن للمتابعة</p>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة السر"
              className="bg-black/40 border-white/10 text-white text-center"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "دخول"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                    filter === "all" ? "bg-white/15 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10"
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
                      className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                        filter === s.value ? s.color : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {s.label} ({count})
                    </button>
                  );
                })}
              </div>
              <Button size="sm" variant="ghost" onClick={() => fetchComplaints(password)} className="text-white/70">
                <RefreshCcw className="w-4 h-4 ml-1" /> تحديث
              </Button>
            </div>

            <AnimatePresence>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-white/40">
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
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white">{c.title}</h3>
                          <div className="text-xs text-white/50 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                            <span>👤 {c.name}</span>
                            {c.email && <span>✉️ {c.email}</span>}
                            <span>🏷️ {c.category || "بدون تصنيف"}</span>
                            <span>📅 {new Date(c.created_at).toLocaleString("ar-EG")}</span>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-black/30 rounded-lg p-3">
                        {c.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                        <span className="text-xs text-white/50">الحالة:</span>
                        {STATUSES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => updateComplaint(c.id, { status: s.value })}
                            className={`text-xs px-2 py-1 rounded-md border transition ${
                              c.status === s.value ? s.color : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteComplaint(c.id)}
                          className="ms-auto text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
