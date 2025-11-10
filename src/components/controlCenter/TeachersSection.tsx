import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function TeachersSection() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("حدث خطأ في جلب المعلمين");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("teachers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTeachers(teachers.filter(t => t.id !== id));
      toast.success("تم حذف المعلم بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("حدث خطأ في حذف المعلم");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">المعلمون</h2>
      {teachers.length === 0 ? (
        <p className="text-muted-foreground">لا يوجد معلمون</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>المدرسة</TableHead>
              <TableHead>المواد</TableHead>
              <TableHead>الصفوف والشعب</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.teacher_name}</TableCell>
                <TableCell>{teacher.school_name}</TableCell>
                <TableCell>{teacher.subjects?.join(", ")}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {teacher.grades_sections?.join(", ")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(teacher.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المعلم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
