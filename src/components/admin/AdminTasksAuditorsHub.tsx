import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Bot, 
  Users, 
  Award, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  ArrowRight, 
  Zap, 
  Eye, 
  ShieldCheck, 
  FileText, 
  Check, 
  RotateCcw,
  Volume2,
  TrendingUp,
  SlidersHorizontal,
  Star,
  Trophy,
  UserCheck,
  Cpu,
  GraduationCap,
  Layers,
  Sparkle,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  adminTaskService, 
  type TaskItem, 
  type TaskAssigneeType, 
  type TaskJobRole, 
  type TaskStatus,
  type StaffPointsProfile,
  type PointTransaction,
  type AICommandResult
} from '@/services/adminTaskManagementService';
import { labSound } from '@/utils/labAudio';

// Color themes & styling presets for each job role option (Light & Dark mode optimized)
const roleStyles: Record<string, {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  activeBg: string;
  activeBorder: string;
  activeShadow: string;
  textInactive: string;
  dotColor: string;
}> = {
  all: {
    label: 'كافة الوظائف (الكل)',
    badgeBg: 'bg-blue-50/90 hover:bg-blue-100/90 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200',
    badgeBorder: 'border-blue-300 dark:border-blue-700/70',
    activeBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white',
    activeBorder: 'border-blue-400 ring-2 ring-blue-400/40',
    activeShadow: 'shadow-md shadow-blue-500/25',
    textInactive: 'text-blue-900 dark:text-blue-200',
    dotColor: 'bg-blue-500'
  },
  exam_auditor: {
    label: 'مدقق جودة الامتحانات',
    badgeBg: 'bg-amber-50 hover:bg-amber-100/90 dark:bg-amber-950/40 dark:hover:bg-amber-900/50',
    badgeBorder: 'border-amber-300 dark:border-amber-700/70',
    activeBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white',
    activeBorder: 'border-amber-400 ring-2 ring-amber-400/40',
    activeShadow: 'shadow-md shadow-amber-500/30',
    textInactive: 'text-amber-900 dark:text-amber-300',
    dotColor: 'bg-amber-500'
  },
  scientific_auditor: {
    label: 'مدقق علمي ومختبرات',
    badgeBg: 'bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50',
    badgeBorder: 'border-emerald-300 dark:border-emerald-700/70',
    activeBg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white',
    activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/40',
    activeShadow: 'shadow-md shadow-emerald-500/30',
    textInactive: 'text-emerald-900 dark:text-emerald-300',
    dotColor: 'bg-emerald-500'
  },
  language_auditor: {
    label: 'مدقق لغوي ومحتوى',
    badgeBg: 'bg-sky-50 hover:bg-sky-100/90 dark:bg-sky-950/40 dark:hover:bg-sky-900/50',
    badgeBorder: 'border-sky-300 dark:border-sky-700/70',
    activeBg: 'bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white',
    activeBorder: 'border-sky-400 ring-2 ring-sky-400/40',
    activeShadow: 'shadow-md shadow-sky-500/30',
    textInactive: 'text-sky-900 dark:text-sky-300',
    dotColor: 'bg-sky-500'
  },
  special_ed_auditor: {
    label: 'مدقق التربية الخاصة ودامج',
    badgeBg: 'bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/40 dark:hover:bg-rose-900/50',
    badgeBorder: 'border-rose-300 dark:border-rose-700/70',
    activeBg: 'bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white',
    activeBorder: 'border-rose-400 ring-2 ring-rose-400/40',
    activeShadow: 'shadow-md shadow-rose-500/30',
    textInactive: 'text-rose-900 dark:text-rose-300',
    dotColor: 'bg-rose-500'
  },
  ai_exam_agent: {
    label: 'وكيل AI للامتحانات',
    badgeBg: 'bg-purple-50 hover:bg-purple-100/90 dark:bg-purple-950/40 dark:hover:bg-purple-900/50',
    badgeBorder: 'border-purple-300 dark:border-purple-700/70',
    activeBg: 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white',
    activeBorder: 'border-purple-400 ring-2 ring-purple-400/40',
    activeShadow: 'shadow-md shadow-purple-500/30',
    textInactive: 'text-purple-900 dark:text-purple-300',
    dotColor: 'bg-purple-500'
  },
  ai_diagnostic_agent: {
    label: 'وكيل AI للتشخيص',
    badgeBg: 'bg-indigo-50 hover:bg-indigo-100/90 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50',
    badgeBorder: 'border-indigo-300 dark:border-indigo-700/70',
    activeBg: 'bg-gradient-to-r from-indigo-600 via-cyan-600 to-blue-600 text-white',
    activeBorder: 'border-indigo-400 ring-2 ring-indigo-400/40',
    activeShadow: 'shadow-md shadow-indigo-500/30',
    textInactive: 'text-indigo-900 dark:text-indigo-300',
    dotColor: 'bg-indigo-500'
  },
  teacher: {
    label: 'معلم معتمد',
    badgeBg: 'bg-teal-50 hover:bg-teal-100/90 dark:bg-teal-950/40 dark:hover:bg-teal-900/50',
    badgeBorder: 'border-teal-300 dark:border-teal-700/70',
    activeBg: 'bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white',
    activeBorder: 'border-teal-400 ring-2 ring-teal-400/40',
    activeShadow: 'shadow-md shadow-teal-500/30',
    textInactive: 'text-teal-900 dark:text-teal-300',
    dotColor: 'bg-teal-500'
  }
};

