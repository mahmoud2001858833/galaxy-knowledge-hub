import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit2, Trash2, Save, X, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContentItem {
  id: string;
  grade: string;
  subject: string;
  semester: string;
  unit_number: number;
  unit_name: string;
  lesson_number: number;
  lesson_name: string;
  page_number: number;
  page_content: string;
}

export default function ManageJordanianContent() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [content, filterGrade, filterSubject, searchQuery]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jordanian_textbook_content')
        .select('*')
        .order('grade')
        .order('subject')
        .order('unit_number')
        .order('lesson_number')
        .order('page_number');

      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      console.error('Error loading content:', error);
      toast({
        title: "خطأ في تحميل المحتوى",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...content];
    
    if (filterGrade !== "all") {
      filtered = filtered.filter(item => item.grade === filterGrade);
    }
    
    if (filterSubject !== "all") {
      filtered = filtered.filter(item => item.subject === filterSubject);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.unit_name.toLowerCase().includes(query) ||
        item.lesson_name.toLowerCase().includes(query) ||
        item.page_content.toLowerCase().includes(query)
      );
    }
    
    setFilteredContent(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المحتوى؟")) return;

    try {
      const { error } = await supabase
        .from('jordanian_textbook_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContent(content.filter(item => item.id !== id));
      toast({
        title: "✅ تم الحذف",
        description: "تم حذف المحتوى بنجاح",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "❌ خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('jordanian_textbook_content')
        .update({
          unit_name: editingItem.unit_name,
          lesson_name: editingItem.lesson_name,
          page_number: editingItem.page_number,
          page_content: editingItem.page_content,
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setContent(content.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      
      setEditingItem(null);
      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث المحتوى بنجاح",
      });
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "❌ خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uniqueGrades = Array.from(new Set(content.map(item => item.grade)));
  const uniqueSubjects = Array.from(new Set(content.map(item => item.subject)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                إدارة المحتوى الأردني
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-white text-sm">البحث السريع</label>
                  <Input
                    placeholder="ابحث في اسم الوحدة، الدرس، أو محتوى الصفحة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white text-sm">تصفية حسب الصف</label>
                  <Select value={filterGrade} onValueChange={setFilterGrade}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الصفوف</SelectItem>
                      {uniqueGrades.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-white text-sm">تصفية حسب المادة</label>
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المواد</SelectItem>
                      {uniqueSubjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              </div>

              {/* Content List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredContent.length === 0 ? (
                  <div className="text-center py-12 text-white/70">
                    لا يوجد محتوى مطابق للفلاتر المحددة
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredContent.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded">
                                {item.grade}
                              </span>
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded">
                                {item.subject}
                              </span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-200 rounded">
                                {item.semester}
                              </span>
                            </div>
                            <div className="text-white">
                              <p className="font-semibold">
                                الوحدة {item.unit_number}: {item.unit_name}
                              </p>
                              <p className="text-sm text-white/80">
                                الدرس {item.lesson_number}: {item.lesson_name}
                              </p>
                              <p className="text-sm text-white/60">
                                صفحة {item.page_number}
                              </p>
                            </div>
                            <div className="text-white/90 text-sm bg-black/30 p-3 rounded max-h-32 overflow-y-auto">
                              {item.page_content.substring(0, 200)}
                              {item.page_content.length > 200 && "..."}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-blue-500/20 border-blue-500/30 text-blue-200 hover:bg-blue-500/30"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-3xl bg-slate-900 border-white/20 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">تعديل المحتوى</DialogTitle>
            <DialogDescription className="text-white/70">
              قم بتعديل البيانات وحفظها
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">اسم الوحدة</label>
                  <Input
                    value={editingItem.unit_name}
                    onChange={(e) => setEditingItem({ ...editingItem, unit_name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">اسم الدرس</label>
                  <Input
                    value={editingItem.lesson_name}
                    onChange={(e) => setEditingItem({ ...editingItem, lesson_name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">رقم الصفحة</label>
                <Input
                  type="number"
                  value={editingItem.page_number}
                  onChange={(e) => setEditingItem({ ...editingItem, page_number: parseInt(e.target.value) || 1 })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">محتوى الصفحة</label>
                <Textarea
                  value={editingItem.page_content}
                  onChange={(e) => setEditingItem({ ...editingItem, page_content: e.target.value })}
                  className="bg-white/10 border-white/20 text-white min-h-[300px]"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التعديلات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
