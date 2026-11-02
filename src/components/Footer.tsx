import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import { platformSettings, type PlatformSettings } from '@/services/platformSettingsService';
import { openAccessibilityModal } from '@/components/accessibility/AccessibilityPanel';
import { CORE_SECTIONS, FUTURE_PROJECTS_PATH } from '@/config/platformSections';

/** Site footer. Section links come from src/config/platformSections.ts, colors from the design tokens. */

const linkClass = 'text-muted-foreground transition-colors hover:text-foreground';

const MORE_LINKS = [
  { title: 'مشاريع مستقبلية', to: FUTURE_PROJECTS_PATH },
  { title: 'الشراكات المؤسسية', to: '/institutional-partnerships' },
  { title: 'تواصل معنا', to: '/contact' },
  { title: 'الخصوصية والشروط', to: '/privacy' },
];

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
    <footer className="relative z-20 mt-auto border-t border-border bg-card text-card-foreground" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-10 grid grid-cols-1 gap-8 text-right sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-black">{settings.siteName}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{settings.tagline}</p>
            <p className="flex items-start gap-1.5 pt-1 text-xs font-semibold text-primary">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{settings.schoolAttribution}</span>
            </p>
          </div>

          <nav aria-label="أقسام المنصة">
            <h4 className="mb-3.5 text-sm font-bold">أقسام المنصة</h4>
            <ul className="space-y-2 text-sm">
              {CORE_SECTIONS.map((s) => (
                <li key={s.id}>
                  <Link to={s.path} className={linkClass}>
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="روابط أخرى">
            <h4 className="mb-3.5 text-sm font-bold">المزيد</h4>
            <ul className="space-y-2 text-sm">
              {MORE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3">
            <h4 className="mb-3.5 text-sm font-bold">تواصل معنا</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${(settings.contactPhone || '0796830150').replace(/\s+/g, '')}`} className="transition-colors hover:text-foreground" dir="ltr">
                  {settings.contactPhone || '0796830150'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span dir="ltr">{settings.contactEmail}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span>{settings.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-right">
          <div>
            © {settings.copyrightYear} {settings.siteName}. جميع الحقوق محفوظة — {settings.developedBy}.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={openAccessibilityModal} className={`${linkClass} font-semibold`}>
              إمكانية الوصول
            </button>
            <Link to="/admin" className={linkClass}>
              لوحة الإدارة
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
