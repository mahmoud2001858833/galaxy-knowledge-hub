import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Upload, Image as ImageIcon, FileText, Loader2,
  AlertTriangle, CheckCircle2, ShieldAlert, Activity, Stethoscope,
  Sparkles, X, Download, Microscope, HeartPulse, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import jsPDF from 'jspdf';

interface CancerResult {
  risk_level: 'منخفض' | 'متوسط' | 'عالي' | 'غير محدد';
  risk_score: number;
  suspected_type: string;
  confidence: number;
  image_quality: string;
  key_findings: string[];
  matching_symptoms: string[];
  recommendations: string[];
  urgency: 'روتيني' | 'خلال أسابيع' | 'خلال أيام' | 'عاجل';
  next_steps: string[];
  disclaimer: string;
}

const RISK_STYLES: Record<string, { color: string; bg: string; ring: string; icon: React.ElementType; label: string }> = {
  'منخفض': { color: 'text-emerald-300', bg: 'bg-emerald-500/15', ring: 'ring-emerald-400/40', icon: CheckCircle2, label: 'خطر منخفض' },
  'متوسط': { color: 'text-amber-300', bg: 'bg-amber-500/15', ring: 'ring-amber-400/40', icon: Activity, label: 'خطر متوسط' },
  'عالي':  { color: 'text-red-300',   bg: 'bg-red-500/15',   ring: 'ring-red-400/50',   icon: AlertTriangle, label: 'خطر عالي' },
  'غير محدد': { color: 'text-slate-300', bg: 'bg-slate-500/15', ring: 'ring-slate-400/40', icon: ShieldAlert, label: 'غير محدد' },
};

const URGENCY_COLOR: Record<string, string> = {
  'روتيني': 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
  'خلال أسابيع': 'text-amber-300 bg-amber-500/15 border-amber-400/30',
  'خلال أيام': 'text-orange-300 bg-orange-500/15 border-orange-400/30',
  'عاجل': 'text-red-300 bg-red-500/15 border-red-400/40 animate-pulse',
};

