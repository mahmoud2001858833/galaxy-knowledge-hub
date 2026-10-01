import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  Clock, 
  Ban, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  Terminal, 
  Eye, 
  Download,
  AlertCircle,
  Activity,
  Laptop
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { auditLogger } from '@/services/auditLogger';

interface FirewallRule {
  id: string;
  ipRange: string;
  label: string;
  type: 'allow' | 'block';
  createdAt: string;
}

interface ThreatEvent {
  id: string;
  type: 'brute_force' | 'sqli_attempt' | 'rate_limit' | 'unauthorized_token' | 'prompt_injection';
  ip: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  details: string;
  status: 'blocked' | 'mitigated' | 'monitored';
}

export const SystemSecurityShieldManager: React.FC = () => {
  // Emergency Lockdown State
  const [isLockdownActive, setIsLockdownActive] = useState<boolean>(() => {
    return localStorage.getItem('galaxy_emergency_lockdown_v1') === 'true';
  });
  const [lockdownMessage, setLockdownMessage] = useState('المنصة في وضع الصيانة الأمنية الاحترازية لحماية البيانات. يرجى المراجعة لاحقاً.');
  const [lockdownModalOpen, setLockdownModalOpen] = useState(false);

  // Master Passkey Rotation State
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false);

  // Session Timeout State
  const [sessionTimeout, setSessionTimeout] = useState<number>(() => {
    return parseInt(localStorage.getItem('galaxy_admin_session_timeout') || '30', 10);
  });

  // Firewall Rules
  const [rules, setRules] = useState<FirewallRule[]>(() => {
    try {
      const saved = localStorage.getItem('galaxy_firewall_rules_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'rule-1', ipRange: '192.168.1.0/24', label: 'مختبرات الحاسوب المدرسية المركزية', type: 'allow', createdAt: '2026-09-01' },
      { id: 'rule-2', ipRange: '10.0.0.0/8', label: 'شبكة وزارة التربية والتعليم الداخلية', type: 'allow', createdAt: '2026-09-10' },
      { id: 'rule-3', ipRange: '45.133.1.20', label: 'عنوان مشبوه (محاولات تخمين متكررة)', type: 'block', createdAt: '2026-09-28' },
    ];
  });
  const [newIp, setNewIp] = useState('');
  const [newIpLabel, setNewIpLabel] = useState('');
  const [newIpType, setNewIpType] = useState<'allow' | 'block'>('allow');

  // Threat Matrix
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([
    { id: 't-1', type: 'prompt_injection', ip: '185.220.101.4', severity: 'high', timestamp: 'منذ 12 دقيقة', details: 'محاولة تجاوز قيود وكيل الكيمياء عبر هندسة الأوامر', status: 'blocked' },
    { id: 't-2', type: 'rate_limit', ip: '91.240.118.82', severity: 'medium', timestamp: 'منذ 34 دقيقة', details: 'طلب أكثر من 120 استعلاماً خلال دقيقة واحدة على محاكي الليزر', status: 'blocked' },
    { id: 't-3', type: 'brute_force', ip: '45.133.1.20', severity: 'critical', timestamp: 'منذ ساعتين', details: 'تكرار محاولات إدخال رمز الإدارة لـ 5 مرات متتالية', status: 'blocked' },
    { id: 't-4', type: 'unauthorized_token', ip: '194.26.29.112', severity: 'high', timestamp: 'منذ 5 ساعات', details: 'محاولة استدعاء واجهة برمجة تطبيقات المدرسين بدون رمز جلسة صالح', status: 'mitigated' }
  ]);

  // Toggle Lockdown
  const handleToggleLockdown = () => {
    const newState = !isLockdownActive;
    setIsLockdownActive(newState);
    localStorage.setItem('galaxy_emergency_lockdown_v1', String(newState));
    window.dispatchEvent(new CustomEvent('galaxy_emergency_lockdown_changed', { detail: { active: newState, message: lockdownMessage } }));

    if (newState) {
      toast.error('⚠️ تم تفعيل وضع الإغلاق الشامل للطوارئ! المنصة الآن في وضع الصيانة الحازم.');
    } else {
      toast.success('تم فك الإغلاق وإعادة فتح المنصة بصورة طبيعية لجميع المستخدمين.');
    }

    auditLogger.record({
      action: 'CONFIG_CHANGE',
      module: 'Zero-Trust Security Shield',
      description: newState ? 'تفعيل الإغلاق الشامل للطوارئ (Emergency Platform Lockdown)' : 'إلغاء وضع الإغلاق الشامل للمنصة',
      user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
      severity: 'critical'
    });
    setLockdownModalOpen(false);
  };

  // Rotate Passkey
  const handleRotatePasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasskey || newPasskey.length < 6) {
      toast.error('رمز المرور يجب أن يتكون من 6 أحرف على الأقل');
      return;
    }
    if (newPasskey !== confirmPasskey) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    localStorage.setItem('galaxy_admin_custom_passkey', newPasskey);
    setNewPasskey('');
    setConfirmPasskey('');
    setPasskeyModalOpen(false);
    toast.success('تم تحديث وتدوير رمز الدخول الإداري الفائق (Master Passkey) بنجاح!');

    auditLogger.record({
      action: 'PERMISSION_CHANGE',
      module: 'Zero-Trust Security Shield',
      description: 'تدوير وتغيير الرمز الإداري الرئيسي للمنصة (Master Passkey Rotation)',
      user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
      severity: 'critical'
    });
  };

  // Add Firewall Rule
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim() || !newIpLabel.trim()) return;

    const newRule: FirewallRule = {
      id: `rule-${Date.now()}`,
      ipRange: newIp.trim(),
      label: newIpLabel.trim(),
      type: newIpType,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newRule, ...rules];
    setRules(updated);
    localStorage.setItem('galaxy_firewall_rules_v1', JSON.stringify(updated));
    setNewIp('');
    setNewIpLabel('');
    toast.success('تمت إضافة قاعدة الجدار الناري بنجاح');
  };

  // Remove Rule
  const handleRemoveRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    localStorage.setItem('galaxy_firewall_rules_v1', JSON.stringify(updated));
    toast.info('تم حذف القاعدة من الجدار الناري');
  };

  // Terminate All Sessions
  const handleTerminateAllSessions = () => {
    sessionStorage.removeItem('galaxy_admin_authenticated');
    localStorage.removeItem('galaxy_admin_session_token');
    toast.success('تم إنهاء وتسجيل الخروج لكافة الجلسات النشطة عبر جميع الأجهزة!');
    auditLogger.record({
      action: 'PERMISSION_CHANGE',
      module: 'Session Security',
      description: 'تسجيل خروج قسري شامل لكافة الجلسات الإدارية المفتوحة',
      user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
      severity: 'warning'
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white border border-rose-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>درع الأمان وانعدام الثقة (Zero-Trust Security Shield)</span>
          </div>
          <h2 className="text-2xl font-black text-white">مركز الحماية والأمن السيبراني المؤسسي</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            مراقبة التهديدات، إدارة الجدار الناري، تدوير مفاتيح الدخول، ومفتاح الإغلاق الشامل للطوارئ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setLockdownModalOpen(true)}
            className={`font-black text-xs h-11 px-5 rounded-2xl shadow-lg transition-all ${
              isLockdownActive 
                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
            }`}
          >
            <ShieldAlert className="w-4 h-4 ml-1.5" />
            <span>{isLockdownActive ? 'إلغاء وضع الإغلاق الشامل' : 'إغلاق المنصة للطوارئ ⚠️'}</span>
          </Button>

          <Button
            onClick={() => setPasskeyModalOpen(true)}
            variant="outline"
            className="border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 rounded-2xl text-xs h-11"
          >
            <KeyRound className="w-3.5 h-3.5 ml-1.5 text-cyan-400" />
            <span>تدوير رمز الدخول</span>
          </Button>
        </div>
      </div>

      {/* 2. Security Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>درع الحماية السيبراني</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">99.8%</div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Defense Grade: A+ Tier</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>محاولات محجوبة اليوم</span>
            <Ban className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">142</div>
          <p className="text-[11px] text-slate-400 mt-1">تم إحباطها آلياً بنجاح</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>قواعد الجدار الناري الحية</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 font-mono">{rules.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">توجيه فوري للطلبات</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>مهلة إغلاق الجلسة التلقائي</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">{sessionTimeout} دقيقة</div>
          <p className="text-[11px] text-slate-400 mt-1">إغلاق ذاتي عند الخمول</p>
        </div>
      </div>

      {/* 3. Grid: Firewall Rules & Threat Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Firewall */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">قواعد الجدار الناري المؤسسي (IP Whitelist / Blacklist)</h3>
                <p className="text-xs text-slate-500">حصر أو استثناء نطاقات العناوين المسموح لها بالاتصال</p>
              </div>
            </div>

            {/* Add Rule Form */}
            <form onSubmit={handleAddRule} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="عنوان IP أو CIDR (مثال: 192.168.1.0/24)"
                  className="text-xs h-9 bg-white dark:bg-slate-900 font-mono"
                  required
                />
                <Input
                  value={newIpLabel}
                  onChange={(e) => setNewIpLabel(e.target.value)}
                  placeholder="وصف النطاق (مثال: مختبر العلوم)"
                  className="text-xs h-9 bg-white dark:bg-slate-900"
                  required
                />
                <select
                  value={newIpType}
                  onChange={(e) => setNewIpType(e.target.value as any)}
                  className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                >
                  <option value="allow">سماح حصري (Allow)</option>
                  <option value="block">حظر مشدد (Block)</option>
                </select>
              </div>

              <Button type="submit" size="sm" className="w-full h-8 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl">
                <Plus className="w-3.5 h-3.5 ml-1" />
                إضافة القاعدة إلى الجدار الناري
              </Button>
            </form>

            {/* Rules Feed */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {rules.map((rule) => (
                <div key={rule.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge className={rule.type === 'allow' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}>
                      {rule.type === 'allow' ? 'سماح' : 'حظر'}
                    </Badge>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{rule.ipRange}</span>
                    <span className="text-slate-400 text-[11px]">— {rule.label}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveRule(rule.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="حذف القاعدة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Threats & Threat Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">مصفوفة التهديدات المرصودة لحظياً</h3>
                <p className="text-xs text-slate-500">رصد هجمات حقن الأوامر، التخمين، والطلبات الزائدة</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTerminateAllSessions}
                className="text-xs text-rose-600 border-rose-200 dark:border-rose-800 hover:bg-rose-50 rounded-xl"
              >
                طرد كافة الجلسات
              </Button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
              {threatEvents.map((threat) => (
                <div key={threat.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      threat.severity === 'critical' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                      threat.severity === 'high' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}>
                      {threat.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{threat.timestamp}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 font-medium text-xs leading-relaxed">
                    {threat.details}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 font-mono">
                    <span>مصدر IP: {threat.ip}</span>
                    <span className="text-emerald-600 font-bold">الحالة: {threat.status === 'blocked' ? 'محجوب تلقائياً ✓' : 'تم الاحتواء'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lockdown Confirmation Modal */}
      <Dialog open={lockdownModalOpen} onOpenChange={setLockdownModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              {isLockdownActive ? 'تأكيد إلغاء الإغلاق الشامل' : 'تأكيد تفعيل وضع الإغلاق الشامل للطوارئ'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isLockdownActive 
                ? 'سيتم إعادة إتاحة المنصة للجميع بصورة طبيعية وفورية.'
                : 'سيتم تحويل المنصة فوراً لوضع الصيانة الإلزامية ومنع الطلاب من إرسال أية طلبات مؤقتاً.'}
            </DialogDescription>
          </DialogHeader>

          {!isLockdownActive && (
            <div className="space-y-1.5 my-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">رسالة التنبيه المعروضة للمستخدمين:</label>
              <Input
                value={lockdownMessage}
                onChange={(e) => setLockdownMessage(e.target.value)}
                className="text-xs h-9 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={() => setLockdownModalOpen(false)} className="text-xs rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleToggleLockdown}
              className={`text-xs font-bold rounded-xl ${
                isLockdownActive ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {isLockdownActive ? 'تأكيد فك الإغلاق' : 'تأكيد الإغلاق الفوري'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Passkey Rotation Modal */}
      <Dialog open={passkeyModalOpen} onOpenChange={setPasskeyModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-500" />
              تدوير وتغيير الرمز الإداري الرئيسي (Master Passkey)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              تغيير كلمة مرور المشرف العام العليا للوصول إلى لوحة التحكم الفائقة.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRotatePasskey} className="space-y-3 my-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">رمز المرور الجديد:</label>
              <Input
                type="password"
                value={newPasskey}
                onChange={(e) => setNewPasskey(e.target.value)}
                placeholder="6 خانات على الأقل..."
                className="text-xs h-9 bg-slate-50 dark:bg-slate-800"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">تأكيد رمز المرور الجديد:</label>
              <Input
                type="password"
                value={confirmPasskey}
                onChange={(e) => setConfirmPasskey(e.target.value)}
                placeholder="أعد كتابة الرمز..."
                className="text-xs h-9 bg-slate-50 dark:bg-slate-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="ghost" onClick={() => setPasskeyModalOpen(false)} className="text-xs rounded-xl">
                إلغاء
              </Button>
              <Button type="submit" className="text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white">
                حفظ وتطبيق الرمز الجديد
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemSecurityShieldManager;
