import React, { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { VoiceToTextInput } from './VoiceToTextInput';
import { Mic, Camera, Hand, Keyboard, Send, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UniversalInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
  showSignLanguage?: boolean;
  showImageUpload?: boolean;
}

export const UniversalInput: React.FC<UniversalInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'اكتب سؤالك هنا...',
  isLoading = false,
  disabled = false,
  className,
  minHeight = '100px',
  showSignLanguage = true,
  showImageUpload = false,
}) => {
  const { settings } = useAccessibility();
  const [showLargeKeyboard, setShowLargeKeyboard] = useState(false);
  const [showSignLanguageDialog, setShowSignLanguageDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceTranscript = (text: string) => {
    onChange(value ? `${value} ${text}` : text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // لوحة مفاتيح كبيرة للمستخدمين ذوي الصعوبات الحركية
  const LargeKeyboard = () => {
    const arabicLetters = [
      ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
      ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
      ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
    ];

    const insertChar = (char: string) => {
      onChange(value + char);
    };

    return (
      <Dialog open={showLargeKeyboard} onOpenChange={setShowLargeKeyboard}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>لوحة المفاتيح الكبيرة</DialogTitle>
          </DialogHeader>
          <div className="space-y-2" dir="rtl">
            {arabicLetters.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1">
                {row.map((letter) => (
                  <Button
                    key={letter}
                    variant="outline"
                    className="w-12 h-12 text-xl font-bold"
                    onClick={() => insertChar(letter)}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                className="px-8 h-12"
                onClick={() => insertChar(' ')}
              >
                مسافة
              </Button>
              <Button
                variant="outline"
                className="px-4 h-12"
                onClick={() => onChange(value.slice(0, -1))}
              >
                حذف
              </Button>
              <Button
                variant="default"
                className="px-8 h-12"
                onClick={() => {
                  setShowLargeKeyboard(false);
                  onSubmit();
                }}
              >
                إرسال
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // حوار لغة الإشارة
  const SignLanguageDialog = () => (
    <Dialog open={showSignLanguageDialog} onOpenChange={setShowSignLanguageDialog}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hand className="h-5 w-5" />
            التواصل بلغة الإشارة
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground">
          <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>ميزة التعرف على لغة الإشارة</p>
          <p className="text-sm mt-2">قريباً - يتم العمل على هذه الميزة</p>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            'resize-none pr-4 pb-14 bg-background/50 border-border/50 focus:border-primary transition-colors',
            settings.fontSize === 'large' && 'text-lg',
            settings.fontSize === 'xl' && 'text-xl',
            settings.highContrast && 'border-2 border-foreground'
          )}
          style={{ minHeight }}
          dir="rtl"
        />

        {/* أزرار الإدخال المتعددة */}
        <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* زر الميكروفون */}
            {settings.voiceInput && (
              <VoiceToTextInput
                onTranscript={handleVoiceTranscript}
                language="ar"
                disabled={disabled || isLoading}
              />
            )}

            {/* زر لغة الإشارة */}
            {showSignLanguage && settings.signLanguage && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowSignLanguageDialog(true)}
                disabled={disabled || isLoading}
                title="لغة الإشارة"
              >
                <Hand className="h-4 w-4" />
              </Button>
            )}

            {/* زر لوحة المفاتيح الكبيرة */}
            {settings.accessibilityMode === 'motor' && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowLargeKeyboard(true)}
                disabled={disabled || isLoading}
                title="لوحة مفاتيح كبيرة"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            )}

            {/* زر رفع الصورة */}
            {showImageUpload && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled || isLoading}
                title="رفع صورة"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* زر الإرسال */}
          <Button
            type="submit"
            disabled={disabled || isLoading || !value.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                إرسال
                <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* مسح النص */}
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          className="text-muted-foreground"
        >
          <X className="h-3 w-3 ml-1" />
          مسح النص
        </Button>
      )}

      <LargeKeyboard />
      <SignLanguageDialog />
    </form>
  );
};
