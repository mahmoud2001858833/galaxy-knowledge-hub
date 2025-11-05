import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, FolderOpen } from "lucide-react";
import AllProjects from "./AllProjects";
import ManageAccess from "./ManageAccess";

interface AdminSectionProps {
  userId: string;
  isSuperAdmin: boolean;
}

const AdminSection = ({ userId, isSuperAdmin }: AdminSectionProps) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'access'>('projects');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold">
          {isSuperAdmin ? 'منصة المشرف العام' : 'منصة المشرفين'}
        </h1>
        
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'projects' ? 'default' : 'outline'}
            onClick={() => setActiveTab('projects')}
            size="sm"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            جميع المشاريع
          </Button>
          {isSuperAdmin && (
            <Button
              variant={activeTab === 'access' ? 'default' : 'outline'}
              onClick={() => setActiveTab('access')}
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              إدارة الوصول
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'projects' && <AllProjects adminId={userId} isSuperAdmin={isSuperAdmin} />}
      {activeTab === 'access' && isSuperAdmin && <ManageAccess />}
    </div>
  );
};

export default AdminSection;
