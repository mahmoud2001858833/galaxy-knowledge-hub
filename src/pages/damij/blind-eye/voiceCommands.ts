// Centralized voice command parser (English + Arabic)
import type { BELang } from './i18n';

export type CommandId =
  | 'STOP' | 'START' | 'REPEAT' | 'SCAN_AREA' | 'WHATS_AROUND'
  | 'READ_TEXT' | 'SWITCH_LANG_AR' | 'SWITCH_LANG_EN'
  | 'SLOWER' | 'FASTER' | 'QUIETER' | 'LOUDER' | 'HELP' | 'CHAT'
  | 'GO_TO' | 'CANCEL_NAV' | 'WHERE_AM_I' | 'ARRIVED_QUERY'
  | 'SAVE_PLACE' | 'EMERGENCY' | 'LIST_PLACES';

const PATTERNS: { id: CommandId; en: RegExp[]; ar: RegExp[] }[] = [
  { id: 'STOP',
    en: [/\b(stop|halt|pause|cancel)\b/i],
    ar: [/^(توقف|أوقف|اوقف|قف الآن|كفى|بس)/] },
  { id: 'START',
    en: [/\b(start|resume|continue|go|begin)\b/i],
    ar: [/(أكمل|اكمل|تابع|كمل|ابدأ|ابدا|استمر)/] },
  { id: 'REPEAT',
    en: [/\b(repeat|again|say again)\b/i],
    ar: [/(أعد|اعد|كرر|قل مرة أخرى)/] },
  { id: 'SCAN_AREA',
    en: [/\b(scan|scan area|scan the area|look around)\b/i],
    ar: [/(امسح|إمسح|مسح المنطقه|مسح المنطقة|إفحص)/] },
  { id: 'WHATS_AROUND',
    en: [/\b(what'?s? (around|in front|ahead|there)|describe|what do you see)\b/i],
    ar: [/(ماذا حولي|ماذا أمامي|ماذا امامي|صف|وصف ما)/] },
  { id: 'READ_TEXT',
    en: [/\b(read (the )?(text|sign)|read it)\b/i],
    ar: [/(اقرأ|إقرأ).*(نص|لافت|كتاب|إشار)/] },
  { id: 'SWITCH_LANG_AR',
    en: [/\b(switch|change|go) to arabic\b/i, /\barabic please\b/i],
    ar: [/(حوّل|حول|بدّل|بدل).*(عرب)/, /(تكلم|إحكي|احكي).*(عرب)/] },
  { id: 'SWITCH_LANG_EN',
    en: [/\b(switch|change|go) to english\b/i, /\benglish please\b/i],
    ar: [/(حوّل|حول|بدّل|بدل).*(إنجلي|انجلي|إنكلي|انكلي|english)/i, /(تكلم|إحكي|احكي).*(إنجلي|انجلي|english)/i] },
  { id: 'SLOWER',
    en: [/\b(slower|slow down|speak slower)\b/i],
    ar: [/(أبطأ|ابطأ|تكلم ببطء)/] },
  { id: 'FASTER',
    en: [/\b(faster|speed up|speak faster)\b/i],
    ar: [/(أسرع|اسرع|تكلم بسرعة)/] },
  { id: 'QUIETER',
    en: [/\b(quieter|lower volume|softer)\b/i],
    ar: [/(اخفض الصوت|أهدأ|أخفض)/] },
  { id: 'LOUDER',
    en: [/\b(louder|raise volume)\b/i],
    ar: [/(ارفع الصوت|أعلى|اعلى الصوت)/] },
  { id: 'HELP',
    en: [/\b(help|what can you do|commands)\b/i],
    ar: [/(ساعدني|مساعدة|ماذا تستطيع|الأوامر)/] },
  { id: 'CANCEL_NAV',
    en: [/\b(cancel|stop) (navigation|guidance|guiding)\b/i, /\bnever ?mind\b/i],
    ar: [/(ألغِ|الغ|الغي|أوقف|اوقف|توقف عن).{0,8}(التوجيه|الإرشاد|الارشاد)/, /^خلص$/] },
  { id: 'WHERE_AM_I',
    en: [/\bwhere am i\b/i, /\bmy location\b/i],
    ar: [/(وين أنا|أين أنا|اين انا|موقعي|أين موقعي)/] },
  { id: 'ARRIVED_QUERY',
    en: [/\b(did i arrive|am i there)\b/i],
    ar: [/(هل وصلت|وصلنا|قربت|هل قربت)/] },
  { id: 'GO_TO',
    en: [/\b(take me|guide me|navigate|go)\s+to\s+\w+/i, /^i want to go to .+/i],
    ar: [/(بدي|أريد|اريد|عاوز|عايز|ودي).{0,10}(أروح|اروح|أذهب|اذهب|أمشي|اوصل|أصل|نروح)/, /^(خذني|وجهني|وجّهني|دلني|دلّني|رشدني|ودّيني|وديني)\s+/]
  },
  { id: 'SAVE_PLACE',
    en: [/^save (?:this )?(?:place|location)?\s*as\s+.+/i],
    ar: [/^(احفظ|إحفظ|سجل|سجّل)\s+(هذا|هاد|هذه|هاي)?\s*(المكان|الموقع)?/] },
  { id: 'EMERGENCY',
    en: [/\b(emergency|sos|help me)\b/i],
    ar: [/(نجده|نجدة|طوارئ|انقذني|أنقذني|ساعدني الآن)/] },
  { id: 'LIST_PLACES',
    en: [/\b(list|show)\s+(saved\s+)?places\b/i],
    ar: [/(اعرض|أعرض|اذكر|قائمة)\s+(الأماكن|اماكني|أماكني|المحفوظة)/] },
];



export function parseCommand(rawText: string, lang: BELang): CommandId {
  const t = (rawText || '').trim();
  if (!t) return 'CHAT';
  // Try BOTH language patterns so the user can switch language mid-sentence.
  const order: BELang[] = lang === 'ar' ? ['ar', 'en'] : ['en', 'ar'];
  for (const l of order) {
    for (const p of PATTERNS) {
      const list = l === 'en' ? p.en : p.ar;
      if (list.some(rx => rx.test(t))) return p.id;
    }
  }
  return 'CHAT';
}

// Per-command debounce so the same recognized utterance isn't fired twice in a row.
const lastFired = new Map<CommandId, number>();
export function commandAllowed(id: CommandId, windowMs = 1200): boolean {
  if (id === 'CHAT') return true; // chat handler has its own logic
  const now = Date.now();
  const prev = lastFired.get(id) ?? 0;
  if (now - prev < windowMs) return false;
  lastFired.set(id, now);
  return true;
}

// Detect "switch to <language>" intent in any of the supported languages
// and return the BELang target. Returns null if no switch intent was found.
const LANG_NAME_PATTERNS: Array<{ target: BELang; rx: RegExp }> = [
  { target: 'en', rx: /\b(english|إنجلي|انجلي|إنكلي|انكلي|anglais|inglés|englisch|inglês|английск|ingilizce|انگلیسی|انگریزی|אנגלית|अंग्र|英語|英语|영어)\b/i },
  { target: 'ar', rx: /\b(arabic|عرب|arabe|árabe|arabisch|арабск|arapça|عربی|ערבית|अरबी|アラビア|阿拉伯|아랍)\b/i },
  { target: 'fr', rx: /\b(french|français|francais|الفرنسي|فرنسي|francés|französisch|francês|француз|fransızca|فرانسوی|فرانسیسی|צרפתית|फ्रेंच|フランス|法语|프랑스)\b/i },
  { target: 'es', rx: /\b(spanish|español|espanol|الإسباني|إسباني|اسباني|espagnol|spanisch|espanhol|испанск|i̇spanyolca|ispanyolca|اسپانیایی|ہسپانوی|ספרדית|स्पेनिश|スペイン|西班牙|스페인)\b/i },
  { target: 'de', rx: /\b(german|deutsch|الألماني|ألماني|الماني|allemand|alemán|alemão|немецк|almanca|آلمانی|جرمن|גרמנית|जर्मन|ドイツ|德语|독일)\b/i },
  { target: 'pt', rx: /\b(portuguese|português|portugues|البرتغالي|برتغالي|portugais|portugués|portugiesisch|португальск|portekizce|پرتغالی|پرتگالی|פורטוגזית|पुर्तगाली|ポルトガル|葡萄牙|포르투갈)\b/i },
  { target: 'ru', rx: /\b(russian|русск|الروسي|روسي|russe|ruso|russisch|russo|rusça|روسی|רוסית|रूसी|ロシア|俄语|러시아)\b/i },
  { target: 'tr', rx: /\b(turkish|türkçe|turkce|التركي|تركي|turc|turco|türkisch|турецк|ترکی|טורקית|तुर्की|トルコ|土耳其|터키)\b/i },
  { target: 'fa', rx: /\b(persian|farsi|فارسی|الفارسي|فارسي|perse|persan|persa|persisch|персидск|farsça|פרסית|फ़ारसी|ペルシア|波斯|페르시아)\b/i },
  { target: 'ur', rx: /\b(urdu|اردو|الأردو|أردو|اردية|hindoustani|урду|उर्दू|אורדו|ウルドゥー|乌尔都|우르두)\b/i },
  { target: 'he', rx: /\b(hebrew|עברית|العبري|عبري|hébreu|hebreo|hebräisch|hebraico|иврит|i̇branice|ibranice|عبری|हिब्रू|ヘブライ|希伯来|히브리)\b/i },
  { target: 'hi', rx: /\b(hindi|हिन्दी|हिंदी|الهندي|هندي|hindou|хинди|hintçe|ہندی|הינדי|ヒンディー|印地|힌디)\b/i },
  { target: 'ja', rx: /\b(japanese|日本語|اليابان|ياباني|japonais|japonés|japanisch|japonês|японск|japonca|ژاپنی|جاپانی|יפנית|जापानी|일본)\b/i },
  { target: 'ko', rx: /\b(korean|한국어|الكوري|كوري|coréen|coreano|koreanisch|корейск|korece|کره ای|کوریا|קוריאנית|कोरियाई|韓国|韩语|韓語)\b/i },
  { target: 'zh', rx: /\b(chinese|mandarin|中文|普通话|الصيني|صيني|chinois|chino|chinesisch|chinês|китайск|çince|چینی|סינית|चीनी|中国語)\b/i },
];

const SWITCH_INTENT = /(switch|change|go|speak|talk|set|to)|(حوّل|حول|بدّل|بدل|تكلم|إحكي|احكي|إلى)|(passe|parle|en)|(cambia|habla|al)|(wechsle|sprich|auf)|(mude|fale|para)|(переключ|говори|на)|(geç|konuş)|(تغییر|صحبت|به)|(پر|بدلیں|بولیں)|(החלף|דבר|ל)|(बदल|बोलो|पर)|(切り替え|話して|に)|(전환|말해|로|으로)|(切换|说|改)/i;

export function detectSwitchLang(rawText: string): BELang | null {
  const t = (rawText || '').trim();
  if (!t) return null;
  // Require either an intent verb OR a very short input like just "arabic"/"عربي"
  const hasIntent = SWITCH_INTENT.test(t) || t.split(/\s+/).length <= 3;
  if (!hasIntent) return null;
  for (const { target, rx } of LANG_NAME_PATTERNS) {
    if (rx.test(t)) return target;
  }
  return null;
}

