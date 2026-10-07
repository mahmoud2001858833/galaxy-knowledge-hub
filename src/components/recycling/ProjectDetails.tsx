import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Leaf, CheckCircle, Star, Share2, Send, Download } from 'lucide-react';
import { calculateProjectImpact, initialImpact, MATERIAL_FACTORS, IMPACT_NOTE, type ImpactInput, type MaterialId, type RecyclingProject } from './model';

interface Props { project: RecyclingProject; completed: boolean; onClose: () => void; onSave: () => void; onShare: () => void; onAsk: () => void; onComplete: (input: ImpactInput) => void; onImage: () => void; imageLoading: boolean }
export default function ProjectDetails({ project, completed, onClose, onSave, onShare, onAsk, onComplete, onImage, imageLoading }: Props) {
  const [input, setInput] = useState<ImpactInput>(() => initialImpact(project));
  const [confirmed, setConfirmed] = useState(false);
  const impact = calculateProjectImpact(input);
  const sections = [['المواد المطلوبة', project.materials], ['الأدوات والبدائل', project.tools], ['خطوات التنفيذ', project.steps], ['المبدأ العلمي', project.principle], ['فحص جودة المشروع', project.qualityCheck], ['النتيجة المتوقعة', project.results], ['التطوير والبدائل', project.development], ['بدائل المواد', project.alternatives], ['الصيانة ونهاية العمر', project.maintenance], ['الاستدامة', project.sustainability]];
  const exportProject = () => {
    const text = `${project.name}\n${project.idea}\n\n${sections.filter(s => s[1]).map(s => `${s[0]}\n${s[1]}`).join('\n\n')}\n\nالسلامة\n${project.safety}\n\nتقدير الأثر: ${impact.net.toFixed(2)} كغ CO₂e\n${input.rows.map(r => `${r.material}: ${r.massKg} كغ`).join('\n')}\nاستبدال: ${input.replacement}%\nتنفيذ: ${input.processKg} كغ CO₂e\n${IMPACT_NOTE}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `${project.name}.txt`; a.click(); URL.revokeObjectURL(url);
  };
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent dir="rtl" className="recycling-theme max-w-4xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto rounded-lg p-6 sm:p-8">
    <DialogTitle className="text-2xl pl-7 leading-relaxed">{project.name}</DialogTitle><DialogDescription className="text-muted-foreground leading-relaxed">{project.idea}</DialogDescription>
    <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={onSave}><Star />حفظ</Button><Button variant="outline" size="icon" title="مشاركة المشروع" aria-label="مشاركة المشروع" onClick={onShare}><Share2 /></Button><Button variant="outline" size="icon" title="تنزيل تفاصيل المشروع" aria-label="تنزيل تفاصيل المشروع" onClick={exportProject}><Download /></Button><Button variant="outline" size="sm" onClick={onAsk}><Send />اسأل عن المشروع</Button></div>
    <Tabs defaultValue="steps"><TabsList className="w-full bg-muted"><TabsTrigger value="steps" className="flex-1">التنفيذ</TabsTrigger><TabsTrigger value="safety" className="flex-1">السلامة</TabsTrigger><TabsTrigger value="impact" className="flex-1">الأثر البيئي</TabsTrigger></TabsList>
      <TabsContent value="steps" className="space-y-6 py-4">{project.generatedImage ? <img src={project.generatedImage} alt={project.name} className="w-full max-h-80 object-contain rounded-lg" /> : <Button variant="outline" disabled={imageLoading} onClick={onImage}>{imageLoading ? 'جاري إنشاء الصورة…' : 'إنشاء صورة توضيحية للمشروع'}</Button>}{sections.filter(s => s[1]).map(([title, text]) => <section key={title} className="border-b border-border pb-5"><h3 className="font-bold mb-2">{title}</h3><p className="text-muted-foreground whitespace-pre-line leading-8 text-sm">{text}</p></section>)}</TabsContent>
      <TabsContent value="safety" className="py-5 space-y-3"><h3 className="text-destructive font-bold">تحذيرات وإجراءات الأمان</h3><p className="whitespace-pre-line leading-8">{project.safety || 'استخدم أدوات مناسبة للعمر وتحت إشراف بالغ. لا تسخّن البلاستيك ولا تستخدم عبوات مواد كيميائية.'}</p></TabsContent>
      <TabsContent value="impact" className="space-y-5 py-5"><h3 className="font-bold flex items-center gap-2"><Leaf />حساب الانبعاثات المتجنّبة</h3><p className="text-sm text-muted-foreground">الأوزان المقترحة من الذكاء الاصطناعي تحتاج مراجعتك. أدخل وزن المواد المستعملة فعلياً بالكيلوغرام.</p>
        {input.rows.map((row, i) => <div key={i} className="grid grid-cols-[1fr_100px_40px] gap-2 items-end"><div><Label>المادة</Label><Select value={row.material} onValueChange={v => setInput(p => ({ ...p, rows: p.rows.map((r,j) => j === i ? { ...r, material: v as MaterialId } : r) }))}><SelectTrigger aria-label={`مادة ${i+1}`}><SelectValue /></SelectTrigger><SelectContent className="recycling-theme">{MATERIAL_FACTORS.map(f => <SelectItem value={f.id} key={f.id}>{f.label} ({f.factor})</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor={`weight-${i}`}>الوزن (كغ)</Label><Input id={`weight-${i}`} type="number" min="0" step="0.01" value={row.massKg} onChange={e => setInput(p => ({ ...p, rows: p.rows.map((r,j) => j === i ? { ...r, massKg: Math.max(0, Number(e.target.value)) } : r) }))} /></div><Button variant="ghost" size="icon" aria-label={`حذف مادة ${i+1}`} disabled={input.rows.length === 1} onClick={() => setInput(p => ({ ...p, rows: p.rows.filter((_,j) => i !== j) }))}><Trash2 /></Button></div>)}
        <Button variant="outline" size="sm" onClick={() => setInput(p => ({ ...p, rows: [...p.rows, { material: 'other', massKg: 0 }] }))}><Plus />إضافة مادة</Button>
        <div className="grid sm:grid-cols-2 gap-4"><div><Label htmlFor="replacement">نسبة استبدال شراء منتج جديد (%)</Label><Input id="replacement" type="number" min="0" max="100" value={input.replacement} onChange={e => setInput(p => ({ ...p, replacement: Math.max(0, Math.min(100, Number(e.target.value))) }))} /></div><div><Label htmlFor="process">انبعاثات الطاقة والمواد الجديدة (كغ CO₂e)</Label><Input id="process" type="number" min="0" step="0.01" value={input.processKg} onChange={e => setInput(p => ({ ...p, processKg: Math.max(0, Number(e.target.value)) }))} /></div></div>
        <div className="border-y border-border py-5 flex gap-8 flex-wrap"><div><p className="text-sm text-muted-foreground">صافي الأثر التقديري</p><strong className="text-3xl impact-number">{impact.net.toFixed(2)}</strong> كغ CO₂e</div><div><p className="text-sm text-muted-foreground">مواد أُعيد استخدامها</p><strong className="text-3xl impact-number">{impact.mass.toFixed(2)}</strong> كغ</div></div>
        {impact.net < 0 && <p className="text-destructive text-sm">انبعاثات التنفيذ تتجاوز الإنتاج المتجنّب؛ لا يوجد وفر إيجابي بهذا التقدير.</p>}
        <p className="text-xs text-muted-foreground leading-6">{IMPACT_NOTE}</p><a href="https://www.epa.gov/warm" target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">مرجع منهجي للمقارنة: نموذج EPA WARM</a>
        <label className="flex gap-3 items-start text-sm leading-6"><Checkbox checked={confirmed} onCheckedChange={v => setConfirmed(v === true)} />أؤكد تنفيذ المشروع ومراجعة الأوزان ونسبة الاستبدال. هذا أثر تقديري بإقرار المستخدم، وليس وفراً موثّقاً.</label>
        <Button className="w-full" disabled={completed || !confirmed || impact.mass <= 0} onClick={() => onComplete(input)}><CheckCircle />{completed ? 'تم تسجيل هذا المشروع مسبقاً' : 'تسجيل الإنجاز والأثر البيئي'}</Button>
      </TabsContent>
    </Tabs>
  </DialogContent></Dialog>;
}
