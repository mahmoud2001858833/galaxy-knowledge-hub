import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Access {
  id: string;
  email: string;
  access_level: 'member' | 'admin' | 'super_admin';
  created_at: string;
}

const ManageAccess = () => {
  const [accessList, setAccessList] = useState<Access[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newAccessLevel, setNewAccessLevel] = useState<'member' | 'admin'>('member');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccessList();
  }, []);

  const fetchAccessList = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_teacher_access')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAccessList(data || []);
    } catch (error) {
      console.error("Error fetching access list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Check if user exists in profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .limit(1000);
      
      // Get all user emails from admin_teacher_access and profiles
      const { data: existingEmails } = await supabase
        .from('admin_teacher_access')
        .select('email, user_id');

      // Find user by checking if they have a profile
      let userId: string | null = null;
      
      // Try to find the user in existing access records
      const existingUser = existingEmails?.find(u => u.email === newEmail);
      if (existingUser) {
        userId = existingUser.user_id;
      } else {
        // If not found, we need to get it from auth (this requires the user to be logged in once)
        toast({
          title: "تنبيه",
          description: "يجب أن يكون المستخدم قد سجل الدخول مرة واحدة على الأقل",
          variant: "default"
        });
        setSubmitting(false);
        return;
      }

      const { data: currentUser } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('admin_teacher_access')
        .insert([
          {
            user_id: userId,
            email: newEmail,
            access_level: newAccessLevel,
            created_by: currentUser.user?.id
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "خطأ",
            description: "هذا البريد الإلكتروني موجود بالفعل",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "تم الإضافة",
          description: "تم إضافة الوصول بنجاح"
        });

        setNewEmail("");
        setNewAccessLevel('member');
        fetchAccessList();
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الوصول",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAccess = async (id: string, email: string) => {
    if (email === 'jowmahdmoud6@gmail.com') {
      toast({
        title: "خطأ",
        description: "لا يمكن حذف المشرف العام الرئيسي",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_teacher_access')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الوصول بنجاح"
      });

      fetchAccessList();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الوصول",
        variant: "destructive"
      });
    }
  };

  const getAccessLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      super_admin: { variant: "default", label: "مشرف عام" },
      admin: { variant: "secondary", label: "مشرف" },
      member: { variant: "outline", label: "عضو" }
    };

    const config = variants[level] || variants.member;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إضافة عضو أو مشرف جديد</CardTitle>
          <CardDescription>
            أدخل البريد الإلكتروني للمستخدم واختر مستوى الوصول
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAccess} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="accessLevel">مستوى الوصول</Label>
                <Select value={newAccessLevel} onValueChange={(value: any) => setNewAccessLevel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">عضو</SelectItem>
                    <SelectItem value="admin">مشرف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 ml-2" />
              )}
              إضافة
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>مستوى الوصول</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessList.map((access) => (
                  <TableRow key={access.id}>
                    <TableCell>{access.email}</TableCell>
                    <TableCell>{getAccessLevelBadge(access.access_level)}</TableCell>
                    <TableCell>
                      {access.email !== 'jowmahdmoud6@gmail.com' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAccess(access.id, access.email)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageAccess;
