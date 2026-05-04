// Lightweight i18n for the Sign Dictionary UI + automatic mapping
// from a spoken language code → the most appropriate sign system.

export interface UiStrings {
  title: string;
  subtitle: (n: number, cats: number, langs: number, systems: number) => string;
  signSystem: string;
  displayLanguage: string;
  selected: string;
  searchLanguagePlaceholder: string;
  searchPlaceholder: (n: number, lang: string) => string;
  categories: string;
  all: string;
  favorites: string;
  results: (n: number) => string;
  loadMore: (n: number) => string;
  empty: string;
  translating: (lang: string) => string;
  rtl: boolean;
}

const en: UiStrings = {
  title: 'World Sign Language Dictionary',
  subtitle: (n, c, l, s) => `${n}+ terms in ${c} categories · supports ${l}+ languages and ${s} sign systems`,
  signSystem: 'Sign system',
  displayLanguage: 'Display language',
  selected: 'Selected',
  searchLanguagePlaceholder: 'Search a language (English, Français, 中文…)',
  searchPlaceholder: (n, lang) => `Search ${n} terms (in Arabic or ${lang})…`,
  categories: 'Categories',
  all: 'All',
  favorites: 'Favorites',
  results: (n) => `${n} results`,
  loadMore: (n) => `Show more (${n} remaining)`,
  empty: 'No results. Try another word or category.',
  translating: (lang) => `Translating titles to ${lang}…`,
  rtl: false,
};

const ar: UiStrings = {
  title: 'القاموس العالمي للغة الإشارة',
  subtitle: (n, c, l, s) => `${n}+ مصطلح في ${c} فئة · يدعم ${l}+ لغة و ${s} نظام إشارة`,
  signSystem: 'نظام الإشارة',
  displayLanguage: 'لغة العرض',
  selected: 'المختارة',
  searchLanguagePlaceholder: 'ابحث عن لغة (English, Français, 中文…)',
  searchPlaceholder: (n, lang) => `ابحث في ${n} مصطلحاً (بالعربية أو ${lang})…`,
  categories: 'الفئات',
  all: 'الكل',
  favorites: 'مفضلتي',
  results: (n) => `${n} نتيجة`,
  loadMore: (n) => `عرض المزيد (${n} متبقي)`,
  empty: 'لا توجد نتائج. جرّب كلمة أخرى أو فئة مختلفة.',
  translating: (lang) => `ترجمة العناوين إلى ${lang}…`,
  rtl: true,
};

const fr: UiStrings = {
  ...en,
  title: 'Dictionnaire mondial de la langue des signes',
  subtitle: (n, c, l, s) => `${n}+ termes dans ${c} catégories · ${l}+ langues et ${s} systèmes de signes`,
  signSystem: 'Système de signes',
  displayLanguage: 'Langue d\'affichage',
  selected: 'Sélectionnée',
  searchLanguagePlaceholder: 'Rechercher une langue…',
  searchPlaceholder: (n, lang) => `Rechercher parmi ${n} termes (en arabe ou ${lang})…`,
  categories: 'Catégories',
  all: 'Tout',
  favorites: 'Favoris',
  results: (n) => `${n} résultats`,
  loadMore: (n) => `Voir plus (${n} restants)`,
  empty: 'Aucun résultat.',
  translating: (lang) => `Traduction des titres en ${lang}…`,
};

const es: UiStrings = {
  ...en,
  title: 'Diccionario mundial de lengua de signos',
  subtitle: (n, c, l, s) => `${n}+ términos en ${c} categorías · ${l}+ idiomas y ${s} sistemas`,
  signSystem: 'Sistema de signos',
  displayLanguage: 'Idioma de visualización',
  selected: 'Seleccionado',
  searchLanguagePlaceholder: 'Buscar un idioma…',
  searchPlaceholder: (n, lang) => `Buscar entre ${n} términos (en árabe o ${lang})…`,
  categories: 'Categorías',
  all: 'Todo',
  favorites: 'Favoritos',
  results: (n) => `${n} resultados`,
  loadMore: (n) => `Mostrar más (${n} restantes)`,
  empty: 'Sin resultados.',
  translating: (lang) => `Traduciendo títulos al ${lang}…`,
};

const de: UiStrings = {
  ...en,
  title: 'Weltweites Gebärdensprache-Wörterbuch',
  subtitle: (n, c, l, s) => `${n}+ Begriffe in ${c} Kategorien · ${l}+ Sprachen und ${s} Systeme`,
  signSystem: 'Gebärdensystem',
  displayLanguage: 'Anzeigesprache',
  selected: 'Ausgewählt',
  searchLanguagePlaceholder: 'Sprache suchen…',
  searchPlaceholder: (n, lang) => `In ${n} Begriffen suchen (Arabisch oder ${lang})…`,
  categories: 'Kategorien',
  all: 'Alle',
  favorites: 'Favoriten',
  results: (n) => `${n} Ergebnisse`,
  loadMore: (n) => `Mehr anzeigen (${n} übrig)`,
  empty: 'Keine Ergebnisse.',
  translating: (lang) => `Titel werden ins ${lang} übersetzt…`,
};