const CancerDetection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CancerResult | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const handleImagePick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'ملف غير مدعوم', description: 'الرجاء رفع صورة فقط', variant: 'destructive' });
      return;
    }
    setImageFile(file);
    const r = new FileReader();
    r.onload = e => setImagePreview(e.target?.result as string);
    r.readAsDataURL(file);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const s = r.result as string;
        resolve(s.split(',')[1] || '');
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const runAnalysis = async () => {
    if (!imageFile && !symptoms.trim()) {
      toast({ title: 'مدخلات ناقصة', description: 'ارفع صورة أو اكتب الأعراض', variant: 'destructive' });
      return;
    }
    setAnalyzing(true);
    setStep(2);
    setResult(null);
    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        imageMimeType = imageFile.type;
      }
      const { data, error } = await supabase.functions.invoke('cancer-detection-ai', {
        body: {
          imageBase64, imageMimeType,
          symptoms: symptoms.trim(),
          patientAge: age, patientGender: gender,
        },
      });
      if (error) throw error;
      if (!data?.result) throw new Error('استجابة فارغة');
      setResult(data.result as CancerResult);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'تعذّر التحليل',
        description: err?.message || 'حاول لاحقاً',
        variant: 'destructive',
      });
      setStep(1);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImageFile(null); setImagePreview(null); setSymptoms('');
    setAge(''); setGender(''); setResult(null); setStep(1);
  };

  const downloadPDF = () => {
    if (!result) return;
    // Use jsPDF; Arabic glyphs may not be perfect with default fonts but content is preserved.
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    let y = 15;

    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageW, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('Cancer Screening Report - Educational', pageW / 2, 16, { align: 'center' });
    y = 35;

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(11);
    const line = (label: string, val: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 15, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(val, 70, y);
      y += 7;
    };
    line('Risk Level:', result.risk_level);
    line('Risk Score:', `${result.risk_score}/100`);
    line('Suspected Type:', result.suspected_type);
    line('Confidence:', `${result.confidence}%`);
    line('Image Quality:', result.image_quality);
    line('Urgency:', result.urgency);
    line('Age:', age || '-');
    line('Gender:', gender || '-');

    y += 4;
    const block = (title: string, items: string[]) => {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
      pdf.text(title, 15, y); y += 6;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
      items.forEach((it, i) => {
        const lines = pdf.splitTextToSize(`${i + 1}. ${it}`, pageW - 30);
        lines.forEach((l: string) => {
          if (y > 275) { pdf.addPage(); y = 20; }
          pdf.text(l, 15, y); y += 5;
        });
      });
      y += 4;
    };
    block('Key Findings:', result.key_findings);
    block('Matching Symptoms:', result.matching_symptoms);
    block('Recommendations:', result.recommendations);
    block('Next Steps:', result.next_steps);

    if (y > 250) { pdf.addPage(); y = 20; }
    pdf.setFillColor(254, 226, 226);
    pdf.rect(10, y, pageW - 20, 18, 'F');
    pdf.setTextColor(153, 27, 27);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DISCLAIMER:', 15, y + 6);
    pdf.setFont('helvetica', 'normal');
    const dl = pdf.splitTextToSize(result.disclaimer, pageW - 35);
    pdf.text(dl, 15, y + 11);

    pdf.save(`cancer-screening-${Date.now()}.pdf`);
  };

  const riskStyle = result ? RISK_STYLES[result.risk_level] || RISK_STYLES['غير محدد'] : RISK_STYLES['غير محدد'];
  const RiskIcon = riskStyle.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white" dir="rtl">
      <SEO
        title="كشف السرطان بالذكاء الاصطناعي | مستقبل التكنولوجيا"
        description="أداة فحص أوّلي تعليمي لمؤشرات السرطان بالاعتماد على الذكاء الاصطناعي وتحليل الصور والأعراض"
      />

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/gju-competition')}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة لمستقبل التكنولوجيا</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-400/30 mb-4">
            <Microscope className="w-4 h-4 text-cyan-300" />
            <span className="text-sm text-cyan-200">أداة تعليمية - فحص أولي بالذكاء الاصطناعي</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
            كشف السرطان بالذكاء الاصطناعي
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            ارفع صورة طبية (أشعة، تصوير جلدي، أو صورة لمنطقة من الجسم) و/أو اكتب الأعراض لتحصل على تقييم خطر مبدئي وتقرير قابل للتحميل.
          </p>
        </motion.div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s
                  ? 'bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-white scale-110 shadow-lg shadow-cyan-500/40'
                  : 'bg-white/10 text-white/40'
              }`}>{s}</div>
              <span className={`text-sm ${step >= s ? 'text-white' : 'text-white/40'}`}>
                {s === 1 ? 'إدخال البيانات' : 'نتيجة التحليل'}
              </span>
              {s === 1 && <div className="w-12 h-px bg-white/20" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Image upload */}
              <Card className="bg-white/5 border-cyan-400/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-cyan-300" />
                    <h3 className="text-lg font-bold">الصورة الطبية (اختيارية)</h3>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImagePick(e.target.files?.[0])}
                  />
                  {!imagePreview ? (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full h-64 border-2 border-dashed border-cyan-400/30 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all"
                    >
                      <Upload className="w-12 h-12 text-cyan-300/60" />
                      <p className="text-white/70">اضغط لرفع صورة</p>
                      <p className="text-xs text-white/40">أشعة سينية / صورة جلدية / صورة عادية</p>
                    </button>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-cyan-400/30">
                      <img src={imagePreview} alt="معاينة" className="w-full h-64 object-contain bg-black/40" />
                      <button
                        onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                        className="absolute top-2 left-2 bg-red-500/80 hover:bg-red-500 rounded-full p-1.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Symptoms + patient info */}
              <Card className="bg-white/5 border-fuchsia-400/20 backdrop-blur-md">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-fuchsia-300" />
                    <h3 className="text-lg font-bold">الأعراض والبيانات</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/70 text-sm">العمر</Label>
                      <Input
                        value={age} onChange={(e) => setAge(e.target.value)}
                        type="number" placeholder="مثال: 45"
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">الجنس</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="اختر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ذكر">ذكر</SelectItem>
                          <SelectItem value="أنثى">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/70 text-sm">الأعراض (اختيارية)</Label>
                    <Textarea
                      value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="مثال: كتلة بحجم حبة الزيتون أسفل الإبط، فقدان وزن غير مبرر، تعب مستمر..."
                      className="bg-white/5 border-white/20 text-white min-h-[140px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action button - full width */}
              <div className="md:col-span-2 flex flex-col items-center gap-3">
                <Button
                  onClick={runAnalysis}
                  disabled={analyzing || (!imageFile && !symptoms.trim())}
                  className="w-full md:w-auto px-12 py-6 text-lg bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-violet-500 hover:opacity-90 text-white shadow-lg shadow-fuchsia-500/30"
                >
                  {analyzing ? (
                    <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> جاري التحليل...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 ml-2" /> تحليل بالذكاء الاصطناعي</>
                  )}
                </Button>
                <div className="flex items-start gap-2 text-xs text-amber-200/80 bg-amber-500/10 border border-amber-400/30 rounded-lg p-3 max-w-2xl">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>هذه أداة <b>تعليمية</b> للفحص الأوّلي وليست بديلاً عن التشخيص الطبي. لا تتخذ قرارات علاجية بناءً عليها.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {analyzing && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                    <Microscope className="w-10 h-10 text-cyan-300 absolute inset-0 m-auto" />
                  </div>
                  <p className="text-white/70 text-lg">يحلّل الذكاء الاصطناعي البيانات...</p>
                  <p className="text-white/40 text-sm">قد يستغرق ذلك حتى 30 ثانية</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Risk hero card */}
                  <Card className={`${riskStyle.bg} border-2 ${riskStyle.ring} ring-1 backdrop-blur-md overflow-hidden relative`}>
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className={`w-32 h-32 rounded-full ${riskStyle.bg} ${riskStyle.ring} ring-2 flex items-center justify-center`}>
                          <RiskIcon className={`w-16 h-16 ${riskStyle.color}`} />
                        </div>
                        <div className="flex-1 text-center md:text-right">
                          <p className="text-white/60 text-sm mb-1">مستوى الخطر التقديري</p>
                          <h2 className={`text-4xl font-bold mb-2 ${riskStyle.color}`}>{riskStyle.label}</h2>
                          <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                            <span className="text-white/70">النوع المحتمل:</span>
                            <span className="font-bold">{result.suspected_type}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/60">درجة الخطر</span>
                              <span className={riskStyle.color}>{result.risk_score}/100</span>
                            </div>
                            <Progress value={result.risk_score} className="h-2" />
                            <div className="flex items-center justify-between text-sm pt-2">
                              <span className="text-white/60">ثقة التحليل</span>
                              <span>{result.confidence}%</span>
                            </div>
                            <Progress value={result.confidence} className="h-2" />
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full border ${URGENCY_COLOR[result.urgency] || URGENCY_COLOR['روتيني']} flex items-center gap-2`}>
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold text-sm">{result.urgency}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Findings */}
                    <Card className="bg-white/5 border-cyan-400/20 backdrop-blur-md">
                      <CardContent className="p-5">
                        <h3 className="flex items-center gap-2 font-bold mb-3 text-cyan-300">
                          <Microscope className="w-5 h-5" /> الملاحظات الرئيسية
                        </h3>
                        {result.key_findings.length > 0 ? (
                          <ul className="space-y-2 text-sm text-white/80">
                            {result.key_findings.map((f, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">●</span><span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        ) : <p className="text-white/40 text-sm">لا ملاحظات بصرية.</p>}
                        <p className="text-xs text-white/40 mt-3">جودة الصورة: {result.image_quality}</p>
                      </CardContent>
                    </Card>

                    {/* Matching symptoms */}
                    <Card className="bg-white/5 border-fuchsia-400/20 backdrop-blur-md">
                      <CardContent className="p-5">
                        <h3 className="flex items-center gap-2 font-bold mb-3 text-fuchsia-300">
                          <HeartPulse className="w-5 h-5" /> الأعراض المطابقة
                        </h3>
                        {result.matching_symptoms.length > 0 ? (
                          <ul className="space-y-2 text-sm text-white/80">
                            {result.matching_symptoms.map((s, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-fuchsia-400 mt-1">●</span><span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        ) : <p className="text-white/40 text-sm">لا أعراض مطابقة محددة.</p>}
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="bg-white/5 border-emerald-400/20 backdrop-blur-md">
                      <CardContent className="p-5">
                        <h3 className="flex items-center gap-2 font-bold mb-3 text-emerald-300">
                          <CheckCircle2 className="w-5 h-5" /> التوصيات
                        </h3>
                        <ul className="space-y-2 text-sm text-white/80">
                          {result.recommendations.map((r, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-400 mt-1">✓</span><span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Next steps */}
                    <Card className="bg-white/5 border-violet-400/20 backdrop-blur-md">
                      <CardContent className="p-5">
                        <h3 className="flex items-center gap-2 font-bold mb-3 text-violet-300">
                          <Activity className="w-5 h-5" /> الفحوصات التالية المقترحة
                        </h3>
                        <ul className="space-y-2 text-sm text-white/80">
                          {result.next_steps.map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-violet-400 mt-1">{i + 1}.</span><span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-red-500/10 border border-red-400/40 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-red-200 mb-1">تنبيه طبي مهم</p>
                      <p className="text-red-100/80">{result.disclaimer}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 justify-center pt-2">
                    <Button onClick={downloadPDF} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90">
                      <Download className="w-4 h-4 ml-2" /> تنزيل التقرير PDF
                    </Button>
                    <Button onClick={reset} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <FileText className="w-4 h-4 ml-2" /> فحص جديد
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CancerDetection;
