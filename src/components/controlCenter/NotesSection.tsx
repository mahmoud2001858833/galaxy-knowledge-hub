import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function NotesSection() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacher_name: "",
    class_section: "",
    student_name: "",
    parent_name: "",
    description: ""
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("class_notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("حدث خطأ في جلب الملاحظات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("class_notes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotes(notes.filter(n => n.id !== id));
      toast.success("تم حذف الملاحظة بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("حدث خطأ في حذف الملاحظة");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: teacher } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const { error } = await supabase
        .from("class_notes")
        .insert({
          ...formData,
          teacher_id: teacher?.id || user.id
        });

      if (error) throw error;

      toast.success("تم إضافة الملاحظة بنجاح");
      setIsDialogOpen(false);
      setFormData({
        teacher_name: "",
        class_section: "",
        student_name: "",
        parent_name: "",
        description: ""
      });
      fetchNotes();
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("حدث خطأ في إضافة الملاحظة");
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">الملاحظات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة ملاحظة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة ملاحظة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم المعلم</Label>
                  <Input
                    value={formData.teacher_name}
                    onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>الصف والشعبة</Label>
                  <Input
                    value={formData.class_section}
                    onChange={(e) => setFormData({ ...formData, class_section: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم الطالب</Label>
                  <Input
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>اسم ولي الأمر</Label>
                  <Input
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>الملاحظة</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">إضافة</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <p className="text-muted-foreground">لا توجد ملاحظات</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المعلم</TableHead>
              <TableHead>الصف/الشعبة</TableHead>
              <TableHead>الطالب</TableHead>
              <TableHead>ولي الأمر</TableHead>
              <TableHead>الملاحظة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note) => (
              <TableRow key={note.id}>
                <TableCell>{note.teacher_name}</TableCell>
                <TableCell>{note.class_section}</TableCell>
                <TableCell>{note.student_name}</TableCell>
                <TableCell>{note.parent_name}</TableCell>
                <TableCell className="max-w-md truncate">{note.description}</TableCell>
                <TableCell>{new Date(note.created_at).toLocaleDateString('ar')}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(note.id)}
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
              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
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
