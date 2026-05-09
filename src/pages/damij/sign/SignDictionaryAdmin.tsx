import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Plus, Video, ImageIcon, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSignDictionary, normalizeWord, type SignDictionaryEntry } from '@/features/sign-language/useSignDictionary';

const SignDictionaryAdmin: React.FC = () => {
  const { toast } = useToast();
  const { entries, refetch, loading } = useSignDictionary();
  const [filter, setFilter] = useState('');
  const [filterLang, setFilterLang] = useState<'all' | 'ArSL' | 'ASL'>('all');

  // form state
  const [word, setWord] = useState('');
  const [language, setLanguage] = useState<'ArSL' | 'ASL'>('ArSL');
  const [description, setDescription] = useState('');
  const [handshape, setHandshape] = useState('');
  const [movement, setMovement] = useState('');
  const [handsCount, setHandsCount] = useState<1 | 2>(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setWord(''); setDescription(''); setHandshape(''); setMovement('');
    setHandsCount(1); setVideoFile(null); setImageFile(null);
    if (videoRef.current) videoRef.current.value = '';
    if (imageRef.current) imageRef.current.value = '';
  };

  const uploadFile = async (file: File, kind: 'video' | 'image'): Promise<string> => {
    const ext = file.name.split('.').pop() || (kind === 'video' ? 'mp4' : 'jpg');
    const path = `${language}/${kind}/${normalizeWord(word).replace(/\s+/g, '_')}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('sign-language-media').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('sign-language-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!word.trim()) {
      toast({ title: 'الكلمة مطلوبة', variant: 'destructive' });
      return;
    }
    if (!videoFile && !imageFile) {
      toast({ title: 'يجب رفع فيديو أو صورة على الأقل', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      let video_url: string | null = null;
      let image_url: string | null = null;
      if (videoFile) video_url = await uploadFile(videoFile, 'video');
      if (imageFile) image_url = await uploadFile(imageFile, 'image');

      const { error } = await supabase.from('sign_dictionary').upsert({
        word: word.trim(),
        word_normalized: normalizeWord(word),
        language,
        video_url,
        image_url,
        description: description.trim() || null,
        handshape: handshape.trim() || null,
        movement: movement.trim() || null,
        hands_count: handsCount,
        created_by: user?.id || null,
      }, { onConflict: 'language,word_normalized' });

      if (error) throw error;
      toast({ title: 'تم حفظ الإشارة بنجاح' });
      reset();
      refetch();
    } catch (e: any) {
      toast({ title: 'فشل الحفظ', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entry: SignDictionaryEntry) => {
    if (!confirm(`حذف إشارة «${entry.word}»؟`)) return;
    const { error } = await supabase.from('sign_dictionary').delete().eq('id', entry.id);
    if (error) {
      toast({ title: 'فشل الحذف', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم الحذف' });
      refetch();
    }
  };

  const filtered = entries.filter(e => {
    if (filterLang !== 'all' && e.language !== filterLang) return false;
    if (filter && !e.word.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="px-6 pt-8 pb-16 max-w-6xl mx-auto" dir="rtl">
      <Link to="/damij/sign" className="inline-flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-6 hover:gap-3 transition-all">
        <ArrowLeft className="w-4 h-4" /> رجوع لمترجم الإشارة
      </Link>

      <h1 className="text-3xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">قاموس لغة الإشارة — لوحة الإدارة</h1>
      <p className="text-[hsl(var(--damij-text))]/70 mb-8">
        ارفع فيديوهات أو صور حقيقية لكل إشارة. سيستخدمها المترجم تلقائياً عند ترجمة النص إلى إشارة.
      </p>

      {/* Add form */}
      <Card className="mb-8 border-[hsl(var(--damij-primary))]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5" /> إضافة / تحديث إشارة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1 block">الكلمة *</label>
              <Input value={word} onChange={e => setWord(e.target.value)} placeholder="مثال: مرحبا" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">نظام لغة الإشارة *</label>
              <select value={language} onChange={e => setLanguage(e.target.value as any)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="ArSL">ArSL — لغة الإشارة العربية</option>
                <option value="ASL">ASL — American Sign Language</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">عدد الأيدي</label>
              <select value={handsCount} onChange={e => setHandsCount(Number(e.target.value) as 1 | 2)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value={1}>يد واحدة</option>
                <option value={2}>يدان</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1 block">شكل اليد (اختياري)</label>
              <Input value={handshape} onChange={e => setHandshape(e.target.value)} placeholder="مثال: قبضة مغلقة، إصبع السبابة..." />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">الحركة (اختياري)</label>
              <Input value={movement} onChange={e => setMovement(e.target.value)} placeholder="مثال: حركة دائرية، من الأسفل للأعلى..." />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block">وصف الإشارة (اختياري)</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="وصف تفصيلي لطريقة أداء الإشارة..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-[hsl(var(--damij-primary))]/30 rounded-xl p-4">
              <label className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Video className="w-3.5 h-3.5" /> فيديو الإشارة (mp4 / webm)
              </label>
              <input ref={videoRef} type="file" accept="video/*"
                onChange={e => setVideoFile(e.target.files?.[0] || null)}
                className="text-sm w-full" />
              {videoFile && (
                <p className="text-xs text-emerald-600 mt-2">✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)</p>
              )}
            </div>
            <div className="border-2 border-dashed border-[hsl(var(--damij-primary))]/30 rounded-xl p-4">
              <label className="text-xs font-semibold mb-2 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> صورة ثابتة (اختياري كبديل)
              </label>
              <input ref={imageRef} type="file" accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="text-sm w-full" />
              {imageFile && (
                <p className="text-xs text-emerald-600 mt-2">✓ {imageFile.name}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={reset} disabled={submitting}>إفراغ النموذج</Button>
            <Button onClick={handleSubmit} disabled={submitting}
              className="bg-[hsl(var(--damij-primary))] text-white hover:opacity-90">
              {submitting ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Upload className="w-4 h-4 ml-2" />}
              حفظ الإشارة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="بحث بالكلمة..." className="pr-10" />
        </div>
        {(['all', 'ArSL', 'ASL'] as const).map(l => (
          <Button key={l} size="sm" variant={filterLang === l ? 'default' : 'outline'} onClick={() => setFilterLang(l)}>
            {l === 'all' ? 'الكل' : l}
          </Button>
        ))}
        <Badge variant="secondary">{filtered.length} / {entries.length}</Badge>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
          لا توجد إشارات بعد. ابدأ برفع أول إشارة من النموذج أعلاه.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(entry => (
            <Card key={entry.id} className="overflow-hidden">
              <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                {entry.video_url ? (
                  <video src={entry.video_url} controls muted loop className="w-full h-full object-contain" />
                ) : entry.image_url ? (
                  <img src={entry.image_url} alt={entry.word} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">لا يوجد وسائط</span>
                )}
                <Badge className="absolute top-2 left-2" variant="secondary">{entry.language}</Badge>
              </div>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-base">{entry.word}</h3>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(entry)}
                    className="h-7 w-7 text-rose-500 hover:bg-rose-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {entry.description && <p className="text-xs text-muted-foreground line-clamp-2">{entry.description}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.handshape && <Badge variant="outline" className="text-[10px]">{entry.handshape}</Badge>}
                  {entry.movement && <Badge variant="outline" className="text-[10px]">{entry.movement}</Badge>}
                  {entry.hands_count === 2 && <Badge variant="outline" className="text-[10px]">يدان</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SignDictionaryAdmin;
