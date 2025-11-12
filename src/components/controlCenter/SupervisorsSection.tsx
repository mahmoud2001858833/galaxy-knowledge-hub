import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";


export function SupervisorsSection() {
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDeleteImmediate = async (record: any) => {
    // حذف فوري من القائمة أولاً
    const originalSupervisors = [...supervisors];
    setSupervisors(supervisors.filter((s) => s.id !== record.id));

    const targetId = String(record.id);
    try {
      // ثم حذف من قاعدة البيانات — تحقق من عدد الصفوف المحذوفة
      const { data: deletedById, error: idError } = await supabase
        .from("admin_teacher_access")
        .delete()
        .eq("id", targetId)
        .select("id");

      if (idError) throw idError;

      if (!deletedById || deletedById.length === 0) {
        // احتياط: الحذف بواسطة البريد في حال اختلاف نوع/قيمة المعرّف
        const { data: deletedByEmail, error: emailError } = await supabase
          .from("admin_teacher_access")
          .delete()
          .eq("email", record.email)
          .select("id");

        if (emailError) throw emailError;
        if (!deletedByEmail || deletedByEmail.length === 0) {
          setSupervisors(originalSupervisors);
          toast.error("تعذر الحذف: لم يتم العثور على السجل");
          return;
        }
      }

      toast.success("تم حذف الوصول بنجاح");
    } catch (error: any) {
      console.error("Error deleting supervisor:", error);
      setSupervisors(originalSupervisors);
      toast.error(error?.message || "حدث خطأ في حذف الوصول");
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
                    onClick={() => handleDeleteImmediate(supervisor)}
                    aria-label="حذف الوصول"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

    </div>
  );
}
