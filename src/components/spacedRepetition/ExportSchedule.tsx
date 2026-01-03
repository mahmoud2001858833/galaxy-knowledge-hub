import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Image, FileText, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SpacedReview, SpacedLesson, SUBJECTS } from './types';
import { format, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportScheduleProps {
  reviews: SpacedReview[];
  lessons: SpacedLesson[];
  calendarRef?: React.RefObject<HTMLDivElement>;
}

const ExportSchedule: React.FC<ExportScheduleProps> = ({ reviews, lessons, calendarRef }) => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const getSubjectLabel = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return 'غير معروف';
    const subject = SUBJECTS.find(s => s.value === lesson.subject_name);
    return subject?.label || lesson.subject_name;
  };

  const getLessonName = (lessonId: string) => {
    return lessons.find(l => l.id === lessonId)?.lesson_name || 'درس غير معروف';
  };

  // Export as PNG image
  const exportAsImage = async () => {
    setExporting(true);
    try {
      // Create a temporary container with the schedule
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1200px;
        padding: 40px;
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        font-family: 'Segoe UI', Tahoma, sans-serif;
        direction: rtl;
      `;

      // Build schedule content
      const upcomingReviews = reviews
        .filter(r => !r.is_completed)
        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
        .slice(0, 30);

      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #fff; font-size: 28px; margin-bottom: 10px;">🧠 جدول المراجعة الذكي</h1>
          <p style="color: #94a3b8; font-size: 14px;">تم إنشاؤه بتاريخ ${format(new Date(), 'd MMMM yyyy', { locale: ar })}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          ${upcomingReviews.map(r => `
            <div style="
              background: rgba(30, 27, 75, 0.8);
              border: 1px solid rgba(99, 102, 241, 0.3);
              border-radius: 12px;
              padding: 15px;
            ">
              <div style="color: #818cf8; font-size: 12px; margin-bottom: 8px;">
                ${format(new Date(r.scheduled_date), 'EEEE، d MMMM', { locale: ar })}
              </div>
              <div style="color: #fff; font-size: 14px; font-weight: 600; margin-bottom: 5px;">
                ${getLessonName(r.lesson_id)}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #a5b4fc; font-size: 12px;">${getSubjectLabel(r.lesson_id)}</span>
                <span style="background: rgba(139, 92, 246, 0.2); color: #a78bfa; padding: 3px 8px; border-radius: 20px; font-size: 11px;">
                  المراجعة #${r.review_number}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        backgroundColor: '#0f172a',
        scale: 2,
      });

      document.body.removeChild(container);

      // Download
      const link = document.createElement('a');
      link.download = `جدول-المراجعة-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: '✅ تم التصدير بنجاح',
        description: 'تم حفظ الجدول كصورة',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: '❌ فشل التصدير',
        description: 'حدث خطأ أثناء إنشاء الصورة',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Export as text
  const exportAsText = () => {
    const upcomingReviews = reviews
      .filter(r => !r.is_completed)
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

    let text = '🧠 جدول المراجعة الذكي\n';
    text += `تاريخ الإنشاء: ${format(new Date(), 'd MMMM yyyy', { locale: ar })}\n`;
    text += '═══════════════════════════════════════\n\n';

    // Group by date
    const groupedByDate = upcomingReviews.reduce((acc, r) => {
      const date = r.scheduled_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(r);
      return acc;
    }, {} as Record<string, SpacedReview[]>);

    Object.entries(groupedByDate).forEach(([date, dateReviews]) => {
      text += `📅 ${format(new Date(date), 'EEEE، d MMMM yyyy', { locale: ar })}\n`;
      text += '───────────────────────────────────\n';
      dateReviews.forEach(r => {
        text += `   📚 ${getLessonName(r.lesson_id)}\n`;
        text += `      المادة: ${getSubjectLabel(r.lesson_id)} | المراجعة #${r.review_number}\n`;
      });
      text += '\n';
    });

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: '✅ تم النسخ',
        description: 'تم نسخ الجدول إلى الحافظة',
      });
    });
  };

  // Export as iCal
  const exportAsICal = () => {
    const upcomingReviews = reviews
      .filter(r => !r.is_completed)
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

    let ical = 'BEGIN:VCALENDAR\n';
    ical += 'VERSION:2.0\n';
    ical += 'PRODID:-//Spaced Repetition System//AR\n';
    ical += 'CALSCALE:GREGORIAN\n';
    ical += 'METHOD:PUBLISH\n';

    upcomingReviews.forEach(r => {
      const date = new Date(r.scheduled_date);
      const dateStr = format(date, 'yyyyMMdd');
      const nextDay = format(addDays(date, 1), 'yyyyMMdd');

      ical += 'BEGIN:VEVENT\n';
      ical += `UID:${r.id}@spaced-repetition\n`;
      ical += `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}\n`;
      ical += `DTSTART;VALUE=DATE:${dateStr}\n`;
      ical += `DTEND;VALUE=DATE:${nextDay}\n`;
      ical += `SUMMARY:📚 ${getLessonName(r.lesson_id)} - المراجعة #${r.review_number}\n`;
      ical += `DESCRIPTION:المادة: ${getSubjectLabel(r.lesson_id)}\\nالمراجعة رقم: ${r.review_number}\n`;
      ical += 'BEGIN:VALARM\n';
      ical += 'TRIGGER:-PT1H\n';
      ical += 'ACTION:DISPLAY\n';
      ical += 'DESCRIPTION:تذكير بموعد المراجعة\n';
      ical += 'END:VALARM\n';
      ical += 'END:VEVENT\n';
    });

    ical += 'END:VCALENDAR';

    // Download
    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `جدول-المراجعة-${format(new Date(), 'yyyy-MM-dd')}.ics`;
    link.click();

    toast({
      title: '✅ تم التصدير',
      description: 'تم حفظ الجدول بصيغة iCal',
    });
  };

  // Export as PDF
  const exportAsPDF = async () => {
    setExporting(true);
    try {
      const upcomingReviews = reviews
        .filter(r => !r.is_completed)
        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add Arabic font support - using default for now
      pdf.setFont('helvetica');
      
      // Title
      pdf.setFontSize(20);
      pdf.text('Smart Review Schedule', 105, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 105, 30, { align: 'center' });

      let y = 50;
      upcomingReviews.slice(0, 30).forEach((r, index) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        
        pdf.setFontSize(10);
        pdf.text(`${format(new Date(r.scheduled_date), 'yyyy-MM-dd')} - Review #${r.review_number}`, 20, y);
        y += 8;
      });

      pdf.save(`review-schedule-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast({
        title: '✅ تم التصدير',
        description: 'تم حفظ الجدول كملف PDF',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: '❌ فشل التصدير',
        description: 'حدث خطأ أثناء إنشاء PDF',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 ml-2" />
          )}
          تصدير الجدول
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-900 border-indigo-500/30">
        <DropdownMenuItem 
          onClick={exportAsImage}
          className="text-white hover:bg-indigo-500/20 cursor-pointer"
        >
          <Image className="h-4 w-4 ml-2 text-green-400" />
          صورة PNG
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={exportAsText}
          className="text-white hover:bg-indigo-500/20 cursor-pointer"
        >
          <FileText className="h-4 w-4 ml-2 text-blue-400" />
          نص (نسخ)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={exportAsICal}
          className="text-white hover:bg-indigo-500/20 cursor-pointer"
        >
          <CalendarIcon className="h-4 w-4 ml-2 text-purple-400" />
          تقويم iCal
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={exportAsPDF}
          className="text-white hover:bg-indigo-500/20 cursor-pointer"
        >
          <FileText className="h-4 w-4 ml-2 text-red-400" />
          ملف PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportSchedule;
