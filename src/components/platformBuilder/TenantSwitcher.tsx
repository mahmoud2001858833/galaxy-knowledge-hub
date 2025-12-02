import { useState } from 'react';
import { Check, Plus, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTenant } from '@/hooks/useTenant';

export const TenantSwitcher = () => {
  const { currentTenant, tenants, switchTenant, createTenant } = useTenant();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) return;

    setIsCreating(true);
    const result = await createTenant(newTenantName);
    setIsCreating(false);

    if (result) {
      setIsCreateDialogOpen(false);
      setNewTenantName('');
    }
  };

  if (!currentTenant) return null;

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="max-w-[150px] truncate">{currentTenant.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px]">
          <DropdownMenuLabel>مساحات العمل</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tenants.map((tenant) => (
            <DropdownMenuItem
              key={tenant.id}
              onClick={() => switchTenant(tenant.id)}
              className="gap-2"
            >
              <Building2 className="h-4 w-4" />
              <span className="flex-1 truncate">{tenant.name}</span>
              {currentTenant.id === tenant.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2 text-primary"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء مساحة عمل جديدة</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء مساحة عمل جديدة</DialogTitle>
            <DialogDescription>
              أنشئ مساحة عمل جديدة لتنظيم مشاريعك
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">اسم المساحة</Label>
              <Input
                id="tenant-name"
                placeholder="مثال: مشاريع الشركة"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isCreating) {
                    handleCreateTenant();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateTenant}
              disabled={!newTenantName.trim() || isCreating}
            >
              {isCreating ? 'جاري الإنشاء...' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
