import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { platformSettings, type PlatformSettings } from '@/services/platformSettingsService';
import { 
  Building2, 
  Mail, 
  MapPin, 
  Globe, 
  ExternalLink, 
  Heart, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Accessibility
} from 'lucide-react';
import { openAccessibilityModal } from '@/components/accessibility/AccessibilityPanel';

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>(() => platformSettings.getSettings());

  useEffect(() => {
    const handleUpdate = (e: CustomEvent<PlatformSettings>) => {
      setSettings(e.detail || platformSettings.getSettings());
    };

    window.addEventListener('galaxy_platform_settings_updated' as any, handleUpdate);
    return () => {
      window.removeEventListener('galaxy_platform_settings_updated' as any, handleUpdate);
    };
  }, []);

  return (
    <footer className="bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300 mt-auto text-slate-700 dark:text-slate-300 relative z-20">
      <div className="container mx-auto py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-right" dir="rtl">
          {/* Col 1: Platform Branding & Attribution */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {settings.siteName}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {settings.tagline}
            </p>
            <div className="pt-2 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-start gap-1.5">
              <Building2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{settings.schoolAttribution}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-500" />
              <span>أقسام المنصة السريعة</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/institutional-partnerships"
                  className="hover:text-blue-600 dark:hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 group font-bold text-blue-600 dark:text-cyan-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>الشراكة المؤسسية والاعتماد</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 font-bold border border-blue-500/20">
                    جديد
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/security-report"
                  className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 group font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>مستوى الأمان وقوة التحمل</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/20 font-mono">
                    درع A+ (120k+)
                  </span>
                </Link>
              </li>
              {(settings?.footerLinks || []).slice(0, 4).map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.url}
                    className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-cyan-500 transition-colors" />
                    <span>{link.title}</span>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-bold border border-cyan-500/20">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Academic & Specialized Hubs */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>المختبرات والمراجع</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {(settings?.footerLinks || []).slice(4).map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.url}
                    className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-cyan-500 transition-colors" />
                    <span>{link.title}</span>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-300 font-bold border border-teal-500/20">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/admin"
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>لوحة الإدارة الفائقة</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3.5">
              بيانات التواصل والمعلومات
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span dir="ltr" className="font-mono">{settings.contactEmail}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
            </div>

            {/* Competition Badge */}
            {settings.showCompetitionBadge && (
              <div className="pt-2">
                <Link
                  to={settings.competitionBadgeUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all shadow-sm"
                >
                  <span>{settings.competitionBadgeText}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right" dir="rtl">
          <div>
            © {settings.copyrightYear} {settings.siteName}. جميع الحقوق محفوظة — {settings.developedBy}.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={openAccessibilityModal}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 font-semibold"
            >
              <span>إمكانية الوصول والشمولية</span>
            </button>
            <span>•</span>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">تواصل معنا</Link>
            <span>•</span>
            <Link to="/super-admin-control-hub" className="hover:text-amber-600 transition-colors">لوحة الأدمن</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">الخصوصية والشروط</Link>
            <span>•</span>
            <Link
              to="/security-report"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all font-bold text-xs group"
              title="تقرير مستوى حماية المنصة وقوة التحمل"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>درع الحماية A+ وقوة التحمل: 120k+ مستخدم</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;