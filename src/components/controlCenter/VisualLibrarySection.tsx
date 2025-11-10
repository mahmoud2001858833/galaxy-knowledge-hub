import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function VisualLibrarySection() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("educational_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("حدث خطأ في جلب الصور");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("educational_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setImages(images.filter(img => img.id !== id));
      toast.success("تم حذف الصورة بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("حدث خطأ في حذف الصورة");
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
      <h2 className="text-2xl font-bold">المكتبة البصرية</h2>
      {images.length === 0 ? (
        <p className="text-muted-foreground">لا توجد صور</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>المادة</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images.map((image) => (
              <TableRow key={image.id}>
                <TableCell>{image.title}</TableCell>
                <TableCell>{image.subject}</TableCell>
                <TableCell className="max-w-md truncate">{image.description}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(image.id)}
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
              هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.
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
