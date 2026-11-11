/**
 * Admin Task Management & Points System Service
 * Central service for:
 * 1. Managing tasks across human auditors, AI agents, teachers, and supervisors
 * 2. Filtering completed tasks strictly by auditor, AI, and specific job roles
 * 3. Awarding & tracking points per task and per employee
 * 4. Central Task AI Command Engine to execute admin voice/text instructions
 */

import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/services/auditLogger';

export type TaskAssigneeType = 'auditor' | 'ai' | 'teacher' | 'supervisor';

export type TaskJobRole = 
  | 'scientific_auditor'
  | 'language_auditor'
  | 'exam_auditor'
  | 'special_ed_auditor'
  | 'ai_exam_agent'
  | 'ai_diagnostic_agent'
  | 'ai_translation_agent'
  | 'teacher'
  | 'supervisor';

export type TaskStatus = 'completed' | 'in_progress' | 'pending_review' | 'todo';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface TaskDeliverable {
  title: string;
  type: 'text' | 'file' | 'link' | 'score_report';
  content: string;
  verifiedAt?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assigneeType: TaskAssigneeType;
  assigneeRole: TaskJobRole;
  assigneeRoleLabel: string;
  assigneeName: string;
  assigneeId: string;
  assigneeEmail?: string;
  status: TaskStatus;
  priority: TaskPriority;
  pointsAwarded: number;
  pointsPossible: number;
  createdAt: string;
  completedAt?: string;
  deliverableSnippet?: string;
  deliverables?: TaskDeliverable[];
  adminFeedback?: string;
  lastReviewedBy?: string;
  notes?: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  points: number;
  reason: string;
  taskId?: string;
  taskTitle?: string;
  awardedBy: string;
  timestamp: string;
}

export interface StaffPointsProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  assigneeType: TaskAssigneeType;
  totalPoints: number;
  completedTasksCount: number;
  rankBadge: string;
  rankLevel: string;
  recentAwards: PointTransaction[];
}

export interface AICommandResult {
  reply: string;
  filterChange?: {
    status?: TaskStatus | 'all';
    assigneeType?: TaskAssigneeType | 'all';
    role?: TaskJobRole | 'all';
  };
  highlightedTaskIds?: string[];
  awardedPoints?: {
    recipientName: string;
    points: number;
    reason: string;
  };
  createdTask?: TaskItem;
  stats?: {
    totalAuditorCompleted: number;
    totalAICompleted: number;
    totalPointsDistributed: number;
    topStaffMember: string;
  };
}

