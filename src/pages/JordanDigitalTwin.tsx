import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GJUFooter from "@/components/gju/GJUFooter";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Car,
  Zap,
  Droplet,
  Wind,
  Sparkles,
  TrendingUp,
  Globe,
  Users,
  Lightbulb,
  Activity,
} from "lucide-react";

type CityData = {
  key?: string;
  name: string;
  population: number;
  area_km2: number;
  traffic: { congestion: number; avgSpeed: number; vehicles: number };
  energy: { consumption_mw: number; renewable_pct: number; peakHours: string };
  water: { dailyConsumption_m3: number; lossPct: number; sources: string };
  air: { aqi: number; pm25: number; mainPollutant: string };
  coords: [number, number];
};

type Insights = {
  analysis: string;
  trafficInsight: string;
  energyInsight: string;
  waterInsight: string;
  airQualityInsight: string;
  recommendations: Array<{
    title: string;
    impact: string;
    category: string;
    description: string;
    estimatedCost: string;
    timeline: string;
  }>;
  predictions: { year2030: string; year2030WithChanges: string };
  comparison: string;
};

const cityKeys = [
  { key: "amman", label: "عمّان" },
  { key: "zarqa", label: "الزرقاء" },
  { key: "irbid", label: "إربد" },
  { key: "aqaba", label: "العقبة" },
  { key: "salt", label: "السلط" },
  { key: "mafraq", label: "المفرق" },
  { key: "karak", label: "الكرك" },
  { key: "maan", label: "معان" },
];

const aqiColor = (aqi: number) => {
  if (aqi <= 50) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (aqi <= 100) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  if (aqi <= 150) return "text-orange-400 bg-orange-500/10 border-orange-500/30";
  return "text-rose-400 bg-rose-500/10 border-rose-500/30";
};

const congestionColor = (c: number) => {
  if (c < 40) return "text-emerald-400";
  if (c < 65) return "text-amber-400";
  return "text-rose-400";
};

