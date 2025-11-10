import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ProgrammingPlatformsSection() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from("btec_custom_platforms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error("Error fetching platforms:", error);
      toast.error("حدث خطأ في جلب المنصات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("btec_custom_platforms")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPlatforms(platforms.filter(p => p.id !== id));
      toast.success("تم حذف المنصة بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting platform:", error);
      toast.error("حدث خطأ في حذف المنصة");
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
      <h2 className="text-2xl font-bold">المنصات البرمجية</h2>
      {platforms.length === 0 ? (
        <p className="text-muted-foreground">لا توجد منصات</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم المنصة</TableHead>
              <TableHead>اللغة</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platforms.map((platform) => (
              <TableRow key={platform.id}>
                <TableCell>{platform.name}</TableCell>
                <TableCell>{platform.language}</TableCell>
                <TableCell className="max-w-md truncate">{platform.description}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(platform.id)}
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
              هل أنت متأكد من حذف هذه المنصة؟ لا يمكن التراجع عن هذا الإجراء.
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
