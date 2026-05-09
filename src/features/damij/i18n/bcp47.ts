// BCP47 locale map for Damij languages. Used by Web Speech API to pick the
// closest available voice. Codes not listed will fall back to the raw code.
export const DAMIJ_BCP47: Record<string, string> = {
  ar: 'ar-SA', en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE',
  tr: 'tr-TR', ur: 'ur-PK', hi: 'hi-IN', fa: 'fa-IR', he: 'he-IL',
  ru: 'ru-RU', zh: 'zh-CN', 'zh-TW': 'zh-TW', yue: 'zh-HK',
  ja: 'ja-JP', ko: 'ko-KR', pt: 'pt-PT',
  it: 'it-IT', nl: 'nl-NL', pl: 'pl-PL', sv: 'sv-SE', no: 'nb-NO',
  da: 'da-DK', fi: 'fi-FI', is: 'is-IS', el: 'el-GR', cs: 'cs-CZ',
  sk: 'sk-SK', hu: 'hu-HU', ro: 'ro-RO', bg: 'bg-BG', sr: 'sr-RS',
  hr: 'hr-HR', bs: 'bs-BA', sl: 'sl-SI', mk: 'mk-MK', sq: 'sq-AL',
  uk: 'uk-UA', be: 'be-BY', lt: 'lt-LT', lv: 'lv-LV', et: 'et-EE',
  mt: 'mt-MT', ga: 'ga-IE', cy: 'cy-GB', gd: 'gd-GB', eu: 'eu-ES',
  ca: 'ca-ES', gl: 'gl-ES', lb: 'lb-LU', fo: 'fo-FO', la: 'la',
  eo: 'eo',
  ku: 'ku', ckb: 'ckb', ps: 'ps-AF', sd: 'sd-PK', ug: 'ug-CN',
  az: 'az-AZ', ka: 'ka-GE', hy: 'hy-AM', kk: 'kk-KZ', ky: 'ky-KG',
  uz: 'uz-UZ', tk: 'tk-TM', tg: 'tg-TJ', mn: 'mn-MN',
  bn: 'bn-BD', pa: 'pa-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN',
  kn: 'kn-IN', gu: 'gu-IN', mr: 'mr-IN', or: 'or-IN', as: 'as-IN',
  ne: 'ne-NP', si: 'si-LK', dv: 'dv-MV',
  th: 'th-TH', vi: 'vi-VN', id: 'id-ID', ms: 'ms-MY', tl: 'fil-PH',
  my: 'my-MM', km: 'km-KH', lo: 'lo-LA', jv: 'jv-ID', su: 'su-ID',
  sw: 'sw-KE', am: 'am-ET', ti: 'ti-ET', so: 'so-SO', ha: 'ha-NG',
  yo: 'yo-NG', ig: 'ig-NG', zu: 'zu-ZA', xh: 'xh-ZA', st: 'st-ZA',
  tn: 'tn-ZA', sn: 'sn-ZW', ny: 'ny-MW', rw: 'rw-RW', mg: 'mg-MG',
  af: 'af-ZA',
  ht: 'ht-HT', qu: 'qu-PE', gn: 'gn-PY', ay: 'ay-BO',
  haw: 'haw-US', mi: 'mi-NZ', sm: 'sm-WS', to: 'to-TO', fj: 'fj-FJ',
};

export const toBcp47 = (code: string): string => DAMIJ_BCP47[code] || code;