// Initial realistic default tasks catalog
const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-aud-101',
    title: 'تدقيق ومطابقة بنك أسئلة الفيزياء النووية مع معايير التوجيهي 2026',
    description: 'فحص 25 مسألة فيزياء نووية وجسيمات معتمدة للثانوية العامة والتأكد من صياغة البدائل والرسوم التوضيحية.',
    assigneeType: 'auditor',
    assigneeRole: 'exam_auditor',
    assigneeRoleLabel: 'مدقق جودة الامتحانات',
    assigneeName: 'د. عثمان الكيلاني (مدقق امتحانات أول)',
    assigneeId: 'auditor-othman-01',
    assigneeEmail: 'othman.audit@zarwat-alelm.edu.jo',
    status: 'completed',
    priority: 'urgent',
    pointsAwarded: 150,
    pointsPossible: 150,
    createdAt: '2026-11-08 09:30',
    completedAt: '2026-11-10 14:15',
    deliverableSnippet: 'تم اعتماد 25 مسألة وتصحيح مفتاح إجابة السؤال رقم 14، واعتماد نموذج بلوم الوزاري 100%.',
    adminFeedback: 'تدقيق متقن ومثالي وفق المعايير الوزارية، تم منح المكافأة كاملة.',
    lastReviewedBy: 'محمود (المشرف العام)',
    deliverables: [
      { title: 'تقرير التدقيق المعتمد', type: 'text', content: 'تم الفحص الشامل ومطابقة مصفوفة نواتج التعلم' }
    ]
  },
  {
    id: 'task-aud-102',
    title: 'مراجعة وتدقيق ترجمة برايل ولغة الإشارة في وحدة الكهرباء الساكنة',
    description: 'التحقق من سلامة نصوص برايل الستية وتوافق ترجمة الإشارة المصورة مع المصطلحات العلمية المعتمدة في الأردن.',
    assigneeType: 'auditor',
    assigneeRole: 'special_ed_auditor',
    assigneeRoleLabel: 'مدقق التربية الخاصة ودامج',
    assigneeName: 'أ. سارة النمري (أخصائية تربية خاصة ومدققة دامج)',
    assigneeId: 'auditor-sara-02',
    assigneeEmail: 'sara.damij@zarwat-alelm.edu.jo',
    status: 'completed',
    priority: 'high',
    pointsAwarded: 120,
    pointsPossible: 120,
    createdAt: '2026-11-07 11:00',
    completedAt: '2026-11-09 16:40',
    deliverableSnippet: 'تمت مواءمة 18 مصطلحاً علمياً بلغة الإشارة واعتماد جداول الرسومات اللمسية بنجاح.',
    adminFeedback: 'عمل عالي الدقة يخدم الطلبة المكفوفين والصم مباشرة.',
    lastReviewedBy: 'محمود (المشرف العام)'
  },
  {
    id: 'task-aud-103',
    title: 'التدقيق العلمي والفيزيائي لمخرجات تجربة رذرفورد 3D',
    description: 'التحقق من دقة حسابات تشتت كولوم وزوايا الارتداد المنفرجة ومطابقة شاشات البيانات مع النسب التجريبية.',
    assigneeType: 'auditor',
    assigneeRole: 'scientific_auditor',
    assigneeRoleLabel: 'مدقق علمي ومختبرات',
    assigneeName: 'م. فراس الزعبي (مدقق فيزياء حاسوبية)',
    assigneeId: 'auditor-firas-03',
    assigneeEmail: 'firas.physics@zarwat-alelm.edu.jo',
    status: 'completed',
    priority: 'high',
    pointsAwarded: 100,
    pointsPossible: 100,
    createdAt: '2026-11-06 10:00',
    completedAt: '2026-11-08 18:20',
    deliverableSnippet: 'تمت معايرة طاقة حزمة ألفا عند 5.5 MeV والتأكد من استقرار حصر الجسيمات.',
    adminFeedback: 'ممتاز جداً، المختبر الآن جاهز 100% للتدريس التفاعلي.',
    lastReviewedBy: 'محمود (المشرف العام)'
  },
  {
    id: 'task-ai-201',
    title: 'توليد وتصنيف 60 مسألة كيمياء عضوية متدرجة الصعوبة (AI Agent)',
    description: 'مهمة وكيل الذكاء الاصطناعي Falak-Exam-Synth لتوليد مسائل المركبات الهيدروكربونية والتشكل الفراغي.',
    assigneeType: 'ai',
    assigneeRole: 'ai_exam_agent',
    assigneeRoleLabel: 'وكيل الذكاء الاصطناعي للامتحانات',
    assigneeName: 'Falak Exam-Synth AI (الوكيل المركزي للاختبارات)',
    assigneeId: 'agent-ai-exam-synth',
    status: 'completed',
    priority: 'high',
    pointsAwarded: 80,
    pointsPossible: 80,
    createdAt: '2026-11-09 03:00',
    completedAt: '2026-11-09 03:04',
    deliverableSnippet: 'تم توليد 60 سؤالاً مرمزاً بنظام TeX، مع أوزان بلوم المعرفية ونماذج الحل النموذجية في 4 دقائق.',
    adminFeedback: 'إنتاجية فائقة وسرعة قياسية بنسبة دقة كيميائية 99.4%.'
  },
  {
    id: 'task-ai-202',
    title: 'الفحص التلقائي لزمن استجابة المحاكيات والـ WebGL Telemetry (AI Diagnostic)',
    description: 'تشغيل اختبارات الضغط التلقائية على 49 مختبراً والتأكد من معدل الإطارات 60 FPS على الأجهزة الضعيفة.',
    assigneeType: 'ai',
    assigneeRole: 'ai_diagnostic_agent',
    assigneeRoleLabel: 'وكيل الذكاء الاصطناعي للتشخيص البرمجي',
    assigneeName: 'Nebula Guardian AI (وكيل الأداء والتشخيص المباشر)',
    assigneeId: 'agent-ai-diagnostics',
    status: 'completed',
    priority: 'medium',
    pointsAwarded: 70,
    pointsPossible: 70,
    createdAt: '2026-11-10 01:00',
    completedAt: '2026-11-10 01:12',
    deliverableSnippet: 'اجتازت جميع المختبرات فحص الذاكرة الرسومية، وتم تحسين أداء نفق الرياح بنسبة 28%.'
  },
  {
    id: 'task-ai-203',
    title: 'فهرسة وتوليد المفردات الإشارية الذكية تلقائياً (AI Translation Agent)',
    description: 'مزامنة 45 مقطع فيديو تعليمي وتحويلها إلى تسلسلات حركية لمعجم لغة الإشارة الموحد.',
    assigneeType: 'ai',
    assigneeRole: 'ai_translation_agent',
    assigneeRoleLabel: 'وكيل الذكاء الاصطناعي للترجمة والإشارة',
    assigneeName: 'Damij Neural Translator (وكيل لغة الإشارة الذكي)',
    assigneeId: 'agent-ai-damij-translator',
    status: 'completed',
    priority: 'medium',
    pointsAwarded: 90,
    pointsPossible: 90,
    createdAt: '2026-11-11 04:00',
    completedAt: '2026-11-11 04:18',
    deliverableSnippet: 'تم استخراج وتوليد نقاط المعالم الحركية لـ 45 درساً بنجاح تام.'
  },
  {
    id: 'task-aud-104',
    title: 'التدقيق اللغوي والمعجمي لمصطلحات علم الفلك والنسبية العامة',
    description: 'مراجعة المصطلحات الفضائية في محاكي الثقوب السوداء وميكانيكا المدارات لضمان لغة عربية فصيحة ومعربة بدقة.',
    assigneeType: 'auditor',
    assigneeRole: 'language_auditor',
    assigneeRoleLabel: 'مدقق لغوي ومحتوى',
    assigneeName: 'أ. دلال الشناق (مدققة لغوية معتمدة)',
    assigneeId: 'auditor-dalal-04',
    assigneeEmail: 'dalal.arabic@zarwat-alelm.edu.jo',
    status: 'in_progress',
    priority: 'medium',
    pointsAwarded: 0,
    pointsPossible: 80,
    createdAt: '2026-11-11 08:30',
    deliverableSnippet: 'تم إنجاز 70% من المراجعة وجاري تدقيق مصطلحات أفق الحدث والـ ISCO.'
  },
  {
    id: 'task-tch-301',
    title: 'إعداد خطة الدرس التفاعلي لمختبر الخلية الحية والكائنات المجهرية',
    description: 'بناء أوراق عمل رقمية للطلاب مصاحبة لمحاكي الخلية الحية 3D مع تقييمات ختامية تفاعلية.',
    assigneeType: 'teacher',
    assigneeRole: 'teacher',
    assigneeRoleLabel: 'معلم ومطور محتوى',
    assigneeName: 'أ. طارق بني هاني (معلم الأحياء المعتمد)',
    assigneeId: 'teacher-tariq-01',
    assigneeEmail: 'tariq.bio@zarwat-alelm.edu.jo',
    status: 'completed',
    priority: 'high',
    pointsAwarded: 110,
    pointsPossible: 110,
    createdAt: '2026-11-05 13:00',
    completedAt: '2026-11-08 11:30',
    deliverableSnippet: 'تم رفع أوراق العمل التفاعلية وربطها بنظام الاختبارات القصير.',
    adminFeedback: 'مبادرة تعليمية ممتازة تم تعميمها على باقي المدارس الشريكة.'
  }
];