const JordanDigitalTwin: React.FC = () => {
  const [allCities, setAllCities] = useState<CityData[]>([]);
  const [selected, setSelected] = useState<string>("amman");
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingCity, setLoadingCity] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "jordan-digital-twin",
          { body: { action: "list" } }
        );
        if (error) throw error;
        setAllCities((data as any).cities || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingCity(true);
      setInsights(null);
      try {
        const { data, error } = await supabase.functions.invoke(
          "jordan-digital-twin",
          { body: { city: selected } }
        );
        if (error) throw error;
        const d = data as any;
        setCityData(d.cityData);
        if (d.insights) setInsights(d.insights);
        else if (d.warning) {
          toast({
            title: "البيانات الحية فقط",
            description: d.warning,
          });
        }
      } catch (e: any) {
        toast({
          title: "فشل التحميل",
          description: e?.message || "حاول لاحقاً",
          variant: "destructive",
        });
      } finally {
        setLoadingCity(false);
      }
    })();
  }, [selected, toast]);

  return (
    <div className="min-h-screen bg-[#04020e] text-white relative overflow-hidden" dir="rtl">
      <Helmet>
        <title>التوأم الرقمي للأردن | مستقبل التكنولوجيا</title>
        <meta
          name="description"
          content="منصة ذكية لمراقبة بيانات المدن الأردنية الحية: المرور، الطاقة، المياه، جودة الهواء، مع توصيات AI."
        />
      </Helmet>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/gju-competition">
            <Button variant="ghost" className="text-white/80 hover:text-white">
              <ArrowLeft className="ml-2 h-4 w-4" />
              مستقبل التكنولوجيا
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
              <Globe className="h-5 w-5" />
            </div>
            <span className="font-bold">Digital Twin Jordan</span>
          </div>
        </div>
      </header>

      <section className="relative z-10 pt-12 pb-8 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6"
          >
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-300">بيانات حية + تحليل ذكي</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent leading-tight"
          >
            التوأم الرقمي للأردن
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/70 max-w-2xl mx-auto"
          >
            تجربة تفاعلية لمراقبة مؤشرات المدن الأردنية الحية واقتراح حلول ذكية مبنية على الذكاء الاصطناعي.
          </motion.p>
        </div>
      </section>

      {/* Cities map grid */}
      <section className="relative z-10 px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-cyan-300">
              <MapPin className="h-5 w-5" />
              <h3 className="font-bold">اختر مدينة</h3>
            </div>

            {loadingList ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {cityKeys.map(({ key, label }) => {
                  const c = allCities.find((x) => x.key === key);
                  const active = selected === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(key)}
                      className={`relative p-3 rounded-xl border transition-all text-center ${
                        active
                          ? "bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border-emerald-400 scale-105"
                          : "bg-black/20 border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="font-bold text-sm">{label}</div>
                      {c && (
                        <div className="text-xs text-white/60 mt-1">
                          {(c.population / 1_000_000).toFixed(1)}M
                        </div>
                      )}
                      {c && (
                        <span
                          className={`mt-2 inline-block w-2 h-2 rounded-full ${
                            c.air.aqi <= 50
                              ? "bg-emerald-400"
                              : c.air.aqi <= 100
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          } animate-pulse`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* City data + insights */}
      <AnimatePresence mode="wait">
        {loadingCity && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center py-20 gap-3"
          >
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="text-white/70">جارٍ تحليل البيانات بالذكاء الاصطناعي...</p>
          </motion.div>
        )}

        {!loadingCity && cityData && (
          <motion.section
            key={selected}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 px-4 pb-20"
          >
            <div className="container mx-auto max-w-6xl space-y-6">
              {/* City header */}
              <Card className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-emerald-500/30 p-8 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                      {cityData.name}
                    </h2>
                    <div className="flex flex-wrap gap-3 text-sm text-white/70">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {cityData.population.toLocaleString("ar")} نسمة
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" /> {cityData.area_km2.toLocaleString("ar")} كم²
                      </span>
                    </div>
                  </div>
                  <Badge className={`px-4 py-2 text-base ${aqiColor(cityData.air.aqi)}`}>
                    AQI: {cityData.air.aqi}
                  </Badge>
                </div>
              </Card>

              {/* Live metrics */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={Car}
                  label="الازدحام المروري"
                  value={`${cityData.traffic.congestion}%`}
                  sub={`متوسط السرعة: ${cityData.traffic.avgSpeed} كم/س`}
                  valueClass={congestionColor(cityData.traffic.congestion)}
                  gradient="from-orange-500/20 to-red-500/20 border-orange-500/30"
                />
                <MetricCard
                  icon={Zap}
                  label="استهلاك الطاقة"
                  value={`${cityData.energy.consumption_mw} MW`}
                  sub={`متجدد: ${cityData.energy.renewable_pct}%`}
                  valueClass="text-amber-300"
                  gradient="from-amber-500/20 to-yellow-500/20 border-amber-500/30"
                />
                <MetricCard
                  icon={Droplet}
                  label="استهلاك المياه"
                  value={`${(cityData.water.dailyConsumption_m3 / 1000).toFixed(0)}K m³`}
                  sub={`فاقد: ${cityData.water.lossPct}%`}
                  valueClass="text-cyan-300"
                  gradient="from-cyan-500/20 to-blue-500/20 border-cyan-500/30"
                />
                <MetricCard
                  icon={Wind}
                  label="جودة الهواء"
                  value={`PM2.5: ${cityData.air.pm25}`}
                  sub={cityData.air.mainPollutant}
                  valueClass={cityData.air.pm25 < 25 ? "text-emerald-300" : "text-rose-300"}
                  gradient="from-violet-500/20 to-purple-500/20 border-violet-500/30"
                />
              </div>

              {/* Insights */}
              {insights && (
                <>
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="h-6 w-6 text-fuchsia-400" />
                      <h3 className="text-xl font-bold">التحليل الذكي</h3>
                    </div>
                    <p className="text-white/85 leading-loose">{insights.analysis}</p>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">
                    <InsightCard icon={Car} title="رؤى المرور" text={insights.trafficInsight} color="text-orange-300" />
                    <InsightCard icon={Zap} title="رؤى الطاقة" text={insights.energyInsight} color="text-amber-300" />
                    <InsightCard icon={Droplet} title="رؤى المياه" text={insights.waterInsight} color="text-cyan-300" />
                    <InsightCard icon={Wind} title="رؤى الهواء" text={insights.airQualityInsight} color="text-violet-300" />
                  </div>

                  {/* Recommendations */}
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="h-6 w-6 text-yellow-400" />
                      <h3 className="text-xl font-bold">توصيات الذكاء الاصطناعي ({insights.recommendations.length})</h3>
                    </div>
                    <div className="space-y-3">
                      {insights.recommendations.map((r, i) => (
                        <div key={i} className="bg-black/20 border border-white/10 rounded-xl p-4 hover:border-yellow-500/30 transition">
                          <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                            <h4 className="font-bold text-white text-lg">{r.title}</h4>
                            <div className="flex gap-2">
                              <Badge
                                className={
                                  r.impact === "عالي"
                                    ? "bg-rose-500/20 text-rose-200 border-rose-500/30"
                                    : r.impact === "متوسط"
                                    ? "bg-amber-500/20 text-amber-200 border-amber-500/30"
                                    : "bg-emerald-500/20 text-emerald-200 border-emerald-500/30"
                                }
                              >
                                {r.impact}
                              </Badge>
                              <Badge variant="outline" className="border-white/20 text-white/80">
                                {r.category}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-white/75 text-sm mb-2 leading-relaxed">{r.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-white/60 pt-2 border-t border-white/5">
                            <span>💰 {r.estimatedCost}</span>
                            <span>⏱ {r.timeline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Predictions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-rose-950/20 border-rose-500/30 backdrop-blur-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="h-5 w-5 text-rose-400" />
                        <h4 className="font-bold">توقع 2030 (دون تغيير)</h4>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{insights.predictions.year2030}</p>
                    </Card>
                    <Card className="bg-emerald-950/20 border-emerald-500/30 backdrop-blur-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                        <h4 className="font-bold">توقع 2030 (مع التوصيات)</h4>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{insights.predictions.year2030WithChanges}</p>
                    </Card>
                  </div>

                  {/* Comparison */}
                  <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 backdrop-blur-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="h-5 w-5 text-cyan-400" />
                      <h4 className="font-bold">مقارنة عالمية</h4>
                    </div>
                    <p className="text-white/85 leading-loose">{insights.comparison}</p>
                  </Card>
                </>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <GJUFooter />
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  valueClass: string;
  gradient: string;
}> = ({ icon: Icon, label, value, sub, valueClass, gradient }) => (
  <Card className={`bg-gradient-to-br ${gradient} backdrop-blur-xl p-5`}>
    <div className="flex items-center gap-2 mb-3 text-white/70">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <div className={`text-3xl font-black mb-1 ${valueClass}`}>{value}</div>
    <div className="text-xs text-white/60">{sub}</div>
  </Card>
);

const InsightCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  color: string;
}> = ({ icon: Icon, title, text, color }) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-5">
    <div className={`flex items-center gap-2 mb-2 ${color}`}>
      <Icon className="h-4 w-4" />
      <h4 className="font-bold text-sm">{title}</h4>
    </div>
    <p className="text-white/80 text-sm leading-relaxed">{text}</p>
  </Card>
);

export default JordanDigitalTwin;
