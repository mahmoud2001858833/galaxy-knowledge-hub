/**
 * Zarwat Al-Elm 2.0 — Unified Student Mastery Passport & Gamification Engine
 *
 * Unifies all student achievements across the platform into a single Sovereign Academic Passport:
 * 1. 3D Virtual Simulations (out of 49 official simulations)
 * 2. Spaced Repetition Flashcards & Memory Palace Mnemonics
 * 3. Scientific Puzzles & Olympiads
 * 4. Smart Exams & Lesson Exit Tickets
 * 5. AI Socratic Tutor & Multimodal Problem Solving
 */

import { toast } from 'sonner';

export type PassportActivityType =
  | 'lab'
  | 'spaced_repetition'
  | 'puzzle'
  | 'exam'
  | 'ai_tutor';

export interface PassportActivityRecord {
  id: string;
  type: PassportActivityType;
  title: string;
  subject: string;
  xpEarned: number;
  timestamp: string;
  route?: string;
}

export interface DomainMasteryItem {
  id: string;
  name: string;
  scorePct: number;
  completedCount: number;
  targetCount: number;
  color: string;
}

export interface SovereignPassportBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requiredXp: number;
  unlocked: boolean;
}

export interface StudentMasteryPassportState {
  passportId: string;
  totalXp: number;
  level: number;
  rankTitle: string;
  nextLevelXp: number;
  currentLevelMinXp: number;
  progressPct: number;
  streakDays: number;
  pillars: {
    labsCompleted: number;
    totalLabs: number;
    flashcardsMastered: number;
    puzzlesSolved: number;
    examsPassed: number;
    aiSessionsCompleted: number;
  };
  domainMastery: DomainMasteryItem[];
  badges: SovereignPassportBadge[];
  recentActivities: PassportActivityRecord[];
}

const STORAGE_KEY = 'galaxy_student_passport_v2';

const DEFAULT_ACTIVITIES: PassportActivityRecord[] = [
  {
    id: 'act-init-1',
    type: 'lab',
    title: 'إتمام محاكاة قانون هوك وثابت المرونة 3D',
    subject: 'الفيزياء',
    xpEarned: 50,
    timestamp: 'اليوم',
    route: '/workbench/hookes-law',
  },
  {
    id: 'act-init-2',
    type: 'spaced_repetition',
    title: 'توليد قصر ذاكرة ومراجعة 15 بطاقة تكرار متباعد',
    subject: 'التكرار المتباعد',
    xpEarned: 45,
    timestamp: 'اليوم',
    route: '/spaced-repetition',
  },
  {
    id: 'act-init-3',
    type: 'ai_tutor',
    title: 'حل مسألة فيزيائية مع المرشد الأكاديمي الشامل',
    subject: 'الذكاء الاصطناعي',
    xpEarned: 35,
    timestamp: 'أمس',
    route: '/ai-assistant-section',
  },
  {
    id: 'act-init-4',
    type: 'puzzle',
    title: 'اجتياز تحدي الروابط التساهمية وجدول مندليف',
    subject: 'الكيمياء',
    xpEarned: 40,
    timestamp: 'أمس',
    route: '/subject-puzzles',
  },
  {
    id: 'act-init-5',
    type: 'exam',
    title: 'اجتياز تذكرة الخروج التفاعلية لدرس البصريات الهندسية',
    subject: 'الامتحانات الذكية',
    xpEarned: 60,
    timestamp: 'قبل يومين',
    route: '/workbench/geometric-optics-basics',
  },
];

