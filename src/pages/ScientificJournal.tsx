
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FilePdf, FileImage } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';

interface ScientificDocument {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  cover_image_url: string;
  subject: string;
  created_at: string;
}

const ScientificJournal = () => {
  const [documents, setDocuments] = useState<ScientificDocument[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('mathematics');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('scientific_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data as ScientificDocument[]);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: "خطأ في جلب المستندات",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverImage(e.target.files[0]);
    }
  };

  const uploadDocument = async () => {
    if (!pdfFile || !coverImage || !title || !subject) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة وتحديد الملفات",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload PDF file to storage
      const pdfExt = pdfFile.name.split('.').pop();
      const pdfFileName = `${Date.now()}_doc.${pdfExt}`;
      const pdfFilePath = `${subject}/${pdfFileName}`;

      const { error: pdfUploadError } = await supabase.storage
        .from('scientific_documents')
        .upload(pdfFilePath, pdfFile);

      if (pdfUploadError) throw pdfUploadError;

      // 2. Upload cover image file
      const imgExt = coverImage.name.split('.').pop();
      const imgFileName = `${Date.now()}_cover.${imgExt}`;
      const imgFilePath = `${subject}/covers/${imgFileName}`;

      const { error: imgUploadError } = await supabase.storage
        .from('scientific_documents')
        .upload(imgFilePath, coverImage);

      if (imgUploadError) throw imgUploadError;

      // 3. Get the public URLs
      const { data: pdfPublicURLData } = supabase.storage
        .from('scientific_documents')
        .getPublicUrl(pdfFilePath);

      const { data: imgPublicURLData } = supabase.storage
        .from('scientific_documents')
        .getPublicUrl(imgFilePath);

      // 4. Save metadata to the database
      const { error: dbError } = await supabase
        .from('scientific_documents')
        .insert([
          {
            title,
            description,
            pdf_url: pdfPublicURLData.publicUrl,
            cover_image_url: imgPublicURLData.publicUrl,
            subject
          }
        ]);

      if (dbError) throw dbError;

      // 5. Refresh the documents list
      fetchDocuments();

      // 6. Reset form
      setTitle('');
      setDescription('');
      setPdfFile(null);
      setCoverImage(null);
      setIsUploading(false);

      toast({
        title: "تم التحميل بنجاح",
        description: "تمت إضافة المستند إلى المجلة العلمية"
      });
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "خطأ في تحميل المستند",
        description: error.message,
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const getFilteredDocuments = () => {
    if (activeTab === 'all') {
      return documents;
    } else {
      return documents.filter(doc => doc.subject === activeTab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-purple-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-purple-500 mb-4 md:mb-0">
              المجلة العلمية
            </h1>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Upload className="ml-2 h-4 w-4" />
                  رفع مستند علمي
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-900/90 to-purple-950/90 border border-purple-500/20 backdrop-blur-md">
                <DialogHeader>
                  <DialogTitle className="text-xl text-purple-300">رفع مستند علمي جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان المستند</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="أدخل عنوانًا وصفيًا للمستند"
                      className="bg-purple-950/50 border-purple-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">وصف المستند</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="أدخل وصفًا للمستند"
                      className="bg-purple-950/50 border-purple-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">القسم</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="bg-purple-950/50 border-purple-500/30">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent className="bg-purple-900">
                        <SelectItem value="mathematics">الرياضيات</SelectItem>
                        <SelectItem value="physics">الفيزياء</SelectItem>
                        <SelectItem value="chemistry">الكيمياء</SelectItem>
                        <SelectItem value="biology">الأحياء</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pdf">ملف PDF</Label>
                    <Input
                      id="pdf"
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfChange}
                      className="bg-purple-950/50 border-purple-500/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover">صورة الغلاف</Label>
                    <Input
                      id="cover"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="bg-purple-950/50 border-purple-500/30"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={uploadDocument} disabled={isUploading} className="bg-purple-600 hover:bg-purple-700">
                      {isUploading ? 'جاري الرفع...' : 'رفع المستند'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-purple-900/40 border border-purple-500/20 mx-auto mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">جميع الأقسام</TabsTrigger>
              <TabsTrigger value="mathematics" className="data-[state=active]:bg-blue-600">الرياضيات</TabsTrigger>
              <TabsTrigger value="physics" className="data-[state=active]:bg-purple-600">الفيزياء</TabsTrigger>
              <TabsTrigger value="chemistry" className="data-[state=active]:bg-purple-700">الكيمياء</TabsTrigger>
              <TabsTrigger value="biology" className="data-[state=active]:bg-green-600">الأحياء</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getFilteredDocuments().length > 0 ? (
                  getFilteredDocuments().map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Card className={`overflow-hidden relative hover:-translate-y-1 transition-all duration-300
                          ${doc.subject === 'mathematics' ? 'bg-gradient-to-br from-blue-500/20 to-blue-700/30 border-blue-500/20 hover:border-blue-400/50' : ''}
                          ${doc.subject === 'physics' ? 'bg-gradient-to-br from-purple-500/20 to-blue-700/30 border-blue-500/20 hover:border-purple-400/50' : ''}
                          ${doc.subject === 'chemistry' ? 'bg-gradient-to-br from-purple-500/20 to-purple-700/30 border-purple-500/20 hover:border-purple-400/50' : ''}
                          ${doc.subject === 'biology' ? 'bg-gradient-to-br from-green-500/20 to-green-700/30 border-green-500/20 hover:border-green-400/50' : ''}
                        `}>
                          <div className="relative aspect-[3/4] overflow-hidden">
                            <img
                              src={doc.cover_image_url}
                              alt={doc.title}
                              className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                              <FilePdf className="h-10 w-10 text-white/80" />
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-1 line-clamp-1 text-white">{doc.title}</h3>
                            <p className="text-sm text-white/70 line-clamp-2">{doc.description}</p>
                            <div className="mt-2 flex items-center justify-end">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs
                                ${doc.subject === 'mathematics' ? 'bg-blue-500/20 text-blue-300' : ''}
                                ${doc.subject === 'physics' ? 'bg-purple-500/20 text-purple-300' : ''}
                                ${doc.subject === 'chemistry' ? 'bg-purple-500/20 text-purple-300' : ''}
                                ${doc.subject === 'biology' ? 'bg-green-500/20 text-green-300' : ''}
                              `}>
                                {doc.subject === 'mathematics' ? 'الرياضيات' : ''}
                                {doc.subject === 'physics' ? 'الفيزياء' : ''}
                                {doc.subject === 'chemistry' ? 'الكيمياء' : ''}
                                {doc.subject === 'biology' ? 'الأحياء' : ''}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    </motion.div>
                  ))
                ) : (
                  <p className="col-span-4 text-center text-white/70 py-10">لا توجد مستندات في هذا القسم حاليًا</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScientificJournal;
