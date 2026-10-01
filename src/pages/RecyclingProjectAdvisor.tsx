import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, Recycle, Lightbulb, Camera, Send, Loader2, 
  Clock, AlertTriangle, Leaf, ChevronDown, ChevronUp,
  Star, Download, Share2, BookOpen, Wrench, Target, Shield,
  Image, CheckCircle, Trophy, Calculator, Home, ChevronRight
} from 'lucide-react';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

interface Project {
  name: string;
  idea: string;
  materials: string;
  tools: string;
  steps: string;
  principle: string;
  time: string;
  difficulty: string;
  safety: string;
  results: string;
  development: string;
  sustainability: string;
  generatedImage?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const COMMON_MATERIALS = [
  'زجاجات بلاستيكية', 'علب معدنية', 'كرتون', 'ورق', 'قماش قديم',
  'خشب', 'زجاج', 'أغطية زجاجات', 'علب بلاستيكية', 'أكياس بلاستيكية',
  'إطارات قديمة', 'أقمشة جينز', 'علب ألمنيوم', 'أكواب ورقية', 'صناديق كرتون'
];

const RecyclingProjectAdvisor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [materials, setMaterials] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState('');
  const [projectType, setProjectType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [generatingImageFor, setGeneratingImageFor] = useState<number | null>(null);
  const [imageUploaded, setImageUploaded] = useState(false);

  // Environmental impact calculator
  const [completedProjects, setCompletedProjects] = useState(0);
  const [environmentalPoints, setEnvironmentalPoints] = useState(0);

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setImageUploaded(true);
    
    // Show upload confirmation toast immediately
    toast({
      title: "📸 تم رفع الصورة بنجاح!",
      description: "جاري تحليل المواد وإنشاء المشاريع...",
    });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('recycling-project-advisor', {
          body: { 
            imageBase64: base64,
            userLevel,
            projectType
          }
        });

        if (error) throw error;

        if (data.success) {
          setProjects(data.projects);
          setFollowUpQuestions(data.followUpQuestions || []);
          toast({
            title: "✅ تم تحليل الصورة بنجاح!",
            description: `تم اقتراح ${data.projects.length} مشاريع إبداعية`,
          });
          
          // Add environmental points
          setEnvironmentalPoints(prev => prev + 10);
        } else {
          throw new Error(data.error);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحليل الصورة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setImageUploaded(false);
    }
  };

