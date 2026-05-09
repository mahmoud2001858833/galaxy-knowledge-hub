// Per-sign-system vocabulary for the gestures the camera can detect.
// When the user picks ASL, gestures must surface as English words directly —
// no detour through Arabic + AI translation.

export type GestureId =
  | 'open_palm' | 'thumbs_up' | 'thumbs_down' | 'pointing_up' | 'victory'
  | 'fist' | 'rock' | 'ok_sign' | 'three_fingers' | 'four_fingers'
  | 'call_me' | 'pinch' | 'love' | 'pointing_right' | 'prayer'
  | 'crossed_fingers' | 'flat_hand_down' | 'five_fingers' | 'finger_gun' | 'waving';

export interface VocabEntry { text: string; emoji: string; description: string }
export type SystemVocab = Record<GestureId, VocabEntry>;

// Arabic baseline (ArSL) — mirrors the original gestureToArabic map.
const ArSL: SystemVocab = {
  open_palm:       { text: 'مرحبا',       emoji: '✋', description: 'كف مفتوح' },
  thumbs_up:       { text: 'نعم',         emoji: '👍', description: 'إبهام للأعلى' },
  thumbs_down:     { text: 'لا',          emoji: '👎', description: 'إبهام للأسفل' },
  pointing_up:     { text: 'واحد',        emoji: '☝️', description: 'سبابة للأعلى' },
  victory:         { text: 'اثنان',       emoji: '✌️', description: 'إصبعان مرفوعان' },
  fist:            { text: 'توقف',        emoji: '✊', description: 'قبضة مغلقة' },
  rock:            { text: 'حماس',        emoji: '🤘', description: 'سبابة وخنصر' },
  ok_sign:         { text: 'ممتاز',       emoji: '👌', description: 'إبهام وسبابة دائرة' },
  three_fingers:   { text: 'ثلاثة',       emoji: '3️⃣', description: 'ثلاثة أصابع' },
  four_fingers:    { text: 'أربعة',       emoji: '4️⃣', description: 'أربعة أصابع' },
  call_me:         { text: 'اتصل بي',     emoji: '🤙', description: 'إبهام وخنصر' },
  pinch:           { text: 'صغير',        emoji: '🤏', description: 'إبهام وسبابة قريبان' },
  love:            { text: 'أحبك',        emoji: '🤟', description: 'إبهام وسبابة وخنصر' },
  pointing_right:  { text: 'هناك',        emoji: '👉', description: 'إشارة جانبية' },
  prayer:          { text: 'شكراً',       emoji: '🙏', description: 'كفان متلاصقان' },
  crossed_fingers: { text: 'إن شاء الله', emoji: '🤞', description: 'سبابة ووسطى متشابكتان' },
  flat_hand_down:  { text: 'اهدأ',        emoji: '🫳', description: 'كف مسطح للأسفل' },
  five_fingers:    { text: 'خمسة',        emoji: '5️⃣', description: 'خمسة أصابع مفرودة' },
  finger_gun:      { text: 'انتباه',      emoji: '👈', description: 'إبهام وسبابة كالمسدس' },
  waving:          { text: 'وداعاً',      emoji: '👋', description: 'تلويح باليد' },
};

const make = (entries: Record<GestureId, [string, string]>): SystemVocab => {
  const out = {} as SystemVocab;
  (Object.keys(entries) as GestureId[]).forEach(k => {
    out[k] = { text: entries[k][0], emoji: ArSL[k].emoji, description: entries[k][1] };
  });
  return out;
};

