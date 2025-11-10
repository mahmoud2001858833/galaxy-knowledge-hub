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

export function AssignmentsSection() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    assignment_name: "",
    grade: "",
    section: "",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("class_assignments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("حدث خطأ في جلب الواجبات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("class_assignments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAssignments(assignments.filter(a => a.id !== id));
      toast.success("تم حذف الواجب بنجاح");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("حدث خطأ في حذف الواجب");
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
        .from("class_assignments")
        .insert({
          ...formData,
          teacher_id: teacher?.id || user.id
        });

      if (error) throw error;

      toast.success("تم إضافة الواجب بنجاح");
      setIsDialogOpen(false);
      setFormData({
        assignment_name: "",
        grade: "",
        section: "",
        description: "",
        image_url: ""
      });
      fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("حدث خطأ في إضافة الواجب");
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
        <h2 className="text-2xl font-bold">الواجبات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة واجب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة واجب جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>اسم الواجب</Label>
                <Input
                  value={formData.assignment_name}
                  onChange={(e) => setFormData({ ...formData, assignment_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الصف</Label>
                  <Input
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>الشعبة</Label>
                  <Input
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div>
                <Label>رابط الصورة (اختياري)</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button type="submit" className="w-full">إضافة</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground">لا توجد واجبات</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الواجب</TableHead>
              <TableHead>الصف</TableHead>
              <TableHead>الشعبة</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.assignment_name}</TableCell>
                <TableCell>{assignment.grade}</TableCell>
                <TableCell>{assignment.section}</TableCell>
                <TableCell className="max-w-md truncate">{assignment.description}</TableCell>
                <TableCell>{new Date(assignment.created_at).toLocaleDateString('ar')}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(assignment.id)}
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
              هل أنت متأكد من حذف هذا الواجب؟ لا يمكن التراجع عن هذا الإجراء.
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
