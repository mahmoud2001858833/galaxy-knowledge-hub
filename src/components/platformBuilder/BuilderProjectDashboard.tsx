import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, MessageSquare, Image, Database, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectStats {
  users: number;
  content: number;
  comments: number;
  files: number;
}

interface BuilderProjectDashboardProps {
  projectId: string;
}

export function BuilderProjectDashboard({ projectId }: BuilderProjectDashboardProps) {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [projectId]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('builder-universal-api', {
        body: {
          projectId,
          action: 'get_stats',
          data: {}
        }
      });

      if (error) throw error;
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setStats({ users: 0, content: 0, comments: 0, files: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Database Status */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Database className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-500">قاعدة البيانات</span>
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  جاهزة
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                متصلة تلقائياً - لا حاجة لأي إعداد
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="المستخدمين"
          value={stats?.users || 0}
          color="blue"
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="المحتوى"
          value={stats?.content || 0}
          color="purple"
        />
        <StatCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="التعليقات"
          value={stats?.comments || 0}
          color="orange"
        />
        <StatCard
          icon={<Image className="h-4 w-4" />}
          label="الملفات"
          value={stats?.files || 0}
          color="pink"
        />
      </div>

      {/* Features */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">الميزات المتاحة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <FeatureItem label="نظام المصادقة" enabled />
          <FeatureItem label="إدارة المحتوى" enabled />
          <FeatureItem label="رفع الملفات" enabled />
          <FeatureItem label="نظام الإعجابات" enabled />
          <FeatureItem label="التعليقات" enabled />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  color: 'blue' | 'purple' | 'orange' | 'pink';
}) {
  const colors = {
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30',
    purple: 'from-purple-500/10 to-violet-500/10 border-purple-500/30',
    orange: 'from-orange-500/10 to-amber-500/10 border-orange-500/30',
    pink: 'from-pink-500/10 to-rose-500/10 border-pink-500/30',
  };

  const iconColors = {
    blue: 'text-blue-500 bg-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/20',
    orange: 'text-orange-500 bg-orange-500/20',
    pink: 'text-pink-500 bg-pink-500/20',
  };

  return (
    <Card className={`bg-gradient-to-br ${colors[color]}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${iconColors[color]}`}>
            {icon}
          </div>
          <div>
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle className={`h-4 w-4 ${enabled ? 'text-green-500' : 'text-muted-foreground'}`} />
      <span className={enabled ? '' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}
