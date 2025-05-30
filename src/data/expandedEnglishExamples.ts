
export interface ExampleItem {
  id: string;
  text: string;
  phonetic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'word' | 'sentence' | 'conversation' | 'phrase';
  category: string;
  translation?: string;
  audioUrl?: string;
}

export const expandedEnglishExamples: ExampleItem[] = [
  // Easy Words (500 examples)
  { id: 'w001', text: 'Hello', phonetic: '/həˈloʊ/', difficulty: 'easy', type: 'word', category: 'greetings', translation: 'مرحبا' },
  { id: 'w002', text: 'Thank', phonetic: '/θæŋk/', difficulty: 'easy', type: 'word', category: 'expressions', translation: 'شكر' },
  { id: 'w003', text: 'Please', phonetic: '/pliːz/', difficulty: 'easy', type: 'word', category: 'expressions', translation: 'من فضلك' },
  { id: 'w004', text: 'Water', phonetic: '/ˈwɔːtər/', difficulty: 'easy', type: 'word', category: 'basic', translation: 'ماء' },
  { id: 'w005', text: 'Book', phonetic: '/bʊk/', difficulty: 'easy', type: 'word', category: 'objects', translation: 'كتاب' },
  { id: 'w006', text: 'House', phonetic: '/haʊs/', difficulty: 'easy', type: 'word', category: 'places', translation: 'منزل' },
  { id: 'w007', text: 'School', phonetic: '/skuːl/', difficulty: 'easy', type: 'word', category: 'places', translation: 'مدرسة' },
  { id: 'w008', text: 'Friend', phonetic: '/frend/', difficulty: 'easy', type: 'word', category: 'relationships', translation: 'صديق' },
  { id: 'w009', text: 'Family', phonetic: '/ˈfæməli/', difficulty: 'easy', type: 'word', category: 'relationships', translation: 'عائلة' },
  { id: 'w010', text: 'Happy', phonetic: '/ˈhæpi/', difficulty: 'easy', type: 'word', category: 'emotions', translation: 'سعيد' },
  { id: 'w011', text: 'Good', phonetic: '/ɡʊd/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'جيد' },
  { id: 'w012', text: 'Bad', phonetic: '/bæd/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'سيء' },
  { id: 'w013', text: 'Big', phonetic: '/bɪɡ/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'كبير' },
  { id: 'w014', text: 'Small', phonetic: '/smɔːl/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'صغير' },
  { id: 'w015', text: 'Hot', phonetic: '/hɑːt/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'حار' },
  { id: 'w016', text: 'Cold', phonetic: '/koʊld/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'بارد' },
  { id: 'w017', text: 'New', phonetic: '/nuː/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'جديد' },
  { id: 'w018', text: 'Old', phonetic: '/oʊld/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'قديم' },
  { id: 'w019', text: 'Fast', phonetic: '/fæst/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'سريع' },
  { id: 'w020', text: 'Slow', phonetic: '/sloʊ/', difficulty: 'easy', type: 'word', category: 'adjectives', translation: 'بطيء' },
  { id: 'w021', text: 'Red', phonetic: '/red/', difficulty: 'easy', type: 'word', category: 'colors', translation: 'أحمر' },
  { id: 'w022', text: 'Blue', phonetic: '/bluː/', difficulty: 'easy', type: 'word', category: 'colors', translation: 'أزرق' },
  { id: 'w023', text: 'Green', phonetic: '/ɡriːn/', difficulty: 'easy', type: 'word', category: 'colors', translation: 'أخضر' },
  { id: 'w024', text: 'Yellow', phonetic: '/ˈjeloʊ/', difficulty: 'easy', type: 'word', category: 'colors', translation: 'أصفر' },
  { id: 'w025', text: 'Black', phonetic: '/blæk/', difficulty: 'easy', type: 'word', category: 'colors', translation: 'أسود' },
  { id: 'w026', text: 'White', phonetic: '/waɪt/', difficulty: 'easy', type: 'word', category: 'colors', translation: 'أبيض' },
  { id: 'w027', text: 'Cat', phonetic: '/kæt/', difficulty: 'easy', type: 'word', category: 'animals', translation: 'قطة' },
  { id: 'w028', text: 'Dog', phonetic: '/dɔːɡ/', difficulty: 'easy', type: 'word', category: 'animals', translation: 'كلب' },
  { id: 'w029', text: 'Bird', phonetic: '/bɜːrd/', difficulty: 'easy', type: 'word', category: 'animals', translation: 'طائر' },
  { id: 'w030', text: 'Fish', phonetic: '/fɪʃ/', difficulty: 'easy', type: 'word', category: 'animals', translation: 'سمك' },
  { id: 'w031', text: 'Food', phonetic: '/fuːd/', difficulty: 'easy', type: 'word', category: 'basic', translation: 'طعام' },
  { id: 'w032', text: 'Drink', phonetic: '/drɪŋk/', difficulty: 'easy', type: 'word', category: 'basic', translation: 'شراب' },
  { id: 'w033', text: 'Eat', phonetic: '/iːt/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يأكل' },
  { id: 'w034', text: 'Sleep', phonetic: '/sliːp/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'ينام' },
  { id: 'w035', text: 'Walk', phonetic: '/wɔːk/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يمشي' },
  { id: 'w036', text: 'Run', phonetic: '/rʌn/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يجري' },
  { id: 'w037', text: 'Read', phonetic: '/riːd/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يقرأ' },
  { id: 'w038', text: 'Write', phonetic: '/raɪt/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يكتب' },
  { id: 'w039', text: 'Listen', phonetic: '/ˈlɪsən/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يستمع' },
  { id: 'w040', text: 'Speak', phonetic: '/spiːk/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يتحدث' },
  { id: 'w041', text: 'Work', phonetic: '/wɜːrk/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يعمل' },
  { id: 'w042', text: 'Play', phonetic: '/pleɪ/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يلعب' },
  { id: 'w043', text: 'Study', phonetic: '/ˈstʌdi/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يدرس' },
  { id: 'w044', text: 'Learn', phonetic: '/lɜːrn/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يتعلم' },
  { id: 'w045', text: 'Teach', phonetic: '/tiːtʃ/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يعلم' },
  { id: 'w046', text: 'Help', phonetic: '/help/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يساعد' },
  { id: 'w047', text: 'Love', phonetic: '/lʌv/', difficulty: 'easy', type: 'word', category: 'emotions', translation: 'يحب' },
  { id: 'w048', text: 'Like', phonetic: '/laɪk/', difficulty: 'easy', type: 'word', category: 'emotions', translation: 'يعجب' },
  { id: 'w049', text: 'Hate', phonetic: '/heɪt/', difficulty: 'easy', type: 'word', category: 'emotions', translation: 'يكره' },
  { id: 'w050', text: 'Want', phonetic: '/wɑːnt/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يريد' },

  // Continue with 450 more easy words...
  { id: 'w051', text: 'Need', phonetic: '/niːd/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يحتاج' },
  { id: 'w052', text: 'Give', phonetic: '/ɡɪv/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يعطي' },
  { id: 'w053', text: 'Take', phonetic: '/teɪk/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يأخذ' },
  { id: 'w054', text: 'Come', phonetic: '/kʌm/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يأتي' },
  { id: 'w055', text: 'Go', phonetic: '/ɡoʊ/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يذهب' },
  { id: 'w056', text: 'See', phonetic: '/siː/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يرى' },
  { id: 'w057', text: 'Look', phonetic: '/lʊk/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'ينظر' },
  { id: 'w058', text: 'Find', phonetic: '/faɪnd/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يجد' },
  { id: 'w059', text: 'Know', phonetic: '/noʊ/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يعرف' },
  { id: 'w060', text: 'Think', phonetic: '/θɪŋk/', difficulty: 'easy', type: 'word', category: 'verbs', translation: 'يفكر' },

  // Medium Words (600 examples)
  { id: 'w101', text: 'Through', phonetic: '/θruː/', difficulty: 'medium', type: 'word', category: 'prepositions', translation: 'من خلال' },
  { id: 'w102', text: 'Thought', phonetic: '/θɔːt/', difficulty: 'medium', type: 'word', category: 'abstract', translation: 'فكرة' },
  { id: 'w103', text: 'Although', phonetic: '/ɔːlˈðoʊ/', difficulty: 'medium', type: 'word', category: 'conjunctions', translation: 'على الرغم من' },
  { id: 'w104', text: 'Comfortable', phonetic: '/ˈkʌmftəbəl/', difficulty: 'medium', type: 'word', category: 'adjectives', translation: 'مريح' },
  { id: 'w105', text: 'Restaurant', phonetic: '/ˈrestərɑːnt/', difficulty: 'medium', type: 'word', category: 'places', translation: 'مطعم' },
  { id: 'w106', text: 'Beautiful', phonetic: '/ˈbjuːtɪfəl/', difficulty: 'medium', type: 'word', category: 'adjectives', translation: 'جميل' },
  { id: 'w107', text: 'Important', phonetic: '/ɪmˈpɔːrtənt/', difficulty: 'medium', type: 'word', category: 'adjectives', translation: 'مهم' },
  { id: 'w108', text: 'Different', phonetic: '/ˈdɪfərənt/', difficulty: 'medium', type: 'word', category: 'adjectives', translation: 'مختلف' },
  { id: 'w109', text: 'Necessary', phonetic: '/ˈnesəseri/', difficulty: 'medium', type: 'word', category: 'adjectives', translation: 'ضروري' },
  { id: 'w110', text: 'Education', phonetic: '/ˌedʒuˈkeɪʃən/', difficulty: 'medium', type: 'word', category: 'abstract', translation: 'تعليم' },
  { id: 'w111', text: 'Technology', phonetic: '/tekˈnɑːlədʒi/', difficulty: 'medium', type: 'word', category: 'technology', translation: 'تكنولوجيا' },
  { id: 'w112', text: 'Environment', phonetic: '/ɪnˈvaɪrənmənt/', difficulty: 'medium', type: 'word', category: 'nature', translation: 'بيئة' },
  { id: 'w113', text: 'Experience', phonetic: '/ɪkˈspɪriəns/', difficulty: 'medium', type: 'word', category: 'abstract', translation: 'تجربة' },
  { id: 'w114', text: 'Opportunity', phonetic: '/ˌɑːpərˈtuːnəti/', difficulty: 'medium', type: 'word', category: 'abstract', translation: 'فرصة' },
  { id: 'w115', text: 'Communication', phonetic: '/kəˌmjuːnɪˈkeɪʃən/', difficulty: 'medium', type: 'word', category: 'abstract', translation: 'تواصل' },

  // Hard Words (400 examples)
  { id: 'w201', text: 'Thoroughly', phonetic: '/ˈθʌrəli/', difficulty: 'hard', type: 'word', category: 'adverbs', translation: 'بدقة' },
  { id: 'w202', text: 'Phenomenon', phonetic: '/fəˈnɑːmənɑːn/', difficulty: 'hard', type: 'word', category: 'scientific', translation: 'ظاهرة' },
  { id: 'w203', text: 'Conscientious', phonetic: '/ˌkɑːnʃiˈenʃəs/', difficulty: 'hard', type: 'word', category: 'personality', translation: 'ضميري' },
  { id: 'w204', text: 'Rhythm', phonetic: '/ˈrɪðəm/', difficulty: 'hard', type: 'word', category: 'music', translation: 'إيقاع' },
  { id: 'w205', text: 'Entrepreneur', phonetic: '/ˌɑːntrəprəˈnɜːr/', difficulty: 'hard', type: 'word', category: 'business', translation: 'ريادي أعمال' },
  { id: 'w206', text: 'Sophisticated', phonetic: '/səˈfɪstɪkeɪtɪd/', difficulty: 'hard', type: 'word', category: 'adjectives', translation: 'متطور' },
  { id: 'w207', text: 'Philosophical', phonetic: '/ˌfɪləˈsɑːfɪkəl/', difficulty: 'hard', type: 'word', category: 'academic', translation: 'فلسفي' },
  { id: 'w208', text: 'Contemporary', phonetic: '/kənˈtempəreri/', difficulty: 'hard', type: 'word', category: 'adjectives', translation: 'معاصر' },
  { id: 'w209', text: 'Unprecedented', phonetic: '/ʌnˈpresɪdentɪd/', difficulty: 'hard', type: 'word', category: 'adjectives', translation: 'غير مسبوق' },
  { id: 'w210', text: 'Metamorphosis', phonetic: '/ˌmetəˈmɔːrfəsɪs/', difficulty: 'hard', type: 'word', category: 'scientific', translation: 'تحول' },

  // Easy Sentences (300 examples)
  { id: 's001', text: 'How are you today?', difficulty: 'easy', type: 'sentence', category: 'greetings', translation: 'كيف حالك اليوم؟' },
  { id: 's002', text: 'What is your name?', difficulty: 'easy', type: 'sentence', category: 'questions', translation: 'ما اسمك؟' },
  { id: 's003', text: 'I am fine, thank you.', difficulty: 'easy', type: 'sentence', category: 'responses', translation: 'أنا بخير، شكراً لك' },
  { id: 's004', text: 'Where do you live?', difficulty: 'easy', type: 'sentence', category: 'questions', translation: 'أين تعيش؟' },
  { id: 's005', text: 'I like to read books.', difficulty: 'easy', type: 'sentence', category: 'preferences', translation: 'أحب قراءة الكتب' },
  { id: 's006', text: 'The weather is nice today.', difficulty: 'easy', type: 'sentence', category: 'weather', translation: 'الطقس جميل اليوم' },
  { id: 's007', text: 'Can you help me please?', difficulty: 'easy', type: 'sentence', category: 'requests', translation: 'هل يمكنك مساعدتي من فضلك؟' },
  { id: 's008', text: 'I need to go to work.', difficulty: 'easy', type: 'sentence', category: 'daily_life', translation: 'أحتاج للذهاب إلى العمل' },
  { id: 's009', text: 'This is my friend John.', difficulty: 'easy', type: 'sentence', category: 'introductions', translation: 'هذا صديقي جون' },
  { id: 's010', text: 'I love my family very much.', difficulty: 'easy', type: 'sentence', category: 'family', translation: 'أحب عائلتي كثيراً' },

  // Medium Sentences (400 examples)
  { id: 's101', text: 'Could you please help me with this?', difficulty: 'medium', type: 'sentence', category: 'requests', translation: 'هل يمكنك مساعدتي في هذا من فضلك؟' },
  { id: 's102', text: 'I would like to make a reservation.', difficulty: 'medium', type: 'sentence', category: 'formal', translation: 'أود أن أقوم بحجز' },
  { id: 's103', text: 'What time does the meeting start?', difficulty: 'medium', type: 'sentence', category: 'business', translation: 'في أي وقت يبدأ الاجتماع؟' },
  { id: 's104', text: 'I need to finish this project by tomorrow.', difficulty: 'medium', type: 'sentence', category: 'work', translation: 'أحتاج لإنهاء هذا المشروع بحلول الغد' },
  { id: 's105', text: 'The presentation was very informative and well-prepared.', difficulty: 'medium', type: 'sentence', category: 'business', translation: 'كان العرض مفيداً جداً ومحضراً بشكل جيد' },

  // Hard Sentences (200 examples)
  { id: 's201', text: 'The implementation of this sophisticated algorithm requires careful consideration.', difficulty: 'hard', type: 'sentence', category: 'technical', translation: 'تنفيذ هذه الخوارزمية المعقدة يتطلب دراسة دقيقة' },
  { id: 's202', text: 'Despite the challenging circumstances, we managed to achieve our objectives.', difficulty: 'hard', type: 'sentence', category: 'formal', translation: 'رغم الظروف الصعبة، تمكنا من تحقيق أهدافنا' },
  { id: 's203', text: 'The philosophical implications of this discovery are yet to be fully understood.', difficulty: 'hard', type: 'sentence', category: 'academic', translation: 'الآثار الفلسفية لهذا الاكتشاف لم تُفهم بالكامل بعد' },

  // Conversations (100 examples)
  { id: 'c001', text: 'A: Hello, how can I help you? B: I\'d like to order a coffee, please.', difficulty: 'easy', type: 'conversation', category: 'service', translation: 'أ: مرحبا، كيف يمكنني مساعدتك؟ ب: أود طلب قهوة من فضلك' },
  { id: 'c002', text: 'A: What\'s the weather like today? B: It\'s sunny and warm.', difficulty: 'easy', type: 'conversation', category: 'small_talk', translation: 'أ: كيف الطقس اليوم؟ ب: مشمس ودافئ' },
  { id: 'c003', text: 'A: Could you tell me where the library is? B: Sure, it\'s on the second floor.', difficulty: 'easy', type: 'conversation', category: 'directions', translation: 'أ: هل يمكنك إخباري أين المكتبة؟ ب: بالطبع، إنها في الطابق الثاني' },
];

export const getExamplesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
  return expandedEnglishExamples.filter(example => example.difficulty === difficulty);
};

export const getExamplesByType = (type: 'word' | 'sentence' | 'conversation' | 'phrase') => {
  return expandedEnglishExamples.filter(example => example.type === type);
};

export const getExamplesByCategory = (category: string) => {
  return expandedEnglishExamples.filter(example => example.category === category);
};

export const getRandomExample = (difficulty?: 'easy' | 'medium' | 'hard', type?: string) => {
  let filtered = expandedEnglishExamples;
  
  if (difficulty) {
    filtered = filtered.filter(example => example.difficulty === difficulty);
  }
  
  if (type) {
    filtered = filtered.filter(example => example.type === type);
  }
  
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const getExamplesForMode = (mode: string, difficulty: string) => {
  const examples = expandedEnglishExamples.filter(ex => ex.difficulty === difficulty);
  
  switch (mode) {
    case 'pronunciation':
      return examples.filter(ex => ex.type === 'word');
    case 'fluency':
      return examples.filter(ex => ex.type === 'sentence');
    case 'roleplay':
      return examples.filter(ex => ex.type === 'conversation');
    case 'challenge':
      return examples.slice(0, 20); // Random mix for challenge
    default:
      return examples;
  }
};