export const AdminTasksAuditorsHub: React.FC = () => {
  // Live Data States
  const [tasks, setTasks] = useState<TaskItem[]>(() => adminTaskService.getTasks());
  const [staffPoints, setStaffPoints] = useState<StaffPointsProfile[]>(() => adminTaskService.getStaffPointsList());

  // Filter States
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('completed'); // Default to completed to directly serve the prompt
  const [assigneeTypeFilter, setAssigneeTypeFilter] = useState<TaskAssigneeType | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<TaskJobRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedTaskIds, setHighlightedTaskIds] = useState<string[]>([]);

  // Modals
  const [isAwardPointsModalOpen, setIsAwardPointsModalOpen] = useState(false);
  const [selectedStaffForPoints, setSelectedStaffForPoints] = useState<string>('');
  const [pointsToAward, setPointsToAward] = useState<number>(50);
  const [awardReason, setAwardReason] = useState<string>('');
  const [linkedTaskIdForPoints, setLinkedTaskIdForPoints] = useState<string | undefined>(undefined);

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssigneeType, setNewTaskAssigneeType] = useState<TaskAssigneeType>('auditor');
  const [newTaskRole, setNewTaskRole] = useState<TaskJobRole>('exam_auditor');
  const [newTaskPoints, setNewTaskPoints] = useState(100);

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Central AI States
  const [aiCommandInput, setAiCommandInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: 'admin' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `مرحباً بك يا حضرة المشرف العام! أنا **المشرف الذكي المركزي للمهام**.\nاطلب مني مباشرة: *"مهام المكملة من المدققن"* أو *"أعطِ 100 نقطة للمدقق د. عثمان"* وسأنفذ أمرك فوراً.`,
      time: 'الآن'
    }
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync with service events
  useEffect(() => {
    const handleTasksUpdated = (e: any) => setTasks(e.detail || adminTaskService.getTasks());
    const handlePointsUpdated = (e: any) => setStaffPoints(e.detail || adminTaskService.getStaffPointsList());

    window.addEventListener('galaxy_tasks_updated' as any, handleTasksUpdated);
    window.addEventListener('galaxy_points_updated' as any, handlePointsUpdated);

    return () => {
      window.removeEventListener('galaxy_tasks_updated' as any, handleTasksUpdated);
      window.removeEventListener('galaxy_points_updated' as any, handlePointsUpdated);
    };
  }, []);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (assigneeTypeFilter !== 'all' && t.assigneeType !== assigneeTypeFilter) return false;
      if (roleFilter !== 'all' && t.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesName = t.assigneeName.toLowerCase().includes(q);
        const matchesRole = t.assigneeRoleLabel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesName && !matchesRole) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, assigneeTypeFilter, roleFilter, searchQuery]);

  // Key Metrics
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const auditorCompleted = completedTasks.filter(t => t.assigneeType === 'auditor');
    const aiCompleted = completedTasks.filter(t => t.assigneeType === 'ai');
    const totalPointsAwarded = staffPoints.reduce((acc, s) => acc + (s.totalPoints || 0), 0);

    return {
      totalTasks: tasks.length,
      completedTotal: completedTasks.length,
      auditorCompletedCount: auditorCompleted.length,
      aiCompletedCount: aiCompleted.length,
      totalPointsAwarded,
      topStaff: [...staffPoints].sort((a, b) => b.totalPoints - a.totalPoints)[0]
    };
  }, [tasks, staffPoints]);

  // Execute Central AI Command
  const handleExecuteAICommand = async (commandToRun?: string) => {
    const prompt = (commandToRun || aiCommandInput).trim();
    if (!prompt) return;

    setAiChatHistory(prev => [
      ...prev,
      { sender: 'admin', text: prompt, time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setAiCommandInput('');
    setIsAiProcessing(true);

    try {
      labSound.playLaserPulse(600);
      const res: AICommandResult = await adminTaskService.processCentralAICommand(prompt);

      // Apply filter changes if requested by AI
      if (res.filterChange) {
        if (res.filterChange.status !== undefined) setStatusFilter(res.filterChange.status);
        if (res.filterChange.assigneeType !== undefined) setAssigneeTypeFilter(res.filterChange.assigneeType);
        if (res.filterChange.role !== undefined) setRoleFilter(res.filterChange.role);
      }

      if (res.highlightedTaskIds) {
        setHighlightedTaskIds(res.highlightedTaskIds);
      }

      setAiChatHistory(prev => [
        ...prev,
        { sender: 'ai', text: res.reply, time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }
      ]);

      labSound.playSuccessChime();
      toast.success('تم تنفيذ الأمر بواسطة الذكاء الاصطناعي المركزي بنجاح!');
    } catch (err) {
      toast.error('حدث خطأ أثناء معالجة الأمر');
    } finally {
      setIsAiProcessing(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Open points award modal for specific task
  const handleOpenTaskPointsModal = (task: TaskItem) => {
    setSelectedStaffForPoints(task.assigneeId || task.assigneeEmail || task.assigneeName);
    setLinkedTaskIdForPoints(task.id);
    setAwardReason(`مكافأة إنجاز المهمة: ${task.title}`);
    setPointsToAward(task.pointsPossible || 50);
    setIsAwardPointsModalOpen(true);
  };

  // Confirm Points Award
  const handleConfirmAwardPoints = async () => {
    if (!selectedStaffForPoints) {
      toast.error('يرجى اختيار الموظف أو المدقق المستهدف');
      return;
    }
    if (pointsToAward <= 0) {
      toast.error('يرجى تحديد عدد نقاط أكبر من الصفر');
      return;
    }

    const res = await adminTaskService.awardPointsToStaff({
      userId: selectedStaffForPoints,
      points: pointsToAward,
      reason: awardReason.trim() || 'مكافأة تقديرية مباشرة من الإدارة',
      taskId: linkedTaskIdForPoints,
      taskTitle: linkedTaskIdForPoints ? tasks.find(t => t.id === linkedTaskIdForPoints)?.title : undefined
    });

    if (res.success) {
      labSound.playSuccessChime();
      toast.success(res.message);
      setIsAwardPointsModalOpen(false);
      setLinkedTaskIdForPoints(undefined);
      setAwardReason('');
    }
  };

  // Create New Task
  const handleCreateNewTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('يرجى إدخال عنوان المهمة');
      return;
    }

    const roleLabels: Record<TaskJobRole, string> = {
      scientific_auditor: 'مدقق علمي ومختبرات',
      language_auditor: 'مدقق لغوي ومحتوى',
      exam_auditor: 'مدقق جودة الامتحانات',
      special_ed_auditor: 'مدقق التربية الخاصة ودامج',
      ai_exam_agent: 'وكيل الذكاء الاصطناعي للامتحانات',
      ai_diagnostic_agent: 'وكيل الذكاء الاصطناعي للتشخيص',
      ai_translation_agent: 'وكيل الذكاء الاصطناعي للترجمة',
      teacher: 'معلم معتمد',
      supervisor: 'مشرف أكاديمي'
    };

    let defaultName = 'د. عثمان الكيلاني (مدقق)';
    if (newTaskAssigneeType === 'ai') defaultName = 'Falak Exam-Synth AI';
    if (newTaskRole === 'special_ed_auditor') defaultName = 'أ. سارة النمري (مدققة دامج)';
    if (newTaskRole === 'scientific_auditor') defaultName = 'م. فراس الزعبي (مدقق علمي)';

    adminTaskService.addTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'مهمة مخصصة وفق خطة الجودة الأكاديمية للمنظومة الوطنية.',
      assigneeType: newTaskAssigneeType,
      assigneeRole: newTaskRole,
      assigneeRoleLabel: roleLabels[newTaskRole] || 'مدقق معتمد',
      assigneeName: defaultName,
      assigneeId: `staff-${Date.now()}`,
      status: 'in_progress',
      priority: 'high',
      pointsAwarded: 0,
      pointsPossible: newTaskPoints
    });

    labSound.playSuccessChime();
    toast.success('تم إنشاء المهمة بنجاح وتعيينها للمسؤول!');
    setIsNewTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-white via-cyan-50/60 to-blue-50/60 dark:bg-slate-900 p-6 rounded-3xl border-2 border-cyan-200/80 dark:border-slate-800 shadow-xl shadow-cyan-900/5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                نظام إدارة المهام الذكي والمدققين ونقاط الموظفين
                <Badge className="bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-400/50 text-xs font-black">نظام الإدارة المركزي</Badge>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                فلترة المهام المنجزة للمدققين منفصلة عن الذكاء الاصطناعي، ونظام احتساب ومكافأة النقاط، مع المساعد الذكي المركزي للأدمن
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => {
              setSelectedStaffForPoints(staffPoints[0]?.userId || '');
              setLinkedTaskIdForPoints(undefined);
              setAwardReason('');
              setPointsToAward(50);
              setIsAwardPointsModalOpen(true);
            }}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-105 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-amber-300/40 transition-transform active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-100" />
            <span>زيادة نقاط موظف / مدقق ⚡</span>
          </Button>

          <Button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:brightness-105 text-white font-black text-xs sm:text-sm shadow-md shadow-cyan-500/20 flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-cyan-300/40 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-cyan-100" />
            <span>تكليف بمهمة جديدة</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Auditor Completed Tasks (Separated) */}
        <Card 
          onClick={() => {
            setStatusFilter('completed');
            setAssigneeTypeFilter('auditor');
            setRoleFilter('all');
            toast.info('تمت الفلترة: عرض مهام المدققين المنجزة فقط');
          }}
          className={`cursor-pointer transition-all border-2 rounded-3xl overflow-hidden hover:shadow-lg ${
            statusFilter === 'completed' && assigneeTypeFilter === 'auditor' 
              ? 'bg-gradient-to-br from-emerald-50 via-teal-50/70 to-cyan-50/70 dark:bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/30 shadow-md shadow-emerald-500/10' 
              : 'bg-white hover:bg-slate-50/70 dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">مهام المدققين المنجزة (البشرية)</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                {stats.auditorCompletedCount} مهمة
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                انقر للعزل والفلترة المباشرة
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
              <UserCheck className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: AI Completed Tasks (Separated) */}
        <Card 
          onClick={() => {
            setStatusFilter('completed');
            setAssigneeTypeFilter('ai');
            setRoleFilter('all');
            toast.info('تمت الفلترة: عرض مهام الذكاء الاصطناعي المنجزة فقط');
          }}
          className={`cursor-pointer transition-all border-2 rounded-3xl overflow-hidden hover:shadow-lg ${
            statusFilter === 'completed' && assigneeTypeFilter === 'ai' 
              ? 'bg-gradient-to-br from-purple-50 via-indigo-50/70 to-violet-50/70 dark:bg-slate-900 border-purple-400 ring-2 ring-purple-400/30 shadow-md shadow-purple-500/10' 
              : 'bg-white hover:bg-slate-50/70 dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">مهام الذكاء الاصطناعي (AI)</span>
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1 block">
                {stats.aiCompletedCount} مهمة
              </span>
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-300 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                مؤتمتة بواسطة وكلاء AI
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm">
              <Bot className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Points Distributed */}
        <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-400 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">إجمالي النقاط الموزعة للموظفين</span>
              <span className="text-3xl font-black text-amber-500 dark:text-amber-400 font-mono mt-1 block">
                {stats.totalPointsAwarded.toLocaleString()} نقطة
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                تظهر في لوحات تحكم الموظفين
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
              <Award className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Top Performer */}
        <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-400 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">أعلى المدققين نقاطاً</span>
              <span className="text-base font-black text-slate-900 dark:text-slate-100 mt-1 block truncate max-w-[160px]">
                {stats.topStaff?.name || 'د. عثمان الكيلاني'}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-300 font-mono font-bold block mt-0.5">
                {stats.topStaff?.totalPoints || 850} نقطة • {stats.topStaff?.rankBadge}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
              <Trophy className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Central Task AI Assistant Panel */}
      <Card className="bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/40 dark:bg-slate-900 border-2 border-indigo-200/80 dark:border-indigo-900/50 shadow-xl shadow-indigo-950/5 overflow-hidden rounded-3xl">
        <CardHeader className="py-4 px-6 border-b border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-white dark:bg-indigo-950/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-300/60 dark:border-indigo-500/30 shadow-sm animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                الذكاء الاصطناعي المركزي للمهام والأوامر الإدارية (Central Task AI)
              </CardTitle>
              <CardDescription className="text-xs text-indigo-700/80 dark:text-indigo-300/70 font-medium">
                نفذ أوامرك الإدارية باللغة الطبيعية: اطلب منه فوراً &quot;مهام المكملة من المدققن&quot; أو &quot;زيادة نقاط الموظفين&quot;
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-indigo-300 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:border-indigo-400/40 dark:text-indigo-300 text-[11px] font-bold">
            جاهز لتلقي أوامر الأدمن
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Preset Quick Action Command Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-indigo-950 dark:text-indigo-200 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              أوامر سريعة بنقرة واحدة:
            </span>
            <button
              type="button"
              onClick={() => handleExecuteAICommand('مهام المكملة من المدققن')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-2 border-emerald-300/70 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/25 active:scale-95 hover:scale-[1.02]"
            >
              <UserCheck className="w-4 h-4 text-emerald-100" />
              <span>مهام المكملة من المدققن 🎯</span>
            </button>
            <button
              type="button"
              onClick={() => handleExecuteAICommand('مهام الذكاء الاصطناعي المنجزة')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-2 border-purple-300/70 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/25 active:scale-95 hover:scale-[1.02]"
            >
              <Bot className="w-4 h-4 text-purple-100" />
              <span>مهام الذكاء الاصطناعي المنجزة 🤖</span>
            </button>
            <button
              type="button"
              onClick={() => handleExecuteAICommand('أعلى المدققين نقاطاً')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-2 border-amber-300/70 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 hover:scale-[1.02]"
            >
              <Trophy className="w-4 h-4 text-amber-100" />
              <span>أعلى المدققين نقاطاً 🏆</span>
            </button>
            <button
              type="button"
              onClick={() => handleExecuteAICommand('أضف 50 نقطة للمدقق د. عثمان الكيلاني')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-2 border-cyan-300/70 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/25 active:scale-95 hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 text-cyan-100" />
              <span>أضف 50 نقطة للمدقق د. عثمان ⚡</span>
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="max-h-[260px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-white/90 dark:bg-slate-950/70 border-2 border-indigo-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 shadow-inner">
            {aiChatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl max-w-[90%] ${
                  msg.sender === 'admin'
                    ? 'mr-auto bg-gradient-to-r from-cyan-50 to-blue-50 dark:bg-cyan-950/40 text-cyan-950 dark:text-cyan-100 border border-cyan-200 dark:border-cyan-800 shadow-sm'
                    : 'ml-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm space-y-1'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="font-extrabold flex items-center gap-1">
                    {msg.sender === 'admin' ? 'المشرف العام (أمر إداري)' : 'المشرف الذكي المركزي'}
                  </span>
                  <span className="font-mono">{msg.time}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Command Input Box */}
          <div className="flex items-center gap-2">
            <Input
              value={aiCommandInput}
              onChange={(e) => setAiCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecuteAICommand();
              }}
              placeholder='اكتب أمرك الإداري هنا، مثلاً: "اعرض لي المهام المكتملة من المدققين" أو "أضف 100 نقطة للمدقق فلان"...'
              className="h-11 rounded-2xl bg-white dark:bg-slate-950 border-2 border-indigo-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 shadow-sm"
            />
            <Button
              onClick={() => handleExecuteAICommand()}
              disabled={isAiProcessing || !aiCommandInput.trim()}
              className="h-11 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-500/25"
            >
              {isAiProcessing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>تنفيذ الأمر</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Strict Filtering Bar: Completed by Auditor VS AI VS Role */}
      <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg rounded-3xl overflow-hidden">
        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Main Tabs: All, Auditor Completed, AI Completed, All Tasks */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-wrap shadow-inner">
              {/* Option 1: Auditor Completed */}
              <button
                type="button"
                onClick={() => {
                  setAssigneeTypeFilter('auditor');
                  setStatusFilter('completed');
                  setRoleFilter('all');
                  toast.success('تم تفعيل فلترة مهام المدققين المنجزة حصرياً');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 ${
                  assigneeTypeFilter === 'auditor' && statusFilter === 'completed'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white border-emerald-300 dark:border-emerald-400 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/30 scale-[1.02]'
                    : 'bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border-emerald-300/80 dark:border-emerald-800'
                }`}
              >
                <div className={`p-1 rounded-lg ${assigneeTypeFilter === 'auditor' && statusFilter === 'completed' ? 'bg-white/20' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'}`}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <span>مهام المدققين المنجزة فقط</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                  assigneeTypeFilter === 'auditor' && statusFilter === 'completed'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'bg-emerald-200/90 dark:bg-emerald-900/90 text-emerald-950 dark:text-emerald-100'
                }`}>
                  {stats.auditorCompletedCount}
                </span>
              </button>

              {/* Option 2: AI Completed */}
              <button
                type="button"
                onClick={() => {
                  setAssigneeTypeFilter('ai');
                  setStatusFilter('completed');
                  setRoleFilter('all');
                  toast.success('تم تفعيل فلترة مهام الذكاء الاصطناعي المنجزة حصرياً');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 ${
                  assigneeTypeFilter === 'ai' && statusFilter === 'completed'
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white border-purple-300 dark:border-purple-400 shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/30 scale-[1.02]'
                    : 'bg-purple-50 hover:bg-purple-100/90 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-900 dark:text-purple-200 border-purple-300/80 dark:border-purple-800'
                }`}
              >
                <div className={`p-1 rounded-lg ${assigneeTypeFilter === 'ai' && statusFilter === 'completed' ? 'bg-white/20' : 'bg-purple-500/20 text-purple-700 dark:text-purple-300'}`}>
                  <Bot className="w-4 h-4" />
                </div>
                <span>الذكاء الاصطناعي المنجزة</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                  assigneeTypeFilter === 'ai' && statusFilter === 'completed'
                    ? 'bg-white text-purple-800 shadow-sm'
                    : 'bg-purple-200/90 dark:bg-purple-900/90 text-purple-950 dark:text-purple-100'
                }`}>
                  {stats.aiCompletedCount}
                </span>
              </button>

              {/* Option 3: All Completed */}
              <button
                type="button"
                onClick={() => {
                  setAssigneeTypeFilter('all');
                  setStatusFilter('completed');
                  setRoleFilter('all');
                }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 ${
                  assigneeTypeFilter === 'all' && statusFilter === 'completed'
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-300 dark:border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/30 scale-[1.02]'
                    : 'bg-amber-50 hover:bg-amber-100/90 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-300/80 dark:border-amber-800'
                }`}
              >
                <div className={`p-1 rounded-lg ${assigneeTypeFilter === 'all' && statusFilter === 'completed' ? 'bg-white/20' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>جميع المهام المنجزة</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                  assigneeTypeFilter === 'all' && statusFilter === 'completed'
                    ? 'bg-white text-amber-800 shadow-sm'
                    : 'bg-amber-200/90 dark:bg-amber-900/90 text-amber-950 dark:text-amber-100'
                }`}>
                  {tasks.filter(t => t.status === 'completed').length}
                </span>
              </button>

              {/* Option 4: All Tasks (All states) */}
              <button
                type="button"
                onClick={() => {
                  setAssigneeTypeFilter('all');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 ${
                  statusFilter === 'all' && assigneeTypeFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white border-blue-300 dark:border-blue-400 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/30 scale-[1.02]'
                    : 'bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200/80 dark:border-blue-800'
                }`}
              >
                <div className={`p-1 rounded-lg ${statusFilter === 'all' && assigneeTypeFilter === 'all' ? 'bg-white/20' : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'}`}>
                  <Layers className="w-4 h-4" />
                </div>
                <span>كافة المهام (مكتملة وتنفيذية)</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                  statusFilter === 'all' && assigneeTypeFilter === 'all'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'bg-blue-200/90 dark:bg-blue-900/90 text-blue-950 dark:text-blue-100'
                }`}>
                  {tasks.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في أسماء المهام والمدققين..."
                className="h-11 pr-10 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 shadow-sm"
              />
            </div>
          </div>

          {/* Sub-Filters: Job Role Separation ("كل وظيفة منفصلة عن الثاني") */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 flex-wrap">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-extrabold flex items-center gap-1.5 ml-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>فصل أقسام الوظائف:</span>
            </span>

            {Object.entries(roleStyles).map(([key, item]) => {
              const isActive = roleFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRoleFilter(key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-1.5 ${
                    isActive
                      ? `${item.activeBg} ${item.activeBorder} ${item.activeShadow} scale-[1.03]`
                      : `${item.badgeBg} ${item.badgeBorder} ${item.textInactive}`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white ring-1 ring-white/50' : item.dotColor}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>قائمة المهام المفلترة ({filteredTasks.length})</span>
            {assigneeTypeFilter === 'auditor' && (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/40 text-xs font-bold">
                مهام المدققين المعتمدين حصراً
              </Badge>
            )}
            {assigneeTypeFilter === 'ai' && (
              <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/40 text-xs font-bold">
                مهام وكلاء الذكاء الاصطناعي
              </Badge>
            )}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            انقر على أي مهمة لمشاهدة المخرجات أو إضافة النقاط للمسؤول
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <Card className="bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 p-12 text-center rounded-3xl">
            <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">لا توجد مهام مطابقة للشروط المحددة</h4>
            <p className="text-xs text-slate-500 mt-1">
              جرب تغيير الفلترة بالأعلى أو تصفية البحث لعرض مهام أخرى.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map((task) => {
              const isExpanded = expandedTaskId === task.id;
              const isHighlighted = highlightedTaskIds.includes(task.id);

              return (
                <Card
                  key={task.id}
                  className={`border-2 transition-all duration-300 rounded-3xl overflow-hidden ${
                    isHighlighted
                      ? 'bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-500/15 ring-2 ring-cyan-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-sm hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Assignee Type Badge */}
                          <Badge
                            className={
                              task.assigneeType === 'auditor'
                                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-400/40 text-xs font-bold'
                                : task.assigneeType === 'ai'
                                ? 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-400/40 text-xs font-bold'
                                : 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-400/40 text-xs font-bold'
                            }
                          >
                            {task.assigneeType === 'auditor' ? 'مدقق بشري' : task.assigneeType === 'ai' ? 'ذكاء اصطناعي AI' : 'معلم'}
                          </Badge>

                          {/* Role Badge */}
                          <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium bg-slate-50 dark:bg-slate-800">
                            {task.assigneeRoleLabel}
                          </Badge>

                          {/* Status Badge */}
                          <Badge
                            className={
                              task.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/40 text-xs font-bold'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/40 text-xs font-bold'
                            }
                          >
                            {task.status === 'completed' ? '✓ منجزة ومعتمدة' : 'قيد التنفيذ'}
                          </Badge>
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">{task.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                      </div>

                      {/* Points & Actions */}
                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        {/* Points Display */}
                        <div className="text-center px-4 py-2 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700/80 shadow-sm">
                          <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold block">النقاط الممنوحة</span>
                          <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                            +{task.pointsAwarded} ⭐
                          </span>
                        </div>

                        {/* Button: Award points to this specific task */}
                        <Button
                          onClick={() => handleOpenTaskPointsModal(task)}
                          size="sm"
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl h-10 px-3.5 shadow-md shadow-amber-500/20 border border-amber-300/40 transition-transform active:scale-95"
                        >
                          <Trophy className="w-3.5 h-3.5 ml-1 text-amber-100" />
                          <span>إضافة نقاط للمهمة</span>
                        </Button>

                        {/* Toggle Details */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white h-10 px-2.5 rounded-xl"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          المسؤول: {task.assigneeName}
                        </span>
                        {task.completedAt && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                            تم الإنجاز: {task.completedAt}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {task.adminFeedback && (
                          <span className="text-cyan-700 dark:text-cyan-300 text-[10px] bg-cyan-50 dark:bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800 font-medium">
                            ملاحظة الإدارة: {task.adminFeedback}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details & Deliverables */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                        >
                          {task.deliverableSnippet && (
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                              <span className="font-extrabold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                                <FileText className="w-4 h-4" />
                                تقرير مخرجات المهمة المسجل:
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{task.deliverableSnippet}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                              معرف المهمة: {task.id} • تاريخ التكليف: {task.createdAt}
                            </span>
                            {task.status !== 'completed' && (
                              <Button
                                onClick={() => {
                                  adminTaskService.updateTaskStatus(task.id, 'completed');
                                  labSound.playSuccessChime();
                                  toast.success('تم تغيير حالة المهمة إلى منجزة بنجاح!');
                                }}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5 ml-1" />
                                اعتماد وإكمال المهمة فوراً
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Staff Points Leaderboard & Ledger */}
      <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              سجل نقاط الموظفين والمدققين المعتمدين (تظهر فوراً في لوحات تحكمهم)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              يمكنك من هنا زيادة رصيد أي موظف أو مدقق مع تسجيل سبب المكافأة وتوثيقه في سجله الخاص
            </CardDescription>
          </div>
          <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-xs font-bold">
            نظام المكافآت المباشر
          </Badge>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold bg-slate-100/70 dark:bg-slate-950/60">
                <th className="p-4">الموظف / المدقق</th>
                <th className="p-4">التصنيف والوظيفة</th>
                <th className="p-4">المهام المنجزة</th>
                <th className="p-4">رصيد النقاط المحسوبة</th>
                <th className="p-4">الرتبة والشارة</th>
                <th className="p-4 text-center">الإجراء السريع</th>
              </tr>
            </thead>
            <tbody>
              {staffPoints.map((staff) => (
                <tr key={staff.userId} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex flex-col">
                      <span className="font-extrabold">{staff.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{staff.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] bg-slate-50 dark:bg-slate-800">
                      {staff.roleLabel}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    {staff.completedTasksCount} مهمة
                  </td>
                  <td className="p-4 font-mono text-amber-600 dark:text-amber-400 font-black text-sm">
                    {staff.totalPoints.toLocaleString()} نقطة ⭐
                  </td>
                  <td className="p-4 text-slate-800 dark:text-slate-200">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-bold text-[11px] border border-amber-300 dark:border-amber-500/20 shadow-sm">
                      {staff.rankBadge}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      onClick={() => {
                        setSelectedStaffForPoints(staff.userId);
                        setLinkedTaskIdForPoints(undefined);
                        setAwardReason(`مكافأة تقديرية للمدقق ${staff.name}`);
                        setPointsToAward(50);
                        setIsAwardPointsModalOpen(true);
                      }}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl h-8 px-3.5 shadow-sm border border-amber-300/40 active:scale-95 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5 ml-1 text-amber-100" />
                      <span>زيادة نقاط</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal: Award Points to Staff Member / Task */}
      <Dialog open={isAwardPointsModalOpen} onOpenChange={setIsAwardPointsModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-md rounded-3xl shadow-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-amber-500 dark:text-amber-400 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              منح وزيادة رصيد النقاط (تظهر مباشرة في لوحة تحكم الموظف)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              قم بتحديد الموظف أو المدقق وعدد النقاط والسبب، وسيتم تحديث رصيده فوراً وتوثيق الإجراء.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Staff Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">الموظف / المدقق المستهدف:</label>
              <select
                value={selectedStaffForPoints}
                onChange={(e) => setSelectedStaffForPoints(e.target.value)}
                className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-400"
              >
                {staffPoints.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.name} ({s.roleLabel}) — رصيده الحالي: {s.totalPoints} نقطة
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Points Preset Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">عدد النقاط الممنوحة (خيارات سريعة):</label>
              <div className="flex items-center gap-2">
                {[25, 50, 100, 150, 200].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setPointsToAward(pts)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                      pointsToAward === pts
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-300 shadow-md shadow-amber-500/25 scale-[1.03]'
                        : 'bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    +{pts}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                value={pointsToAward}
                onChange={(e) => setPointsToAward(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="h-11 rounded-2xl bg-white dark:bg-slate-950 border-2 border-amber-300/80 dark:border-amber-700 text-sm font-mono text-amber-600 dark:text-amber-400 font-black mt-2 text-center shadow-inner"
              />
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">سبب منح النقاط / ملاحظة الإدارة:</label>
              <Textarea
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                placeholder="مثلاً: مكافأة تميز في تدقيق بنك أسئلة الفيزياء النووية بدقة 100%..."
                className="rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAwardPointsModalOpen(false)}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmAwardPoints}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs rounded-2xl shadow-md shadow-amber-500/20 px-5"
            >
              تأكيد منح النقاط فوراً ✨
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Create New Task */}
      <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-lg rounded-3xl shadow-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              تكليف بمهمة تدقيق أو إنجاز جديدة
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              قم بإنشاء مهمة جديدة وتعيين نوع المنفذ (مدقق بشري أو ذكاء اصطناعي AI) والوظيفة المحددة.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">عنوان المهمة:</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="مثلاً: تدقيق أسئلة الكيمياء الحرارية والتوازن..."
                className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">جهة التنفيذ:</label>
                <select
                  value={newTaskAssigneeType}
                  onChange={(e) => setNewTaskAssigneeType(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="auditor">مدقق بشري (Auditor)</option>
                  <option value="ai">ذكاء اصطناعي (AI Agent)</option>
                  <option value="teacher">معلم معتمد</option>
                  <option value="supervisor">مشرف أكاديمي</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">الوظيفة المحددة:</label>
                <select
                  value={newTaskRole}
                  onChange={(e) => setNewTaskRole(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="exam_auditor">مدقق جودة الامتحانات</option>
                  <option value="scientific_auditor">مدقق علمي ومختبرات</option>
                  <option value="language_auditor">مدقق لغوي ومحتوى</option>
                  <option value="special_ed_auditor">مدقق التربية الخاصة ودامج</option>
                  <option value="ai_exam_agent">وكيل AI للامتحانات</option>
                  <option value="ai_diagnostic_agent">وكيل AI للتشخيص البرمجي</option>
                  <option value="teacher">معلم معتمد</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">نقاط الإنجاز المستحقة للمهمة:</label>
              <Input
                type="number"
                value={newTaskPoints}
                onChange={(e) => setNewTaskPoints(Math.max(10, parseInt(e.target.value, 10) || 50))}
                className="h-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm font-mono text-cyan-600 dark:text-cyan-400 font-black"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">وصف المهمة وشروط الاعتماد:</label>
              <Textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="اكتب تفاصيل ومخرجات المهمة المتوقعة..."
                className="rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsNewTaskModalOpen(false)}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateNewTask}
              className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs rounded-2xl px-5 shadow-md shadow-cyan-500/25"
            >
              إنشاء وتكليف المهمة فوراً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTasksAuditorsHub;
