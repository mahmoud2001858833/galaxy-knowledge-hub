
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubjectType } from '@/components/shared/types/educationalContentTypes';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Trash, BookOpen, ExternalLink } from "lucide-react";
import AdminControl from '../visualLibrary/AdminControl';

interface Journal {
  id: string;
  title: string;
  description: string | null;
  subject: SubjectType;
  cover_image_url: string;
  pdf_url: string;
  author: string | null;
  created_at: string;
}

interface SubjectJournalsGridProps {
  subject: SubjectType;
}

const SubjectJournalsGrid = ({ subject }: SubjectJournalsGridProps) => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchJournals();
  }, [subject]);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scientific_journals')
        .select('*')
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setJournals(data as Journal[]);
    } catch (error: any) {
      console.error('Error fetching journals:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل المجلات",
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

  const handleDeleteJournal = async () => {
    if (!journalToDelete) return;

    try {
      const { error } = await supabase
        .from('scientific_journals')
        .delete()
        .eq('id', journalToDelete);
      
      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف المجلة بنجاح",
      });

      // تحديث القائمة بعد الحذف
      setJournals(journals.filter(j => j.id !== journalToDelete));
      setDeleteConfirmationOpen(false);
      setJournalToDelete(null);
    } catch (error) {
      console.error('خطأ في حذف المجلة:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة حذف المجلة",
        variant: "destructive",
      });
    }
  };

  const openDeleteConfirmation = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation(); // منع فتح المجلة عند النقر على زر الحذف
    setJournalToDelete(id);
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
        description: "يمكنك الآن إدارة المجلات العلمية",
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

  if (journals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex justify-end w-full mb-6">
          <AdminControl onAdminAccess={toggleAdminMode} isAdminMode={isAdminMode} />
        </div>
        <BookOpen className="w-16 h-16 text-purple-300 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-purple-200 mb-2">لا توجد مجلات بعد</h3>
        <p className="text-purple-300">
          لم يتم إضافة أي مجلات علمية في قسم {getSubjectTitle(subject)} حتى الآن
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">
          {isAdminMode ? 'وضع المشرف: يمكنك حذف المجلات' : ''}
        </h2>
        <AdminControl onAdminAccess={toggleAdminMode} isAdminMode={isAdminMode} />
      </div>
      
      {isAdminMode ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6">
          <h3 className="text-xl font-bold mb-4">قائمة المجلات العلمية</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right py-2 px-4">العنوان</th>
                <th className="text-right py-2 px-4">المؤلف</th>
                <th className="text-right py-2 px-4">التاريخ</th>
                <th className="text-right py-2 px-4 w-24">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {journals.map(journal => (
                <tr key={journal.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-2 px-4">{journal.title}</td>
                  <td className="py-2 px-4">{journal.author || 'غير معروف'}</td>
                  <td className="py-2 px-4">
                    {new Date(journal.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="py-2 px-4">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => openDeleteConfirmation(e, journal.id)}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal) => (
            <Card 
              key={journal.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative"
              onClick={() => setSelectedJournal(journal)}
            >
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={journal.cover_image_url} 
                  alt={journal.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1">{journal.title}</h3>
                {journal.author && (
                  <p className="text-sm text-gray-300 mb-2">بواسطة: {journal.author}</p>
                )}
                {journal.description && (
                  <p className="text-sm text-gray-200 line-clamp-2">{journal.description}</p>
                )}
              </CardContent>
              
              {isAdminMode && (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 left-2 bg-red-600 hover:bg-red-700"
                  onClick={(e) => openDeleteConfirmation(e, journal.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedJournal} onOpenChange={() => setSelectedJournal(null)}>
        {selectedJournal && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-right">{selectedJournal.title}</DialogTitle>
              {selectedJournal.description && (
                <DialogDescription className="text-right">
                  {selectedJournal.description}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img 
                  src={selectedJournal.cover_image_url} 
                  alt={selectedJournal.title} 
                  className="w-full object-cover rounded-md"
                />
              </div>
              <div className="md:w-2/3 space-y-4">
                {selectedJournal.author && (
                  <div>
                    <h4 className="font-medium text-white">المؤلف:</h4>
                    <p>{selectedJournal.author}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-white">تاريخ النشر:</h4>
                  <p>{new Date(selectedJournal.created_at).toLocaleDateString('ar-SA')}</p>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => window.open(selectedJournal.pdf_url, '_blank')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  عرض المجلة (PDF)
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من رغبتك في حذف هذه المجلة؟ هذا الإجراء لا يمكن التراجع عنه.
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
              onClick={handleDeleteJournal}
            >
              حذف المجلة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubjectJournalsGrid;
