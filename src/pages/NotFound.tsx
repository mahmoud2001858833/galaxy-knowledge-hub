import React, { useEffect } from "react";
import { useLocation, useNavigate, useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw, Home, Compass, Atom, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeError = useRouteError();

  const is404 = routeError ? (isRouteErrorResponse(routeError) && routeError.status === 404) : true;
  const errorMessage = routeError 
    ? (isRouteErrorResponse(routeError) ? routeError.statusText : (routeError as any)?.message || 'خطأ في تشغيل المكون البرمجي') 
    : null;

  useEffect(() => {
    if (is404) {
      console.warn("404 Route Not Found:", location.pathname);
    } else {
      console.error("Platform Caught Route/Render Error:", routeError);
    }
  }, [location.pathname, is404, routeError]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white px-4 sm:px-6 py-12 relative overflow-hidden font-sans"
      dir="rtl"
    >
      {/* Background architectural pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.25) 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
        
        {/* Emblem / Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
          {is404 ? (
            <span className="text-2xl font-black font-mono">404</span>
          ) : (
            <AlertCircle className="w-8 h-8 text-amber-500" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {is404 ? 'الصفحة غير موجودة' : 'عذراً، حدث خطأ غير متوقع'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {is404 
              ? 'عذراً، المسار الذي تحاول الوصول إليه غير متاح أو تم نقله. يمكنك العودة إلى الصفحة الرئيسية أو استكشاف الأقسام التعليمية.'
              : 'حدث استثناء غير متوقع أثناء معالجة الصفحة. تم تسجيل الخطأ داخلياً، ويمكنك إعادة المحاولة الآن.'
            }
          </p>
          {errorMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 dir-ltr text-left overflow-x-auto">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => window.location.href = '/'}
            className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex-1 h-11 rounded-xl border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث الصفحة</span>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            أقسام مقترحة للزيارة
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/experiments-section"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
            >
              <Atom className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>المختبرات 3D</span>
            </Link>
            <Link
              to="/damij"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>منصة دامج</span>
            </Link>
            <Link
              to="/robotics-section"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>الروبوتات و AI</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
