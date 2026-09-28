import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Award, 
  BookOpen, 
  BrainCircuit, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  GraduationCap,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';

export interface FacultyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: 'super_admin' | 'academic_lead' | 'teacher' | 'lab_specialist' | 'special_ed';
  roleLabel: string;
  assignedCourses: string[];
  activeStudentsCount: number;
  rating: number;
  aiQuotaDaily: number;
  status: 'active' | 'suspended';
}

const INITIAL_FACULTY: FacultyMember[] = [
  {
    id: 'fac-1',
    name: 'محمود (المشرف العام والمالك)',
    email: 'jowmahmoud6@gmail.com',
    phone: 'المالك والمشرف العام المعتمد',
    department: 'الإدارة العامة وهندسة المنظومة',
    role: 'super_admin',
    roleLabel: 'مشرف عام أعلى (Super Admin)',
    assignedCourses: ['كافة مسارات ومختبرات المنصة 3D'],
    activeStudentsCount: 0,
    rating: 5.0,
    aiQuotaDaily: 9999,
    status: 'active'
  }
];

export const FacultyStaffManager: React.FC = () => {
  const [faculty, setFaculty] = useState<FacultyMember[]>(() => {
    try {
      const saved = localStorage.getItem('galaxy_faculty_staff_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly purge legacy mock staff
          const clean = parsed.filter(f => f && !['fac-2', 'fac-3', 'fac-4', 'fac-5', 'fac-6'].includes(f.id));
          if (clean.length > 0) return clean;
        }
      }
    } catch {}
    return INITIAL_FACULTY;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync with Supabase admin_teacher_access
  useEffect(() => {
    const fetchLiveStaff = async () => {
      try {
        const { data: dbStaff } = await supabase.from('admin_teacher_access').select('*');
        if (dbStaff && dbStaff.length > 0) {
          const liveList: FacultyMember[] = [...INITIAL_FACULTY];
          dbStaff.forEach((s) => {
            if (s.email.toLowerCase() === 'jowmahmoud6@gmail.com') return;
            liveList.push({
              id: s.id,
              name: s.email.split('@')[0],
              email: s.email,
              phone: 'معتمد من النظام',
              department: 'الكوادر الأكاديمية المعتمدة',
              role: s.access_level === 'super_admin' ? 'super_admin' : s.access_level === 'admin' ? 'academic_lead' : 'teacher',
              roleLabel: s.access_level === 'super_admin' ? 'مشرف عام' : s.access_level === 'admin' ? 'مسؤول أكاديمي' : 'معلم معتمد',
              assignedCourses: ['المناهج المعتمدة'],
              activeStudentsCount: 0,
              rating: 5.0,
              aiQuotaDaily: 100,
              status: 'active'
            });
          });
          setFaculty(liveList);
        }
      } catch (err) {
        console.warn('Live staff fetch warning:', err);
      }
    };
    fetchLiveStaff();
  }, []);

  // Save clean staff to localStorage
  useEffect(() => {
    const clean = faculty.filter(f => !['fac-2', 'fac-3', 'fac-4', 'fac-5', 'fac-6'].includes(f.id));
    localStorage.setItem('galaxy_faculty_staff_v1', JSON.stringify(clean));
  }, [faculty]);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'قسم العلوم والفيزياء الذرية',
    role: 'teacher' as FacultyMember['role'],
    roleLabel: 'معلم مادة',
    assignedCourse: '',
    aiQuotaDaily: 50
  });

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || f.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      toast.error('يرجى ملء الاسم والبريد الإلكتروني');
      return;
    }

    const created: FacultyMember = {
      id: 'fac-' + Date.now(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone || '+962 7 0000 0000',
      department: newMember.department,
      role: newMember.role,
      roleLabel: newMember.role === 'academic_lead' ? 'رئيس قسم' : newMember.role === 'special_ed' ? 'أخصائي دمج' : 'معلم مادة',
      assignedCourses: newMember.assignedCourse ? [newMember.assignedCourse] : ['مقرر عام'],
      activeStudentsCount: 120,
      rating: 5.0,
      aiQuotaDaily: newMember.aiQuotaDaily,
      status: 'active'
    };

    setFaculty([created, ...faculty]);
    setIsAddModalOpen(false);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      department: 'قسم العلوم والفيزياء الذرية',
      role: 'teacher',
      roleLabel: 'معلم مادة',
      assignedCourse: '',
      aiQuotaDaily: 50
    });
    toast.success(`تمت إضافة ${created.name} إلى كادر المنصة وتعيين الصلاحيات الأكاديمية بنجاح`);
  };

  const handleToggleStatus = (id: string) => {
    setFaculty(prev => prev.map(f => {
      if (f.id === id) {
        const nextStatus = f.status === 'active' ? 'suspended' : 'active';
        toast.info(`تم تغيير حالة حساب ${f.name} إلى: ${nextStatus === 'active' ? 'نشط' : 'معلق'}`);
        return { ...f, status: nextStatus };
      }
      return f;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-400/20 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              الكوادر والصلاحيات الأكاديمية (Faculty & RBAC)
            </span>
            <Badge variant="outline" className="text-[11px] font-mono border-purple-500/30 text-purple-600">
              Staff Matrix v2.0
            </Badge>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            إدارة الكادر التعليمي والمشرفين الأكاديميين
          </h2>
          <p className="text-xs text-slate-500">
            توزيع المقررات، تعيين حصص الذكاء الاصطناعي، ومراقبة مؤشرات أداء المعلمين والتقييم
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-2xl text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-purple-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة كادر تعليمي جديد</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، البريد، القسم..."
            className="h-9 pr-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
        >
          <option value="all">كافة الأدوار والصلاحيات</option>
          <option value="super_admin">مشرف عام (Super Admin)</option>
          <option value="academic_lead">رئيس قسم (Academic Lead)</option>
          <option value="teacher">معلم مادة (Teacher)</option>
          <option value="special_ed">أخصائي دمج (Special Ed)</option>
        </select>
      </div>

      {/* Status Notice */}
      <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
          <span className="font-bold text-purple-900 dark:text-purple-300">
            الكوادر المعتمدة الموثقة ({faculty.length} عضو)
          </span>
          <span className="text-slate-600 dark:text-slate-400 text-[11px]">
            • تم استبعاد كافة البيانات والأسماء الوهمية السابقة بالكامل، مع إمكانية إضافة وتعيين كوادر حقيقية جديدة.
          </span>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-purple-400/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-purple-500/25">
                    {member.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{member.department}</p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    member.role === 'super_admin'
                      ? 'border-cyan-500/40 text-cyan-600 bg-cyan-500/10'
                      : member.role === 'academic_lead'
                      ? 'border-purple-500/40 text-purple-600 bg-purple-500/10'
                      : 'border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {member.roleLabel}
                </Badge>
              </div>

              {/* Contact info */}
              <div className="space-y-1 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px] truncate" dir="ltr">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px]" dir="ltr">{member.phone}</span>
                </div>
              </div>

              {/* Courses list */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400">المقررات المسندة:</span>
                <div className="flex flex-wrap gap-1">
                  {member.assignedCourses.map((c, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">الطلاب</span>
                  <span className="font-bold text-slate-900 dark:text-white">{member.activeStudentsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">التقييم</span>
                  <span className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                    ★ {member.rating}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">حصة AI/يوم</span>
                  <span className="font-bold text-purple-600">{member.aiQuotaDaily}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[10px] font-bold flex items-center gap-1 ${
                member.status === 'active' ? 'text-emerald-600' : 'text-rose-500'
              }`}>
                <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {member.status === 'active' ? 'حساب نشط' : 'معلق'}
              </span>

              {member.role !== 'super_admin' && (
                <Button
                  onClick={() => handleToggleStatus(member.id)}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  {member.status === 'active' ? 'تعليق الحساب' : 'إعادة التفعيل'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculty Member Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">إضافة كادر تعليمي / مشرف جديد</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الاسم الكامل:</label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="مثال: أ. محمود بني عيسى"
                    className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">البريد الإلكتروني:</label>
                    <Input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      placeholder="teacher@school.jo"
                      className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">رقم الهاتف:</label>
                    <Input
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                      placeholder="+962 7 9000 0000"
                      className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">القسم الأكاديمي:</label>
                    <select
                      value={newMember.department}
                      onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                      className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                    >
                      <option value="قسم العلوم والفيزياء الذرية">قسم العلوم والفيزياء الذرية</option>
                      <option value="قسم الكيمياء والمختبرات">قسم الكيمياء والمختبرات</option>
                      <option value="قسم العلوم الحياتية والوراثة">قسم العلوم الحياتية والوراثة</option>
                      <option value="قسم الروبوتات والذكاء الاصطناعي">قسم الروبوتات والذكاء الاصطناعي</option>
                      <option value="قسم التربية الخاصة ومنظومة الدمج">قسم التربية الخاصة ومنظومة الدمج</option>
                      <option value="قسم الرياضيات المتقدمة">قسم الرياضيات المتقدمة</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">الدور والصلاحيات:</label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                      className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                    >
                      <option value="teacher">معلم مادة (Teacher)</option>
                      <option value="academic_lead">رئيس قسم (Academic Lead)</option>
                      <option value="lab_specialist">أخصائي مختبرات (Lab Tech)</option>
                      <option value="special_ed">أخصائي تربية خاصة (Special Ed)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">المقرر المسند مبدئياً:</label>
                    <Input
                      value={newMember.assignedCourse}
                      onChange={(e) => setNewMember({ ...newMember, assignedCourse: e.target.value })}
                      placeholder="مثال: الفيزياء الذرية PHYS-101"
                      className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">حصة AI اليومية:</label>
                    <Input
                      type="number"
                      value={newMember.aiQuotaDaily}
                      onChange={(e) => setNewMember({ ...newMember, aiQuotaDaily: parseInt(e.target.value) || 50 })}
                      className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl text-xs"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                  >
                    إضافة الكادر
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
