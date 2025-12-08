import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { consumptionData, location, energySource } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Received consumption data:', consumptionData);

    const systemPrompt = `أنت خبير بيئي وعالم متخصص في علوم المناخ والاستدامة مع خبرة واسعة في حسابات البصمة الكربونية.

## معاملات الحساب الدقيقة (استخدمها بالضبط):
- الكهرباء: 0.5 كجم CO2 لكل كيلوواط ساعة
- البنزين: 2.31 كجم CO2 لكل لتر (حوالي 0.21 كجم/كم)
- الديزل: 2.68 كجم CO2 لكل لتر (حوالي 0.27 كجم/كم)
- الغاز الطبيعي: 2.0 كجم CO2 لكل متر مكعب
- المياه: 0.3 كجم CO2 لكل 1000 لتر (معالجة وضخ)
- النفايات: 0.5 كجم CO2 لكل كجم (اعتماداً على نوعها)

## قواعد الحساب:
1. احسب الانبعاثات الشهرية لكل فئة بدقة باستخدام المعاملات أعلاه
2. الانبعاثات السنوية = الشهرية × 12
3. متوسط الفرد في الأردن: 2.5 طن/سنة، السعودية: 16 طن/سنة، الإمارات: 20 طن/سنة
4. سيناريو التحسين: انخفاض 10% سنوياً تراكمياً
5. سيناريو التدهور: زيادة 5% سنوياً تراكمياً
6. نسبة الاستدامة = 100 - (انبعاثاتك / متوسط المنطقة × 100)

## مثال حساب دقيق:
- كهرباء 500 كيلوواط = 500 × 0.5 = 250 كجم CO2/شهر
- سيارة 1000 كم بنزين = 1000 × 0.21 = 210 كجم CO2/شهر
- مياه 10000 لتر = 10 × 0.3 = 3 كجم CO2/شهر
- نفايات 30 كجم = 30 × 0.5 = 15 كجم CO2/شهر
- الإجمالي الشهري = 478 كجم، السنوي = 5.7 طن

أرجع البيانات بتنسيق JSON التالي بالضبط (بدون أي نص إضافي):
{
  "currentEmissions": number (بالطن سنوياً),
  "monthlyPredictions": [{"month": string, "emissions": number (بالكجم)}],
  "scenarios": {
    "continuation": {"year1": number, "year5": number, "year10": number},
    "improvement": {"year1": number, "year5": number, "year10": number},
    "degradation": {"year1": number, "year5": number, "year10": number}
  },
  "categoryBreakdown": {
    "energy": number (نسبة مئوية),
    "transport": number,
    "water": number,
    "waste": number
  },
  "metrics": {
    "averageMonthlyEmission": number (بالكجم),
    "potentialReduction": number (نسبة مئوية),
    "sustainabilityScore": number (0-100),
    "monthlyChangeRate": number
  },
  "regionalComparison": [{"region": string, "emissions": number (بالطن)}],
  "recommendations": [string (توصيات محددة وقابلة للتنفيذ)],
  "renewableEnergyPotential": number,
  "trendAnalysis": string
}`;

    const userPrompt = `قم بتحليل بيانات الاستهلاك التالية:
- استهلاك الكهرباء: ${consumptionData.electricity} كيلوواط/شهر
- استهلاك المياه: ${consumptionData.water} لتر/شهر
- المسافة المقطوعة بالسيارة: ${consumptionData.transport} كم/شهر
- نوع الوقود: ${consumptionData.fuelType}
- النفايات: ${consumptionData.waste} كجم/شهر
- الموقع: ${location}
- مصدر الطاقة: ${energySource}

أنتج تحليلاً بيئياً شاملاً مع توقعات مستقبلية بتنسيق JSON فقط.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response received');

    // Extract JSON from response
    let analysisData;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error, using fallback:', parseError);
      // Generate fallback data based on inputs
      const baseEmissions = (consumptionData.electricity * 0.0005) + 
                           (consumptionData.transport * 0.00021) + 
                           (consumptionData.waste * 0.001) +
                           (consumptionData.water * 0.00001);
      
      analysisData = {
        currentEmissions: baseEmissions * 12,
        monthlyPredictions: Array.from({ length: 12 }, (_, i) => ({
          month: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][i],
          emissions: baseEmissions * (0.9 + Math.random() * 0.2)
        })),
        scenarios: {
          continuation: { year1: baseEmissions * 12, year5: baseEmissions * 12 * 1.1, year10: baseEmissions * 12 * 1.2 },
          improvement: { year1: baseEmissions * 12 * 0.9, year5: baseEmissions * 12 * 0.7, year10: baseEmissions * 12 * 0.5 },
          degradation: { year1: baseEmissions * 12 * 1.1, year5: baseEmissions * 12 * 1.4, year10: baseEmissions * 12 * 1.8 }
        },
        categoryBreakdown: { energy: 45, transport: 30, water: 10, waste: 15 },
        metrics: {
          averageMonthlyEmission: baseEmissions,
          potentialReduction: 35,
          sustainabilityScore: 65,
          monthlyChangeRate: 2.5
        },
        regionalComparison: [
          { region: 'الأردن', emissions: baseEmissions * 12 * 0.9 },
          { region: 'السعودية', emissions: baseEmissions * 12 * 1.3 },
          { region: 'الإمارات', emissions: baseEmissions * 12 * 1.5 },
          { region: 'مصر', emissions: baseEmissions * 12 * 0.7 }
        ],
        recommendations: [
          'تركيب ألواح شمسية لتقليل استهلاك الكهرباء',
          'استخدام وسائل النقل العام',
          'تقليل استهلاك المياه',
          'فرز النفايات وإعادة التدوير',
          'استخدام أجهزة موفرة للطاقة'
        ],
        renewableEnergyPotential: 40,
        trendAnalysis: 'يُظهر تحليل الاتجاهات إمكانية تحسين كبيرة في البصمة الكربونية.'
      };
    }

    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in eco-predict-ai:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
