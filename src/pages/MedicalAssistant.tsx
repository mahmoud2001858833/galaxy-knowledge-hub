import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Search, Phone, AlertTriangle, Loader2, Sparkles,
  Activity, ShieldAlert, ShieldCheck, Stethoscope, X, Mic, MicOff,
  HeartPulse, Zap, ChevronRight, Cpu, ScanLine, Camera, CameraOff,
  Volume2, VolumeX, AlertOctagon, GraduationCap, Clock, CheckCircle2,
  Siren, Upload, Eye, RefreshCw, BookOpen, Info, BellRing, PhoneCall,
  Check, Thermometer, Droplet, UserCheck, AlertCircle, FileText,
  Printer, Scale, GlassWater, Award, Heart, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  medicalConditions,
  MedicalCondition,
  ALL_CONDITIONS_CATEGORIES,
  TRIAGE_SYMPTOMS,
  TriageSymptom,
  VITAL_SIGNS_BY_AGE,
  AgeGroupKey
} from "@/data/schoolMedicalData";

export const MedicalAssistant: React.FC = () => {
  const navigate = useNavigate();

  // Navigation Tabs: 'protocols' | 'triage' | 'calculator' | 'health-card' | 'camera'
  const [activeTab, setActiveTab] = useState<'protocols' | 'triage' | 'calculator' | 'health-card' | 'camera'>('protocols');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<MedicalCondition | null>(null);

  // Audio Speech Synthesis
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info("المتصفح لا يدعم القراءة الصوتية");
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // SOS Emergency Dialog
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [sosStopwatch, setSosStopwatch] = useState(0);
  const [sosTimerRunning, setSosTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (sosTimerRunning) {
      interval = setInterval(() => setSosStopwatch(s => s + 1), 1000);
    } else {
      setSosStopwatch(0);
    }
    return () => clearInterval(interval);
  }, [sosTimerRunning]);

  // Clinical Triage Selected Symptoms
  const [selectedTriageSymptoms, setSelectedTriageSymptoms] = useState<string[]>([]);
  const toggleTriageSymptom = (id: string) => {
    setSelectedTriageSymptoms(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const triageResult = useMemo(() => {
    if (selectedTriageSymptoms.length === 0) return null;
    const selected = TRIAGE_SYMPTOMS.filter(s => selectedTriageSymptoms.includes(s.id));
    const hasCritical = selected.some(s => s.severity === 'critical');
    const hasUrgent = selected.some(s => s.severity === 'urgent');

    if (hasCritical) {
      return {
        level: 'critical' as const,
        title: 'كود أحمر 🔴 - طوارئ مدرسية حرجة تستدعي الإسعاف فوراً',
        desc: 'خطر داهم يهدد مجرى التنفس أو الدماغ أو الدورة الدموية! اتصل بالدفاع المدني والإسعاف 911 فوراً واطلب المشرف الصحي.',
        badgeBg: 'bg-rose-500 text-white',
        cardBg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200',
        actions: selected.map(s => s.quickAction)
      };
    } else if (hasUrgent) {
      return {
        level: 'urgent' as const,
        title: 'كود أصفر 🟡 - طارئ مدرسي متوسط يستدعي مراجعة العيادة المدرسية',
        desc: 'حالة تتطلب تدخلاً سريعاً في عيادة المدرسة لتقديم العلاج المناسب والتواصل مع ولي الأمر.',
        badgeBg: 'bg-amber-500 text-white',
        cardBg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200',
        actions: selected.map(s => s.quickAction)
      };
    } else {
      return {
        level: 'routine' as const,
        title: 'كود أخضر 🟢 - إجراء فصلي روتيني بسيط',
        desc: 'الحالة مستقرة ويمكن تقديم الإسعاف الأولي البسيط في الفصل والاطمئنان على راحة الطالب.',
        badgeBg: 'bg-emerald-600 text-white',
        cardBg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200',
        actions: selected.map(s => s.quickAction)
      };
    }
  }, [selectedTriageSymptoms]);

  // Student Health Calculator State
  const [bmiWeight, setBmiWeight] = useState<string>("45");
  const [bmiHeight, setBmiHeight] = useState<string>("150");
  const [studentAge, setStudentAge] = useState<string>("14");
  const [selectedVitalsAge, setSelectedVitalsAge] = useState<AgeGroupKey>('elementary');

  const bmiResult = useMemo(() => {
    const w = parseFloat(bmiWeight);
    const h = parseFloat(bmiHeight) / 100;
    if (!w || !h || h <= 0) return null;
    const bmi = +(w / (h * h)).toFixed(1);

    let status = 'وزن صحي ومثالي';
    let color = 'text-emerald-600 dark:text-emerald-400';
    let tip = 'ممتاز! استمر في تناول وجبات الإفطار المدرسية المتوازنة وممارسة الرياضة بانتظام.';
    if (bmi < 18.5) {
      status = 'نحافة دون المعدل الطبيعي';
      color = 'text-amber-600 dark:text-amber-400';
      tip = 'يُنصح بالتركيز على الوجبات المغذية الغنية بالبروتين والفيتامينات والحديد في المقصف والمنزل.';
    } else if (bmi >= 25 && bmi < 30) {
      status = 'زيادة طفيفة في الوزن';
      color = 'text-orange-600 dark:text-orange-400';
      tip = 'يُنصح بزيادة النشاط البدني في حصة الرياضة والتقليل من المشروبات الغازية والحلويات السكرية.';
    } else if (bmi >= 30) {
      status = 'سمنة تتطلب متابعة غذائية';
      color = 'text-rose-600 dark:text-rose-400';
      tip = 'يُفضل مراجعة أخصائي التغذية لتنظيم وجبات غذائية صحية تدعم نشاطك الدراسي وصحتك.';
    }

    // Daily Water Intake estimation (35ml per kg)
    const waterLiters = +(w * 0.035).toFixed(1);
    const waterCups = Math.round(waterLiters * 4);

    return { bmi, status, color, tip, waterLiters, waterCups };
  }, [bmiWeight, bmiHeight]);

  // Student Emergency Health Card State
  const [cardData, setCardData] = useState({
    name: 'أحمد خليل الرواشدة',
    school: 'مدرسة عنبه الثانوية الشاملة للبنين',
    grade: 'الصف العاشر - أ',
    bloodType: 'O+',
    allergies: 'حساسية من الفول السوداني (Peanuts)',
    chronicConditions: 'ربو شعبي خفيف (مع بخاخ فنتولين)',
    guardianName: 'خليل الرواشدة (الأب)',
    guardianPhone: '0791234567'
  });

  // Filtered Conditions
  const filteredConditions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return medicalConditions.filter(c => {
      const matchCategory = selectedCategory === "all" || c.category === selectedCategory;
      const matchSearch = !q || 
        c.name.toLowerCase().includes(q) ||
        c.symptoms.some(s => s.toLowerCase().includes(q)) ||
        c.studentActions.some(a => a.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300 font-sans">
      <Helmet>
        <title>المساعد الطبي المدرسي والعيادة الصحية الرقمية | ذروة العلم</title>
        <meta name="description" content="المنظومة الرسمية للطب المدرسي والإسعافات الأولية للطلاب والمعلمين مع الفرز السريري الذكي وبطاقة الطوارئ" />
      </Helmet>

      {/* 1. Official School Health Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & School Clinic Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    العيادة الصحية والطب المدرسي الرقمي
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                    معتمد مدرسياً
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  دليل الإسعافات للطلاب والمعلمين &bull; وزارة التربية والتعليم
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="md:hidden text-xs rounded-xl"
            >
              الرئيسية <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            </Button>
          </div>

          {/* Emergency Hotline Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button
              onClick={() => {
                setIsSOSModalOpen(true);
                setSosTimerRunning(true);
              }}
              className="h-10 px-4 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md shadow-rose-600/20 gap-2 animate-pulse"
            >
              <Siren className="w-4 h-4 text-white" />
              <span>خط طوارئ الإسعاف (911)</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="hidden md:flex rounded-xl text-xs h-10 gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>الرئيسية</span>
            </Button>
          </div>

        </div>
      </header>

      {/* 2. Main Body Container */}
      <main className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl">

        {/* Official School Clinic Notice & Quick SOS Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-rose-200 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-black text-rose-900 dark:text-rose-300">
                🚨 هل تواجه حالة طارئة لأحد زملائك أو طلابك الآن؟
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                انقر على الحالة مباشرة لمعرفة: <strong>ما يجب على الطالب فعله في أول دقيقة</strong>، بروتوكول المعلم، وقائمة الأخطاء القاتلة لتفاديها فوراً.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            <Button
              onClick={() => {
                setIsSOSModalOpen(true);
                setSosTimerRunning(true);
              }}
              size="sm"
              className="flex-1 md:flex-initial h-9 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>دليل الثواني الأولى</span>
            </Button>
          </div>
        </div>

        {/* 3. Student & Teacher Segmented Navigation Tabs */}
        <div className="flex justify-center">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-center gap-1 max-w-4xl w-full">
            {[
              { id: 'protocols', label: 'دليل الإسعافات للطلاب', icon: BookOpen },
              { id: 'triage', label: 'الفاحص الذكي للأعراض', icon: Activity },
              { id: 'calculator', label: 'حاسبة اللياقة والمؤشرات', icon: Scale },
              { id: 'health-card', label: 'بطاقة الطالب الصحية', icon: FileText },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= TAB 1: PROTOCOLS DIRECTORY ================= */}
        {activeTab === 'protocols' && (
          <div className="space-y-6">
            
            {/* Search & Categories */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="relative max-w-xl mx-auto">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن حالة أو عارض (مثال: صرع، هبوط سكر، اختناق، رعاف، كسر، حرق، ربو)..."
                  className="pr-10 text-xs sm:text-sm h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                {ALL_CONDITIONS_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'all' ? 'كافة الحالات (20)' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditions Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConditions.map(condition => {
                const isCritical = condition.emergencyLevel === 'حرج جداً';
                const isUrgent = condition.emergencyLevel === 'طارئ';
                
                return (
                  <motion.div
                    key={condition.id}
                    layout
                    whileHover={{ y: -3 }}
                    onClick={() => setSelectedCondition(condition)}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            {condition.icon}
                          </span>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                              {condition.name}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {condition.category}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
                          isCritical
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : isUrgent
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {condition.emergencyLevel}
                        </span>
                      </div>

                      {/* Golden Time Tag */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span><strong>الوقت الذهبي:</strong> {condition.goldenTime}</span>
                      </div>

                      {/* Symptoms preview */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {condition.symptoms.join(' • ')}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                      <span>عرض الإجراء الفوري للطالب</span>
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: SMART SYMPTOM TRIAGE ================= */}
        {activeTab === 'triage' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 mb-1">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                الفاحص الذكي لأعراض الطلاب والفرز السريري
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                حدد الأعراض التي يشعر بها الطالب للحصول على تقييم فوري لمستوى الخطورة والإجراء الصحي السليم
              </p>
            </div>

            {/* Symptom Selection Chips */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                اختر جميع الأعراض الظاهرة على الطالب:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {TRIAGE_SYMPTOMS.map(symptom => {
                  const isSelected = selectedTriageSymptoms.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => toggleTriageSymptom(symptom.id)}
                      className={`p-3 rounded-2xl text-xs text-right font-medium transition-all flex items-start gap-2.5 border ${
                        isSelected
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center border ${
                        isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="leading-snug">{symptom.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Triage Assessment Card */}
            {triageResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl border-2 space-y-4 ${triageResult.cardBg}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${triageResult.badgeBg}`}>
                      {triageResult.level === 'critical' ? '🔴 طوارئ قصوى 911' : triageResult.level === 'urgent' ? '🟡 عيادة المدرسة' : '🟢 روتيني فصلي'}
                    </span>
                    <h4 className="text-base font-black">{triageResult.title}</h4>
                  </div>

                  <Button
                    onClick={() => {
                      setIsSOSModalOpen(true);
                      setSosTimerRunning(true);
                    }}
                    size="sm"
                    className="rounded-xl text-xs font-black bg-rose-600 text-white gap-1.5"
                  >
                    <Siren className="w-3.5 h-3.5" />
                    <span>الاتصال بـ 911 فوراً</span>
                  </Button>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed">{triageResult.desc}</p>

                {/* Immediate Action Checklist */}
                <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                  <span className="text-xs font-bold block">خطوات الإسعاف الفورية الواجب اتخاذها:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {triageResult.actions.map((act, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 text-xs space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> إجراء رقم {i + 1}
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">{act}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTriageSymptoms.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p>اختر عارضاً واحداً أو أكثر من القائمة أعلاه لتوليد التقييم السريري الفوري.</p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: STUDENT VITALS & BMI CALCULATOR ================= */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* BMI & Water Calculator */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      حاسبة مؤشر كتلة الجسم (BMI) واحتياج الماء للطلاب
                    </h3>
                    <p className="text-xs text-slate-500">حساب اللياقة والنمو الصحي لطلاب المدارس (6 - 18 سنة)</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الوزن (كغم):</label>
                    <Input
                      type="number"
                      value={bmiWeight}
                      onChange={(e) => setBmiWeight(e.target.value)}
                      className="text-center font-mono text-sm h-10 rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الطول (سم):</label>
                    <Input
                      type="number"
                      value={bmiHeight}
                      onChange={(e) => setBmiHeight(e.target.value)}
                      className="text-center font-mono text-sm h-10 rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">العمر (سنة):</label>
                    <Input
                      type="number"
                      value={studentAge}
                      onChange={(e) => setStudentAge(e.target.value)}
                      className="text-center font-mono text-sm h-10 rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                {bmiResult && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">مؤشر كتلة الجسم (BMI):</span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                          {bmiResult.bmi}
                        </div>
                      </div>
                      <span className={`text-xs font-black px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border ${bmiResult.color}`}>
                        {bmiResult.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      💡 {bmiResult.tip}
                    </p>

                    <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <GlassWater className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        <span>الاحتياج اليومي للماء بالمدرسة:</span>
                      </div>
                      <strong className="font-mono text-cyan-700 dark:text-cyan-300 text-sm">
                        {bmiResult.waterLiters} لتر (~{bmiResult.waterCups} أكواب)
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Normal Vital Signs Reference Table */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        دليل العلامات الحيوية الطبيعية للطلاب
                      </h3>
                      <p className="text-xs text-slate-500">معايير وزارة الصحة للنبض والتنفس والحرارة</p>
                    </div>
                  </div>

                  <select
                    value={selectedVitalsAge}
                    onChange={(e) => setSelectedVitalsAge(e.target.value as AgeGroupKey)}
                    className="text-xs font-bold h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="early">رياض الأطفال (4 - 6 سنوات)</option>
                    <option value="elementary">الابتدائي (7 - 11 سنة)</option>
                    <option value="adolescent">المتوسط والثانوي (12 - 18 سنة)</option>
                  </select>
                </div>

                {VITAL_SIGNS_BY_AGE[selectedVitalsAge] && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-0.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" /> النبض الطبيعي:
                        </span>
                        <strong className="text-slate-900 dark:text-white font-mono">
                          {VITAL_SIGNS_BY_AGE[selectedVitalsAge].heartRate}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-0.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-cyan-500" /> معدل التنفس:
                        </span>
                        <strong className="text-slate-900 dark:text-white font-mono">
                          {VITAL_SIGNS_BY_AGE[selectedVitalsAge].respiratoryRate}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-0.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-amber-500" /> درجة الحرارة الطبيعية:
                        </span>
                        <strong className="text-slate-900 dark:text-white font-mono">
                          {VITAL_SIGNS_BY_AGE[selectedVitalsAge].temperature}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-0.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-purple-500" /> ضغط الدم المعتاد:
                        </span>
                        <strong className="text-slate-900 dark:text-white font-mono">
                          {VITAL_SIGNS_BY_AGE[selectedVitalsAge].bloodPressure}
                        </strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border">
                      📌 <strong>ملاحظة للمشرف والمعلم:</strong> {VITAL_SIGNS_BY_AGE[selectedVitalsAge].notes}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 4: OFFICIAL STUDENT EMERGENCY HEALTH CARD ================= */}
        {activeTab === 'health-card' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-1">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                بطاقة الطالب الصحية المدرسية للطوارئ (Digital Health ID)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                قم بتعبئة بياناتك الصحية لإنشاء بطاقة طوارئ رسمية قابلة للحفظ والطباعة لحمايتك في المدرسة والرحلات
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Form Input Side */}
              <div className="space-y-3.5 p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  بيانات الطالب الأساسية والصحية:
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">اسم الطالب الرباعي:</label>
                    <Input
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      className="text-xs h-9 rounded-xl bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">الصف والشعبة:</label>
                    <Input
                      value={cardData.grade}
                      onChange={(e) => setCardData({ ...cardData, grade: e.target.value })}
                      className="text-xs h-9 rounded-xl bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">فصيلة الدم:</label>
                    <select
                      value={cardData.bloodType}
                      onChange={(e) => setCardData({ ...cardData, bloodType: e.target.value })}
                      className="w-full text-xs font-bold h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+ (معطي عام)</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+ (مستقبل عام)</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">هاتف ولي الأمر للطوارئ:</label>
                    <Input
                      value={cardData.guardianPhone}
                      onChange={(e) => setCardData({ ...cardData, guardianPhone: e.target.value })}
                      className="text-xs h-9 rounded-xl font-mono bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">الحساسيات (أطعمة، أدوية، لسعات):</label>
                  <Input
                    value={cardData.allergies}
                    onChange={(e) => setCardData({ ...cardData, allergies: e.target.value })}
                    className="text-xs h-9 rounded-xl bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">الأمراض المزمنة وأدوية الطوارئ:</label>
                  <Input
                    value={cardData.chronicConditions}
                    onChange={(e) => setCardData({ ...cardData, chronicConditions: e.target.value })}
                    className="text-xs h-9 rounded-xl bg-white dark:bg-slate-900"
                  />
                </div>

                <Button
                  onClick={() => {
                    window.print();
                    toast.success('تم إرسال بطاقة الطالب الصحية إلى الطباعة');
                  }}
                  className="w-full h-10 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white gap-2 mt-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة بطاقة الطالب الصحية (A4 / ID)</span>
                </Button>
              </div>

              {/* Live Preview Side (Official Clean Card) */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-rose-50/20 to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-2 border-rose-300 dark:border-rose-900/60 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-rose-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-rose-900 dark:text-rose-300">
                        بطاقة الطوارئ الصحية المدرسية
                      </h4>
                      <p className="text-[9px] text-slate-400">وزارة التربية والتعليم &bull; عيادة المدرسة</p>
                    </div>
                  </div>

                  <span className="text-sm font-black px-3 py-1 rounded-xl bg-rose-600 text-white font-mono">
                    {cardData.bloodType}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">اسم الطالب:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{cardData.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الصف والمدرسة:</span>
                    <span className="text-slate-700 dark:text-slate-300">{cardData.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الحساسية المعروفة:</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">{cardData.allergies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الحالة المزمنة:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{cardData.chronicConditions}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400">هاتف ولي الأمر:</span>
                    <strong className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">{cardData.guardianPhone}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[10px] text-rose-800 dark:text-rose-300 text-center font-bold border border-rose-200 dark:border-rose-900/40">
                  📞 في حالات الخطر القصوى، اتصل بالإسعاف والدفاع المدني 911 فوراً
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 5. Detailed Emergency Protocol Dialog for Selected Condition */}
      <Dialog open={!!selectedCondition} onOpenChange={(open) => !open && setSelectedCondition(null)}>
        {selectedCondition && (
          <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5" dir="rtl">
            <DialogHeader className="text-right">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border">
                    {selectedCondition.icon}
                  </span>
                  <div>
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedCondition.name}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        selectedCondition.emergencyLevel === 'حرج جداً'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                      }`}>
                        {selectedCondition.emergencyLevel}
                      </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      {selectedCondition.category} &bull; الوقت الذهبي: <strong className="text-rose-600 dark:text-rose-400">{selectedCondition.goldenTime}</strong>
                    </DialogDescription>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else speakText(`بروتوكول إسعاف ${selectedCondition.name}. ${selectedCondition.firstAid.join('. ')}. تحذير: ${selectedCondition.warning}`);
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1.5 shrink-0"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-500" />}
                  <span>{isSpeaking ? 'إيقاف الصوت' : 'قراءة صوتية'}</span>
                </Button>
              </div>
            </DialogHeader>

            {/* Critical Warning Callout */}
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-300 space-y-1">
              <span className="font-black flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" /> تحذير طبي مشدد:
              </span>
              <p className="leading-relaxed font-bold">{selectedCondition.warning}</p>
            </div>

            {/* 3 Step Student Action (سهل الاستخدام للطلبة) */}
            <div className="space-y-2">
              <h5 className="text-xs font-black text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> ماذا تفعل أنت كطالب لمساعدة زميلك فوراً؟
              </h5>
              <div className="space-y-1.5">
                {selectedCondition.studentActions.map((act, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-xs flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white shrink-0 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Protocol */}
            <div className="space-y-2">
              <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> بروتوكول المعلم وإجراءات العيادة:
              </h5>
              <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1 pr-1">
                {selectedCondition.teacherProtocol.map((p, i) => (
                  <li key={i} className="leading-relaxed">{p}</li>
                ))}
              </ul>
            </div>

            {/* Fatal Mistakes Checklist */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5">
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> أخطاء شائعة تجنبها تماماً:
              </span>
              <ul className="list-disc list-inside text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5 pr-1">
                {selectedCondition.fatalMistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={() => {
                  setIsSOSModalOpen(true);
                  setSosTimerRunning(true);
                  setSelectedCondition(null);
                }}
                size="sm"
                className="rounded-xl text-xs font-bold bg-rose-600 text-white gap-1.5"
              >
                <Siren className="w-3.5 h-3.5" />
                <span>طلب الإسعاف 911</span>
              </Button>

              <Button
                onClick={() => setSelectedCondition(null)}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs px-6"
              >
                إغلاق
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* 6. Emergency 911 SOS Modal */}
      <Dialog open={isSOSModalOpen} onOpenChange={setIsSOSModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900 rounded-3xl p-6 space-y-5 text-center" dir="rtl">
          <div className="w-16 h-16 rounded-3xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-rose-600/30 animate-pulse">
            <Siren className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-xl font-black text-rose-600 dark:text-rose-400">
              خط الطوارئ المدرسي الموحد (911)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              الدفاع المدني والإسعاف الأردني &bull; زمن الاستجابة الفوري
            </DialogDescription>
          </div>

          {/* Stopwatch */}
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 font-mono text-2xl font-black text-rose-600">
            {Math.floor(sosStopwatch / 60).toString().padStart(2, '0')}:{(sosStopwatch % 60).toString().padStart(2, '0')}
            <span className="text-xs text-slate-500 block font-sans font-normal mt-0.5">زمن بدء البلاغ</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-right text-xs space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">ماذا تقول لمأمور الإسعاف 911؟</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              1. اسم المدرسة والموقع بدقة (مثلاً: مدرسة عنبه، مدخل الإدارة).<br />
              2. نوع الحالة (فاقد للوعي / تشنج / اختناق / كسر).<br />
              3. عمر الطالب، وهل يتنفس وينبض أم لا.<br />
              4. لا تغلق الخط حتى يأمرك مأمور الطوارئ بذلك!
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              className="flex-1 h-11 rounded-2xl text-sm font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30"
            >
              <a href="tel:911">
                <PhoneCall className="w-4 h-4 ml-2" />
                <span>اتصال فوري 911</span>
              </a>
            </Button>
            <Button
              onClick={() => {
                setIsSOSModalOpen(false);
                setSosTimerRunning(false);
              }}
              variant="outline"
              className="h-11 rounded-2xl text-xs px-5"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalAssistant;
