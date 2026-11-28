// The model is told never to emit LaTeX, but this is a defensive fallback in case it slips into
// $...$ / \command syntax anyway — converts the common chemistry/physics/math LaTeX bits into plain
// Unicode so a raw "$H_2O$" or "\rightarrow" never reaches the admin as literal source text.

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ',
};
const SUBSCRIPT: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
};
const GREEK: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', epsilon: 'ε', theta: 'θ', lambda: 'λ',
  mu: 'μ', pi: 'π', sigma: 'σ', Sigma: 'Σ', phi: 'φ', omega: 'ω', Omega: 'Ω', rho: 'ρ', tau: 'τ', nu: 'ν',
};
const SYMBOLS: [RegExp, string][] = [
  [/\\rightleftharpoons/g, '⇌'], [/\\leftrightarrow/g, '↔'], [/\\rightarrow|\\to\b/g, '→'], [/\\leftarrow/g, '←'],
  [/\\times/g, '×'], [/\\cdot/g, '·'], [/\\pm/g, '±'], [/\\approx/g, '≈'], [/\\neq/g, '≠'], [/\\leq/g, '≤'], [/\\geq/g, '≥'],
  [/\\degree/g, '°'], [/\\circ\b/g, '°'], [/\\infty/g, '∞'], [/\\sqrt\{([^}]*)\}/g, '√($1)'],
];

function mapRun(run: string, table: Record<string, string>): string {
  return [...run].map((c) => table[c] ?? c).join('');
}

/** Converts `_{..}`/`_x` and `^{..}`/`^x` into Unicode sub/superscripts where a mapping exists. */
function convertScripts(text: string): string {
  let out = text.replace(/[\^_]\{([^{}]*)\}/g, (_m, inner, offset, full) => {
    const isSup = full[offset] === '^';
    const table = isSup ? SUPERSCRIPT : SUBSCRIPT;
    const mapped = mapRun(inner, table);
    return mapped === inner && inner.length > 1 ? (isSup ? `^${inner}` : `_${inner}`) : mapped;
  });
  out = out.replace(/\^(\w)/g, (_m, c) => SUPERSCRIPT[c] ?? `^${c}`);
  out = out.replace(/_(\w)/g, (_m, c) => SUBSCRIPT[c] ?? `_${c}`);
  return out;
}

export function cleanScientificText(input: string): string {
  if (!input) return input;
  let t = input;
  for (const [re, rep] of SYMBOLS) t = t.replace(re, rep);
  t = t.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1⁄$2');
  t = t.replace(/\\(alpha|beta|gamma|Delta|delta|epsilon|theta|lambda|mu|pi|Sigma|sigma|phi|omega|Omega|rho|tau|nu)\b/g, (_m, g) => GREEK[g] ?? _m);
  t = convertScripts(t);
  // unwrap $...$ / \(...\) / \[...\] math delimiters now that their insides are plain Unicode
  t = t.replace(/\\\[(.*?)\\\]/gs, '$1').replace(/\\\((.*?)\\\)/gs, '$1');
  t = t.replace(/\$\$(.*?)\$\$/gs, '$1').replace(/\$([^$\n]+)\$/g, '$1');
  // stray backslash-escaped characters left over from LaTeX (e.g. \%, \&)
  t = t.replace(/\\([%&_#])/g, '$1');
  return t;
}
