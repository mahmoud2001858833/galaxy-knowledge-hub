
// Advanced English learning examples with comprehensive coverage

export interface EnglishExample {
  id: string;
  text: string;
  translation?: string;
  phonetic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  mode: string[];
  tips?: string;
  context?: string;
}

export const expandedEnglishExamples: EnglishExample[] = [
  // Easy Level - Basic Pronunciation
  {
    id: '1',
    text: 'Hello',
    translation: 'مرحبا',
    phonetic: '/həˈloʊ/',
    difficulty: 'easy',
    category: 'greetings',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '2',
    text: 'Thank you',
    translation: 'شكرا لك',
    phonetic: '/θæŋk juː/',
    difficulty: 'easy',
    category: 'politeness',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '3',
    text: 'Good morning',
    translation: 'صباح الخير',
    phonetic: '/ɡʊd ˈmɔːrnɪŋ/',
    difficulty: 'easy',
    category: 'greetings',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '4',
    text: 'Please',
    translation: 'من فضلك',
    phonetic: '/pliːz/',
    difficulty: 'easy',
    category: 'politeness',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '5',
    text: 'Excuse me',
    translation: 'عذرا',
    phonetic: '/ɪkˈskjuːz miː/',
    difficulty: 'easy',
    category: 'politeness',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '6',
    text: 'How are you?',
    translation: 'كيف حالك؟',
    phonetic: '/haʊ ɑːr juː/',
    difficulty: 'easy',
    category: 'conversation',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '7',
    text: 'I am fine',
    translation: 'أنا بخير',
    phonetic: '/aɪ æm faɪn/',
    difficulty: 'easy',
    category: 'conversation',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '8',
    text: 'What is your name?',
    translation: 'ما اسمك؟',
    phonetic: '/wʌt ɪz jʊr neɪm/',
    difficulty: 'easy',
    category: 'conversation',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '9',
    text: 'My name is...',
    translation: 'اسمي...',
    phonetic: '/maɪ neɪm ɪz/',
    difficulty: 'easy',
    category: 'conversation',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '10',
    text: 'Nice to meet you',
    translation: 'سعيد لمقابلتك',
    phonetic: '/naɪs tuː miːt juː/',
    difficulty: 'easy',
    category: 'greetings',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },

  // Easy Level - Numbers and Time
  {
    id: '11',
    text: 'One, two, three',
    translation: 'واحد، اثنان، ثلاثة',
    phonetic: '/wʌn tuː θriː/',
    difficulty: 'easy',
    category: 'numbers',
    mode: ['pronunciation']
  },
  {
    id: '12',
    text: 'What time is it?',
    translation: 'كم الساعة؟',
    phonetic: '/wʌt taɪm ɪz ɪt/',
    difficulty: 'easy',
    category: 'time',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '13',
    text: 'It is three o\'clock',
    translation: 'الساعة الثالثة',
    phonetic: '/ɪt ɪz θriː əˈklɑːk/',
    difficulty: 'easy',
    category: 'time',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '14',
    text: 'Today is Monday',
    translation: 'اليوم هو الاثنين',
    phonetic: '/təˈdeɪ ɪz ˈmʌndeɪ/',
    difficulty: 'easy',
    category: 'time',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '15',
    text: 'I like apples',
    translation: 'أحب التفاح',
    phonetic: '/aɪ laɪk ˈæpəlz/',
    difficulty: 'easy',
    category: 'preferences',
    mode: ['pronunciation', 'fluency']
  },

  // Medium Level - Daily Conversations
  {
    id: '16',
    text: 'Could you help me please?',
    translation: 'هل يمكنك مساعدتي من فضلك؟',
    phonetic: '/kʊd juː hɛlp miː pliːz/',
    difficulty: 'medium',
    category: 'requests',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '17',
    text: 'Where is the nearest bank?',
    translation: 'أين أقرب بنك؟',
    phonetic: '/wɛr ɪz ðə ˈnɪrəst bæŋk/',
    difficulty: 'medium',
    category: 'directions',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '18',
    text: 'I would like to order coffee',
    translation: 'أريد أن أطلب قهوة',
    phonetic: '/aɪ wʊd laɪk tuː ˈɔːrdər ˈkɔːfi/',
    difficulty: 'medium',
    category: 'restaurant',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '19',
    text: 'How much does this cost?',
    translation: 'كم يكلف هذا؟',
    phonetic: '/haʊ mʌʧ dʌz ðɪs kɔːst/',
    difficulty: 'medium',
    category: 'shopping',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '20',
    text: 'I am looking for a job',
    translation: 'أبحث عن وظيفة',
    phonetic: '/aɪ æm ˈlʊkɪŋ fɔːr ə ʤɑːb/',
    difficulty: 'medium',
    category: 'employment',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '21',
    text: 'The weather is beautiful today',
    translation: 'الطقس جميل اليوم',
    phonetic: '/ðə ˈwɛðər ɪz ˈbjuːtəfəl təˈdeɪ/',
    difficulty: 'medium',
    category: 'weather',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '22',
    text: 'I need to catch the bus',
    translation: 'أحتاج للحاق بالحافلة',
    phonetic: '/aɪ niːd tuː kæʧ ðə bʌs/',
    difficulty: 'medium',
    category: 'transportation',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '23',
    text: 'Can you speak more slowly?',
    translation: 'هل يمكنك التحدث ببطء أكثر؟',
    phonetic: '/kæn juː spiːk mɔːr ˈsloʊli/',
    difficulty: 'medium',
    category: 'communication',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '24',
    text: 'I don\'t understand',
    translation: 'لا أفهم',
    phonetic: '/aɪ doʊnt ˌʌndərˈstænd/',
    difficulty: 'medium',
    category: 'communication',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '25',
    text: 'What does this word mean?',
    translation: 'ما معنى هذه الكلمة؟',
    phonetic: '/wʌt dʌz ðɪs wɜːrd miːn/',
    difficulty: 'medium',
    category: 'learning',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },

  // Medium Level - Professional Context
  {
    id: '26',
    text: 'I have a meeting at two',
    translation: 'لدي اجتماع في الثانية',
    phonetic: '/aɪ hæv ə ˈmiːtɪŋ æt tuː/',
    difficulty: 'medium',
    category: 'business',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '27',
    text: 'Please send me the report',
    translation: 'من فضلك أرسل لي التقرير',
    phonetic: '/pliːz sɛnd miː ðə rɪˈpɔːrt/',
    difficulty: 'medium',
    category: 'business',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '28',
    text: 'I am interested in this position',
    translation: 'أنا مهتم بهذا المنصب',
    phonetic: '/aɪ æm ˈɪntrəstəd ɪn ðɪs pəˈzɪʃən/',
    difficulty: 'medium',
    category: 'interview',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '29',
    text: 'Could you clarify that point?',
    translation: 'هل يمكنك توضيح تلك النقطة؟',
    phonetic: '/kʊd juː ˈklærəˌfaɪ ðæt pɔɪnt/',
    difficulty: 'medium',
    category: 'business',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },
  {
    id: '30',
    text: 'Let\'s schedule another meeting',
    translation: 'دعنا نحدد اجتماعاً آخر',
    phonetic: '/lɛts ˈskɛʤul əˈnʌðər ˈmiːtɪŋ/',
    difficulty: 'medium',
    category: 'business',
    mode: ['pronunciation', 'fluency', 'roleplay']
  },

  // Hard Level - Advanced Vocabulary
  {
    id: '31',
    text: 'The implementation was thoroughly executed',
    translation: 'تم تنفيذ التطبيق بدقة',
    phonetic: '/ðə ˌɪmpləmɛnˈteɪʃən wʌz ˈθɜːroʊli ˈɛksəˌkjuːtəd/',
    difficulty: 'hard',
    category: 'academic',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '32',
    text: 'Notwithstanding the circumstances',
    translation: 'بالرغم من الظروف',
    phonetic: '/ˌnɑːtwɪθˈstændɪŋ ðə ˈsɜːrkəmˌstænsəz/',
    difficulty: 'hard',
    category: 'formal',
    mode: ['pronunciation']
  },
  {
    id: '33',
    text: 'The phenomenon requires further investigation',
    translation: 'تتطلب الظاهرة مزيداً من التحقيق',
    phonetic: '/ðə fəˈnɑːmənɑːn rɪˈkwaɪərz ˈfɜːrðər ɪnˌvɛstəˈgeɪʃən/',
    difficulty: 'hard',
    category: 'scientific',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '34',
    text: 'Entrepreneurship drives innovation',
    translation: 'ريادة الأعمال تحفز الابتكار',
    phonetic: '/ˌɑːntrəprəˈnɜːrʃɪp draɪvz ˌɪnəˈveɪʃən/',
    difficulty: 'hard',
    category: 'business',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '35',
    text: 'Psychological assessment is crucial',
    translation: 'التقييم النفسي أمر بالغ الأهمية',
    phonetic: '/ˌsaɪkəˈlɑːʤɪkəl əˈsɛsmənt ɪz ˈkruːʃəl/',
    difficulty: 'hard',
    category: 'psychology',
    mode: ['pronunciation', 'fluency']
  },

  // Hard Level - Complex Sentences
  {
    id: '36',
    text: 'The comprehensive analysis demonstrates significant correlations',
    translation: 'يوضح التحليل الشامل وجود ارتباطات مهمة',
    phonetic: '/ðə ˌkɑːmprɪˈhɛnsɪv əˈnæləsəs ˈdɛmənˌstreɪts sɪɡˈnɪfəkənt ˌkɔːrəˈleɪʃənz/',
    difficulty: 'hard',
    category: 'academic',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '37',
    text: 'Technological advancement necessitates adaptation',
    translation: 'التقدم التكنولوجي يستدعي التكيف',
    phonetic: '/ˌtɛknəˈlɑːʤɪkəl ədˈvænsmənt nəˈsɛsəˌteɪts ˌædæpˈteɪʃən/',
    difficulty: 'hard',
    category: 'technology',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '38',
    text: 'The pharmaceutical industry faces unprecedented challenges',
    translation: 'تواجه صناعة الأدوية تحديات غير مسبوقة',
    phonetic: '/ðə ˌfɑːrməˈsuːtɪkəl ˈɪndəstri ˈfeɪsəz ʌnˈprɛsəˌdɛntəd ˈʧælənʤəz/',
    difficulty: 'hard',
    category: 'medical',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '39',
    text: 'Sustainable development requires collaborative efforts',
    translation: 'التنمية المستدامة تتطلب جهوداً تعاونية',
    phonetic: '/səˈsteɪnəbəl dɪˈvɛləpmənt rɪˈkwaɪərz kəˈlæbrətɪv ˈɛfərts/',
    difficulty: 'hard',
    category: 'environment',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '40',
    text: 'The methodology encompasses various parameters',
    translation: 'تشمل المنهجية معايير مختلفة',
    phonetic: '/ðə ˌmɛθəˈdɑːləʤi ɪnˈkʌmpəsəz ˈvɛriəs pəˈræmətərz/',
    difficulty: 'hard',
    category: 'research',
    mode: ['pronunciation', 'fluency']
  },

  // Roleplay Scenarios - Easy
  {
    id: '41',
    text: 'Welcome to our restaurant. How many people?',
    translation: 'مرحباً بكم في مطعمنا. كم شخص؟',
    phonetic: '/ˈwɛlkəm tuː aʊər ˈrɛstərɑːnt haʊ ˈmɛni ˈpiːpəl/',
    difficulty: 'easy',
    category: 'restaurant',
    mode: ['roleplay', 'fluency']
  },
  {
    id: '42',
    text: 'Table for two, please',
    translation: 'طاولة لشخصين، من فضلك',
    phonetic: '/ˈteɪbəl fɔːr tuː pliːz/',
    difficulty: 'easy',
    category: 'restaurant',
    mode: ['roleplay', 'fluency']
  },
  {
    id: '43',
    text: 'Are you ready to order?',
    translation: 'هل أنتم مستعدون للطلب؟',
    phonetic: '/ɑːr juː ˈrɛdi tuː ˈɔːrdər/',
    difficulty: 'easy',
    category: 'restaurant',
    mode: ['roleplay', 'fluency']
  },
  {
    id: '44',
    text: 'I\'ll have the chicken salad',
    translation: 'سآخذ سلطة الدجاج',
    phonetic: '/aɪl hæv ðə ˈʧɪkən ˈsæləd/',
    difficulty: 'easy',
    category: 'restaurant',
    mode: ['roleplay', 'fluency']
  },
  {
    id: '45',
    text: 'How do I get to the airport?',
    translation: 'كيف أصل إلى المطار؟',
    phonetic: '/haʊ duː aɪ ɡɛt tuː ðə ˈɛrˌpɔːrt/',
    difficulty: 'easy',
    category: 'directions',
    mode: ['roleplay', 'fluency']
  },

  // Roleplay Scenarios - Medium
  {
    id: '46',
    text: 'I\'d like to make a reservation for tonight',
    translation: 'أود أن أحجز لهذه الليلة',
    phonetic: '/aɪd laɪk tuː meɪk ə ˌrɛzərˈveɪʃən fɔːr təˈnaɪt/',
    difficulty: 'medium',
    category: 'hotel',
    mode: ['roleplay', 'fluency']
  },
  {
    id: '47',
    text: 'Could you tell me about your experience?',
    translation: 'هل يمكنك أن تخبرني عن خبرتك؟',
    phonetic: '/kʊd juː tɛl miː əˈbaʊt jʊr ɪkˈspɪriəns/',
    difficulty: 'medium',
    category: 'interview',
    mode: ['roleplay', 'fluency']
  },
  {
    id: '48',
    text: 'I have five years of experience in marketing',
    translation: 'لدي خمس سنوات خبرة في التسويق',
    phonetic: '/aɪ hæv faɪv jɪrz ʌv ɪkˈspɪriəns ɪn ˈmɑːrkətɪŋ/',
    difficulty: 'medium',
    category: 'interview',
    mode: ['roleplay', 'fluency']
  },
  {
    id: '49',
    text: 'What are your strengths and weaknesses?',
    translation: 'ما هي نقاط قوتك وضعفك؟',
    phonetic: '/wʌt ɑːr jʊr strɛŋθs ænd ˈwiːknəsəz/',
    difficulty: 'medium',
    category: 'interview',
    mode: ['roleplay', 'fluency']
  },
  {
    id: '50',
    text: 'I need to see a doctor urgently',
    translation: 'أحتاج لرؤية طبيب بشكل عاجل',
    phonetic: '/aɪ niːd tuː siː ə ˈdɑːktər ˈɜːrʤəntli/',
    difficulty: 'medium',
    category: 'medical',
    mode: ['roleplay', 'fluency']
  },

  // Advanced Pronunciation Challenges
  {
    id: '51',
    text: 'Sixth',
    translation: 'السادس',
    phonetic: '/sɪksθ/',
    difficulty: 'hard',
    category: 'pronunciation',
    mode: ['pronunciation'],
    tips: 'Focus on the /ks/ and /θ/ sounds combination'
  },
  {
    id: '52',
    text: 'Clothes',
    translation: 'ملابس',
    phonetic: '/kloʊðz/',
    difficulty: 'medium',
    category: 'pronunciation',
    mode: ['pronunciation'],
    tips: 'Note the silent /e/ and the /θ/ sound'
  },
  {
    id: '53',
    text: 'Through',
    translation: 'خلال',
    phonetic: '/θruː/',
    difficulty: 'medium',
    category: 'pronunciation',
    mode: ['pronunciation'],
    tips: 'Start with /θ/ sound, not /t/'
  },
  {
    id: '54',
    text: 'Thorough',
    translation: 'شامل',
    phonetic: '/ˈθɜːroʊ/',
    difficulty: 'hard',
    category: 'pronunciation',
    mode: ['pronunciation'],
    tips: 'Two syllables with /θ/ and /r/ sounds'
  },
  {
    id: '55',
    text: 'Massachusetts',
    translation: 'ماساتشوستس',
    phonetic: '/ˌmæsəˈʧuːsəts/',
    difficulty: 'hard',
    category: 'places',
    mode: ['pronunciation'],
    tips: 'Four syllables with stress on the third'
  },

  // Fluency Building Sentences
  {
    id: '56',
    text: 'I love learning English because it opens many opportunities',
    translation: 'أحب تعلم الإنجليزية لأنها تفتح فرصاً كثيرة',
    phonetic: '/aɪ lʌv ˈlɜːrnɪŋ ˈɪŋɡlɪʃ bɪˈkɔːz ɪt ˈoʊpənz ˈmɛni ˌɑːpərˈtuːnətiz/',
    difficulty: 'medium',
    category: 'personal',
    mode: ['fluency']
  },
  {
    id: '57',
    text: 'Travel broadens the mind and enriches the soul',
    translation: 'السفر يوسع العقل ويثري الروح',
    phonetic: '/ˈtrævəl ˈbrɔːdənz ðə maɪnd ænd ɪnˈrɪʧəz ðə soʊl/',
    difficulty: 'medium',
    category: 'philosophy',
    mode: ['fluency']
  },
  {
    id: '58',
    text: 'Technology has revolutionized the way we communicate',
    translation: 'لقد أحدثت التكنولوجيا ثورة في طريقة تواصلنا',
    phonetic: '/tɛkˈnɑːləʤi hæz ˌrɛvəˈluːʃəˌnaɪzd ðə weɪ wiː kəˈmjuːnəˌkeɪt/',
    difficulty: 'hard',
    category: 'technology',
    mode: ['fluency']
  },
  {
    id: '59',
    text: 'Education is the foundation of personal development',
    translation: 'التعليم هو أساس التطوير الشخصي',
    phonetic: '/ˌɛʤəˈkeɪʃən ɪz ðə faʊnˈdeɪʃən ʌv ˈpɜːrsənəl dɪˈvɛləpmənt/',
    difficulty: 'medium',
    category: 'education',
    mode: ['fluency']
  },
  {
    id: '60',
    text: 'Success requires dedication, perseverance, and continuous learning',
    translation: 'النجاح يتطلب التفاني والمثابرة والتعلم المستمر',
    phonetic: '/səkˈsɛs rɪˈkwaɪərz ˌdɛdəˈkeɪʃən pərˈsɪvərəns ænd kənˈtɪnjuəs ˈlɜːrnɪŋ/',
    difficulty: 'hard',
    category: 'motivation',
    mode: ['fluency']
  },

  // Business & Professional
  {
    id: '61',
    text: 'Let\'s discuss the quarterly results',
    translation: 'دعنا نناقش النتائج الفصلية',
    phonetic: '/lɛts dɪsˈkʌs ðə ˈkwɔːrtərli rɪˈzʌlts/',
    difficulty: 'medium',
    category: 'business',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '62',
    text: 'The presentation was very informative',
    translation: 'كان العرض التقديمي مفيداً جداً',
    phonetic: '/ðə ˌprizənˈteɪʃən wʌz ˈvɛri ɪnˈfɔːrmətɪv/',
    difficulty: 'medium',
    category: 'business',
    mode: ['fluency']
  },
  {
    id: '63',
    text: 'Could you forward me the agenda?',
    translation: 'هل يمكنك إرسال جدول الأعمال لي؟',
    phonetic: '/kʊd juː ˈfɔːrwərd miː ðə əˈʤɛndə/',
    difficulty: 'medium',
    category: 'business',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '64',
    text: 'We need to increase our market share',
    translation: 'نحتاج لزيادة حصتنا في السوق',
    phonetic: '/wiː niːd tuː ɪnˈkriːs aʊər ˈmɑːrkət ʃɛr/',
    difficulty: 'medium',
    category: 'business',
    mode: ['fluency']
  },
  {
    id: '65',
    text: 'The deadline is approaching rapidly',
    translation: 'الموعد النهائي يقترب بسرعة',
    phonetic: '/ðə ˈdɛdlaɪn ɪz əˈproʊʧɪŋ ˈræpədli/',
    difficulty: 'medium',
    category: 'business',
    mode: ['fluency']
  },

  // Academic & Scientific
  {
    id: '66',
    text: 'The hypothesis was proven incorrect',
    translation: 'ثبت أن الفرضية غير صحيحة',
    phonetic: '/ðə haɪˈpɑːθəsəs wʌz ˈpruvən ˌɪnkəˈrɛkt/',
    difficulty: 'hard',
    category: 'academic',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '67',
    text: 'Research methodology is crucial for validity',
    translation: 'منهجية البحث مهمة للصحة',
    phonetic: '/rɪˈsɜːrʧ ˌmɛθəˈdɑːləʤi ɪz ˈkruːʃəl fɔːr vəˈlɪdəti/',
    difficulty: 'hard',
    category: 'academic',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '68',
    text: 'Statistical analysis reveals interesting patterns',
    translation: 'يكشف التحليل الإحصائي عن أنماط مثيرة',
    phonetic: '/stəˈtɪstɪkəl əˈnæləsəs rɪˈvilz ˈɪntrəstɪŋ ˈpætərnz/',
    difficulty: 'hard',
    category: 'academic',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '69',
    text: 'The experiment yielded unexpected results',
    translation: 'أسفرت التجربة عن نتائج غير متوقعة',
    phonetic: '/ðə ɪkˈspɛrəmənt ˈjildəd ˌʌnɪkˈspɛktəd rɪˈzʌlts/',
    difficulty: 'hard',
    category: 'scientific',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '70',
    text: 'Peer review ensures academic integrity',
    translation: 'مراجعة الأقران تضمن النزاهة الأكاديمية',
    phonetic: '/pɪr rɪˈvju ɪnˈʃʊrz ˌækəˈdɛmɪk ɪnˈtɛɡrəti/',
    difficulty: 'hard',
    category: 'academic',
    mode: ['pronunciation', 'fluency']
  },

  // Travel & Tourism
  {
    id: '71',
    text: 'I\'d like to book a round-trip ticket',
    translation: 'أود أن أحجز تذكرة ذهاب وإياب',
    phonetic: '/aɪd laɪk tuː bʊk ə raʊnd trɪp ˈtɪkət/',
    difficulty: 'medium',
    category: 'travel',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '72',
    text: 'What time does the flight depart?',
    translation: 'في أي وقت تقلع الطائرة؟',
    phonetic: '/wʌt taɪm dʌz ðə flaɪt dɪˈpɑːrt/',
    difficulty: 'medium',
    category: 'travel',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '73',
    text: 'Could you recommend a good restaurant?',
    translation: 'هل يمكنك أن توصي بمطعم جيد؟',
    phonetic: '/kʊd juː ˌrɛkəˈmɛnd ə ɡʊd ˈrɛstərɑːnt/',
    difficulty: 'medium',
    category: 'travel',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '74',
    text: 'The hotel offers excellent amenities',
    translation: 'يوفر الفندق وسائل راحة ممتازة',
    phonetic: '/ðə hoʊˈtɛl ˈɔːfərz ˈɛksələnt əˈminətiz/',
    difficulty: 'medium',
    category: 'travel',
    mode: ['fluency']
  },
  {
    id: '75',
    text: 'I\'m here for business purposes',
    translation: 'أنا هنا لأغراض العمل',
    phonetic: '/aɪm hɪr fɔːr ˈbɪznəs ˈpɜːrpəsəz/',
    difficulty: 'medium',
    category: 'travel',
    mode: ['fluency', 'roleplay']
  },

  // Health & Medical
  {
    id: '76',
    text: 'I have a terrible headache',
    translation: 'لدي صداع رهيب',
    phonetic: '/aɪ hæv ə ˈtɛrəbəl ˈhɛdˌeɪk/',
    difficulty: 'easy',
    category: 'medical',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '77',
    text: 'When did the symptoms start?',
    translation: 'متى بدأت الأعراض؟',
    phonetic: '/wɛn dɪd ðə ˈsɪmptəmz stɑːrt/',
    difficulty: 'medium',
    category: 'medical',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '78',
    text: 'Take this medication twice daily',
    translation: 'تناول هذا الدواء مرتين يومياً',
    phonetic: '/teɪk ðɪs ˌmɛdəˈkeɪʃən twaɪs ˈdeɪli/',
    difficulty: 'medium',
    category: 'medical',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '79',
    text: 'Regular exercise improves health',
    translation: 'التمرين المنتظم يحسن الصحة',
    phonetic: '/ˈrɛɡjələr ˈɛksərˌsaɪz ɪmˈpruvz hɛlθ/',
    difficulty: 'medium',
    category: 'health',
    mode: ['fluency']
  },
  {
    id: '80',
    text: 'Preventive care is essential',
    translation: 'الرعاية الوقائية ضرورية',
    phonetic: '/prɪˈvɛntɪv kɛr ɪz ɪˈsɛnʃəl/',
    difficulty: 'medium',
    category: 'health',
    mode: ['fluency']
  },

  // Additional challenging words and phrases
  {
    id: '81',
    text: 'Conscientious',
    translation: 'ضميري',
    phonetic: '/ˌkɑːnʃiˈɛnʃəs/',
    difficulty: 'hard',
    category: 'vocabulary',
    mode: ['pronunciation']
  },
  {
    id: '82',
    text: 'Worcestershire',
    translation: 'ووسترشاير',
    phonetic: '/ˈwʊstərʃər/',
    difficulty: 'hard',
    category: 'places',
    mode: ['pronunciation']
  },
  {
    id: '83',
    text: 'Entrepreneur',
    translation: 'رائد أعمال',
    phonetic: '/ˌɑːntrəprəˈnɜːr/',
    difficulty: 'hard',
    category: 'business',
    mode: ['pronunciation']
  },
  {
    id: '84',
    text: 'Particularly',
    translation: 'بشكل خاص',
    phonetic: '/pərˈtɪkjələrli/',
    difficulty: 'medium',
    category: 'adverbs',
    mode: ['pronunciation']
  },
  {
    id: '85',
    text: 'Refrigerator',
    translation: 'ثلاجة',
    phonetic: '/rɪˈfrɪʤəˌreɪtər/',
    difficulty: 'medium',
    category: 'household',
    mode: ['pronunciation']
  },

  // Tongue Twisters for Pronunciation Practice
  {
    id: '86',
    text: 'She sells seashells by the seashore',
    translation: 'هي تبيع الأصداف على شاطئ البحر',
    phonetic: '/ʃi sɛlz ˈsiʃɛlz baɪ ðə ˈsiʃɔːr/',
    difficulty: 'hard',
    category: 'tongue-twister',
    mode: ['pronunciation']
  },
  {
    id: '87',
    text: 'Peter Piper picked a peck of pickled peppers',
    translation: 'بيتر بايبر قطف كمية من الفلفل المخلل',
    phonetic: '/ˈpitər ˈpaɪpər pɪkt ə pɛk ʌv ˈpɪkəld ˈpɛpərz/',
    difficulty: 'hard',
    category: 'tongue-twister',
    mode: ['pronunciation']
  },
  {
    id: '88',
    text: 'Red lorry, yellow lorry',
    translation: 'شاحنة حمراء، شاحنة صفراء',
    phonetic: '/rɛd ˈlɔːri ˈjɛloʊ ˈlɔːri/',
    difficulty: 'hard',
    category: 'tongue-twister',
    mode: ['pronunciation']
  },
  {
    id: '89',
    text: 'Unique New York',
    translation: 'نيويورك الفريدة',
    phonetic: '/juˈnik nu jɔːrk/',
    difficulty: 'medium',
    category: 'tongue-twister',
    mode: ['pronunciation']
  },
  {
    id: '90',
    text: 'Toy boat',
    translation: 'قارب لعبة',
    phonetic: '/tɔɪ boʊt/',
    difficulty: 'medium',
    category: 'tongue-twister',
    mode: ['pronunciation']
  },

  // Advanced conversation starters
  {
    id: '91',
    text: 'What\'s your opinion on climate change?',
    translation: 'ما رأيك في تغير المناخ؟',
    phonetic: '/wʌts jʊr əˈpɪnjən ɑːn ˈklaɪmət ʧeɪnʤ/',
    difficulty: 'medium',
    category: 'discussion',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '92',
    text: 'How do you balance work and personal life?',
    translation: 'كيف توازن بين العمل والحياة الشخصية؟',
    phonetic: '/haʊ duː juː ˈbæləns wɜːrk ænd ˈpɜːrsənəl laɪf/',
    difficulty: 'medium',
    category: 'discussion',
    mode: ['fluency', 'roleplay']
  },
  {
    id: '93',
    text: 'Technology has both advantages and disadvantages',
    translation: 'للتكنولوجيا مزايا وعيوب',
    phonetic: '/tɛkˈnɑːləʤi hæz boʊθ ədˈvæntɪʤəz ænd ˌdɪsədˈvæntɪʤəz/',
    difficulty: 'medium',
    category: 'discussion',
    mode: ['fluency']
  },
  {
    id: '94',
    text: 'Cultural diversity enriches society',
    translation: 'التنوع الثقافي يثري المجتمع',
    phonetic: '/ˈkʌlʧərəl daɪˈvɜːrsəti ɪnˈrɪʧəz səˈsaɪəti/',
    difficulty: 'medium',
    category: 'discussion',
    mode: ['fluency']
  },
  {
    id: '95',
    text: 'Innovation drives economic growth',
    translation: 'الابتكار يحفز النمو الاقتصادي',
    phonetic: '/ˌɪnəˈveɪʃən draɪvz ˌikəˈnɑːmɪk ɡroʊθ/',
    difficulty: 'hard',
    category: 'economics',
    mode: ['fluency']
  },

  // Final advanced examples
  {
    id: '96',
    text: 'The circumstances were rather extraordinary',
    translation: 'كانت الظروف استثنائية للغاية',
    phonetic: '/ðə ˈsɜːrkəmˌstænsəz wɜːr ˈræðər ɪkˈstrɔːrdəˌnɛri/',
    difficulty: 'hard',
    category: 'formal',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '97',
    text: 'Globalization has transformed international trade',
    translation: 'لقد غيرت العولمة التجارة الدولية',
    phonetic: '/ˌɡloʊbələˈzeɪʃən hæz trænsˈfɔːrmd ˌɪntərˈnæʃənəl treɪd/',
    difficulty: 'hard',
    category: 'economics',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '98',
    text: 'Artificial intelligence revolutionizes industries',
    translation: 'الذكاء الاصطناعي يُحدث ثورة في الصناعات',
    phonetic: '/ˌɑːrtəˈfɪʃəl ɪnˈtɛləʤəns ˌrɛvəˈluːʃəˌnaɪzəz ˈɪndəstriz/',
    difficulty: 'hard',
    category: 'technology',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '99',
    text: 'Mindfulness meditation promotes mental well-being',
    translation: 'تأمل الوعي يعزز الرفاهية النفسية',
    phonetic: '/ˈmaɪndfəlnəs ˌmɛdəˈteɪʃən prəˈmoʊts ˈmɛntəl wɛl ˈbiɪŋ/',
    difficulty: 'hard',
    category: 'wellness',
    mode: ['pronunciation', 'fluency']
  },
  {
    id: '100',
    text: 'Interdisciplinary collaboration yields breakthrough discoveries',
    translation: 'التعاون متعدد التخصصات ينتج اكتشافات مفاصلية',
    phonetic: '/ˌɪntərdɪsəˈplɪnəri kəˌlæbəˈreɪʃən jildz ˈbreɪkθru dɪˈskʌvəriz/',
    difficulty: 'hard',
    category: 'research',
    mode: ['pronunciation', 'fluency']
  }
];

