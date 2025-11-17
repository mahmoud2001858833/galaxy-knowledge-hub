import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ProgrammingProjectsSection() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("btec_student_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("حدث خطأ في جلب المشاريع");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete associated comments first
      await supabase
        .from("btec_project_comments")
        .delete()
        .eq("project_id", id);

      // Delete associated likes
      await supabase
        .from("btec_project_likes")
        .delete()
        .eq("project_id", id);

      // Delete the project
      const { error } = await supabase
        .from("btec_student_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== id));
      toast.success("تم حذف المشروع بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("حدث خطأ في حذف المشروع");
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
      <h2 className="text-2xl font-bold">مشاريع البرمجة</h2>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">لا توجد مشاريع</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الطالب</TableHead>
              <TableHead>اسم المشروع</TableHead>
              <TableHead>اللغات البرمجية</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.student_name}</TableCell>
                <TableCell>{project.project_name}</TableCell>
                <TableCell>{project.programming_languages?.join(", ")}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(project.id)}
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
              هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.
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
