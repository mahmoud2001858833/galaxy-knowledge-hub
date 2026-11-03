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
  const actions = Array.from(new Set(clickables().map((el) => textOf(el).slice(0, 40)))).slice(0, 40);
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

/** A full pointer sequence: Radix tabs, menus and selects react to pointerdown/mousedown, not to .click(). */
export function realClick(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const o = { bubbles: true, cancelable: true, composed: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0 };
  el.dispatchEvent(new PointerEvent('pointerdown', { ...o, pointerType: 'mouse', isPrimary: true }));
  el.dispatchEvent(new MouseEvent('mousedown', o));
  el.focus?.();
  el.dispatchEvent(new PointerEvent('pointerup', { ...o, pointerType: 'mouse', isPrimary: true }));
  el.dispatchEvent(new MouseEvent('mouseup', o));
  el.click();
}

export function click(el: HTMLElement) {
  highlight(el);
  window.setTimeout(() => realClick(el), 450);
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

// ---------------------------------------------------------------- experiment controls
// Sliders, number boxes, selects, switches and tabs on the current page, with their current values,
// so the AI can change an experiment's variables and read what happened.

type Control = { el: HTMLElement; kind: 'slider' | 'range' | 'number' | 'text' | 'select' | 'combobox' | 'switch' | 'tab'; name: string };

function contextLabel(el: HTMLElement) {
  const own = el.getAttribute('aria-label') || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent) || '';
  if (own.trim()) return own.trim();
  // climb until an ancestor has some words besides the control itself
  let node: HTMLElement | null = el.parentElement;
  for (let i = 0; i < 4 && node; i++, node = node.parentElement) {
    const t = (node.innerText || '').split('\n').map((x) => x.trim()).filter((x) => x && /[\p{L}]/u.test(x));
    if (t.length) return t[0].slice(0, 60);
  }
  return '';
}

function controls(): Control[] {
  const out: Control[] = [];
  const ok = (el: Element) => !el.closest(SKIP) && visible(el);
  document.querySelectorAll<HTMLElement>('[role="slider"]').forEach((el) => ok(el) && out.push({ el, kind: 'slider', name: contextLabel(el) }));
  document.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach((el) => ok(el) && out.push({ el, kind: 'range', name: contextLabel(el) }));
  document.querySelectorAll<HTMLInputElement>('input[type="number"]').forEach((el) => ok(el) && out.push({ el, kind: 'number', name: contextLabel(el) }));
  document.querySelectorAll<HTMLSelectElement>('select').forEach((el) => ok(el) && out.push({ el, kind: 'select', name: contextLabel(el) }));
  document.querySelectorAll<HTMLElement>('button[role="combobox"]').forEach((el) => ok(el) && out.push({ el, kind: 'combobox', name: contextLabel(el) }));
  document.querySelectorAll<HTMLElement>('[role="switch"], button[role="checkbox"], input[type="checkbox"]').forEach((el) => ok(el) && out.push({ el, kind: 'switch', name: contextLabel(el) }));
  document.querySelectorAll<HTMLElement>('[role="tab"]').forEach((el) => ok(el) && out.push({ el, kind: 'tab', name: textOf(el).slice(0, 50) }));
  return out;
}

function valueOf(c: Control) {
  const el = c.el as HTMLElement & { value?: string; checked?: boolean };
  switch (c.kind) {
    case 'slider': return { value: Number(el.getAttribute('aria-valuenow')), min: Number(el.getAttribute('aria-valuemin')), max: Number(el.getAttribute('aria-valuemax')) };
    case 'range': case 'number': return { value: Number(el.value), min: Number((el as HTMLInputElement).min || NaN), max: Number((el as HTMLInputElement).max || NaN) };
    case 'select': return { value: el.value, options: Array.from((el as unknown as HTMLSelectElement).options).map((o) => o.text).slice(0, 20) };
    case 'combobox': return { value: textOf(el) };
    case 'switch': return { on: el.getAttribute('aria-checked') === 'true' || el.getAttribute('data-state') === 'checked' || Boolean(el.checked) };
    case 'tab': return { selected: el.getAttribute('aria-selected') === 'true' };
  }
}

export function readControls() {
  const list = controls();
  return {
    path: location.pathname,
    controls: list.slice(0, 50).map((c, i) => ({ id: i, kind: c.kind, name: c.name, ...valueOf(c) })),
    hint: list.length ? undefined : 'no sliders/inputs/tabs on this page; try read_page_text or click_element',
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, code: k, bubbles: true, cancelable: true }));

