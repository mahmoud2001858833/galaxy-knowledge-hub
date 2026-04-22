import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت خبير في المدن الذكية والبنية التحتية الأردنية. تحلل بيانات حية عن مدن الأردن (عمّان، الزرقاء، إربد، العقبة، السلط، المفرق، الكرك، معان) وتقدم توصيات ذكية.

أعد JSON فقط بهذا الشكل:
{
  "analysis": "تحليل عام للوضع الحالي للمدينة في 3-4 جمل",
  "trafficInsight": "تحليل ذكي لحالة المرور",
  "energyInsight": "تحليل استهلاك الطاقة والكفاءة",
  "waterInsight": "تحليل استهلاك وأمان المياه",
  "airQualityInsight": "تحليل جودة الهواء والتلوث",
  "recommendations": [
    { "title": "عنوان التوصية", "impact": "عالي|متوسط|منخفض", "category": "نقل|طاقة|مياه|بيئة|تعليم", "description": "وصف مفصل", "estimatedCost": "تقدير التكلفة بالمليون دينار", "timeline": "الإطار الزمني" }
  ],
  "predictions": {
    "year2030": "توقع وضع المدينة بحلول 2030 إذا استمر الوضع الحالي",
    "year2030WithChanges": "توقع الوضع إذا طُبقت التوصيات"
  },
  "comparison": "مقارنة بمدن عالمية مماثلة (مثل دبي، سنغافورة)"
}

