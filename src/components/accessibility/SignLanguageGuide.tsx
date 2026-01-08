import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hand, MessageSquare, BookOpen, Camera, Volume2, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import SignLanguageCamera from './SignLanguageCamera';

interface SignLanguageGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const gestureCommands = [
  { gesture: '✋', name: 'كف مفتوح', action: 'إيقاف', description: 'إيقاف القراءة أو العملية الحالية' },
  { gesture: '☝️', name: 'إصبع واحد للأعلى', action: 'التالي', description: 'الانتقال للعنصر التالي أو التمرير للأعلى' },
  { gesture: '👇', name: 'إصبع للأسفل', action: 'السابق', description: 'العودة للعنصر السابق أو التمرير للأسفل' },
  { gesture: '👍', name: 'إبهام للأعلى', action: 'موافق', description: 'تأكيد أو النقر على العنصر الحالي' },
  { gesture: '👎', name: 'إبهام للأسفل', action: 'إلغاء', description: 'إلغاء العملية أو الرجوع للخلف' },
  { gesture: '✊', name: 'قبضة', action: 'تحديد', description: 'تحديد العنصر أو الانتقال للعنصر التالي' },
  { gesture: '✌️', name: 'علامة النصر', action: 'سلام', description: 'إشارة السلام أو التحية' },
  { gesture: '👋', name: 'تلويح', action: 'وداعاً', description: 'إشارة الوداع' },
];

