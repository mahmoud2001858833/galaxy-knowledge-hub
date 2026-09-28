import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Terminal, 
  Play, 
  Code2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Activity, 
  RefreshCw, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  Download, 
  BookOpen, 
  Cpu, 
  Layers, 
  Search, 
  ExternalLink,
  ChevronRight,
  Eye,
  Zap,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { 
  apiGateway, 
  ApiKeyRecord, 
  ApiRequestLog, 
  GRANULAR_SCOPES, 
  MASTER_DEFAULT_KEY 
} from '@/services/apiGatewayService';

const ApiKeysDeveloperPortal: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [logs, setLogs] = useState<ApiRequestLog[]>([]);
  const [activeTab, setActiveTab] = useState('keys');

  // Key creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['*']);
  const [expirationOption, setExpirationOption] = useState<string>('permanent');
  const [rateLimitInput, setRateLimitInput] = useState<number>(60);

  // Key created reveal modal
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isRevealedModalOpen, setIsRevealedModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Playground state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/auth/verify');
  const [endpointMethod, setEndpointMethod] = useState<'GET' | 'POST'>('GET');
  const [playgroundKey, setPlaygroundKey] = useState<string>(MASTER_DEFAULT_KEY);
  const [requestPayload, setRequestPayload] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [playgroundLatency, setPlaygroundLatency] = useState<number | null>(null);
  const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Code generator language
  const [codeLang, setCodeLang] = useState<'curl' | 'python' | 'javascript' | 'php'>('curl');
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);

  // Log details modal
  const [selectedLog, setSelectedLog] = useState<ApiRequestLog | null>(null);

  // Load data
  const refreshData = () => {
    setKeys(apiGateway.getKeys());
    setLogs(apiGateway.getLogs());
  };

  useEffect(() => {
    refreshData();
    // Auto refresh every 5 seconds for live logs
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Set default payload based on endpoint
  useEffect(() => {
    if (selectedEndpoint === '/api/v1/auth/verify') {
      setEndpointMethod('GET');
      setRequestPayload('');
    } else if (selectedEndpoint === '/api/v1/ai/generate-questions') {
      setEndpointMethod('POST');
      setRequestPayload(JSON.stringify({
        subject: "الفيزياء",
        topic: "الحث الكهرومغناطيسي وقانون فاراداي",
        count: 4,
        bloom: "analysis",
        qType: "all_mixed",
        includeDiagrams: true,
        includeTables: true
      }, null, 2));
    } else if (selectedEndpoint === '/api/v1/ai/grade') {
      setEndpointMethod('POST');
      setRequestPayload(JSON.stringify({
        question: "علل: لماذا ينشأ تيار حثي معاكس للتغير في التدفق المغناطيسي؟",
        studentAnswer: "وفقاً لقانون لنز، يكون اتجاه التيار الحثي بحيث يولد مجالاً مغناطيسياً يعاكس التغير في التدفق المسبب له للحفاظ على الطاقة.",
        maxPoints: 10,
        rubric: "معايير وزارة التربية والتعليم للفيزياء التوجيهي"
      }, null, 2));
    } else if (selectedEndpoint === '/api/v1/ai/ocr') {
      setEndpointMethod('POST');
      setRequestPayload(JSON.stringify({
        imageSample: "book_page_physics_ch4.png",
        language: "ar+en",
        extractFormulas: true
      }, null, 2));
    } else if (selectedEndpoint === '/api/v1/ai/figure') {
      setEndpointMethod('POST');
      setRequestPayload(JSON.stringify({
        type: "circuit",
        topic: "دائرة تيار مستمر تحوي مقاومة وبطارية وأميتر"
      }, null, 2));
    } else if (selectedEndpoint === '/api/v1/quizzes') {
      if (endpointMethod === 'POST') {
        setRequestPayload(JSON.stringify({
          title: "امتحان الوحدة الرابعة التجريبي",
          subject: "الفيزياء",
          gradeLevel: "التوجيهي العلمي",
          durationMinutes: 45,
          totalMarks: 50
        }, null, 2));
      } else {
        setRequestPayload('');
      }
    } else if (selectedEndpoint === '/api/v1/public/quizzes/:id/submit') {
      setEndpointMethod('POST');
      setRequestPayload(JSON.stringify({
        studentName: "أحمد العبدالله",
        studentClass: "الثاني عشر (التوجيهي)",
        section: "أ",
        seatNumber: "48201",
        schoolName: "مدرسة عنبه الثانوية الشاملة للبنين",
        timeTakenMinutes: 28,
        answers: {
          "q_api_1": "أ",
          "q_api_2": "أ",
          "q_api_3": "ب"
        }
      }, null, 2));
    } else {
      setEndpointMethod('GET');
      setRequestPayload('');
    }
  }, [selectedEndpoint]);

  // Handle Create Key
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة اسم تعريفي للمفتاح",
        variant: "destructive"
      });
      return;
    }

    let days: number | null = null;
    if (expirationOption === '7d') days = 7;
    if (expirationOption === '30d') days = 30;
    if (expirationOption === '90d') days = 90;

    const { rawKey } = await apiGateway.createApiKey({
      name: newKeyName,
      scopes: selectedScopes,
      expiresInDays: days,
      rateLimitPerMinute: rateLimitInput
    });

    refreshData();
    setIsCreateModalOpen(false);
    setNewKeyName('');
    setSelectedScopes(['*']);
    setRevealedKey(rawKey);
    setIsRevealedModalOpen(true);

    toast({
      title: "تم توليد المفتاح بنجاح 🔑",
      description: "يرجى نسخ المفتاح الآن حيث لن تتمكن من رؤيته مجدداً"
    });
  };

  // Revoke Key
  const handleRevokeKey = (id: string) => {
    apiGateway.revokeKey(id);
    refreshData();
    toast({
      title: "تم تجميد المفتاح",
      description: "لن يتم قبول أي طلبات قادمة بهذا المفتاح"
    });
  };

  // Restore Key
  const handleRestoreKey = (id: string) => {
    apiGateway.restoreKey(id);
    refreshData();
    toast({
      title: "تمت إعادة تفعيل المفتاح",
      description: "المفتاح جاهز للعمل مجدداً"
    });
  };

  // Delete Key
  const handleDeleteKey = (id: string) => {
    apiGateway.deleteKey(id);
    refreshData();
    toast({
      title: "تم حذف المفتاح",
      description: "تمت إزالة المفتاح نهائياً من قاعدة البيانات"
    });
  };

  // Execute Playground Request
  const handleExecutePlayground = async () => {
    setIsExecuting(true);
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    setPlaygroundLatency(null);

    const start = performance.now();
    try {
      const init: RequestInit = {
        method: endpointMethod,
        headers: {
          'Authorization': `Bearer ${playgroundKey}`,
          'X-API-Key': playgroundKey,
          'Content-Type': 'application/json'
        }
      };

      if (endpointMethod === 'POST' && requestPayload) {
        init.body = requestPayload;
      }

      // If testing quiz/:id replace placeholder
      let targetUrl = selectedEndpoint;
      if (targetUrl.includes(':id')) {
        targetUrl = targetUrl.replace(':id', 'quiz_demo_123');
      }

      const res = await apiGateway.handleApiRequest(targetUrl, init);
      const data = await res.json();
      const latency = Math.round(performance.now() - start);

      setPlaygroundResponse(data);
      setPlaygroundStatus(res.status);
      setPlaygroundLatency(latency);
      refreshData();
    } catch (err: any) {
      setPlaygroundStatus(500);
      setPlaygroundResponse({ success: false, error: err.message || 'Internal Playground Error' });
    } finally {
      setIsExecuting(false);
    }
  };

  // Generate Code Snippet
  const getGeneratedCode = () => {
    const key = playgroundKey || MASTER_DEFAULT_KEY;
    const url = `https://zarwat.jo${selectedEndpoint.replace(':id', 'quiz_demo_123')}`;

    if (codeLang === 'curl') {
      if (endpointMethod === 'GET') {
        return `curl -X GET "${url}" \\
  -H "Authorization: Bearer ${key}" \\
  -H "Accept: application/json"`;
      }
      return `curl -X POST "${url}" \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '${requestPayload.replace(/'/g, "'\\''")}'`;
    }

    if (codeLang === 'python') {
      if (endpointMethod === 'GET') {
        return `import requests

url = "${url}"
headers = {
    "Authorization": "Bearer ${key}",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
print("Status:", response.status_code)
print(response.json())`;
      }
      return `import requests
import json

url = "${url}"
headers = {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
}
payload = ${requestPayload || '{}'}

response = requests.post(url, headers=headers, json=payload)
print("Status:", response.status_code)
print(response.json())`;
    }

    if (codeLang === 'javascript') {
      return `const response = await fetch("${url}", {
  method: "${endpointMethod}",
  headers: {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
  }${endpointMethod === 'POST' ? `,\n  body: JSON.stringify(${requestPayload || '{}'})` : ''}
});

const data = await response.json();
console.log(data);`;
    }

    if (codeLang === 'php') {
      return `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${url}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${endpointMethod}",
  ${endpointMethod === 'POST' ? `CURLOPT_POSTFIELDS => '${requestPayload.replace(/'/g, "\\'")}',` : ''}
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer ${key}",
    "Content-Type: application/json"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;