كن دقيقاً، علمياً، وقدّم أرقاماً واقعية مرتبطة بالأردن.`;

// Simulated live data for Jordan cities
function getCityData(cityKey: string) {
  const cities: Record<string, any> = {
    amman: {
      name: "عمّان",
      population: 4_500_000,
      area_km2: 1680,
      traffic: { congestion: 78, avgSpeed: 22, vehicles: 1_200_000 },
      energy: { consumption_mw: 1850, renewable_pct: 21, peakHours: "18:00-22:00" },
      water: { dailyConsumption_m3: 380_000, lossPct: 38, sources: "ديسي + الزارة ماعين" },
      air: { aqi: 92, pm25: 38, mainPollutant: "PM2.5 من المركبات" },
      coords: [31.95, 35.93],
    },
    zarqa: {
      name: "الزرقاء",
      population: 1_500_000,
      area_km2: 60,
      traffic: { congestion: 65, avgSpeed: 28, vehicles: 380_000 },
      energy: { consumption_mw: 720, renewable_pct: 18, peakHours: "19:00-22:00" },
      water: { dailyConsumption_m3: 145_000, lossPct: 42, sources: "آبار جوفية" },
      air: { aqi: 118, pm25: 52, mainPollutant: "انبعاثات صناعية" },
      coords: [32.07, 36.09],
    },
    irbid: {
      name: "إربد",
      population: 2_000_000,
      area_km2: 410,
      traffic: { congestion: 58, avgSpeed: 32, vehicles: 420_000 },
      energy: { consumption_mw: 680, renewable_pct: 28, peakHours: "18:00-21:00" },
      water: { dailyConsumption_m3: 165_000, lossPct: 35, sources: "اليرموك + آبار" },
      air: { aqi: 76, pm25: 28, mainPollutant: "PM10 موسمي" },
      coords: [32.55, 35.85],
    },
    aqaba: {
      name: "العقبة",
      population: 200_000,
      area_km2: 375,
      traffic: { congestion: 32, avgSpeed: 45, vehicles: 65_000 },
      energy: { consumption_mw: 280, renewable_pct: 45, peakHours: "12:00-16:00" },
      water: { dailyConsumption_m3: 48_000, lossPct: 18, sources: "تحلية البحر الأحمر" },
      air: { aqi: 64, pm25: 22, mainPollutant: "غبار الصحراء" },
      coords: [29.53, 35.0],
    },
    salt: {
      name: "السلط",
      population: 130_000,
      area_km2: 1700,
      traffic: { congestion: 42, avgSpeed: 38, vehicles: 35_000 },
      energy: { consumption_mw: 95, renewable_pct: 32, peakHours: "18:00-21:00" },
      water: { dailyConsumption_m3: 18_000, lossPct: 28, sources: "ينابيع + آبار" },
      air: { aqi: 55, pm25: 18, mainPollutant: "احتراق التدفئة شتاءً" },
      coords: [32.04, 35.73],
    },
    mafraq: {
      name: "المفرق",
      population: 105_000,
      area_km2: 26_551,
      traffic: { congestion: 25, avgSpeed: 55, vehicles: 28_000 },
      energy: { consumption_mw: 180, renewable_pct: 62, peakHours: "13:00-16:00" },
      water: { dailyConsumption_m3: 22_000, lossPct: 45, sources: "آبار جوفية - الديسي" },
      air: { aqi: 48, pm25: 15, mainPollutant: "غبار صحراوي" },
      coords: [32.34, 36.21],
    },
    karak: {
      name: "الكرك",
      population: 90_000,
      area_km2: 3495,
      traffic: { congestion: 28, avgSpeed: 42, vehicles: 22_000 },
      energy: { consumption_mw: 75, renewable_pct: 25, peakHours: "18:00-21:00" },
      water: { dailyConsumption_m3: 14_000, lossPct: 32, sources: "آبار + ينابيع" },
      air: { aqi: 52, pm25: 17, mainPollutant: "احتراق بيئي" },
      coords: [31.18, 35.7],
    },
    maan: {
      name: "معان",
      population: 50_000,
      area_km2: 32_832,
      traffic: { congestion: 18, avgSpeed: 60, vehicles: 12_000 },
      energy: { consumption_mw: 220, renewable_pct: 78, peakHours: "12:00-16:00" },
      water: { dailyConsumption_m3: 8500, lossPct: 38, sources: "آبار الديسي" },
      air: { aqi: 42, pm25: 14, mainPollutant: "غبار صحراوي" },
      coords: [30.19, 35.73],
    },
  };
  return cities[cityKey] || cities.amman;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, action } = await req.json();

    // Endpoint: list all cities with live data
    if (action === "list") {
      const all = ["amman", "zarqa", "irbid", "aqaba", "salt", "mafraq", "karak", "maan"]
        .map((k) => ({ key: k, ...getCityData(k) }));
      return new Response(JSON.stringify({ cities: all }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Endpoint: get + analyze single city
    const cityKey = (city || "amman").toLowerCase();
    const cityData = getCityData(cityKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const JORDAN_TWIN_AI_KEY = Deno.env.get("JORDAN_TWIN_AI_KEY");

    const userMsg = `حلّل بيانات مدينة ${cityData.name} الآتية وقدّم توصيات ذكية:\n${JSON.stringify(cityData, null, 2)}`;

    if (LOVABLE_API_KEY) {
      try {
        const resp = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMsg },
              ],
            }),
          }
        );

        if (resp.status === 429) {
          return new Response(
            JSON.stringify({ error: "تم تجاوز حد الاستخدام", cityData }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        if (resp.status === 402) {
          return new Response(
            JSON.stringify({ error: "نفدت اعتمادات الذكاء الاصطناعي", cityData }),
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (resp.ok) {
          const data = await resp.json();
          const text: string = data?.choices?.[0]?.message?.content ?? "";
          const json = extractJson(text);
          if (json) {
            return new Response(
              JSON.stringify({ cityData, insights: json }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }
      } catch (e) {
        console.error("Gateway error", e);
      }
    }

    // Fallback Gemini Direct
    if (JORDAN_TWIN_AI_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${JORDAN_TWIN_AI_KEY}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${SYSTEM_PROMPT}\n\n${userMsg}` }],
            },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const text: string =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const json = extractJson(text);
        if (json) {
          return new Response(
            JSON.stringify({ cityData, insights: json }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    // If AI failed, return cityData only
    return new Response(
      JSON.stringify({
        cityData,
        insights: null,
        warning: "تعذر توليد التحليل الذكي، البيانات الحية فقط متاحة",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("jordan-digital-twin error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function extractJson(text: string): any | null {
  if (!text) return null;
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*$/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}
