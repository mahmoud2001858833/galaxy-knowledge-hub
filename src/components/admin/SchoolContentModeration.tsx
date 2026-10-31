import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeachersSection } from '@/components/controlCenter/TeachersSection';
import { ParentsSection } from '@/components/controlCenter/ParentsSection';
import { SupervisorsSection } from '@/components/controlCenter/SupervisorsSection';
import { AssignmentsSection } from '@/components/controlCenter/AssignmentsSection';
import { NotesSection } from '@/components/controlCenter/NotesSection';
import { JournalsSection } from '@/components/controlCenter/JournalsSection';
import { VisualLibrarySection } from '@/components/controlCenter/VisualLibrarySection';
import { TawjihiFilesSection } from '@/components/controlCenter/TawjihiFilesSection';
import { ArtProjectsSection } from '@/components/controlCenter/ArtProjectsSection';
import { EnvironmentalProjectsSection } from '@/components/controlCenter/EnvironmentalProjectsSection';
import { ProgrammingProjectsSection } from '@/components/controlCenter/ProgrammingProjectsSection';
import { ProgrammingPlatformsSection } from '@/components/controlCenter/ProgrammingPlatformsSection';

/**
 * Moderation of user-submitted school content. These tools lived in the old
 * /control-center page, which became unreachable when that route moved to the
 * super admin hub; they are merged here as one hub tab.
 */
const SECTIONS = [
  { id: 'teachers', label: 'المعلمون', Component: TeachersSection },
  { id: 'parents', label: 'أولياء الأمور', Component: ParentsSection },
  { id: 'supervisors', label: 'المشرفون', Component: SupervisorsSection },
  { id: 'assignments', label: 'الواجبات', Component: AssignmentsSection },
  { id: 'notes', label: 'الملاحظات', Component: NotesSection },
  { id: 'journals', label: 'المجلات العلمية', Component: JournalsSection },
  { id: 'visual-library', label: 'المكتبة المرئية', Component: VisualLibrarySection },
  { id: 'tawjihi', label: 'ملفات التوجيهي', Component: TawjihiFilesSection },
  { id: 'art', label: 'مشاريع الفن', Component: ArtProjectsSection },
  { id: 'environmental', label: 'مشاريع الاستدامة', Component: EnvironmentalProjectsSection },
  { id: 'programming-projects', label: 'مشاريع البرمجة', Component: ProgrammingProjectsSection },
  { id: 'programming-platforms', label: 'منصات BTEC', Component: ProgrammingPlatformsSection },
] as const;

const SchoolContentModeration: React.FC = () => (
  <Tabs defaultValue="teachers" dir="rtl" className="w-full">
    <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-muted p-1 rounded-2xl">
      {SECTIONS.map(({ id, label }) => (
        <TabsTrigger key={id} value={id} className="rounded-xl text-xs">
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
    {SECTIONS.map(({ id, Component }) => (
      <TabsContent key={id} value={id} className="mt-4">
        <Component />
      </TabsContent>
    ))}
  </Tabs>
);

export default SchoolContentModeration;
