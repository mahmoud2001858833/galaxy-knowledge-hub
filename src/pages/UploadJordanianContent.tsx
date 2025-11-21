import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, BookOpen, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

interface Page {
  pageNumber: number;
  content: string;
}

interface Lesson {
  lessonNumber: number;
  lessonName: string;
  pages: Page[];
}

interface Unit {
  unitNumber: number;
  unitName: string;
  lessons: Lesson[];
}

export default function UploadJordanianContent() {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const addUnit = () => {
    const newUnitNumber = units.length + 1;
    setUnits([...units, {
      unitNumber: newUnitNumber,
      unitName: "",
      lessons: []
    }]);
  };

  const removeUnit = (unitIndex: number) => {
    setUnits(units.filter((_, index) => index !== unitIndex));
  };

  const updateUnitName = (unitIndex: number, name: string) => {
    const newUnits = [...units];
    newUnits[unitIndex].unitName = name;
    setUnits(newUnits);
  };

  const addLesson = (unitIndex: number) => {
    const newUnits = [...units];
    const newLessonNumber = newUnits[unitIndex].lessons.length + 1;
    newUnits[unitIndex].lessons.push({
      lessonNumber: newLessonNumber,
      lessonName: "",
      pages: []
    });
    setUnits(newUnits);
  };

  const removeLesson = (unitIndex: number, lessonIndex: number) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons = newUnits[unitIndex].lessons.filter((_, index) => index !== lessonIndex);
    setUnits(newUnits);
  };

  const updateLessonName = (unitIndex: number, lessonIndex: number, name: string) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons[lessonIndex].lessonName = name;
    setUnits(newUnits);
  };

  const addPage = (unitIndex: number, lessonIndex: number) => {
    const newUnits = [...units];
    const existingPages = newUnits[unitIndex].lessons[lessonIndex].pages;
    const newPageNumber = existingPages.length > 0 
      ? Math.max(...existingPages.map(p => p.pageNumber)) + 1 
      : 1;
    
    newUnits[unitIndex].lessons[lessonIndex].pages.push({
      pageNumber: newPageNumber,
      content: ""
    });
    setUnits(newUnits);
  };

  const removePage = (unitIndex: number, lessonIndex: number, pageIndex: number) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons[lessonIndex].pages = 
      newUnits[unitIndex].lessons[lessonIndex].pages.filter((_, index) => index !== pageIndex);
    setUnits(newUnits);
  };

  const updatePageNumber = (unitIndex: number, lessonIndex: number, pageIndex: number, pageNumber: number) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons[lessonIndex].pages[pageIndex].pageNumber = pageNumber;
    setUnits(newUnits);
  };

  const updatePageContent = (unitIndex: number, lessonIndex: number, pageIndex: number, content: string) => {
    const newUnits = [...units];
    newUnits[unitIndex].lessons[lessonIndex].pages[pageIndex].content = content;
    setUnits(newUnits);
  };

  const handleUpload = async () => {
    if (!grade || !subject || !semester) {
      toast({
        title: "⚠️ معلومات ناقصة",
        description: "يرجى اختيار الصف والمادة والفصل",
        variant: "destructive"
      });
      return;
    }

    if (units.length === 0) {
      toast({
        title: "⚠️ لا يوجد محتوى",
        description: "يرجى إضافة وحدة واحدة على الأقل",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare all rows to insert
      const rowsToInsert = [];
      
      for (const unit of units) {
        if (!unit.unitName.trim()) {
          toast({
            title: "⚠️ معلومات ناقصة",
            description: `يرجى إدخال اسم الوحدة ${unit.unitNumber}`,
            variant: "destructive"
          });
          setUploading(false);
          return;
        }

        for (const lesson of unit.lessons) {
          if (!lesson.lessonName.trim()) {
            toast({
              title: "⚠️ معلومات ناقصة",
              description: `يرجى إدخال اسم الدرس ${lesson.lessonNumber} في الوحدة ${unit.unitNumber}`,
              variant: "destructive"
            });
            setUploading(false);
            return;
          }

          for (const page of lesson.pages) {
            if (!page.content.trim()) {
              toast({
                title: "⚠️ معلومات ناقصة",
                description: `يرجى إدخال محتوى الصفحة ${page.pageNumber} في الدرس ${lesson.lessonNumber}`,
                variant: "destructive"
              });
              setUploading(false);
              return;
            }

            rowsToInsert.push({
              grade,
              subject,
              semester,
              unit_number: unit.unitNumber,
              unit_name: unit.unitName,
              lesson_number: lesson.lessonNumber,
              lesson_name: lesson.lessonName,
              page_number: page.pageNumber,
              page_content: page.content,
              created_by: user?.id
            });
          }
        }
      }

      // Insert all rows
      const { error } = await supabase
        .from('jordanian_textbook_content')
        .insert(rowsToInsert);

      if (error) throw error;

      toast({
        title: "✅ تم الرفع بنجاح",
        description: `تم رفع ${rowsToInsert.length} صفحة من المحتوى`,
      });

      // Reset form
      setGrade("");
      setSubject("");
      setSemester("");
      setUnits([]);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "❌ خطأ في الرفع",
        description: error.message || "حدث خطأ أثناء رفع المحتوى",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                رفع محتوى المناهج الأردنية
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                أضف محتوى الكتب الدراسية نصياً بتقسيمها إلى وحدات ودروس وصفحات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">الصف</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", 
                        "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"].map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">المادة</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {["اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "العلوم", 
                        "الفيزياء", "الكيمياء", "الأحياء", "التاريخ", "الجغرافيا", 
                        "التربية الإسلامية"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">الفصل</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="اختر الفصل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الأول">الأول</SelectItem>
                      <SelectItem value="الثاني">الثاني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Unit Button */}
              <Button 
                onClick={addUnit}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة وحدة جديدة
              </Button>

              {/* Units */}
              <AnimatePresence>
                {units.map((unit, unitIndex) => (
                  <motion.div
                    key={unitIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border border-white/30 rounded-lg p-4 bg-white/5 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <Label className="text-white">الوحدة {unit.unitNumber}</Label>
                        <Input
                          value={unit.unitName}
                          onChange={(e) => updateUnitName(unitIndex, e.target.value)}
                          placeholder="اسم الوحدة"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeUnit(unitIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={() => addLesson(unitIndex)}
                      variant="outline"
                      className="w-full border-white/30 text-white hover:bg-white/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة درس
                    </Button>

                    {/* Lessons */}
                    <div className="space-y-3">
                      {unit.lessons.map((lesson, lessonIndex) => (
                        <motion.div
                          key={lessonIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border border-white/20 rounded-lg p-3 bg-white/5 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <Label className="text-white text-sm">الدرس {lesson.lessonNumber}</Label>
                              <Input
                                value={lesson.lessonName}
                                onChange={(e) => updateLessonName(unitIndex, lessonIndex, e.target.value)}
                                placeholder="اسم الدرس"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeLesson(unitIndex, lessonIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <Button
                            onClick={() => addPage(unitIndex, lessonIndex)}
                            variant="outline"
                            size="sm"
                            className="w-full border-white/20 text-white hover:bg-white/10"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            إضافة صفحة
                          </Button>

                          {/* Pages */}
                          <div className="space-y-2">
                            {lesson.pages.map((page, pageIndex) => (
                              <motion.div
                                key={pageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border border-white/10 rounded-lg p-3 bg-white/5 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 space-y-2">
                                    <Label className="text-white text-xs">رقم الصفحة</Label>
                                    <Input
                                      type="number"
                                      value={page.pageNumber}
                                      onChange={(e) => updatePageNumber(unitIndex, lessonIndex, pageIndex, parseInt(e.target.value) || 1)}
                                      className="bg-white/10 border-white/20 text-white"
                                      min="1"
                                    />
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removePage(unitIndex, lessonIndex, pageIndex)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-white text-xs">محتوى الصفحة</Label>
                                  <Textarea
                                    value={page.content}
                                    onChange={(e) => updatePageContent(unitIndex, lessonIndex, pageIndex, e.target.value)}
                                    placeholder="اكتب محتوى الصفحة هنا..."
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[150px]"
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Upload Button */}
              {units.length > 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg py-6"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5 mr-2" />
                      رفع المحتوى
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
