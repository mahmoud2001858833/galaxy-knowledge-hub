import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Music, BookOpen, Brain, Upload, Send } from "lucide-react";

const ArabicProsody = () => {
  const [activeTab, setActiveTab] = useState("identify");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [aiQuestion, setAiQuestion] = useState("");

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error("الرجاء إدخال النص الشعري");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('arabic-prosody-analyzer', {
        body: { text: inputText, mode: 'identify' }
      });

      if (error) throw error;
      setResult(data.reply);
    } catch (error) {
      console.error('Error:', error);
      toast.error("حدث خطأ أثناء التحليل");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageAnalyze = async () => {
    if (!imageFile) {
      toast.error("الرجاء تحميل صورة");
      return;
    }

    setIsLoading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `prosody-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('grammar-files')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('grammar-files')
        .getPublicUrl(filePath);

      const { data, error } = await supabase.functions.invoke('arabic-prosody-ocr', {
        body: { imageUrl: publicUrl }
      });

      if (error) throw error;
      setResult(data.reply);
    } catch (error) {
      console.error('Error:', error);
      toast.error("حدث خطأ أثناء تحليل الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiChat = async () => {
    if (!aiQuestion.trim()) {
      toast.error("الرجاء إدخال سؤالك");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('arabic-prosody-analyzer', {
        body: { text: aiQuestion, mode: 'ai_chat' }
      });

      if (error) throw error;
      setResult(data.reply);
    } catch (error) {
      console.error('Error:', error);
      toast.error("حدث خطأ أثناء معالجة السؤال");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-block mb-6"
          >
            <Music className="w-20 h-20 text-cyan-400 mx-auto drop-shadow-[0_0_25px_rgba(34,211,238,0.5)]" />
          </motion.div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            علم العروض
          </h1>
          <p className="text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            منصة ذكية لتحليل البحور الشعرية واستكشاف إيقاع الشعر العربي
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl mb-8">
            <TabsTrigger 
              value="identify"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 text-white rounded-xl py-4 text-lg font-bold transition-all duration-300"
            >
              <BookOpen className="ml-2" />
              تحديد البحور
            </TabsTrigger>
            <TabsTrigger 
              value="ai"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 text-white rounded-xl py-4 text-lg font-bold transition-all duration-300"
            >
              <Brain className="ml-2" />
              ذكاء اصطناعي
            </TabsTrigger>
            <TabsTrigger 
              value="article"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 text-white rounded-xl py-4 text-lg font-bold transition-all duration-300"
            >
              <BookOpen className="ml-2" />
              مقالة العروض
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identify">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                    <Send className="ml-3" />
                    إدخال يدوي
                  </h3>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="أدخل الأبيات الشعرية هنا..."
                    className="min-h-[200px] bg-white/5 border-white/20 text-white text-lg mb-4 rounded-2xl"
                  />
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6 text-lg rounded-2xl"
                  >
                    {isLoading ? <Loader2 className="ml-2 animate-spin" /> : <Music className="ml-2" />}
                    تحليل البحر
                  </Button>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-pink-400 mb-6 flex items-center">
                    <Upload className="ml-3" />
                    رفع صورة
                  </h3>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-white/5 border-white/20 text-white rounded-2xl"
                    />
                    {imagePreview && (
                      <div className="relative rounded-2xl overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      </div>
                    )}
                    <Button
                      onClick={handleImageAnalyze}
                      disabled={isLoading || !imageFile}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-6 text-lg rounded-2xl"
                    >
                      {isLoading ? <Loader2 className="ml-2 animate-spin" /> : <Music className="ml-2" />}
                      تحليل من الصورة
                    </Button>
                  </div>
                </div>
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl"
                >
                  <h3 className="text-3xl font-bold text-cyan-400 mb-6">نتيجة التحليل</h3>
                  <div className="prose prose-invert max-w-none text-white/90 text-lg leading-relaxed whitespace-pre-wrap">
                    {result}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="ai">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
            >
              <h3 className="text-3xl font-bold text-purple-400 mb-6 flex items-center">
                <Brain className="ml-3" />
                مساعد العروض الذكي
              </h3>
              <Textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="اسأل أي سؤال عن علم العروض..."
                className="min-h-[150px] bg-white/5 border-white/20 text-white text-lg mb-4 rounded-2xl"
              />
              <Button
                onClick={handleAiChat}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 text-lg rounded-2xl"
              >
                {isLoading ? <Loader2 className="ml-2 animate-spin" /> : <Send className="ml-2" />}
                إرسال السؤال
              </Button>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/30"
                >
                  <h4 className="text-2xl font-bold text-purple-400 mb-4">الإجابة</h4>
                  <div className="prose prose-invert max-w-none text-white/90 text-lg leading-relaxed whitespace-pre-wrap">
                    {result}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="article">
            <ProsodyArticle />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

const ProsodyArticle = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/30 shadow-2xl"
    >
      <h2 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
        العروض العربي
      </h2>
      
      <div className="space-y-12 text-white/90 text-lg leading-relaxed">
        <section>
          <h3 className="text-3xl font-bold text-orange-400 mb-6 border-r-4 border-orange-400 pr-4">المقدمة</h3>
          <p className="mb-4">
            يُعدّ علم العَروض من أعظم إنجازات الفكر العربي القديم، إذ مثّل لحظة انتقال من الممارسة الشفوية التلقائية للشعر إلى العلم المنهجي القائم على القياس والتحليل.
          </p>
          <p>
            فالشعر العربي، قبل ظهور العروض، كان محفوظًا ومتداولًا بالإنشاد لا بالكتابة، وتقوم بنيته على الحسّ السمعي والإيقاع الداخلي للغة.
          </p>
        </section>

        <section className="bg-white/5 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 border-r-4 border-cyan-400 pr-4">
            أولًا: الشعر العربي قبل التدوين — الإيقاع الشفوي وأصول البيت
          </h3>
          <p className="mb-4">
            قبل الإسلام، كان الشعر هو أداة العرب في الحفظ والتعبير، ووسيلتهم في توثيق أخبارهم ومفاخرهم وأحزانهم. وكان الإنشاد يتم بطريقةٍ إيقاعيةٍ متناسقة تُسَهِّل على السامع حفظ الأبيات.
          </p>
          <p>
            البيت الشعري في تلك المرحلة كان يُنظر إليه بوصفه بناءً صوتيًا متوازنًا؛ وكلمة «بيت» لم تكن مصادفة لغوية، بل جاءت كاستعارة ثقافية من معنى المسكن، لأن البيت الشعري يضمّ المعنى كما تضمّ الخيمة أهلها.
          </p>
        </section>

        <section>
          <h3 className="text-3xl font-bold text-purple-400 mb-6 border-r-4 border-purple-400 pr-4">
            ثانيًا: من الملاحظة إلى الاستنباط — البدايات المنهجية للعروض
          </h3>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-purple-300 mb-3">1. ملاحظة الأنماط الصوتية</h4>
              <p>
                عندما بدأ الخليل بدراسة الشعر العربي، لم يكن أمامه مراجع نظرية، بل شعر متراكم ومتداول شفهيًا. قام بجمع أشعار العرب ثم بدأ يُقطّع الأبيات بحسب ما يسمعه من حركات وسكنات.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-purple-300 mb-3">2. تحليل الأنماط المتكرّرة</h4>
              <p>
                أثناء تتبّعه للشعر، وجد الخليل أن هناك تتابعات صوتية تتكرر بانتظام في كل الأبيات، وأن هذا التكرار يُحدث إيقاعًا موسيقيًا مستحبًّا.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-pink-400 mb-6 border-r-4 border-pink-400 pr-4">
            ثالثًا: المنطلق الفلسفي في استنباط العروض
          </h3>
          <p className="mb-4">
            من الناحية الفلسفية، يُمكن القول إن العَروض يعكس نقلةً معرفية من الحسّ الموسيقي الفطري إلى الوعي التحليلي المجرد.
          </p>
          <p className="font-bold text-2xl text-pink-300 text-center my-6">
            العَروض إذًا هو فيزياء الإيقاع العربي
          </p>
        </section>

        <section>
          <h3 className="text-3xl font-bold text-orange-400 mb-6 border-r-4 border-orange-400 pr-4">الخاتمة</h3>
          <p className="mb-4">
            يتضح من الدراسة أن العَروض العربي وُلد من داخل الممارسة اللغوية ولم يُستورد من ثقافةٍ أخرى. فهو ثمرة عقلٍ عربيٍّ لاحظ النغمة المتكرّرة في الكلام، ثم حولها إلى علمٍ مضبوطٍ بالقوانين.
          </p>
          <p>
            لقد بنى الخليل بن أحمد علمه على أسسٍ لغوية (متحرك وساكن)، وعقلانية (الاستقراء والمقارنة)، ووظائف اجتماعية (الحفظ والأداء).
          </p>
        </section>

        <section className="bg-white/10 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 border-r-4 border-cyan-400 pr-4">المراجع الأكاديمية</h3>
          <ul className="space-y-3 text-white/80">
            <li>1. الخليل بن أحمد الفراهيدي – كتاب العَروض (تحقيق عبدالعزيز الميمني، القاهرة: دار المعارف، 1957)</li>
            <li>2. ابن جني – الخصائص (بيروت: دار الهلال، 1990)</li>
            <li>3. عبدالقاهر الجرجاني – دلائل الإعجاز (تحقيق محمود شاكر، القاهرة: مكتبة الخانجي، 1992)</li>
            <li>4. Ibn Ahmad al-Khalīl — Encyclopaedia Britannica, entry: "al-Khalīl ibn Aḥmad al-Farāhīdī"</li>
            <li>5. Brill's Encyclopaedia of Islam — entry: "Prosody, Arabic"</li>
            <li>6. Duraković, Esad. "Meters of Arabic Poetry in the Semiotics of Space." Arabica, Brill, 2004</li>
            <li>7. Elamrani, Fatima et al. "Computational Analysis of Arabic Prosody." Frontiers in Artificial Intelligence, 2025</li>
            <li>8. Al-Khatib, M. The Phonological Structure of Arabic Metrics, Cambridge University Press, 2020</li>
          </ul>
        </section>
      </div>
    </motion.div>
  );
};

export default ArabicProsody;
