import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  plan: string | null;
  is_active: boolean;
  settings: any;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  setCurrentTenant: (tenant: Tenant | null) => void;
  refreshTenants: () => Promise<void>;
  createTenant: (name: string) => Promise<Tenant | null>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTenants([]);
        setCurrentTenant(null);
        return;
      }

      // Get tenants where user is a member
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
          .in('id', tenantIds);

        if (tenantsError) throw tenantsError;

        const typedTenants = (tenantsData || []).map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          owner_user_id: t.owner_user_id,
          plan: t.plan,
          is_active: t.is_active ?? true,
          settings: t.settings,
        }));

        setTenants(typedTenants);
        
        // Set first tenant as current if none selected
        if (!currentTenant && typedTenants.length > 0) {
          setCurrentTenant(typedTenants[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTenant = async (name: string): Promise<Tenant | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const slug = `ws-${Date.now().toString(36)}`;
      
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name,
          slug,
          owner_user_id: user.id,
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Add user as owner member
      await supabase
        .from('tenant_members')
        .insert({
          tenant_id: tenantData.id,
          user_id: user.id,
          role: 'owner',
        });

      const newTenant: Tenant = {
        id: tenantData.id,
        name: tenantData.name,
        slug: tenantData.slug,
        owner_user_id: tenantData.owner_user_id,
        plan: tenantData.plan,
        is_active: tenantData.is_active ?? true,
        settings: tenantData.settings,
      };

      setTenants(prev => [...prev, newTenant]);
      setCurrentTenant(newTenant);
      
      return newTenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        tenants,
        isLoading,
        setCurrentTenant,
        refreshTenants: fetchTenants,
        createTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};