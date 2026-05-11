import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Code, Eye, Trash2, Plus, Bot, X, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomPlatform {
  id: string;
  name: string;
  description: string;
  language: string;
  custom_code: string;
  user_id: string;
  created_at: string;
  is_rendered: boolean;
}

const BuildPlatformTab = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<CustomPlatform[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFullScreenView, setIsFullScreenView] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<CustomPlatform | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'HTML',
    custom_code: '',
  });

  // AI Assistant states
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchPlatforms();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('btec_custom_platforms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error: any) {
      console.error('Error fetching platforms:', error);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return;
    }

    if (!formData.name || !formData.custom_code) {
      toast({ title: "تنبيه", description: "الرجاء ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('btec_custom_platforms')
        .insert([{
          user_id: currentUser.id,
          name: formData.name,
          description: formData.description,
          language: formData.language,
          custom_code: formData.custom_code,
          is_rendered: true,
        }]);

      if (error) throw error;

      toast({ title: "✅ نجح", description: "تم إنشاء المنصة بنجاح" });
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', language: 'HTML', custom_code: '' });
      fetchPlatforms();
    } catch (error: any) {
      console.error('Error creating platform:', error);
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!currentUser || !selectedPlatform) return;

    if (!formData.name || !formData.custom_code) {
      toast({ title: "تنبيه", description: "الرجاء ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('btec_custom_platforms')
        .update({
          name: formData.name,
          description: formData.description,
          language: formData.language,
          custom_code: formData.custom_code,
        })
        .eq('id', selectedPlatform.id)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      toast({ title: "✅ تم التحديث", description: "تم تحديث المنصة بنجاح" });
      setIsEditDialogOpen(false);
      fetchPlatforms();
    } catch (error: any) {
      console.error('Error updating platform:', error);
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (platformId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('btec_custom_platforms')
        .delete()
        .eq('id', platformId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      toast({ title: "✅ تم الحذف", description: "تم حذف المنصة بنجاح" });
      fetchPlatforms();
    } catch (error: any) {
      console.error('Error deleting platform:', error);
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  const handleAIAssistant = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "تنبيه", description: "الرجاء إدخال سؤالك", variant: "destructive" });
      return;
    }

    setAiLoading(true);
    setAiResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('dev-assistant-service', {
        body: { action: 'programming-assistant', prompt: aiPrompt }
      });

      if (error) throw error;

      if (data && data.response) {
        setAiResponse(data.response);
        toast({ title: "✅ تم", description: "تم الحصول على الإجابة" });
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const openEditDialog = (platform: CustomPlatform) => {
    setSelectedPlatform(platform);
    setFormData({
      name: platform.name,
      description: platform.description || '',
      language: platform.language,
      custom_code: platform.custom_code,
    });
    setIsEditDialogOpen(true);
  };

  const renderPlatform = (platform: CustomPlatform) => {
    if (platform.language === 'HTML' || platform.language === 'CSS') {
      return (
        <iframe
          srcDoc={platform.custom_code}
          className="w-full h-full border-0 bg-white"
          title={platform.name}
          sandbox="allow-scripts"
        />
      );
    }
    
    if (platform.language === 'JavaScript') {
      const htmlWithJs = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                background: #1a1a1a;
                color: #fff;
              }
              #output { 
                background: #2a2a2a; 
                padding: 15px; 
                border-radius: 8px;
                margin-top: 10px;
                border: 1px solid #444;
              }
            </style>
          </head>
          <body>
            <div id="app"></div>
            <div id="output"></div>
            <script>
              const output = document.getElementById('output');
              const originalLog = console.log;
              console.log = function(...args) {
                originalLog.apply(console, args);
                const line = document.createElement('div');
                line.textContent = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
                output.appendChild(line);
              };
              
              try {
                ${platform.custom_code}
              } catch (error) {
                const errEl = document.createElement('span');
                errEl.style.color = '#ff6b6b';
                errEl.textContent = 'خطأ: ' + (error && error.message ? error.message : String(error));
                output.innerHTML = '';
                output.appendChild(errEl);
              }
            </script>
          </body>
        </html>
      `;
      
      return (
        <iframe
          srcDoc={htmlWithJs}
          className="w-full h-full border-0"
          title={platform.name}
          sandbox="allow-scripts"
        />
      );
    }
    
    return (
      <div className="bg-gray-900 rounded-lg p-4 border border-white/10 h-full overflow-auto">
        <div className="mb-2 text-yellow-400 text-sm">
          ملاحظة: لا يمكن تشغيل كود {platform.language} في المتصفح. يتم عرض الكود فقط.
        </div>
        <pre className="text-green-400 text-sm overflow-x-auto">
          <code>{platform.custom_code}</code>
        </pre>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex gap-4 justify-end">
        <Button
          onClick={() => setAiDialogOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Bot className="w-5 h-5 mr-2" />
          مساعد البرمجة
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <Plus className="w-5 h-5 mr-2" />
              إنشاء منصة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-indigo-900">
            <DialogHeader>
              <DialogTitle className="text-2xl">إنشاء منصة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="اسم المنصة *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10"
              />
              <Textarea
                placeholder="وصف المنصة"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/5 border-white/10"
              />
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HTML">HTML</SelectItem>
                  <SelectItem value="CSS">CSS</SelectItem>
                  <SelectItem value="JAVA">Java</SelectItem>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="اكتب الكود هنا *"
                value={formData.custom_code}
                onChange={(e) => setFormData({ ...formData, custom_code: e.target.value })}
                className="bg-gray-900 border-white/10 min-h-[300px] font-mono text-sm text-green-400"
              />
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
              >
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء المنصة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform, idx) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{platform.name}</CardTitle>
                    <CardDescription className="text-gray-300 mt-1">
                      {platform.description || 'منصة مخصصة'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-indigo-500/20">{platform.language}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setSelectedPlatform(platform);
                      setIsFullScreenView(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    عرض المنصة
                  </Button>
                  {currentUser && platform.user_id === currentUser.id && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:bg-blue-500/20"
                        onClick={() => openEditDialog(platform)}
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:bg-red-500/20"
                        onClick={() => handleDelete(platform.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {platforms.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <Rocket className="w-20 h-20 mx-auto mb-4 opacity-50" />
          <p className="text-lg">لا توجد منصات حالياً. ابدأ بإنشاء منصتك الأولى!</p>
        </div>
      )}

      {/* Full Screen View */}
      {isFullScreenView && selectedPlatform && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={() => setIsFullScreenView(false)}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/30"
            >
              <X className="w-5 h-5 mr-2" />
              الرجوع إلى المنصة
            </Button>
          </div>
          <div className="w-full h-full pt-16">
            {renderPlatform(selectedPlatform)}
          </div>
        </div>
      )}

      {/* Edit Platform Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-indigo-900">
          <DialogHeader>
            <DialogTitle className="text-2xl">تعديل المنصة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="اسم المنصة *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border-white/10"
            />
            <Textarea
              placeholder="وصف المنصة"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white/5 border-white/10"
            />
            <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HTML">HTML</SelectItem>
                <SelectItem value="CSS">CSS</SelectItem>
                <SelectItem value="JAVA">Java</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="اكتب الكود هنا *"
              value={formData.custom_code}
              onChange={(e) => setFormData({ ...formData, custom_code: e.target.value })}
              className="bg-gray-900 border-white/10 min-h-[300px] font-mono text-sm text-green-400"
            />
            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              {isLoading ? 'جاري التحديث...' : 'تحديث المنصة'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-purple-900">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-400" />
              مساعد البرمجة الذكي
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="اسأل عن أي شيء متعلق بالبرمجة..."
              className="min-h-[100px] bg-white/5 border-white/10"
            />
            <Button
              onClick={handleAIAssistant}
              disabled={aiLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {aiLoading ? 'جاري التفكير...' : 'اسأل المساعد'}
            </Button>
            {aiResponse && (
              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                <pre className="whitespace-pre-wrap text-gray-200">{aiResponse}</pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default BuildPlatformTab;