const ASL: SystemVocab = make({
  open_palm:       ['Hello',        'Open palm'],
  thumbs_up:       ['Yes',          'Thumb up'],
  thumbs_down:     ['No',           'Thumb down'],
  pointing_up:     ['One',          'Index finger up'],
  victory:         ['Two',          'Two fingers raised'],
  fist:            ['Stop',         'Closed fist'],
  rock:            ['Excited',      'Index and pinky'],
  ok_sign:         ['Great',        'Thumb–index circle'],
  three_fingers:   ['Three',        'Three fingers'],
  four_fingers:    ['Four',         'Four fingers'],
  call_me:         ['Call me',      'Thumb and pinky'],
  pinch:           ['Small',        'Thumb–index pinch'],
  love:            ['I love you',   'Thumb, index, pinky'],
  pointing_right:  ['There',        'Side pointing'],
  prayer:          ['Thank you',    'Palms together'],
  crossed_fingers: ['Hope',         'Index and middle crossed'],
  flat_hand_down:  ['Calm down',    'Flat hand facing down'],
  five_fingers:    ['Five',         'All five fingers extended'],
  finger_gun:      ['Attention',    'Thumb and index like a gun'],
  waving:          ['Goodbye',      'Hand wave'],
});

const BSL: SystemVocab = make({
  open_palm:       ['Hello',        'Open palm'],
  thumbs_up:       ['Yes',          'Thumb up'],
  thumbs_down:     ['No',           'Thumb down'],
  pointing_up:     ['One',          'Index up'],
  victory:         ['Two',          'Two fingers'],
  fist:            ['Stop',         'Closed fist'],
  rock:            ['Excited',      'Index and pinky'],
  ok_sign:         ['Brilliant',    'Thumb–index circle'],
  three_fingers:   ['Three',        'Three fingers'],
  four_fingers:    ['Four',         'Four fingers'],
  call_me:         ['Phone me',     'Thumb and pinky'],
  pinch:           ['Tiny',         'Pinched fingers'],
  love:            ['I love you',   'Thumb, index, pinky'],
  pointing_right:  ['Over there',   'Side point'],
  prayer:          ['Thank you',    'Palms together'],
  crossed_fingers: ['Good luck',    'Crossed fingers'],
  flat_hand_down:  ['Calm down',    'Flat hand down'],
  five_fingers:    ['Five',         'Five fingers extended'],
  finger_gun:      ['Look',         'Index pointing'],
  waving:          ['Goodbye',      'Hand wave'],
});

const LSF: SystemVocab = make({
  open_palm:       ['Bonjour',         'Paume ouverte'],
  thumbs_up:       ['Oui',             'Pouce levé'],
  thumbs_down:     ['Non',             'Pouce baissé'],
  pointing_up:     ['Un',              'Index levé'],
  victory:         ['Deux',            'Deux doigts'],
  fist:            ['Stop',            'Poing fermé'],
  rock:            ['Génial',          'Index et auriculaire'],
  ok_sign:         ['Parfait',         'Cercle pouce-index'],
  three_fingers:   ['Trois',           'Trois doigts'],
  four_fingers:    ['Quatre',          'Quatre doigts'],
  call_me:         ['Appelle-moi',     'Pouce et auriculaire'],
  pinch:           ['Petit',           'Pince pouce-index'],
  love:            ['Je t’aime',       'Pouce, index, auriculaire'],
  pointing_right:  ['Là-bas',          'Point latéral'],
  prayer:          ['Merci',           'Mains jointes'],
  crossed_fingers: ['Bonne chance',    'Doigts croisés'],
  flat_hand_down:  ['Calme',           'Main à plat vers le bas'],
  five_fingers:    ['Cinq',            'Cinq doigts'],
  finger_gun:      ['Attention',       'Pistolet de doigt'],
  waving:          ['Au revoir',       'Salut de la main'],
});

