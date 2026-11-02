// What the central AI can see and do on the admin's screen: read it, click, type, scroll.
// Anything that deletes / publishes / sends / pays is never executed directly: it is returned as
// "needs_confirmation" and runs only after the admin confirms (voice "نعم/أكد" or the on-screen button).

const SKIP = '[data-brain-ui]';

const norm = (s: string) =>
  (s || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const RISKY = /(حذف|احذف|ازاله|إزالة|مسح|delete|remove|destroy|نشر|انشر|publish|ارسال|إرسال|ارسل|أرسل|send|دفع|ادفع|pay|checkout|حظر|block|ban|تعطيل|disable|reset|استعاده|logout|تسجيل الخروج)/i;

function visible(el: Element) {
  const r = (el as HTMLElement).getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  const st = getComputedStyle(el as HTMLElement);
  return st.visibility !== 'hidden' && st.display !== 'none' && Number(st.opacity) > 0.05;
}

const textOf = (el: Element) =>
  ((el as HTMLElement).innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim();

function clickables(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('button, a[href], [role="button"], [role="tab"], [role="menuitem"], summary'))
    .filter((el) => !el.closest(SKIP) && visible(el) && textOf(el).length > 0);
}

function inputs(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea'))
    .filter((el) => !el.closest(SKIP) && visible(el));
}

function labelOfInput(el: HTMLElement) {
  const id = el.id;
  const lab = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
  return (lab?.textContent || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('name') || '').trim();
}

export function readScreen() {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
    .filter((h) => !h.closest(SKIP) && visible(h))
    .map((h) => textOf(h).slice(0, 80))
    .slice(0, 15);
  const actions = Array.from(new Set(clickables().map((el) => textOf(el).slice(0, 50)))).slice(0, 60);
  const fields = inputs().map(labelOfInput).filter(Boolean).slice(0, 15);
  return { path: location.pathname, title: document.title, headings, actions, fields };
}

function best<T extends HTMLElement>(list: T[], wanted: string, get: (el: T) => string): T | null {
  const w = norm(wanted);
  if (!w) return null;
  let found = list.find((el) => norm(get(el)) === w);
  if (!found) found = list.find((el) => norm(get(el)).startsWith(w));
  if (!found) found = list.find((el) => norm(get(el)).includes(w));
  return found ?? null;
}

export function highlight(el: HTMLElement) {
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const prev = el.style.boxShadow;
  const prevT = el.style.transition;
  el.style.transition = 'box-shadow .3s';
  el.style.boxShadow = '0 0 0 3px hsl(var(--brand-from)), 0 0 24px 6px hsl(var(--brand-to) / .55)';
  window.setTimeout(() => { el.style.boxShadow = prev; el.style.transition = prevT; }, 1800);
}

export function findClickable(text: string) {
  return best(clickables(), text, textOf);
}

export function click(el: HTMLElement) {
  highlight(el);
  window.setTimeout(() => el.click(), 450);
}

export function typeInto(field: string, value: string, submit?: boolean) {
  const el = best(inputs(), field, labelOfInput) ?? (inputs().length === 1 ? inputs()[0] : null);
  if (!el) return { ok: false, error: `لا يوجد حقل باسم "${field}"`, fields: inputs().map(labelOfInput) };
  highlight(el);
  el.focus();
  // React-controlled inputs ignore .value = …; use the native setter and fire an input event
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  if (submit) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
    (el as HTMLInputElement).form?.requestSubmit?.();
  }
  return { ok: true };
}

export function scrollPage(direction: string) {
  const h = window.innerHeight * 0.8;
  if (direction === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
  else if (direction === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  else window.scrollBy({ top: direction === 'up' ? -h : h, behavior: 'smooth' });
  return { ok: true };
}

export const isYes = (t: string) => /^(نعم|اه|أه|آه|ايوه|إيوه|أيوه|اكد|أكد|أكّد|اكيد|أكيد|تمام|موافق|نفذ|نفّذ|yes|yeah|confirm|do it|sure)/i.test(norm(t));
export const isNo = (t: string) => /^(لا|لأ|الغ|ألغ|الغي|ألغي|بلاش|خلص لا|no|cancel|stop)/i.test(norm(t));
