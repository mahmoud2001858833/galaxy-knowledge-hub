import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, BookOpen, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import imageCompression from "browser-image-compression";
import pako from "pako";

export default function UploadTextbooks() {
  const [bookName, setBookName] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingToGemini, setUploadingToGemini] = useState(false);
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load textbooks on mount
  useState(() => {
    loadTextbooks();
  });

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

  const compressFile = async (file: File): Promise<File> => {
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB <= 50) {
      return file;
    }

    toast({
      title: "جاري ضغط الملف...",
      description: `حجم الملف: ${fileSizeMB.toFixed(2)} MB`,
    });

    if (file.type.startsWith('image/')) {
      const compressed = await imageCompression(file, {
        maxSizeMB: 45,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
      });
      
      toast({
        title: "تم ضغط الصورة بنجاح",
        description: `الحجم الجديد: ${(compressed.size / (1024 * 1024)).toFixed(2)} MB`,
      });
      
      return compressed;
    } else if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const compressed = pako.deflate(new Uint8Array(arrayBuffer));
      const compressedFile = new File([compressed], file.name, { type: file.type });
      
      const newSizeMB = compressedFile.size / (1024 * 1024);
      
      toast({
        title: "تم ضغط ملف PDF",
        description: `الحجم الجديد: ${newSizeMB.toFixed(2)} MB`,
      });
      
      return compressedFile;
    }

    return file;
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

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Compress file if needed
      const finalFile = await compressFile(file);
      const fileSizeMB = finalFile.size / (1024 * 1024);

      // Upload to Storage
      const fileName = `${Date.now()}-${finalFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('jordanian-textbooks')
        .upload(fileName, finalFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('jordanian-textbooks')
        .getPublicUrl(fileName);

      // Save to database
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
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "تم رفع الكتاب بنجاح",
        description: "يمكنك الآن رفعه إلى Gemini",
      });

      // Reset form
      setBookName("");
      setSubject("");
      setGrade("");
      setSemester("");
      setFile(null);
      
      loadTextbooks();

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "خطأ في رفع الكتاب",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadToGemini = async (bookId: string) => {
    setUploadingToGemini(true);

    try {
      const { data, error } = await supabase.functions.invoke('upload-textbook-to-gemini', {
        body: { bookId }
      });

      if (error) throw error;

      toast({
        title: "تم رفع الكتاب إلى Gemini بنجاح",
        description: "الكتاب جاهز للاستخدام في المساعد الذكي",
      });

      loadTextbooks();

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "خطأ في رفع الكتاب إلى Gemini",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingToGemini(false);
    }
  };

  const deleteBook = async (bookId: string, fileUrl: string) => {
    try {
      const fileName = fileUrl.split('/').pop();
      
      await supabase.storage
        .from('jordanian-textbooks')
        .remove([fileName!]);

      const { error } = await supabase
        .from('jordanian_textbooks')
        .delete()
        .eq('id', bookId);

      if (error) throw error;

      toast({
        title: "تم حذف الكتاب بنجاح",
      });

      loadTextbooks();

    } catch (error: any) {
      toast({
        title: "خطأ في حذف الكتاب",
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
                <Label>ملف PDF</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
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
                          {book.gemini_file_uri && (
                            <p className="text-green-600">✓ مرفوع إلى Gemini</p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {!book.gemini_file_uri && (
                            <Button
                              onClick={() => uploadToGemini(book.id)}
                              disabled={uploadingToGemini}
                              size="sm"
                            >
                              {uploadingToGemini ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'رفع إلى Gemini'
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