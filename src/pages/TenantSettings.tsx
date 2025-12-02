import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTenant, TenantMember } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TenantSettings = () => {
  const navigate = useNavigate();
  const { currentTenant, updateTenant } = useTenant();
  const { toast } = useToast();
  const [tenantName, setTenantName] = useState('');
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentTenant) {
      setTenantName(currentTenant.name);
      fetchMembers();
    }
  }, [currentTenant]);

  const fetchMembers = async () => {
    if (!currentTenant) return;

    try {
      const { data, error } = await supabase
        .from('tenant_members')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      toast({
        title: 'خطأ في تحميل الأعضاء',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTenant = async () => {
    if (!currentTenant || !tenantName.trim()) return;

    setIsLoading(true);
    await updateTenant(currentTenant.id, { name: tenantName });
    setIsLoading(false);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      owner: 'default',
      admin: 'secondary',
      member: 'outline',
      viewer: 'outline',
    };

    const labels: Record<string, string> = {
      owner: 'مالك',
      admin: 'مدير',
      member: 'عضو',
      viewer: 'مشاهد',
    };

    return (
      <Badge variant={variants[role] || 'outline'}>
        {labels[role] || role}
      </Badge>
    );
  };

  if (!currentTenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/ai-platform-builder')}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">إعدادات المساحة</h1>
            <p className="text-muted-foreground">إدارة مساحة العمل والأعضاء</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              إعدادات عامة
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              الأعضاء
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>معلومات المساحة</CardTitle>
                <CardDescription>
                  قم بتحديث معلومات مساحة العمل الخاصة بك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tenant-name">اسم المساحة</Label>
                  <Input
                    id="tenant-name"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="اسم مساحة العمل"
                  />
                </div>

                <div className="space-y-2">
                  <Label>المعرف الفريد</Label>
                  <Input
                    value={currentTenant.slug}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    المعرف الفريد لا يمكن تغييره
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>الخطة الحالية</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-base px-4 py-1">
                      {currentTenant.plan === 'free' ? 'مجانية' : currentTenant.plan}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleUpdateTenant}
                  disabled={isLoading || !tenantName.trim()}
                >
                  {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>أعضاء المساحة</CardTitle>
                <CardDescription>
                  إدارة الأعضاء وصلاحياتهم في مساحة العمل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">عضو #{member.user_id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          انضم في {new Date(member.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(member.role)}
                        {member.role !== 'owner' && (
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {members.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      لا يوجد أعضاء آخرون في هذه المساحة
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TenantSettings;
