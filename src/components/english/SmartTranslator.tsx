
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SmartTranslatorCore from './SmartTranslatorCore';
import ImageTextExtractorAdvanced from './ImageTextExtractorAdvanced';
import AdvancedTextGenerator from './AdvancedTextGenerator';

interface SmartTranslatorProps {
  language: 'ar' | 'en';
}

const SmartTranslator: React.FC<SmartTranslatorProps> = ({ language }) => {
  const t = {
    ar: {
      title: "المترجم الذكي المتطور",
      subtitle: "ترجمة ذكية، ترجمة الصور، ومولد النصوص الإنجليزية",
      textTranslator: "المترجم الذكي",
      imageTranslator: "ترجمة الصور",
      textGenerator: "مولد النصوص"
    },
    en: {
      title: "Advanced Smart Translator",
      subtitle: "Smart translation, image translation, and English text generator",
      textTranslator: "Smart Translator",
      imageTranslator: "Image Translation",
      textGenerator: "Text Generator"
    }
  };

  const currentLang = t[language];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-indigo-300 mb-4 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Languages className="w-8 h-8" />
          {currentLang.title}
        </motion.h2>
        <p className="text-white/70 text-lg">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Translator Tabs */}
      <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
        <CardContent className="p-6">
          <Tabs defaultValue="translator" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-indigo-900/50 border border-indigo-500/30">
              <TabsTrigger value="translator" className="data-[state=active]:bg-indigo-600 text-white">
                <Languages className="w-4 h-4 mr-2" />
                {currentLang.textTranslator}
              </TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:bg-indigo-600 text-white">
                <ImageIcon className="w-4 h-4 mr-2" />
                {currentLang.imageTranslator}
              </TabsTrigger>
              <TabsTrigger value="generator" className="data-[state=active]:bg-indigo-600 text-white">
                <FileText className="w-4 h-4 mr-2" />
                {currentLang.textGenerator}
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="translator">
                <SmartTranslatorCore language={language} />
              </TabsContent>
              
              <TabsContent value="image">
                <ImageTextExtractorAdvanced language={language} />
              </TabsContent>
              
              <TabsContent value="generator">
                <AdvancedTextGenerator language={language} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartTranslator;
