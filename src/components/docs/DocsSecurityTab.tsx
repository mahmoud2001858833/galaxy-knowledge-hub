import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Server,
  Key,
  Database,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const DocsSecurityTab: React.FC = () => {
  const securityPillars = [
    {
      title: 'أمان البيانات على مستوى الصفوف (Row-Level Security - RLS)',
      icon: Database,
      desc: 'تطبيق سياسات RLS صارمة في قاعدة بيانات PostgreSQL تضمن عزل بيانات كل طالب ومعلم ومدرسة عزلاً تاماً، بحيث يستحيل تسريب أو قراءة أي سجل دون امتلاك رمز المصادقة الموثوق.',
      tags: ['PostgreSQL 16', 'Supabase Auth', 'Zero-Trust Architecture']
    },
    {
      title: 'إدارة الهويات والتشفير اللحظي (JWT & TLS 1.3)',
      icon: Key,
      desc: 'تشفير جميع الاتصالات عبر بروتوكول TLS 1.3، واستخدام رموز JWT موقعة ومحددة الصلاحيات، مع التحقق المستمر من صحة الطلبات ومنع التلاعب بالحمولة البرمجية.',
      tags: ['Signed JWT Tokens', 'End-to-End Encryption', 'Role-Based Access']
    },
    {
      title: 'مكافحة ثغرات الويب والتحقق البياني الصارم (OWASP & Zod)',
      icon: Shield,
      desc: 'تحصين المنصة من ثغرات الحقن (SQLi)، التزوير عبر المواقع (CSRF)، وحقن الأكواد الخبيثة (XSS)، مع التحقق الصارم من مدخلات المستخدمين بنماذج Zod Schemas.',
      tags: ['OWASP Top 10', 'Zod Schema Validation', 'Input Sanitization']
    },
    {
      title: 'حماية خصوصية الطلبة القُصّر والامتثال المعياري (COPPA & GDPR)',
      icon: UserCheck,
      desc: 'الامتثال الكامل لمعايير حماية خصوصية الأطفال على الإنترنت (COPPA) واللوائح العامة لحماية البيانات (GDPR)، مع عدم جمع أي بيانات بيومترية أو بيعها لأطراف ثالثة.',
      tags: ['Student Privacy Pledge', 'COPPA Compliant', 'Zero Third-Party Tracking']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/10 via-slate-900/10 to-blue-900/10 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-slate-950/30 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
            <Shield className="w-3.5 h-3.5 ml-1 text-emerald-500" />
            الأمان المؤسسي والخصوصية
          </Badge>
          <span className="text-xs text-slate-500 font-mono">Enterprise Security & Compliance</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          أعلى معايير الحماية السيبرانية وتشفير البيانات لحماية المدارس والطلبة
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          تعتمد "ذروة العلم" نموذج الأمان المعدوم للثقة (Zero-Trust)، حيث يتم تدقيق وفحص كل اتصال وقاعدة بيانات، مع نسخ احتياطي دوري مشفر وموزع على مراكز بيانات سحابية متقدمة.
        </p>
      </div>

      {/* Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {securityPillars.map((pillar, idx) => {
          const Icon = pillar.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 hover:border-emerald-400/50 transition-all"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {pillar.title}
                </h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {pillar.desc}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {pillar.tags.map((tag, tIdx) => (
                  <Badge key={tIdx} variant="secondary" className="text-[10px] font-mono">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
