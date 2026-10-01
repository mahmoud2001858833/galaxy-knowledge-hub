/**
 * Platform Settings & Footer Metadata Service
 * Controls all footer links, social media, contact info, and platform branding dynamically.
 */

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  category: 'quick' | 'academic' | 'special_ed' | 'legal';
  icon?: string;
  badge?: string;
  isExternal?: boolean;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'twitter' | 'youtube' | 'github' | 'linkedin' | 'telegram' | 'whatsapp';
  label: string;
  url: string;
  enabled: boolean;
}

export interface PlatformSettings {
  siteName: string;
  tagline: string;
  schoolAttribution: string;
  developedBy: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  copyrightYear: string;
  showCompetitionBadge: boolean;
  competitionBadgeText: string;
  competitionBadgeUrl: string;
  footerLinks: FooterLink[];
  socialLinks: SocialLink[];
  schoolName?: string;
  principalName?: string;
  officialEmail?: string;
  officialPhone?: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  siteName: 'منصة ذروة العلم',
  tagline: 'منصة تفاعلية للتعلم الذكي، المحاكاة ثلاثية الأبعاد، والذكاء الاصطناعي',
  schoolAttribution: 'تم إنشاء وتطوير المنصة بواسطة مدرسة عنبه الثانية الشاملة للبنين',
  developedBy: 'إشراف وتطوير نخبة من الأكاديميين والمبرمجين',
  contactEmail: 'contact@zarwat-alelm.edu.jo',
  contactPhone: '+962 7 9000 0000',
  address: 'المملكة الأردنية الهاشمية — إربد — لواء المزار الشمالي — عنبه',
  copyrightYear: '2026',
  showCompetitionBadge: true,
  competitionBadgeText: '🏆 مسابقة GJU 3030 للابتكار الرقمي',
  competitionBadgeUrl: '/gju-competition',
  footerLinks: [
    { id: '1', title: 'المختبرات والمحاكاة 3D', url: '/experiments-section', category: 'quick', badge: '49+' },
    { id: '2', title: 'مسارات التعليم والمهني BTEC', url: '/btec', category: 'special_ed', badge: 'جديد' },
    { id: '3', title: 'المكتبة العلمية والمصادر', url: '/spaced-repetition', category: 'academic', badge: 'SM-2 Pro' },
    { id: '4', title: 'مساعد فالك المعرفة الذكي', url: '/ai-assistant-section', category: 'academic' },
    { id: '5', title: 'قسم المدينة الذكية والابتكار', url: '/smart-city', category: 'quick' },
    { id: '6', title: 'تواصل معنا واستفسر', url: '/contact', category: 'quick' },
    { id: '7', title: 'سياسة الخصوصية والوصول الرقمي', url: '/privacy', category: 'legal' }
  ],
  socialLinks: [
    { id: 's1', platform: 'youtube', label: 'يوتيوب المنصة', url: 'https://youtube.com', enabled: true },
    { id: 's2', platform: 'facebook', label: 'صفحة فيسبوك', url: 'https://facebook.com', enabled: true },
    { id: 's3', platform: 'github', label: 'مستودع الكود والمشاريع', url: 'https://github.com', enabled: true },
    { id: 's4', platform: 'telegram', label: 'قناة التلجرام للطلاب', url: 'https://telegram.org', enabled: true }
  ]
};

const STORAGE_KEY = 'galaxy_platform_settings_v2';

class PlatformSettingsService {
  private settings: PlatformSettings = DEFAULT_SETTINGS;

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } else {
        this.settings = DEFAULT_SETTINGS;
        this.save();
      }
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('galaxy_platform_settings_updated', { detail: this.settings }));
      }
    } catch (e) {
      console.warn('Failed to save platform settings', e);
    }
  }

  public getSettings(): PlatformSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<PlatformSettings>): PlatformSettings {
    this.settings = { ...this.settings, ...partial };
    this.save();
    return this.settings;
  }

  public addFooterLink(link: Omit<FooterLink, 'id'>): FooterLink {
    const newLink: FooterLink = {
      ...link,
      id: 'link-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    };
    this.settings.footerLinks.push(newLink);
    this.save();
    return newLink;
  }

  public updateFooterLink(id: string, partial: Partial<FooterLink>) {
    this.settings.footerLinks = this.settings.footerLinks.map((l) => (l.id === id ? { ...l, ...partial } : l));
    this.save();
  }

  public removeFooterLink(id: string) {
    this.settings.footerLinks = this.settings.footerLinks.filter((l) => l.id !== id);
    this.save();
  }

  public resetToDefaults() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
  }
}

export const platformSettings = new PlatformSettingsService();
