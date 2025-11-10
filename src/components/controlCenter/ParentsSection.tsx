import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ParentsSection() {
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const { data, error } = await supabase
        .from("parents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParents(data || []);
    } catch (error) {
      console.error("Error fetching parents:", error);
      toast.error("حدث خطأ في جلب أولياء الأمور");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("parents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setParents(parents.filter(p => p.id !== id));
      toast.success("تم حذف ولي الأمر بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting parent:", error);
      toast.error("حدث خطأ في حذف ولي الأمر");
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
      <h2 className="text-2xl font-bold">أولياء الأمور</h2>
      {parents.length === 0 ? (
        <p className="text-muted-foreground">لا يوجد أولياء أمور</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم ولي الأمر</TableHead>
              <TableHead>اسم الطالب</TableHead>
              <TableHead>المدرسة</TableHead>
              <TableHead>الصف</TableHead>
              <TableHead>الشعبة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parents.map((parent) => (
              <TableRow key={parent.id}>
                <TableCell>{parent.parent_name}</TableCell>
                <TableCell>{parent.student_name}</TableCell>
                <TableCell>{parent.school_name}</TableCell>
                <TableCell>{parent.grade}</TableCell>
                <TableCell>{parent.section}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(parent.id)}
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
              هل أنت متأكد من حذف ولي الأمر هذا؟ لا يمكن التراجع عن هذا الإجراء.
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
