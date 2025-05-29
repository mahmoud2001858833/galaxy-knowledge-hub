
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, ThumbsUp, ThumbsDown, Plus, Volume2, Star, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type ArabicWord = Tables<'arabic_words'>;

const EnhancedSmartDictionary = () => {
  const [words, setWords] = useState<ArabicWord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<ArabicWord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestedWords, setSuggestedWords] = useState<ArabicWord[]>([]);
  const { toast } = useToast();

  const [newWord, setNewWord] = useState({
    word: '',
    meaning: '',
    category: 'classical' as const,
    dialect_region: '',
    word_pattern: ''
  });

  // كلمات مقترحة ثابتة للعرض عند عدم وجود بحث
  const featuredWords = [
    {
      id: 'featured-1',
      word: 'الحِكْمَة',
      meaning: 'العلم والفهم وإصابة الحق بالعلم والعقل',
      category: 'classical',
      quran_examples: ['وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا'],
      poetry_examples: ['الحكمة ضالة المؤمن أنى وجدها فهو أحق بها'],
      derivatives: ['حكيم', 'محكمة', 'إحكام'],
      votes_count: 156,
      is_verified: true
    },
    {
      id: 'featured-2',
      word: 'الإِبْدَاع',
      meaning: 'الإتيان بالجديد المبتكر والخلق من العدم',
      category: 'modern',
      quran_examples: ['بَدِيعُ السَّمَاوَاتِ وَالأَرْضِ'],
      poetry_examples: ['أبدع في صنعه فجاء بديعاً'],
      derivatives: ['مبدع', 'إبداعي', 'بديع'],
      votes_count: 98,
      is_verified: true
    },
    {
      id: 'featured-3',
      word: 'التَّوَاصُل',
      meaning: 'الاتصال والتفاعل بين الأشخاص أو الجماعات',
      category: 'modern',
      quran_examples: [],
      poetry_examples: ['بالتواصل تحيا القلوب وتزدهر المجتمعات'],
      derivatives: ['وصل', 'موصول', 'صلة'],
      votes_count: 87,
      is_verified: true
    }
  ];

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchWords();
    } else {
      setWords([]);
      // عرض كلمات مقترحة عند عدم وجود بحث
      setSuggestedWords(featuredWords.map(word => ({
        ...word,
        created_at: new Date().toISOString(),
        user_id: null,
        dialect_region: null,
        word_pattern: null,
        quran_examples: word.quran_examples,
        poetry_examples: word.poetry_examples,
        derivatives: word.derivatives
      })) as ArabicWord[]);
    }
  }, [searchTerm]);

  const searchWords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('arabic_words')
        .select('*')
        .ilike('word', `%${searchTerm}%`)
        .order('votes_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      setWords(data || []);
      setSuggestedWords([]);
    } catch (error) {
      console.error('Error searching words:', error);
    } finally {
      setLoading(false);
    }
  };

  const getArrayFromJson = (jsonData: any): string[] => {
    if (Array.isArray(jsonData)) return jsonData;
    if (typeof jsonData === 'string') return [jsonData];
    return [];
  };

  const handleVote = async (wordId: string, voteType: 'up' | 'down') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "مطلوب تسجيل الدخول",
          description: "يرجى تسجيل الدخول للتصويت",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('word_contributions')
        .insert({
          user_id: user.id,
          word_id: wordId,
          contribution_type: 'vote',
          vote_type: voteType
        });

      if (error) throw error;

      // Update local state
      setWords(prev => prev.map(word => 
        word.id === wordId 
          ? { ...word, votes_count: (word.votes_count || 0) + (voteType === 'up' ? 1 : -1) }
          : word
      ));

      toast({
        title: "تم التصويت بنجاح",
        description: "شكراً لمساهمتك في تحسين المعجم"
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التصويت",
        variant: "destructive"
      });
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "مطلوب تسجيل الدخول",
          description: "يرجى تسجيل الدخول لإضافة كلمات",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('arabic_words')
        .insert({
          ...newWord,
          user_id: user.id,
          quran_examples: [],
          poetry_examples: [],
          derivatives: []
        });

      if (error) throw error;

      toast({
        title: "تمت الإضافة بنجاح",
        description: "سيتم مراجعة الكلمة قبل نشرها"
      });

      setNewWord({
        word: '',
        meaning: '',
        category: 'classical',
        dialect_region: '',
        word_pattern: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding word:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الكلمة",
        variant: "destructive"
      });
    }
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ar-SA';
      speechSynthesis.speak(utterance);
    }
  };

  if (selectedWord) {
    const quranExamples = getArrayFromJson(selectedWord.quran_examples);
    const poetryExamples = getArrayFromJson(selectedWord.poetry_examples);
    const derivatives = getArrayFromJson(selectedWord.derivatives);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={() => setSelectedWord(null)}
          className="mb-6 px-4 py-2 bg-amber-600/20 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-600/30 transition-colors"
        >
          ← العودة للمعجم
        </button>
        
        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-8 border border-amber-500/30">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-4xl font-bold text-white">{selectedWord.word}</h2>
                <button
                  onClick={() => speakWord(selectedWord.word)}
                  className="p-2 bg-amber-600/30 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-600/50 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedWord.category === 'classical' ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300' :
                  selectedWord.category === 'dialect' ? 'bg-green-600/20 border border-green-500/30 text-green-300' :
                  'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                }`}>
                  {selectedWord.category === 'classical' ? 'فصحى' : 
                   selectedWord.category === 'dialect' ? 'لهجة' : 'معاصر'}
                </span>
                
                {selectedWord.dialect_region && (
                  <span className="px-3 py-1 bg-amber-600/20 border border-amber-500/30 rounded-full text-amber-300 text-sm">
                    {selectedWord.dialect_region}
                  </span>
                )}
                
                {selectedWord.is_verified && (
                  <span className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-green-300 text-sm flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    موثق
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(selectedWord.id, 'up')}
                className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-600/30 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <span className="text-white font-medium">{selectedWord.votes_count || 0}</span>
              <button
                onClick={() => handleVote(selectedWord.id, 'down')}
                className="p-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-amber-300 mb-2">المعنى</h3>
              <p className="text-white/80 text-lg">{selectedWord.meaning}</p>
            </div>
            
            {selectedWord.word_pattern && (
              <div>
                <h3 className="text-xl font-semibold text-amber-300 mb-2">الوزن</h3>
                <p className="text-white/80">{selectedWord.word_pattern}</p>
              </div>
            )}
            
            {derivatives.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-amber-300 mb-2">الاشتقاقات</h3>
                <div className="flex flex-wrap gap-2">
                  {derivatives.map((derivative, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300"
                    >
                      {derivative}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {quranExamples.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-amber-300 mb-2">أمثلة قرآنية</h3>
                <div className="space-y-2">
                  {quranExamples.map((example, index) => (
                    <div key={index} className="bg-green-600/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-white/80 text-lg text-center">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {poetryExamples.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-amber-300 mb-2">أمثلة شعرية</h3>
                <div className="space-y-2">
                  {poetryExamples.map((example, index) => (
                    <div key={index} className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-3">
                      <p className="text-white/80 text-lg text-center font-serif">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث في معجم العرب الشامل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-white/10 border border-amber-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 text-lg"
          />
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-amber-600/30 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-600/50 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة كلمة
        </button>
      </div>

      {/* Featured Words Section */}
      {suggestedWords.length > 0 && searchTerm.length < 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-semibold text-amber-300">كلمات مُختارة</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestedWords.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedWord(word)}
                className="group cursor-pointer bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl p-4 hover:from-amber-600/30 hover:to-orange-600/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {word.word}
                  </h4>
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-white/70 text-sm line-clamp-2 mb-2">{word.meaning}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    word.category === 'classical' ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300' :
                    'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                  }`}>
                    {word.category === 'classical' ? 'فصحى' : 'معاصر'}
                  </span>
                  <div className="flex items-center gap-1 text-amber-300">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="text-sm">{word.votes_count}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Word Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-600/20 border border-amber-500/30 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-amber-300 mb-4">إضافة كلمة جديدة للمعجم</h3>
          <form onSubmit={handleAddWord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="الكلمة"
                value={newWord.word}
                onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                className="px-4 py-2 bg-white/10 border border-amber-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50"
                required
              />
              
              <select
                value={newWord.category}
                onChange={(e) => setNewWord({...newWord, category: e.target.value as any})}
                className="px-4 py-2 bg-white/10 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="classical" className="bg-gray-800">فصحى</option>
                <option value="dialect" className="bg-gray-800">لهجة</option>
                <option value="modern" className="bg-gray-800">معاصر</option>
              </select>
            </div>
            
            <textarea
              placeholder="المعنى والشرح"
              value={newWord.meaning}
              onChange={(e) => setNewWord({...newWord, meaning: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-amber-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 min-h-[80px]"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="المنطقة (للهجات)"
                value={newWord.dialect_region}
                onChange={(e) => setNewWord({...newWord, dialect_region: e.target.value})}
                className="px-4 py-2 bg-white/10 border border-amber-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50"
              />
              
              <input
                type="text"
                placeholder="الوزن الصرفي"
                value={newWord.word_pattern}
                onChange={(e) => setNewWord({...newWord, word_pattern: e.target.value})}
                className="px-4 py-2 bg-white/10 border border-amber-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600/30 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-600/50 transition-colors"
              >
                إضافة للمعجم
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-600/30 border border-gray-500/30 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Search Results */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-amber-500 rounded-full border-t-transparent"></div>
        </div>
      )}

      {searchTerm.length >= 2 && !loading && (
        <div className="space-y-3">
          {words.length > 0 ? (
            words.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedWord(word)}
                className="group cursor-pointer bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-500/30 rounded-lg p-4 hover:from-amber-600/20 hover:to-orange-600/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                        {word.word}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        word.category === 'classical' ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300' :
                        word.category === 'dialect' ? 'bg-green-600/20 border border-green-500/30 text-green-300' :
                        'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                      }`}>
                        {word.category === 'classical' ? 'فصحى' : 
                         word.category === 'dialect' ? 'لهجة' : 'معاصر'}
                      </span>
                      {word.is_verified && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-white/70 line-clamp-2">{word.meaning}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-amber-300">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{word.votes_count || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70">لم يتم العثور على كلمات مطابقة في المعجم</p>
              <p className="text-white/50 text-sm mt-2">جرب البحث بكلمة أخرى أو أضف الكلمة للمعجم</p>
            </div>
          )}
        </div>
      )}

      {searchTerm.length < 2 && suggestedWords.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">ادخل حرفين على الأقل للبحث في معجم العرب الشامل</p>
          <p className="text-white/50 text-sm mt-2">يحتوي المعجم على آلاف الكلمات العربية مع أمثلة وشروحات</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedSmartDictionary;
