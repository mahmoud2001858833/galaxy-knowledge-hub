
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Calendar, Award, Users, GraduationCap, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { englishScholars, getScholarsByCategory, searchScholars, type EnglishScholar } from '@/data/englishScholars';

interface EnglishScholarsEncyclopediaProps {
  language: 'ar' | 'en';
}

const EnglishScholarsEncyclopedia: React.FC<EnglishScholarsEncyclopediaProps> = ({ language }) => {
  const [selectedScholar, setSelectedScholar] = useState<EnglishScholar | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [filteredScholars, setFilteredScholars] = useState(englishScholars);

  const t = {
    ar: {
      title: "موسوعة علماء اللغة الإنجليزية",
      subtitle: "اكتشف عمالقة اللغة الإنجليزية الذين شكلوا تطورها عبر التاريخ",
      search: "البحث في الموسوعة...",
      category: "الفئة",
      allCategories: "جميع الفئات",
      lexicographer: "معجمي",
      phonetician: "عالم أصوات",
      grammarian: "نحوي",
      usageExpert: "خبير استخدام",
      playwright: "كاتب مسرحي",
      poet: "شاعر",
      linguist: "لغوي",
      languageAcquisitionExpert: "خبير اكتساب اللغة",
      languageHistorian: "مؤرخ لغة",
      birthYear: "سنة الميلاد",
      deathYear: "سنة الوفاة",
      era: "العصر",
      category: "الفئة",
      achievements: "الإنجازات",
      majorWorks: "الأعمال الرئيسية",
      contribution: "المساهمة",
      close: "إغلاق",
      scholarsCount: "عالم",
      noResults: "لا توجد نتائج للبحث",
      tryDifferent: "جرب كلمات مختلفة أو امسح الفلاتر"
    },
    en: {
      title: "English Language Scholars Encyclopedia",
      subtitle: "Discover the giants of English language who shaped its evolution throughout history",
      search: "Search encyclopedia...",
      category: "Category",
      allCategories: "All Categories",
      lexicographer: "Lexicographer",
      phonetician: "Phonetician", 
      grammarian: "Grammarian",
      usageExpert: "Usage Expert",
      playwright: "Playwright/Poet",
      poet: "Poet",
      linguist: "Linguist",
      languageAcquisitionExpert: "Language Acquisition Expert",
      languageHistorian: "Language Historian",
      birthYear: "Birth Year",
      deathYear: "Death Year",
      era: "Era",
      achievements: "Achievements",
      majorWorks: "Major Works",
      contribution: "Contribution",
      close: "Close",
      scholarsCount: "scholars",
      noResults: "No results found",
      tryDifferent: "Try different keywords or clear filters"
    }
  };

  const currentLang = t[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';

  const categories = [
    { value: 'all', label: currentLang.allCategories },
    { value: 'Lexicographer', label: currentLang.lexicographer },
    { value: 'Phonetician', label: currentLang.phonetician },
    { value: 'Grammarian', label: currentLang.grammarian },
    { value: 'Usage Expert', label: currentLang.usageExpert },
    { value: 'Playwright/Poet', label: currentLang.playwright },
    { value: 'Poet', label: currentLang.poet },
    { value: 'Linguist', label: currentLang.linguist },
    { value: 'Language Acquisition Expert', label: currentLang.languageAcquisitionExpert },
    { value: 'Language Historian', label: currentLang.languageHistorian }
  ];

  const categoryColors = {
    'Lexicographer': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Phonetician': 'bg-green-500/20 text-green-300 border-green-500/30',
    'Grammarian': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Usage Expert': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Playwright/Poet': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Poet': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'Linguist': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Language Acquisition Expert': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'Language Historian': 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  };

  React.useEffect(() => {
    let results = englishScholars;

    if (searchQuery) {
      results = searchScholars(searchQuery, language);
    }

    if (categoryFilter !== 'all') {
      results = results.filter(scholar => scholar.category === categoryFilter);
    }

    setFilteredScholars(results);
  }, [searchQuery, categoryFilter, language]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
  };

  return (
    <div className={`space-y-6 ${textAlign}`} dir={dir}>
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-indigo-300 mb-4 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GraduationCap className="w-8 h-8" />
          {currentLang.title}
        </motion.h2>
        <p className="text-white/70 text-lg max-w-3xl mx-auto">
          {currentLang.subtitle}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={currentLang.search}
                  className="pl-10 bg-white/10 border-indigo-500/30 text-white placeholder:text-white/50"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white/10 border-indigo-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-indigo-950 border-indigo-500/30">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-white hover:bg-indigo-800">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || categoryFilter !== 'all') && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-indigo-500/30 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
              <Users className="w-4 h-4" />
              {filteredScholars.length} {currentLang.scholarsCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scholars Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredScholars.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-indigo-500/20">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                {currentLang.noResults}
              </h3>
              <p className="text-white/50">
                {currentLang.tryDifferent}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredScholars.map((scholar, index) => (
              <motion.div
                key={scholar.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card 
                  className="bg-white/5 backdrop-blur-sm border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 cursor-pointer group hover:scale-105"
                  onClick={() => setSelectedScholar(scholar)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${categoryColors[scholar.category]} text-xs px-2 py-1`}>
                        {language === 'ar' ? scholar.categoryAr : scholar.category}
                      </Badge>
                      <div className="text-xs text-white/50">
                        {scholar.era || (language === 'ar' ? scholar.eraAr : scholar.era)}
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg text-indigo-300 group-hover:text-indigo-200 transition-colors">
                      {language === 'ar' ? scholar.nameAr : scholar.name}
                    </CardTitle>
                    
                    <div className="text-sm text-white/60">
                      {scholar.birthYear && scholar.deathYear && (
                        <span>({scholar.birthYear} - {scholar.deathYear})</span>
                      )}
                      {scholar.birthYear && !scholar.deathYear && (
                        <span>({scholar.birthYear} - Present)</span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">
                      {language === 'ar' ? scholar.descriptionAr : scholar.description}
                    </p>
                    
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs text-indigo-300 font-medium">
                        {language === 'ar' ? scholar.contributionAr : scholar.contribution}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Scholar Detail Dialog */}
      <Dialog open={!!selectedScholar} onOpenChange={() => setSelectedScholar(null)}>
        {selectedScholar && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-indigo-950 border-indigo-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl text-indigo-300 flex items-center gap-3">
                <Award className="w-6 h-6" />
                {language === 'ar' ? selectedScholar.nameAr : selectedScholar.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-300" />
                  <div>
                    <p className="text-sm text-white/60">{currentLang.era}</p>
                    <p className="text-white">{language === 'ar' ? selectedScholar.eraAr : selectedScholar.era}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-300" />
                  <div>
                    <p className="text-sm text-white/60">{currentLang.category}</p>
                    <Badge className={`${categoryColors[selectedScholar.category]} text-xs px-2 py-1`}>
                      {language === 'ar' ? selectedScholar.categoryAr : selectedScholar.category}
                    </Badge>
                  </div>
                </div>
                
                {selectedScholar.birthYear && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-300" />
                    <div>
                      <p className="text-sm text-white/60">Lifespan</p>
                      <p className="text-white">
                        {selectedScholar.birthYear} - {selectedScholar.deathYear || 'Present'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">Description</h3>
                <p className="text-white/80 leading-relaxed">
                  {language === 'ar' ? selectedScholar.descriptionAr : selectedScholar.description}
                </p>
              </div>

              {/* Contribution */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">{currentLang.contribution}</h3>
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <p className="text-indigo-200 font-medium">
                    {language === 'ar' ? selectedScholar.contributionAr : selectedScholar.contribution}
                  </p>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">{currentLang.achievements}</h3>
                <ul className="space-y-2">
                  {(language === 'ar' ? selectedScholar.achievementsAr : selectedScholar.achievements).map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-indigo-300 mt-1.5">•</span>
                      <span className="text-white/80">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Major Works */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">{currentLang.majorWorks}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(language === 'ar' ? selectedScholar.majorWorksAr : selectedScholar.majorWorks).map((work, index) => (
                    <div key={index} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-white/90 font-medium">{work}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default EnglishScholarsEncyclopedia;