// قاموس لغة الإشارة العربية الشامل - 200+ كلمة
const signDictionary = [
  // الحروف الأبجدية العربية
  { word: 'أ', gesture: '🤙', category: 'الحروف' },
  { word: 'ب', gesture: '✌️', category: 'الحروف' },
  { word: 'ت', gesture: '🤟', category: 'الحروف' },
  { word: 'ث', gesture: '🤘', category: 'الحروف' },
  { word: 'ج', gesture: '👌', category: 'الحروف' },
  { word: 'ح', gesture: '🤏', category: 'الحروف' },
  { word: 'خ', gesture: '✋', category: 'الحروف' },
  { word: 'د', gesture: '☝️', category: 'الحروف' },
  { word: 'ذ', gesture: '👆', category: 'الحروف' },
  { word: 'ر', gesture: '👉', category: 'الحروف' },
  { word: 'ز', gesture: '👈', category: 'الحروف' },
  { word: 'س', gesture: '👇', category: 'الحروف' },
  { word: 'ش', gesture: '🖐️', category: 'الحروف' },
  { word: 'ص', gesture: '🤚', category: 'الحروف' },
  { word: 'ض', gesture: '🖖', category: 'الحروف' },
  { word: 'ط', gesture: '👊', category: 'الحروف' },
  { word: 'ظ', gesture: '✊', category: 'الحروف' },
  { word: 'ع', gesture: '🤛', category: 'الحروف' },
  { word: 'غ', gesture: '🤜', category: 'الحروف' },
  { word: 'ف', gesture: '👍', category: 'الحروف' },
  { word: 'ق', gesture: '👎', category: 'الحروف' },
  { word: 'ك', gesture: '👏', category: 'الحروف' },
  { word: 'ل', gesture: '🙌', category: 'الحروف' },
  { word: 'م', gesture: '👐', category: 'الحروف' },
  { word: 'ن', gesture: '🤲', category: 'الحروف' },
  { word: 'هـ', gesture: '🙏', category: 'الحروف' },
  { word: 'و', gesture: '🤝', category: 'الحروف' },
  { word: 'ي', gesture: '👋', category: 'الحروف' },
  
  // الأرقام
  { word: '0', gesture: '✊', category: 'الأرقام' },
  { word: '1', gesture: '☝️', category: 'الأرقام' },
  { word: '2', gesture: '✌️', category: 'الأرقام' },
  { word: '3', gesture: '🤟', category: 'الأرقام' },
  { word: '4', gesture: '🖖', category: 'الأرقام' },
  { word: '5', gesture: '🖐️', category: 'الأرقام' },
  { word: '6', gesture: '🤙', category: 'الأرقام' },
  { word: '7', gesture: '🤘', category: 'الأرقام' },
  { word: '8', gesture: '👌', category: 'الأرقام' },
  { word: '9', gesture: '👍', category: 'الأرقام' },
  { word: '10', gesture: '👏', category: 'الأرقام' },
  
  // التحيات والمجاملات
  { word: 'مرحبا', gesture: '👋', category: 'تحيات' },
  { word: 'أهلاً', gesture: '🤗', category: 'تحيات' },
  { word: 'السلام عليكم', gesture: '🙏', category: 'تحيات' },
  { word: 'صباح الخير', gesture: '☀️', category: 'تحيات' },
  { word: 'مساء الخير', gesture: '🌙', category: 'تحيات' },
  { word: 'تصبح على خير', gesture: '😴', category: 'تحيات' },
  { word: 'وداعاً', gesture: '👋', category: 'تحيات' },
  { word: 'إلى اللقاء', gesture: '🤝', category: 'تحيات' },
  { word: 'شكراً', gesture: '🙏', category: 'تحيات' },
  { word: 'عفواً', gesture: '😊', category: 'تحيات' },
  { word: 'من فضلك', gesture: '🤲', category: 'تحيات' },
  { word: 'آسف', gesture: '😔', category: 'تحيات' },
  { word: 'تفضل', gesture: '👐', category: 'تحيات' },
  { word: 'أهلاً وسهلاً', gesture: '🤗', category: 'تحيات' },
  
  // الضمائر
  { word: 'أنا', gesture: '👆', category: 'ضمائر' },
  { word: 'أنت', gesture: '👉', category: 'ضمائر' },
  { word: 'أنتِ', gesture: '👉', category: 'ضمائر' },
  { word: 'هو', gesture: '👉', category: 'ضمائر' },
  { word: 'هي', gesture: '👉', category: 'ضمائر' },
  { word: 'نحن', gesture: '👐', category: 'ضمائر' },
  { word: 'أنتم', gesture: '🖐️', category: 'ضمائر' },
  { word: 'هم', gesture: '👋', category: 'ضمائر' },
  { word: 'هن', gesture: '👋', category: 'ضمائر' },
  
  // الأفعال الشائعة
  { word: 'يأكل', gesture: '🍽️', category: 'أفعال' },
  { word: 'يشرب', gesture: '🥤', category: 'أفعال' },
  { word: 'ينام', gesture: '😴', category: 'أفعال' },
  { word: 'يقرأ', gesture: '📖', category: 'أفعال' },
  { word: 'يكتب', gesture: '✍️', category: 'أفعال' },
  { word: 'يمشي', gesture: '🚶', category: 'أفعال' },
  { word: 'يركض', gesture: '🏃', category: 'أفعال' },
  { word: 'يسمع', gesture: '👂', category: 'أفعال' },
  { word: 'يرى', gesture: '👀', category: 'أفعال' },
  { word: 'يتكلم', gesture: '🗣️', category: 'أفعال' },
  { word: 'يفكر', gesture: '🤔', category: 'أفعال' },
  { word: 'يعمل', gesture: '💼', category: 'أفعال' },
  { word: 'يلعب', gesture: '🎮', category: 'أفعال' },
  { word: 'يدرس', gesture: '📚', category: 'أفعال' },
  { word: 'يحب', gesture: '❤️', category: 'أفعال' },
  { word: 'يريد', gesture: '🙋', category: 'أفعال' },
  { word: 'يستطيع', gesture: '💪', category: 'أفعال' },
  { word: 'يذهب', gesture: '🚶', category: 'أفعال' },
  { word: 'يأتي', gesture: '🏃', category: 'أفعال' },
  { word: 'يفتح', gesture: '📂', category: 'أفعال' },
  { word: 'يغلق', gesture: '📁', category: 'أفعال' },
  { word: 'يساعد', gesture: '🤝', category: 'أفعال' },
  { word: 'يتعلم', gesture: '🎓', category: 'أفعال' },
  { word: 'يسأل', gesture: '❓', category: 'أفعال' },
  { word: 'يجيب', gesture: '💬', category: 'أفعال' },
  
  // الصفات
  { word: 'كبير', gesture: '🐘', category: 'صفات' },
  { word: 'صغير', gesture: '🐜', category: 'صفات' },
  { word: 'طويل', gesture: '📏', category: 'صفات' },
  { word: 'قصير', gesture: '📐', category: 'صفات' },
  { word: 'جميل', gesture: '🌹', category: 'صفات' },
  { word: 'سريع', gesture: '⚡', category: 'صفات' },
  { word: 'بطيء', gesture: '🐢', category: 'صفات' },
  { word: 'ذكي', gesture: '🧠', category: 'صفات' },
  { word: 'قوي', gesture: '💪', category: 'صفات' },
  { word: 'ضعيف', gesture: '😓', category: 'صفات' },
  { word: 'جديد', gesture: '✨', category: 'صفات' },
  { word: 'قديم', gesture: '📜', category: 'صفات' },
  { word: 'حار', gesture: '🔥', category: 'صفات' },
  { word: 'بارد', gesture: '❄️', category: 'صفات' },
  { word: 'سهل', gesture: '👌', category: 'صفات' },
  { word: 'صعب', gesture: '😰', category: 'صفات' },
  { word: 'جيد', gesture: '👍', category: 'صفات' },
  { word: 'سيء', gesture: '👎', category: 'صفات' },
  { word: 'مهم', gesture: '⭐', category: 'صفات' },
  { word: 'ممتاز', gesture: '🏆', category: 'صفات' },
  
  // العائلة
  { word: 'أب', gesture: '👨', category: 'عائلة' },
  { word: 'أم', gesture: '👩', category: 'عائلة' },
  { word: 'أخ', gesture: '👦', category: 'عائلة' },
  { word: 'أخت', gesture: '👧', category: 'عائلة' },
  { word: 'جد', gesture: '👴', category: 'عائلة' },
  { word: 'جدة', gesture: '👵', category: 'عائلة' },
  { word: 'عم', gesture: '👨‍🦱', category: 'عائلة' },
  { word: 'عمة', gesture: '👩‍🦱', category: 'عائلة' },
  { word: 'خال', gesture: '👨‍🦰', category: 'عائلة' },
  { word: 'خالة', gesture: '👩‍🦰', category: 'عائلة' },
  { word: 'ابن', gesture: '👦', category: 'عائلة' },
  { word: 'ابنة', gesture: '👧', category: 'عائلة' },
  { word: 'طفل', gesture: '👶', category: 'عائلة' },
  { word: 'عائلة', gesture: '👨‍👩‍👧‍👦', category: 'عائلة' },
  
  // المدرسة والتعليم
  { word: 'مدرسة', gesture: '🏫', category: 'مدرسة' },
  { word: 'معلم', gesture: '👨‍🏫', category: 'مدرسة' },
  { word: 'معلمة', gesture: '👩‍🏫', category: 'مدرسة' },
  { word: 'طالب', gesture: '👨‍🎓', category: 'مدرسة' },
  { word: 'طالبة', gesture: '👩‍🎓', category: 'مدرسة' },
  { word: 'كتاب', gesture: '📕', category: 'مدرسة' },
  { word: 'دفتر', gesture: '📓', category: 'مدرسة' },
  { word: 'قلم', gesture: '✏️', category: 'مدرسة' },
  { word: 'ممحاة', gesture: '🧹', category: 'مدرسة' },
  { word: 'مسطرة', gesture: '📏', category: 'مدرسة' },
  { word: 'حقيبة', gesture: '🎒', category: 'مدرسة' },
  { word: 'صف', gesture: '🏛️', category: 'مدرسة' },
  { word: 'درس', gesture: '📖', category: 'مدرسة' },
  { word: 'امتحان', gesture: '📝', category: 'مدرسة' },
  { word: 'واجب', gesture: '📋', category: 'مدرسة' },
  { word: 'سبورة', gesture: '📊', category: 'مدرسة' },
  { word: 'فصل', gesture: '🏫', category: 'مدرسة' },
  
  // الألوان
  { word: 'أحمر', gesture: '🔴', category: 'ألوان' },
  { word: 'أزرق', gesture: '🔵', category: 'ألوان' },
  { word: 'أخضر', gesture: '🟢', category: 'ألوان' },
  { word: 'أصفر', gesture: '🟡', category: 'ألوان' },
  { word: 'برتقالي', gesture: '🟠', category: 'ألوان' },
  { word: 'بنفسجي', gesture: '🟣', category: 'ألوان' },
  { word: 'أبيض', gesture: '⚪', category: 'ألوان' },
  { word: 'أسود', gesture: '⚫', category: 'ألوان' },
  { word: 'بني', gesture: '🟤', category: 'ألوان' },
  { word: 'وردي', gesture: '💗', category: 'ألوان' },
  
  // أيام الأسبوع
  { word: 'السبت', gesture: '1️⃣', category: 'أيام' },
  { word: 'الأحد', gesture: '2️⃣', category: 'أيام' },
  { word: 'الإثنين', gesture: '3️⃣', category: 'أيام' },
  { word: 'الثلاثاء', gesture: '4️⃣', category: 'أيام' },
  { word: 'الأربعاء', gesture: '5️⃣', category: 'أيام' },
  { word: 'الخميس', gesture: '6️⃣', category: 'أيام' },
  { word: 'الجمعة', gesture: '7️⃣', category: 'أيام' },
  
  // الأشهر
  { word: 'يناير', gesture: '❄️', category: 'أشهر' },
  { word: 'فبراير', gesture: '💝', category: 'أشهر' },
  { word: 'مارس', gesture: '🌸', category: 'أشهر' },
  { word: 'أبريل', gesture: '🌷', category: 'أشهر' },
  { word: 'مايو', gesture: '🌼', category: 'أشهر' },
  { word: 'يونيو', gesture: '☀️', category: 'أشهر' },
  { word: 'يوليو', gesture: '🏖️', category: 'أشهر' },
  { word: 'أغسطس', gesture: '🌴', category: 'أشهر' },
  { word: 'سبتمبر', gesture: '🍂', category: 'أشهر' },
  { word: 'أكتوبر', gesture: '🎃', category: 'أشهر' },
  { word: 'نوفمبر', gesture: '🍁', category: 'أشهر' },
  { word: 'ديسمبر', gesture: '🎄', category: 'أشهر' },
  
  // المشاعر
  { word: 'سعيد', gesture: '😊', category: 'مشاعر' },
  { word: 'حزين', gesture: '😢', category: 'مشاعر' },
  { word: 'غاضب', gesture: '😠', category: 'مشاعر' },
  { word: 'خائف', gesture: '😨', category: 'مشاعر' },
  { word: 'متفاجئ', gesture: '😲', category: 'مشاعر' },
  { word: 'متحمس', gesture: '🤩', category: 'مشاعر' },
  { word: 'متعب', gesture: '😫', category: 'مشاعر' },
  { word: 'مريض', gesture: '🤒', category: 'مشاعر' },
  { word: 'جائع', gesture: '🍽️', category: 'مشاعر' },
  { word: 'عطشان', gesture: '💧', category: 'مشاعر' },
  { word: 'نعسان', gesture: '😴', category: 'مشاعر' },
  { word: 'سعادة', gesture: '🎉', category: 'مشاعر' },
  { word: 'حب', gesture: '❤️', category: 'مشاعر' },
  
  // الأساسيات
  { word: 'نعم', gesture: '👍', category: 'أساسيات' },
  { word: 'لا', gesture: '👎', category: 'أساسيات' },
  { word: 'ربما', gesture: '🤷', category: 'أساسيات' },
  { word: 'لماذا', gesture: '❓', category: 'أساسيات' },
  { word: 'كيف', gesture: '🤔', category: 'أساسيات' },
  { word: 'أين', gesture: '📍', category: 'أساسيات' },
  { word: 'متى', gesture: '⏰', category: 'أساسيات' },
  { word: 'ماذا', gesture: '❔', category: 'أساسيات' },
  { word: 'من', gesture: '👤', category: 'أساسيات' },
  { word: 'كم', gesture: '🔢', category: 'أساسيات' },
  { word: 'هنا', gesture: '📍', category: 'أساسيات' },
  { word: 'هناك', gesture: '👉', category: 'أساسيات' },
  { word: 'الآن', gesture: '⏰', category: 'أساسيات' },
  { word: 'غداً', gesture: '📅', category: 'أساسيات' },
  { word: 'أمس', gesture: '⬅️', category: 'أساسيات' },
  
  // الأماكن
  { word: 'بيت', gesture: '🏠', category: 'أماكن' },
  { word: 'مستشفى', gesture: '🏥', category: 'أماكن' },
  { word: 'مطعم', gesture: '🍽️', category: 'أماكن' },
  { word: 'سوق', gesture: '🛒', category: 'أماكن' },
  { word: 'مسجد', gesture: '🕌', category: 'أماكن' },
  { word: 'حديقة', gesture: '🌳', category: 'أماكن' },
  { word: 'مكتبة', gesture: '📚', category: 'أماكن' },
  { word: 'ملعب', gesture: '⚽', category: 'أماكن' },
  { word: 'شارع', gesture: '🛤️', category: 'أماكن' },
  { word: 'مطار', gesture: '✈️', category: 'أماكن' },
];

