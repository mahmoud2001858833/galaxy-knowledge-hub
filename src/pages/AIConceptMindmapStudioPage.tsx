import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import SafeBoundary from '@/components/common/SafeBoundary';
import AIConceptMindmapStudio from '@/components/ai/AIConceptMindmapStudio';
import InteractiveLessonDeckStudio from '@/components/ai/InteractiveLessonDeckStudio';
import { BrainCircuit, Presentation } from 'lucide-react';

export const AIConceptMindmapStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mindmap' | 'deck'>('mindmap');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070919] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300" dir="rtl">
      <SEO 
        title="استوديو الخرائط الذهنية والدروس التفاعلية | منصة ذروة العلم 2.0"
        description="توليد الخرائط المفاهيمية الذكية والشجرية وعروض الدروس التفاعلية مع تضمين المحاكيات ثلاثية الأبعاد وتذاكر الخروج التقييمية لمدارس التوجيهي ومسارات BTEC."
      />

      <SafeBoundary name="Navbar">
        <Navbar />
      </SafeBoundary>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Sub-navigation switcher */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setActiveTab('mindmap')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mindmap'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>1. مولد الخرائط الذهنية المفاهيمية (AI Mindmap)</span>
            </button>

            <button
              onClick={() => setActiveTab('deck')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'deck'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>2. استوديو الشرائح التفاعلية وتذكرة الخروج (Lesson Decks)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Mindmaps */}
        {activeTab === 'mindmap' && (
          <SafeBoundary name="AIConceptMindmapStudio">
            <AIConceptMindmapStudio />
          </SafeBoundary>
        )}

        {/* Tab 2: Lesson Decks */}
        {activeTab === 'deck' && (
          <SafeBoundary name="InteractiveLessonDeckStudio">
            <InteractiveLessonDeckStudio />
          </SafeBoundary>
        )}
      </main>

      <SafeBoundary name="Footer">
        <Footer />
      </SafeBoundary>
    </div>
  );
};

export default AIConceptMindmapStudioPage;
