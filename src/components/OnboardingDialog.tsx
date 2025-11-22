import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface OnboardingDialogProps {
  open: boolean;
  onComplete: (name: string, grade: string, semester: string) => void;
  initialName?: string;
  initialGrade?: string;
  initialSemester?: string;
}

export default function OnboardingDialog({ 
  open, 
  onComplete, 
  initialName = "", 
  initialGrade = "", 
  initialSemester = "" 
}: OnboardingDialogProps) {
  const [studentName, setStudentName] = useState(initialName);
  const [grade, setGrade] = useState(initialGrade);
  const [semester, setSemester] = useState(initialSemester);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!studentName.trim() || !grade || !semester) {
      toast({
        title: "⚠️ معلومات ناقصة",
        description: "يرجى إدخال جميع المعلومات للمتابعة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save to database with conflict resolution on user_id
        const { error } = await supabase
          .from('jordanian_assistant_users')
          .upsert({
            user_id: user.id,
            student_name: studentName.trim(),
            grade,
            semester,
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
      }

      // Save to localStorage
      localStorage.setItem('jordanian_assistant_student_name', studentName.trim());
      localStorage.setItem('jordanian_assistant_student_grade', grade);
      localStorage.setItem('jordanian_assistant_student_semester', semester);
      
      toast({
        title: "✅ مرحباً بك!",
        description: `أهلاً ${studentName}، نتمنى لك تجربة تعليمية ممتعة`,
      });

      onComplete(studentName.trim(), grade, semester);
    } catch (error) {
      console.error('Error saving user info:', error);
      toast({
        title: "⚠️ خطأ",
        description: "حدث خطأ أثناء حفظ المعلومات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle className="text-2xl text-center mb-2">
              🎓 مرحباً بك في مساعدك الأردني
            </DialogTitle>
            <DialogDescription className="text-center">
              نسعد بانضمامك! يرجى إدخال معلوماتك لنبدأ رحلتك التعليمية
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <motion.div
          className="space-y-4 py-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input
              id="name"
              placeholder="أدخل اسمك الكامل"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">الصف</Label>
            <Select value={grade} onValueChange={setGrade} disabled={loading}>
              <SelectTrigger id="grade">
                <SelectValue placeholder="اختر الصف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الصف السابع">الصف السابع</SelectItem>
                <SelectItem value="الصف الثامن">الصف الثامن</SelectItem>
                <SelectItem value="الصف التاسع">الصف التاسع</SelectItem>
                <SelectItem value="الصف العاشر">الصف العاشر</SelectItem>
                <SelectItem value="الأول ثانوي">الأول ثانوي</SelectItem>
                <SelectItem value="الثاني ثانوي">الثاني ثانوي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">الفصل الدراسي</Label>
            <Select value={semester} onValueChange={setSemester} disabled={loading}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="اختر الفصل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={loading}
          >
            {loading ? "جارٍ الحفظ..." : "ابدأ الآن"}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