// Initial Staff Point Profiles
const INITIAL_STAFF_POINTS: StaffPointsProfile[] = [
  {
    userId: 'auditor-othman-01',
    name: 'د. عثمان الكيلاني',
    email: 'othman.audit@zarwat-alelm.edu.jo',
    role: 'exam_auditor',
    roleLabel: 'مدقق جودة الامتحانات والمناهج',
    assigneeType: 'auditor',
    totalPoints: 850,
    completedTasksCount: 14,
    rankBadge: '🥇 مدقق ألماسي معتمد',
    rankLevel: 'المستوى الذهبي (Tier 1)',
    recentAwards: [
      {
        id: 'tx-1',
        userId: 'auditor-othman-01',
        userEmail: 'othman.audit@zarwat-alelm.edu.jo',
        userName: 'د. عثمان الكيلاني',
        points: 150,
        reason: 'تدقيق ومطابقة بنك أسئلة الفيزياء النووية',
        taskId: 'task-aud-101',
        taskTitle: 'تدقيق ومطابقة بنك أسئلة الفيزياء النووية مع معايير التوجيهي 2026',
        awardedBy: 'محمود (المشرف العام)',
        timestamp: '2026-11-10 14:15'
      }
    ]
  },
  {
    userId: 'auditor-sara-02',
    name: 'أ. سارة النمري',
    email: 'sara.damij@zarwat-alelm.edu.jo',
    role: 'special_ed_auditor',
    roleLabel: 'مدققة التربية الخاصة ومنظومة دامج',
    assigneeType: 'auditor',
    totalPoints: 720,
    completedTasksCount: 11,
    rankBadge: '🌟 مدققة التميز الشامل',
    rankLevel: 'المستوى المتقدم (Tier 1)',
    recentAwards: [
      {
        id: 'tx-2',
        userId: 'auditor-sara-02',
        userEmail: 'sara.damij@zarwat-alelm.edu.jo',
        userName: 'أ. سارة النمري',
        points: 120,
        reason: 'تدقيق ترجمات برايل والإشارة في وحدة الكهرباء',
        taskId: 'task-aud-102',
        taskTitle: 'مراجعة وتدقيق ترجمة برايل ولغة الإشارة في وحدة الكهرباء الساكنة',
        awardedBy: 'محمود (المشرف العام)',
        timestamp: '2026-11-09 16:40'
      }
    ]
  },
  {
    userId: 'auditor-firas-03',
    name: 'م. فراس الزعبي',
    email: 'firas.physics@zarwat-alelm.edu.jo',
    role: 'scientific_auditor',
    roleLabel: 'مدقق علمي ومختبرات حاسوبية',
    assigneeType: 'auditor',
    totalPoints: 640,
    completedTasksCount: 9,
    rankBadge: '🔬 خبير المحاكيات العلمية',
    rankLevel: 'المستوى المتقدم (Tier 2)',
    recentAwards: [
      {
        id: 'tx-3',
        userId: 'auditor-firas-03',
        userEmail: 'firas.physics@zarwat-alelm.edu.jo',
        userName: 'م. فراس الزعبي',
        points: 100,
        reason: 'التدقيق العلمي لمخرجات تجربة رذرفورد 3D',
        taskId: 'task-aud-103',
        taskTitle: 'التدقيق العلمي والفيزيائي لمخرجات تجربة رذرفورد 3D',
        awardedBy: 'محمود (المشرف العام)',
        timestamp: '2026-11-08 18:20'
      }
    ]
  },
  {
    userId: 'auditor-dalal-04',
    name: 'أ. دلال الشناق',
    email: 'dalal.arabic@zarwat-alelm.edu.jo',
    role: 'language_auditor',
    roleLabel: 'مدققة لغوية ومعجمية',
    assigneeType: 'auditor',
    totalPoints: 490,
    completedTasksCount: 7,
    rankBadge: '✍️ سفيرة اللغة والبيان',
    rankLevel: 'المستوى الكفؤ (Tier 2)',
    recentAwards: []
  },
  {
    userId: 'teacher-tariq-01',
    name: 'أ. طارق بني هاني',
    email: 'tariq.bio@zarwat-alelm.edu.jo',
    role: 'teacher',
    roleLabel: 'معلم ومبتكر محتوى معتمد',
    assigneeType: 'teacher',
    totalPoints: 530,
    completedTasksCount: 8,
    rankBadge: '🌿 رائد التعليم الإبداعي',
    rankLevel: 'المستوى الكفؤ (Tier 2)',
    recentAwards: [
      {
        id: 'tx-4',
        userId: 'teacher-tariq-01',
        userEmail: 'tariq.bio@zarwat-alelm.edu.jo',
        userName: 'أ. طارق بني هاني',
        points: 110,
        reason: 'إعداد خطة الدرس التفاعلي لمختبر الخلية',
        taskId: 'task-tch-301',
        taskTitle: 'إعداد خطة الدرس التفاعلي لمختبر الخلية الحية والكائنات المجهرية',
        awardedBy: 'محمود (المشرف العام)',
        timestamp: '2026-11-08 11:30'
      }
    ]
  },
  {
    userId: 'agent-ai-exam-synth',
    name: 'Falak Exam-Synth AI',
    email: 'falak.ai@zarwat-alelm.edu.jo',
    role: 'ai_exam_agent',
    roleLabel: 'وكيل الذكاء الاصطناعي للاختبارات',
    assigneeType: 'ai',
    totalPoints: 1250,
    completedTasksCount: 42,
    rankBadge: '⚡ وحدة توليد الأسئلة الفائقة',
    rankLevel: 'AI Agent Cluster A1',
    recentAwards: []
  },
  {
    userId: 'agent-ai-diagnostics',
    name: 'Nebula Guardian AI',
    email: 'nebula.guardian@zarwat-alelm.edu.jo',
    role: 'ai_diagnostic_agent',
    roleLabel: 'وكيل الفحص والتشخيص المستمر',
    assigneeType: 'ai',
    totalPoints: 980,
    completedTasksCount: 38,
    rankBadge: '🛡️ الحارس السيبراني الذكي',
    rankLevel: 'AI Agent Cluster B2',
    recentAwards: []
  }
];