const DGS: SystemVocab = make({
  open_palm:       ['Hallo',           'Offene Handfläche'],
  thumbs_up:       ['Ja',              'Daumen hoch'],
  thumbs_down:     ['Nein',            'Daumen runter'],
  pointing_up:     ['Eins',            'Zeigefinger oben'],
  victory:         ['Zwei',            'Zwei Finger'],
  fist:            ['Stopp',           'Geschlossene Faust'],
  rock:            ['Cool',            'Zeigefinger und Kleiner'],
  ok_sign:         ['Super',           'Daumen-Zeigefinger-Kreis'],
  three_fingers:   ['Drei',            'Drei Finger'],
  four_fingers:    ['Vier',            'Vier Finger'],
  call_me:         ['Ruf mich an',     'Daumen und kleiner Finger'],
  pinch:           ['Klein',           'Daumen-Zeigefinger-Kniff'],
  love:            ['Ich liebe dich',  'Daumen, Zeige-, kleiner Finger'],
  pointing_right:  ['Dort',            'Seitliches Zeigen'],
  prayer:          ['Danke',           'Hände gefaltet'],
  crossed_fingers: ['Viel Glück',      'Gekreuzte Finger'],
  flat_hand_down:  ['Ruhig',           'Flache Hand nach unten'],
  five_fingers:    ['Fünf',            'Fünf Finger'],
  finger_gun:      ['Achtung',         'Fingerpistole'],
  waving:          ['Tschüss',         'Winken'],
});

const LSE: SystemVocab = make({
  open_palm:       ['Hola',            'Palma abierta'],
  thumbs_up:       ['Sí',              'Pulgar arriba'],
  thumbs_down:     ['No',              'Pulgar abajo'],
  pointing_up:     ['Uno',             'Índice arriba'],
  victory:         ['Dos',             'Dos dedos'],
  fist:            ['Alto',            'Puño cerrado'],
  rock:            ['Genial',          'Índice y meñique'],
  ok_sign:         ['Perfecto',        'Círculo pulgar-índice'],
  three_fingers:   ['Tres',            'Tres dedos'],
  four_fingers:    ['Cuatro',          'Cuatro dedos'],
  call_me:         ['Llámame',         'Pulgar y meñique'],
  pinch:           ['Pequeño',         'Pinza pulgar-índice'],
  love:            ['Te quiero',       'Pulgar, índice, meñique'],
  pointing_right:  ['Allí',            'Señal lateral'],
  prayer:          ['Gracias',         'Manos juntas'],
  crossed_fingers: ['Suerte',          'Dedos cruzados'],
  flat_hand_down:  ['Cálmate',         'Mano plana hacia abajo'],
  five_fingers:    ['Cinco',           'Cinco dedos'],
  finger_gun:      ['Atención',        'Pistola con los dedos'],
  waving:          ['Adiós',           'Saludo con la mano'],
});

const LIS: SystemVocab = make({
  open_palm:       ['Ciao',            'Palmo aperto'],
  thumbs_up:       ['Sì',              'Pollice in su'],
  thumbs_down:     ['No',              'Pollice in giù'],
  pointing_up:     ['Uno',             'Indice in su'],
  victory:         ['Due',             'Due dita'],
  fist:            ['Stop',            'Pugno chiuso'],
  rock:            ['Forte',           'Indice e mignolo'],
  ok_sign:         ['Perfetto',        'Cerchio pollice-indice'],
  three_fingers:   ['Tre',             'Tre dita'],
  four_fingers:    ['Quattro',         'Quattro dita'],
  call_me:         ['Chiamami',        'Pollice e mignolo'],
  pinch:           ['Piccolo',         'Pinza pollice-indice'],
  love:            ['Ti amo',          'Pollice, indice, mignolo'],
  pointing_right:  ['Là',              'Segnale laterale'],
  prayer:          ['Grazie',          'Mani giunte'],
  crossed_fingers: ['Buona fortuna',   'Dita incrociate'],
  flat_hand_down:  ['Calma',           'Mano piatta verso il basso'],
  five_fingers:    ['Cinque',          'Cinque dita'],
  finger_gun:      ['Attenzione',      'Pistola di dita'],
  waving:          ['Arrivederci',     'Saluto con la mano'],
});

