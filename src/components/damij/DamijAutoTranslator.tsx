import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

/**
 * DOM-wide auto translator for the Damij subtree.
 * - Scans visible text nodes inside `.damij-root`
 * - Sends untranslated unique strings (Arabic) in batches to `damij-translate`
 * - Replaces text content with the translated version
 * - Caches per-language in localStorage to avoid re-translating
 * - Re-runs on route changes, language changes, and DOM mutations
 *
 * It is a no-op when language is `ar`.
 */

const CACHE_PREFIX = 'damij_t_cache_';
const HAS_ARABIC = /[\u0600-\u06FF]/;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'SVG']);
const ATTR_ORIG = 'data-damij-orig';

const loadCache = (lang: string): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_PREFIX + lang) || '{}');
  } catch {
    return {};
  }
};
const saveCache = (lang: string, c: Record<string, string>) => {
  try {
    localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(c));
  } catch {
    /* quota */
  }
};

const collectTextNodes = (root: Element, lang: string, cache: Record<string, string>) => {
  const nodes: Text[] = [];
  const missing = new Set<string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-damij-no-translate]')) return NodeFilter.FILTER_REJECT;
      const text = node.nodeValue?.trim();
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
      // Only translate Arabic source text. If already translated (no Arabic), skip.
      const orig = parent.getAttribute(ATTR_ORIG);
      const source = orig && lang !== 'ar' ? orig : text;
      if (!HAS_ARABIC.test(source)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let cur: Node | null = walker.nextNode();
  while (cur) {
    nodes.push(cur as Text);
    cur = walker.nextNode();
  }

  for (const tn of nodes) {
    const parent = tn.parentElement!;
    const orig = parent.getAttribute(ATTR_ORIG) || (tn.nodeValue || '').trim();
    if (!cache[orig]) missing.add(orig);
  }
  return { nodes, missing: Array.from(missing) };
};

const applyTranslations = (nodes: Text[], lang: string, cache: Record<string, string>) => {
  for (const tn of nodes) {
    const parent = tn.parentElement;
    if (!parent) continue;
    const original = parent.getAttribute(ATTR_ORIG) || (tn.nodeValue || '').trim();
    if (!parent.getAttribute(ATTR_ORIG)) parent.setAttribute(ATTR_ORIG, original);
    const translated = lang === 'ar' ? original : cache[original];
    if (translated && translated !== tn.nodeValue?.trim()) {
      // Preserve surrounding whitespace
      const raw = tn.nodeValue || '';
      const leading = raw.match(/^\s*/)?.[0] || '';
      const trailing = raw.match(/\s*$/)?.[0] || '';
      tn.nodeValue = `${leading}${translated}${trailing}`;
    }
  }
};

const restoreOriginals = (root: Element) => {
  const els = root.querySelectorAll(`[${ATTR_ORIG}]`);
  els.forEach((el) => {
    const orig = el.getAttribute(ATTR_ORIG);
    if (!orig) return;
    // Find first text-only child and replace its value
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE && (child.nodeValue || '').trim()) {
        const raw = child.nodeValue || '';
        const leading = raw.match(/^\s*/)?.[0] || '';
        const trailing = raw.match(/\s*$/)?.[0] || '';
        child.nodeValue = `${leading}${orig}${trailing}`;
        break;
      }
    }
    el.removeAttribute(ATTR_ORIG);
  });
};

const DamijAutoTranslator: React.FC = () => {
  const { lang } = useDamijLang();
  const { pathname } = useLocation();
  const debounceRef = useRef<number | null>(null);
  const inflightRef = useRef<boolean>(false);

  useEffect(() => {
    const root = document.querySelector('.damij-root');
    if (!root) return;

    if (lang === 'ar') {
      restoreOriginals(root);
      return;
    }

    const cache = loadCache(lang);

    const run = async () => {
      if (inflightRef.current) return;
      const { nodes, missing } = collectTextNodes(root, lang, cache);
      // Apply whatever we already have first for instant feedback
      applyTranslations(nodes, lang, cache);

      if (missing.length === 0) return;

      // Batch up to 60 strings per request
      const BATCH = 60;
      const batches: string[][] = [];
      for (let i = 0; i < missing.length; i += BATCH) {
        batches.push(missing.slice(i, i + BATCH));
      }

      inflightRef.current = true;
      try {
        for (const batch of batches) {
          const { data, error } = await supabase.functions.invoke('damij-translate', {
            body: { texts: batch, target: lang },
          });
          if (error) {
            console.warn('[damij-translate] error', error);
            break;
          }
          const translations: Record<string, string> = data?.translations || {};
          Object.assign(cache, translations);
          saveCache(lang, cache);
          // Re-collect because DOM may have changed
          const fresh = collectTextNodes(root, lang, cache);
          applyTranslations(fresh.nodes, lang, cache);
        }
      } finally {
        inflightRef.current = false;
      }
    };

    const schedule = () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(run, 250);
    };

    // Initial pass
    schedule();

    const observer = new MutationObserver(() => schedule());
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [lang, pathname]);

  return null;
};

export default DamijAutoTranslator;
