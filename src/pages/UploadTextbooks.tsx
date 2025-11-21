import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, BookOpen, Trash2, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UploadTextbooks() {
  const [bookName, setBookName] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractingText, setExtractingText] = useState<string | null>(null);
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load textbooks on mount
  useEffect(() => {
    loadTextbooks();
  }, []);

  const loadTextbooks = async () => {
    try {
      const { data, error } = await supabase
        .from('jordanian_textbooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTextbooks(data || []);
    } catch (error) {
      console.error('Error loading textbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromBook = async (bookId: string, bookName: string) => {
    setExtractingText(bookId);
    
    try {
      console.log(`Starting text extraction for book: ${bookName}`);
      
      const { data, error } = await supabase.functions.invoke('extract-textbook-text', {
        body: { textbookId: bookId }
      });

      if (error) {
        console.error('Extract error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'فشل استخراج النص');
      }

      console.log('Text extracted successfully:', data);
      
      toast({
        title: "تم استخراج النص بنجاح",
        description: `تم استخراج ${data.textLength} حرف من الكتاب`,
      });

      loadTextbooks();

    } catch (error: any) {
      console.error('Error extracting text:', error);
      toast({
        title: "خطأ في استخراج النص",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setExtractingText(null);
    }
  };

  const handleUpload = async () => {
    if (!bookName || !subject || !grade || !semester || !file) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    // تحقق من حجم الملف (15MB حد أقصى لـ Lovable AI)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 15) {
      toast({
        title: "الملف كبير جداً",
        description: "الحد الأقصى لحجم الملف هو 15 ميجابايت. يرجى استخدام ملف أصغر.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    console.log('Starting upload process...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      console.log('User authenticated:', user.id);
      console.log('File size:', fileSizeMB.toFixed(2), 'MB');

      // رفع الملف إلى Storage
      const fileName = `${Date.now()}-${file.name}`;
      console.log('Uploading to storage:', fileName);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('jordanian-textbooks')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`خطأ في رفع الملف: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('jordanian-textbooks')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // حفظ بيانات الكتاب في قاعدة البيانات
      const { data: book, error: dbError } = await supabase
        .from('jordanian_textbooks')
        .insert({
          book_name: bookName,
          subject,
          grade,
          semester,
          file_url: publicUrl,
          file_size_mb: fileSizeMB,
          created_by: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`خطأ في حفظ بيانات الكتاب: ${dbError.message}`);
      }

      console.log('Book saved to database:', book);

      toast({
        title: "✅ تم رفع الكتاب بنجاح",
        description: `الكتاب جاهز. يمكنك الآن استخراج النص منه.`,
      });

      // إعادة تعيين النموذج
      setBookName("");
      setSubject("");
      setGrade("");
      setSemester("");
      setFile(null);
      
      // إعادة تحميل قائمة الكتب
      await loadTextbooks();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "❌ خطأ في رفع الكتاب",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };


  const deleteBook = async (bookId: string, fileUrl: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
      return;
    }

    try {
      console.log('Deleting book:', bookId);
      
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        console.log('Removing file from storage:', fileName);
        await supabase.storage
          .from('jordanian-textbooks')
          .remove([fileName]);
      }

      const { error } = await supabase
        .from('jordanian_textbooks')
        .delete()
        .eq('id', bookId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Book deleted successfully');

      toast({
        title: "✅ تم حذف الكتاب بنجاح",
      });

      loadTextbooks();

    } catch (error: any) {
      console.error('Delete book error:', error);
      toast({
        title: "❌ خطأ في حذف الكتاب",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <Button
          onClick={() => navigate('/control-center')}
          variant="outline"
          className="mb-6"
        >
          ← العودة إلى مركز التحكم
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع كتاب مدرسي جديد
              </CardTitle>
              <CardDescription>
                قم برفع الكتب المدرسية الأردنية لاستخدامها في المساعد الذكي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم الكتاب</Label>
                <Input
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="مثال: كتاب الكيمياء"
                />
              </div>

              <div>
                <Label>المادة</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chemistry">الكيمياء</SelectItem>
                    <SelectItem value="Physics">الفيزياء</SelectItem>
                    <SelectItem value="Biology">الأحياء</SelectItem>
                    <SelectItem value="Mathematics">الرياضيات</SelectItem>
                    <SelectItem value="Arabic">اللغة العربية</SelectItem>
                    <SelectItem value="English">اللغة الإنجليزية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الصف</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="العاشر">العاشر</SelectItem>
                    <SelectItem value="الحادي عشر">الحادي عشر</SelectItem>
                    <SelectItem value="الثاني عشر">الثاني عشر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الفصل الدراسي</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفصل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الأول">الأول</SelectItem>
                    <SelectItem value="الثاني">الثاني</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>ملف PDF (الحد الأقصى: 15 MB)</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFile(selectedFile);
                    if (selectedFile) {
                      const sizeMB = selectedFile.size / (1024 * 1024);
                      console.log('File selected:', selectedFile.name, 'Size:', sizeMB.toFixed(2), 'MB');
                    }
                  }}
                />
                {file && (
                  <p className="text-sm text-muted-foreground mt-1">
                    الحجم: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    رفع الكتاب
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Textbooks List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                الكتب المرفوعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                </div>
              ) : textbooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد كتب مرفوعة بعد
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {textbooks.map((book) => (
                    <Card key={book.id} className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{book.book_name}</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>المادة: {book.subject}</p>
                          <p>الصف: {book.grade} - الفصل {book.semester}</p>
                          <p>الحجم: {book.file_size_mb?.toFixed(2)} MB</p>
                          {book.extracted_text ? (
                            <p className="text-green-600 flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              ✓ تم استخراج النص ({book.extracted_text.length} حرف)
                            </p>
                          ) : (
                            <p className="text-orange-600">⚠ لم يتم استخراج النص بعد</p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {!book.extracted_text && (
                            <Button
                              onClick={() => extractTextFromBook(book.id, book.book_name)}
                              disabled={extractingText === book.id}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {extractingText === book.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                  جاري الاستخراج...
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4 ml-2" />
                                  استخراج النص
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteBook(book.id, book.file_url)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}