const JSL: SystemVocab = make({
  open_palm: ['こんにちは', '開いた手のひら'], thumbs_up: ['はい', '親指を上げる'],
  thumbs_down: ['いいえ', '親指を下げる'], pointing_up: ['一', '人差し指を上げる'],
  victory: ['二', '指二本'], fist: ['止まれ', '握り拳'],
  rock: ['熱狂', '人差し指と小指'], ok_sign: ['完璧', '親指と人差し指で輪'],
  three_fingers: ['三', '指三本'], four_fingers: ['四', '指四本'],
  call_me: ['電話して', '親指と小指'], pinch: ['小さい', '親指と人差し指つまむ'],
  love: ['愛してる', '親指・人差し指・小指'], pointing_right: ['そこ', '横向きに指す'],
  prayer: ['ありがとう', '両手を合わせる'], crossed_fingers: ['幸運', '指を組む'],
  flat_hand_down: ['落ち着いて', '平らな手のひらを下に'], five_fingers: ['五', '五本指'],
  finger_gun: ['注目', '指の銃'], waving: ['さようなら', '手を振る'],
});

const KSL: SystemVocab = make({
  open_palm: ['안녕하세요', '펼친 손바닥'], thumbs_up: ['네', '엄지 위로'],
  thumbs_down: ['아니요', '엄지 아래로'], pointing_up: ['하나', '검지 위로'],
  victory: ['둘', '두 손가락'], fist: ['멈춰', '주먹'],
  rock: ['신난다', '검지와 새끼'], ok_sign: ['좋아요', '엄지·검지 동그라미'],
  three_fingers: ['셋', '세 손가락'], four_fingers: ['넷', '네 손가락'],
  call_me: ['전화해', '엄지와 새끼'], pinch: ['작다', '엄지·검지 꼬집기'],
  love: ['사랑해', '엄지·검지·새끼'], pointing_right: ['저기', '옆으로 가리키기'],
  prayer: ['고마워요', '두 손 모음'], crossed_fingers: ['행운', '손가락 교차'],
  flat_hand_down: ['진정해', '평평한 손바닥 아래로'], five_fingers: ['다섯', '다섯 손가락'],
  finger_gun: ['주목', '손가락 총'], waving: ['안녕히', '손 흔들기'],
});

const CSL: SystemVocab = make({
  open_palm: ['你好', '张开的手掌'], thumbs_up: ['是', '拇指向上'],
  thumbs_down: ['不', '拇指向下'], pointing_up: ['一', '食指向上'],
  victory: ['二', '两个手指'], fist: ['停', '紧握的拳头'],
  rock: ['激动', '食指和小指'], ok_sign: ['很好', '拇指食指圆圈'],
  three_fingers: ['三', '三个手指'], four_fingers: ['四', '四个手指'],
  call_me: ['打给我', '拇指和小指'], pinch: ['小', '拇指食指捏'],
  love: ['我爱你', '拇指、食指、小指'], pointing_right: ['那里', '侧向指'],
  prayer: ['谢谢', '双手合十'], crossed_fingers: ['好运', '手指交叉'],
  flat_hand_down: ['冷静', '手掌向下'], five_fingers: ['五', '五个手指'],
  finger_gun: ['注意', '手指枪'], waving: ['再见', '挥手'],
});

const ISL: SystemVocab = make({
  open_palm: ['नमस्ते', 'खुली हथेली'], thumbs_up: ['हाँ', 'अंगूठा ऊपर'],
  thumbs_down: ['नहीं', 'अंगूठा नीचे'], pointing_up: ['एक', 'तर्जनी ऊपर'],
  victory: ['दो', 'दो उंगलियाँ'], fist: ['रुको', 'बंद मुट्ठी'],
  rock: ['उत्साह', 'तर्जनी और कनिष्ठा'], ok_sign: ['बहुत अच्छा', 'अंगूठा-तर्जनी वृत्त'],
  three_fingers: ['तीन', 'तीन उंगलियाँ'], four_fingers: ['चार', 'चार उंगलियाँ'],
  call_me: ['मुझे फोन करो', 'अंगूठा और कनिष्ठा'], pinch: ['छोटा', 'अंगूठा-तर्जनी चुटकी'],
  love: ['मैं तुमसे प्यार करता हूँ', 'अंगूठा, तर्जनी, कनिष्ठा'], pointing_right: ['वहाँ', 'पार्श्व इशारा'],
  prayer: ['धन्यवाद', 'हाथ जोड़े'], crossed_fingers: ['शुभकामनाएँ', 'उंगलियाँ क्रॉस'],
  flat_hand_down: ['शांत', 'हाथ नीचे की ओर'], five_fingers: ['पाँच', 'पाँच उंगलियाँ'],
  finger_gun: ['ध्यान दें', 'उंगली बंदूक'], waving: ['अलविदा', 'हाथ हिलाना'],
});

