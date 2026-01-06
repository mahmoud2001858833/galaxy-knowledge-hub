import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accessibility,
  Volume2,
  Mic,
  Hand,
  ZoomIn,
  Contrast,
  Settings,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SignLanguageGuide from './SignLanguageGuide';

interface AccessibilityPanelProps {
  className?: string;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ className }) => {
  const { settings, updateSettings, resetSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [showSignLanguageGuide, setShowSignLanguageGuide] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'transition-transform hover:scale-110',
            className
          )}
          title="إعدادات الوصول"
        >
          <Accessibility className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 overflow-y-auto" dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-right">
            <Accessibility className="h-5 w-5" />
            إعدادات الوصول
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* وضع الوصول */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              وضع الوصول
            </Label>
            <Select
              value={settings.accessibilityMode}
              onValueChange={(value: any) => updateSettings({ accessibilityMode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">عادي</SelectItem>
                <SelectItem value="visual">ضعاف البصر</SelectItem>
                <SelectItem value="hearing">ضعاف السمع</SelectItem>
                <SelectItem value="motor">صعوبات حركية</SelectItem>
                <SelectItem value="cognitive">صعوبات التعلم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* حجم الخط */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              حجم الخط
            </Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: any) => updateSettings({ fontSize: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">صغير</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="large">كبير</SelectItem>
                <SelectItem value="xl">كبير جداً</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* التحكم بالسرعة */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                سرعة القراءة
              </span>
              <span className="text-sm text-muted-foreground">
                {settings.readingSpeed}x
              </span>
            </Label>
            <Slider
              value={[settings.readingSpeed]}
              onValueChange={([value]) => updateSettings({ readingSpeed: value })}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* الصوت المفضل */}
          <div className="space-y-2">
            <Label>الصوت المفضل</Label>
            <Select
              value={settings.preferredVoice}
              onValueChange={(value: any) => updateSettings({ preferredVoice: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female-ar">أنثى - عربي</SelectItem>
                <SelectItem value="male-ar">ذكر - عربي</SelectItem>
                <SelectItem value="female-en">أنثى - إنجليزي</SelectItem>
                <SelectItem value="male-en">ذكر - إنجليزي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-px bg-border" />

          {/* التبديلات */}
          <div className="space-y-4">
            {/* قراءة النص */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Volume2 className="h-4 w-4" />
                  قراءة النص تلقائياً
                </Label>
                <Switch
                  checked={settings.textToSpeech}
                  onCheckedChange={(checked) => updateSettings({ textToSpeech: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                عند التفعيل: مرر الماوس على أي كلمة لسماع نطقها
              </p>
            </div>

            {/* الإدخال الصوتي */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Mic className="h-4 w-4" />
                  الإدخال الصوتي
                </Label>
                <Switch
                  checked={settings.voiceInput}
                  onCheckedChange={(checked) => updateSettings({ voiceInput: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                عند التفعيل: يظهر زر 🎤 في جميع المساعدات الذكية
              </p>
            </div>

            {/* لغة الإشارة */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Hand className="h-4 w-4" />
                  لغة الإشارة
                </Label>
                <Switch
                  checked={settings.signLanguage}
                  onCheckedChange={(checked) => {
                    updateSettings({ signLanguage: checked });
                    if (checked) {
                      setShowSignLanguageGuide(true);
                    }
                  }}
                />
              </div>
              {settings.signLanguage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setShowSignLanguageGuide(true)}
                >
                  <Hand className="h-3 w-3 ml-1" />
                  عرض دليل لغة الإشارة
                </Button>
              )}
            </div>

            {/* التباين العالي */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Contrast className="h-4 w-4" />
                تباين عالي
              </Label>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
              />
            </div>

            {/* تقليل الحركة */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer">
                تقليل الحركة
              </Label>
              <Switch
                checked={settings.reduceMotion}
                onCheckedChange={(checked) => updateSettings({ reduceMotion: checked })}
              />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* زر إعادة التعيين */}
          <Button
            variant="outline"
            className="w-full"
            onClick={resetSettings}
          >
            <RotateCcw className="h-4 w-4 ml-2" />
            إعادة تعيين الإعدادات
          </Button>
        </div>
      </SheetContent>

      {/* دليل لغة الإشارة */}
      <SignLanguageGuide 
        isOpen={showSignLanguageGuide} 
        onClose={() => setShowSignLanguageGuide(false)} 
      />
    </Sheet>
  );
};
