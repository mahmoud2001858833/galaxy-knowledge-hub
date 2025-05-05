
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScientificJournal, SubjectType } from '@/components/shared/types/educationalContentTypes';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

interface SubjectJournalsGridProps {
  subject: SubjectType;
}

const SubjectJournalsGrid = ({ subject }: SubjectJournalsGridProps) => {
  const [journals, setJournals] = useState<ScientificJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState<ScientificJournal | null>(null);
  const { toast } = useToast();

  useEffect(() => {
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

        setJournals(data || []);
      } catch (error: any) {
        console.error('Error fetching journals:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحميل المجلات العلمية",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
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

  const handleViewPdf = (journal: ScientificJournal) => {
    // Open in new tab
    window.open(journal.pdf_url, '_blank');
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
        <FileText className="w-16 h-16 text-purple-300 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-purple-200 mb-2">لا توجد مجلات بعد</h3>
        <p className="text-purple-300">
          لم يتم إضافة أي مجلات علمية في قسم {getSubjectTitle(subject)} حتى الآن
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {journals.map((journal) => (
          <Card 
            key={journal.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
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
              {journal.description && (
                <p className="text-sm text-gray-200 line-clamp-2">{journal.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedJournal} onOpenChange={() => setSelectedJournal(null)}>
        {selectedJournal && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-right">{selectedJournal.title}</DialogTitle>
              {selectedJournal.description && (
                <DialogDescription className="text-right">
                  {selectedJournal.description}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={selectedJournal.cover_image_url} 
                alt={selectedJournal.title} 
                className="max-h-[40vh] object-contain"
              />
            </div>
            <DialogFooter>
              <Button onClick={() => handleViewPdf(selectedJournal)} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                عرض المجلة العلمية
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default SubjectJournalsGrid;
