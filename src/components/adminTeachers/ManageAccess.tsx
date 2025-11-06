import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Mail, Shield } from "lucide-react";

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

    const emailToAdd = newEmail.trim().toLowerCase();
    
    if (!emailToAdd) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicates
    if (accessList.some(access => access.email.toLowerCase() === emailToAdd)) {
      toast({
        title: "خطأ",
        description: "هذا البريد الإلكتروني موجود مسبقاً",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-access', {
        body: { email: emailToAdd, access_level: newAccessLevel }
      });

      if (error) throw error;

      toast({
        title: "تم الإضافة",
        description: "تم إضافة الوصول بنجاح"
      });

      setNewEmail("");
      setNewAccessLevel('member');
      fetchAccessList();
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
      super_admin: { variant: "default", label: "مشرف عام", icon: <Shield className="w-3 h-3" /> },
      admin: { variant: "secondary", label: "مشرف", icon: <Shield className="w-3 h-3" /> },
      member: { variant: "outline", label: "عضو", icon: <Mail className="w-3 h-3" /> }
    };

    const config = variants[level] || variants.member;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
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
          <CardTitle>قائمة المستخدمين ({accessList.length})</CardTitle>
          <CardDescription>جميع الأعضاء والمشرفين في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : accessList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد مستخدمون بعد
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessList.map((access) => (
                <Card key={access.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      {getAccessLevelBadge(access.access_level)}
                      {access.email !== 'jowmahdmoud6@gmail.com' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAccess(access.id, access.email)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm break-all">{access.email}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageAccess;