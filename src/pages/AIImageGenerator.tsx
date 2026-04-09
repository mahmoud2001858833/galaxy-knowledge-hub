import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Edit3, Upload, Sparkles, Image as ImageIcon, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const subjects = [
  { value: 'physics', label: 'الفيزياء', icon: '⚡' },
  { value: 'chemistry', label: 'الكيمياء', icon: '🧪' },
  { value: 'biology', label: 'الأحياء', icon: '🧬' },
  { value: 'math', label: 'الرياضيات', icon: '📐' },
  { value: 'arabic', label: 'اللغة العربية', icon: '📝' },
  { value: 'english', label: 'اللغة الإنجليزية', icon: '🔤' },
  { value: 'geography', label: 'الجغرافيا', icon: '🌍' },
  { value: 'history', label: 'التاريخ', icon: '📜' },
  { value: 'islamic', label: 'التربية الإسلامية', icon: '🕌' },
];

const styles = [
  { value: 'realistic', label: 'واقعي', description: 'صور واقعية عالية الجودة' },
  { value: 'cartoon', label: 'كرتوني', description: 'رسومات كرتونية ملونة' },
  { value: 'diagram', label: 'رسم تخطيطي', description: 'مخططات علمية واضحة' },
  { value: 'sketch', label: 'رسم يدوي', description: 'رسومات بالقلم الرصاص' },
  { value: 'infographic', label: 'إنفوجرافيك', description: 'تصميم معلوماتي منظم' },
  { value: '3d', label: 'ثلاثي الأبعاد', description: 'نماذج ثلاثية الأبعاد' },
];

const gradeLevels = [
  { value: 'elementary', label: 'المرحلة الابتدائية' },
  { value: 'middle', label: 'المرحلة المتوسطة' },
  { value: 'high', label: 'المرحلة الثانوية' },
  { value: 'university', label: 'المرحلة الجامعية' },
];

const AIImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('realistic');
  const [gradeLevel, setGradeLevel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showEditMode, setShowEditMode] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... keep existing code

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('الرجاء إدخال وصف للصورة');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          action: 'generate',
          style,
          subject,
          gradeLevel,
        },
      });

      if (error) throw error;

      if (data?.imageData) {
        setGeneratedImage(data.imageData);
        setGenerationHistory(prev => [data.imageData, ...prev].slice(0, 10));
        toast.success('تم إنشاء الصورة بنجاح! ✨');
      } else {
        toast.error('لم يتم إنشاء الصورة. جرب وصفاً مختلفاً.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('حدث خطأ أثناء إنشاء الصورة');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    const imageToEdit = uploadedImage || generatedImage;
    if (!imageToEdit) {
      toast.error('الرجاء رفع صورة أو إنشاء صورة أولاً');
      return;
    }

    if (!editPrompt.trim()) {
      toast.error('الرجاء إدخال تعليمات التعديل');
      return;
    }

    setIsEditing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt: editPrompt,
          action: 'edit',
          imageBase64: imageToEdit,
          style,
          subject,
        },
      });

      if (error) throw error;

      if (data?.imageData) {
        setGeneratedImage(data.imageData);
        setUploadedImage(null);
        setGenerationHistory(prev => [data.imageData, ...prev].slice(0, 10));
        toast.success('تم تعديل الصورة بنجاح! ✨');
        setEditPrompt('');
      } else {
        toast.error('لم يتم تعديل الصورة. جرب تعليمات مختلفة.');
      }
    } catch (error) {
      console.error('Error editing image:', error);
      toast.error('حدث خطأ أثناء تعديل الصورة');
    } finally {
      setIsEditing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setShowEditMode(true);
        toast.success('تم رفع الصورة بنجاح');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `educational-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تحميل الصورة');
  };

  const suggestedPrompts = [
    'خلية حيوانية مع جميع مكوناتها',
    'الدورة الدموية في جسم الإنسان',
    'التفاعل الكيميائي بين الصوديوم والكلور',
    'النظام الشمسي مع جميع الكواكب',
    'دورة المياه في الطبيعة',
    'تركيب الذرة مع الإلكترونات والبروتونات',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20" dir="rtl">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6" onClick={(e) => {
          const isGJU = sessionStorage.getItem('gju_mode') === 'true';
          if (isGJU) { e.preventDefault(); window.location.href = '/gju-competition'; }
        }}>
          <ArrowLeft className="h-4 w-4" />
          {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة للرئيسية'}
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-l from-primary to-purple-600 bg-clip-text text-transparent">
              إنشاء الصور التعليمية بالذكاء الاصطناعي
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            أنشئ صوراً تعليمية احترافية بدون أي نص عليها - مثالية للعروض التقديمية والمواد التعليمية
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* قسم الإعدادات والإنشاء */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-primary/10 shadow-xl">
              <CardHeader className="bg-gradient-to-l from-primary/5 to-purple-500/5">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  إنشاء صورة جديدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* اقتراحات سريعة */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">اقتراحات سريعة:</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.slice(0, 3).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setPrompt(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* وصف الصورة */}
                <div>
                  <Label htmlFor="prompt" className="text-base font-medium">
                    وصف الصورة المطلوبة
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="مثال: خلية نباتية مع جميع مكوناتها مثل النواة والكلوروبلاست والجدار الخلوي..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="mt-2 min-h-[100px] resize-none"
                  />
                </div>

                {/* المادة الدراسية */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>المادة الدراسية</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="اختر المادة" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            <span className="flex items-center gap-2">
                              <span>{s.icon}</span>
                              <span>{s.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>المرحلة الدراسية</Label>
                    <Select value={gradeLevel} onValueChange={setGradeLevel}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="اختر المرحلة" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeLevels.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* نمط الصورة */}
                <div>
                  <Label className="mb-3 block">نمط الصورة</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {styles.map((s) => (
                      <Button
                        key={s.value}
                        variant={style === s.value ? "default" : "outline"}
                        className="flex flex-col h-auto py-3 px-2"
                        onClick={() => setStyle(s.value)}
                      >
                        <span className="text-sm font-medium">{s.label}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                          {s.description}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* زر الإنشاء */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-12 text-lg bg-gradient-to-l from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Sparkles className="ml-2 h-5 w-5" />
                      إنشاء الصورة
                    </>
                  )}
                </Button>

                {/* رفع صورة للتعديل */}
                <div className="border-t pt-6">
                  <Label className="text-base font-medium mb-3 block">
                    أو ارفع صورة للتعديل عليها
                  </Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-dashed border-2 h-20 hover:bg-muted/50"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-muted-foreground">اضغط لرفع صورة</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* قسم عرض النتيجة */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-primary/10 shadow-xl h-full">
              <CardHeader className="bg-gradient-to-l from-purple-500/5 to-primary/5">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-purple-500" />
                    الصورة المُنشأة
                  </span>
                  {generatedImage && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 ml-1" />
                        تحميل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEditMode(!showEditMode)}
                      >
                        <Edit3 className="h-4 w-4 ml-1" />
                        تعديل
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AnimatePresence mode="wait">
                  {uploadedImage || generatedImage ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="relative rounded-xl overflow-hidden bg-muted/50 aspect-square">
                        <img
                          src={uploadedImage || generatedImage || ''}
                          alt="الصورة المُنشأة"
                          className="w-full h-full object-contain"
                        />
                        {(isGenerating || isEditing) && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-3" />
                              <p className="text-muted-foreground">
                                {isEditing ? 'جاري التعديل...' : 'جاري الإنشاء...'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* قسم التعديل */}
                      {showEditMode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="border-t pt-4"
                        >
                          <Label className="text-sm font-medium mb-2 block">
                            تعليمات التعديل
                          </Label>
                          <Textarea
                            placeholder="مثال: أضف المزيد من التفاصيل، غير الألوان، أضف عنصراً جديداً..."
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                          <Button
                            onClick={handleEdit}
                            disabled={isEditing || !editPrompt.trim()}
                            className="w-full mt-3"
                          >
                            {isEditing ? (
                              <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري التعديل...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="ml-2 h-4 w-4" />
                                تطبيق التعديلات
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-[400px] text-center"
                    >
                      <div className="p-6 bg-muted/30 rounded-full mb-4">
                        <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-xl font-medium text-muted-foreground mb-2">
                        لم يتم إنشاء صورة بعد
                      </h3>
                      <p className="text-sm text-muted-foreground/70 max-w-xs">
                        أدخل وصفاً للصورة التعليمية التي تريدها واضغط على "إنشاء الصورة"
                      </p>
                      <ArrowRight className="h-8 w-8 text-muted-foreground/30 mt-4 rotate-180" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* سجل الصور السابقة */}
                {generationHistory.length > 1 && (
                  <div className="mt-6 border-t pt-4">
                    <Label className="text-sm text-muted-foreground mb-3 block">
                      الصور السابقة
                    </Label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {generationHistory.slice(1).map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setGeneratedImage(img)}
                          className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                        >
                          <img
                            src={img}
                            alt={`صورة سابقة ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* نصائح استخدام */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-l from-primary/5 to-purple-500/5 border-primary/10">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                نصائح للحصول على أفضل النتائج
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <strong>كن محدداً</strong>
                    <p className="text-muted-foreground">اذكر التفاصيل الدقيقة للمفهوم العلمي</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <strong>اختر النمط المناسب</strong>
                    <p className="text-muted-foreground">الرسم التخطيطي للمفاهيم، والواقعي للظواهر</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">✏️</span>
                  <div>
                    <strong>عدّل حسب الحاجة</strong>
                    <p className="text-muted-foreground">استخدم خيار التعديل لتحسين الصورة</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AIImageGenerator;