const SOVEREIGN_BADGES_CATALOG: Omit<SovereignPassportBadge, 'unlocked'>[] = [
  {
    id: 'badge-newton',
    title: 'وسام نيوتن للميكانيكا 3D',
    description: 'إتمام تجارب القوى والحركة والمرونة في المختبر الثلاثي الأبعاد',
    icon: '🍎',
    category: 'مختبرات 3D',
    requiredXp: 250,
  },
  {
    id: 'badge-memory',
    title: 'وسام سيد قصر الذاكرة',
    description: 'الالتزام بنظام التكرار المتباعد وتوليد حيل الحفظ الذكية',
    icon: '🧠',
    category: 'التكرار المتباعد',
    requiredXp: 450,
  },
  {
    id: 'badge-optics',
    title: 'وسام الحسن بن الهيثم للبصريات',
    description: 'إتقان تجارب انكسار الضوء والعدسات والتداخل الموجي',
    icon: '🔬',
    category: 'فيزياء ضوئية',
    requiredXp: 700,
  },
  {
    id: 'badge-ai-pioneer',
    title: 'وسام المستقصي السقراطي الذكي',
    description: 'حل المسائل العلمية وبناء الخرائط المفاهيمية بالذكاء الاصطناعي',
    icon: '🤖',
    category: 'ذكاء اصطناعي',
    requiredXp: 950,
  },
  {
    id: 'badge-khwarizmi',
    title: 'وسام الخوارزمي للألغاز والبرمجة',
    description: 'حل الألغاز الرياضية وبناء المشاريع في استوديو البرمجة',
    icon: '📐',
    category: 'رياضيات وبرمجة',
    requiredXp: 1300,
  },
  {
    id: 'badge-medic',
    title: 'وسام المسعف المدرسي المعتمد',
    description: 'إتقان بروتوكولات التدخل السريع في أول 60 ثانية للطوارئ المدرسية',
    icon: '🩺',
    category: 'صحة مدرسية',
    requiredXp: 1700,
  },
  {
    id: 'badge-quantum',
    title: 'وسام آينشتاين لميكانيكا الكم',
    description: 'استكشاف الدالة الموجية وبناء النواة ومسرع الهادرونات LHC',
    icon: '⚛️',
    category: 'فيزياء حديثة',
    requiredXp: 2400,
  },
  {
    id: 'badge-sovereign',
    title: 'وسام صقر ذروة العلم السيادي',
    description: 'الوصول إلى مرتبة التميز الشامل في جميع مسارات المنصة الخمسة',
    icon: '🦅',
    category: 'الرتبة العليا',
    requiredXp: 3500,
  },
];

class StudentMasteryPassportService {
  private computeRank(xp: number) {
    if (xp < 500) {
      return { level: 1, title: 'مستكشف علمي ناشئ', min: 0, next: 500 };
    } else if (xp < 1200) {
      return { level: 2, title: 'باحث مختبرات متدرب', min: 500, next: 1200 };
    } else if (xp < 2200) {
      return { level: 3, title: 'فيزيائي ومبرمج ممارس', min: 1200, next: 2200 };
    } else if (xp < 4000) {
      return { level: 4, title: 'خبير المحاكاة الثلاثية الأبعاد', min: 2200, next: 4000 };
    } else if (xp < 8000) {
      return { level: 5, title: 'عالم معتمد بمنظومة ذروة العلم', min: 4000, next: 8000 };
    } else {
      return { level: 6, title: 'أسطورة ذروة العلم السيادية', min: 8000, next: 25000 };
    }
  }

  public getPassportState(baseProfileScore = 950, baseSolvedPuzzles = 12): StudentMasteryPassportState {
    let saved: any = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}

    // Also inspect real Spaced Repetition data if present
    let srFlashcardsCount = 18;
    let srStreak = 7;
    try {
      const srRaw = localStorage.getItem('spacedRepetitionData');
      if (srRaw) {
        const srParsed = JSON.parse(srRaw);
        if (Array.isArray(srParsed?.flashcards)) {
          srFlashcardsCount = Math.max(18, srParsed.flashcards.length);
        }
        if (typeof srParsed?.streak === 'number') {
          srStreak = Math.max(5, srParsed.streak);
        }
      }
    } catch {}

    const bonusXp = Number(saved?.bonusXp || 0);
    const totalXp = Math.max(baseProfileScore, 950) + bonusXp;
    const rank = this.computeRank(totalXp);
    const progressPct = Math.min(
      100,
      Math.max(6, Math.round(((totalXp - rank.min) / (rank.next - rank.min)) * 100))
    );

    const labsCompleted = Math.min(49, Number(saved?.labsCompleted || 14));
    const flashcardsMastered = Number(saved?.flashcardsMastered || srFlashcardsCount);
    const puzzlesSolved = Math.max(baseSolvedPuzzles, Number(saved?.puzzlesSolved || 12));
    const examsPassed = Number(saved?.examsPassed || 6);
    const aiSessionsCompleted = Number(saved?.aiSessionsCompleted || 19);

