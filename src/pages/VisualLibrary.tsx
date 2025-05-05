
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image as ImageIcon, Camera } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';

interface EducationalImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  subject: string;
  created_at: string;
}

const VisualLibrary = () => {
  const [images, setImages] = useState<EducationalImage[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('mathematics');
  const [file, setFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'device' | 'camera'>('device');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('educational_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setImages(data as EducationalImage[]);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast({
        title: "خطأ في جلب الصور",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const captureFromCamera = async () => {
    try {
      // This is simplified - in a real app you'd need to request camera access
      // and implement proper camera capture functionality
      toast({
        title: "تنبيه",
        description: "هذه الميزة غير متاحة حاليًا. يرجى استخدام خيار تحميل الصور من الجهاز.",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في الوصول للكاميرا",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const uploadImage = async () => {
    if (!file || !title || !subject) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة وتحديد صورة",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${subject}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('educational_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: publicURLData } = supabase.storage
        .from('educational_images')
        .getPublicUrl(filePath);

      // 3. Save metadata to the database
      const { error: dbError } = await supabase
        .from('educational_images')
        .insert([
          {
            title,
            description,
            image_url: publicURLData.publicUrl,
            subject
          }
        ]);

      if (dbError) throw dbError;

      // 4. Refresh the image list
      fetchImages();

      // 5. Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setIsUploading(false);

      toast({
        title: "تم التحميل بنجاح",
        description: "تمت إضافة الصورة إلى المكتبة المرئية"
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ في تحميل الصورة",
        description: error.message,
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const getFilteredImages = () => {
    if (activeTab === 'all') {
      return images;
    } else {
      return images.filter(img => img.subject === activeTab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
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
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500 mb-4 md:mb-0">
              المكتبة المرئية
            </h1>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="ml-2 h-4 w-4" />
                  رفع صورة تعليمية
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-blue-900/90 to-blue-950/90 border border-blue-500/20 backdrop-blur-md">
                <DialogHeader>
                  <DialogTitle className="text-xl text-blue-300">رفع صورة تعليمية جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الصورة</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="أدخل عنوانًا وصفيًا للصورة"
                      className="bg-blue-950/50 border-blue-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">وصف الصورة</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="أدخل وصفًا للصورة"
                      className="bg-blue-950/50 border-blue-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">القسم</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="bg-blue-950/50 border-blue-500/30">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900">
                        <SelectItem value="mathematics">الرياضيات</SelectItem>
                        <SelectItem value="physics">الفيزياء</SelectItem>
                        <SelectItem value="chemistry">الكيمياء</SelectItem>
                        <SelectItem value="biology">الأحياء</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>طريقة التحميل</Label>
                    <div className="flex space-x-2 space-x-reverse">
                      <Button
                        type="button"
                        variant={uploadMethod === 'device' ? 'default' : 'outline'}
                        onClick={() => setUploadMethod('device')}
                        className={uploadMethod === 'device' ? 'bg-blue-600 text-white' : ''}
                      >
                        <ImageIcon className="ml-2 h-4 w-4" />
                        من الجهاز
                      </Button>
                      <Button
                        type="button"
                        variant={uploadMethod === 'camera' ? 'default' : 'outline'}
                        onClick={() => setUploadMethod('camera')}
                        className={uploadMethod === 'camera' ? 'bg-blue-600 text-white' : ''}
                      >
                        <Camera className="ml-2 h-4 w-4" />
                        من الكاميرا
                      </Button>
                    </div>
                  </div>

                  {uploadMethod === 'device' ? (
                    <div className="space-y-2">
                      <Label htmlFor="image">اختيار صورة</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="bg-blue-950/50 border-blue-500/30"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Button onClick={captureFromCamera} className="bg-blue-600">
                        <Camera className="ml-2 h-4 w-4" />
                        التقاط صورة
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button onClick={uploadImage} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700">
                      {isUploading ? 'جاري الرفع...' : 'رفع الصورة'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-blue-900/40 border border-blue-500/20 mx-auto mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">جميع الأقسام</TabsTrigger>
              <TabsTrigger value="mathematics" className="data-[state=active]:bg-blue-600">الرياضيات</TabsTrigger>
              <TabsTrigger value="physics" className="data-[state=active]:bg-blue-700">الفيزياء</TabsTrigger>
              <TabsTrigger value="chemistry" className="data-[state=active]:bg-purple-600">الكيمياء</TabsTrigger>
              <TabsTrigger value="biology" className="data-[state=active]:bg-green-600">الأحياء</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {getFilteredImages().length > 0 ? (
                  getFilteredImages().map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={`overflow-hidden relative hover:-translate-y-1 transition-all duration-300
                        ${image.subject === 'mathematics' ? 'bg-gradient-to-br from-blue-500/20 to-blue-700/30 border-blue-500/20 hover:border-blue-400/50' : ''}
                        ${image.subject === 'physics' ? 'bg-gradient-to-br from-purple-500/20 to-blue-700/30 border-blue-500/20 hover:border-purple-400/50' : ''}
                        ${image.subject === 'chemistry' ? 'bg-gradient-to-br from-purple-500/20 to-purple-700/30 border-purple-500/20 hover:border-purple-400/50' : ''}
                        ${image.subject === 'biology' ? 'bg-gradient-to-br from-green-500/20 to-green-700/30 border-green-500/20 hover:border-green-400/50' : ''}
                      `}>
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={image.image_url}
                            alt={image.title}
                            className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-1 text-white">{image.title}</h3>
                          <p className="text-sm text-white/70 line-clamp-2">{image.description}</p>
                          <div className="mt-2 flex items-center justify-end">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs
                              ${image.subject === 'mathematics' ? 'bg-blue-500/20 text-blue-300' : ''}
                              ${image.subject === 'physics' ? 'bg-purple-500/20 text-purple-300' : ''}
                              ${image.subject === 'chemistry' ? 'bg-purple-500/20 text-purple-300' : ''}
                              ${image.subject === 'biology' ? 'bg-green-500/20 text-green-300' : ''}
                            `}>
                              {image.subject === 'mathematics' ? 'الرياضيات' : ''}
                              {image.subject === 'physics' ? 'الفيزياء' : ''}
                              {image.subject === 'chemistry' ? 'الكيمياء' : ''}
                              {image.subject === 'biology' ? 'الأحياء' : ''}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <p className="col-span-3 text-center text-white/70 py-10">لا توجد صور في هذا القسم حاليًا</p>
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

export default VisualLibrary;