// تجميع الفئات
const categories = [...new Set(signDictionary.map(item => item.category))];

const SignLanguageGuide: React.FC<SignLanguageGuideProps> = ({ isOpen, onClose }) => {
  const [textToConvert, setTextToConvert] = useState('');
  const [convertedSigns, setConvertedSigns] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [detectedGestures, setDetectedGestures] = useState<{ gesture: string; text: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredDictionary = signDictionary.filter(item => {
    const matchesSearch = item.word.includes(searchQuery);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTextToSign = async () => {
    if (!textToConvert.trim()) return;
    
    setIsConverting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const words = textToConvert.split(' ');
    const signs = words.map(word => {
      const found = signDictionary.find(s => s.word === word || s.word.includes(word));
      return found ? found.gesture : '❓';
    });
    
    setConvertedSigns(signs);
    setIsConverting(false);
  };

  const handleGestureDetected = (gesture: string, arabicText: string) => {
    setDetectedGestures(prev => [...prev, { gesture, text: arabicText }].slice(-10));
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl border border-indigo-500/30 w-full max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <Card className="bg-transparent border-0 h-full">
              <CardHeader className="border-b border-indigo-500/30 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                      <Hand className="h-6 w-6 text-indigo-400" />
                    </div>
                    دليل لغة الإشارة العربية الشامل
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 overflow-hidden h-[calc(90vh-100px)]">
                <Tabs defaultValue="camera" className="w-full h-full flex flex-col">
                  <TabsList className="w-full justify-start rounded-none border-b border-indigo-500/20 bg-transparent p-0 flex-shrink-0">
                    <TabsTrigger 
                      value="camera" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent px-4 py-3 text-slate-300 data-[state=active]:text-white"
                    >
                      <Camera className="h-4 w-4 ml-2" />
                      الكاميرا
                    </TabsTrigger>
                    <TabsTrigger 
                      value="commands" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent px-4 py-3 text-slate-300 data-[state=active]:text-white"
                    >
                      <Hand className="h-4 w-4 ml-2" />
                      الأوامر
                    </TabsTrigger>
                    <TabsTrigger 
                      value="convert" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent px-4 py-3 text-slate-300 data-[state=active]:text-white"
                    >
                      <MessageSquare className="h-4 w-4 ml-2" />
                      التحويل
                    </TabsTrigger>
                    <TabsTrigger 
                      value="dictionary" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-400 data-[state=active]:bg-transparent px-4 py-3 text-slate-300 data-[state=active]:text-white"
                    >
                      <BookOpen className="h-4 w-4 ml-2" />
                      القاموس ({signDictionary.length}+)
                    </TabsTrigger>
                  </TabsList>

                  {/* تبويب الكاميرا */}
                  <TabsContent value="camera" className="p-6 space-y-6 overflow-auto flex-1">
                    <div className="text-center">
                      <div className="p-4 bg-indigo-500/10 rounded-2xl inline-block mb-4">
                        <Camera className="h-16 w-16 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        التحكم بالمنصة عبر لغة الإشارة
                      </h3>
                      <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                        افتح الكاميرا واستخدم إيماءات يدك للتحكم بالمنصة. 
                        سيتم تحويل إشاراتك إلى نص عربي تلقائياً.
                      </p>
                      
                      <Button
                        size="lg"
                        onClick={() => setShowCamera(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      >
                        <Camera className="ml-2 h-5 w-5" />
                        تفعيل الكاميرا
                      </Button>
                    </div>

                    {detectedGestures.length > 0 && (
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <h4 className="text-lg font-bold text-white mb-3">الإيماءات المكتشفة:</h4>
                        <div className="flex flex-wrap gap-2">
                          {detectedGestures.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-indigo-500/20 px-3 py-2 rounded-lg flex items-center gap-2"
                            >
                              <span className="text-xl">{item.gesture}</span>
                              <span className="text-white">{item.text}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">☝️</div>
                        <div className="text-white font-medium">التمرير للأعلى</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">👍</div>
                        <div className="text-white font-medium">تأكيد / نقر</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">✋</div>
                        <div className="text-white font-medium">إيقاف</div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* تبويب الأوامر */}
                  <TabsContent value="commands" className="p-6 overflow-auto flex-1">
                    <div className="grid md:grid-cols-2 gap-4">
                      {gestureCommands.map((cmd, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-slate-800/50 rounded-xl p-4 flex items-start gap-4 hover:bg-slate-800/70 transition-colors"
                        >
                          <div className="text-4xl">{cmd.gesture}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-bold">{cmd.name}</h4>
                              <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-sm">
                                {cmd.action}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mt-1">{cmd.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* تبويب التحويل */}
                  <TabsContent value="convert" className="p-6 space-y-6 overflow-auto flex-1">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">تحويل النص إلى لغة الإشارة</h3>
                      <Textarea
                        value={textToConvert}
                        onChange={(e) => setTextToConvert(e.target.value)}
                        placeholder="اكتب النص الذي تريد تحويله..."
                        className="min-h-[100px] bg-slate-800/50 border-indigo-500/30 text-white"
                      />
                      <Button 
                        onClick={handleTextToSign} 
                        disabled={isConverting || !textToConvert.trim()}
                        className="mt-3"
                      >
                        {isConverting ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري التحويل...
                          </>
                        ) : (
                          <>
                            <Hand className="ml-2 h-4 w-4" />
                            تحويل إلى إشارات
                          </>
                        )}
                      </Button>
                    </div>

                    {convertedSigns.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 rounded-xl p-6"
                      >
                        <h4 className="text-white font-bold mb-4">الإشارات:</h4>
                        <div className="flex flex-wrap gap-4 text-5xl">
                          {convertedSigns.map((sign, index) => (
                            <motion.span
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {sign}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>

                  {/* تبويب القاموس */}
                  <TabsContent value="dictionary" className="p-6 overflow-hidden flex flex-col flex-1">
                    {/* البحث والفلترة */}
                    <div className="mb-4 space-y-3 flex-shrink-0">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ابحث عن كلمة..."
                          className="pr-10 bg-slate-800/50 border-indigo-500/30 text-white"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={selectedCategory === null ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setSelectedCategory(null)}
                        >
                          الكل ({signDictionary.length})
                        </Badge>
                        {categories.map(category => (
                          <Badge
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category} ({signDictionary.filter(i => i.category === category).length})
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <ScrollArea className="flex-1">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-4">
                        {filteredDictionary.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: Math.min(index * 0.02, 0.5) }}
                            className="bg-slate-800/50 rounded-xl p-3 text-center hover:bg-slate-800/70 transition-colors cursor-pointer group"
                            onClick={() => speakText(item.word)}
                          >
                            <div className="text-4xl mb-2">{item.gesture}</div>
                            <div className="text-white font-bold text-sm">{item.word}</div>
                            <div className="text-indigo-400 text-xs">{item.category}</div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs"
                            >
                              <Volume2 className="h-3 w-3 ml-1" />
                              نطق
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <SignLanguageCamera
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onGestureDetected={handleGestureDetected}
      />
    </>
  );
};

export default SignLanguageGuide;