const PSL: SystemVocab = make({
  open_palm: ['ہیلو', 'کھلی ہتھیلی'], thumbs_up: ['ہاں', 'انگوٹھا اوپر'],
  thumbs_down: ['نہیں', 'انگوٹھا نیچے'], pointing_up: ['ایک', 'شہادت کی انگلی اوپر'],
  victory: ['دو', 'دو انگلیاں'], fist: ['رکو', 'بند مٹھی'],
  rock: ['جوش', 'شہادت اور چھنگلیا'], ok_sign: ['بہترین', 'انگوٹھا-شہادت دائرہ'],
  three_fingers: ['تین', 'تین انگلیاں'], four_fingers: ['چار', 'چار انگلیاں'],
  call_me: ['مجھے کال کرو', 'انگوٹھا اور چھنگلیا'], pinch: ['چھوٹا', 'انگوٹھا-شہادت چٹکی'],
  love: ['میں تم سے محبت کرتا ہوں', 'انگوٹھا، شہادت، چھنگلیا'], pointing_right: ['وہاں', 'پہلوی اشارہ'],
  prayer: ['شکریہ', 'ہاتھ جوڑے'], crossed_fingers: ['نیک خواہشات', 'انگلیاں کراس'],
  flat_hand_down: ['پرسکون', 'ہاتھ نیچے'], five_fingers: ['پانچ', 'پانچ انگلیاں'],
  finger_gun: ['توجہ', 'انگلی کی بندوق'], waving: ['الوداع', 'ہاتھ ہلانا'],
});

const TSL: SystemVocab = make({
  open_palm: ['Merhaba', 'Açık avuç'], thumbs_up: ['Evet', 'Başparmak yukarı'],
  thumbs_down: ['Hayır', 'Başparmak aşağı'], pointing_up: ['Bir', 'İşaret parmağı yukarı'],
  victory: ['İki', 'İki parmak'], fist: ['Dur', 'Yumruk'],
  rock: ['Heyecan', 'İşaret ve serçe'], ok_sign: ['Mükemmel', 'Başparmak-işaret halkası'],
  three_fingers: ['Üç', 'Üç parmak'], four_fingers: ['Dört', 'Dört parmak'],
  call_me: ['Beni ara', 'Başparmak ve serçe'], pinch: ['Küçük', 'Başparmak-işaret çimdik'],
  love: ['Seni seviyorum', 'Başparmak, işaret, serçe'], pointing_right: ['Orada', 'Yan işaret'],
  prayer: ['Teşekkürler', 'Eller birleşik'], crossed_fingers: ['İyi şanslar', 'Çapraz parmaklar'],
  flat_hand_down: ['Sakin ol', 'Avuç aşağı'], five_fingers: ['Beş', 'Beş parmak'],
  finger_gun: ['Dikkat', 'Parmak silahı'], waving: ['Hoşça kal', 'El sallamak'],
});

const RSL: SystemVocab = make({
  open_palm: ['Привет', 'Открытая ладонь'], thumbs_up: ['Да', 'Большой палец вверх'],
  thumbs_down: ['Нет', 'Большой палец вниз'], pointing_up: ['Один', 'Указательный вверх'],
  victory: ['Два', 'Два пальца'], fist: ['Стоп', 'Кулак'],
  rock: ['Восторг', 'Указательный и мизинец'], ok_sign: ['Отлично', 'Кольцо большой-указательный'],
  three_fingers: ['Три', 'Три пальца'], four_fingers: ['Четыре', 'Четыре пальца'],
  call_me: ['Позвони мне', 'Большой и мизинец'], pinch: ['Маленький', 'Щепотка'],
  love: ['Я тебя люблю', 'Большой, указательный, мизинец'], pointing_right: ['Там', 'Боковой жест'],
  prayer: ['Спасибо', 'Руки вместе'], crossed_fingers: ['Удачи', 'Скрещённые пальцы'],
  flat_hand_down: ['Спокойно', 'Плоская ладонь вниз'], five_fingers: ['Пять', 'Пять пальцев'],
  finger_gun: ['Внимание', 'Пистолет из пальцев'], waving: ['Пока', 'Махать рукой'],
});