const tr: UiStrings = {
  ...en,
  title: 'Dünya İşaret Dili Sözlüğü',
  subtitle: (n, c, l, s) => `${n}+ terim, ${c} kategoride · ${l}+ dil ve ${s} işaret sistemi`,
  signSystem: 'İşaret sistemi',
  displayLanguage: 'Görüntü dili',
  selected: 'Seçilen',
  searchLanguagePlaceholder: 'Dil ara…',
  searchPlaceholder: (n, lang) => `${n} terim içinde ara (Arapça veya ${lang})…`,
  categories: 'Kategoriler',
  all: 'Tümü',
  favorites: 'Favoriler',
  results: (n) => `${n} sonuç`,
  loadMore: (n) => `Daha fazla göster (${n} kaldı)`,
  empty: 'Sonuç yok.',
  translating: (lang) => `Başlıklar ${lang} diline çevriliyor…`,
};

const zh: UiStrings = {
  ...en,
  title: '世界手语词典',
  subtitle: (n, c, l, s) => `${n}+ 个词条，${c} 个类别 · 支持 ${l}+ 种语言和 ${s} 种手语`,
  signSystem: '手语系统',
  displayLanguage: '显示语言',
  selected: '已选',
  searchLanguagePlaceholder: '搜索语言…',
  searchPlaceholder: (n, lang) => `在 ${n} 个词中搜索（阿拉伯语或 ${lang}）…`,
  categories: '类别',
  all: '全部',
  favorites: '收藏',
  results: (n) => `${n} 条结果`,
  loadMore: (n) => `加载更多（剩余 ${n}）`,
  empty: '没有结果。',
  translating: (lang) => `正在翻译为${lang}…`,
};

const ru: UiStrings = {
  ...en,
  title: 'Всемирный словарь жестового языка',
  subtitle: (n, c, l, s) => `${n}+ терминов в ${c} категориях · ${l}+ языков и ${s} систем`,
  signSystem: 'Система жестов',
  displayLanguage: 'Язык интерфейса',
  selected: 'Выбран',
  searchLanguagePlaceholder: 'Поиск языка…',
  searchPlaceholder: (n, lang) => `Поиск среди ${n} терминов (на арабском или ${lang})…`,
  categories: 'Категории',
  all: 'Все',
  favorites: 'Избранное',
  results: (n) => `Результатов: ${n}`,
  loadMore: (n) => `Показать ещё (${n})`,
  empty: 'Нет результатов.',
  translating: (lang) => `Перевод заголовков на ${lang}…`,
};

const ja: UiStrings = {
  ...en,
  title: '世界手話辞典',
  subtitle: (n, c, l, s) => `${c} カテゴリーの ${n}+ 語 · ${l}+ 言語と ${s} 手話システム対応`,
  signSystem: '手話システム',
  displayLanguage: '表示言語',
  selected: '選択中',
  searchLanguagePlaceholder: '言語を検索…',
  searchPlaceholder: (n, lang) => `${n} 語から検索（アラビア語または ${lang}）…`,
  categories: 'カテゴリー',
  all: 'すべて',
  favorites: 'お気に入り',
  results: (n) => `${n} 件`,
  loadMore: (n) => `もっと見る (残り ${n})`,
  empty: '結果がありません。',
  translating: (lang) => `タイトルを${lang}に翻訳中…`,
};

const TABLE: Record<string, UiStrings> = {
  ar, en, fr, es, de, tr, zh, ru, ja,
};

export function getStrings(langCode: string): UiStrings {
  const base = langCode.split('-')[0].toLowerCase();
  return TABLE[base] || en;
}

// BCP-47 prefix → preferred sign system code (must match SIGN_SYSTEMS in signSystems.ts)
const LANG_TO_SIGN: Record<string, string> = {
  ar: 'ArSL',
  en: 'ASL', // default; en-GB / en-AU / en-NZ overridden below
  fr: 'LSF',
  de: 'DGS',
  es: 'LSE',
  it: 'LIS',
  ja: 'JSL',
  ko: 'KSL',
  zh: 'CSL',
  hi: 'ISL',
  ur: 'PSL',
  tr: 'TSL',
  ru: 'RSL',
  pt: 'Libras',
};

const FULL_LANG_TO_SIGN: Record<string, string> = {
  'en-GB': 'BSL',
  'en-AU': 'Auslan',
  'en-NZ': 'NZSL',
  'pt-BR': 'Libras',
  'es-MX': 'LSM',
};

export function signSystemForLang(langCode: string): string {
  if (FULL_LANG_TO_SIGN[langCode]) return FULL_LANG_TO_SIGN[langCode];
  const base = langCode.split('-')[0].toLowerCase();
  return LANG_TO_SIGN[base] || 'IS';
}