    const domainMastery: DomainMasteryItem[] = [
      {
        id: 'physics',
        name: 'الفيزياء والمختبرات 3D',
        scorePct: Math.min(100, Math.round((labsCompleted / 20) * 100)),
        completedCount: labsCompleted,
        targetCount: 49,
        color: 'from-cyan-500 to-blue-600',
      },
      {
        id: 'spaced_rep',
        name: 'التكرار المتباعد وقصر الذاكرة',
        scorePct: Math.min(100, Math.round((flashcardsMastered / 30) * 100)),
        completedCount: flashcardsMastered,
        targetCount: 30,
        color: 'from-purple-500 to-indigo-600',
      },
      {
        id: 'puzzles',
        name: 'الألغاز والتفكير المنطقي',
        scorePct: Math.min(100, Math.round((puzzlesSolved / 20) * 100)),
        completedCount: puzzlesSolved,
        targetCount: 20,
        color: 'from-emerald-500 to-teal-600',
      },
      {
        id: 'exams',
        name: 'الامتحانات وتذاكر الخروج',
        scorePct: Math.min(100, Math.round((examsPassed / 10) * 100)),
        completedCount: examsPassed,
        targetCount: 10,
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: 'ai_inquiry',
        name: 'الاستقصاء والذكاء الاصطناعي',
        scorePct: Math.min(100, Math.round((aiSessionsCompleted / 25) * 100)),
        completedCount: aiSessionsCompleted,
        targetCount: 25,
        color: 'from-rose-500 to-pink-600',
      },
    ];

    const badges: SovereignPassportBadge[] = SOVEREIGN_BADGES_CATALOG.map((b) => ({
      ...b,
      unlocked: totalXp >= b.requiredXp,
    }));

    const recentActivities: PassportActivityRecord[] = Array.isArray(saved?.recentActivities)
      ? saved.recentActivities
      : DEFAULT_ACTIVITIES;

    return {
      passportId: saved?.passportId || 'ZRW-JO-2026-8841',
      totalXp,
      level: rank.level,
      rankTitle: rank.title,
      nextLevelXp: rank.next,
      currentLevelMinXp: rank.min,
      progressPct,
      streakDays: srStreak,
      pillars: {
        labsCompleted,
        totalLabs: 49,
        flashcardsMastered,
        puzzlesSolved,
        examsPassed,
        aiSessionsCompleted,
      },
      domainMastery,
      badges,
      recentActivities,
    };
  }

  /**
   * Records a student achievement from any tool (Simulation, AI Tutor, Spaced Repetition, Exam, Puzzle)
   * and awards XP in real time.
   */
  public recordActivity(params: {
    type: PassportActivityType;
    title: string;
    subject: string;
    xpEarned?: number;
    route?: string;
    silent?: boolean;
  }): StudentMasteryPassportState {
    const xp =
      params.xpEarned ??
      (params.type === 'exam'
        ? 60
        : params.type === 'lab'
        ? 50
        : params.type === 'puzzle'
        ? 40
        : params.type === 'spaced_repetition'
        ? 30
        : 25);

    let saved: any = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}

    const prevBonus = Number(saved.bonusXp || 0);
    const prevLabs = Number(saved.labsCompleted || 14);
    const prevCards = Number(saved.flashcardsMastered || 18);
    const prevPuzzles = Number(saved.puzzlesSolved || 12);
    const prevExams = Number(saved.examsPassed || 6);
    const prevAi = Number(saved.aiSessionsCompleted || 19);

    const newActivity: PassportActivityRecord = {
      id: `act-${Date.now()}`,
      type: params.type,
      title: params.title,
      subject: params.subject,
      xpEarned: xp,
      timestamp: 'الآن',
      route: params.route,
    };

    const existingActivities: PassportActivityRecord[] = Array.isArray(saved.recentActivities)
      ? saved.recentActivities
      : DEFAULT_ACTIVITIES;

    const updatedSaved = {
      passportId: saved.passportId || 'ZRW-JO-2026-8841',
      bonusXp: prevBonus + xp,
      labsCompleted: params.type === 'lab' ? Math.min(49, prevLabs + 1) : prevLabs,
      flashcardsMastered: params.type === 'spaced_repetition' ? prevCards + 1 : prevCards,
      puzzlesSolved: params.type === 'puzzle' ? prevPuzzles + 1 : prevPuzzles,
      examsPassed: params.type === 'exam' ? prevExams + 1 : prevExams,
      aiSessionsCompleted: params.type === 'ai_tutor' ? prevAi + 1 : prevAi,
      recentActivities: [newActivity, ...existingActivities].slice(0, 15),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaved));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zarwat:passport-updated'));
      }
    } catch {}

    if (!params.silent) {
      toast.success(`🎉 بطاقة الهوية الأكاديمية: +${xp} XP (${params.title})`);
    }

    return this.getPassportState();
  }
}

export const studentMasteryPassportService = new StudentMasteryPassportService();
