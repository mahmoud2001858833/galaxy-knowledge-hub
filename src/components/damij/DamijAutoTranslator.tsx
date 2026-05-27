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
    const parsed = JSON.parse(localStorage.getItem(CACHE_PREFIX + lang) || '{}') as Record<string, string>;
    const clean: Record<string, string> = {};
    for (const [source, translated] of Object.entries(parsed)) {
      if (typeof translated === 'string' && translated.trim() && translated.trim() !== source.trim()) {
        clean[source] = translated;
      }
    }
    if (Object.keys(clean).length !== Object.keys(parsed).length) saveCache(lang, clean);
    return clean;
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
    if (!cache[orig] || cache[orig].trim() === orig.trim()) missing.add(orig);
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

const ensureLoader = () => {
  let el = document.getElementById('damij-tr-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'damij-tr-loader';
    el.style.cssText =
      'position:fixed;top:76px;left:50%;transform:translateX(-50%);z-index:9999;' +
      'min-width:240px;max-width:90vw;padding:10px 16px;border-radius:14px;' +
      'background:rgba(15,23,42,0.92);color:#fff;font-size:12px;font-weight:600;' +
      'box-shadow:0 16px 40px -10px rgba(2,6,23,.6);' +
      'display:flex;flex-direction:column;gap:6px;backdrop-filter:blur(10px);' +
      'transition:opacity .25s;font-family:"Tajawal","Cairo","Inter",sans-serif;';
    el.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">' +
      '<span class="damij-tr-text" style="letter-spacing:.02em"></span>' +
      '<span class="damij-tr-count" style="opacity:.85;font-variant-numeric:tabular-nums"></span>' +
      '</div>' +
      '<div style="height:4px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden">' +
      '<div class="damij-tr-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#06b6d4,#a78bfa);transition:width .3s ease"></div>' +
      '</div>';
    document.body.appendChild(el);
  }
  return el;
};
const showLoader = (lang: string, done: number, total: number) => {
  const el = ensureLoader();
  el.style.opacity = '1';
  const t = el.querySelector('.damij-tr-text') as HTMLElement | null;
  const c = el.querySelector('.damij-tr-count') as HTMLElement | null;
  const bar = el.querySelector('.damij-tr-bar') as HTMLElement | null;
  if (t) t.textContent = `Translating → ${lang.toUpperCase()}`;
  if (c) c.textContent = `${done}/${total}`;
  if (bar) bar.style.width = `${total > 0 ? Math.min(100, (done / total) * 100) : 0}%`;
};
const hideLoader = () => {
  const el = document.getElementById('damij-tr-loader');
  if (el) el.style.opacity = '0';
};

const DamijAutoTranslator: React.FC = () => {
  const { lang } = useDamijLang();
  const { pathname } = useLocation();
  const debounceRef = useRef<number | null>(null);
  const runIdRef = useRef<number>(0);

  useEffect(() => {
    const root = document.querySelector('.damij-root');
    if (!root) return;

    if (lang === 'ar') {
      restoreOriginals(root);
      hideLoader();
      return;
    }

    const cache = loadCache(lang);
    const myRunId = ++runIdRef.current;

    const run = async () => {
      // Cancel if a newer language switch happened
      if (myRunId !== runIdRef.current) return;

      const { nodes, missing } = collectTextNodes(root, lang, cache);
      // Apply whatever we already have first for instant feedback
      applyTranslations(nodes, lang, cache);

      if (missing.length === 0) {
        hideLoader();
        return;
      }

      showLoader(lang, 0, missing.length);

      // Smaller batches → faster first paint, higher parallelism
      const BATCH = 25;
      const batches: string[][] = [];
      for (let i = 0; i < missing.length; i += BATCH) {
        batches.push(missing.slice(i, i + BATCH));
      }

      let done = 0;
      try {
        await Promise.all(
          batches.map(async (batch) => {
            if (myRunId !== runIdRef.current) return;
            const { data, error } = await supabase.functions.invoke('damij-translate', {
              body: { texts: batch, target: lang },
            });
            if (myRunId !== runIdRef.current) return;
            if (error) {
              console.warn('[damij-translate] error', error);
              done += batch.length;
              showLoader(lang, done, missing.length);
              return;
            }
            const translations: Record<string, string> = data?.translations || {};
            for (const [source, translated] of Object.entries(translations)) {
              if (translated && translated.trim() !== source.trim()) cache[source] = translated;
            }
            saveCache(lang, cache);
            const fresh = collectTextNodes(root, lang, cache);
            applyTranslations(fresh.nodes, lang, cache);
            done += batch.length;
            showLoader(lang, done, missing.length);
          }),
        );
      } finally {
        if (myRunId === runIdRef.current) hideLoader();
      }
    };

    const schedule = (immediate = false) => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(run, immediate ? 0 : 150);
    };

    schedule(true);

    const observer = new MutationObserver(() => schedule(false));
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [lang, pathname]);

  return null;
};

export default DamijAutoTranslator;
