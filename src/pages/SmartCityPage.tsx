import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Wind, Thermometer, Users, Zap, TreePine, Bot, Send, Loader2, Building2, Leaf, Brain, Cpu } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

// ─── City Canvas ───
interface CityParams {
  temperature: number;
  airQuality: number;
  population: number;
  solarEnergy: number;
  isNight: boolean;
}

const CityCanvas: React.FC<{ params: CityParams }> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    timeRef.current += 0.02;
    const t = timeRef.current;

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    if (params.isNight) {
      skyGrad.addColorStop(0, '#0a0e27');
      skyGrad.addColorStop(1, '#1a1a3e');
    } else {
      const heatShift = Math.min(params.temperature / 50, 1);
      skyGrad.addColorStop(0, `hsl(${210 - heatShift * 30}, 70%, ${55 + heatShift * 15}%)`);
      skyGrad.addColorStop(1, `hsl(${200 - heatShift * 40}, 60%, ${75 + heatShift * 10}%)`);
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars at night
    if (params.isNight) {
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i * 13.37) * 0.5 + 0.5) * W;
        const sy = (Math.cos(i * 7.13) * 0.5 + 0.5) * H * 0.5;
        const brightness = 0.3 + Math.sin(t + i) * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sun / Moon
    if (!params.isNight) {
      const sunY = 60 + (1 - params.solarEnergy / 100) * 40;
      const sunGlow = ctx.createRadialGradient(W * 0.8, sunY, 10, W * 0.8, sunY, 60);
      sunGlow.addColorStop(0, 'rgba(255,220,50,0.9)');
      sunGlow.addColorStop(0.5, 'rgba(255,180,30,0.3)');
      sunGlow.addColorStop(1, 'rgba(255,180,30,0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(W * 0.8 - 60, sunY - 60, 120, 120);
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(W * 0.8, sunY, 22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#e8e8f0';
      ctx.beginPath();
      ctx.arc(W * 0.15, 70, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a0e27';
      ctx.beginPath();
      ctx.arc(W * 0.15 + 6, 65, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    const groundY = H * 0.65;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    const greenness = Math.max(0, Math.min(1, (params.airQuality / 100) * (1 - params.temperature / 60)));
    groundGrad.addColorStop(0, `hsl(${100 + greenness * 40}, ${30 + greenness * 40}%, ${25 + greenness * 15}%)`);
    groundGrad.addColorStop(1, `hsl(${90 + greenness * 30}, ${20 + greenness * 30}%, ${15 + greenness * 10}%)`);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Road
    ctx.fillStyle = params.isNight ? '#1a1a2e' : '#3a3a4a';
    ctx.fillRect(0, groundY + 5, W, 30);
    // Road lines
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, groundY + 20);
    ctx.lineTo(W, groundY + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Buildings
    const buildingCount = 8 + Math.floor(params.population / 15);
    const buildingWidth = W / (buildingCount + 2);
    for (let i = 0; i < buildingCount; i++) {
      const x = (i + 1) * (W / (buildingCount + 1)) - buildingWidth / 2;
      const maxH = 80 + (params.population / 100) * 120 + Math.sin(i * 2.5) * 40;
      const bH = maxH + Math.sin(t * 0.5 + i) * 5;
      const bY = groundY - bH + 5;

      // Building body
      const heatHue = params.temperature > 35 ? 15 : params.temperature > 25 ? 30 : 210;
      const saturation = params.isNight ? 20 : 40;
      const lightness = params.isNight ? 15 + i * 2 : 35 + i * 3;
      ctx.fillStyle = `hsl(${heatHue}, ${saturation}%, ${lightness}%)`;
      ctx.fillRect(x, bY, buildingWidth - 4, bH);

      // Windows
      const winRows = Math.floor(bH / 20);
      const winCols = Math.max(2, Math.floor((buildingWidth - 8) / 12));
      for (let r = 0; r < winRows; r++) {
        for (let c = 0; c < winCols; c++) {
          const wx = x + 4 + c * ((buildingWidth - 12) / winCols);
          const wy = bY + 8 + r * 20;
          const lit = params.isNight ? Math.random() > 0.3 : Math.random() > 0.7;
          ctx.fillStyle = lit
            ? (params.isNight ? 'rgba(255,220,100,0.8)' : 'rgba(135,206,250,0.6)')
            : (params.isNight ? 'rgba(20,20,40,0.8)' : 'rgba(100,100,120,0.3)');
          ctx.fillRect(wx, wy, 8, 12);
        }
      }

      // Solar panels on top
      if (params.solarEnergy > 30 && !params.isNight) {
        ctx.fillStyle = '#1a3a5c';
        ctx.fillRect(x + 4, bY - 4, buildingWidth - 12, 4);
        ctx.fillStyle = `rgba(100,180,255,${params.solarEnergy / 200})`;
        ctx.fillRect(x + 4, bY - 4, buildingWidth - 12, 4);
      }
    }

    // Trees (more if air quality is good)
    const treeCount = Math.floor((params.airQuality / 100) * 12) + 2;
    for (let i = 0; i < treeCount; i++) {
      const tx = (i * W / treeCount) + 20 + Math.sin(i * 5) * 15;
      const ty = groundY + 38 + Math.sin(i * 3) * 5;
      const treeSize = 15 + Math.sin(t + i) * 2;
      // Trunk
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(tx - 2, ty - treeSize, 4, treeSize);
      // Canopy
      ctx.fillStyle = `hsl(${120 + params.airQuality * 0.3}, ${50 + params.airQuality * 0.3}%, ${25 + params.airQuality * 0.15}%)`;
      ctx.beginPath();
      ctx.arc(tx, ty - treeSize - 5, treeSize * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Small robots
    if (params.population > 30) {
      const robotCount = Math.floor(params.population / 25);
      for (let i = 0; i < robotCount; i++) {
        const rx = ((t * 30 + i * 120) % (W + 40)) - 20;
        const ry = groundY + 15;
        ctx.fillStyle = '#00ccff';
        ctx.fillRect(rx - 4, ry - 6, 8, 6);
        ctx.fillStyle = '#00ffcc';
        ctx.fillRect(rx - 2, ry - 8, 4, 3);
        // Antenna
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, ry - 8);
        ctx.lineTo(rx, ry - 12);
        ctx.stroke();
        ctx.fillStyle = `rgba(0,255,200,${0.5 + Math.sin(t * 3 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(rx, ry - 12, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Air quality particles
    if (params.airQuality < 50) {
      const particleCount = Math.floor((100 - params.airQuality) / 5);
      for (let i = 0; i < particleCount; i++) {
        const px = (Math.sin(t * 0.3 + i * 7) * 0.5 + 0.5) * W;
        const py = (Math.cos(t * 0.2 + i * 11) * 0.5 + 0.5) * H * 0.6;
        ctx.fillStyle = `rgba(150,120,80,${0.15 + Math.sin(t + i) * 0.05})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 + Math.sin(i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Wind effect
    if (params.airQuality > 60) {
      ctx.strokeStyle = `rgba(200,230,255,${0.1 + params.airQuality / 500})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const wy = 50 + i * 30;
        ctx.beginPath();
        ctx.moveTo((t * 40 + i * 100) % W, wy);
        ctx.quadraticCurveTo((t * 40 + i * 100 + 30) % W, wy - 5, (t * 40 + i * 100 + 60) % W, wy);
        ctx.stroke();
      }
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-[350px] md:h-[450px] rounded-2xl border border-white/10" />;
};

// ─── Main Page ───
const SmartCityPage = () => {
  const navigate = useNavigate();
  const [temperature, setTemperature] = useState(25);
  const [airQuality, setAirQuality] = useState(75);
  const [population, setPopulation] = useState(50);
  const [solarEnergy, setSolarEnergy] = useState(70);
  const [isNight, setIsNight] = useState(false);
  const [scenario, setScenario] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Computed stats
  const energyConsumption = Math.round(30 + population * 0.5 + (temperature > 30 ? (temperature - 30) * 2 : 0) - solarEnergy * 0.3);
  const comfortIndex = Math.round(Math.max(0, Math.min(100, airQuality * 0.4 + (100 - Math.abs(temperature - 22) * 3) * 0.3 + (100 - population) * 0.3)));
  const sustainabilityScore = Math.round(Math.max(0, Math.min(100, solarEnergy * 0.4 + airQuality * 0.3 + (100 - energyConsumption) * 0.3)));

  const handleAIAnalysis = async () => {
    if (!scenario.trim()) return;
    setIsLoading(true);
    setAiResponse('');
    try {
      const { data, error } = await supabase.functions.invoke('smart-city-ai', {
        body: { scenario, temperature, airQuality, population, solarEnergy, timeOfDay: isNight ? 'night' : 'day' }
      });
      if (error) throw error;
      setAiResponse(data.response || 'لم يتم الحصول على رد');
    } catch (err: any) {
      console.error(err);
      setAiResponse('حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const concepts = [
    { icon: Brain, title: 'الذكاء الاصطناعي التوليدي', desc: 'يحلل بيانات السكان والبيئة ويولّد حلول تصميمية فورية للمباني والبنية التحتية', color: 'text-purple-400' },
    { icon: Cpu, title: 'المواد الذكية', desc: 'واجهات مبانٍ قابلة للتشكل والطي تتكيف مع الطقس والنشاط البشري', color: 'text-cyan-400' },
    { icon: Bot, title: 'الروبوتات المدمجة', desc: 'روبوتات صغيرة تبني وتعدل المباني تلقائياً وتركب أنظمة خضراء', color: 'text-green-400' },
    { icon: Leaf, title: 'الاستدامة البيئية', desc: 'تحكم ذكي بالطاقة والمياه والهواء لتقليل الهدر وتحسين جودة الحياة', color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#111633] to-[#0a0e27] text-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0e27]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5" />
            <span>العودة</span>
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            🏙️ المدينة الحية الذكية
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            المدينة الحية الذكية
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            مدينة تتصرف مثل كائن حي ذكي — المباني تتغير شكلها حسب البيئة والسكان
          </p>
        </motion.div>

        {/* Canvas + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CityCanvas params={{ temperature, airQuality, population, solarEnergy, isNight }} />
          </div>

          {/* Controls */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                لوحة التحكم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><Thermometer className="w-4 h-4 text-red-400" /> الحرارة</span>
                  <span className="text-red-300 font-mono">{temperature}°C</span>
                </div>
                <Slider value={[temperature]} onValueChange={(v) => setTemperature(v[0])} min={-10} max={55} step={1} className="[&_[role=slider]]:bg-red-400" />
              </div>

              {/* Air Quality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><Wind className="w-4 h-4 text-green-400" /> جودة الهواء</span>
                  <span className="text-green-300 font-mono">{airQuality}%</span>
                </div>
                <Slider value={[airQuality]} onValueChange={(v) => setAirQuality(v[0])} min={0} max={100} step={1} className="[&_[role=slider]]:bg-green-400" />
              </div>

              {/* Population */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-400" /> كثافة السكان</span>
                  <span className="text-blue-300 font-mono">{population}%</span>
                </div>
                <Slider value={[population]} onValueChange={(v) => setPopulation(v[0])} min={0} max={100} step={1} className="[&_[role=slider]]:bg-blue-400" />
              </div>

              {/* Solar Energy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-yellow-400" /> الطاقة الشمسية</span>
                  <span className="text-yellow-300 font-mono">{solarEnergy}%</span>
                </div>
                <Slider value={[solarEnergy]} onValueChange={(v) => setSolarEnergy(v[0])} min={0} max={100} step={1} className="[&_[role=slider]]:bg-yellow-400" />
              </div>

              {/* Day/Night Toggle */}
              <button
                onClick={() => setIsNight(!isNight)}
                className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isNight ? 'bg-indigo-900/50 border border-indigo-500/30 text-indigo-300' : 'bg-amber-900/30 border border-amber-500/30 text-amber-300'
                }`}
              >
                {isNight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                {isNight ? 'الوضع الليلي' : 'الوضع النهاري'}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 3 }}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5 text-center">
            <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-white/60 text-sm">استهلاك الطاقة</p>
            <p className="text-3xl font-bold text-orange-300">{energyConsumption}<span className="text-sm text-white/40"> MW</span></p>
          </motion.div>
          <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
            <TreePine className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white/60 text-sm">مؤشر الراحة</p>
            <p className="text-3xl font-bold text-green-300">{comfortIndex}<span className="text-sm text-white/40"> %</span></p>
          </motion.div>
          <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5 text-center">
            <Leaf className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-white/60 text-sm">الاستدامة</p>
            <p className="text-3xl font-bold text-cyan-300">{sustainabilityScore}<span className="text-sm text-white/40"> %</span></p>
          </motion.div>
        </div>

        {/* AI Section */}
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="w-6 h-6 text-purple-400" />
              تحليل الذكاء الاصطناعي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/60 text-sm">
              صف سيناريو للمدينة وسيقوم الذكاء الاصطناعي بتحليله واقتراح حلول تصميمية مبتكرة
            </p>
            <Textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="مثال: ارتفاع درجة الحرارة إلى 45 مع ازدحام سكاني كبير وانخفاض جودة الهواء..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]"
              dir="rtl"
            />
            <Button
              onClick={handleAIAnalysis}
              disabled={isLoading || !scenario.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isLoading ? 'جاري التحليل...' : 'تحليل السيناريو'}
            </Button>

            {aiResponse && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Educational Concepts */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
            المفاهيم الأساسية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concepts.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-3">
                  <c.icon className={`w-8 h-8 ${c.color} shrink-0 mt-1`} />
                  <div>
                    <h4 className="font-bold text-white mb-1">{c.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCityPage;
