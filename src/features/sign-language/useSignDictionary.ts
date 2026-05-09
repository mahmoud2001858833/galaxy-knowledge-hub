import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SignDictionaryEntry = {
  id: string;
  word: string;
  word_normalized: string;
  language: 'ArSL' | 'ASL';
  video_url: string | null;
  image_url: string | null;
  description: string | null;
  handshape: string | null;
  movement: string | null;
  hands_count: number | null;
};

export const normalizeWord = (s: string): string =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[.,!?؟،;:"'()[\]{}]/g, '')
    .replace(/\s+/g, ' ');

export function useSignDictionary(language?: 'ArSL' | 'ASL') {
  const [entries, setEntries] = useState<SignDictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    let q = supabase.from('sign_dictionary').select('*').order('word');
    if (language) q = q.eq('language', language);
    const { data } = await q;
    setEntries((data as SignDictionaryEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { refetch(); /* eslint-disable-next-line */ }, [language]);

  const lookup = useMemo(() => {
    const map = new Map<string, SignDictionaryEntry>();
    entries.forEach(e => map.set(`${e.language}:${e.word_normalized}`, e));
    return map;
  }, [entries]);

  const find = (word: string, lang: 'ArSL' | 'ASL'): SignDictionaryEntry | null =>
    lookup.get(`${lang}:${normalizeWord(word)}`) || null;

  return { entries, loading, refetch, find };
}
