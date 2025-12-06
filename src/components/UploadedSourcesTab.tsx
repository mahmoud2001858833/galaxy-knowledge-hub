import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, BookOpen, ChevronDown, ChevronUp, X, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ContentSummary {
  grade: string;
  subject: string;
  semester: string;
  units: number;
  lessons: number;
  pages: number;
}

const GRADES = [
  "الصف الأول", "الصف الثاني", "الصف الثالث", "الصف الرابع",
  "الصف الخامس", "الصف السادس", "الصف السابع", "الصف الثامن",
  "الصف التاسع", "الصف العاشر", "الصف الحادي عشر", "الصف الثاني عشر"
];

const SUBJECTS = [
  "اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "الفيزياء",
  "الكيمياء", "الأحياء", "علوم الأرض", "التاريخ", "الجغرافيا",
  "التربية الإسلامية", "التربية الوطنية", "الحاسوب", "الثقافة المالية"
];

const SEMESTERS = ["الفصل الأول", "الفصل الثاني"];

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'extracting' | 'saving' | 'success' | 'error';

export default function UploadedSourcesTab() {
  const [contentSummaries, setContentSummaries] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<string>('');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    grade: '',
    subject: '',
    semester: ''
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jordanian_textbook_content')
        .select('grade, subject, semester, unit_number, lesson_number, page_number');

      if (error) throw error;

      const summaryMap = new Map<string, any>();
      
      (data || []).forEach((row: any) => {
        const key = `${row.grade}|${row.subject}|${row.semester}`;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, {
            grade: row.grade,
            subject: row.subject,
            semester: row.semester,
            units: new Set<number>(),
            lessons: new Set<string>(),
            pages: new Set<number>(),
          });
        }
        
        const summary = summaryMap.get(key);
        summary.units.add(row.unit_number);
        summary.lessons.add(`${row.unit_number}-${row.lesson_number}`);
        summary.pages.add(row.page_number);
      });

      const summaries = Array.from(summaryMap.values()).map(s => ({
        ...s,
        units: s.units.size,
        lessons: s.lessons.size,
        pages: s.pages.size,
      }));

      setContentSummaries(summaries);
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        toast({
          title: "خطأ",
          description: "يرجى اختيار ملف PDF فقط",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        toast({
          title: "خطأ",
          description: "يرجى اختيار ملف PDF فقط",
          variant: "destructive"
        });
      }
    }
  };

  // Convert file to base64 in chunks to avoid memory issues
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (data:application/pdf;base64,)
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processAndUploadPDF = async () => {
    if (!selectedFile || !formData.grade || !formData.subject || !formData.semester) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة واختيار ملف PDF",
        variant: "destructive"
      });
      return;
    }

    // Maximum 100MB
    const maxSize = 100 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast({
        title: "خطأ",
        description: "حجم الملف كبير جداً. الحد الأقصى هو 100 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    const isLargeFile = fileSizeMB > 10; // Files over 10MB use storage + streaming
    
    if (isLargeFile) {
      toast({
        title: "⏳ ملف كبير",
        description: `حجم الملف ${fileSizeMB.toFixed(1)} ميجابايت. سيتم رفعه عبر Supabase Storage أولاً ثم معالجته...`,
      });
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(5);

    try {
      // Step 1: Get user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      setUploadProgress(10);
      
      let pdfUrl: string | null = null;
      let pdfBase64: string | null = null;
      const bookName = selectedFile.name.replace('.pdf', '').replace(/_/g, ' ');

      if (isLargeFile) {
        // Large files: Upload to Supabase Storage first, then stream to Google
        toast({
          title: "📤 رفع الملف للتخزين المؤقت",
          description: "يتم رفع الملف للتخزين المؤقت قبل معالجته..."
        });

        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
        const filePath = `temp-pdfs/${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('jordanian-textbooks')
          .upload(filePath, selectedFile, {
            contentType: 'application/pdf',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`فشل رفع الملف: ${uploadError.message}`);
        }

        console.log('File uploaded to storage:', uploadData.path);
        setUploadProgress(40);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('jordanian-textbooks')
          .getPublicUrl(filePath);
        
        pdfUrl = urlData.publicUrl;
        console.log('File public URL:', pdfUrl);

      } else {
        // Small files: Convert to base64 and send directly
        toast({
          title: "📤 جاري تحويل الملف",
          description: "يتم تحويل الملف لإرساله مباشرة لـ Google..."
        });

        pdfBase64 = await fileToBase64(selectedFile);
        console.log('File converted to base64, length:', pdfBase64.length);
        setUploadProgress(30);
      }

      setUploadStatus('extracting');

      toast({
        title: "🚀 جاري المعالجة عبر Google AI",
        description: "يتم إرسال الملف لـ Google Gemini لاستخراج المحتوى..."
      });

      // Step 3: Call edge function
      const { data: extractData, error: extractError } = await supabase.functions.invoke('process-pdf-direct', {
        body: {
          pdfBase64: isLargeFile ? null : pdfBase64,
          pdfUrl: isLargeFile ? pdfUrl : null,
          bookName,
          grade: formData.grade,
          subject: formData.subject,
          semester: formData.semester,
          fileSizeMB
        }
      });

      console.log('Extract response:', extractData, extractError);

      if (extractError) {
        console.error('Extract function error:', extractError);
        throw new Error(extractError.message || 'فشل معالجة الملف');
      }

      if (extractData?.error) {
        console.error('Extract data error:', extractData.error);
        throw new Error(extractData.error);
      }
      
      setUploadProgress(90);
      setUploadStatus('saving');
      
      if (extractData?.extractedText) {
        setExtractedPreview(extractData.extractedText.substring(0, 500) + '...');
      }

      setUploadProgress(100);
      setUploadStatus('success');

      toast({
        title: "✅ تم بنجاح!",
        description: extractData?.message || `تم استخراج ${extractData?.recordsCount || 0} صفحة`
      });

      // Reset after delay
      setTimeout(() => {
        setSelectedFile(null);
        setFormData({ grade: '', subject: '', semester: '' });
        setExtractedPreview('');
        setUploadStatus('idle');
        setUploadProgress(0);
        setIsUploadOpen(false);
        loadContent();
      }, 3000);

    } catch (error: any) {
      console.error('Upload process error:', error);
      setUploadStatus('error');
      toast({
        title: "حدث خطأ",
        description: error.message || "فشل في رفع ومعالجة الملف",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading': return 'جاري رفع الملف...';
      case 'processing': return 'جاري معالجة الملف...';
      case 'extracting': return 'جاري استخراج النص بالذكاء الاصطناعي...';
      case 'saving': return 'جاري حفظ المحتوى...';
      case 'success': return 'تم بنجاح!';
      case 'error': return 'حدث خطأ';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          المصادر المتاحة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PDF Upload Form */}
        <Collapsible open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20"
            >
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                رفع كتاب PDF جديد
              </span>
              {isUploadOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-border bg-card space-y-4"
            >
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>الصف *</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>المادة *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الفصل الدراسي *</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفصل" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map(semester => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
                  ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-muted-foreground/30 hover:border-primary/50'}
                  ${selectedFile ? 'bg-green-500/10 border-green-500' : ''}
                `}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <FileText className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-600">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4 mr-1" />
                      إزالة
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">اسحب ملف PDF هنا</p>
                      <p className="text-sm text-muted-foreground">أو اضغط لاختيار ملف</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress */}
              <AnimatePresence>
                {uploadStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {uploadStatus === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : uploadStatus === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {getStatusMessage()}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Extracted Preview */}
              {extractedPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Label>معاينة النص المستخرج</Label>
                  <ScrollArea className="h-32 rounded-md border p-3 bg-muted/50">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {extractedPreview}
                    </p>
                  </ScrollArea>
                </motion.div>
              )}

              {/* Upload Button */}
              <Button
                onClick={processAndUploadPDF}
                disabled={!selectedFile || isUploading || !formData.grade || !formData.subject || !formData.semester}
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    رفع ومعالجة الكتاب
                  </>
                )}
              </Button>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        {/* Content List */}
        {contentSummaries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا يوجد محتوى مرفوع حالياً</p>
            <p className="text-sm mt-2">استخدم النموذج أعلاه لرفع كتاب PDF</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">المحتوى المتوفر ({contentSummaries.length})</h3>
            {contentSummaries.map((content, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-lg">{content.subject}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{content.grade}</Badge>
                          <Badge variant="outline">{content.semester}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
                            <span className="font-bold text-lg text-blue-500">{content.units}</span>
                            <span className="text-xs text-muted-foreground">وحدة</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
                            <span className="font-bold text-lg text-green-500">{content.lessons}</span>
                            <span className="text-xs text-muted-foreground">درس</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
                            <span className="font-bold text-lg text-purple-500">{content.pages}</span>
                            <span className="text-xs text-muted-foreground">صفحة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
