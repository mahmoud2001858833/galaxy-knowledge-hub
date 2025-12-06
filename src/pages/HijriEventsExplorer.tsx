import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, ArrowRight, Calendar, Search, ImageIcon, Loader2, Sparkles, Download, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EventData {
  title: string;
  hijriYear: string;
  gregorianYear: string;
  description: string;
  significance: string;
  details: string[];
}

const HijriEventsExplorer = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const [yearInput, setYearInput] = useState('');
  const [eventInput, setEventInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [eventDetails, setEventDetails] = useState<EventData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('year');

  const searchByYear = async () => {
    if (!yearInput.trim()) {
      toast.error('يرجى إدخال السنة الهجرية');
      return;
    }

    setLoading(true);
    setEvents([]);

    try {
      const { data, error } = await supabase.functions.invoke('islamic-hijri-events', {
        body: { 
          type: 'searchByYear',
          year: yearInput.trim()
        }
      });

      if (error) throw error;

      if (data.events && data.events.length > 0) {
        setEvents(data.events);
      } else {
        toast.info('لم يتم العثور على أحداث في هذه السنة');
      }
    } catch (error) {
      console.error('Error searching by year:', error);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  const searchByEvent = async () => {
    if (!eventInput.trim()) {
      toast.error('يرجى إدخال اسم الحدث');
      return;
    }

    setLoading(true);
    setEventDetails(null);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('islamic-hijri-events', {
        body: { 
          type: 'searchByEvent',
          eventName: eventInput.trim()
        }
      });

      if (error) throw error;

      if (data.event) {
        setEventDetails(data.event);
      } else {
        toast.info('لم يتم العثور على معلومات عن هذا الحدث');
      }
    } catch (error) {
      console.error('Error searching by event:', error);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!eventDetails) return;

    setImageLoading(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('islamic-hijri-events', {
        body: { 
          type: 'generateImage',
          eventDescription: eventDetails.description,
          eventTitle: eventDetails.title
        }
      });

      if (error) throw error;

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success('تم إنشاء الصورة بنجاح');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('حدث خطأ أثناء إنشاء الصورة');
    } finally {
      setImageLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${eventDetails?.title || 'islamic-event'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b from-emerald-950/60 to-slate-950`} dir={dir}>
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-10"
          >
            <button
              onClick={() => navigate('/islamic-education')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              {t.common.back}
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <Calendar className="w-10 h-10 text-emerald-400" />
                <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-white to-amber-300">
                السنوات الهجرية وأحداثها
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                استكشف الأحداث التاريخية الإسلامية العظيمة وأنشئ صوراً توضيحية
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-slate-800/50 border border-emerald-500/30 rounded-xl p-1 mb-8">
              <TabsTrigger 
                value="year" 
                className="data-[state=active]:bg-emerald-600/50 data-[state=active]:text-white rounded-lg"
              >
                <Calendar className="w-4 h-4 ml-2" />
                البحث بالسنة
              </TabsTrigger>
              <TabsTrigger 
                value="event"
                className="data-[state=active]:bg-emerald-600/50 data-[state=active]:text-white rounded-lg"
              >
                <Search className="w-4 h-4 ml-2" />
                البحث بالحدث
              </TabsTrigger>
            </TabsList>

            {/* Search by Year */}
            <TabsContent value="year">
              <Card className="bg-slate-900/60 border-emerald-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-emerald-300 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    أدخل السنة الهجرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Input
                      type="number"
                      placeholder="مثال: 1، 2، 10، 100..."
                      value={yearInput}
                      onChange={(e) => setYearInput(e.target.value)}
                      className="flex-1 bg-slate-800/50 border-emerald-500/30 text-white placeholder:text-white/50"
                      onKeyPress={(e) => e.key === 'Enter' && searchByYear()}
                    />
                    <Button 
                      onClick={searchByYear}
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      <span className="mr-2">بحث</span>
                    </Button>
                  </div>

                  {/* Events List */}
                  <AnimatePresence>
                    {events.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-white mb-4">
                          الأحداث في السنة {yearInput} هـ:
                        </h3>
                        {events.map((event, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-emerald-600/30 rounded-lg">
                                <BookOpen className="w-5 h-5 text-emerald-300" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white mb-2">{event.title}</h4>
                                <p className="text-white/70 text-sm mb-2">{event.description}</p>
                                {event.significance && (
                                  <p className="text-amber-300/80 text-sm">
                                    <span className="font-semibold">الأهمية:</span> {event.significance}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Search by Event */}
            <TabsContent value="event">
              <Card className="bg-slate-900/60 border-amber-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-300 flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    أدخل اسم الحدث
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Input
                      type="text"
                      placeholder="مثال: غزوة بدر، فتح مكة، الهجرة..."
                      value={eventInput}
                      onChange={(e) => setEventInput(e.target.value)}
                      className="flex-1 bg-slate-800/50 border-amber-500/30 text-white placeholder:text-white/50"
                      onKeyPress={(e) => e.key === 'Enter' && searchByEvent()}
                    />
                    <Button 
                      onClick={searchByEvent}
                      disabled={loading}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      <span className="mr-2">بحث</span>
                    </Button>
                  </div>

                  {/* Event Details */}
                  <AnimatePresence>
                    {eventDetails && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-amber-900/20 rounded-2xl border border-amber-500/30">
                          <h3 className="text-2xl font-bold text-white mb-2">{eventDetails.title}</h3>
                          
                          <div className="flex flex-wrap gap-4 mb-4">
                            <span className="px-3 py-1 bg-emerald-600/30 rounded-full text-emerald-300 text-sm">
                              📅 {eventDetails.hijriYear} هـ
                            </span>
                            <span className="px-3 py-1 bg-blue-600/30 rounded-full text-blue-300 text-sm">
                              🌍 {eventDetails.gregorianYear} م
                            </span>
                          </div>
                          
                          <p className="text-white/80 text-lg leading-relaxed mb-4">
                            {eventDetails.description}
                          </p>
                          
                          {eventDetails.significance && (
                            <div className="p-4 bg-amber-600/20 rounded-xl border border-amber-500/30 mb-4">
                              <h4 className="text-amber-300 font-semibold mb-2">✨ الأهمية التاريخية:</h4>
                              <p className="text-white/80">{eventDetails.significance}</p>
                            </div>
                          )}
                          
                          {eventDetails.details && eventDetails.details.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-emerald-300 font-semibold">📖 تفاصيل إضافية:</h4>
                              <ul className="space-y-2">
                                {eventDetails.details.map((detail, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-white/70">
                                    <span className="text-emerald-400 mt-1">•</span>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Image Generation */}
                        <div className="p-6 bg-slate-800/50 rounded-2xl border border-purple-500/30">
                          <h4 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            إنشاء صورة توضيحية
                          </h4>
                          
                          <Button
                            onClick={generateImage}
                            disabled={imageLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
                          >
                            {imageLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                جاري إنشاء الصورة...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 ml-2" />
                                إنشاء صورة عن هذا الحدث
                              </>
                            )}
                          </Button>

                          {generatedImage && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-4"
                            >
                              <img 
                                src={generatedImage} 
                                alt={eventDetails.title}
                                className="w-full rounded-xl border border-purple-500/30"
                              />
                              <Button
                                onClick={downloadImage}
                                variant="outline"
                                className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-600/20"
                              >
                                <Download className="w-4 h-4 ml-2" />
                                تحميل الصورة
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HijriEventsExplorer;