function setNative(el: HTMLInputElement | HTMLSelectElement, value: string) {
  const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Change one control. `control` = its id from read_controls or its name; `value` = number, option text, or on/off. */
export async function setControl(control: string | number, value: string | number | boolean) {
  const list = controls();
  const w = norm(String(control));
  const c = typeof control === 'number' || /^\d+$/.test(String(control))
    ? list[Number(control)]
    : list.find((x) => norm(x.name) === w) ?? list.find((x) => w && norm(x.name).includes(w)) ?? list.find((x) => x.name && w.includes(norm(x.name)));
  if (!c) return { ok: false, error: `no control "${control}"`, controls: readControls().controls };
  highlight(c.el);
  const el = c.el;
  if (c.kind === 'slider') {
    const target = Number(value);
    if (!Number.isFinite(target)) return { ok: false, error: 'slider needs a number' };
    el.focus();
    const now = () => Number(el.getAttribute('aria-valuenow'));
    const min = Number(el.getAttribute('aria-valuemin')), max = Number(el.getAttribute('aria-valuemax'));
    const goal = Math.min(max, Math.max(min, target));
    if (goal === min) key(el, 'Home');
    else if (goal === max) key(el, 'End');
    else {
      // big jumps (PageUp/Down) until we'd pass the goal, then single steps; stop on the closest value
      let big = true;
      for (let i = 0; i < 3000; i++) {
        const before = now();
        if (Math.abs(before - goal) < 1e-9) break;
        const up = goal > before;
        key(el, big ? (up ? 'PageUp' : 'PageDown') : (up ? 'ArrowUp' : 'ArrowDown'));
        await sleep(16); // React re-renders aria-valuenow after the event
        const after = now();
        if (after === before) { if (big) { big = false; continue; } break; }
        if ((goal - before) * (goal - after) < 0) {
          if (big) { key(el, up ? 'PageDown' : 'PageUp'); await sleep(16); big = false; continue; }
          if (Math.abs(goal - before) < Math.abs(goal - after)) { key(el, up ? 'ArrowDown' : 'ArrowUp'); await sleep(16); }
          break;
        }
      }
    }
    await sleep(250);
    return { ok: true, name: c.name, value: now() };
  }
  if (c.kind === 'range' || c.kind === 'number' || c.kind === 'text') {
    setNative(el as HTMLInputElement, String(value));
    await sleep(250);
    return { ok: true, name: c.name, value: (el as HTMLInputElement).value };
  }
  if (c.kind === 'select') {
    const sel = el as unknown as HTMLSelectElement;
    const opt = Array.from(sel.options).find((o) => norm(o.text).includes(norm(String(value))) || o.value === String(value));
    if (!opt) return { ok: false, error: 'no such option', options: Array.from(sel.options).map((o) => o.text) };
    setNative(sel, opt.value);
    await sleep(250);
    return { ok: true, name: c.name, value: opt.text };
  }
  if (c.kind === 'combobox') {
    realClick(el);
    await sleep(200);
    if (!document.querySelector('[role="option"]')) { key(el, 'Enter'); await sleep(200); }
    const opts = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
    const opt = opts.find((o) => norm(textOf(o)).includes(norm(String(value))));
    if (!opt) { key(el, 'Escape'); return { ok: false, error: 'no such option', options: opts.map(textOf) }; }
    opt.focus();
    key(opt, 'Enter');
    realClick(opt);
    await sleep(250);
    return { ok: true, name: c.name, value: textOf(el) };
  }
  if (c.kind === 'switch') {
    const want = typeof value === 'boolean' ? value : /^(on|true|1|نعم|شغل|فعل)/i.test(String(value));
    const on = (valueOf(c) as { on: boolean }).on;
    if (on !== want) realClick(el);
    await sleep(250);
    return { ok: true, name: c.name, on: (valueOf(c) as { on: boolean }).on };
  }
  // tab
  realClick(el);
  await sleep(300);
  return { ok: true, tab: c.name, selected: el.getAttribute('aria-selected') === 'true' };
}

/** The visible text of the page (results, readouts, explanations), for the AI to explain. */
export function readPageText(max = 1800) {
  const root = (document.querySelector('main') as HTMLElement) || document.body;
  const clone = root.innerText || '';
  const brain = document.querySelector(SKIP) as HTMLElement | null;
  let text = clone;
  if (brain?.innerText) text = text.replace(brain.innerText, '');
  text = text.split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
  return { path: location.pathname, text: text.slice(0, max), truncated: text.length > max };
}
