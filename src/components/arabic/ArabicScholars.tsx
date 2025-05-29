
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Scholar {
  id: string;
  name: string;
  death_year: string;
  category: 'grammar' | 'rhetoric' | 'lexicon' | 'modern';
  description: string;
  major_works: string[];
  image_url?: string;
}

const categoryNames = {
  grammar: 'علماء النحو واللغة',
  rhetoric: 'علماء البلاغة والأدب',
  lexicon: 'علماء المعاجم واللغة',
  modern: 'علماء اللغة المعاصرون'
};

const categoryColors = {
  grammar: 'from-blue-600/20 to-cyan-600/20 border-blue-500/30',
  rhetoric: 'from-green-600/20 to-emerald-600/20 border-green-500/30',
  lexicon: 'from-purple-600/20 to-pink-600/20 border-purple-500/30',
  modern: 'from-amber-600/20 to-orange-600/20 border-amber-500/30'
};

const ArabicScholars = () => {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScholar, setSelectedScholar] = useState<Scholar | null>(null);

  useEffect(() => {
    fetchScholars();
  }, []);

  const fetchScholars = async () => {
    try {
      const { data, error } = await supabase
        .from('arabic_scholars')
        .select('*')
        .order('death_year');

      if (error) throw error;
      setScholars(data || []);
    } catch (error) {
      console.error('Error fetching scholars:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScholars = scholars.filter(scholar => {
    const matchesSearch = scholar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholar.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scholar.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (selectedScholar) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={() => setSelectedScholar(null)}
          className="mb-6 px-4 py-2 bg-amber-600/20 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-600/30 transition-colors"
        >
          ← العودة للقائمة
        </button>
        
        <div className={`bg-gradient-to-br ${categoryColors[selectedScholar.category]} rounded-xl p-8 border`}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="w-32 h-32 mx-auto md:mx-0 rounded-full bg-amber-600/30 flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-amber-300" />
              </div>
              <div className="text-center md:text-right">
                <span className="inline-block px-3 py-1 bg-amber-600/20 border border-amber-500/30 rounded-full text-amber-300 text-sm">
                  {categoryNames[selectedScholar.category]}
                </span>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedScholar.name}</h2>
              <div className="flex items-center gap-2 text-amber-300 mb-4">
                <Calendar className="w-4 h-4" />
                <span>توفي {selectedScholar.death_year}</span>
              </div>
              
              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                {selectedScholar.description}
              </p>
              
              {selectedScholar.major_works.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    أهم المؤلفات
                  </h3>
                  <ul className="space-y-2">
                    {selectedScholar.major_works.map((work, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-white/70"
                      >
                        <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{work}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث عن عالم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-white/10 border border-amber-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">جميع التصنيفات</option>
          {Object.entries(categoryNames).map(([key, name]) => (
            <option key={key} value={key} className="bg-gray-800">
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Scholars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScholars.map((scholar, index) => (
          <motion.div
            key={scholar.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedScholar(scholar)}
            className={`group cursor-pointer bg-gradient-to-br ${categoryColors[scholar.category]} rounded-xl p-6 border hover:scale-105 transition-all duration-300`}
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-600/30 flex items-center justify-center mb-3">
                <User className="w-8 h-8 text-amber-300" />
              </div>
              <span className="inline-block px-2 py-1 bg-amber-600/20 border border-amber-500/30 rounded-full text-amber-300 text-xs">
                {categoryNames[scholar.category]}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 text-center group-hover:text-amber-300 transition-colors">
              {scholar.name}
            </h3>
            
            <div className="flex items-center justify-center gap-2 text-amber-300 mb-3">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">توفي {scholar.death_year}</span>
            </div>
            
            <p className="text-white/70 text-sm text-center line-clamp-3">
              {scholar.description}
            </p>
            
            <div className="mt-4 text-center">
              <button className="px-4 py-2 bg-amber-600/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm hover:bg-amber-600/30 transition-colors">
                عرض التفاصيل
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredScholars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70">لم يتم العثور على علماء مطابقين للبحث</p>
        </div>
      )}
    </div>
  );
};

export default ArabicScholars;
