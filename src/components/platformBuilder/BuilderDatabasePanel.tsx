import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database, Users, FileText, MessageSquare, Heart, 
  FolderOpen, RefreshCw, Trash2, CheckCircle, AlertCircle,
  BarChart3, Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface BuilderDatabasePanelProps {
  projectId: string;
}

interface Stats {
  users: number;
  content: number;
  comments: number;
  files: number;
  likes: number;
  sessions: number;
}

interface DataItem {
  id: string;
  [key: string]: any;
}

export const BuilderDatabasePanel = ({ projectId }: BuilderDatabasePanelProps) => {
  const [stats, setStats] = useState<Stats>({ users: 0, content: 0, comments: 0, files: 0, likes: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<string>("users");
  const [tableData, setTableData] = useState<DataItem[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);

  useEffect(() => {
    loadStats();
  }, [projectId]);

  useEffect(() => {
    loadTableData(activeTable);
  }, [activeTable, projectId]);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('builder-universal-api', {
        body: { projectId, action: 'get_stats' }
      });
      
      if (error) throw error;
      
      // Get additional stats
      const [likesResult, sessionsResult] = await Promise.all([
        supabase.from('builder_app_likes').select('*', { count: 'exact', head: true }).eq('builder_project_id', projectId),
        supabase.from('builder_app_sessions').select('*', { count: 'exact', head: true }).eq('builder_project_id', projectId),
      ]);
      
      setStats({
        ...data.data,
        likes: likesResult.count || 0,
        sessions: sessionsResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName: string) => {
    setLoadingTable(true);
    try {
      const tableMap: Record<string, string> = {
        users: 'builder_app_users',
        content: 'builder_app_content',
        comments: 'builder_app_comments',
        files: 'builder_app_files',
        likes: 'builder_app_likes',
        settings: 'builder_app_settings',
      };

      const dbTable = tableMap[tableName];
      let data: any[] = [];

      if (dbTable === 'builder_app_users') {
        const { data: result } = await supabase.from('builder_app_users').select('*').eq('builder_project_id', projectId).order('created_at', { ascending: false }).limit(100);
        data = result || [];
      } else if (dbTable === 'builder_app_content') {
        const { data: result } = await supabase.from('builder_app_content').select('*').eq('builder_project_id', projectId).order('created_at', { ascending: false }).limit(100);
        data = result || [];
      } else if (dbTable === 'builder_app_comments') {
        const { data: result } = await supabase.from('builder_app_comments').select('*').eq('builder_project_id', projectId).order('created_at', { ascending: false }).limit(100);
        data = result || [];
      } else if (dbTable === 'builder_app_files') {
        const { data: result } = await supabase.from('builder_app_files').select('*').eq('builder_project_id', projectId).order('created_at', { ascending: false }).limit(100);
        data = result || [];
      } else if (dbTable === 'builder_app_likes') {
        const { data: result } = await supabase.from('builder_app_likes').select('*').eq('builder_project_id', projectId).order('created_at', { ascending: false }).limit(100);
        data = result || [];
      } else if (dbTable === 'builder_app_settings') {
        const { data: result } = await supabase.from('builder_app_settings').select('*').eq('builder_project_id', projectId).limit(1);
        data = result || [];
      }

      setTableData(data as DataItem[]);
    } catch (error) {
      console.error('Error loading table data:', error);
      setTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  const handleDeleteItem = async (tableName: string, itemId: string) => {
    try {
      if (tableName === 'users') {
        const { error } = await supabase.from('builder_app_users').delete().eq('id', itemId);
        if (error) throw error;
      } else if (tableName === 'content') {
        const { error } = await supabase.from('builder_app_content').delete().eq('id', itemId);
        if (error) throw error;
      } else if (tableName === 'comments') {
        const { error } = await supabase.from('builder_app_comments').delete().eq('id', itemId);
        if (error) throw error;
      } else if (tableName === 'files') {
        const { error } = await supabase.from('builder_app_files').delete().eq('id', itemId);
        if (error) throw error;
      } else if (tableName === 'likes') {
        const { error } = await supabase.from('builder_app_likes').delete().eq('id', itemId);
        if (error) throw error;
      }
      
      toast.success('تم الحذف بنجاح');
      loadTableData(tableName);
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'فشل الحذف');
    }
  };

  const statsCards = [
    { key: 'users', label: 'المستخدمون', icon: Users, color: 'from-blue-500 to-blue-600' },
    { key: 'content', label: 'المحتوى', icon: FileText, color: 'from-green-500 to-green-600' },
    { key: 'comments', label: 'التعليقات', icon: MessageSquare, color: 'from-purple-500 to-purple-600' },
    { key: 'likes', label: 'الإعجابات', icon: Heart, color: 'from-pink-500 to-pink-600' },
    { key: 'files', label: 'الملفات', icon: FolderOpen, color: 'from-orange-500 to-orange-600' },
    { key: 'sessions', label: 'الجلسات النشطة', icon: CheckCircle, color: 'from-teal-500 to-teal-600' },
  ];

  const tables = [
    { key: 'users', label: 'المستخدمون', icon: Users },
    { key: 'content', label: 'المحتوى', icon: FileText },
    { key: 'comments', label: 'التعليقات', icon: MessageSquare },
    { key: 'files', label: 'الملفات', icon: FolderOpen },
    { key: 'likes', label: 'الإعجابات', icon: Heart },
    { key: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const renderTableRow = (item: DataItem, tableName: string) => {
    const columns = getColumnsForTable(tableName);
    return (
      <motion.tr
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
      >
        {columns.map(col => (
          <td key={col} className="py-3 px-4 text-sm">
            {formatValue(item[col], col)}
          </td>
        ))}
        <td className="py-3 px-4">
          {tableName !== 'settings' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteItem(tableName, item.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </td>
      </motion.tr>
    );
  };

  const getColumnsForTable = (tableName: string): string[] => {
    const columnsMap: Record<string, string[]> = {
      users: ['email', 'full_name', 'role', 'last_login', 'created_at'],
      content: ['title', 'content_type', 'category', 'likes_count', 'created_at'],
      comments: ['comment_text', 'user_id', 'content_id', 'created_at'],
      files: ['file_name', 'file_type', 'folder', 'created_at'],
      likes: ['user_id', 'content_id', 'created_at'],
      settings: ['site_name', 'primary_color', 'secondary_color', 'updated_at'],
    };
    return columnsMap[tableName] || [];
  };

  const getColumnLabel = (col: string): string => {
    const labels: Record<string, string> = {
      email: 'البريد الإلكتروني',
      full_name: 'الاسم الكامل',
      role: 'الدور',
      last_login: 'آخر دخول',
      created_at: 'تاريخ الإنشاء',
      title: 'العنوان',
      content_type: 'النوع',
      category: 'التصنيف',
      likes_count: 'الإعجابات',
      comment_text: 'التعليق',
      user_id: 'المستخدم',
      content_id: 'المحتوى',
      file_name: 'اسم الملف',
      file_type: 'نوع الملف',
      folder: 'المجلد',
      site_name: 'اسم الموقع',
      primary_color: 'اللون الرئيسي',
      secondary_color: 'اللون الثانوي',
      updated_at: 'آخر تحديث',
    };
    return labels[col] || col;
  };

  const formatValue = (value: any, col: string): string => {
    if (value === null || value === undefined) return '-';
    if (col.includes('_at') || col.includes('login')) {
      return new Date(value).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 50);
    if (typeof value === 'string' && value.length > 50) return value.slice(0, 50) + '...';
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">قاعدة البيانات</h2>
              <p className="text-xs text-muted-foreground">إدارة بيانات المشروع</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            متصلة
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {statsCards.map(({ key, label, icon: Icon, color }) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br p-[1px]"
              style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
            >
              <Card className={`p-3 bg-card/90 backdrop-blur-sm h-full`}>
                <div className="flex flex-col items-center text-center gap-1">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold">{stats[key as keyof Stats]}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tables Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTable} onValueChange={setActiveTable} className="flex-1 flex flex-col">
          <div className="border-b border-border px-4">
            <TabsList className="h-auto bg-transparent p-0 gap-1 flex-wrap">
              {tables.map(({ key, label, icon: Icon }) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-3 py-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {key === 'users' ? stats.users :
                     key === 'content' ? stats.content :
                     key === 'comments' ? stats.comments :
                     key === 'files' ? stats.files :
                     key === 'likes' ? stats.likes : '-'}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tables.map(({ key }) => (
            <TabsContent key={key} value={key} className="flex-1 m-0 overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                <span className="text-sm text-muted-foreground">
                  {tableData.length} سجل
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadTableData(key)}
                  disabled={loadingTable}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingTable ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>
              </div>
              
              <ScrollArea className="flex-1 h-[calc(100%-60px)]">
                {loadingTable ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : tableData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">لا توجد بيانات بعد</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      سيتم إنشاء البيانات تلقائياً عند استخدام المنصة
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        {getColumnsForTable(key).map(col => (
                          <th key={col} className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">
                            {getColumnLabel(col)}
                          </th>
                        ))}
                        <th className="py-3 px-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {tableData.map(item => renderTableRow(item, key))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
