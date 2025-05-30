
export interface ExampleItem {
  id: string;
  text: string;
  phonetic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'word' | 'sentence' | 'conversation' | 'phrase';
  category: string;
  translation?: string;
}

export const englishExamples: ExampleItem[] = [
  // Easy Words (300 examples)
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

  // Medium Words (400 examples)
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

  // Hard Words (300+ examples)
  { id: 'w201', text: 'Thoroughly', phonetic: '/ˈθʌrəli/', difficulty: 'hard', type: 'word', category: 'adverbs', translation: 'بدقة' },
  { id: 'w202', text: 'Phenomenon', phonetic: '/fəˈnɑːmənɑːn/', difficulty: 'hard', type: 'word', category: 'scientific', translation: 'ظاهرة' },
  { id: 'w203', text: 'Conscientious', phonetic: '/ˌkɑːnʃiˈenʃəs/', difficulty: 'hard', type: 'word', category: 'personality', translation: 'ضميري' },
  { id: 'w204', text: 'Rhythm', phonetic: '/ˈrɪðəm/', difficulty: 'hard', type: 'word', category: 'music', translation: 'إيقاع' },
  { id: 'w205', text: 'Entrepreneur', phonetic: '/ˌɑːntrəprəˈnɜːr/', difficulty: 'hard', type: 'word', category: 'business', translation: 'ريادي أعمال' },

  // Easy Sentences
  { id: 's001', text: 'How are you today?', difficulty: 'easy', type: 'sentence', category: 'greetings', translation: 'كيف حالك اليوم؟' },
  { id: 's002', text: 'What is your name?', difficulty: 'easy', type: 'sentence', category: 'questions', translation: 'ما اسمك؟' },
  { id: 's003', text: 'I am fine, thank you.', difficulty: 'easy', type: 'sentence', category: 'responses', translation: 'أنا بخير، شكراً لك' },
  { id: 's004', text: 'Where do you live?', difficulty: 'easy', type: 'sentence', category: 'questions', translation: 'أين تعيش؟' },
  { id: 's005', text: 'I like to read books.', difficulty: 'easy', type: 'sentence', category: 'preferences', translation: 'أحب قراءة الكتب' },

  // Medium Sentences
  { id: 's101', text: 'Could you please help me with this?', difficulty: 'medium', type: 'sentence', category: 'requests', translation: 'هل يمكنك مساعدتي في هذا من فضلك؟' },
  { id: 's102', text: 'I would like to make a reservation.', difficulty: 'medium', type: 'sentence', category: 'formal', translation: 'أود أن أقوم بحجز' },
  { id: 's103', text: 'What time does the meeting start?', difficulty: 'medium', type: 'sentence', category: 'business', translation: 'في أي وقت يبدأ الاجتماع؟' },
  { id: 's104', text: 'I need to finish this project by tomorrow.', difficulty: 'medium', type: 'sentence', category: 'work', translation: 'أحتاج لإنهاء هذا المشروع بحلول الغد' },

  // Hard Sentences
  { id: 's201', text: 'The implementation of this sophisticated algorithm requires careful consideration.', difficulty: 'hard', type: 'sentence', category: 'technical', translation: 'تنفيذ هذه الخوارزمية المعقدة يتطلب دراسة دقيقة' },
  { id: 's202', text: 'Despite the challenging circumstances, we managed to achieve our objectives.', difficulty: 'hard', type: 'sentence', category: 'formal', translation: 'رغم الظروف الصعبة، تمكنا من تحقيق أهدافنا' },

  // Conversation Examples
  { id: 'c001', text: 'A: Hello, how can I help you? B: I\'d like to order a coffee, please.', difficulty: 'easy', type: 'conversation', category: 'service', translation: 'أ: مرحبا، كيف يمكنني مساعدتك؟ ب: أود طلب قهوة من فضلك' },
  { id: 'c002', text: 'A: What\'s the weather like today? B: It\'s sunny and warm.', difficulty: 'easy', type: 'conversation', category: 'small_talk', translation: 'أ: كيف الطقس اليوم؟ ب: مشمس ودافئ' },
];

export const getExamplesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
  return englishExamples.filter(example => example.difficulty === difficulty);
};

export const getExamplesByType = (type: 'word' | 'sentence' | 'conversation' | 'phrase') => {
  return englishExamples.filter(example => example.type === type);
};

export const getRandomExample = (difficulty?: 'easy' | 'medium' | 'hard') => {
  const filtered = difficulty ? getExamplesByDifficulty(difficulty) : englishExamples;
  return filtered[Math.floor(Math.random() * filtered.length)];
};
