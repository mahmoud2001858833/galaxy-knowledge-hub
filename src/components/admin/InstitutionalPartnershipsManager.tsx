import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Mail, 
  Phone, 
  Globe, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Users, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  X,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PartnershipApplication } from '@/pages/InstitutionalPartnerships';

const INITIAL_PARTNERSHIP_APPLICATIONS: PartnershipApplication[] = [];

export const InstitutionalPartnershipsManager: React.FC = () => {
  const [applications, setApplications] = useState<PartnershipApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<PartnershipApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Load authentic applications from storage and Supabase
  useEffect(() => {
    try {
      const stored = localStorage.getItem('galaxy_partnerships_requests');
      if (stored) {
        const parsed: PartnershipApplication[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const realOnly = parsed.filter(p => p && !p.id.startsWith('seed-'));
          setApplications(realOnly);
        }
      }
    } catch {}

    const fetchCloudPartnerships = async () => {
      try {
        const { data, error } = await supabase
          .from('institutional_partnerships')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const parsed: PartnershipApplication[] = data.map((d: any) => {
            if (d.raw_data && d.raw_data.id) return d.raw_data;
            return {
              id: d.id,
              refNumber: `PARTNER-${d.id.slice(-6)}`,
              institutionName: d.organization_name,
              institutionType: (d.organization_type || 'school') as any,
              country: d.country || 'المملكة الأردنية الهاشمية',
              city: d.city || 'عمان',
              representativeName: d.representative_name,
              roleTitle: d.representative_title || '',
              email: d.email,
              phone: d.phone || '',
              studentCount: `${d.estimated_users || '500'} طالب`,
              partnershipType: d.partnership_goals || 'ترخيص مختبرات 3D المدرسية',
              notes: d.admin_notes || '',
              status: (d.status === 'approved' ? 'mou_signed' : d.status === 'reviewing' ? 'reviewing' : 'new') as any,
              submittedAt: d.created_at
            };
          });
          setApplications(parsed);
          localStorage.setItem('galaxy_partnerships_requests', JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn('Partnerships cloud fetch error:', e);
      }
    };

    fetchCloudPartnerships();
  }, []);

  const saveApplications = (updated: PartnershipApplication[]) => {
    setApplications(updated);
    try {
      localStorage.setItem('galaxy_partnerships_requests', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving partnerships:', err);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: PartnershipApplication['status']) => {
    const updated = applications.map(app => {
      if (app.id === appId) {
        return { ...app, status: newStatus };
      }
      return app;
    });
    saveApplications(updated);
    try {
      await supabase.from('institutional_partnerships').update({
        status: newStatus === 'mou_signed' ? 'approved' : newStatus,
        admin_notes: adminNotes || undefined
      }).eq('id', appId);
    } catch (err) {
      console.warn('Supabase status update warning:', err);
    }
    toast.success('تم تحديث حالة طلب الشراكة بنجاح ومزامنتها');
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, status: newStatus });
    }
  };

  const handleDelete = async (appId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل المؤسسي؟')) return;
    const updated = applications.filter(app => app.id !== appId);
    saveApplications(updated);
    try {
      await supabase.from('institutional_partnerships').delete().eq('id', appId);
    } catch (err) {
      console.warn('Supabase delete partnership warning:', err);
    }
    toast.success('تم حذف السجل بنجاح');
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(null);
    }
  };

  const handleExportCSV = () => {
    const headers = 'رقم الملف,المؤسسة,النوع,الممثل,المسمى,البريد,الهاتف,عدد الطلبة,النطاق,الحالة,تاريخ التقديم\n';
    const rows = applications.map(a => 
      `"${a.refNumber}","${a.institutionName}","${a.institutionType}","${a.representativeName}","${a.roleTitle}","${a.email}","${a.phone}","${a.studentCount}","${a.partnershipType}","${a.status}","${new Date(a.submittedAt).toLocaleDateString('ar-EG')}"`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `galaxy-partnerships-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('تم تصدير سجل الشراكات بتنسيق CSV');
  };

  // Filtered List
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesType = typeFilter === 'all' || app.institutionType === typeFilter;
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || (
        app.institutionName.toLowerCase().includes(q) ||
        app.representativeName.toLowerCase().includes(q) ||
        app.refNumber.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.city.toLowerCase().includes(q)
      );
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [applications, searchQuery, typeFilter, statusFilter]);

  // Statistics Counts
  const stats = useMemo(() => {
    return {
      total: applications.length,
      newRequests: applications.filter(a => a.status === 'new').length,
      reviewing: applications.filter(a => a.status === 'reviewing').length,
      mouSigned: applications.filter(a => a.status === 'mou_signed').length,
      schools: applications.filter(a => a.institutionType === 'school').length,
      universities: applications.filter(a => a.institutionType === 'university').length,
      ministries: applications.filter(a => a.institutionType === 'ministry').length
    };
  }, [applications]);

  const getStatusBadge = (status: PartnershipApplication['status']) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">جديد • بحاجة تدقيق</Badge>;
      case 'reviewing':
        return <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">قيد المراجعة الفنية</Badge>;
      case 'mou_signed':
        return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">تم توقيع مذكرة تفاهم (MoU)</Badge>;
      case 'archived':
        return <Badge className="bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30">مؤرشف / مكتمل</Badge>;
    }
  };

  const getTypeLabel = (type: PartnershipApplication['institutionType']) => {
    switch (type) {
      case 'school': return 'مدرسة / مجمع تعليمي';
      case 'university': return 'جامعة / كلية تقنية';
      case 'ministry': return 'وزارة / مديرية حكومية';
      case 'private': return 'قطاع خاص / تدريب';
      case 'ngo': return 'منظمة مجتمعية';
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>بوابة إدارة الشراكات المؤسسية والاعتمادات</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            معلومات وملفات الشراكات الاستراتيجية
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            متابعة طلبات المدارس والجامعات والوزارات، توقيع مذكرات التفاهم، وإدارة تراخيص المنظومة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="rounded-xl text-xs gap-1.5 border-slate-300 dark:border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV</span>
          </Button>

          <Button
            onClick={() => {
              const dummyRef = `PARTNER-2026-${Math.floor(100000 + Math.random() * 900000)}`;
              const manualApp: PartnershipApplication = {
                id: Date.now().toString(),
                refNumber: dummyRef,
                institutionName: 'مدرسة نموذجية تجريبية جديدة',
                institutionType: 'school',
                country: 'المملكة الأردنية الهاشمية',
                city: 'عمان',
                representativeName: 'أ. محمد العبادي',
                roleTitle: 'مدير شؤون التطوير والتطوير',
                email: 'partner.test@galaxy.edu.jo',
                phone: '+962 7 9000 0000',
                studentCount: '500 - 1,500 طالب',
                partnershipType: 'ترخيص مختبرات 3D المدرسية',
                notes: 'تمت الإضافة من لوحة التحكم لمتابعة إجراءات التوقيع.',
                status: 'new',
                submittedAt: new Date().toISOString()
              };
              saveApplications([manualApp, ...applications]);
              toast.success(`تمت إضافة طلب شراكة يدوي برقم: ${dummyRef}`);
            }}
            className="rounded-xl text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سجل شراكة يدوي</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{stats.total}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">إجمالي الطلبات</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="text-2xl font-black text-amber-500 font-mono">{stats.newRequests}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">طلبات جديدة</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{stats.mouSigned}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">مذكرات تفاهم (MoU)</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{stats.schools}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">مدارس ومجمعات</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{stats.universities}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">جامعات وكليات</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{stats.ministries}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">وزارات وهيئات</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المؤسسة، الممثل، أو الرقم..."
            className="ps-9 pe-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="all">جميع الأنواع</option>
            <option value="school">المدارس (K-12)</option>
            <option value="university">الجامعات والكليات</option>
            <option value="ministry">الوزارات والهيئات</option>
            <option value="ngo">منظمات التربية الخاصة</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="all">جميع الحالات</option>
            <option value="new">جديد • بحاجة تدقيق</option>
            <option value="reviewing">قيد المراجعة الفنية</option>
            <option value="mou_signed">مذكرات التفاهم (MoU)</option>
            <option value="archived">مؤرشف</option>
          </select>

          <Button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setStatusFilter('all');
            }}
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs text-slate-500 gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط</span>
          </Button>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="space-y-4">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
          >
            {/* Right Information Block */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {app.refNumber}
                </span>
                {getStatusBadge(app.status)}
                <Badge variant="outline" className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                  {getTypeLabel(app.institutionType)}
                </Badge>
                <span className="text-[11px] text-slate-400">
                  تاريخ التقديم: {new Date(app.submittedAt).toLocaleDateString('ar-EG')}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {app.institutionName}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{app.representativeName}</span>
                  <span>({app.roleTitle})</span>
                  <span>•</span>
                  <span>{app.city}، {app.country}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-cyan-400">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>{app.email}</span>
                </a>
                <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-cyan-400" dir="ltr">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{app.phone}</span>
                </a>
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{app.studentCount}</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-1">
                «{app.notes || 'لا توجد ملاحظات إضافية.'}»
              </p>
            </div>

            {/* Left Action & Status Controls */}
            <div className="flex flex-wrap lg:flex-col items-end gap-2.5 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
              {/* Quick Status Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-semibold">الحالة:</span>
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                  className="h-8 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="new">جديد</option>
                  <option value="reviewing">قيد المراجعة</option>
                  <option value="mou_signed">توقيع مذكرة (MoU)</option>
                  <option value="archived">أرشفة</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSelectedApp(app)}
                  size="sm"
                  className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="w-3.5 h-3.5 ml-1" />
                  <span>عرض الملف الكامل</span>
                </Button>

                <Button
                  onClick={() => handleDelete(app.id)}
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs text-rose-500 hover:text-rose-600 border-rose-200 dark:border-rose-900/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              لم نتمكن من العثور على أي طلبات شراكة مطابقة
            </h3>
            <p className="text-xs text-slate-400">
              جرب تغيير معايير البحث أو تصفية الحالات.
            </p>
          </div>
        )}
      </div>

      {/* Full Dossier Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-right"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400">{selectedApp.refNumber}</span>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedApp.institutionName}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {getTypeLabel(selectedApp.institutionType)} • {selectedApp.city}، {selectedApp.country}
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedApp(null)}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold block">المفوض الرسمي:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedApp.representativeName}</span>
                  <span className="text-slate-500 block">{selectedApp.roleTitle}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold block">نطاق الشراكة المقترح:</span>
                  <span className="font-bold text-blue-600 dark:text-cyan-400 text-sm">{selectedApp.partnershipType}</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold block">{selectedApp.studentCount}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold block">البريد الإلكتروني:</span>
                  <a href={`mailto:${selectedApp.email}`} className="font-bold text-slate-900 dark:text-white hover:underline block">
                    {selectedApp.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold block">رقم الهاتف:</span>
                  <a href={`tel:${selectedApp.phone}`} className="font-bold text-slate-900 dark:text-white hover:underline block" dir="ltr">
                    {selectedApp.phone}
                  </a>
                </div>
              </div>

              {/* Detailed Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  نص وملاحظات الطلب المقدم:
                </span>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.notes || 'لم يقم ممثل الجهة بإضافة ملاحظات إضافية.'}
                </p>
              </div>

              {/* Status Changer in Modal */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  تغيير حالة هذا الملف:
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={selectedApp.status === 'reviewing' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedApp.id, 'reviewing')}
                    className="rounded-xl text-xs h-8"
                  >
                    قيد المراجعة
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedApp.status === 'mou_signed' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedApp.id, 'mou_signed')}
                    className="rounded-xl text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    توقيع مذكرة (MoU)
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedApp.status === 'archived' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedApp.id, 'archived')}
                    className="rounded-xl text-xs h-8"
                  >
                    أرشفة
                  </Button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  onClick={() => {
                    const text = `ملف شراكة مؤسسية:\nالمؤسسة: ${selectedApp.institutionName}\nالممثل: ${selectedApp.representativeName} (${selectedApp.roleTitle})\nالبريد: ${selectedApp.email}\nالهاتف: ${selectedApp.phone}\nالنطاق: ${selectedApp.partnershipType}\nرقم الملف: ${selectedApp.refNumber}`;
                    navigator.clipboard.writeText(text);
                    setIsCopied(true);
                    toast.success('تم نسخ ملخص الشراكة');
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  variant="outline"
                  className="rounded-xl text-xs gap-1.5"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'تم النسخ' : 'نسخ ملخص الملف'}</span>
                </Button>

                <Button
                  onClick={() => setSelectedApp(null)}
                  className="rounded-xl text-xs px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                >
                  إغلاق
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstitutionalPartnershipsManager;
