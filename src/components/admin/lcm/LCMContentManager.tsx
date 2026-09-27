import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Layers, 
  Atom, 
  HelpCircle, 
  Download, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Sparkles, 
  GraduationCap, 
  Clock, 
  Check, 
  Share2, 
  FolderPlus,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export interface LessonItem {
  id: string;
  title: string;
  durationMinutes: number;
  simulationUrl?: string;
  simulationName?: string;
  hasQuiz: boolean;
  hasWorksheet: boolean;
  outcomes: string[];
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  lessons: LessonItem[];
}

export interface CourseItem {
  id: string;
  code: string;
  title: string;
  subject: string;
  grade: string;
  instructor: string;
  modulesCount: number;
  totalLessons: number;
  simulationsCount: number;
  status: 'published' | 'draft' | 'review';
  completionRate: number;
  modules: ModuleItem[];
}

const INITIAL_COURSES: CourseItem[] = [
  {
    id: 'crs-1',
    code: 'PHYS-101',
    title: 'الفيزياء الذرية وميكانيكا الكم المتقدمة',
    subject: 'فيزياء',
    grade: 'التوجيهي العلمي',
    instructor: 'أ. عمر الشناوي',
    modulesCount: 4,
    totalLessons: 18,
    simulationsCount: 6,
    status: 'published',
    completionRate: 94,
    modules: [
      {
        id: 'mod-1-1',
        title: 'الوحدة الأولى: البناء الذري والأطياف الذرية',
        description: 'دراسة نموذج بور، مستويات الطاقة، وظاهرة كومبتون الكهرومغناطيسية',
        lessons: [
          {
            id: 'les-1-1-1',
            title: 'نموذج بور لطيف ذرة الهيدروجين والمدارات المكممة',
            durationMinutes: 45,
            simulationUrl: '/quantum-mechanics',
            simulationName: 'محاكي ميكانيكا الكم والدالة الموجية',
            hasQuiz: true,
            hasWorksheet: true,
            outcomes: ['حساب نصف قطر مدار بور', 'استنتاج معادلة ريدبرغ للأطياف', 'تفسير خطوط طيف الانبعاث']
          },
          {
            id: 'les-1-1-2',
            title: 'فرضية دي برولي وازدواجية الموجة والجسيم',
            durationMinutes: 40,
            simulationUrl: '/build-atom',
            simulationName: 'مختبر بناء الذرة والجسيمات',
            hasQuiz: true,
            hasWorksheet: true,
            outcomes: ['حساب الطول الموجي المصاحب للإلكترون', 'تفسير حيود الإلكترونات عبر البلورات']
          }
        ]
      },
      {
        id: 'mod-1-2',
        title: 'الوحدة الثانية: فيزياء النواة والجسيمات الأولية',
        description: 'طاقة الربط النووي، الاستقرار، ونموذج الكواركات القياسي',
        lessons: [
          {
            id: 'les-1-2-1',
            title: 'مسرعات الجسيمات ومسرع الهادرونات الكبير (LHC)',
            durationMinutes: 50,
            simulationUrl: '/lhc-simulation',
            simulationName: 'محاكاة تصادم البروتونات LHC',
            hasQuiz: true,
            hasWorksheet: true,
            outcomes: ['فهم مبدأ تسريع الحزم النبضية', 'اكتشاف بوزون هيغز والكتلة الذاتية']
          }
        ]
      }
    ]
  },
  {
    id: 'crs-2',
    code: 'CHEM-201',
    title: 'الكيمياء الحركية والديناميكا الحرارية',
    subject: 'كيمياء',
    grade: 'الأول ثانوي العلمي',
    instructor: 'د. سامية نصر',
    modulesCount: 3,
    totalLessons: 14,
    simulationsCount: 4,
    status: 'published',
    completionRate: 88,
    modules: [
      {
        id: 'mod-2-1',
        title: 'الوحدة الأولى: سرعة التفاعل ونظرية التصادم',
        description: 'العوامل المؤثرة على سرعة التفاعل وطاقة التنشيط وتوازن لوشاتيليه',
        lessons: [
          {
            id: 'les-2-1-1',
            title: 'طاقة التنشيط ومنحنى ماكسويل-بولتزمان',
            durationMinutes: 45,
            simulationUrl: '/chemical-kinetics',
            simulationName: 'محاكي الكيمياء الحركية وسرعة التفاعل',
            hasQuiz: true,
            hasWorksheet: true,
            outcomes: ['حساب طاقة التنشيط من معادلة أرهينيوس', 'دراسة تأثير المحفزات الإنزيمية']
          }
        ]
      }
    ]
  },
  {
    id: 'crs-3',
    code: 'ROB-401',
    title: 'منظومة الروبوتات والذكاء الاصطناعي و ROS 2',
    subject: 'روبوتات وذكاء',
    grade: 'مسار الموهوبين و BTEC',
    instructor: 'م. حسام القاسم',
    modulesCount: 5,
    totalLessons: 24,
    simulationsCount: 5,
    status: 'published',
    completionRate: 96,
    modules: [
      {
        id: 'mod-3-1',
        title: 'الوحدة الأولى: المحاكاة العتادية والدوائر المدمجة',
        description: 'برمجة متحكمات ESP32 و Arduino وتوصيل بروتوكولات I2C/SPI عبر Wokwi',
        lessons: [
          {
            id: 'les-3-1-1',
            title: 'بناء رادار كاشف العقبات بالموجات فوق الصوتية',
            durationMinutes: 60,
            simulationUrl: '/robotics',
            simulationName: 'معمل Wokwi ولوحة التجارب الافتراضية',
            hasQuiz: true,
            hasWorksheet: true,
            outcomes: ['قراءة نبضات HC-SR04 بالميكروثانية', 'توجيه محرك السيرفو SG90 بدقة زاوية']
          }
        ]
      }
    ]
  },
  {
    id: 'crs-4',
    code: 'BIO-301',
    title: 'الهندسة الوراثية وتقانة كريسبر الحيوية',
    subject: 'أحياء',
    grade: 'التوجيهي العلمي',
    instructor: 'أ. رانية خوري',
    modulesCount: 3,
    totalLessons: 12,
    simulationsCount: 3,
    status: 'published',
    completionRate: 91,
    modules: [
      {
        id: 'mod-4-1',
        title: 'الوحدة الأولى: تقنية كريسبر وتعديل الجينات',
        description: 'آلية عمل أنزيم Cas9 وتوجيه RNA لقص الطفرات الوراثية',
        lessons: [
          {
            id: 'les-4-1-1',
            title: 'محاكاة استهداف وقص تسلسل الحمض النووي الدقيق',
            durationMinutes: 45,
            simulationUrl: '/crispr-gene-editing',
            simulationName: 'المختبر ثلاثي الأبعاد لتعديل كريسبر',
            hasQuiz: true,
            hasWorksheet: true,
            outcomes: ['التعرف على تسلسل PAM', 'تصميم جزيء gRNA الموجه']
          }
        ]
      }
    ]
  },
  {
    id: 'crs-5',
    code: 'MATH-102',
    title: 'التفاضل والتكامل وتطبيقات الفيزياء المتقدمة',
    subject: 'رياضيات',
    grade: 'التوجيهي العلمي',
    instructor: 'أ. طارق عبد الرحمن',
    modulesCount: 4,
    totalLessons: 20,
    simulationsCount: 2,
    status: 'published',
    completionRate: 85,
    modules: [
      {
        id: 'mod-5-1',
        title: 'الوحدة الأولى: تطبيقات التفاضل ومعدلات التغير المرتبطة بالزمن',
        description: 'المسائل الفيزيائية والهندسية وحساب الحجوم الدورانية',
        lessons: [
          {
            id: 'les-5-1-1',
            title: 'المعدلات المرتبطة بالزمن وحركة المقذوفات',
            durationMinutes: 50,
            hasQuiz: true,
            hasWorksheet: true,
            outcomes: ['إيجاد معدل التغير اللحظي للأشكال الهندسية', 'تطبيق قاعدة السلسلة في الفيزياء']
          }
        ]
      }
    ]
  },
  {
    id: 'crs-6',
    code: 'BTEC-501',
    title: 'المسار الهندسي والتقني المعتمد دولياً (BTEC Engineering)',
    subject: 'BTEC تقني',
    grade: 'مسار BTEC التقني',
    instructor: 'م. أحمد التميمي',
    modulesCount: 4,
    totalLessons: 16,
    simulationsCount: 4,
    status: 'published',
    completionRate: 89,
    modules: [
      {
        id: 'mod-6-1',
        title: 'الوحدة الأولى: الأنظمة الميكانيكية والهوائية',
        description: 'محاكاة ديناميكا الموائع وتجارب نفق الرياح الهوائي',
        lessons: [
          {
            id: 'les-6-1-1',
            title: 'محاكاة نفق الرياح وقوى الرفع والسحب (Aerodynamics)',
            durationMinutes: 55,
            simulationUrl: '/aerodynamics-wind-tunnel',
            simulationName: 'نفق الرياح الافتراضي 3D',
            hasQuiz: true,
            hasWorksheet: true,
            outcomes: ['حساب معامل السحب Cd والرفع Cl', 'تحليل خطوط الانسياب وضغط برنولي']
          }
        ]
      }
    ]
  }
];

export const LCMContentManager: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>('crs-1');

  // New Course Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    title: '',
    subject: 'فيزياء',
    grade: 'التوجيهي العلمي',
    instructor: 'أ. عمر الشناوي',
    modulesCount: 3,
    status: 'published' as 'published' | 'draft' | 'review'
  });

  // Filtered Courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = selectedGrade === 'all' || c.grade === selectedGrade;
    const matchesSubject = selectedSubject === 'all' || c.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesSubject && matchesStatus;
  });

  const handleTogglePublish = (courseId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const nextStatus = c.status === 'published' ? 'draft' : 'published';
        toast.success(`تم تغيير حالة المقرر ${c.code} إلى: ${nextStatus === 'published' ? 'منشور (Live)' : 'مسودة (Draft)'}`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast.success('تم حذف المقرر من النظام الأكاديمي');
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.code) {
      toast.error('يرجى إدخال اسم وكود المقرر');
      return;
    }

    const created: CourseItem = {
      id: 'crs-' + Date.now(),
      code: newCourse.code.toUpperCase(),
      title: newCourse.title,
      subject: newCourse.subject,
      grade: newCourse.grade,
      instructor: newCourse.instructor,
      modulesCount: newCourse.modulesCount,
      totalLessons: newCourse.modulesCount * 4,
      simulationsCount: 2,
      status: newCourse.status,
      completionRate: 100,
      modules: [
        {
          id: 'mod-' + Date.now(),
          title: 'الوحدة التأسيسية الأولى',
          description: 'نظرة شاملة ونتاجات التعلم المستهدفة للمقرر',
          lessons: [
            {
              id: 'les-' + Date.now(),
              title: 'الدرس الاستهلالي والمفاهيم الجوهرية',
              durationMinutes: 45,
              hasQuiz: true,
              hasWorksheet: true,
              outcomes: ['فهم الأسس النظرية والتطبيقية للمسار']
            }
          ]
        }
      ]
    };

    setCourses([created, ...courses]);
    setIsAddModalOpen(false);
    setNewCourse({
      code: '',
      title: '',
      subject: 'فيزياء',
      grade: 'التوجيهي العلمي',
      instructor: 'أ. عمر الشناوي',
      modulesCount: 3,
      status: 'published'
    });
    toast.success(`تم إنشاء المقرر الرقمي ${created.code} بنجاح وإدراجه في المنهج!`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-400/20 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              نظام إدارة المحتوى والمناهج التعليمية (EdTech LCM)
            </span>
            <Badge variant="outline" className="text-[11px] font-mono border-cyan-500/30 text-cyan-600">
              Curriculum Builder v2.0
            </Badge>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            إدارة المقررات الرقمية والوحدات التفاعلية
          </h2>
          <p className="text-xs text-slate-500">
            تصميم وبناء الخطط الدراسية، ربط الدروس بالمحاكيات 3D، وتعيين نتاجات التعلم
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-2xl text-xs gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مقرر رقمي جديد</span>
          </Button>
        </div>
      </div>

      {/* LCM Curriculum Statistics Counter Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="space-y-0.5 pr-2 border-r-2 border-cyan-500">
          <span className="text-[11px] text-slate-500">إجمالي المقررات المفهرسة</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{courses.length} مقرر</div>
          <span className="text-[10px] text-emerald-600 font-bold">100% معتمدة أكاديمياً</span>
        </div>
        <div className="space-y-0.5 pr-2 border-r-2 border-blue-500">
          <span className="text-[11px] text-slate-500">الدروس والأنشطة الرقمية</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {courses.reduce((acc, c) => acc + c.totalLessons, 0)} درساً
          </div>
          <span className="text-[10px] text-blue-600 font-bold">مدعومة بملفات تفاعلية</span>
        </div>
        <div className="space-y-0.5 pr-2 border-r-2 border-purple-500">
          <span className="text-[11px] text-slate-500">المحاكيات ثلاثية الأبعاد المربوطة</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">49 محاكاة 3D</div>
          <span className="text-[10px] text-purple-600 font-bold">ربط مباشر بنقرة واحدة</span>
        </div>
        <div className="space-y-0.5 pr-2 border-r-2 border-emerald-500">
          <span className="text-[11px] text-slate-500">معدل الإنجاز المنهجي</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">92.4%</div>
          <span className="text-[10px] text-emerald-600 font-bold">مواءمة هرم بلوم</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المقرر، الكود الأكاديمي، المعلم..."
            className="h-9 pr-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Grade Filter */}
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
        >
          <option value="all">كافة المراحل والصفوف</option>
          <option value="التوجيهي العلمي">التوجيهي العلمي</option>
          <option value="الأول ثانوي العلمي">الأول ثانوي العلمي</option>
          <option value="مسار BTEC التقني">مسار BTEC التقني</option>
          <option value="مسار الموهوبين و BTEC">الموهوبين والروبوتات</option>
        </select>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
        >
          <option value="all">كافة المباحث</option>
          <option value="فيزياء">فيزياء</option>
          <option value="كيمياء">كيمياء</option>
          <option value="أحياء">أحياء</option>
          <option value="رياضيات">رياضيات</option>
          <option value="روبوتات وذكاء">روبوتات وذكاء</option>
          <option value="BTEC تقني">BTEC تقني</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
        >
          <option value="all">كافة الحالات</option>
          <option value="published">منشور (Live)</option>
          <option value="draft">مسودة (Draft)</option>
          <option value="review">قيد المراجعة</option>
        </select>
      </div>

      {/* Courses Accordion / List */}
      <div className="space-y-4">
        {filteredCourses.map((course) => {
          const isExpanded = expandedCourseId === course.id;

          return (
            <div
              key={course.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
            >
              {/* Course Top Row */}
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-400/20">
                      {course.code}
                    </span>
                    <Badge variant="outline" className="text-[11px] font-bold">
                      {course.grade}
                    </Badge>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {course.subject}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      course.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-400/20' 
                        : 'bg-amber-500/10 text-amber-600 border border-amber-400/20'
                    }`}>
                      {course.status === 'published' ? 'منشور نشط ✓' : 'مسودة'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      المشرف: <strong className="text-slate-700 dark:text-slate-300">{course.instructor}</strong>
                    </span>
                    <span>•</span>
                    <span>{course.modulesCount} وحدات دراسية</span>
                    <span>•</span>
                    <span>{course.totalLessons} درساً تفاعلياً</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold">
                      <Atom className="w-3.5 h-3.5" /> {course.simulationsCount} محاكاة 3D
                    </span>
                  </div>
                </div>

                {/* Actions & Expansion Button */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  <Button
                    onClick={() => handleTogglePublish(course.id)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs"
                  >
                    {course.status === 'published' ? 'تحويل لمسودة' : 'نشر المقرر'}
                  </Button>

                  <Button
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs gap-1 bg-slate-50 dark:bg-slate-800/60"
                  >
                    <span>{isExpanded ? 'إخفاء الخطة' : 'عرض الخطة والدروس'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>

                  <Button
                    onClick={() => handleDeleteCourse(course.id)}
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-rose-500 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Collapsible Syllabus & Modules Breakdown */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-cyan-500" />
                        <span>الخطة الدراسية التفصيلية والدروس والمختبرات المرتبطة</span>
                      </h4>
                      <Badge variant="secondary" className="text-[10px]">
                        مخرجات متوافقة مع معايير الوزارة
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {course.modules.map((mod) => (
                        <div
                          key={mod.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                        >
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {mod.title}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{mod.description}</p>
                          </div>

                          <div className="space-y-2">
                            {mod.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                      {lesson.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ({lesson.durationMinutes} دقيقة)
                                    </span>
                                  </div>

                                  {/* Outcomes */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {lesson.outcomes.map((out, oi) => (
                                      <span
                                        key={oi}
                                        className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                      >
                                        ✓ {out}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Simulation & Assessment Badges */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {lesson.simulationUrl && (
                                    <Link to={lesson.simulationUrl} target="_blank">
                                      <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-lg">
                                        <Play className="w-3 h-3 fill-current" />
                                        <span>اختبار المحاكاة 3D</span>
                                      </Button>
                                    </Link>
                                  )}

                                  {lesson.hasQuiz && (
                                    <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-600">
                                      امتحان ذكي
                                    </Badge>
                                  )}
                                  {lesson.hasWorksheet && (
                                    <Badge variant="outline" className="text-[10px] border-emerald-400/40 text-emerald-600">
                                      ورقة عمل
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            لا توجد مقررات دراسية مطابقة لمعايير البحث.
          </div>
        )}
      </div>

      {/* Add New Course Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">إضافة مقرر رقمي جديد إلى LCM</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCourseSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">الكود الأكاديمي:</label>
                    <Input
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      placeholder="مثال: PHYS-102"
                      className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300">اسم المقرر:</label>
                    <Input
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder="مثال: الكهرومغناطيسية والدوائر المترددة"
                      className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">المبحث:</label>
                    <select
                      value={newCourse.subject}
                      onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })}
                      className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                    >
                      <option value="فيزياء">فيزياء</option>
                      <option value="كيمياء">كيمياء</option>
                      <option value="أحياء">أحياء</option>
                      <option value="رياضيات">رياضيات</option>
                      <option value="روبوتات وذكاء">روبوتات وذكاء</option>
                      <option value="BTEC تقني">BTEC تقني</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">المرحلة / الصف:</label>
                    <select
                      value={newCourse.grade}
                      onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
                      className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                    >
                      <option value="التوجيهي العلمي">التوجيهي العلمي</option>
                      <option value="الأول ثانوي العلمي">الأول ثانوي العلمي</option>
                      <option value="الصف العاشر">الصف العاشر</option>
                      <option value="مسار BTEC التقني">مسار BTEC التقني</option>
                      <option value="مسار الموهوبين و BTEC">الموهوبين والروبوتات</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">المعلم / المشرف المسند:</label>
                    <Input
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                      placeholder="اسم المعلم"
                      className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">عدد الوحدات:</label>
                    <Input
                      type="number"
                      value={newCourse.modulesCount}
                      onChange={(e) => setNewCourse({ ...newCourse, modulesCount: parseInt(e.target.value) || 3 })}
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
                    className="rounded-xl text-xs bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold"
                  >
                    إنشاء وإدراج المقرر
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