const Libras: SystemVocab = make({
  open_palm: ['Olá', 'Palma aberta'], thumbs_up: ['Sim', 'Polegar para cima'],
  thumbs_down: ['Não', 'Polegar para baixo'], pointing_up: ['Um', 'Indicador para cima'],
  victory: ['Dois', 'Dois dedos'], fist: ['Pare', 'Punho fechado'],
  rock: ['Animado', 'Indicador e mínimo'], ok_sign: ['Ótimo', 'Círculo polegar-indicador'],
  three_fingers: ['Três', 'Três dedos'], four_fingers: ['Quatro', 'Quatro dedos'],
  call_me: ['Me ligue', 'Polegar e mínimo'], pinch: ['Pequeno', 'Pinça polegar-indicador'],
  love: ['Eu te amo', 'Polegar, indicador, mínimo'], pointing_right: ['Ali', 'Aponte lateral'],
  prayer: ['Obrigado', 'Mãos juntas'], crossed_fingers: ['Boa sorte', 'Dedos cruzados'],
  flat_hand_down: ['Calma', 'Mão plana para baixo'], five_fingers: ['Cinco', 'Cinco dedos'],
  finger_gun: ['Atenção', 'Pistola de dedos'], waving: ['Tchau', 'Aceno de mão'],
});

const LSM: SystemVocab = make({
  open_palm: ['Hola', 'Palma abierta'], thumbs_up: ['Sí', 'Pulgar arriba'],
  thumbs_down: ['No', 'Pulgar abajo'], pointing_up: ['Uno', 'Índice arriba'],
  victory: ['Dos', 'Dos dedos'], fist: ['Alto', 'Puño cerrado'],
  rock: ['Emoción', 'Índice y meñique'], ok_sign: ['Excelente', 'Círculo pulgar-índice'],
  three_fingers: ['Tres', 'Tres dedos'], four_fingers: ['Cuatro', 'Cuatro dedos'],
  call_me: ['Háblame', 'Pulgar y meñique'], pinch: ['Chico', 'Pinza pulgar-índice'],
  love: ['Te amo', 'Pulgar, índice, meñique'], pointing_right: ['Allá', 'Seña lateral'],
  prayer: ['Gracias', 'Manos juntas'], crossed_fingers: ['Suerte', 'Dedos cruzados'],
  flat_hand_down: ['Calma', 'Mano plana abajo'], five_fingers: ['Cinco', 'Cinco dedos'],
  finger_gun: ['Atención', 'Pistola de dedos'], waving: ['Adiós', 'Saludo con la mano'],
});

export const GESTURE_VOCABULARY: Record<string, SystemVocab> = {
  ArSL, ASL, BSL, LSF, DGS, LSE, LIS, JSL, KSL, CSL, ISL, PSL, TSL, RSL,
  Auslan: ASL,    // Auslan uses English glosses, close to ASL/BSL meanings
  NZSL: ASL,
  Libras,
  LSM,
  IS: ASL,        // International Sign — fall back to English glosses
};

export function getGestureWord(signSystem: string, gestureId: string): VocabEntry | undefined {
  const sys = GESTURE_VOCABULARY[signSystem] || GESTURE_VOCABULARY.ASL;
  return (sys as any)[gestureId] || (GESTURE_VOCABULARY.ASL as any)[gestureId] || (ArSL as any)[gestureId];
}

export function getSystemVocab(signSystem: string): SystemVocab {
  return GESTURE_VOCABULARY[signSystem] || GESTURE_VOCABULARY.ASL;
}
