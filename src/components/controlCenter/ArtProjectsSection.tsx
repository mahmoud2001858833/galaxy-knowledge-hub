import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ArtProjectsSection() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("art_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching art projects:", error);
      toast.error("حدث خطأ في جلب المشاريع الفنية");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("art_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== id));
      toast.success("تم حذف المشروع بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting art project:", error);
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
      <h2 className="text-2xl font-bold">مشاريع الفن والتصميم</h2>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">لا توجد مشاريع فنية</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الفنان</TableHead>
              <TableHead>عنوان المشروع</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الإعجابات</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.artist_name}</TableCell>
                <TableCell>{project.project_title}</TableCell>
                <TableCell className="max-w-md truncate">{project.description}</TableCell>
                <TableCell>{project.likes_count || 0}</TableCell>
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
              هل أنت متأكد من حذف هذا المشروع الفني؟ لا يمكن التراجع عن هذا الإجراء.
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
