import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Tenant {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  settings: any;
  plan: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  permissions: any;
  created_at: string;
}

export const useTenant = () => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTenants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all tenants user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('tenant_members')
        .select('tenant_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const tenantIds = memberData.map(m => m.tenant_id);
        
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenants')
          .select('*')
          .in('id', tenantIds)
          .order('created_at', { ascending: false });

        if (tenantsError) throw tenantsError;

        setTenants(tenantsData || []);
        
        // Set current tenant from localStorage or use first tenant
        const savedTenantId = localStorage.getItem('currentTenantId');
        if (savedTenantId && tenantsData?.find(t => t.id === savedTenantId)) {
          setCurrentTenant(tenantsData.find(t => t.id === savedTenantId) || tenantsData[0]);
        } else {
          setCurrentTenant(tenantsData?.[0] || null);
        }
      }
    } catch (error: any) {
      console.error('Error fetching tenants:', error);
      toast({
        title: 'خطأ في تحميل المساحات',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      localStorage.setItem('currentTenantId', tenantId);
      toast({
        title: 'تم التبديل',
        description: `تم التبديل إلى ${tenant.name}`,
      });
    }
  };

  const createTenant = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      const slug = `ws-${Date.now().toString(36)}`;
      
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          owner_user_id: user.id,
          name,
          slug,
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('tenant_members')
        .insert({
          tenant_id: tenantData.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      await fetchTenants();
      
      toast({
        title: 'تم الإنشاء بنجاح',
        description: `تم إنشاء مساحة العمل "${name}"`,
      });

      return tenantData;
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      toast({
        title: 'خطأ في الإنشاء',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTenant = async (tenantId: string, updates: Partial<Tenant>) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', tenantId);

      if (error) throw error;

      await fetchTenants();
      
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث إعدادات المساحة',
      });
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      toast({
        title: 'خطأ في التحديث',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return {
    currentTenant,
    tenants,
    isLoading,
    switchTenant,
    createTenant,
    updateTenant,
    refreshTenants: fetchTenants,
  };
};
