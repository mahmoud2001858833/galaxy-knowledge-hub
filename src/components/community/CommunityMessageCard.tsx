import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Pin,
  ThumbsUp,
  Lightbulb,
  HelpCircle,
  Award,
  ExternalLink,
  Flag,
  Share2,
  CheckCircle2,
  X,
  Maximize2,
  Atom,
  Bot,
  BookOpen,
  Sparkles,
  BookMarked,
  HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CommunityMessage } from '@/types/communityChat';

interface CommunityMessageCardProps {
  message: CommunityMessage;
  onReact: (messageId: string, reactionType: 'thumbsUp' | 'inspiring' | 'question' | 'brilliant') => void;
  onReport: (messageId: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  simulations: Atom,
  robotics: Bot,
  curriculum: BookOpen,
  ai: Sparkles,
  journal: BookMarked,
  damij: HeartPulse
};

export const CommunityMessageCard: React.FC<CommunityMessageCardProps> = ({
  message,
  onReact,
  onReport
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);

  const handleShareMessage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/community#${message.id}`);
      toast({
        title: '🔗 تم نسخ رابط المشاركة',
        description: 'يمكنك الآن مشاركة هذا المنشور مع زملائك.'
      });
    }
  };

  const Icon = message.platformMention
    ? CATEGORY_ICONS[message.platformMention.categoryKey] || Sparkles
    : Sparkles;

  return (
    <motion.div
      id={message.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border p-5 sm:p-6 transition-all space-y-4 ${
        message.isPinned
          ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-400/40 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={message.studentAvatar}
            alt={message.studentName}
            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {message.studentName}
              </h4>
              <Badge variant="secondary" className="text-[10px] font-semibold">
                {message.studentRole}
              </Badge>
              {message.isPinned && (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  <Pin className="w-3 h-3 text-blue-500" />
                  مثبت بالإدارة
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{message.studentGrade}</span>
              <span>•</span>
              <span className="font-mono text-[11px]">{message.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShareMessage}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 h-8 px-2 rounded-xl"
            title="مشاركة المنشور"
          >
            <Share2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReport(message.id)}
            className="text-slate-400 hover:text-red-500 h-8 px-2 rounded-xl"
            title="إبلاغ الإدارة عن مخالفة"
          >
            <Flag className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Message Text */}
      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
        {message.content}
      </p>

      {/* Attached Image / Photo (if present) */}
      {message.imageUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-lg group">
          <img
            src={message.imageUrl}
            alt="مرفق الطالب"
            className="w-full max-h-72 object-cover object-center cursor-pointer group-hover:scale-102 transition-transform duration-300"
            onClick={() => setIsImageLightboxOpen(true)}
          />
          <button
            onClick={() => setIsImageLightboxOpen(true)}
            className="absolute bottom-2 end-2 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl text-xs flex items-center gap-1 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>تكبير الصورة</span>
          </button>
        </div>
      )}

      {/* Interactive Platform Resource Mention Card (Clickable Deep Link) */}
      {message.platformMention && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-cyan-500/10 border border-blue-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
              مورد مشار إليه في المنصة (@Mention):
            </span>
            <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-600 dark:text-blue-400">
              {message.platformMention.badge}
            </Badge>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-black text-sm text-slate-900 dark:text-white truncate">
                {message.platformMention.title}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 line-clamp-2">
                {message.platformMention.summary}
              </p>
            </div>
          </div>

          {/* Interactive Navigation Button */}
          <div className="pt-1">
            <Button
              size="sm"
              onClick={() => {
                navigate(message.platformMention!.route);
                toast({
                  title: `🚀 جاري الانتقال إلى: ${message.platformMention!.title}`,
                  description: 'فتح بيئة المحاكاة التفاعلية المحددة في المنصة.'
                });
              }}
              className="w-full sm:w-auto text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 shadow-sm"
            >
              <span>انتقل الآن إلى هذه المحاكاة / القسم</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Reactions Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onReact(message.id, 'thumbsUp')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-mono">{message.reactions.thumbsUp}</span>
        </button>

        <button
          onClick={() => onReact(message.id, 'inspiring')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-mono">{message.reactions.inspiring}</span>
          <span className="text-[10px] text-slate-400">ملهم</span>
        </button>

        <button
          onClick={() => onReact(message.id, 'question')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
          <span className="font-mono">{message.reactions.question}</span>
          <span className="text-[10px] text-slate-400">سؤال</span>
        </button>

        <button
          onClick={() => onReact(message.id, 'brilliant')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
        >
          <Award className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-mono">{message.reactions.brilliant}</span>
          <span className="text-[10px] text-slate-400">حل رائع</span>
        </button>
      </div>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {isImageLightboxOpen && message.imageUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImageLightboxOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] z-10"
            >
              <img
                src={message.imageUrl}
                alt="معاينة الصورة"
                className="max-h-[85vh] max-w-full rounded-3xl object-contain shadow-2xl"
              />
              <button
                onClick={() => setIsImageLightboxOpen(false)}
                className="absolute top-3 end-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
