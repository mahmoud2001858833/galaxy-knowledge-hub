import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Image, CheckCircle, Trophy, Calculator
} from 'lucide-react';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';

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
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-teal-950 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={() => {
              const isGJU = sessionStorage.getItem('gju_mode') === 'true';
              navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
            }}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>

          {/* Environmental Points Badge */}
          <div className="flex items-center gap-4">
            <Badge className="bg-green-600/30 text-green-300 border-green-500/50 px-4 py-2">
              <Trophy className="w-4 h-4 ml-2" />
              {environmentalPoints} نقطة بيئية
            </Badge>
            <Badge className="bg-blue-600/30 text-blue-300 border-blue-500/50 px-4 py-2">
              <CheckCircle className="w-4 h-4 ml-2" />
              {completedProjects} مشروع منجز
            </Badge>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm">
              <Recycle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400">
              خبير إعادة التدوير الذكي
            </h1>
          </div>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            حوّل نفاياتك إلى مشاريع إبداعية مع مساعدة الذكاء الاصطناعي
          </p>
        </motion.div>

        {/* Environmental Impact Card */}
        {completedProjects > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <Calculator className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-400">{impact.wasteReduced.toFixed(1)} كغ</p>
                    <p className="text-white/60 text-sm">نفايات تم إعادة تدويرها</p>
                  </div>
                  <div className="h-12 w-px bg-white/20" />
                  <div className="text-center">
                    <Leaf className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-400">{impact.co2Saved.toFixed(1)} كغ</p>
                    <p className="text-white/60 text-sm">CO₂ تم توفيره</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-white/10">
            <TabsTrigger value="generator" className="text-white data-[state=active]:bg-green-600">
              <Lightbulb className="w-4 h-4 ml-2" />
              إنشاء
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-white data-[state=active]:bg-green-600">
              <Star className="w-4 h-4 ml-2" />
              المحفوظة ({savedProjects.length})
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-green-600">
              <Send className="w-4 h-4 ml-2" />
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
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-400" />
                      أدخل المواد المتوفرة
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      اختر من القائمة أو أدخل المواد يدوياً
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Common Materials */}
                    <div>
                      <label className="text-white/80 text-sm mb-3 block">المواد الشائعة:</label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_MATERIALS.map(material => (
                          <Badge
                            key={material}
                            variant={selectedMaterials.includes(material) ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${
                              selectedMaterials.includes(material)
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'border-white/30 text-white/70 hover:bg-white/10'
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
                      <label className="text-white/80 text-sm mb-2 block">أو أدخل مواد أخرى:</label>
                      <Textarea
                        value={materials}
                        onChange={(e) => setMaterials(e.target.value)}
                        placeholder="أدخل المواد مفصولة بفاصلة..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        rows={3}
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/80 text-sm mb-2 block">المستوى:</label>
                        <Select value={userLevel} onValueChange={setUserLevel}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="اختر المستوى" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="child">طفل (6-12 سنة)</SelectItem>
                            <SelectItem value="teen">مراهق (13-17 سنة)</SelectItem>
                            <SelectItem value="adult">بالغ (18+ سنة)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-white/80 text-sm mb-2 block">نوع المشروع:</label>
                        <Select value={projectType} onValueChange={setProjectType}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scientific">علمي</SelectItem>
                            <SelectItem value="artistic">فني</SelectItem>
                            <SelectItem value="practical">عملي</SelectItem>
                            <SelectItem value="group">جماعي</SelectItem>
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
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                        disabled={isLoading}
                      >
                        {imageUploaded ? (
                          <>
                            <CheckCircle className="w-4 h-4 ml-2 text-green-400" />
                            تم رفع الصورة، جاري التحليل...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 ml-2" />
                            📸 ارفع صورة للمواد
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateProjects}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري التحليل والإنشاء...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4 ml-2" />
                          🚀 اقترح مشاريع إبداعية
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
                    <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                      <CardContent className="text-center py-20">
                        <Recycle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/50">أدخل المواد المتوفرة لعرض المشاريع المقترحة</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-white/5 border-white/10 overflow-hidden">
                            <CardHeader 
                              className="cursor-pointer hover:bg-white/5 transition-colors"
                              onClick={() => setExpandedProject(expandedProject === index ? null : index)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-green-500/20">
                                    <Lightbulb className="w-5 h-5 text-green-400" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                                    <div className="flex gap-2 mt-2">
                                      <Badge className={getDifficultyColor(project.difficulty)}>
                                        {project.difficulty}
                                      </Badge>
                                      {project.time && (
                                        <Badge variant="outline" className="border-white/30 text-white/70">
                                          <Clock className="w-3 h-3 ml-1" />
                                          {project.time}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {expandedProject === index ? (
                                  <ChevronUp className="w-5 h-5 text-white/50" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-white/50" />
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
                                  <CardContent className="space-y-4 border-t border-white/10 pt-4">
                                    {/* Generated Image */}
                                    {project.generatedImage && (
                                      <div className="rounded-lg overflow-hidden">
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
                                        className="w-full bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                                      >
                                        {generatingImageFor === index ? (
                                          <>
                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                            جاري إنشاء الصورة...
                                          </>
                                        ) : (
                                          <>
                                            <Image className="w-4 h-4 ml-2" />
                                            🎨 إنشاء صورة توضيحية
                                          </>
                                        )}
                                      </Button>
                                    )}

                                    {/* Idea */}
                                    <div>
                                      <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4" /> الفكرة
                                      </h4>
                                      <p className="text-white/80 text-sm whitespace-pre-line">{project.idea}</p>
                                    </div>

                                    {/* Materials */}
                                    <div>
                                      <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> المواد المطلوبة
                                      </h4>
                                      <p className="text-white/80 text-sm whitespace-pre-line">{project.materials}</p>
                                    </div>

                                    {/* Tools */}
                                    <div>
                                      <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                        <Wrench className="w-4 h-4" /> الأدوات
                                      </h4>
                                      <p className="text-white/80 text-sm whitespace-pre-line">{project.tools}</p>
                                    </div>

                                    {/* Steps */}
                                    <div>
                                      <h4 className="text-green-400 font-semibold mb-2">📝 خطوات العمل</h4>
                                      <div className="text-white/80 text-sm whitespace-pre-line bg-white/5 p-3 rounded-lg">
                                        {project.steps}
                                      </div>
                                    </div>

                                    {/* Principle */}
                                    {project.principle && (
                                      <div>
                                        <h4 className="text-blue-400 font-semibold mb-2">🔬 المبدأ العلمي/البيئي</h4>
                                        <p className="text-white/80 text-sm whitespace-pre-line">{project.principle}</p>
                                      </div>
                                    )}

                                    {/* Safety */}
                                    {project.safety && (
                                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                        <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                                          <Shield className="w-4 h-4" /> تحذيرات الأمان
                                        </h4>
                                        <p className="text-white/80 text-sm whitespace-pre-line">{project.safety}</p>
                                      </div>
                                    )}

                                    {/* Results */}
                                    {project.results && (
                                      <div>
                                        <h4 className="text-yellow-400 font-semibold mb-2">🎯 النتائج المتوقعة</h4>
                                        <p className="text-white/80 text-sm whitespace-pre-line">{project.results}</p>
                                      </div>
                                    )}

                                    {/* Development Ideas */}
                                    {project.development && (
                                      <div>
                                        <h4 className="text-purple-400 font-semibold mb-2">💡 أفكار للتطوير</h4>
                                        <p className="text-white/80 text-sm whitespace-pre-line">{project.development}</p>
                                      </div>
                                    )}

                                    {/* Sustainability */}
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                      <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                        <Leaf className="w-4 h-4" /> الأثر البيئي
                                      </h4>
                                      <p className="text-white/80 text-sm whitespace-pre-line">{project.sustainability}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => saveProject(project)}
                                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                      >
                                        <Star className="w-4 h-4 ml-1" />
                                        حفظ
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => shareProject(project)}
                                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                      >
                                        <Share2 className="w-4 h-4 ml-1" />
                                        مشاركة
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => markProjectCompleted(project)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <CheckCircle className="w-4 h-4 ml-1" />
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
                        <Card className="bg-blue-500/10 border-blue-500/30">
                          <CardHeader>
                            <CardTitle className="text-blue-400 text-lg">💬 أسئلة لتخصيص أفضل</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {followUpQuestions.map((q, i) => (
                                <li key={i} className="text-white/80 text-sm flex items-start gap-2">
                                  <span className="text-blue-400">•</span> {q}
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
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">⭐ المشاريع المحفوظة</CardTitle>
              </CardHeader>
              <CardContent>
                {savedProjects.length === 0 ? (
                  <div className="text-center py-10">
                    <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">لا توجد مشاريع محفوظة بعد</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {savedProjects.map((project, index) => (
                      <Card key={index} className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                          <Badge className={getDifficultyColor(project.difficulty)}>
                            {project.difficulty}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/70 text-sm whitespace-pre-line">{project.idea}</p>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => markProjectCompleted(project)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 ml-1" />
                              أنجزته!
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => shareProject(project)}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Share2 className="w-4 h-4 ml-1" />
                              مشاركة
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-400" />
                  اسأل خبير إعادة التدوير
                </CardTitle>
                <CardDescription className="text-white/60">
                  اسأل أي سؤال عن إعادة التدوير أو المشاريع البيئية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] mb-4 border border-white/10 rounded-lg p-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-10">
                      <Recycle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50">ابدأ محادثة مع الخبير</p>
                      <p className="text-white/40 text-sm mt-2">اسأل عن أي مادة أو مشروع أو فكرة بيئية!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/10 text-white/90'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 p-3 rounded-lg">
                            <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
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
                    placeholder="اكتب سؤالك هنا..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RecyclingProjectAdvisor;