// Helper functions
export const getExamplesForMode = (mode: string, difficulty: 'easy' | 'medium' | 'hard'): EnglishExample[] => {
  return expandedEnglishExamples.filter(example => 
    example.mode.includes(mode) && example.difficulty === difficulty
  );
};

export const getExamplesByCategory = (category: string): EnglishExample[] => {
  return expandedEnglishExamples.filter(example => example.category === category);
};

export const getExamplesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): EnglishExample[] => {
  return expandedEnglishExamples.filter(example => example.difficulty === difficulty);
};

export const getRandomExample = (mode?: string, difficulty?: 'easy' | 'medium' | 'hard'): EnglishExample => {
  let filteredExamples = expandedEnglishExamples;
  
  if (mode) {
    filteredExamples = filteredExamples.filter(example => example.mode.includes(mode));
  }
  
  if (difficulty) {
    filteredExamples = filteredExamples.filter(example => example.difficulty === difficulty);
  }
  
  return filteredExamples[Math.floor(Math.random() * filteredExamples.length)] || expandedEnglishExamples[0];
};

export const searchExamples = (query: string): EnglishExample[] => {
  const searchTerm = query.toLowerCase();
  return expandedEnglishExamples.filter(example => 
    example.text.toLowerCase().includes(searchTerm) ||
    example.translation?.toLowerCase().includes(searchTerm) ||
    example.category.toLowerCase().includes(searchTerm)
  );
};

// Categories for organization
export const categories = [
  'greetings', 'politeness', 'conversation', 'numbers', 'time', 'preferences',
  'requests', 'directions', 'restaurant', 'shopping', 'employment', 'weather',
  'transportation', 'communication', 'learning', 'business', 'interview',
  'academic', 'formal', 'scientific', 'psychology', 'technology', 'medical',
  'environment', 'research', 'hotel', 'travel', 'health', 'vocabulary',
  'places', 'household', 'adverbs', 'tongue-twister', 'discussion',
  'economics', 'wellness'
];

// Difficulty distribution
export const difficultyStats = {
  easy: expandedEnglishExamples.filter(ex => ex.difficulty === 'easy').length,
  medium: expandedEnglishExamples.filter(ex => ex.difficulty === 'medium').length,
  hard: expandedEnglishExamples.filter(ex => ex.difficulty === 'hard').length,
  total: expandedEnglishExamples.length
};