  const generateProjects = async () => {
    const allMaterials = [...selectedMaterials];
    if (materials.trim()) {
      allMaterials.push(...materials.split(',').map(m => m.trim()));
    }

    if (allMaterials.length === 0) {
      toast({
        title: "يرجى إدخال المواد",
        description: "أدخل المواد المتوفرة لديك للحصول على اقتراحات",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recycling-project-advisor', {
        body: {
          materials: allMaterials.join('، '),
          userLevel,
          projectType
        }
      });

      if (error) throw error;

      if (data.success) {
        setProjects(data.projects);
        setFollowUpQuestions(data.followUpQuestions || []);
        toast({
          title: "✅ تم إنشاء المشاريع!",
          description: `تم اقتراح ${data.projects.length} مشاريع إبداعية لإعادة التدوير`
        });
        
        // Add environmental points
        setEnvironmentalPoints(prev => prev + 5);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء المشاريع",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateProjectImage = async (project: Project, index: number) => {
    setGeneratingImageFor(index);
    
    toast({
      title: "🎨 جاري إنشاء الصورة التوضيحية...",
      description: "يرجى الانتظار بضع ثوانٍ",
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-project-image', {
        body: {
          projectName: project.name,
          projectIdea: project.idea,
          projectMaterials: project.materials
        }
      });

      if (error) throw error;

      if (data.success) {
        // Update project with generated image
        const updatedProjects = [...projects];
        updatedProjects[index] = { ...project, generatedImage: data.imageUrl };
        setProjects(updatedProjects);
        
        toast({
          title: "✅ تم إنشاء الصورة التوضيحية!",
          description: project.name,
        });
        
        // Add environmental points
        setEnvironmentalPoints(prev => prev + 3);
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الصورة",
        variant: "destructive"
      });
    } finally {
      setGeneratingImageFor(null);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('recycling-project-advisor', {
        body: {
          question: userMessage,
          conversationHistory: chatMessages
        }
      });

      if (error) throw error;

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.rawResponse || "عذراً، لم أتمكن من الإجابة."
      }]);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const saveProject = (project: Project) => {
    setSavedProjects(prev => {
      if (prev.find(p => p.name === project.name)) {
        toast({ title: "المشروع محفوظ بالفعل" });
        return prev;
      }
      toast({ title: "⭐ تم حفظ المشروع!", description: project.name });
      setEnvironmentalPoints(prev => prev + 2);
      return [...prev, project];
    });
  };

  const markProjectCompleted = (project: Project) => {
    setCompletedProjects(prev => prev + 1);
    setEnvironmentalPoints(prev => prev + 20);
    toast({
      title: "🏆 مبروك! أنجزت مشروعاً جديداً!",
      description: `+20 نقطة بيئية! إجمالي نقاطك: ${environmentalPoints + 20}`,
    });
  };

  const shareProject = (project: Project) => {
    if (navigator.share) {
      navigator.share({
        title: project.name,
        text: `مشروع إعادة تدوير: ${project.name}\n\n${project.idea}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`مشروع إعادة تدوير: ${project.name}\n\n${project.idea}`);
      toast({ title: "📋 تم نسخ المشروع للحافظة!" });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('سهل')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (difficulty.includes('متوسط')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  // Calculate environmental impact
  const calculateImpact = () => {
    const wasteReduced = completedProjects * 0.5; // 0.5 kg per project
    const co2Saved = completedProjects * 1.2; // 1.2 kg CO2 per project
    return { wasteReduced, co2Saved };
  };

  const impact = calculateImpact();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-slate-100 transition-colors" dir="rtl">
      <SEO 
        title="خبير ومستشار مشاريع إعادة التدوير الذكي | منصة المعرفة"
        description="حوّل نفاياتك ومخلفاتك إلى مشاريع ابتكارية متميزة بالذكاء الاصطناعي مع خطوات تفصيلية وتحليل الأثر البيئي."
      />

      <Navbar />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Bar */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-16 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <Link to="/environmental-sustainability" className="hover:text-emerald-600 transition-colors">
                الاستدامة البيئية
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">خبير إعادة التدوير الذكي</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const isGJU = sessionStorage.getItem('gju_mode') === 'true';
                navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
              }}
              className="h-8 gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>العودة للبوابة</span>
            </Button>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 pt-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Recycle className="w-3.5 h-3.5" />
              <span>مستشار إعادة الاستخدام بالذكاء الاصطناعي</span>
            </div>

            {/* Environmental Points Badge */}
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs">
                <Trophy className="w-3.5 h-3.5 ml-1 text-amber-500" />
                {environmentalPoints} نقطة بيئية
              </Badge>
              <Badge className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-3 py-1 text-xs">
                <CheckCircle className="w-3.5 h-3.5 ml-1 text-blue-500" />
                {completedProjects} منجز
              </Badge>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
              خبير إعادة التدوير والابتكار البيئي
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              حوّل المواد المهملة إلى مشاريع علمية، فنية، أو عملية مبتكرة بخطوات تفصيلية وتوجيه ذكي
            </p>
          </motion.div>

          {/* Environmental Impact Card */}
          {completedProjects > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
                <CardContent className="py-4">
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <Calculator className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{impact.wasteReduced.toFixed(1)} كغ</p>
                      <p className="text-slate-500 text-xs">نفايات تم إعادة تدويرها</p>
                    </div>
                    <div className="h-10 w-px bg-emerald-200 dark:bg-emerald-800" />
                    <div className="text-center">
                      <Leaf className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{impact.co2Saved.toFixed(1)} كغ</p>
                      <p className="text-slate-500 text-xs">CO₂ تم توفيره</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <TabsTrigger value="generator" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold">
                <Lightbulb className="w-3.5 h-3.5 ml-1.5" />
                إنشاء
              </TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold">
                <Star className="w-3.5 h-3.5 ml-1.5" />
                المحفوظة ({savedProjects.length})
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold">
                <Send className="w-3.5 h-3.5 ml-1.5" />
                اسأل الخبير
              </TabsTrigger>
            </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-slate-50/60 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base font-bold">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      أدخل المواد المتوفرة لديك
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-xs">
                      اختر من المواد الشائعة أو اكتب مواد مخصصة لديك في المنزل أو المدرسة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                    {/* Common Materials */}
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2.5 block">المواد والمخلفات الشائعة:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_MATERIALS.map(material => (
                          <Badge
                            key={material}
                            variant={selectedMaterials.includes(material) ? "default" : "outline"}
                            className={`cursor-pointer transition-all text-xs py-1 px-2.5 rounded-lg ${
                              selectedMaterials.includes(material)
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => toggleMaterial(material)}
                          >
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Custom Materials */}
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5 block">أو أدخل مواد أخرى يدوياً:</label>
                      <Textarea
                        value={materials}
                        onChange={(e) => setMaterials(e.target.value)}
                        placeholder="أدخل المواد مفصولة بفاصلة (مثال: علب ألمنيوم، قماش جينز قديم)..."
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs"
                        rows={2}
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5 block">الفئة العمرية:</label>
                        <Select value={userLevel} onValueChange={setUserLevel}>
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs">
                            <SelectValue placeholder="اختر المستوى" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="child">أطفال (6-12 سنة)</SelectItem>
                            <SelectItem value="teen">ناشئة ومراهقون (13-17 سنة)</SelectItem>
                            <SelectItem value="adult">بالغون (18+ سنة)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5 block">طابع المشروع:</label>
                        <Select value={projectType} onValueChange={setProjectType}>
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs">
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scientific">علمي واستكشافي</SelectItem>
                            <SelectItem value="artistic">فني وديكور</SelectItem>
                            <SelectItem value="practical">عملي ومنزلي</SelectItem>
                            <SelectItem value="group">نشاط مدرسي جماعي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl text-xs"
                        disabled={isLoading}
                      >
                        {imageUploaded ? (
                          <>
                            <CheckCircle className="w-4 h-4 ml-2 text-emerald-600" />
                            تم رفع الصورة بنجاح
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 ml-2 text-slate-500" />
                            التقاط أو رفع صورة للمواد المتوفرة
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateProjects}
                      disabled={isLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 rounded-xl shadow-xs text-xs"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جارٍ التفكير والتحليل الذكي...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4 ml-2" />
                          توليد الأفكار والمشاريع المقترحة
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Projects Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <ScrollArea className="h-[700px]">
                  {projects.length === 0 ? (
                    <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 h-full flex items-center justify-center rounded-2xl shadow-xs">
                      <CardContent className="text-center py-24">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                          <Recycle className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">بانتظار تحديد المواد</h4>
                        <p className="text-slate-500 text-xs">أدخل المواد المتوفرة وانقر على زر التوليد للاقتراح</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                        >
                          <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all overflow-hidden">
                            <CardHeader 
                              className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors p-4"
                              onClick={() => setExpandedProject(expandedProject === index ? null : index)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200/60 dark:border-emerald-800/40">
                                    <Lightbulb className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-slate-900 dark:text-white text-base font-bold">{project.name}</CardTitle>
                                    <div className="flex gap-2 mt-1.5">
                                      <Badge className={getDifficultyColor(project.difficulty)}>
                                        {project.difficulty}
                                      </Badge>
                                      {project.time && (
                                        <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[11px]">
                                          <Clock className="w-3 h-3 ml-1" />
                                          {project.time}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {expandedProject === index ? (
                                  <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                            </CardHeader>
                            
                            <AnimatePresence>
                              {expandedProject === index && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                >
                                  <CardContent className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 p-5">
                                    {/* Generated Image */}
                                    {project.generatedImage && (
                                      <div className="rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800">
                                        <img 
                                          src={project.generatedImage} 
                                          alt={project.name}
                                          className="w-full h-48 object-cover"
                                        />
                                      </div>
                                    )}

                                    {/* Generate Image Button */}
                                    {!project.generatedImage && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => generateProjectImage(project, index)}
                                        disabled={generatingImageFor === index}
                                        className="w-full bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-xl text-xs"
                                      >
                                        {generatingImageFor === index ? (
                                          <>
                                            <Loader2 className="w-3.5 h-3.5 ml-1.5 animate-spin" />
                                            جاري إنشاء وتوليد الصورة الذكية...
                                          </>
                                        ) : (
                                          <>
                                            <Image className="w-3.5 h-3.5 ml-1.5" />
                                            إنشاء صورة توضيحية للمشروع بالذكاء الاصطناعي
                                          </>
                                        )}
                                      </Button>
                                    )}

                                    {/* Idea */}
                                    <div>
                                      <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                                        <Target className="w-3.5 h-3.5" /> الفكرة الأساسية
                                      </h4>
                                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-line">{project.idea}</p>
                                    </div>

                                    {/* Materials */}
                                    <div>
                                      <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5" /> المواد المطلوبة
                                      </h4>
                                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-line">{project.materials}</p>
                                    </div>

                                    {/* Tools */}
                                    <div>
                                      <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                                        <Wrench className="w-3.5 h-3.5" /> الأدوات المساعدة
                                      </h4>
                                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-line">{project.tools}</p>
                                    </div>

                                    {/* Steps */}
                                    <div>
                                      <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1.5">خطوات العمل والتنفيذ</h4>
                                      <div className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 font-mono">
                                        {project.steps}
                                      </div>
                                    </div>

                                    {/* Principle */}
                                    {project.principle && (
                                      <div>
                                        <h4 className="text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">المبدأ العلمي والبيئي</h4>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-line">{project.principle}</p>
                                      </div>
                                    )}

                                    {/* Safety */}
                                    {project.safety && (
                                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
                                        <h4 className="text-amber-700 dark:text-amber-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                                          <Shield className="w-3.5 h-3.5" /> إرشادات السلامة
                                        </h4>
                                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-line">{project.safety}</p>
                                      </div>
                                    )}

                                    {/* Results */}
                                    {project.results && (
                                      <div>
                                        <h4 className="text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">النتائج المتوقعة والمخرجات</h4>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-line">{project.results}</p>
                                      </div>
                                    )}

                                    {/* Sustainability */}
                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3">
                                      <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                                        <Leaf className="w-3.5 h-3.5" /> الأثر البيئي المستدام
                                      </h4>
                                      <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-line">{project.sustainability}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => saveProject(project)}
                                        className="border-slate-200 dark:border-slate-700 rounded-xl text-xs gap-1.5"
                                      >
                                        <Star className="w-3.5 h-3.5 text-amber-500" />
                                        حفظ في المفضلة
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => shareProject(project)}
                                        className="border-slate-200 dark:border-slate-700 rounded-xl text-xs gap-1.5"
                                      >
                                        <Share2 className="w-3.5 h-3.5 text-blue-500" />
                                        مشاركة
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => markProjectCompleted(project)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        أنجزت المشروع! 🎉
                                      </Button>
                                    </div>
                                  </CardContent>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Card>
                        </motion.div>
                      ))}

                      {/* Follow-up Questions */}
                      {followUpQuestions.length > 0 && (
                        <Card className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-2xl">
                          <CardHeader className="py-3 px-4">
                            <CardTitle className="text-blue-700 dark:text-blue-400 text-sm font-bold">💬 أسئلة لتخصيص أفضل للمشروع</CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                            <ul className="space-y-1.5">
                              {followUpQuestions.map((q, i) => (
                                <li key={i} className="text-slate-600 dark:text-slate-400 text-xs flex items-start gap-2">
                                  <span className="text-blue-500">•</span> {q}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            </div>
          </TabsContent>

          {/* Saved Projects Tab */}
          <TabsContent value="saved">
            <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                <CardTitle className="text-slate-900 dark:text-white text-base font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  المشاريع المحفوظة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {savedProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">لا توجد مشاريع محفوظة في قائمتك بعد</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {savedProjects.map((project, index) => (
                      <Card key={index} className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-slate-900 dark:text-white text-sm font-bold">{project.name}</CardTitle>
                          <Badge className={getDifficultyColor(project.difficulty)}>
                            {project.difficulty}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs whitespace-pre-line line-clamp-3 mb-4">{project.idea}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => markProjectCompleted(project)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5 ml-1" />
                            أنجزته!
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => shareProject(project)}
                            className="border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          >
                            <Share2 className="w-3.5 h-3.5 ml-1" />
                            مشاركة
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                <CardTitle className="text-slate-900 dark:text-white text-base font-bold flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  اسأل مستشار إعادة التدوير الذكي
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  اطرح أي استفسار حول كيفية الاستفادة من مادة معينة أو تقنيات إعادة الاستخدام
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[400px] mb-4 border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-16">
                      <Recycle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold">ابدأ محادثة مع المستشار البيئي</p>
                      <p className="text-slate-400 text-xs mt-1">اسأل عن أي خامة أو عبوة بلاستيكية أو مشروع بيئي!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-emerald-600 text-white rounded-br-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-2xs'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
                <div className="flex gap-2">
                  <GlobalVoiceInput 
                    onTranscript={(text) => setChatInput(prev => prev + (prev ? ' ' : '') + text)}
                    disabled={isChatLoading}
                    size="md"
                  />
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="اكتب استفسارك البيئي هنا..."
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs"
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>

    <Footer />
  </div>
);
};

export default RecyclingProjectAdvisor;
