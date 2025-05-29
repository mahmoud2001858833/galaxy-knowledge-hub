
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Search, BookOpen, Star, ThumbsUp, ThumbsDown, Plus, Filter, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ArabicWord {
  id: string;
  word: string;
  meaning: string;
  category: string;
  dialect_region: string | null;
  word_pattern: string | null;
  quran_examples: any[];
  poetry_examples: any[];
  derivatives: any[];
  user_id: string | null;
  is_verified: boolean;
  votes_count: number;
  created_at: string;
}

const EnhancedSmartDictionary = () => {
  const [words, setWords] = useState<ArabicWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWord, setSelectedWord] = useState<ArabicWord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [newWord, setNewWord] = useState({
    word: '',
    meaning: '',
    category: '',
    dialect_region: '',
    word_pattern: ''
  });
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'جميع الفئات' },
    { value: 'اسم', label: 'الأسماء' },
    { value: 'فعل', label: 'الأفعال' },
    { value: 'صفة', label: 'الصفات' },
    { value: 'حرف', label: 'الحروف' },
    { value: 'ظرف', label: 'الظروف' },
    { value: 'عامي', label: 'عامي' },
    { value: 'فصيح', label: 'فصيح' },
    { value: 'قديم', label: 'قديم' },
    { value: 'حديث', label: 'حديث' }
  ];

  // البحث الفوري مع useMemo
  const filteredWords = useMemo(() => {
    if (!searchQuery && selectedCategory === 'all') {
      return words;
    }

    return words.filter(word => {
      const matchesSearch = !searchQuery || 
        word.word.includes(searchQuery) ||
        word.meaning.includes(searchQuery) ||
        (word.word_pattern && word.word_pattern.includes(searchQuery));
      
      const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [words, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const { data, error } = await supabase
        .from('arabic_words')
        .select('*')
        .order('word');

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      console.error('Error fetching words:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل الكلمات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.word || !newWord.meaning || !newWord.category) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('arabic_words')
        .insert([{
          word: newWord.word,
          meaning: newWord.meaning,
          category: newWord.category,
          dialect_region: newWord.dialect_region || null,
          word_pattern: newWord.word_pattern || null,
          quran_examples: [],
          poetry_examples: [],
          derivatives: []
        }]);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تمت إضافة الكلمة بنجاح",
      });

      setIsAddingWord(false);
      setNewWord({
        word: '',
        meaning: '',
        category: '',
        dialect_region: '',
        word_pattern: ''
      });
      fetchWords();
    } catch (error) {
      console.error('Error adding word:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الكلمة",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'اسم': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'فعل': 'bg-green-500/20 text-green-300 border-green-500/30',
      'صفة': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'حرف': 'bg-red-500/20 text-red-300 border-red-500/30',
      'ظرف': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'عامي': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'فصيح': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'قديم': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'حديث': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white/5 backdrop-blur-sm border-amber-500/20">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-amber-300 mb-4 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8" />
          معجم العرب الشامل المحسن
        </h2>
        <p className="text-white/70 text-lg">
          معجم تفاعلي شامل مع البحث الفوري والذكي
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
          <Input
            placeholder="ابحث عن كلمة أو معنى... (البحث فوري ومباشر)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/10 border-amber-500/30 text-white placeholder:text-white/50 pr-10 text-lg"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48 bg-white/10 border-amber-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-amber-950 border-amber-500/30">
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value} className="text-white hover:bg-amber-800">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => setIsAddingWord(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          إضافة كلمة
        </Button>
      </div>

      {/* Live Search Results Counter */}
      <div className="text-center">
        <motion.p 
          className="text-amber-300 text-lg"
          key={filteredWords.length}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {searchQuery ? (
            <>عدد النتائج: <span className="font-bold text-amber-200">{filteredWords.length}</span> كلمة</>
          ) : (
            <>إجمالي الكلمات: <span className="font-bold text-amber-200">{words.length}</span> كلمة</>
          )}
        </motion.p>
      </div>

      {/* Words Grid with Animation */}
      <AnimatePresence mode="wait">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          key={`${searchQuery}-${selectedCategory}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {filteredWords.map((word, index) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
            >
              <Card 
                className="bg-white/5 backdrop-blur-sm border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 cursor-pointer group h-full"
                onClick={() => setSelectedWord(word)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-amber-300 text-xl mb-2 group-hover:text-amber-200 transition-colors">
                        {word.word}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge className={`${getCategoryColor(word.category)} text-xs`}>
                          {word.category}
                        </Badge>
                        {word.is_verified && (
                          <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            موثق
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 line-clamp-3 leading-relaxed">
                    {word.meaning}
                  </p>
                  {word.word_pattern && (
                    <p className="text-amber-300/70 text-sm mt-2">
                      الوزن: {word.word_pattern}
                    </p>
                  )}
                  {word.dialect_region && (
                    <p className="text-blue-300/70 text-sm mt-1">
                      المنطقة: {word.dialect_region}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredWords.length === 0 && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <BookOpen className="w-16 h-16 text-amber-300 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-amber-200 mb-2">لا توجد نتائج</h3>
          <p className="text-white/60">
            {searchQuery ? 
              `لم يتم العثور على كلمات تحتوي على "${searchQuery}"` : 
              'لا توجد كلمات في هذه الفئة'
            }
          </p>
        </motion.div>
      )}

      {/* Word Details Modal */}
      <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
        {selectedWord && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-amber-950/95 border-amber-500/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-amber-300 text-right flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                {selectedWord.word}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-bold text-amber-300 mb-3">المعنى والتفاصيل</h3>
                <p className="text-white/80 text-lg leading-relaxed mb-4">{selectedWord.meaning}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getCategoryColor(selectedWord.category)}>
                    {selectedWord.category}
                  </Badge>
                  {selectedWord.is_verified && (
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      <Star className="w-3 h-3 mr-1" />
                      موثق
                    </Badge>
                  )}
                </div>

                {selectedWord.word_pattern && (
                  <p className="text-amber-300 mb-2">
                    <span className="font-semibold">الوزن الصرفي:</span> {selectedWord.word_pattern}
                  </p>
                )}
                
                {selectedWord.dialect_region && (
                  <p className="text-blue-300 mb-2">
                    <span className="font-semibold">المنطقة/اللهجة:</span> {selectedWord.dialect_region}
                  </p>
                )}
              </div>

              {/* Quran Examples */}
              {selectedWord.quran_examples && selectedWord.quran_examples.length > 0 && (
                <div className="bg-green-500/10 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-green-300 mb-3">أمثلة قرآنية</h3>
                  <div className="space-y-3">
                    {selectedWord.quran_examples.map((example: any, index: number) => (
                      <div key={index} className="bg-white/5 rounded p-3">
                        <p className="text-white/90 italic">"{example.text}"</p>
                        <p className="text-green-300/70 text-sm mt-1">{example.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Poetry Examples */}
              {selectedWord.poetry_examples && selectedWord.poetry_examples.length > 0 && (
                <div className="bg-purple-500/10 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-purple-300 mb-3">أمثلة شعرية</h3>
                  <div className="space-y-3">
                    {selectedWord.poetry_examples.map((example: any, index: number) => (
                      <div key={index} className="bg-white/5 rounded p-3">
                        <p className="text-white/90 italic font-serif">"{example.text}"</p>
                        <p className="text-purple-300/70 text-sm mt-1">{example.poet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Derivatives */}
              {selectedWord.derivatives && selectedWord.derivatives.length > 0 && (
                <div className="bg-amber-500/10 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-amber-300 mb-3">المشتقات والتصريفات</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedWord.derivatives.map((derivative: any, index: number) => (
                      <div key={index} className="bg-white/5 rounded p-2 text-center">
                        <p className="text-amber-200">{derivative.word}</p>
                        <p className="text-white/60 text-xs">{derivative.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Add Word Modal */}
      <Dialog open={isAddingWord} onOpenChange={setIsAddingWord}>
        <DialogContent className="bg-amber-950/95 border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-amber-300 text-right">إضافة كلمة جديدة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="الكلمة *"
              value={newWord.word}
              onChange={(e) => setNewWord({...newWord, word: e.target.value})}
              className="bg-white/10 border-amber-500/30 text-white"
            />
            
            <Textarea
              placeholder="المعنى *"
              value={newWord.meaning}
              onChange={(e) => setNewWord({...newWord, meaning: e.target.value})}
              className="bg-white/10 border-amber-500/30 text-white"
            />
            
            <Select value={newWord.category} onValueChange={(value) => setNewWord({...newWord, category: value})}>
              <SelectTrigger className="bg-white/10 border-amber-500/30 text-white">
                <SelectValue placeholder="اختر الفئة *" />
              </SelectTrigger>
              <SelectContent className="bg-amber-950 border-amber-500/30">
                {categories.slice(1).map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-white hover:bg-amber-800">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="المنطقة/اللهجة (اختياري)"
              value={newWord.dialect_region}
              onChange={(e) => setNewWord({...newWord, dialect_region: e.target.value})}
              className="bg-white/10 border-amber-500/30 text-white"
            />
            
            <Input
              placeholder="الوزن الصرفي (اختياري)"
              value={newWord.word_pattern}
              onChange={(e) => setNewWord({...newWord, word_pattern: e.target.value})}
              className="bg-white/10 border-amber-500/30 text-white"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingWord(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddWord} className="bg-amber-600 hover:bg-amber-700">
              إضافة الكلمة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSmartDictionary;
