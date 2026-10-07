import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Recycle, Leaf, Clock, Camera, Lightbulb, Loader2, Star, Send, CheckCircle, Search, SlidersHorizontal, BookOpen, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';
import ProjectDetails from '@/components/recycling/ProjectDetails';
import { calculateProjectImpact, projectKey, readLocal, type RecyclingProject, type Completion, type ImpactInput } from '@/components/recycling/model';
import workshopImage from '@/assets/recycling-workshop.jpg';
import '@/components/recycling/recycling.css';

const COMMON_MATERIALS = ['زجاجات بلاستيكية', 'علب معدنية', 'كرتون', 'ورق', 'قماش قديم', 'خشب', 'زجاج', 'أغطية زجاجات', 'علب ألمنيوم', 'أقمشة جينز', 'صناديق كرتون'];
const FAVORITES_KEY = 'recycling-favorites-v2';
const COMPLETIONS_KEY = 'recycling-completions-v2';
const difficulty = (p: RecyclingProject) => p.difficulty.includes('سهل') ? 'سهل' : p.difficulty.includes('متوسط') ? 'متوسط' : 'متقدم';
type Message = { role: 'user' | 'assistant'; content: string };

export default function RecyclingProjectAdvisor() {
  const navigate = useNavigate(); const { toast } = useToast(); const fileInput = useRef<HTMLInputElement>(null); const chatEnd = useRef<HTMLDivElement>(null);
  const [materials, setMaterials] = useState(''); const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState('teen'); const [projectType, setProjectType] = useState('practical');
  const [projects, setProjects] = useState<RecyclingProject[]>([]); const [questions, setQuestions] = useState<string[]>([]);
  const [detectedMaterials, setDetectedMaterials] = useState<string[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [saved, setSaved] = useState<RecyclingProject[]>(() => readLocal(FAVORITES_KEY, []));
  const [completed, setCompleted] = useState<Completion[]>(() => readLocal(COMPLETIONS_KEY, []));
  const [active, setActive] = useState<RecyclingProject | null>(null); const [tab, setTab] = useState('generator');
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('all'); const [sort, setSort] = useState('default');
  const [sidebarOpen, setSidebarOpen] = useState(true); const [chat, setChat] = useState<Message[]>([]); const [chatInput, setChatInput] = useState(''); const [chatBusy, setChatBusy] = useState(false);
  const [contextProject, setContextProject] = useState<RecyclingProject | null>(null); const [imageBusy, setImageBusy] = useState(false);
  useEffect(() => { try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(saved)); localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completed)); } catch { toast({ title: 'تعذّر حفظ السجل على هذا الجهاز', variant: 'destructive' }); } }, [saved, completed]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [chat, chatBusy]);
  useEffect(() => {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&family=Figtree:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap'; document.head.appendChild(link); return () => link.remove();
  }, []);
  const totals = completed.reduce((acc, c) => ({ mass: acc.mass + c.mass, co2: acc.co2 + c.co2 }), { mass: 0, co2: 0 });

  const invokeAdvisor = async (body: Record<string, unknown>) => {
    const { data, error: requestError } = await supabase.functions.invoke('recycling-project-advisor', { body });
    if (requestError || !data?.success) throw new Error(data?.error || 'تعذّر الوصول للخبير الآن. حاول مرة أخرى بعد قليل.');
    return data;
  };
  const generate = async (imageBase64?: string) => {
    const allMaterials = [...selectedMaterials, ...materials.split(/[,،\n]/).map(m => m.trim()).filter(Boolean)];
    if (!imageBase64 && !allMaterials.length) { setError('اختر مادة واحدة على الأقل أو أضف صورة للمواد.'); return; }
    setBusy(true); setError('');
    try {
      const data = await invokeAdvisor({ materials: allMaterials.join('، '), imageBase64, userLevel, projectType });
      if (!Array.isArray(data.projects) || !data.projects.length) throw new Error('لم تصل مشاريع مكتملة؛ حاول تحديد المواد بصورة أوضح.');
      setProjects(data.projects); setQuestions(data.followUpQuestions || []); setDetectedMaterials(data.detectedMaterials || []); setTab('generator'); setSearch(''); setFilter('all');
      toast({ title: `تم اقتراح ${data.projects.length} مشاريع` });
    } catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع'); } finally { setBusy(false); }
  };
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) { setError('اختر صورة JPG أو PNG أو WEBP بحجم أقل من 15 ميغابايت.'); return; }
    setBusy(true); setError('');
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true });
      const base64 = await imageCompression.getDataUrlFromFile(compressed); await generate(base64);
    } catch { setError('تعذّرت قراءة الصورة. جرّب صورة أخرى.'); } finally { setBusy(false); }
  };
  const save = (project: RecyclingProject) => {
    if (saved.some(p => projectKey(p) === projectKey(project))) { toast({ title: 'المشروع محفوظ بالفعل' }); return; }
    setSaved(p => [...p, project]); toast({ title: 'تم حفظ المشروع على هذا الجهاز' });
  };
  const complete = (input: ImpactInput) => {
    if (!active) return; const key = projectKey(active); if (completed.some(c => c.key === key)) return;
    const impact = calculateProjectImpact(input);
    setCompleted(c => [...c, { key, name: active.name, date: new Date().toISOString(), input, mass: impact.mass, co2: impact.co2 }]);
    toast({ title: 'تم تسجيل إنجازك', description: `${impact.co2.toFixed(2)} كغ CO₂e متجنّبة تقديرياً` });
  };
  const share = async (p: RecyclingProject) => {
    const text = `${p.name}\n${p.idea}\n\nالمواد: ${p.materials}\nالأدوات: ${p.tools}\nالخطوات: ${p.steps}\nالسلامة: ${p.safety}\nالمبدأ: ${p.principle}\nالنتائج: ${p.results}\nالتطوير: ${p.development}\nالأثر: ${p.sustainability}`;
    try { if (navigator.share) await navigator.share({ title: p.name, text }); else { await navigator.clipboard.writeText(text); toast({ title: 'تم نسخ تفاصيل المشروع' }); } } catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError')) toast({ title: 'تعذّرت المشاركة', variant: 'destructive' }); }
  };
  const ask = (p: RecyclingProject) => { setContextProject(p); setActive(null); setTab('chat'); setChatInput(`كيف أطور مشروع «${p.name}» بالمواد المتوفرة؟`); };
  const send = async () => {
    if (!chatInput.trim() || chatBusy) return; const question = chatInput.trim(); setChatInput(''); setChat(c => [...c, { role: 'user', content: question }]); setChatBusy(true);
    try { const data = await invokeAdvisor({ question, conversationHistory: chat.slice(-10), projectContext: contextProject, materials: [...selectedMaterials, materials].join('، '), userLevel }); setChat(c => [...c, { role: 'assistant', content: data.rawResponse }]); }
    catch (e) { setChat(c => [...c, { role: 'assistant', content: e instanceof Error ? e.message : 'تعذّر إرسال السؤال' }]); setChatInput(question); } finally { setChatBusy(false); }
  };
  const generateImage = async () => {
    if (!active || imageBusy) return; const project = active; setImageBusy(true);
    try { const { data, error } = await supabase.functions.invoke('generate-project-image', { body: { projectName: project.name, projectIdea: project.idea, projectMaterials: project.materials } }); if (error || !data?.success || !data.imageUrl) throw new Error(); const updated = { ...project, generatedImage: data.imageUrl }; setActive(updated); setProjects(ps => ps.map(p => projectKey(p) === projectKey(project) ? updated : p)); setSaved(ps => ps.map(p => projectKey(p) === projectKey(project) ? updated : p)); }
    catch { toast({ title: 'تعذّر إنشاء الصورة الآن', variant: 'destructive' }); } finally { setImageBusy(false); }
  };
  const list = (tab === 'saved' ? saved : projects).filter(p => `${p.name} ${p.idea} ${p.materials}`.includes(search) && (filter === 'all' || difficulty(p) === filter));
  const visible = sort === 'easy' ? [...list].sort((a,b) => ['سهل','متوسط','متقدم'].indexOf(difficulty(a)) - ['سهل','متوسط','متقدم'].indexOf(difficulty(b))) : list;
  const grid = <><div className="flex flex-wrap gap-3 items-center justify-between mb-5"><h2 className="text-xl font-bold">{tab === 'saved' ? 'مشاريعك المحفوظة' : 'المشاريع المقترحة'} <span className="text-sm text-muted-foreground font-normal">({visible.length})</span></h2><div className="flex gap-2"><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-28" aria-label="تصفية الصعوبة"><SelectValue /></SelectTrigger><SelectContent className="recycling-theme"><SelectItem value="all">كل المستويات</SelectItem>{['سهل','متوسط','متقدم'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><Select value={sort} onValueChange={setSort}><SelectTrigger className="w-28" aria-label="ترتيب المشاريع"><SelectValue /></SelectTrigger><SelectContent className="recycling-theme"><SelectItem value="default">الترتيب الأصلي</SelectItem><SelectItem value="easy">الأسهل أولاً</SelectItem></SelectContent></Select></div></div>
    <div className="relative mb-5"><Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" /><Input aria-label="البحث في المشاريع" placeholder="ابحث باسم المشروع أو المادة…" className="pr-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
    {busy ? <div role="status" className="min-h-80 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin h-9 w-9 text-primary" /><p>جاري تحليل المواد وإعداد المشاريع…</p></div> : <div className="grid sm:grid-cols-2 gap-6">{visible.map((p,i) => <motion.div key={projectKey(p)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.05 }}><Card className="project-card bg-card border-border rounded-lg overflow-hidden h-full flex flex-col transition-colors"><Button variant="ghost" className="relative block w-full h-48 p-0 rounded-none overflow-hidden" onClick={() => setActive(p)} aria-label={`فتح مشروع ${p.name}`}><img src={p.generatedImage || workshopImage} alt={p.generatedImage ? p.name : 'أمثلة توضيحية لإعادة استخدام مواد مستعملة'} width={1280} height={768} loading="lazy" className="w-full h-full object-cover" /><Badge className="absolute top-3 right-3">{difficulty(p)}</Badge>{!p.generatedImage && <span className="absolute bottom-2 right-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded">صورة توضيحية</span>}</Button><CardContent className="p-5 flex flex-col flex-1 gap-3"><h3 className="font-bold text-lg leading-7">{p.name}</h3><p className="text-sm text-muted-foreground line-clamp-2 leading-6">{p.idea}</p><div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4 shrink-0" /><span className="line-clamp-1">{p.time}</span></div>{completed.some(c => c.key === projectKey(p)) && <span className="text-sm flex gap-2"><CheckCircle className="w-4 h-4 text-primary" />تم الإنجاز</span>}<div className="flex justify-between items-center mt-auto pt-2"><Button variant="link" className="px-0 text-foreground" onClick={() => setActive(p)}>تفاصيل المشروع <ArrowLeft /></Button><Button variant="ghost" size="icon" title={tab === 'saved' ? 'إزالة من المحفوظة' : 'حفظ المشروع'} aria-label={tab === 'saved' ? `إزالة ${p.name}` : `حفظ ${p.name}`} onClick={() => tab === 'saved' ? setSaved(s => s.filter(v => projectKey(v) !== projectKey(p))) : save(p)}><Star className={saved.some(s => projectKey(s) === projectKey(p)) ? 'fill-primary text-primary' : ''} /></Button></div></CardContent></Card></motion.div>)}
    {!visible.length && <div className="sm:col-span-2 border border-dashed border-border rounded-lg overflow-hidden"><img src={workshopImage} width={1280} height={768} alt="أمثلة لمشاريع إعادة استخدام الزجاجات والكرتون والعلب" className="w-full h-56 object-cover" /><p className="text-muted-foreground text-center p-8">{search || filter !== 'all' ? 'لا توجد مشاريع مطابقة.' : tab === 'saved' ? 'لا توجد مشاريع محفوظة بعد.' : 'المشاريع المقترحة ستظهر هنا.'}</p></div>}
    </div>}{questions.length > 0 && tab === 'generator' && <section className="mt-6 border-t border-border pt-5"><h3 className="font-bold mb-3">لتخصيص المشاريع</h3>{questions.map(q => <Button variant="ghost" key={q} className="h-auto whitespace-normal text-right justify-start w-full py-2 text-muted-foreground" onClick={() => { setTab('chat'); setChatInput(q); }}>{q}<ArrowLeft /></Button>)}</section>}</>;

  return <div dir="rtl" data-preserve-dark className="recycling-theme min-h-screen p-4 md:p-8 pb-24"><div className="max-w-7xl mx-auto">
    <header className="mb-8"><div className="flex flex-wrap justify-between gap-3 items-center mb-8"><Button variant="outline" onClick={() => navigate(sessionStorage.getItem('gju_mode') === 'true' ? '/gju-competition' : '/environmental-sustainability')}><ArrowLeft />رجوع</Button><div className="flex flex-wrap gap-3 text-sm"><Badge variant="outline" className="py-2 px-3"><CheckCircle className="h-4 w-4 ml-2 text-primary" />{completed.length} مشروع منجز</Badge><Badge variant="outline" className="py-2 px-3"><Leaf className="h-4 w-4 ml-2 text-primary" />{totals.co2.toFixed(2)} كغ CO₂e متجنّبة تقديرياً</Badge></div></div><div className="text-center"><div className="flex items-center justify-center gap-4"><div className="p-3 bg-primary rounded-lg shrink-0"><Recycle className="h-7 w-7 text-primary-foreground" /></div><h1 className="text-3xl md:text-4xl font-bold leading-relaxed">خبير إعادة التدوير الذكي</h1></div></div>{completed.length > 0 && <div className="mt-5 text-center text-sm text-muted-foreground">{totals.mass.toFixed(2)} كغ مواد أُعيد استخدامها • إنجازات بإقرار المستخدم، محفوظة على هذا الجهاز</div>}</header>
    <Tabs value={tab} onValueChange={setTab}><TabsList className="flex mx-auto w-full max-w-md mb-8 bg-muted h-12"><TabsTrigger value="generator" className="flex-1 gap-2"><Lightbulb className="h-4 w-4" />إنشاء</TabsTrigger><TabsTrigger value="saved" className="flex-1 gap-2"><Star className="h-4 w-4" />المحفوظة ({saved.length})</TabsTrigger><TabsTrigger value="chat" className="flex-1 gap-2"><Send className="h-4 w-4" />اسأل الخبير</TabsTrigger></TabsList>
    <TabsContent value="generator"><div className="grid lg:grid-cols-12 gap-8 items-start"><aside className="lg:col-span-4 min-w-0 bg-card border border-border rounded-lg p-6"><div className="flex items-center justify-between gap-2"><h2 className="text-xl font-bold flex gap-2 items-center"><BookOpen className="w-5 h-5 text-primary" />المواد المتوفرة</h2><Button variant="ghost" size="icon" aria-label={sidebarOpen ? 'طي المواد' : 'عرض المواد'} title={sidebarOpen ? 'طي المواد' : 'عرض المواد'} onClick={() => setSidebarOpen(s => !s)}><SlidersHorizontal /></Button></div>{sidebarOpen && <div className="space-y-6 mt-6"><div className="flex flex-wrap gap-2">{COMMON_MATERIALS.map(m => <Button key={m} size="sm" variant={selectedMaterials.includes(m) ? 'default' : 'outline'} className="text-xs h-8 px-3" aria-pressed={selectedMaterials.includes(m)} onClick={() => setSelectedMaterials(s => s.includes(m) ? s.filter(v => v !== m) : [...s,m])}>{m}</Button>)}</div><div><Label htmlFor="materials">مواد أخرى وكمياتها</Label><Textarea id="materials" value={materials} onChange={e => setMaterials(e.target.value)} placeholder="مثلاً: 3 زجاجات، صندوق كرتون، نصف متر قماش…" rows={4} className="mt-2" /></div><div className="grid grid-cols-2 gap-3"><div><Label>المستوى</Label><Select value={userLevel} onValueChange={setUserLevel}><SelectTrigger aria-label="المستوى" className="mt-2"><SelectValue /></SelectTrigger><SelectContent className="recycling-theme"><SelectItem value="child">طفل (6–12)</SelectItem><SelectItem value="teen">مراهق (13–17)</SelectItem><SelectItem value="adult">بالغ</SelectItem></SelectContent></Select></div><div><Label>نوع المشروع</Label><Select value={projectType} onValueChange={setProjectType}><SelectTrigger aria-label="نوع المشروع" className="mt-2"><SelectValue /></SelectTrigger><SelectContent className="recycling-theme"><SelectItem value="practical">عملي</SelectItem><SelectItem value="scientific">علمي</SelectItem><SelectItem value="artistic">فني</SelectItem><SelectItem value="group">جماعي</SelectItem></SelectContent></Select></div></div><input type="file" accept="image/jpeg,image/png,image/webp" ref={fileInput} onChange={upload} className="hidden" /><Button variant="outline" className="w-full border-dashed" disabled={busy} onClick={() => fileInput.current?.click()}><Camera />ارفع صورة للمواد</Button><Button className="w-full h-12 whitespace-normal" disabled={busy} onClick={() => generate()}>{busy ? <Loader2 className="animate-spin" /> : <Lightbulb />}{busy ? 'جاري التحليل…' : 'اقترح مشاريع إبداعية'}</Button>{error && <p role="alert" className="text-destructive text-sm leading-6">{error}</p>}{detectedMaterials.length > 0 && <div className="border-t border-border pt-3 text-sm"><h3 className="font-bold mb-2">المواد التي تعرّف عليها الخبير</h3><p className="text-muted-foreground">{detectedMaterials.join('، ')}</p></div>}</div>}</aside><section className="lg:col-span-8 min-w-0">{grid}</section></div></TabsContent>
    <TabsContent value="saved">{grid}</TabsContent>
    <TabsContent value="chat"><section className="max-w-3xl mx-auto"><h2 className="font-bold text-xl mb-5">اسأل خبير إعادة التدوير</h2>{contextProject && <div className="flex gap-3 items-center justify-between border-b border-border pb-4 mb-4"><p className="text-sm">المشروع: {contextProject.name}</p><Button variant="ghost" size="sm" onClick={() => setContextProject(null)}>إلغاء التحديد</Button></div>}<div aria-live="polite" className="h-96 overflow-y-auto space-y-4 py-4">{!chat.length && <div className="text-center text-muted-foreground py-14"><Recycle className="w-12 h-12 mx-auto mb-3" /><p>ما الذي ترغب بإعادة استخدامه؟</p></div>}{chat.map((m,i) => <div key={i} className={`rounded-lg p-4 text-sm leading-7 whitespace-pre-line max-w-[90%] ${m.role === 'user' ? 'bg-primary text-primary-foreground mr-auto' : 'bg-muted text-foreground'}`}>{m.content}</div>)}{chatBusy && <Loader2 role="status" aria-label="الخبير يجيب" className="animate-spin text-primary" />}<div ref={chatEnd} /></div><form className="flex gap-2 mt-5" onSubmit={e => { e.preventDefault(); send(); }}><GlobalVoiceInput onTranscript={text => setChatInput(p => `${p} ${text}`.trim())} disabled={chatBusy} size="md" /><Input aria-label="سؤال للخبير" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="اكتب سؤالك…" /><Button type="submit" size="icon" title="إرسال" aria-label="إرسال" disabled={chatBusy || !chatInput.trim()}><Send /></Button></form></section></TabsContent>
    </Tabs>
    <footer className="mt-10 border-t border-border pt-5 text-center text-xs text-muted-foreground">تم إنشاء المنصة بواسطة مدرسة عنبه الثانية الشاملة للبنين</footer>
    {active && <ProjectDetails key={projectKey(active)} project={active} onClose={() => setActive(null)} completed={completed.some(c => c.key === projectKey(active))} onSave={() => save(active)} onShare={() => share(active)} onAsk={() => ask(active)} onComplete={complete} onImage={generateImage} imageLoading={imageBusy} />}
  </div></div>;
}
