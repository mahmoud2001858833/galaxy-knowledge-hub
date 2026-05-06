import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Rocket, Plus, Eye, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

interface CustomPlatform {
  id: string;
  name: string;
  description: string;
  language: string;
  custom_code: string;
  user_id: string;
  created_at: string;
}

const BuildPlatformSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<CustomPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<CustomPlatform | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: '',
    custom_code: ''
  });

  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
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
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('btec_custom_platforms')
        .insert({
          ...formData,
          user_id: currentUser.id
        });

      if (error) throw error;

      toast({ title: "رائع!", description: "تم إنشاء منصتك بنجاح" });
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', language: '', custom_code: '' });
      fetchPlatforms();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  const handleAIAssistant = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال سؤالك", variant: "destructive" });
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dev-assistant-service', {
        body: { action: 'programming-assistant', prompt: `في سياق بناء منصة مخصصة: ${aiPrompt}` }
      });

      if (error) throw error;
      setAiResponse(data.response);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <SEO 
        title="طور هذه المنصة بيدك - بتك BTEC"
        description="أنشئ عالمك الخاص داخل المنصة بمساعدة الذكاء الاصطناعي"
        keywords="بناء منصة, تطوير, برمجة, AI assistant, مشاريع"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/btec/information-technology')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
          >
            <ArrowRight size={20} />
            العودة
          </button>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              طور منصتك بيدك
            </h1>
            
            <div className="flex gap-2">
              <Button onClick={() => setAiAssistantOpen(true)} variant="outline" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                مساعد AI
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    إنشاء منصة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl bg-slate-900 text-white max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>أنشئ عالمك الخاص</DialogTitle>
                    <DialogDescription>ابدأ بإنشاء منصتك المخصصة</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>اسم المنصة</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="bg-white/10"
                      />
                    </div>
                    <div>
                      <Label>الوصف</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                        className="bg-white/10"
                      />
                    </div>
                    <div>
                      <Label>لغة البرمجة</Label>
                      <Input
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        placeholder="مثال: HTML, CSS, JavaScript"
                        required
                        className="bg-white/10"
                      />
                    </div>
                    <div>
                      <Label>الكود المخصص</Label>
                      <Textarea
                        value={formData.custom_code}
                        onChange={(e) => setFormData({...formData, custom_code: e.target.value})}
                        required
                        className="bg-slate-900 text-green-300 font-mono min-h-[300px]"
                        dir="ltr"
                      />
                    </div>
                    <Button type="submit" className="w-full">إنشاء المنصة</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* AI Assistant Dialog */}
          <Dialog open={aiAssistantOpen} onOpenChange={setAiAssistantOpen}>
            <DialogContent className="max-w-2xl bg-slate-900 text-white">
              <DialogHeader>
                <DialogTitle>مساعد البرمجة الذكي</DialogTitle>
                <DialogDescription>اسأل أي سؤال عن بناء منصتك</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="كيف يمكنني إضافة نظام تسجيل دخول؟"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="bg-white/10 text-white"
                />
                <Button onClick={handleAIAssistant} disabled={aiLoading} className="w-full">
                  {aiLoading ? 'جاري المعالجة...' : 'اسأل المساعد'}
                </Button>
                {aiResponse && (
                  <div className="bg-white/10 p-4 rounded-lg max-h-[300px] overflow-y-auto">
                    <pre className="text-white whitespace-pre-wrap text-right">{aiResponse}</pre>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {loading ? (
            <p className="text-center text-white">جاري التحميل...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platforms.map((platform) => (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/5 border-indigo-500/30 hover:bg-white/10 transition-all h-full">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        {platform.name}
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        {platform.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant="secondary">{platform.language}</Badge>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setSelectedPlatform(platform)}
                      >
                        <Eye className="w-4 h-4" />
                        عرض الكود
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* View Code Dialog */}
          <Dialog open={!!selectedPlatform} onOpenChange={() => setSelectedPlatform(null)}>
            <DialogContent className="max-w-4xl bg-slate-900 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedPlatform?.name}</DialogTitle>
                <DialogDescription>{selectedPlatform?.description}</DialogDescription>
              </DialogHeader>
              <div className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                <pre className="text-green-300 text-sm" dir="ltr">{selectedPlatform?.custom_code}</pre>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BuildPlatformSection;
