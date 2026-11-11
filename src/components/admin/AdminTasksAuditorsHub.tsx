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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/60 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
                نظام إدارة المهام الذكي والمدققين ونقاط الموظفين
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">نظام الإدارة المركزي</Badge>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 rounded-2xl"
          >
            <Trophy className="w-4 h-4" />
            <span>زيادة نقاط موظف / مدقق ⚡</span>
          </Button>

          <Button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 flex items-center gap-2 rounded-2xl"
          >
            <Plus className="w-4 h-4" />
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
          className={`cursor-pointer transition-all border-slate-800 hover:border-cyan-500/50 ${
            statusFilter === 'completed' && assigneeTypeFilter === 'auditor' ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/20' : 'bg-slate-900/60'
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">مهام المدققين المنجزة (البشرية)</span>
              <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
                {stats.auditorCompletedCount} مهمة
              </span>
              <span className="text-[10px] text-cyan-300/80">انقر للعزل والفلترة المباشرة</span>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UserCheck className="w-6 h-6" />
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
          className={`cursor-pointer transition-all border-slate-800 hover:border-purple-500/50 ${
            statusFilter === 'completed' && assigneeTypeFilter === 'ai' ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20' : 'bg-slate-900/60'
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">مهام الذكاء الاصطناعي (AI)</span>
              <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
                {stats.aiCompletedCount} مهمة
              </span>
              <span className="text-[10px] text-purple-300/80">مؤتمتة بواسطة وكلاء AI</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Bot className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Points Distributed */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">إجمالي النقاط الموزعة للموظفين</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                {stats.totalPointsAwarded.toLocaleString()} نقطة
              </span>
              <span className="text-[10px] text-emerald-400">تظهر في لوحات تحكم الموظفين</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Top Performer */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">أعلى المدققين نقاطاً</span>
              <span className="text-sm font-bold text-slate-200 mt-1 block truncate max-w-[160px]">
                {stats.topStaff?.name || 'د. عثمان الكيلاني'}
              </span>
              <span className="text-[10px] text-amber-300 font-mono">
                {stats.topStaff?.totalPoints || 850} نقطة • {stats.topStaff?.rankBadge}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trophy className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Central Task AI Assistant Panel */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border-indigo-500/30 shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="py-4 px-6 border-b border-indigo-500/20 bg-indigo-500/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-black text-indigo-200 flex items-center gap-2">
                الذكاء الاصطناعي المركزي للمهام والأوامر الإدارية (Central Task AI)
              </CardTitle>
              <CardDescription className="text-xs text-indigo-300/70">
                نفذ أوامرك الإدارية باللغة الطبيعية: اطلب منه فوراً &quot;مهام المكملة من المدققن&quot; أو &quot;زيادة نقاط الموظفين&quot;
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-indigo-400/40 text-indigo-300 bg-indigo-500/10 text-[10px]">
            جاهز لتلقي أوامر الأدمن
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Preset Quick Action Command Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold">أوامر سريعة بنقرة واحدة:</span>
            <button
              onClick={() => handleExecuteAICommand('مهام المكملة من المدققن')}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>مهام المكملة من المدققن 🎯</span>
            </button>
            <button
              onClick={() => handleExecuteAICommand('مهام الذكاء الاصطناعي المنجزة')}
              className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>مهام الذكاء الاصطناعي المنجزة 🤖</span>
            </button>
            <button
              onClick={() => handleExecuteAICommand('أعلى المدققين نقاطاً')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>أعلى المدققين نقاطاً 🏆</span>
            </button>
            <button
              onClick={() => handleExecuteAICommand('أضف 50 نقطة للمدقق د. عثمان الكيلاني')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>أضف 50 نقطة للمدقق د. عثمان ⚡</span>
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="max-h-[260px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200">
            {aiChatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[90%] ${
                  msg.sender === 'admin'
                    ? 'mr-auto bg-cyan-600/20 text-cyan-200 border border-cyan-500/30'
                    : 'ml-auto bg-slate-900 border border-slate-800 text-slate-300 space-y-1'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold flex items-center gap-1">
                    {msg.sender === 'admin' ? 'المشرف العام (أمر إداري)' : 'المشرف الذكي المركزي'}
                  </span>
                  <span>{msg.time}</span>
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
              className="h-11 rounded-2xl bg-slate-950/80 border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
            />
            <Button
              onClick={() => handleExecuteAICommand()}
              disabled={isAiProcessing || !aiCommandInput.trim()}
              className="h-11 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
            >
              {isAiProcessing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>تنفيذ الأمر</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Strict Filtering Bar: Completed by Auditor VS AI VS Role */}
      <Card className="bg-slate-900/70 border-slate-800 shadow-xl rounded-3xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Main Tabs: All, Auditor Completed, AI Completed */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800/80 flex-wrap">
              <button
                onClick={() => {
                  setAssigneeTypeFilter('all');
                  setStatusFilter('completed');
                  setRoleFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  assigneeTypeFilter === 'all' && statusFilter === 'completed'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                جميع المنجزة ({tasks.filter(t => t.status === 'completed').length})
              </button>

              <button
                onClick={() => {
                  setAssigneeTypeFilter('auditor');
                  setStatusFilter('completed');
                  setRoleFilter('all');
                  toast.success('تم فرز مهام المدققين المنجزة حصرياً');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  assigneeTypeFilter === 'auditor' && statusFilter === 'completed'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                    : 'text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>المدققين المنجزة فقط ({stats.auditorCompletedCount})</span>
              </button>

              <button
                onClick={() => {
                  setAssigneeTypeFilter('ai');
                  setStatusFilter('completed');
                  setRoleFilter('all');
                  toast.success('تم فرز مهام الذكاء الاصطناعي المنجزة حصرياً');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  assigneeTypeFilter === 'ai' && statusFilter === 'completed'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-purple-400 hover:bg-purple-500/10'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>الذكاء الاصطناعي المنجزة ({stats.aiCompletedCount})</span>
              </button>

              <button
                onClick={() => {
                  setAssigneeTypeFilter('all');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'all' && assigneeTypeFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                كافة المهام (الجارية والجديدة)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في أسماء المهام والمدققين..."
                className="h-10 pr-9 rounded-2xl bg-slate-950 border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Sub-Filters: Job Role Separation ("كل وظيفة منفصلة عن الثاني") */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
              فصل الوظائف:
            </span>

            {[
              { id: 'all', label: 'كافة الوظائف' },
              { id: 'exam_auditor', label: 'مدقق جودة الامتحانات' },
              { id: 'scientific_auditor', label: 'مدقق علمي ومختبرات' },
              { id: 'language_auditor', label: 'مدقق لغوي ومحتوى' },
              { id: 'special_ed_auditor', label: 'مدقق التربية الخاصة ودامج' },
              { id: 'ai_exam_agent', label: 'وكيل AI للامتحانات' },
              { id: 'ai_diagnostic_agent', label: 'وكيل AI للتشخيص' },
              { id: 'teacher', label: 'معلم معتمد' }
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setRoleFilter(role.id as any)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                  roleFilter === role.id
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <span>قائمة المهام المفلترة ({filteredTasks.length})</span>
            {assigneeTypeFilter === 'auditor' && (
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs">
                مهام المدققين المعتمدين حصراً
              </Badge>
            )}
            {assigneeTypeFilter === 'ai' && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs">
                مهام وكلاء الذكاء الاصطناعي
              </Badge>
            )}
          </h3>
          <span className="text-xs text-slate-400">
            انقر على أي مهمة لمشاهدة المخرجات أو إضافة النقاط للمسؤول
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <Card className="bg-slate-900/40 border-slate-800 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">لا توجد مهام مطابقة للشروط المحددة</h4>
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
                  className={`border transition-all duration-300 rounded-3xl overflow-hidden ${
                    isHighlighted
                      ? 'bg-cyan-950/30 border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
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
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs'
                                : task.assigneeType === 'ai'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs'
                            }
                          >
                            {task.assigneeType === 'auditor' ? 'مدقق بشري' : task.assigneeType === 'ai' ? 'ذكاء اصطناعي AI' : 'معلم'}
                          </Badge>

                          {/* Role Badge */}
                          <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
                            {task.assigneeRoleLabel}
                          </Badge>

                          {/* Status Badge */}
                          <Badge
                            className={
                              task.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs'
                            }
                          >
                            {task.status === 'completed' ? '✓ منجزة ومعتمدة' : 'قيد التنفيذ'}
                          </Badge>
                        </div>

                        <h4 className="text-base sm:text-lg font-bold text-slate-100">{task.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      </div>

                      {/* Points & Actions */}
                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        {/* Points Display */}
                        <div className="text-center px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                          <span className="text-[10px] text-amber-400 font-semibold block">النقاط الممنوحة</span>
                          <span className="text-lg font-black text-amber-300 font-mono">
                            +{task.pointsAwarded} ⭐
                          </span>
                        </div>

                        {/* Button: Award points to this specific task */}
                        <Button
                          onClick={() => handleOpenTaskPointsModal(task)}
                          size="sm"
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl h-9"
                        >
                          <Trophy className="w-3.5 h-3.5 ml-1" />
                          <span>إضافة نقاط للمهمة</span>
                        </Button>

                        {/* Toggle Details */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className="text-slate-400 hover:text-white h-9 px-2.5 rounded-xl"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                          المسؤول: {task.assigneeName}
                        </span>
                        {task.completedAt && (
                          <span className="text-emerald-400 font-mono">
                            تم الإنجاز: {task.completedAt}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {task.adminFeedback && (
                          <span className="text-cyan-300 text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
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
                          className="space-y-3 pt-3 border-t border-slate-800 text-xs text-slate-300"
                        >
                          {task.deliverableSnippet && (
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                              <span className="font-bold text-cyan-400 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                تقرير مخرجات المهمة المسجل:
                              </span>
                              <p className="text-slate-300 leading-relaxed font-sans">{task.deliverableSnippet}</p>
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
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
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
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-800 bg-slate-900/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              سجل نقاط الموظفين والمدققين المعتمدين (تظهر فوراً في لوحات تحكمهم)
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              يمكنك من هنا زيادة رصيد أي موظف أو مدقق مع تسجيل سبب المكافأة وتوثيقه في سجله الخاص
            </CardDescription>
          </div>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
            نظام المكافآت المباشر
          </Badge>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3.5">الموظف / المدقق</th>
                <th className="p-3.5">التصنيف والوظيفة</th>
                <th className="p-3.5">المهام المنجزة</th>
                <th className="p-3.5">رصيد النقاط المحسوبة</th>
                <th className="p-3.5">الرتبة والشارة</th>
                <th className="p-3.5 text-center">الإجراء السريع</th>
              </tr>
            </thead>
            <tbody>
              {staffPoints.map((staff) => (
                <tr key={staff.userId} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-bold text-slate-100">
                    <div className="flex flex-col">
                      <span>{staff.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{staff.email}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                      {staff.roleLabel}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400 font-bold">
                    {staff.completedTasksCount} مهمة
                  </td>
                  <td className="p-3.5 font-mono text-amber-300 font-black text-sm">
                    {staff.totalPoints.toLocaleString()} نقطة ⭐
                  </td>
                  <td className="p-3.5 text-slate-200">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-amber-300 font-semibold text-[11px] border border-amber-500/20">
                      {staff.rankBadge}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <Button
                      onClick={() => {
                        setSelectedStaffForPoints(staff.userId);
                        setLinkedTaskIdForPoints(undefined);
                        setAwardReason(`مكافأة تقديرية للمدقق ${staff.name}`);
                        setPointsToAward(50);
                        setIsAwardPointsModalOpen(true);
                      }}
                      size="sm"
                      className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl h-8 px-3"
                    >
                      <Plus className="w-3.5 h-3.5 ml-1" />
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              منح وزيادة رصيد النقاط (تظهر مباشرة في لوحة تحكم الموظف)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              قم بتحديد الموظف أو المدقق وعدد النقاط والسبب، وسيتم تحديث رصيده فوراً وتوثيق الإجراء.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Staff Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">الموظف / المدقق المستهدف:</label>
              <select
                value={selectedStaffForPoints}
                onChange={(e) => setSelectedStaffForPoints(e.target.value)}
                className="w-full h-11 px-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                {staffPoints.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.name} ({s.roleLabel}) — رصيده الحالي: {s.totalPoints} نقطة
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Points Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">عدد النقاط الممنوحة:</label>
              <div className="flex items-center gap-2">
                {[25, 50, 100, 150, 200].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setPointsToAward(pts)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      pointsToAward === pts
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
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
                className="h-10 rounded-2xl bg-slate-950 border-slate-800 text-sm font-mono text-amber-400 font-bold mt-2 text-center"
              />
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">سبب منح النقاط / ملاحظة الإدارة:</label>
              <Textarea
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                placeholder="مثلاً: مكافأة تميز في تدقيق بنك أسئلة الفيزياء النووية بدقة 100%..."
                className="rounded-2xl bg-slate-950 border-slate-800 text-xs"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAwardPointsModalOpen(false)}
              className="border-slate-700 text-slate-300 rounded-2xl text-xs"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmAwardPoints}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-2xl"
            >
              تأكيد منح النقاط فوراً ✨
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Create New Task */}
      <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-cyan-400 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              تكليف بمهمة تدقيق أو إنجاز جديدة
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              قم بإنشاء مهمة جديدة وتعيين نوع المنفذ (مدقق بشري أو ذكاء اصطناعي AI) والوظيفة المحددة.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">عنوان المهمة:</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="مثلاً: تدقيق أسئلة الكيمياء الحرارية والتوازن..."
                className="h-11 rounded-2xl bg-slate-950 border-slate-800 text-xs text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">جهة التنفيذ:</label>
                <select
                  value={newTaskAssigneeType}
                  onChange={(e) => setNewTaskAssigneeType(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="auditor">مدقق بشري (Auditor)</option>
                  <option value="ai">ذكاء اصطناعي (AI Agent)</option>
                  <option value="teacher">معلم معتمد</option>
                  <option value="supervisor">مشرف أكاديمي</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">الوظيفة المحددة:</label>
                <select
                  value={newTaskRole}
                  onChange={(e) => setNewTaskRole(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
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
              <label className="text-xs font-semibold text-slate-300 block">نقاط الإنجاز المستحقة للمهمة:</label>
              <Input
                type="number"
                value={newTaskPoints}
                onChange={(e) => setNewTaskPoints(Math.max(10, parseInt(e.target.value, 10) || 50))}
                className="h-10 rounded-2xl bg-slate-950 border-slate-800 text-sm font-mono text-cyan-400 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">وصف المهمة وشروط الاعتماد:</label>
              <Textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="اكتب تفاصيل ومخرجات المهمة المتوقعة..."
                className="rounded-2xl bg-slate-950 border-slate-800 text-xs"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsNewTaskModalOpen(false)}
              className="border-slate-700 text-slate-300 rounded-2xl text-xs"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateNewTask}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs rounded-2xl"
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
