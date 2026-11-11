import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  FolderOpen, 
  MessageSquare, 
  Loader2, 
  X, 
  Trophy, 
  Award, 
  Star, 
  CheckCircle2, 
  Zap, 
  Calendar, 
  Sparkles, 
  FileText, 
  CheckCircle 
} from "lucide-react";
import PreviousProjects from "./PreviousProjects";
import SupervisorMessages from "./SupervisorMessages";
import { adminTaskService, type StaffPointsProfile, type TaskItem } from "@/services/adminTaskManagementService";

interface MemberSectionProps {
  userId: string;
}

const MemberSection = ({ userId }: MemberSectionProps) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'projects' | 'messages' | 'points'>('submit');
  const [teacherName, setTeacherName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Employee Points Profile State
  const [pointsProfile, setPointsProfile] = useState<StaffPointsProfile>(() => 
    adminTaskService.getEmployeePointsProfile(userId)
  );
  const [myTasks, setMyTasks] = useState<TaskItem[]>(() => {
    const all = adminTaskService.getTasks();
    return all.filter(t => t.assigneeId === userId || t.assigneeEmail === userId || t.assigneeName.includes(teacherName));
  });

  useEffect(() => {
    const refreshProfile = () => {
      setPointsProfile(adminTaskService.getEmployeePointsProfile(userId));
      const all = adminTaskService.getTasks();
      setMyTasks(all.filter(t => t.assigneeId === userId || t.assigneeEmail === userId || (teacherName && t.assigneeName.includes(teacherName))));
    };

    window.addEventListener('galaxy_points_updated', refreshProfile);
    window.addEventListener('galaxy_tasks_updated', refreshProfile);
    return () => {
      window.removeEventListener('galaxy_points_updated', refreshProfile);
      window.removeEventListener('galaxy_tasks_updated', refreshProfile);
    };
  }, [userId, teacherName]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages([...images, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherName.trim() || !description.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images if any
      const imageUrls: string[] = [];
      
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `teacher-projects/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // Find a supervisor (prefer super_admin)
      // Members can't read the access list (RLS), so resolve it server-side
      const { data: supervisorUserId } = await supabase.rpc('get_primary_supervisor_id');

      const supervisorId = supervisorUserId || null;

      // Insert project assigned to supervisor
      const { error: insertError } = await supabase
        .from('teacher_projects')
        .insert([
          {
            member_id: userId,
            teacher_name: teacherName,
            description: description,
            images: imageUrls,
            admin_id: supervisorId
          }
        ]);

      if (insertError) throw insertError;

      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال المشروع بنجاح"
      });

      // Reset form
      setTeacherName("");
      setDescription("");
      setImages([]);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال المشروع",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Points & Achievements Header Widget */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-cyan-500/15 border border-amber-500/30 shadow-lg backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-500 dark:text-amber-300 font-bold">لوحة تحكم الموظف / المدقق المعتمد</span>
              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30 text-[10px]">
                {pointsProfile.rankBadge}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              رصيد النقاط والمكافآت المعتمدة: <span className="font-mono text-amber-600 dark:text-amber-400 font-black">{pointsProfile.totalPoints} نقطة ⭐</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              المستوى: <strong className="text-slate-800 dark:text-slate-200">{pointsProfile.rankLevel}</strong> • إجمالي المهام المنجزة والمعتمدة من الإدارة: <strong className="text-cyan-600 dark:text-cyan-400 font-mono">{pointsProfile.completedTasksCount} مهمة</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-center justify-end">
          <Button
            variant={activeTab === 'points' ? 'default' : 'outline'}
            onClick={() => setActiveTab('points')}
            className={`rounded-2xl text-xs font-bold gap-1.5 ${
              activeTab === 'points'
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>سجل مكافآت ونقاط الإدارة ({pointsProfile.recentAwards?.length || 0})</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">منصة الأعضاء والكوادر</h1>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeTab === 'submit' ? 'default' : 'outline'}
            onClick={() => setActiveTab('submit')}
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            إرسال مشروع جديد
          </Button>
          <Button
            variant={activeTab === 'projects' ? 'default' : 'outline'}
            onClick={() => setActiveTab('projects')}
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <FolderOpen className="w-4 h-4 mr-1.5" />
            المشاريع السابقة
          </Button>
          <Button
            variant={activeTab === 'messages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('messages')}
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            رسائل المشرف
          </Button>
          <Button
            variant={activeTab === 'points' ? 'default' : 'outline'}
            onClick={() => setActiveTab('points')}
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <Trophy className="w-4 h-4 mr-1.5 text-amber-400" />
            تفاصيل النقاط
          </Button>
        </div>
      </div>

      {activeTab === 'submit' && (
        <Card>
          <CardHeader>
            <CardTitle>إرسال مشروع جديد</CardTitle>
            <CardDescription>املأ النموذج أدناه لإرسال مشروعك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="teacherName">اسم المعلم</Label>
                <Input
                  id="teacherName"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="أدخل اسم المعلم"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف والشرح</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل وصف المشروع والشرح"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="images">الصور (اختياري)</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                {images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 ml-2" />
                    إرسال
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'projects' && <PreviousProjects userId={userId} />}
      {activeTab === 'messages' && <SupervisorMessages userId={userId} />}

      {activeTab === 'points' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">إجمالي النقاط المعتمدة</p>
                  <p className="text-3xl font-black text-amber-500 font-mono mt-1">{pointsProfile.totalPoints}</p>
                  <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium mt-0.5">نقطة كفاءة وامتياز</p>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">الرتبة والشارة</p>
                  <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{pointsProfile.rankBadge}</p>
                  <p className="text-[11px] text-cyan-600/80 dark:text-cyan-400/80 font-medium mt-0.5">{pointsProfile.rankLevel}</p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-500">
                  <Trophy className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">المهام المنجزة المعتمدة</p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{pointsProfile.completedTasksCount}</p>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-0.5">مهمة مكتملة ومدققة</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">عدد مكافآت الإدارة</p>
                  <p className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">{pointsProfile.recentAwards?.length || 0}</p>
                  <p className="text-[11px] text-purple-600/80 dark:text-purple-400/80 font-medium mt-0.5">مكافأة مباشرة مسجلة</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-500">
                  <Award className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ledger of Points Awards */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>سجل مكافآت ونقاط الإدارة المباشرة</span>
                  </CardTitle>
                  <CardDescription>
                    النقاط والمكافآت التي تمت إضافتها لحسابك مباشرة من لوحة تحكم الإدارة العليا أو تقييم المهام
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400">
                  مجموع المكافآت: {pointsProfile.recentAwards?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {(!pointsProfile.recentAwards || pointsProfile.recentAwards.length === 0) ? (
                <div className="p-8 text-center text-muted-foreground border border-dashed rounded-2xl">
                  <Trophy className="w-10 h-10 mx-auto text-amber-500/40 mb-2" />
                  <p className="font-semibold text-sm">لا توجد حركات نقاط مسجلة بعد</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    سيقوم المشرف والمدققين وإدارة النظام بإضافة نقاط تقديرية عند إنجازك للمهام والمشاريع بدقة.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pointsProfile.recentAwards.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {item.reason || "مكافأة تميز وإنجاز"}
                            </span>
                            {item.taskTitle && (
                              <Badge variant="secondary" className="text-[10px] bg-slate-200/70 dark:bg-slate-800">
                                مهمة: {item.taskTitle}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.timestamp).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                            </span>
                            <span>•</span>
                            <span>بواسطة: <strong>{item.awardedBy || "الإدارة المركزية"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-black text-sm">
                          +{item.points} نقطة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Associated Tasks & Auditor Review */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-500" />
                <span>المهام والتدقيقات المرتبطة بك</span>
              </CardTitle>
              <CardDescription>
                حالة المهام المسندة إليك ومجموع النقاط الممنوحة لكل مهمة منجزَة
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {myTasks.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground border border-dashed rounded-2xl">
                  <CheckCircle className="w-8 h-8 mx-auto text-cyan-500/40 mb-2" />
                  <p className="text-sm">لا توجد مهام إدارية مسندة إليك حالياً في جدول المهام المركزي</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{task.title}</h4>
                          <Badge variant="outline" className="text-[10px]">
                            {task.assigneeRoleLabel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-[11px] ${
                              task.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : task.status === 'in_review'
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {task.status === 'completed' ? 'منجزة ومعتمدة' : task.status === 'in_review' ? 'قيد التدقيق' : 'قيد التنفيذ'}
                          </Badge>
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {task.pointsAwarded} / {task.pointsPossible} نقطة
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {task.description}
                      </p>

                      {task.adminFeedback && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                          <strong>ملاحظات الإدارة:</strong> {task.adminFeedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MemberSection;
