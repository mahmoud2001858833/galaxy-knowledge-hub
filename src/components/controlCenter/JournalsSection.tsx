import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function JournalsSection() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from("scientific_journals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJournals(data || []);
    } catch (error) {
      console.error("Error fetching journals:", error);
      toast.error("حدث خطأ في جلب المجلات العلمية");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scientific_journals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setJournals(journals.filter(j => j.id !== id));
      toast.success("تم حذف المجلة بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting journal:", error);
      toast.error("حدث خطأ في حذف المجلة");
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
      <h2 className="text-2xl font-bold">المجلات العلمية</h2>
      {journals.length === 0 ? (
        <p className="text-muted-foreground">لا توجد مجلات</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>المادة</TableHead>
              <TableHead>الكاتب</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journals.map((journal) => (
              <TableRow key={journal.id}>
                <TableCell>{journal.title}</TableCell>
                <TableCell>{journal.subject}</TableCell>
                <TableCell>{journal.author}</TableCell>
                <TableCell className="max-w-md truncate">{journal.description}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(journal.id)}
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
              هل أنت متأكد من حذف هذه المجلة؟ لا يمكن التراجع عن هذا الإجراء.
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
