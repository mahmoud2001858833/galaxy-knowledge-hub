import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibility, FontSize, PreferredVoice } from '@/contexts/AccessibilityContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Accessibility,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Hand,
  ZoomIn,
  Contrast,
  Settings,
  RotateCcw,
  Eye,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  Pause,
  Move,
  SlidersHorizontal,
  BookOpen,
  Layers,
  Type,
  ExternalLink,
  MousePointer2,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const openAccessibilityModal = () => {
  window.dispatchEvent(new CustomEvent('galaxy_open_accessibility'));
};

export const AccessibilityPanel: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    speakText, 
    stopSpeaking, 
    isSpeaking,
    activeFeaturesCount 
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'vision' | 'audio' | 'focus' | 'inputs'>('vision');
  const [mouseY, setMouseY] = useState(300);
  const navigate = useNavigate();

  // Listen for open trigger from Navbar or Footer
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('galaxy_open_accessibility', handleOpen);
    return () => window.removeEventListener('galaxy_open_accessibility', handleOpen);
  }, []);

  // Track mouse position for the Reading Ruler (only when active)
  useEffect(() => {
    if (!settings.readingGuide) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings.readingGuide]);

  // Test Speech Sample
  const handleTestVoice = () => {
    toast.info('🔊 جاري تشغيل عينة صوتية تجريبية...');
    speakText('مرحباً بك في منصة ذروة العلم. تم تفعيل الصوت المفضل وسرعة القراءة المحددة بنجاح.');
  };

  // Turn everything OFF
  const handleResetAll = () => {
    resetSettings();
    toast.success('🔄 تم إطفاء كافة إعدادات الوصول واستعادة الوضع الطبيعي.');
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. MAIN ACCESSIBILITY CONFIGURATION SHEET / MODAL        */}
      {/* ======================================================== */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="w-full sm:max-w-md md:max-w-lg overflow-y-auto p-0 bg-slate-950/98 text-slate-100 border-r border-slate-800 backdrop-blur-2xl" 
          dir="rtl"
          data-no-tts="true"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                  <Accessibility className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white">
                    إعدادات إمكانية الوصول والشمولية
                  </h3>
                  <p className="text-xs text-slate-400">
                    التحكم الشامل بخصائص الرؤية، القراءة الصوتية، وتسهيل التصفح
                  </p>
                </div>
              </div>
            </div>

            {/* Active Status Banner */}
            <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                حالة المنظومة:
              </span>
              {activeFeaturesCount === 0 ? (
                <Badge variant="outline" className="border-slate-700 bg-slate-800/80 text-slate-300 font-medium text-[11px]">
                  ✓ كافة الميزات مطفأة (الوضع الطبيعي)
                </Badge>
              ) : (
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[11px] font-bold animate-pulse">
                  ⚡ {activeFeaturesCount} ميزات نشطة الآن
                </Badge>
              )}
            </div>

            {/* Category Navigation Pills */}
            <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
              <button
                onClick={() => setActiveCategory('vision')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border ${
                  activeCategory === 'vision'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                }`}
              >
                الرؤية والتباين
              </button>
              <button
                onClick={() => setActiveCategory('audio')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border ${
                  activeCategory === 'audio'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                }`}
              >
                الصوت والنطق
              </button>
              <button
                onClick={() => setActiveCategory('focus')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border ${
                  activeCategory === 'focus'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                }`}
              >
                التركيز والحركة
              </button>
              <button
                onClick={() => setActiveCategory('inputs')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border ${
                  activeCategory === 'inputs'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                }`}
              >
                المدخلات الذكية
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* ========================================= */}
            {/* CATEGORY 1: VISION & CONTRAST             */}
            {/* ========================================= */}
            {activeCategory === 'vision' && (
              <div className="space-y-4">
                {/* 1. High Contrast */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer font-bold text-white text-sm">
                      <Contrast className="h-4 w-4 text-amber-400" />
                      وضع التباين العالي (High Contrast)
                    </Label>
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => {
                        updateSettings({ highContrast: checked });
                        if (checked) toast.success('تم تفعيل وضع التباين العالي');
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يحول الألوان إلى خلفيات سوداء نقية مع نصوص فائقة السطوع وأطر صفراء واضحة لإراحة ضعاف البصر.
                  </p>
                </div>

                {/* 2. Highlight Links */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer font-bold text-white text-sm">
                      <Type className="h-4 w-4 text-cyan-400" />
                      تمييز وتسطير الروابط والأزرار
                    </Label>
                    <Switch
                      checked={settings.highlightLinks}
                      onCheckedChange={(checked) => updateSettings({ highlightLinks: checked })}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يضع خطاً مميزاً بلون ساطع تحت كافة الروابط والأزرار التفاعلية لتسهيل التعرف عليها ونقرها.
                  </p>
                </div>

                {/* 3. Font Size Scaling */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <Label className="flex items-center justify-between font-bold text-white text-sm">
                    <span className="flex items-center gap-2">
                      <ZoomIn className="h-4 w-4 text-emerald-400" />
                      حجم الخط العام (Text Scaling)
                    </span>
                    <span className="font-mono text-cyan-400 text-xs">
                      {settings.fontSize === 'medium' ? 'عادي (100%)' : settings.fontSize === 'large' ? 'كبير (112%)' : settings.fontSize === 'xl' ? 'كبير جداً (125%)' : 'صغير'}
                    </span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateSettings({ fontSize: 'medium' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        settings.fontSize === 'medium'
                          ? 'bg-cyan-600 text-white border-cyan-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      عادي (افتراضي)
                    </button>
                    <button
                      onClick={() => updateSettings({ fontSize: 'large' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        settings.fontSize === 'large'
                          ? 'bg-cyan-600 text-white border-cyan-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      كبير (112%)
                    </button>
                    <button
                      onClick={() => updateSettings({ fontSize: 'xl' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        settings.fontSize === 'xl'
                          ? 'bg-cyan-600 text-white border-cyan-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      كبير جداً (125%)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* CATEGORY 2: AUDIO & SPEECH                */}
            {/* ========================================= */}
            {activeCategory === 'audio' && (
              <div className="space-y-4">
                {/* 1. Interactive TTS Hover Reader */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer font-bold text-white text-sm">
                      <Volume2 className="h-4 w-4 text-cyan-400" />
                      القارئ الصوتي التفاعلي (Hover Reader)
                    </Label>
                    <Switch
                      checked={settings.textToSpeech}
                      onCheckedChange={(checked) => {
                        updateSettings({ textToSpeech: checked });
                        if (checked) {
                          toast.success('🔊 تم تفعيل القارئ الصوتي التفاعلي! مرر الماوس فوق أي نص لسماعه.');
                        } else {
                          stopSpeaking();
                          toast.info('تم إيقاف القارئ الصوتي.');
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    عند التفعيل: مرر الفأرة فوق أي فقرة أو عنوان في المنصة لسماع قراءتها بصوت عربي طبيعي مع تظليل النص بصرياً.
                  </p>
                </div>

                {/* 2. Reading Speed Slider */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                      سرعة القراءة الصوتية
                    </span>
                    <span className="font-mono font-bold text-cyan-400">{settings.readingSpeed}x</span>
                  </div>
                  <Slider
                    value={[settings.readingSpeed]}
                    min={0.7}
                    max={1.6}
                    step={0.1}
                    onValueChange={([val]) => updateSettings({ readingSpeed: Number(val.toFixed(1)) })}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>بطيء (0.7x)</span>
                    <span>معتدل (1.0x)</span>
                    <span>سريع (1.6x)</span>
                  </div>
                </div>

                {/* 3. Preferred Voice */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <Label className="font-bold text-white text-xs block">نبرة الصوت المفضل:</Label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'female-ar', label: 'صوت أنثى (عربي)' },
                      { id: 'male-ar', label: 'صوت ذكر (عربي)' },
                      { id: 'female-en', label: 'Female (English)' },
                      { id: 'male-en', label: 'Male (English)' },
                    ].map(v => (
                      <button
                        key={v.id}
                        onClick={() => updateSettings({ preferredVoice: v.id as PreferredVoice })}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                          settings.preferredVoice === v.id
                            ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Voice Button */}
                <Button
                  variant="outline"
                  onClick={handleTestVoice}
                  className="w-full text-xs rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200 gap-1.5 h-9"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
                  <span>🔊 تجربة نطق الصوت الحالي</span>
                </Button>
              </div>
            )}

            {/* ========================================= */}
            {/* CATEGORY 3: FOCUS & COGNITIVE MOTION      */}
            {/* ========================================= */}
            {activeCategory === 'focus' && (
              <div className="space-y-4">
                {/* 1. Reading Ruler */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer font-bold text-white text-sm">
                      <Move className="h-4 w-4 text-cyan-400" />
                      مسطرة القراءة ودليل السطور (Reading Ruler)
                    </Label>
                    <Switch
                      checked={settings.readingGuide}
                      onCheckedChange={(checked) => {
                        updateSettings({ readingGuide: checked });
                        if (checked) toast.success('تم تفعيل مسطرة القراءة البصرية.');
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    شريط ضوئي يتبع مؤشر الفأرة أفقياً لتحديد السطر الحالي، يسهل التركيز لمن يعانون من التشتت (ADHD) أو صعوبات القراءة.
                  </p>
                </div>

                {/* 2. Dyslexia / Spacing */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer font-bold text-white text-sm">
                      <BookOpen className="h-4 w-4 text-emerald-400" />
                      مباعدة الأسطر للقراءة الميسرة (Dyslexia Friendly)
                    </Label>
                    <Switch
                      checked={settings.dyslexiaFont}
                      onCheckedChange={(checked) => updateSettings({ dyslexiaFont: checked })}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    مضاعفة التباعد بين السطور والكلمات لمنع ازدحام الحروف وتسهيل القراءة المطولة للكتب والمقالات.
                  </p>
                </div>

                {/* 3. Large Cursor */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer font-bold text-white text-sm">
                      <MousePointer2 className="h-4 w-4 text-amber-400" />
                      مؤشر الفأرة الكبير عالي الوضوح
                    </Label>
                    <Switch
                      checked={settings.largeCursor}
                      onCheckedChange={(checked) => updateSettings({ largeCursor: checked })}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    تكبير مؤشر الفأرة بلون فسفوري مضيء ومحدد ليسهل تتبعه بالعين في الشاشات العريضة.
                  </p>
                </div>

                {/* 4. Reduce Motion */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer font-bold text-white text-sm">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      تقليل الحركة والتأثيرات الانتقالية (Reduce Motion)
                    </Label>
                    <Switch
                      checked={settings.reduceMotion}
                      onCheckedChange={(checked) => updateSettings({ reduceMotion: checked })}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    إيقاف الحركات السريعة والانتقالات الدورانية لحماية المستخدمين من دوار الحركة أو التحسس البصري.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* CATEGORY 4: INPUTS & TOOLS                */}
            {/* ========================================= */}
            {activeCategory === 'inputs' && (
              <div className="space-y-4">
                {/* 1. Voice Input Widget */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer font-bold text-white text-sm">
                      <Mic className="h-4 w-4 text-rose-400" />
                      الإدخال الصوتي الذكي (Voice Dictation)
                    </Label>
                    <Switch
                      checked={settings.voiceInput}
                      onCheckedChange={(checked) => {
                        updateSettings({ voiceInput: checked });
                        if (checked) toast.success('تم إظهار أداة الإدخال الصوتي العائمة على الشاشة.');
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    تفعيل مايكروفون عائم ذكي لتحويل صوتك إلى نصوص فورية داخل المساعدات الذكية وحقول البحث.
                  </p>
                </div>

                {/* 2. Sign Language Tool */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer font-bold text-white text-sm">
                      <Hand className="h-4 w-4 text-emerald-400" />
                      مساعد لغة الإشارة (Sign Language Assistant)
                    </Label>
                    <Switch
                      checked={settings.signLanguage}
                      onCheckedChange={(checked) => {
                        updateSettings({ signLanguage: checked });
                        if (checked) toast.success('تم تفعيل أداة لغة الإشارة العائمة.');
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    تثبيت زر عائم للترجمة الفورية بلغة الإشارة بالذكاء الاصطناعي وقاموس لغة الإشارة الأردني والعربي.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/sign-language');
                    }}
                    className="w-full text-xs rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300 gap-1.5 h-8 mt-1"
                  >
                    <span>فتح مترجم لغة الإشارة الكامل</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-800 bg-slate-950 sticky bottom-0 z-10 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="text-xs rounded-xl border-slate-700 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/40 text-slate-400 h-9 gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 ml-1" />
              <span>إطفاء كافة الميزات</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-md shadow-cyan-600/20"
            >
              حفظ وإغلاق
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ======================================================== */}
      {/* 2. READING RULER OVERLAY (ACTIVE ONLY WHEN ON)           */}
      {/* ======================================================== */}
      {settings.readingGuide && (
        <div
          className="fixed left-0 right-0 pointer-events-none z-50 transition-all duration-75"
          style={{ top: `${Math.max(0, mouseY - 22)}px`, height: '44px' }}
        >
          <div className="w-full h-full border-y-2 border-cyan-400/70 bg-cyan-400/10 backdrop-blur-[1px] shadow-[0_0_20px_rgba(6,182,212,0.2)]" />
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. FLOATING TTS CONTROLLER (ACTIVE ONLY WHEN ON)         */}
      {/* ======================================================== */}
      {settings.textToSpeech && (
        <div 
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/95 border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-xl text-xs text-white"
          data-no-tts="true"
        >
          <div className="flex items-center gap-2 pr-1">
            <span className={`p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 ${isSpeaking ? 'animate-pulse' : ''}`}>
              <Volume2 className="w-4 h-4" />
            </span>
            <span className="font-bold text-[11px] max-w-[140px] truncate">
              {isSpeaking ? 'جاري القراءة الصوتية...' : 'مرر فوق أي نص لسماعه'}
            </span>
          </div>

          {isSpeaking && (
            <Button
              size="sm"
              variant="outline"
              onClick={stopSpeaking}
              className="h-7 px-2 text-[10px] rounded-lg border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              <Pause className="w-3 h-3 ml-1 text-amber-400" />
              إيقاف
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              updateSettings({ textToSpeech: false });
              stopSpeaking();
              toast.info('تم إيقاف القارئ الصوتي.');
            }}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white"
            title="إغلاق القارئ الصوتي"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FLOATING SIGN LANGUAGE WIDGET (ACTIVE ONLY WHEN ON)   */}
      {/* ======================================================== */}
      {settings.signLanguage && (
        <div 
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2"
          data-no-tts="true"
        >
          <Button
            onClick={() => navigate('/sign-language')}
            className="h-10 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-600/30 border border-emerald-400/40"
          >
            <Hand className="w-4 h-4" />
            <span>مترجم لغة الإشارة</span>
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => updateSettings({ signLanguage: false })}
            className="w-8 h-8 rounded-xl bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
            title="إخفاء زر لغة الإشارة"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FLOATING VOICE INPUT WIDGET (ACTIVE ONLY WHEN ON)     */}
      {/* ======================================================== */}
      {settings.voiceInput && (
        <div 
          className="fixed bottom-20 left-4 z-50 flex items-center gap-2 p-2 rounded-2xl bg-slate-900/95 border border-rose-500/40 shadow-xl backdrop-blur-xl text-xs"
          data-no-tts="true"
        >
          <div className="flex items-center gap-2 px-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] text-slate-300 font-bold">الإدخال الصوتي نشط 🎤</span>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => updateSettings({ voiceInput: false })}
            className="w-6 h-6 rounded-lg text-slate-400 hover:text-white"
            title="إخفاء الإدخال الصوتي"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </>
  );
};

export default AccessibilityPanel;