?>`;
    }

    return '';
  };

  // Download OpenAPI Spec
  const handleDownloadOpenApi = () => {
    const spec = apiGateway.getOpenApiSpec();
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zarwat-alilm-openapi-v1.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "تم تصدير ملف OpenAPI 3.0 📄",
      description: "يمكنك الآن استيراده مباشرة في Postman أو Swagger UI"
    });
  };

  // Metrics
  const activeKeysCount = keys.filter(k => !k.revoked && (!k.expiresAt || new Date(k.expiresAt).getTime() > Date.now())).length;
  const totalCalls = keys.reduce((acc, k) => acc + (k.totalUsage || 0), 0) + logs.length;
  const avgLatency = logs.length > 0 ? Math.round(logs.reduce((acc, l) => acc + l.latencyMs, 0) / logs.length) : 18;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                <Terminal className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                واجهة المطورين وإدارة المفاتيح (Developer API Hub)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              محرك الـ REST API الرسمي لمنظومة ذروة العلم: توليد الأسئلة، التصحيح الذكي، بنوك الأسئلة، ومخططات SVG العلمية
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadOpenApi}
              className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>تصدير OpenAPI 3.0</span>
            </Button>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl text-xs font-bold gap-1.5 shadow-sm"
            >
              <Key className="w-4 h-4" />
              <span>إنشاء مفتاح API جديد</span>
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">المفاتيح الفعالة</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{activeKeysCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Key className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الطلبات (Calls)</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCalls.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">متوسط زمن الاستجابة</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{avgLatency} ms</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">معدل النجاح (SLA)</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">99.8%</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap h-auto gap-1">
            <TabsTrigger 
              value="keys" 
              className="rounded-xl font-bold text-xs px-4 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 gap-1.5"
            >
              <Key className="w-4 h-4" />
              <span>إدارة المفاتيح ({keys.length})</span>
            </TabsTrigger>

            <TabsTrigger 
              value="playground" 
              className="rounded-xl font-bold text-xs px-4 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 gap-1.5"
            >
              <Play className="w-4 h-4 text-emerald-500" />
              <span>المختبر التفاعلي (API Playground)</span>
            </TabsTrigger>

            <TabsTrigger 
              value="snippets" 
              className="rounded-xl font-bold text-xs px-4 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 gap-1.5"
            >
              <Code2 className="w-4 h-4 text-blue-500" />
              <span>أمثلة الكود (Code Generator)</span>
            </TabsTrigger>

            <TabsTrigger 
              value="logs" 
              className="rounded-xl font-bold text-xs px-4 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 gap-1.5"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>سجل الطلبات الحية ({logs.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: KEYS MANAGEMENT */}
          <TabsContent value="keys" className="space-y-4">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                      مفاتيح الـ API المشفرة والمعتمدة
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      يتم تخزين المفاتيح بتجزئة SHA-256 أحادية الاتجاه لضمان أعلى حماية وأمان لحسابك
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 w-fit">
                    تنسيق: ak_live_...
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50/70 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">اسم المفتاح</th>
                        <th className="p-4">بادئة المفتاح (Key Prefix)</th>
                        <th className="p-4">الصلاحيات (Scopes)</th>
                        <th className="p-4">حد الطلبات</th>
                        <th className="p-4">تاريخ الانتهاء</th>
                        <th className="p-4">الاستخدام</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {keys.map((k) => {
                        const isExpired = k.expiresAt && new Date(k.expiresAt).getTime() < Date.now();
                        return (
                          <tr key={k.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">
                              {k.name}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg w-fit text-slate-700 dark:text-slate-300">
                                <span>{k.prefix}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(k.id === 'key_master_zarwat' ? MASTER_DEFAULT_KEY : k.prefix);
                                    toast({ title: "تم نسخ المعرّف للحافظة" });
                                  }}
                                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                  title="نسخ"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {k.scopes.map(s => (
                                  <span key={s} className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-cyan-300 border border-blue-200/50 dark:border-blue-900/50">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                              {k.rateLimitPerMinute} / دقيقة
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                              {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('ar-EG') : 'دائم (Permanent)'}
                            </td>
                            <td className="p-4 font-mono text-slate-700 dark:text-slate-200 font-bold">
                              {k.totalUsage} طلب
                            </td>
                            <td className="p-4">
                              {k.revoked ? (
                                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-400">
                                  مجمّد (Revoked)
                                </Badge>
                              ) : isExpired ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400">
                                  منتهي الصلاحية
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400">
                                  فعال (Active)
                                </Badge>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setPlaygroundKey(k.id === 'key_master_zarwat' ? MASTER_DEFAULT_KEY : k.prefix);
                                    setActiveTab('playground');
                                  }}
                                  className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600"
                                  title="تجربة في المختبر"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </Button>

                                {k.revoked ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRestoreKey(k.id)}
                                    className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                    title="إلغاء التجميد"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRevokeKey(k.id)}
                                    className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                    title="تجميد المفتاح"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </Button>
                                )}

                                {k.id !== 'key_master_zarwat' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteKey(k.id)}
                                    className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                    title="حذف المفتاح نهائياً"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: INTERACTIVE PLAYGROUND */}
          <TabsContent value="playground" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Request Configurator */}
              <div className="lg:col-span-6 space-y-4">
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <CardTitle className="text-base font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-500" />
                        تجهيز وإرسال الطلب (Request Configurator)
                      </span>
                      <Badge className={endpointMethod === 'GET' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}>
                        {endpointMethod}
                      </Badge>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    {/* Endpoint Selector */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">نقطة النهاية (Endpoint)</Label>
                      <select
                        value={selectedEndpoint}
                        onChange={(e) => setSelectedEndpoint(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="/api/v1/auth/verify">GET /api/v1/auth/verify (فحص صلاحية المفتاح)</option>
                        <option value="/api/v1/ai/generate-questions">POST /api/v1/ai/generate-questions (توليد الأسئلة والاختبارات)</option>
                        <option value="/api/v1/ai/grade">POST /api/v1/ai/grade (التصحيح الآلي للإجابات المقالية)</option>
                        <option value="/api/v1/ai/ocr">POST /api/v1/ai/ocr (استخراج النصوص والمعادلات من الصور)</option>
                        <option value="/api/v1/ai/figure">POST /api/v1/ai/figure (توليد المخططات والرسوم العلمية SVG)</option>
                        <option value="/api/v1/quizzes">GET /api/v1/quizzes (استعراض الاختبارات المحفوظة)</option>
                        <option value="/api/v1/public/quizzes/:id/submit">POST /api/v1/public/quizzes/:id/submit (تسليم حل الطالب وتصحيحه)</option>
                        <option value="/api/v1/curriculum">GET /api/v1/curriculum (استعراض المناهج الأردنية المعتمدة)</option>
                        <option value="/api/v1/question-banks">GET /api/v1/question-banks (بنوك الأسئلة المعتمدة)</option>
                        <option value="/api/v1/openapi.json">GET /api/v1/openapi.json (مواصفات OpenAPI 3.0)</option>
                      </select>
                    </div>

                    {/* API Key Selector */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">المفتاح المستخدم (Authorization Header)</Label>
                        <span className="text-[10px] text-slate-400 font-mono">Bearer &lt;token&gt;</span>
                      </div>
                      <Input
                        value={playgroundKey}
                        onChange={(e) => setPlaygroundKey(e.target.value)}
                        placeholder="ak_live_..."
                        className="font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      />
                    </div>

                    {/* Request Payload Editor */}
                    {endpointMethod === 'POST' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">جسم الطلب (JSON Request Body)</Label>
                          <span className="text-[10px] text-slate-400 font-mono">application/json</span>
                        </div>
                        <textarea
                          rows={10}
                          value={requestPayload}
                          onChange={(e) => setRequestPayload(e.target.value)}
                          className="w-full font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          dir="ltr"
                        />
                      </div>
                    )}

                    {/* Send Button */}
                    <Button
                      onClick={handleExecutePlayground}
                      disabled={isExecuting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl text-xs font-bold gap-2 py-3 shadow-md"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جارٍ تنفيذ واستدعاء الـ API...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>إرسال الطلب وتنفيذ الاستدعاء (Send Request)</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Response Panel */}
              <div className="lg:col-span-6 space-y-4">
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full flex flex-col">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Server className="w-4 h-4 text-purple-500" />
                      استجابة الخادم (Live API Response)
                    </CardTitle>

                    {playgroundStatus !== null && (
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            playgroundStatus < 300 
                              ? 'bg-emerald-600 text-white font-mono' 
                              : playgroundStatus === 429 
                              ? 'bg-amber-600 text-white font-mono' 
                              : 'bg-rose-600 text-white font-mono'
                          }
                        >
                          {playgroundStatus} {playgroundStatus === 200 ? 'OK' : playgroundStatus === 401 ? 'Unauthorized' : playgroundStatus === 429 ? 'Rate Limited' : 'Error'}
                        </Badge>
                        {playgroundLatency !== null && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {playgroundLatency} ms
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    {playgroundResponse ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">النتيجة المُسترجعة (JSON Payload):</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(playgroundResponse, null, 2));
                              setCopiedResponse(true);
                              setTimeout(() => setCopiedResponse(false), 2000);
                              toast({ title: "تم نسخ الاستجابة للحافظة" });
                            }}
                            className="h-7 text-xs gap-1"
                          >
                            {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>نسخ الاستجابة</span>
                          </Button>
                        </div>
                        <pre 
                          className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs max-h-[420px] overflow-auto border border-slate-800 leading-relaxed" 
                          dir="ltr"
                        >
                          {JSON.stringify(playgroundResponse, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3 my-auto">
                        <Terminal className="w-12 h-12 opacity-30 text-blue-500" />
                        <p className="text-xs font-medium">
                          اضغط على "إرسال الطلب وتنفيذ الاستدعاء" لتجربة النتيجة الحية والتحقق من الاستجابة وزمن التنفيذ.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* TAB 3: CODE SNIPPETS GENERATOR */}
          <TabsContent value="snippets" className="space-y-4">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                      مولد الأكواد البرمجية الفورية
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      أكواد جاهزة للنسخ واللصق في تطبيقاتك بـ cURL أو Python أو JavaScript أو PHP
                    </CardDescription>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    {(['curl', 'python', 'javascript', 'php'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setCodeLang(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          codeLang === lang 
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Endpoint: <strong className="text-slate-800 dark:text-slate-200">{selectedEndpoint}</strong>
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(getGeneratedCode());
                      setCopiedCodeSnippet(true);
                      setTimeout(() => setCopiedCodeSnippet(false), 2000);
                      toast({ title: "تم نسخ الكود البرمجي بنجاح" });
                    }}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    {copiedCodeSnippet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الكود</span>
                  </Button>
                </div>

                <pre className="bg-slate-950 text-cyan-300 p-4 rounded-2xl font-mono text-xs overflow-auto border border-slate-800 leading-relaxed" dir="ltr">
                  {getGeneratedCode()}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: LIVE REQUEST LOGS */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      سجل الاستدعاءات الحية (Live Logs)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      سجل فوري بآخر الطلبات الواردة إلى المنظومة مع تفاصيل الأداء ورموز الحالة
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        apiGateway.clearLogs();
                        refreshData();
                        toast({ title: "تم تفريغ السجل بنجاح" });
                      }}
                      className="rounded-xl text-xs font-semibold hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-1.5" />
                      <span>تفريغ السجل</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshData}
                      className="rounded-xl text-xs font-semibold gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>تحديث</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {logs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-medium">
                    لا توجد طلبات مسجلة بعد. قم بتجربة استدعاء نقطة نهاية من تبويب المختبر التفاعلي!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50/70 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="p-4">الوقت</th>
                          <th className="p-4">الطريقة</th>
                          <th className="p-4">المسار (Endpoint)</th>
                          <th className="p-4">كود الحالة</th>
                          <th className="p-4">الزمن (Latency)</th>
                          <th className="p-4">المفتاح</th>
                          <th className="p-4 text-center">التفاصيل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 text-[11px] text-slate-500 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString('ar-EG')}
                            </td>
                            <td className="p-4">
                              <Badge className={log.method === 'GET' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}>
                                {log.method}
                              </Badge>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                              {log.endpoint}
                            </td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className={
                                  log.statusCode < 300 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400' 
                                    : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-400'
                                }
                              >
                                {log.statusCode}
                              </Badge>
                            </td>
                            <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                              {log.latencyMs} ms
                            </td>
                            <td className="p-4 font-mono text-[10px] text-slate-500">
                              {log.keyPrefix || 'عام (Public)'}
                            </td>
                            <td className="p-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                                className="h-7 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>عرض</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* MODAL 1: CREATE KEY */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                توليد مفتاح API جديد مشفر
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                حدد الصلاحيات الدقيقة ومدة الصلاحية ومعدل الطلبات للمفتاح الجديد
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">اسم أو وصف المفتاح</Label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="مثال: تطبيق الامتحانات التفاعلية للمدارس"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">مدة الصلاحية</Label>
                  <select
                    value={expirationOption}
                    onChange={(e) => setExpirationOption(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="permanent">دائم (Permanent)</option>
                    <option value="90d">90 يوماً</option>
                    <option value="30d">30 يوماً</option>
                    <option value="7d">7 أيام</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">حد الطلبات (دقيقة)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={600}
                    value={rateLimitInput}
                    onChange={(e) => setRateLimitInput(Number(e.target.value))}
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">الصلاحيات المخصصة (Granular Scopes)</Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedScopes.includes('*')) {
                        setSelectedScopes(['ai:generate', 'quizzes:read']);
                      } else {
                        setSelectedScopes(['*']);
                      }
                    }}
                    className="text-[11px] text-blue-600 font-bold hover:underline"
                  >
                    {selectedScopes.includes('*') ? 'إلغاء الوصول الشامل (*)' : 'تحديد الكل (* Full Access)'}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-950/50">
                  {GRANULAR_SCOPES.map(scope => {
                    const isChecked = selectedScopes.includes('*') || selectedScopes.includes(scope.id);
                    return (
                      <label 
                        key={scope.id} 
                        className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-100/60 dark:hover:bg-slate-800/40 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={selectedScopes.includes('*') && scope.id !== '*'}
                          onChange={() => {
                            if (scope.id === '*') {
                              setSelectedScopes(selectedScopes.includes('*') ? [] : ['*']);
                            } else {
                              if (selectedScopes.includes(scope.id)) {
                                setSelectedScopes(selectedScopes.filter(s => s !== scope.id));
                              } else {
                                setSelectedScopes([...selectedScopes, scope.id]);
                              }
                            }
                          }}
                          className="mt-0.5 rounded border-slate-300"
                        />
                        <div className="flex-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{scope.label}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">{scope.id}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl text-xs font-semibold">
                إلغاء
              </Button>
              <Button onClick={handleCreateKey} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">
                تأكيد وإنشاء المفتاح
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL 2: REVEAL GENERATED KEY ONCE */}
        <Dialog open={isRevealedModalOpen} onOpenChange={setIsRevealedModalOpen}>
          <DialogContent className="max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                تم توليد مفتاح API بنجاح
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                احفظ هذا المفتاح فوراً في مكان آمن، فلن تتمكن من رؤيته مرة أخرى!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>تنبيه أمني بالغ:</strong> نقوم بتخزين تجزئة SHA-256 المشفرة فقط لهذا المفتاح على السيرفر. لن تتمكن من قراءة المفتاح الخام مرة أخرى بعد إغلاق هذه النافذة.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">المفتاح السري الخام (Raw Secret Key)</Label>
                <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="font-mono text-xs text-emerald-400 font-bold flex-1 select-all break-all" dir="ltr">
                    {revealedKey}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (revealedKey) {
                        navigator.clipboard.writeText(revealedKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                        toast({ title: "تم نسخ المفتاح السري إلى الحافظة 📋" });
                      }
                    }}
                    className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'تم النسخ' : 'نسخ المفتاح'}</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-500">أمر cURL جاهز للتجربة السريعة</Label>
                  <button
                    onClick={() => {
                      if (revealedKey) {
                        const cmd = `curl -H "Authorization: Bearer ${revealedKey}" "https://zarwat.jo/api/v1/auth/verify"`;
                        navigator.clipboard.writeText(cmd);
                        setCopiedCurl(true);
                        setTimeout(() => setCopiedCurl(false), 2000);
                        toast({ title: "تم نسخ أمر cURL للحافظة" });
                      }
                    }}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>نسخ الأمر</span>
                  </button>
                </div>
                <pre className="bg-slate-950 text-slate-300 p-3 rounded-xl font-mono text-[11px] overflow-auto border border-slate-800" dir="ltr">
                  curl -H "Authorization: Bearer {revealedKey}" "https://zarwat.jo/api/v1/auth/verify"
                </pre>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={() => setIsRevealedModalOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold"
              >
                لقد نسخت وحفظت المفتاح بأمان، متابعة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL 3: VIEW LOG DETAILS */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-600" />
                تفاصيل الطلب: {selectedLog?.endpoint}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                كود الحالة: {selectedLog?.statusCode} | زمن التنفيذ: {selectedLog?.latencyMs} ms
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="text-slate-500 block mb-1">وقت الطلب:</span>
                    <span className="font-mono font-bold">{new Date(selectedLog.timestamp).toLocaleString('ar-EG')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="text-slate-500 block mb-1">المفتاح المستخدم:</span>
                    <span className="font-mono font-bold">{selectedLog.keyPrefix || 'عام'}</span>
                  </div>
                </div>

                {selectedLog.requestBody && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">جسم الطلب (Request Payload):</span>
                    <pre className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-auto max-h-40 border border-slate-800" dir="ltr">
                      {JSON.stringify(selectedLog.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">الاستجابة المُعادة (Response Payload):</span>
                  <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-auto max-h-60 border border-slate-800" dir="ltr">
                    {JSON.stringify(selectedLog.responseBody, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setSelectedLog(null)} className="rounded-xl text-xs font-bold">
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default ApiKeysDeveloperPortal;
