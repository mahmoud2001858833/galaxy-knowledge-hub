
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EducationalImage, SubjectType } from '@/components/shared/types/educationalContentTypes';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Image, Trash, X } from "lucide-react";
import AdminControl from './AdminControl';

interface SubjectImagesGridProps {
  subject: SubjectType;
}

const SubjectImagesGrid = ({ subject }: SubjectImagesGridProps) => {
  const [images, setImages] = useState<EducationalImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<EducationalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<EducationalImage | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [subject]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredImages(images);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = images.filter(img => 
        img.title.toLowerCase().includes(query) || 
        (img.description?.toLowerCase().includes(query) ?? false)
      );
      setFilteredImages(filtered);
    }
  }, [searchQuery, images]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('educational_images')
        .select('*')
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Type cast the data to ensure it matches the EducationalImage interface
      const typedData = data?.map(item => ({
        ...item,
        subject: item.subject as 'physics' | 'chemistry' | 'biology' | 'mathematics'
      })) || [];

      setImages(typedData as EducationalImage[]);
      setFilteredImages(typedData as EducationalImage[]);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل الصور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubjectTitle = (subject: SubjectType): string => {
    switch (subject) {
      case 'physics': return 'الفيزياء';
      case 'chemistry': return 'الكيمياء';
      case 'biology': return 'الأحياء';
      case 'mathematics': return 'الرياضيات';
      default: return '';
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      // Delete the image from the database permanently
      const { error } = await supabase
        .from('educational_images')
        .delete()
        .eq('id', imageToDelete);
      
      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف الصورة بنجاح",
      });

      // تحديث القائمة بعد الحذف
      setImages(images.filter(img => img.id !== imageToDelete));
      setDeleteConfirmationOpen(false);
      setImageToDelete(null);
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة حذف الصورة",
        variant: "destructive",
      });
    }
  };

  const openDeleteConfirmation = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation(); // منع فتح الصورة عند النقر على زر الحذف
    setImageToDelete(id);
    setDeleteConfirmationOpen(true);
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
    if (isAdminMode) {
      toast({
        title: "تم إيقاف وضع المشرف",
        description: "تم إيقاف وضع المشرف بنجاح",
      });
    } else {
      toast({
        title: "تم تفعيل وضع المشرف",
        description: "يمكنك الآن إدارة الصور",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex justify-end w-full mb-6">
          <AdminControl onAdminAccess={toggleAdminMode} isAdminMode={isAdminMode} />
        </div>
        <Image className="w-16 h-16 text-blue-300 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-blue-200 mb-2">لا توجد صور بعد</h3>
        <p className="text-blue-300">
          لم يتم إضافة أي صور تعليمية في قسم {getSubjectTitle(subject)} حتى الآن
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="ابحث عن صورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-blue-500"
          />
        </div>
        <AdminControl onAdminAccess={toggleAdminMode} isAdminMode={isAdminMode} />
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-medium text-white">
          {isAdminMode ? 'وضع المشرف: يمكنك حذف الصور' : searchQuery ? `نتائج البحث (${filteredImages.length})` : ''}
        </h2>
      </div>
      
      {isAdminMode ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6">
          <h3 className="text-xl font-bold mb-4">قائمة الصور</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right py-2 px-4">العنوان</th>
                <th className="text-right py-2 px-4">الوصف</th>
                <th className="text-right py-2 px-4 w-24">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map(image => (
                <tr key={image.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-2 px-4">{image.title}</td>
                  <td className="py-2 px-4">{image.description || 'لا يوجد وصف'}</td>
                  <td className="py-2 px-4">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => openDeleteConfirmation(e, image.id)}
                      className="w-full"
                    >
                      <Trash className="w-4 h-4 mr-1" /> حذف
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Image className="w-16 h-16 text-blue-300 mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-blue-200 mb-2">لا توجد نتائج</h3>
          <p className="text-blue-300">
            لم يتم العثور على صور تطابق البحث "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <Card 
              key={image.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative"
              onClick={() => setSelectedImage(image)}
            >
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={image.image_url} 
                  alt={image.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                {image.description && (
                  <p className="text-sm text-gray-200 line-clamp-2">{image.description}</p>
                )}
              </CardContent>
              
              {isAdminMode && (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 left-2 bg-red-600 hover:bg-red-700"
                  onClick={(e) => openDeleteConfirmation(e, image.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Image details dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        {selectedImage && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-right">{selectedImage.title}</DialogTitle>
              {selectedImage.description && (
                <DialogDescription className="text-right">
                  {selectedImage.description}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.title} 
                className="max-h-[70vh] object-contain"
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من رغبتك في حذف هذه الصورة؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmationOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteImage}
            >
              حذف الصورة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubjectImagesGrid;
