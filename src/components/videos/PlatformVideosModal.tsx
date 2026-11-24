import React, { useState } from 'react';
import { Play, Film, School, Sparkles, Download, Maximize2, CheckCircle2, ChevronDown, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PlatformVideo {
  id: string;
  order: number;
  orderLabel: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  tagColor: string;
  src: string;
  fallbackSrc: string;
  size: string;
  resolution: string;
  icon: React.ElementType;
}

export const PLATFORM_VIDEOS: PlatformVideo[] = [
  {
    id: 'official-film-3',
    order: 1,
    orderLabel: 'الفيلم الأول',
    title: 'الفيلم الرسمي لمنصة ذروة العلم 3.0',
    subtitle: 'العرض التعريفي المؤسسي الشامل للإصدار الثالث',
    description: 'العرض الرسمي والاستعراضي الشامل لمنصة ذروة العلم الإصدار 3.0: استعراض شامل للمختبرات الافتراضية، ومحركات الذكاء الاصطناعي، ومبادرات الاستدامة، وحلول الفصول الذكية المعتمدة.',
    badge: 'الفيلم الأول • رسمي',
    tagColor: 'from-blue-600 to-indigo-600',
    src: '/videos/Zarwat_AlIlm_3.0_Official_Film.mp4',
    fallbackSrc: '/videos/Zarwat_AlIlm_3.0_Official_Film.mp4',
    size: '80 ميغابايت (FHD فائق السرعة)',
    resolution: 'Full HD 1080p',
    icon: Sparkles,
  },
  {
    id: 'school-visit-film',
    order: 2,
    orderLabel: 'الفيلم الثاني',
    title: 'فيلم الزيارة الميدانية وتطبيق المنصة في المدارس',
    subtitle: 'التوثيق الميداني الواقعي لتفاعل الطلبة والمعلمين',
    description: 'توثيق حي وميداني لزيارة المدارس الأردنية وتجربة الطلبة والمعلمين للمنصة داخل الفصول والغرف الصفية والمختبرات، واستعراض أثر التعلم التفاعلي والذكاء الاصطناعي على أرض الواقع.',
    badge: 'الفيلم الثاني • ميداني',
    tagColor: 'from-emerald-600 to-teal-600',
    src: '/videos/Zarwat_AlIlm_School_Visit_Film.mp4',
    fallbackSrc: '/videos/Zarwat_AlIlm_School_Visit_Film.mp4',
    size: '33 ميغابايت (FHD فائق السرعة)',
    resolution: 'Full HD 1080p',
    icon: School,
  },
];

interface PlatformVideosModalProps {
  className?: string;
  variant?: 'nav-pill' | 'button' | 'compact';
}

export const PlatformVideosModal: React.FC<PlatformVideosModalProps> = ({
  className,
  variant = 'nav-pill',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string>(PLATFORM_VIDEOS[0].id);
  const [videoError, setVideoError] = useState(false);

  const activeVideo = PLATFORM_VIDEOS.find((v) => v.id === activeVideoId) || PLATFORM_VIDEOS[0];

  const handleOpenVideo = (videoId: string) => {
    setActiveVideoId(videoId);
    setVideoError(false);
    setIsOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm transition-all duration-300 select-none",
              "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white",
              "shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]",
              "border border-white/20",
              className
            )}
            title="فيديوهات المنصة الرسمية والتوثيقية"
            aria-label="فيديوهات المنصة"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <Film className="w-3.5 h-3.5 text-white/90 group-hover:rotate-6 transition-transform" />
            <span className="hidden tracking-tight sm:inline">فيديوهات المنصة</span>
            <ChevronDown className="w-3 h-3 text-white/70 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-80 sm:w-88 p-2 rounded-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white"
        >
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 text-xs font-black text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              الأفلام الوثائقية والرسمية للمنصة
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800/40 font-mono">
              FHD 1080p
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

          {PLATFORM_VIDEOS.map((video) => {
            const Icon = video.icon;
            return (
              <DropdownMenuItem
                key={video.id}
                onClick={() => handleOpenVideo(video.id)}
                className="group/item flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors my-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md bg-gradient-to-br",
                    video.tagColor
                  )}
                >
                  <Play className="w-4 h-4 fill-white mr-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {video.orderLabel}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {video.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {video.subtitle}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
          <DropdownMenuItem
            onClick={() => handleOpenVideo(PLATFORM_VIDEOS[0].id)}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl cursor-pointer text-xs font-bold text-center bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 dark:text-cyan-300 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>فتح صالة العرض السينمائية الكاملة</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cinematic Modal Player */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl w-[96vw] max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-950/98 border border-slate-800 text-white backdrop-blur-2xl rounded-3xl shadow-2xl">
          <DialogHeader className="space-y-2 text-right">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>صالة عرض أفلام ذروة العلم</span>
                    <Badge className="bg-blue-500/20 text-cyan-300 border border-blue-400/30 font-bold text-[10px]">
                      FHD 1080p
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    أفلام وثائقية رسمية وتوثيق ميداني حصري عالي الدقة لمنصة ذروة العلم
                  </DialogDescription>
                </div>
              </div>

              {/* Selector Tabs for the 2 Videos */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
                {PLATFORM_VIDEOS.map((video) => {
                  const isActive = video.id === activeVideo.id;
                  const Icon = video.icon;
                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => {
                        setActiveVideoId(video.id);
                        setVideoError(false);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{video.orderLabel}</span>
                      {isActive && <CheckCircle2 className="w-3 h-3 text-cyan-300 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </DialogHeader>

          {/* Video Player Container */}
          <div className="relative mt-2 rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group min-h-[240px] sm:min-h-[380px] flex items-center justify-center">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-cyan-600/20 blur-xl opacity-60 -z-10" />

            {videoError ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Film className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">تحديث بيانات تشغيل الفيديو</h4>
                <p className="text-xs text-slate-300 max-w-md">
                  يمكنك النقر أدناه لإعادة تشغيل الفيديو أو تحميله مباشرة بجودة فائقة.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => setVideoError(false)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    إعادة المحاولة
                  </Button>
                  <a
                    href={activeVideo.src}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل مباشر</span>
                  </a>
                </div>
              </div>
            ) : (
              <video
                key={activeVideo.src}
                controls
                autoPlay
                playsInline
                className="w-full aspect-video max-h-[62vh] bg-black object-contain mx-auto"
                preload="auto"
                onError={() => setVideoError(true)}
              >
                <source src={activeVideo.src} type="video/mp4" />
                عذراً، متصفحك لا يدعم تشغيل الفيديو المباشر. يمكنك تحميل الملف أدناه.
              </video>
            )}
          </div>

          {/* Video Meta & Action Footer */}
          <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("text-white font-bold text-xs bg-gradient-to-r", activeVideo.tagColor)}>
                  {activeVideo.badge}
                </Badge>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {activeVideo.resolution} • {activeVideo.size}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {activeVideo.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-medium">
                {activeVideo.description}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
              <a
                href={activeVideo.src}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل الفيديو</span>
              </a>

              {activeVideo.order === 1 ? (
                <Button
                  onClick={() => setActiveVideoId(PLATFORM_VIDEOS[1].id)}
                  size="sm"
                  className="rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20"
                >
                  <School className="w-3.5 h-3.5 ml-1.5" />
                  الانتقال لفيلم الزيارة المدرسية
                </Button>
              ) : (
                <Button
                  onClick={() => setActiveVideoId(PLATFORM_VIDEOS[0].id)}
                  size="sm"
                  className="rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                  الانتقال للفيلم الرسمي 3.0
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlatformVideosModal;