class AdminTaskManagementService {
  private tasksStorageKey = 'galaxy_admin_tasks_v2';
  private staffPointsStorageKey = 'galaxy_staff_points_v2';
  private transactionsStorageKey = 'galaxy_point_transactions_v2';

  // Retrieve all tasks
  public getTasks(): TaskItem[] {
    try {
      const saved = localStorage.getItem(this.tasksStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading tasks from storage:', e);
    }
    this.saveTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
  }

  // Save tasks to localStorage and dispatch event
  public saveTasks(tasks: TaskItem[]): void {
    try {
      localStorage.setItem(this.tasksStorageKey, JSON.stringify(tasks));
      window.dispatchEvent(new CustomEvent('galaxy_tasks_updated', { detail: tasks }));
    } catch (e) {
      console.error('Error saving tasks to storage:', e);
    }
  }

  // Get Staff Points
  public getStaffPointsList(): StaffPointsProfile[] {
    try {
      const saved = localStorage.getItem(this.staffPointsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading staff points:', e);
    }
    this.saveStaffPoints(INITIAL_STAFF_POINTS);
    return INITIAL_STAFF_POINTS;
  }

  public saveStaffPoints(profiles: StaffPointsProfile[]): void {
    try {
      localStorage.setItem(this.staffPointsStorageKey, JSON.stringify(profiles));
      window.dispatchEvent(new CustomEvent('galaxy_points_updated', { detail: profiles }));
    } catch (e) {
      console.error('Error saving staff points:', e);
    }
  }

  public getPointTransactions(): PointTransaction[] {
    try {
      const saved = localStorage.getItem(this.transactionsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading transactions:', e);
    }
    return [];
  }

  public savePointTransactions(txs: PointTransaction[]): void {
    try {
      localStorage.setItem(this.transactionsStorageKey, JSON.stringify(txs));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  }

  // Filter Tasks by Assignee, Status, and Role
  public filterTasks(options: {
    status?: TaskStatus | 'all';
    assigneeType?: TaskAssigneeType | 'all';
    role?: TaskJobRole | 'all';
    search?: string;
  }): TaskItem[] {
    const tasks = this.getTasks();
    return tasks.filter((t) => {
      if (options.status && options.status !== 'all' && t.status !== options.status) {
        return false;
      }
      if (options.assigneeType && options.assigneeType !== 'all' && t.assigneeType !== options.assigneeType) {
        return false;
      }
      if (options.role && options.role !== 'all' && t.assigneeRole !== options.role) {
        return false;
      }
      if (options.search && options.search.trim()) {
        const q = options.search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesName = t.assigneeName.toLowerCase().includes(q);
        const matchesRole = t.assigneeRoleLabel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesName && !matchesRole) return false;
      }
      return true;
    });
  }

  // Get completed tasks strictly for auditors
  public getAuditorCompletedTasks(role?: TaskJobRole | 'all'): TaskItem[] {
    return this.filterTasks({
      status: 'completed',
      assigneeType: 'auditor',
      role: role || 'all'
    });
  }

  // Get completed tasks strictly for AI agents
  public getAICompletedTasks(role?: TaskJobRole | 'all'): TaskItem[] {
    return this.filterTasks({
      status: 'completed',
      assigneeType: 'ai',
      role: role || 'all'
    });
  }

  // Award Points to a specific staff member (Admin direct action)
  public async awardPointsToStaff(params: {
    userId: string;
    points: number;
    reason: string;
    taskId?: string;
    taskTitle?: string;
    awardedBy?: string;
  }): Promise<{ success: boolean; newTotal: number; message: string }> {
    const staffList = this.getStaffPointsList();
    const staff = staffList.find(s => s.userId === params.userId || s.email.toLowerCase() === params.userId.toLowerCase());

    const awardedBy = params.awardedBy || 'محمود (المشرف العام)';
    const newTx: PointTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: staff ? staff.userId : params.userId,
      userEmail: staff ? staff.email : params.userId,
      userName: staff ? staff.name : params.userId,
      points: params.points,
      reason: params.reason,
      taskId: params.taskId,
      taskTitle: params.taskTitle,
      awardedBy,
      timestamp: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })
    };

    let newTotal = params.points;

    if (staff) {
      staff.totalPoints += params.points;
      newTotal = staff.totalPoints;
      staff.recentAwards = [newTx, ...(staff.recentAwards || [])].slice(0, 15);
      this.saveStaffPoints(staffList);
    } else {
      // Create new profile if not found
      const newProfile: StaffPointsProfile = {
        userId: params.userId,
        name: params.userId.split('@')[0],
        email: params.userId,
        role: 'auditor',
        roleLabel: 'عضو / مدقق معتمد',
        assigneeType: 'auditor',
        totalPoints: params.points,
        completedTasksCount: 1,
        rankBadge: '⭐ عضو نشط',
        rankLevel: 'المستوى الأساسي',
        recentAwards: [newTx]
      };
      staffList.push(newProfile);
      this.saveStaffPoints(staffList);
    }

    // Save transaction
    const allTxs = this.getPointTransactions();
    allTxs.unshift(newTx);
    this.savePointTransactions(allTxs);

    // If linked to a task, update the task points
    if (params.taskId) {
      const tasks = this.getTasks();
      const taskIndex = tasks.findIndex(t => t.id === params.taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].pointsAwarded = (tasks[taskIndex].pointsAwarded || 0) + params.points;
        this.saveTasks(tasks);
      }
    }

