import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function SupervisorsSection() {
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_teacher_access")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSupervisors(data || []);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      toast.error("حدث خطأ في جلب المشرفين والمعلمين");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_teacher_access")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSupervisors(supervisors.filter(s => s.id !== id));
      toast.success("تم حذف الوصول بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting supervisor:", error);
      toast.error("حدث خطأ في حذف الوصول");
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
      <h2 className="text-2xl font-bold">المشرفون والمعلمون</h2>
      {supervisors.length === 0 ? (
        <p className="text-muted-foreground">لا يوجد مشرفون</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>مستوى الوصول</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supervisors.map((supervisor) => (
              <TableRow key={supervisor.id}>
                <TableCell>{supervisor.email}</TableCell>
                <TableCell>{supervisor.access_level}</TableCell>
                <TableCell>{new Date(supervisor.created_at).toLocaleDateString('ar')}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(supervisor.id)}
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
              هل أنت متأكد من حذف صلاحية الوصول هذه؟ لا يمكن التراجع عن هذا الإجراء.
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
