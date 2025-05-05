
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EducationalImage, SubjectType } from '@/components/shared/types/educationalContentTypes';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Image } from "lucide-react";

interface SubjectImagesGridProps {
  subject: SubjectType;
}

const SubjectImagesGrid = ({ subject }: SubjectImagesGridProps) => {
  const [images, setImages] = useState<EducationalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<EducationalImage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
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

    fetchImages();
  }, [subject, toast]);

  const getSubjectTitle = (subject: SubjectType): string => {
    switch (subject) {
      case 'physics': return 'الفيزياء';
      case 'chemistry': return 'الكيمياء';
      case 'biology': return 'الأحياء';
      case 'mathematics': return 'الرياضيات';
      default: return '';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
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
          </Card>
        ))}
      </div>

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
    </>
  );
};

export default SubjectImagesGrid;
