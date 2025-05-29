
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Search, BookOpen, User, Calendar, MapPin, Award, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ArabicPoet {
  id: string;
  name: string;
  full_name: string;
  birth_year: string;
  death_year: string;
  era: string;
  region: string;
  biography: string;
  achievements: string;
  famous_works: string[];
  image_url: string;
}

interface Poem {
  id: string;
  title: string;
  content: string;
  meter: string;
  theme: string;
  occasion: string;
}

const ArabicPoets = () => {
  const [poets, setPoets] = useState<ArabicPoet[]>([]);
  const [filteredPoets, setFilteredPoets] = useState<ArabicPoet[]>([]);
  const [selectedPoet, setSelectedPoet] = useState<ArabicPoet | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [poemsLoading, setPoemsLoading] = useState(false);
  const { toast } = useToast();

  const eras = [
    { value: 'all', label: 'جميع العصور' },
    { value: 'جاهلي', label: 'العصر الجاهلي' },
    { value: 'إسلامي', label: 'العصر الإسلامي' },
    { value: 'أموي', label: 'العصر الأموي' },
    { value: 'عباسي', label: 'العصر العباسي' },
    { value: 'أندلسي', label: 'العصر الأندلسي' },
    { value: 'حديث', label: 'العصر الحديث' },
    { value: 'معاصر', label: 'العصر المعاصر' }
  ];

  useEffect(() => {
    fetchPoets();
  }, []);

  useEffect(() => {
    filterPoets();
  }, [poets, searchQuery, selectedEra]);

  const fetchPoets = async () => {
    try {
      const { data, error } = await supabase
        .from('arabic_poets')
        .select('*')
        .order('name');

      if (error) throw error;
      setPoets(data || []);
    } catch (error) {
      console.error('Error fetching poets:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل بيانات الشعراء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPoems = async (poetId: string) => {
    setPoemsLoading(true);
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .eq('poet_id', poetId)
        .order('title');

      if (error) throw error;
      setPoems(data || []);
    } catch (error) {
      console.error('Error fetching poems:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل قصائد الشاعر",
        variant: "destructive",
      });
    } finally {
      setPoemsLoading(false);
    }
  };

  const filterPoets = () => {
    let filtered = poets;

    if (searchQuery) {
      filtered = filtered.filter(poet =>
        poet.name.includes(searchQuery) ||
        poet.full_name?.includes(searchQuery) ||
        poet.biography.includes(searchQuery)
      );
    }

    if (selectedEra !== 'all') {
      filtered = filtered.filter(poet => poet.era === selectedEra);
    }

    setFilteredPoets(filtered);
  };

  const handlePoetClick = (poet: ArabicPoet) => {
    setSelectedPoet(poet);
    fetchPoems(poet.id);
  };

  const getEraColor = (era: string) => {
    const colors: Record<string, string> = {
      'جاهلي': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'إسلامي': 'bg-green-500/20 text-green-300 border-green-500/30',
      'أموي': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'عباسي': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'أندلسي': 'bg-red-500/20 text-red-300 border-red-500/30',
      'حديث': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'معاصر': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    };
    return colors[era] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white/5 backdrop-blur-sm border-amber-500/20">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
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
        <h2 className="text-3xl md:text-4xl font-bold text-amber-300 mb-4">
          شعراء العرب عبر التاريخ
        </h2>
        <p className="text-white/70 text-lg">
          موسوعة شاملة لأعلام الشعر العربي من الجاهلية إلى العصر الحديث
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
          <Input
            placeholder="ابحث عن شاعر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/10 border-amber-500/30 text-white placeholder:text-white/50 pr-10"
          />
        </div>
        <select
          value={selectedEra}
          onChange={(e) => setSelectedEra(e.target.value)}
          className="bg-white/10 border border-amber-500/30 rounded-md px-4 py-2 text-white"
        >
          {eras.map((era) => (
            <option key={era.value} value={era.value} className="bg-amber-900">
              {era.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-amber-300">
          عدد الشعراء: <span className="font-bold">{filteredPoets.length}</span>
        </p>
      </div>

      {/* Poets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPoets.map((poet, index) => (
          <motion.div
            key={poet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="bg-white/5 backdrop-blur-sm border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 cursor-pointer group h-full"
              onClick={() => handlePoetClick(poet)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-amber-300 text-xl mb-2 group-hover:text-amber-200 transition-colors">
                      {poet.name}
                    </CardTitle>
                    {poet.full_name && poet.full_name !== poet.name && (
                      <p className="text-white/60 text-sm mb-2">{poet.full_name}</p>
                    )}
                    <Badge className={`${getEraColor(poet.era)} text-xs`}>
                      {poet.era}
                    </Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{poet.birth_year} - {poet.death_year}</span>
                  </div>
                  {poet.region && (
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{poet.region}</span>
                    </div>
                  )}
                  <p className="text-white/70 text-sm line-clamp-3">
                    {poet.biography}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPoets.length === 0 && (
        <div className="text-center py-16">
          <User className="w-16 h-16 text-amber-300 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-amber-200 mb-2">لا توجد نتائج</h3>
          <p className="text-white/60">لم يتم العثور على شعراء مطابقين لبحثك</p>
        </div>
      )}

      {/* Poet Details Modal */}
      <Dialog open={!!selectedPoet} onOpenChange={() => setSelectedPoet(null)}>
        {selectedPoet && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-amber-950/95 border-amber-500/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-amber-300 text-right">
                {selectedPoet.name}
              </DialogTitle>
              {selectedPoet.full_name && selectedPoet.full_name !== selectedPoet.name && (
                <DialogDescription className="text-white/70 text-right text-lg">
                  {selectedPoet.full_name}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span className="text-white/80">
                      {selectedPoet.birth_year} - {selectedPoet.death_year}
                    </span>
                  </div>
                  {selectedPoet.region && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-400" />
                      <span className="text-white/80">{selectedPoet.region}</span>
                    </div>
                  )}
                  <Badge className={`${getEraColor(selectedPoet.era)} w-fit`}>
                    {selectedPoet.era}
                  </Badge>
                </div>
              </div>

              {/* Biography */}
              <div>
                <h3 className="text-xl font-bold text-amber-300 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  نبذة عن الشاعر
                </h3>
                <p className="text-white/80 leading-relaxed">{selectedPoet.biography}</p>
              </div>

              {/* Achievements */}
              {selectedPoet.achievements && (
                <div>
                  <h3 className="text-xl font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    الإنجازات والمميزات
                  </h3>
                  <p className="text-white/80 leading-relaxed">{selectedPoet.achievements}</p>
                </div>
              )}

              {/* Famous Works */}
              {selectedPoet.famous_works && selectedPoet.famous_works.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    من أشهر الأعمال
                  </h3>
                  <div className="space-y-2">
                    {selectedPoet.famous_works.map((work, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/80 italic">"{work}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Poems */}
              <div>
                <h3 className="text-xl font-bold text-amber-300 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  القصائد والأشعار
                </h3>
                
                {poemsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : poems.length > 0 ? (
                  <div className="space-y-4">
                    {poems.map((poem) => (
                      <div key={poem.id} className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-bold text-amber-200 mb-2">{poem.title}</h4>
                        <div className="flex gap-2 mb-3">
                          {poem.meter && <Badge variant="outline" className="text-xs">{poem.meter}</Badge>}
                          {poem.theme && <Badge variant="outline" className="text-xs">{poem.theme}</Badge>}
                        </div>
                        <div className="text-white/80 whitespace-pre-line font-serif leading-relaxed">
                          {poem.content}
                        </div>
                        {poem.occasion && (
                          <p className="text-white/60 text-sm mt-3 italic">
                            المناسبة: {poem.occasion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-8">
                    لا توجد قصائد مسجلة لهذا الشاعر حالياً
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ArabicPoets;