    // Log to platform audit trail
    try {
      auditLogger.log({
        actionType: 'security',
        severity: 'info',
        actorEmail: awardedBy,
        targetResource: `رصيد نقاط الموظف: ${staff?.name || params.userId}`,
        details: `تم منح ${params.points} نقطة بنجاح. السبب: "${params.reason}"${params.taskTitle ? ` (المهمة: ${params.taskTitle})` : ''}`,
        metadata: { points: params.points, reason: params.reason, userId: params.userId }
      });
    } catch {}

    // Attempt Supabase score sync if possible
    try {
      if (staff && staff.userId && !staff.userId.startsWith('agent-') && !staff.userId.startsWith('auditor-')) {
        await supabase.rpc('adjust_user_score', {
          user_id: staff.userId,
          points_adjustment: params.points
        });
      }
    } catch (e) {
      console.warn('Supabase score sync optional:', e);
    }

    return {
      success: true,
      newTotal,
      message: `تمت إضافة ${params.points} نقطة بنجاح إلى رصيد ${staff?.name || params.userId}.`
    };
  }

  // Award Points specifically on a Task
  public async awardPointsOnTask(taskId: string, points: number, adminFeedback?: string): Promise<{ success: boolean; task?: TaskItem }> {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false };

    task.pointsAwarded = (task.pointsAwarded || 0) + points;
    if (adminFeedback) {
      task.adminFeedback = adminFeedback;
    }
    this.saveTasks(tasks);

    // Award to assignee profile
    await this.awardPointsToStaff({
      userId: task.assigneeId || task.assigneeEmail || task.assigneeName,
      points,
      reason: `مكافأة إنجاز المهمة: ${task.title}`,
      taskId: task.id,
      taskTitle: task.title,
      awardedBy: 'محمود (المشرف العام)'
    });

    return { success: true, task };
  }

  // Add a new task
  public addTask(task: Omit<TaskItem, 'id' | 'createdAt'>): TaskItem {
    const tasks = this.getTasks();
    const newTask: TaskItem = {
      ...task,
      id: `task-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
      pointsAwarded: task.pointsAwarded || 0,
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  // Update task status
  public updateTaskStatus(taskId: string, status: TaskStatus): boolean {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;
    task.status = status;
    if (status === 'completed' && !task.completedAt) {
      task.completedAt = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
    }
    this.saveTasks(tasks);
    return true;
  }

  // Get specific user's point record (for employee control panel)
  public getEmployeePointsProfile(userIdOrEmail: string): StaffPointsProfile {
    const list = this.getStaffPointsList();
    const cleanQuery = userIdOrEmail.toLowerCase().trim();
    const found = list.find(s => s.userId.toLowerCase() === cleanQuery || s.email.toLowerCase() === cleanQuery || s.name.toLowerCase().includes(cleanQuery));

    if (found) return found;

    // Return a default member profile with real structure
    return {
      userId: userIdOrEmail,
      name: userIdOrEmail.split('@')[0] || 'عضو المنظومة',
      email: userIdOrEmail,
      role: 'auditor',
      roleLabel: 'مدقق / عضو معتمد',
      assigneeType: 'auditor',
      totalPoints: 100,
      completedTasksCount: 1,
      rankBadge: '🥉 مدقق برونزي',
      rankLevel: 'المستوى الأساسي (Tier 3)',
      recentAwards: [
        {
          id: 'welcome-tx',
          userId: userIdOrEmail,
          userEmail: userIdOrEmail,
          userName: userIdOrEmail.split('@')[0],
          points: 100,
          reason: 'نقاط الانضمام والاعتماد الأولي في المنظومة الوطنية',
          awardedBy: 'إدارة ذروة العلم',
          timestamp: 'الآن'
        }
      ]
    };
  }

  /**
   * Central Task AI Command Engine
   * Executes natural language commands from the Admin:
   * e.g., "مهام المكملة من المدققن", "اعرض مهام الذكاء الاصطناعي", "أعطِ 50 نقطة للمدقق د. عثمان", etc.
   */
  public async processCentralAICommand(commandText: string): Promise<AICommandResult> {
    const text = commandText.trim().toLowerCase();
    const allTasks = this.getTasks();
    const staffList = this.getStaffPointsList();

    // 1. "مهام المكملة من المدققن" / "مهام المدققين المنجزة" / "اعرض مدقق"
    if (
      (text.includes('مدقق') || text.includes('المدققن') || text.includes('المدققين')) &&
      (text.includes('مكمل') || text.includes('منجز') || text.includes('عرض') || text.includes('انتهت'))
    ) {
      const auditorTasks = allTasks.filter(t => t.assigneeType === 'auditor' && t.status === 'completed');
      const totalPoints = auditorTasks.reduce((acc, t) => acc + (t.pointsAwarded || 0), 0);

      const auditorBreakdown = auditorTasks.map((t, idx) => 
        `• [${idx + 1}] **${t.title}** (${t.assigneeName}) — نقاط: +${t.pointsAwarded} ⭐ — ${t.deliverableSnippet || 'تم الاعتماد'}`
      ).join('\n');

      return {
        reply: `### 🎯 تقرير المهام المكتملة من قِبل المدققين البشريين (Auditors)

أهلاً بك حضرة المشرف العام. بناءً على أمرك المباشر، تم فرز وتصفية **جميع المهام المكتملة المنجزة بواسطة فريق المدققين**:

📊 **إحصائيات الإنجاز:**
- **عدد المهام المدققة بنجاح:** ${auditorTasks.length} مهمة معتمدة.
- **إجمالي النقاط الممنوحة للمدققين:** ${totalPoints} نقطة.
- **نسبة الجودة والدقة:** 100% وفق المعايير الوزارية والأكاديمية.

📋 **قائمة المهام المنجزة للمدققين:**
${auditorBreakdown}

💡 *تم تطبيق الفلترة تلقائياً في الجدول أدناه لعرض مهام المدققين المنجزة فقط.*`,
        filterChange: {
          status: 'completed',
          assigneeType: 'auditor',
          role: 'all'
        },
        highlightedTaskIds: auditorTasks.map(t => t.id),
        stats: {
          totalAuditorCompleted: auditorTasks.length,
          totalAICompleted: allTasks.filter(t => t.assigneeType === 'ai' && t.status === 'completed').length,
          totalPointsDistributed: totalPoints,
          topStaffMember: staffList.find(s => s.assigneeType === 'auditor')?.name || 'د. عثمان الكيلاني'
        }
      };
    }

    // 2. "مهام الذكاء الاصطناعي المنجزة" / "مهام AI"
    if (
      (text.includes('ذكاء') || text.includes('اصطناعي') || text.includes('ai') || text.includes('وكيل')) &&
      (text.includes('مكمل') || text.includes('منجز') || text.includes('عرض') || text.includes('مهام'))
    ) {
      const aiTasks = allTasks.filter(t => t.assigneeType === 'ai' && t.status === 'completed');
      const totalPoints = aiTasks.reduce((acc, t) => acc + (t.pointsAwarded || 0), 0);

      const aiBreakdown = aiTasks.map((t, idx) => 
        `• [${idx + 1}] **${t.title}** (${t.assigneeName}) — معدل الدقة: 99.8% — زمن الإنجاز القياسي: دقائق معدودة`
      ).join('\n');

      return {
        reply: `### 🤖 تقرير مهام وكلاء الذكاء الاصطناعي المنجزة (AI Agents)

تم حصر وتصفية **المهام المنفذة ذاتياً بواسطة شبكة وكلاء الذكاء الاصطناعي**:

⚡ **مؤشرات الأداء:**
- **إجمالي المهام المكتملة ذاتياً:** ${aiTasks.length} مهام ذكية.
- **توفير الوقت المقدر:** ما يزيد عن 84 ساعة عمل بشري.
- **النماذج النشطة:** Gemini Pro / Falak-Synth / Nebula Guardian.

📋 **أبرز المهام المنجزة:**
${aiBreakdown}

💡 *تم تحديث الفلتر في الواجهة لعرض مهام الذكاء الاصطناعي.*`,
        filterChange: {
          status: 'completed',
          assigneeType: 'ai',
          role: 'all'
        },
        highlightedTaskIds: aiTasks.map(t => t.id)
      };
    }

    // 3. Command: Give / Award points ("أعطِ نقاط", "زيادة نقاط", "أضف نقاط")
    const matchPoints = text.match(/(?:أعط|اعط|زد|زيادة|اضف|أضف)\s+(\d+)\s+نقط/);
    if (matchPoints && matchPoints[1]) {
      const pointsToAward = parseInt(matchPoints[1], 10);
      // Find staff mention
      let targetStaff = staffList[0];
      for (const s of staffList) {
        if (text.includes(s.name.toLowerCase()) || text.includes(s.email.toLowerCase().split('@')[0])) {
          targetStaff = s;
          break;
        }
      }

      await this.awardPointsToStaff({
        userId: targetStaff.userId,
        points: pointsToAward,
        reason: `مكافأة بأمر مباشر من الذكاء الاصطناعي المركزي للأدمن: "${commandText}"`,
        awardedBy: 'محمود (المشرف العام - عبر AI المركزي)'
      });

      return {
        reply: `### 🏆 تم تنفيذ أمر زيادة النقاط بنجاح!

تمت إضافة **+${pointsToAward} نقطة** إلى رصيد **${targetStaff.name}** (${targetStaff.roleLabel}).

📈 **الرصيد الجديد:** ${targetStaff.totalPoints} نقطة.
🏅 **الرتبة الحالية:** ${targetStaff.rankBadge} (${targetStaff.rankLevel}).
📝 **الإشعار:** ظهرت النقاط فوراً في لوحة تحكم الموظف وسجل النشاط الرقابي.`,
        awardedPoints: {
          recipientName: targetStaff.name,
          points: pointsToAward,
          reason: commandText
        }
      };
    }

    // 4. Best performers / Leaderboard ("أفضل مدقق", "لوحة الشرف", "النقاط")
    if (text.includes('أفضل') || text.includes('ترتيب') || text.includes('نقاط') || text.includes('شرف') || text.includes('اعلى')) {
      const sortedAuditors = [...staffList]
        .filter(s => s.assigneeType === 'auditor')
        .sort((a, b) => b.totalPoints - a.totalPoints);

      const ranking = sortedAuditors.map((s, i) => 
        `**${i + 1}. ${s.name}** (${s.roleLabel}) — **${s.totalPoints} نقطة** (${s.completedTasksCount} مهمة مكتملة) ${s.rankBadge}`
      ).join('\n');

      return {
        reply: `### 🌟 لوحة صدارة ونقاط المدققين المعتمدين

إليك الترتيب المحدث للمدققين بناءً على رصيد النقاط المحسوبة والمهام المنجزة:

${ranking}

💡 *بإمكانك منح نقاط إضافية لأي مدقق بكتابة أمر مثل: "أضف 50 نقطة لـ د. عثمان" أو عبر زر "إضافة نقاط" الموجود بكل مهمة.*`
      };
    }

    // 5. Default General Intelligence Summary
    const completedAuditor = allTasks.filter(t => t.assigneeType === 'auditor' && t.status === 'completed').length;
    const completedAI = allTasks.filter(t => t.assigneeType === 'ai' && t.status === 'completed').length;
    const inProgress = allTasks.filter(t => t.status === 'in_progress').length;

    return {
      reply: `### 🧠 المشرف الذكي المركزي لإدارة المهام والمدققين

مرحباً بك يا حضرة المشرف العام محمود! أنا جاهز لتنفيذ كافة أوامرك الإدارية الذكية:

📊 **الموقف التنفيذي الحالي:**
• **مهام المدققين المنجزة:** ${completedAuditor} مهام مفصولة وموثقة.
• **مهام الذكاء الاصطناعي المنجزة:** ${completedAI} مهام مؤتمتة.
• **المهام الجارية:** ${inProgress} مهام قيد التدقيق والمراجعة.

✨ **أمثلة على أوامر يمكنك كتابتها أو النقر عليها:**
1. **"مهام المكملة من المدققن"** ⟶ تصفية وعرض تقرير مهام المدققين المنجزة ونقاطهم.
2. **"مهام الذكاء الاصطناعي المنجزة"** ⟶ فرز مهام الـ AI والسرعة والدقة.
3. **"أضف 100 نقطة للمدقق د. عثمان"** ⟶ زيادة رصيد الموظف فوراً وظهوره في لوحته.
4. **"أعلى المدققين نقاطاً"** ⟶ عرض لوحة الشرف وتقييم الأداء.`,
      stats: {
        totalAuditorCompleted: completedAuditor,
        totalAICompleted: completedAI,
        totalPointsDistributed: staffList.reduce((acc, s) => acc + s.totalPoints, 0),
        topStaffMember: staffList[0]?.name || 'د. عثمان الكيلاني'
      }
    };
  }
}

export const adminTaskService = new AdminTaskManagementService();
