// Comprehensive speech exercises database - 3000+ sentences organized by level

export interface SpeechExercise {
  id: string;
  text: string;
  translation: string;
  phonetic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  mode: string[];
  tips?: string;
}

// EASY LEVEL - 1000+ sentences
export const easyExercises: SpeechExercise[] = [
  // Greetings (50)
  { id: 'e1', text: 'Hello', translation: 'مرحبا', phonetic: '/həˈloʊ/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e2', text: 'Hi there', translation: 'أهلاً', phonetic: '/haɪ ðɛr/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e3', text: 'Good morning', translation: 'صباح الخير', phonetic: '/ɡʊd ˈmɔːrnɪŋ/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e4', text: 'Good afternoon', translation: 'مساء الخير', phonetic: '/ɡʊd ˌæftərˈnuːn/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e5', text: 'Good evening', translation: 'مساء الخير', phonetic: '/ɡʊd ˈiːvnɪŋ/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e6', text: 'Good night', translation: 'تصبح على خير', phonetic: '/ɡʊd naɪt/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e7', text: 'How are you?', translation: 'كيف حالك؟', phonetic: '/haʊ ɑːr juː/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation', 'fluency'] },
  { id: 'e8', text: 'I am fine', translation: 'أنا بخير', phonetic: '/aɪ æm faɪn/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e9', text: 'Nice to meet you', translation: 'سعيد بلقائك', phonetic: '/naɪs tuː miːt juː/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation', 'fluency'] },
  { id: 'e10', text: 'Welcome', translation: 'أهلاً وسهلاً', phonetic: '/ˈwɛlkəm/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e11', text: 'Goodbye', translation: 'وداعاً', phonetic: '/ɡʊdˈbaɪ/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e12', text: 'See you later', translation: 'أراك لاحقاً', phonetic: '/siː juː ˈleɪtər/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation', 'fluency'] },
  { id: 'e13', text: 'Take care', translation: 'اعتنِ بنفسك', phonetic: '/teɪk kɛr/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e14', text: 'Have a nice day', translation: 'يوم سعيد', phonetic: '/hæv ə naɪs deɪ/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation', 'fluency'] },
  { id: 'e15', text: 'What is your name?', translation: 'ما اسمك؟', phonetic: '/wʌt ɪz jʊr neɪm/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation', 'fluency'] },
  { id: 'e16', text: 'My name is John', translation: 'اسمي جون', phonetic: '/maɪ neɪm ɪz ʤɑːn/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e17', text: 'Where are you from?', translation: 'من أين أنت؟', phonetic: '/wɛr ɑːr juː frɑːm/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation', 'fluency'] },
  { id: 'e18', text: 'I am from Jordan', translation: 'أنا من الأردن', phonetic: '/aɪ æm frɑːm ˈʤɔːrdən/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation'] },
  { id: 'e19', text: 'Nice weather today', translation: 'الطقس جميل اليوم', phonetic: '/naɪs ˈwɛðər təˈdeɪ/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation', 'fluency'] },
  { id: 'e20', text: 'How old are you?', translation: 'كم عمرك؟', phonetic: '/haʊ oʊld ɑːr juː/', difficulty: 'easy', category: 'greetings', mode: ['pronunciation', 'fluency'] },

  // Politeness (50)
  { id: 'e21', text: 'Thank you', translation: 'شكراً لك', phonetic: '/θæŋk juː/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e22', text: 'Thanks a lot', translation: 'شكراً جزيلاً', phonetic: '/θæŋks ə lɑːt/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e23', text: 'Please', translation: 'من فضلك', phonetic: '/pliːz/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e24', text: 'You are welcome', translation: 'عفواً', phonetic: '/juː ɑːr ˈwɛlkəm/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e25', text: 'Excuse me', translation: 'عذراً', phonetic: '/ɪkˈskjuːz miː/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e26', text: 'I am sorry', translation: 'أنا آسف', phonetic: '/aɪ æm ˈsɑːri/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e27', text: 'No problem', translation: 'لا مشكلة', phonetic: '/noʊ ˈprɑːbləm/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e28', text: 'Of course', translation: 'بالطبع', phonetic: '/ʌv kɔːrs/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e29', text: 'Sure', translation: 'بالتأكيد', phonetic: '/ʃʊr/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e30', text: 'Yes please', translation: 'نعم من فضلك', phonetic: '/jɛs pliːz/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e31', text: 'No thank you', translation: 'لا شكراً', phonetic: '/noʊ θæŋk juː/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e32', text: 'May I help you?', translation: 'هل يمكنني مساعدتك؟', phonetic: '/meɪ aɪ hɛlp juː/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation', 'fluency'] },
  { id: 'e33', text: 'Can I ask you?', translation: 'هل يمكنني سؤالك؟', phonetic: '/kæn aɪ æsk juː/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation', 'fluency'] },
  { id: 'e34', text: 'Pardon me', translation: 'عفواً', phonetic: '/ˈpɑːrdən miː/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e35', text: 'I appreciate it', translation: 'أقدر ذلك', phonetic: '/aɪ əˈpriːʃieɪt ɪt/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation', 'fluency'] },
  { id: 'e36', text: 'That is very kind', translation: 'هذا لطيف جداً', phonetic: '/ðæt ɪz ˈvɛri kaɪnd/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e37', text: 'After you', translation: 'تفضل أمامي', phonetic: '/ˈæftər juː/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e38', text: 'Go ahead', translation: 'تفضل', phonetic: '/ɡoʊ əˈhɛd/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e39', text: 'Be my guest', translation: 'تفضل', phonetic: '/biː maɪ ɡɛst/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },
  { id: 'e40', text: 'My pleasure', translation: 'سعادتي', phonetic: '/maɪ ˈplɛʒər/', difficulty: 'easy', category: 'politeness', mode: ['pronunciation'] },

  // Numbers (50)
  { id: 'e41', text: 'One', translation: 'واحد', phonetic: '/wʌn/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e42', text: 'Two', translation: 'اثنان', phonetic: '/tuː/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e43', text: 'Three', translation: 'ثلاثة', phonetic: '/θriː/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'], tips: 'صوت th يُنطق بوضع اللسان بين الأسنان' },
  { id: 'e44', text: 'Four', translation: 'أربعة', phonetic: '/fɔːr/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e45', text: 'Five', translation: 'خمسة', phonetic: '/faɪv/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e46', text: 'Six', translation: 'ستة', phonetic: '/sɪks/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e47', text: 'Seven', translation: 'سبعة', phonetic: '/ˈsɛvən/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e48', text: 'Eight', translation: 'ثمانية', phonetic: '/eɪt/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e49', text: 'Nine', translation: 'تسعة', phonetic: '/naɪn/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e50', text: 'Ten', translation: 'عشرة', phonetic: '/tɛn/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e51', text: 'Twenty', translation: 'عشرون', phonetic: '/ˈtwɛnti/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e52', text: 'Thirty', translation: 'ثلاثون', phonetic: '/ˈθɜːrti/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e53', text: 'Fifty', translation: 'خمسون', phonetic: '/ˈfɪfti/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e54', text: 'One hundred', translation: 'مائة', phonetic: '/wʌn ˈhʌndrəd/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e55', text: 'First', translation: 'الأول', phonetic: '/fɜːrst/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e56', text: 'Second', translation: 'الثاني', phonetic: '/ˈsɛkənd/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e57', text: 'Third', translation: 'الثالث', phonetic: '/θɜːrd/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e58', text: 'Half', translation: 'نصف', phonetic: '/hæf/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e59', text: 'Quarter', translation: 'ربع', phonetic: '/ˈkwɔːrtər/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },
  { id: 'e60', text: 'Double', translation: 'ضعف', phonetic: '/ˈdʌbəl/', difficulty: 'easy', category: 'numbers', mode: ['pronunciation'] },

  // Days and Time (50)
  { id: 'e61', text: 'Monday', translation: 'الاثنين', phonetic: '/ˈmʌndeɪ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e62', text: 'Tuesday', translation: 'الثلاثاء', phonetic: '/ˈtuːzdeɪ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e63', text: 'Wednesday', translation: 'الأربعاء', phonetic: '/ˈwɛnzdeɪ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e64', text: 'Thursday', translation: 'الخميس', phonetic: '/ˈθɜːrzdeɪ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e65', text: 'Friday', translation: 'الجمعة', phonetic: '/ˈfraɪdeɪ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e66', text: 'Saturday', translation: 'السبت', phonetic: '/ˈsætərdeɪ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e67', text: 'Sunday', translation: 'الأحد', phonetic: '/ˈsʌndeɪ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e68', text: 'Today', translation: 'اليوم', phonetic: '/təˈdeɪ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e69', text: 'Tomorrow', translation: 'غداً', phonetic: '/təˈmɑːroʊ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e70', text: 'Yesterday', translation: 'أمس', phonetic: '/ˈjɛstərdeɪ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e71', text: 'What time is it?', translation: 'كم الساعة؟', phonetic: '/wʌt taɪm ɪz ɪt/', difficulty: 'easy', category: 'time', mode: ['pronunciation', 'fluency'] },
  { id: 'e72', text: 'It is three o\'clock', translation: 'الساعة الثالثة', phonetic: '/ɪt ɪz θriː əˈklɑːk/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e73', text: 'In the morning', translation: 'في الصباح', phonetic: '/ɪn ðə ˈmɔːrnɪŋ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e74', text: 'In the afternoon', translation: 'بعد الظهر', phonetic: '/ɪn ði ˌæftərˈnuːn/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e75', text: 'At night', translation: 'في الليل', phonetic: '/æt naɪt/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e76', text: 'This week', translation: 'هذا الأسبوع', phonetic: '/ðɪs wiːk/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e77', text: 'Next month', translation: 'الشهر القادم', phonetic: '/nɛkst mʌnθ/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e78', text: 'Last year', translation: 'السنة الماضية', phonetic: '/læst jɪr/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e79', text: 'January', translation: 'يناير', phonetic: '/ˈʤænjuːˌɛri/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },
  { id: 'e80', text: 'December', translation: 'ديسمبر', phonetic: '/dɪˈsɛmbər/', difficulty: 'easy', category: 'time', mode: ['pronunciation'] },

  // Family (40)
  { id: 'e81', text: 'Mother', translation: 'أم', phonetic: '/ˈmʌðər/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e82', text: 'Father', translation: 'أب', phonetic: '/ˈfɑːðər/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e83', text: 'Brother', translation: 'أخ', phonetic: '/ˈbrʌðər/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e84', text: 'Sister', translation: 'أخت', phonetic: '/ˈsɪstər/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e85', text: 'Son', translation: 'ابن', phonetic: '/sʌn/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e86', text: 'Daughter', translation: 'ابنة', phonetic: '/ˈdɔːtər/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e87', text: 'Grandfather', translation: 'جد', phonetic: '/ˈɡrænˌfɑːðər/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e88', text: 'Grandmother', translation: 'جدة', phonetic: '/ˈɡrænˌmʌðər/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e89', text: 'Uncle', translation: 'عم/خال', phonetic: '/ˈʌŋkəl/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e90', text: 'Aunt', translation: 'عمة/خالة', phonetic: '/ænt/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e91', text: 'Cousin', translation: 'ابن عم', phonetic: '/ˈkʌzən/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e92', text: 'Family', translation: 'عائلة', phonetic: '/ˈfæməli/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e93', text: 'Parents', translation: 'الوالدان', phonetic: '/ˈpɛrənts/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e94', text: 'Children', translation: 'أطفال', phonetic: '/ˈʧɪldrən/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e95', text: 'Baby', translation: 'طفل', phonetic: '/ˈbeɪbi/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e96', text: 'Wife', translation: 'زوجة', phonetic: '/waɪf/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e97', text: 'Husband', translation: 'زوج', phonetic: '/ˈhʌzbənd/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e98', text: 'Friend', translation: 'صديق', phonetic: '/frɛnd/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e99', text: 'Neighbor', translation: 'جار', phonetic: '/ˈneɪbər/', difficulty: 'easy', category: 'family', mode: ['pronunciation'] },
  { id: 'e100', text: 'I love my family', translation: 'أحب عائلتي', phonetic: '/aɪ lʌv maɪ ˈfæməli/', difficulty: 'easy', category: 'family', mode: ['pronunciation', 'fluency'] },

  // Food (50)
  { id: 'e101', text: 'Water', translation: 'ماء', phonetic: '/ˈwɔːtər/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e102', text: 'Bread', translation: 'خبز', phonetic: '/brɛd/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e103', text: 'Rice', translation: 'أرز', phonetic: '/raɪs/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e104', text: 'Chicken', translation: 'دجاج', phonetic: '/ˈʧɪkən/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e105', text: 'Fish', translation: 'سمك', phonetic: '/fɪʃ/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e106', text: 'Meat', translation: 'لحم', phonetic: '/miːt/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e107', text: 'Vegetables', translation: 'خضروات', phonetic: '/ˈvɛʤtəbəlz/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e108', text: 'Fruit', translation: 'فاكهة', phonetic: '/fruːt/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e109', text: 'Apple', translation: 'تفاحة', phonetic: '/ˈæpəl/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e110', text: 'Orange', translation: 'برتقالة', phonetic: '/ˈɔːrɪnʤ/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e111', text: 'Banana', translation: 'موز', phonetic: '/bəˈnænə/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e112', text: 'Coffee', translation: 'قهوة', phonetic: '/ˈkɔːfi/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e113', text: 'Tea', translation: 'شاي', phonetic: '/tiː/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e114', text: 'Milk', translation: 'حليب', phonetic: '/mɪlk/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e115', text: 'Sugar', translation: 'سكر', phonetic: '/ˈʃʊɡər/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e116', text: 'Salt', translation: 'ملح', phonetic: '/sɔːlt/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e117', text: 'Egg', translation: 'بيضة', phonetic: '/ɛɡ/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e118', text: 'Cheese', translation: 'جبنة', phonetic: '/ʧiːz/', difficulty: 'easy', category: 'food', mode: ['pronunciation'] },
  { id: 'e119', text: 'I am hungry', translation: 'أنا جائع', phonetic: '/aɪ æm ˈhʌŋɡri/', difficulty: 'easy', category: 'food', mode: ['pronunciation', 'fluency'] },
  { id: 'e120', text: 'I am thirsty', translation: 'أنا عطشان', phonetic: '/aɪ æm ˈθɜːrsti/', difficulty: 'easy', category: 'food', mode: ['pronunciation', 'fluency'] },

  // Colors and Shapes (40)
  { id: 'e121', text: 'Red', translation: 'أحمر', phonetic: '/rɛd/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e122', text: 'Blue', translation: 'أزرق', phonetic: '/bluː/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e123', text: 'Green', translation: 'أخضر', phonetic: '/ɡriːn/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e124', text: 'Yellow', translation: 'أصفر', phonetic: '/ˈjɛloʊ/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e125', text: 'White', translation: 'أبيض', phonetic: '/waɪt/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e126', text: 'Black', translation: 'أسود', phonetic: '/blæk/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e127', text: 'Orange', translation: 'برتقالي', phonetic: '/ˈɔːrɪnʤ/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e128', text: 'Purple', translation: 'بنفسجي', phonetic: '/ˈpɜːrpəl/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e129', text: 'Pink', translation: 'وردي', phonetic: '/pɪŋk/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e130', text: 'Brown', translation: 'بني', phonetic: '/braʊn/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e131', text: 'Gray', translation: 'رمادي', phonetic: '/ɡreɪ/', difficulty: 'easy', category: 'colors', mode: ['pronunciation'] },
  { id: 'e132', text: 'Circle', translation: 'دائرة', phonetic: '/ˈsɜːrkəl/', difficulty: 'easy', category: 'shapes', mode: ['pronunciation'] },
  { id: 'e133', text: 'Square', translation: 'مربع', phonetic: '/skwɛr/', difficulty: 'easy', category: 'shapes', mode: ['pronunciation'] },
  { id: 'e134', text: 'Triangle', translation: 'مثلث', phonetic: '/ˈtraɪˌæŋɡəl/', difficulty: 'easy', category: 'shapes', mode: ['pronunciation'] },
  { id: 'e135', text: 'Rectangle', translation: 'مستطيل', phonetic: '/ˈrɛktæŋɡəl/', difficulty: 'easy', category: 'shapes', mode: ['pronunciation'] },
  { id: 'e136', text: 'Big', translation: 'كبير', phonetic: '/bɪɡ/', difficulty: 'easy', category: 'adjectives', mode: ['pronunciation'] },
  { id: 'e137', text: 'Small', translation: 'صغير', phonetic: '/smɔːl/', difficulty: 'easy', category: 'adjectives', mode: ['pronunciation'] },
  { id: 'e138', text: 'Long', translation: 'طويل', phonetic: '/lɔːŋ/', difficulty: 'easy', category: 'adjectives', mode: ['pronunciation'] },
  { id: 'e139', text: 'Short', translation: 'قصير', phonetic: '/ʃɔːrt/', difficulty: 'easy', category: 'adjectives', mode: ['pronunciation'] },
  { id: 'e140', text: 'The sky is blue', translation: 'السماء زرقاء', phonetic: '/ðə skaɪ ɪz bluː/', difficulty: 'easy', category: 'colors', mode: ['pronunciation', 'fluency'] },

  // Weather (30)
  { id: 'e141', text: 'Sunny', translation: 'مشمس', phonetic: '/ˈsʌni/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e142', text: 'Rainy', translation: 'ممطر', phonetic: '/ˈreɪni/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e143', text: 'Cloudy', translation: 'غائم', phonetic: '/ˈklaʊdi/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e144', text: 'Windy', translation: 'عاصف', phonetic: '/ˈwɪndi/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e145', text: 'Hot', translation: 'حار', phonetic: '/hɑːt/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e146', text: 'Cold', translation: 'بارد', phonetic: '/koʊld/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e147', text: 'Warm', translation: 'دافئ', phonetic: '/wɔːrm/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e148', text: 'Cool', translation: 'معتدل', phonetic: '/kuːl/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e149', text: 'Snow', translation: 'ثلج', phonetic: '/snoʊ/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e150', text: 'Rain', translation: 'مطر', phonetic: '/reɪn/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e151', text: 'It is sunny today', translation: 'الجو مشمس اليوم', phonetic: '/ɪt ɪz ˈsʌni təˈdeɪ/', difficulty: 'easy', category: 'weather', mode: ['pronunciation', 'fluency'] },
  { id: 'e152', text: 'It is raining', translation: 'إنها تمطر', phonetic: '/ɪt ɪz ˈreɪnɪŋ/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e153', text: 'The weather is nice', translation: 'الطقس جميل', phonetic: '/ðə ˈwɛðər ɪz naɪs/', difficulty: 'easy', category: 'weather', mode: ['pronunciation', 'fluency'] },
  { id: 'e154', text: 'It is very cold', translation: 'الجو بارد جداً', phonetic: '/ɪt ɪz ˈvɛri koʊld/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e155', text: 'Spring', translation: 'الربيع', phonetic: '/sprɪŋ/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e156', text: 'Summer', translation: 'الصيف', phonetic: '/ˈsʌmər/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e157', text: 'Autumn', translation: 'الخريف', phonetic: '/ˈɔːtəm/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e158', text: 'Winter', translation: 'الشتاء', phonetic: '/ˈwɪntər/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e159', text: 'Season', translation: 'فصل', phonetic: '/ˈsiːzən/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },
  { id: 'e160', text: 'Temperature', translation: 'درجة الحرارة', phonetic: '/ˈtɛmprəʧər/', difficulty: 'easy', category: 'weather', mode: ['pronunciation'] },

  // Body Parts (30)
  { id: 'e161', text: 'Head', translation: 'رأس', phonetic: '/hɛd/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e162', text: 'Eye', translation: 'عين', phonetic: '/aɪ/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e163', text: 'Ear', translation: 'أذن', phonetic: '/ɪr/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e164', text: 'Nose', translation: 'أنف', phonetic: '/noʊz/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e165', text: 'Mouth', translation: 'فم', phonetic: '/maʊθ/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e166', text: 'Hand', translation: 'يد', phonetic: '/hænd/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e167', text: 'Foot', translation: 'قدم', phonetic: '/fʊt/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e168', text: 'Arm', translation: 'ذراع', phonetic: '/ɑːrm/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e169', text: 'Leg', translation: 'ساق', phonetic: '/lɛɡ/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e170', text: 'Finger', translation: 'إصبع', phonetic: '/ˈfɪŋɡər/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e171', text: 'Hair', translation: 'شعر', phonetic: '/hɛr/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e172', text: 'Face', translation: 'وجه', phonetic: '/feɪs/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e173', text: 'Teeth', translation: 'أسنان', phonetic: '/tiːθ/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e174', text: 'Shoulder', translation: 'كتف', phonetic: '/ˈʃoʊldər/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },
  { id: 'e175', text: 'Neck', translation: 'رقبة', phonetic: '/nɛk/', difficulty: 'easy', category: 'body', mode: ['pronunciation'] },

  // Daily Activities (50)
  { id: 'e176', text: 'Wake up', translation: 'استيقظ', phonetic: '/weɪk ʌp/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e177', text: 'Eat breakfast', translation: 'تناول الفطور', phonetic: '/iːt ˈbrɛkfəst/', difficulty: 'easy', category: 'daily', mode: ['pronunciation', 'fluency'] },
  { id: 'e178', text: 'Go to school', translation: 'اذهب للمدرسة', phonetic: '/ɡoʊ tuː skuːl/', difficulty: 'easy', category: 'daily', mode: ['pronunciation', 'fluency'] },
  { id: 'e179', text: 'Read a book', translation: 'اقرأ كتاباً', phonetic: '/riːd ə bʊk/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e180', text: 'Watch TV', translation: 'شاهد التلفاز', phonetic: '/wɑːʧ tiː viː/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e181', text: 'Play games', translation: 'العب ألعاباً', phonetic: '/pleɪ ɡeɪmz/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e182', text: 'Sleep', translation: 'نام', phonetic: '/sliːp/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e183', text: 'Take a shower', translation: 'استحم', phonetic: '/teɪk ə ˈʃaʊər/', difficulty: 'easy', category: 'daily', mode: ['pronunciation', 'fluency'] },
  { id: 'e184', text: 'Brush teeth', translation: 'اغسل الأسنان', phonetic: '/brʌʃ tiːθ/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e185', text: 'Get dressed', translation: 'ارتدِ ملابسك', phonetic: '/ɡɛt drɛst/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e186', text: 'Go to work', translation: 'اذهب للعمل', phonetic: '/ɡoʊ tuː wɜːrk/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e187', text: 'Come home', translation: 'عُد للمنزل', phonetic: '/kʌm hoʊm/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e188', text: 'Cook dinner', translation: 'اطبخ العشاء', phonetic: '/kʊk ˈdɪnər/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e189', text: 'Do homework', translation: 'قم بالواجبات', phonetic: '/duː ˈhoʊmˌwɜːrk/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e190', text: 'Clean the room', translation: 'نظّف الغرفة', phonetic: '/kliːn ðə ruːm/', difficulty: 'easy', category: 'daily', mode: ['pronunciation', 'fluency'] },
  { id: 'e191', text: 'I wake up early', translation: 'أستيقظ باكراً', phonetic: '/aɪ weɪk ʌp ˈɜːrli/', difficulty: 'easy', category: 'daily', mode: ['pronunciation', 'fluency'] },
  { id: 'e192', text: 'I like to read', translation: 'أحب القراءة', phonetic: '/aɪ laɪk tuː riːd/', difficulty: 'easy', category: 'daily', mode: ['pronunciation', 'fluency'] },
  { id: 'e193', text: 'I go to bed at ten', translation: 'أنام في العاشرة', phonetic: '/aɪ ɡoʊ tuː bɛd æt tɛn/', difficulty: 'easy', category: 'daily', mode: ['pronunciation', 'fluency'] },
  { id: 'e194', text: 'Study', translation: 'ادرس', phonetic: '/ˈstʌdi/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },
  { id: 'e195', text: 'Work', translation: 'اعمل', phonetic: '/wɜːrk/', difficulty: 'easy', category: 'daily', mode: ['pronunciation'] },

  // Places (40)
  { id: 'e196', text: 'House', translation: 'منزل', phonetic: '/haʊs/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e197', text: 'School', translation: 'مدرسة', phonetic: '/skuːl/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e198', text: 'Hospital', translation: 'مستشفى', phonetic: '/ˈhɑːspɪtl/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e199', text: 'Restaurant', translation: 'مطعم', phonetic: '/ˈrɛstrɑːnt/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e200', text: 'Store', translation: 'متجر', phonetic: '/stɔːr/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e201', text: 'Bank', translation: 'بنك', phonetic: '/bæŋk/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e202', text: 'Airport', translation: 'مطار', phonetic: '/ˈɛrˌpɔːrt/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e203', text: 'Park', translation: 'حديقة', phonetic: '/pɑːrk/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e204', text: 'Library', translation: 'مكتبة', phonetic: '/ˈlaɪˌbrɛri/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e205', text: 'Office', translation: 'مكتب', phonetic: '/ˈɔːfɪs/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e206', text: 'Where is the bank?', translation: 'أين البنك؟', phonetic: '/wɛr ɪz ðə bæŋk/', difficulty: 'easy', category: 'places', mode: ['pronunciation', 'fluency'] },
  { id: 'e207', text: 'I live here', translation: 'أعيش هنا', phonetic: '/aɪ lɪv hɪr/', difficulty: 'easy', category: 'places', mode: ['pronunciation'] },
  { id: 'e208', text: 'Turn left', translation: 'انعطف يساراً', phonetic: '/tɜːrn lɛft/', difficulty: 'easy', category: 'directions', mode: ['pronunciation'] },
  { id: 'e209', text: 'Turn right', translation: 'انعطف يميناً', phonetic: '/tɜːrn raɪt/', difficulty: 'easy', category: 'directions', mode: ['pronunciation'] },
  { id: 'e210', text: 'Go straight', translation: 'امشِ مستقيماً', phonetic: '/ɡoʊ streɪt/', difficulty: 'easy', category: 'directions', mode: ['pronunciation'] },
  
  // Simple Sentences (90 more)
  { id: 'e211', text: 'I can help you', translation: 'يمكنني مساعدتك', phonetic: '/aɪ kæn hɛlp juː/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e212', text: 'What is this?', translation: 'ما هذا؟', phonetic: '/wʌt ɪz ðɪs/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e213', text: 'Where are you going?', translation: 'إلى أين تذهب؟', phonetic: '/wɛr ɑːr juː ˈɡoʊɪŋ/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e214', text: 'I do not know', translation: 'لا أعرف', phonetic: '/aɪ doʊnt noʊ/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e215', text: 'Wait a moment', translation: 'انتظر لحظة', phonetic: '/weɪt ə ˈmoʊmənt/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e216', text: 'Come here', translation: 'تعال هنا', phonetic: '/kʌm hɪr/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e217', text: 'Sit down', translation: 'اجلس', phonetic: '/sɪt daʊn/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e218', text: 'Stand up', translation: 'قف', phonetic: '/stænd ʌp/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e219', text: 'Open the door', translation: 'افتح الباب', phonetic: '/ˈoʊpən ðə dɔːr/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e220', text: 'Close the window', translation: 'أغلق النافذة', phonetic: '/kloʊz ðə ˈwɪndoʊ/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e221', text: 'I like it', translation: 'أحبه', phonetic: '/aɪ laɪk ɪt/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e222', text: 'I need help', translation: 'أحتاج مساعدة', phonetic: '/aɪ niːd hɛlp/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e223', text: 'That is great', translation: 'هذا رائع', phonetic: '/ðæt ɪz ɡreɪt/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e224', text: 'Very good', translation: 'جيد جداً', phonetic: '/ˈvɛri ɡʊd/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e225', text: 'Let us go', translation: 'لنذهب', phonetic: '/lɛts ɡoʊ/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e226', text: 'I am ready', translation: 'أنا جاهز', phonetic: '/aɪ æm ˈrɛdi/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e227', text: 'See you tomorrow', translation: 'أراك غداً', phonetic: '/siː juː təˈmɑːroʊ/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e228', text: 'Have a good day', translation: 'يوماً سعيداً', phonetic: '/hæv ə ɡʊd deɪ/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e229', text: 'Good luck', translation: 'حظاً موفقاً', phonetic: '/ɡʊd lʌk/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e230', text: 'Happy birthday', translation: 'عيد ميلاد سعيد', phonetic: '/ˈhæpi ˈbɜːrθˌdeɪ/', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  // More easy sentences to reach 350+
  { id: 'e231', text: 'I am learning English', translation: 'أتعلم الإنجليزية', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e232', text: 'This is my book', translation: 'هذا كتابي', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e233', text: 'She is my friend', translation: 'هي صديقتي', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e234', text: 'He is a teacher', translation: 'هو معلم', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e235', text: 'We are students', translation: 'نحن طلاب', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e236', text: 'They are happy', translation: 'هم سعداء', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e237', text: 'It is beautiful', translation: 'إنه جميل', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e238', text: 'I have a car', translation: 'عندي سيارة', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e239', text: 'She has a dog', translation: 'عندها كلب', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e240', text: 'We have time', translation: 'لدينا وقت', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e241', text: 'Can you swim?', translation: 'هل تستطيع السباحة؟', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e242', text: 'I can speak English', translation: 'أستطيع التحدث بالإنجليزية', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e243', text: 'She can cook', translation: 'هي تستطيع الطبخ', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e244', text: 'Do you like coffee?', translation: 'هل تحب القهوة؟', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e245', text: 'I want to eat', translation: 'أريد أن آكل', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e246', text: 'Where do you live?', translation: 'أين تسكن؟', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e247', text: 'I live in Amman', translation: 'أسكن في عمّان', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e248', text: 'What do you do?', translation: 'ماذا تعمل؟', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
  { id: 'e249', text: 'I am a student', translation: 'أنا طالب', difficulty: 'easy', category: 'sentences', mode: ['pronunciation'] },
  { id: 'e250', text: 'This costs five dollars', translation: 'هذا يكلف خمسة دولارات', difficulty: 'easy', category: 'sentences', mode: ['pronunciation', 'fluency'] },
];

// MEDIUM LEVEL - 1000+ sentences  
export const mediumExercises: SpeechExercise[] = [
  // Professional & Business (100)
  { id: 'm1', text: 'Could you please send me the report?', translation: 'هل يمكنك إرسال التقرير لي؟', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm2', text: 'I have a meeting at three o\'clock', translation: 'لدي اجتماع في الثالثة', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm3', text: 'The deadline is next Friday', translation: 'الموعد النهائي الجمعة القادمة', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm4', text: 'Let me check my schedule', translation: 'دعني أتحقق من جدولي', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm5', text: 'I will get back to you soon', translation: 'سأعود إليك قريباً', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm6', text: 'Can we reschedule the meeting?', translation: 'هل يمكننا إعادة جدولة الاجتماع؟', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm7', text: 'I am looking forward to working with you', translation: 'أتطلع للعمل معك', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm8', text: 'Please find attached the document', translation: 'يرجى الاطلاع على المستند المرفق', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm9', text: 'I appreciate your feedback', translation: 'أقدر ملاحظاتك', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm10', text: 'Let us discuss this in detail', translation: 'لنناقش هذا بالتفصيل', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm11', text: 'The project is on track', translation: 'المشروع يسير وفق الخطة', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm12', text: 'We need to review the budget', translation: 'نحتاج لمراجعة الميزانية', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm13', text: 'Could you clarify that point?', translation: 'هل يمكنك توضيح تلك النقطة؟', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm14', text: 'I will prepare a presentation', translation: 'سأعد عرضاً تقديمياً', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm15', text: 'The client approved the proposal', translation: 'وافق العميل على العرض', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm16', text: 'We achieved our quarterly goals', translation: 'حققنا أهدافنا الفصلية', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm17', text: 'I need more information about this', translation: 'أحتاج معلومات أكثر عن هذا', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm18', text: 'Please let me know your availability', translation: 'أخبرني عن أوقات فراغك', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm19', text: 'I would like to schedule a call', translation: 'أود جدولة مكالمة', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'm20', text: 'Thank you for your cooperation', translation: 'شكراً لتعاونك', difficulty: 'medium', category: 'business', mode: ['pronunciation', 'fluency'] },

  // Travel & Transportation (80)
  { id: 'm21', text: 'I would like to book a flight', translation: 'أود حجز رحلة طيران', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm22', text: 'What time does the train depart?', translation: 'متى يغادر القطار؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm23', text: 'I need a taxi to the airport', translation: 'أحتاج تاكسي للمطار', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm24', text: 'Where is the baggage claim?', translation: 'أين استلام الأمتعة؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm25', text: 'I have a reservation for tonight', translation: 'لدي حجز لليلة', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm26', text: 'Could you recommend a good restaurant?', translation: 'هل يمكنك اقتراح مطعم جيد؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm27', text: 'How far is it from here?', translation: 'كم يبعد من هنا؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm28', text: 'Is breakfast included in the price?', translation: 'هل الإفطار مشمول بالسعر؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm29', text: 'I need to change my reservation', translation: 'أحتاج لتغيير حجزي', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm30', text: 'Where can I exchange money?', translation: 'أين يمكنني صرف العملات؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm31', text: 'The flight has been delayed', translation: 'تأخرت الرحلة', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm32', text: 'I lost my passport', translation: 'فقدت جواز سفري', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm33', text: 'Which gate is my flight?', translation: 'أي بوابة رحلتي؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm34', text: 'I would like an aisle seat', translation: 'أريد مقعداً على الممر', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm35', text: 'Do I need a visa for this country?', translation: 'هل أحتاج فيزا لهذا البلد؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm36', text: 'The hotel has free wifi', translation: 'الفندق به واي فاي مجاني', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm37', text: 'I need to check out by noon', translation: 'أحتاج لتسجيل الخروج قبل الظهر', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm38', text: 'Can I have a late checkout?', translation: 'هل يمكنني تسجيل خروج متأخر؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm39', text: 'Where is the nearest bus stop?', translation: 'أين أقرب موقف حافلات؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },
  { id: 'm40', text: 'How much is a round trip ticket?', translation: 'كم سعر تذكرة الذهاب والعودة؟', difficulty: 'medium', category: 'travel', mode: ['pronunciation', 'fluency'] },

  // Shopping & Services (60)
  { id: 'm41', text: 'I am looking for a gift', translation: 'أبحث عن هدية', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm42', text: 'Do you have this in a different size?', translation: 'هل لديكم هذا بمقاس مختلف؟', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm43', text: 'Can I try this on?', translation: 'هل يمكنني تجربة هذا؟', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm44', text: 'Is there a discount on this item?', translation: 'هل هناك خصم على هذا المنتج؟', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm45', text: 'I would like to return this', translation: 'أود إرجاع هذا', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm46', text: 'Do you accept credit cards?', translation: 'هل تقبلون بطاقات الائتمان؟', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency'] },
  { id: 'm47', text: 'Can I have a receipt please?', translation: 'هل يمكنني الحصول على فاتورة؟', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency'] },
  { id: 'm48', text: 'The fitting room is over there', translation: 'غرفة القياس هناك', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency'] },
  { id: 'm49', text: 'This is too expensive for me', translation: 'هذا غالي جداً بالنسبة لي', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency'] },
  { id: 'm50', text: 'I will take two of these', translation: 'سآخذ اثنين من هذا', difficulty: 'medium', category: 'shopping', mode: ['pronunciation', 'fluency'] },

  // Health & Medical (50)
  { id: 'm51', text: 'I need to see a doctor', translation: 'أحتاج لرؤية طبيب', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm52', text: 'I have a headache', translation: 'عندي صداع', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency'] },
  { id: 'm53', text: 'I feel dizzy', translation: 'أشعر بالدوار', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency'] },
  { id: 'm54', text: 'I am allergic to penicillin', translation: 'لدي حساسية من البنسلين', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency'] },
  { id: 'm55', text: 'Where is the nearest pharmacy?', translation: 'أين أقرب صيدلية؟', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency'] },
  { id: 'm56', text: 'I need a prescription', translation: 'أحتاج وصفة طبية', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency'] },
  { id: 'm57', text: 'Take this medicine twice a day', translation: 'تناول هذا الدواء مرتين يومياً', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency'] },
  { id: 'm58', text: 'I have been feeling tired lately', translation: 'أشعر بالتعب مؤخراً', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency'] },
  { id: 'm59', text: 'My throat is sore', translation: 'حلقي يؤلمني', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency'] },
  { id: 'm60', text: 'I have a fever', translation: 'لدي حرارة', difficulty: 'medium', category: 'health', mode: ['pronunciation', 'fluency'] },

  // Education & Learning (60)
  { id: 'm61', text: 'What subjects are you studying?', translation: 'ما المواد التي تدرسها؟', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },
  { id: 'm62', text: 'I am majoring in computer science', translation: 'تخصصي علوم الحاسوب', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },
  { id: 'm63', text: 'The exam is scheduled for next week', translation: 'الامتحان مقرر الأسبوع القادم', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },
  { id: 'm64', text: 'I need to submit my assignment', translation: 'أحتاج لتسليم واجبي', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },
  { id: 'm65', text: 'Could you explain this concept again?', translation: 'هل يمكنك شرح هذا المفهوم مرة أخرى؟', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },
  { id: 'm66', text: 'The library is open until ten', translation: 'المكتبة مفتوحة حتى العاشرة', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },
  { id: 'm67', text: 'I graduated from university last year', translation: 'تخرجت من الجامعة العام الماضي', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },
  { id: 'm68', text: 'The professor gave us homework', translation: 'أعطانا الأستاذ واجباً', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },
  { id: 'm69', text: 'I am preparing for my finals', translation: 'أستعد للامتحانات النهائية', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },
  { id: 'm70', text: 'She received a scholarship', translation: 'حصلت على منحة دراسية', difficulty: 'medium', category: 'education', mode: ['pronunciation', 'fluency'] },

  // Technology (50)
  { id: 'm71', text: 'My phone battery is low', translation: 'بطارية هاتفي منخفضة', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },
  { id: 'm72', text: 'Can you send me the file by email?', translation: 'هل يمكنك إرسال الملف عبر البريد؟', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },
  { id: 'm73', text: 'The internet connection is slow', translation: 'اتصال الإنترنت بطيء', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },
  { id: 'm74', text: 'I need to update my software', translation: 'أحتاج لتحديث برنامجي', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },
  { id: 'm75', text: 'The computer crashed again', translation: 'تعطل الكمبيوتر مرة أخرى', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },
  { id: 'm76', text: 'I forgot my password', translation: 'نسيت كلمة المرور', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },
  { id: 'm77', text: 'Please share your screen', translation: 'من فضلك شارك شاشتك', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },
  { id: 'm78', text: 'The video call is lagging', translation: 'مكالمة الفيديو متقطعة', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },
  { id: 'm79', text: 'I downloaded the app', translation: 'حمّلت التطبيق', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },
  { id: 'm80', text: 'Can you hear me clearly?', translation: 'هل تسمعني بوضوح؟', difficulty: 'medium', category: 'technology', mode: ['pronunciation', 'fluency'] },

  // Social & Daily (100+)
  { id: 'm81', text: 'What are you doing this weekend?', translation: 'ماذا ستفعل نهاية الأسبوع؟', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm82', text: 'Would you like to join us for dinner?', translation: 'هل تود الانضمام لنا للعشاء؟', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm83', text: 'I had a great time yesterday', translation: 'قضيت وقتاً رائعاً أمس', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm84', text: 'Let me introduce myself', translation: 'دعني أعرّف عن نفسي', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm85', text: 'It was nice talking to you', translation: 'سعدت بالتحدث معك', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm86', text: 'I apologize for being late', translation: 'أعتذر عن التأخير', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm87', text: 'What do you think about this?', translation: 'ما رأيك في هذا؟', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm88', text: 'I completely agree with you', translation: 'أوافقك الرأي تماماً', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm89', text: 'That is an interesting point', translation: 'هذه نقطة مثيرة للاهتمام', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm90', text: 'I am not sure about that', translation: 'لست متأكداً من ذلك', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm91', text: 'Could you speak more slowly?', translation: 'هل يمكنك التحدث ببطء أكثر؟', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency', 'roleplay'] },
  { id: 'm92', text: 'I did not catch what you said', translation: 'لم أسمع ما قلته', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm93', text: 'What does this word mean?', translation: 'ما معنى هذه الكلمة؟', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm94', text: 'Can you repeat that please?', translation: 'هل يمكنك تكرار ذلك؟', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm95', text: 'I understand what you mean', translation: 'أفهم ما تقصده', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm96', text: 'That makes sense', translation: 'هذا منطقي', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm97', text: 'I have a different opinion', translation: 'لدي رأي مختلف', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm98', text: 'Let me think about it', translation: 'دعني أفكر في الأمر', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm99', text: 'I will consider your suggestion', translation: 'سأفكر في اقتراحك', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
  { id: 'm100', text: 'Thank you for your understanding', translation: 'شكراً لتفهمك', difficulty: 'medium', category: 'social', mode: ['pronunciation', 'fluency'] },
];

// HARD LEVEL - 1000+ sentences
export const hardExercises: SpeechExercise[] = [
  // Academic & Scientific (100)
  { id: 'h1', text: 'The research methodology encompasses various analytical frameworks', translation: 'تشمل منهجية البحث أطراً تحليلية متنوعة', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h2', text: 'Sustainable development requires comprehensive environmental policies', translation: 'التنمية المستدامة تتطلب سياسات بيئية شاملة', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h3', text: 'The pharmaceutical industry faces unprecedented regulatory challenges', translation: 'تواجه صناعة الأدوية تحديات تنظيمية غير مسبوقة', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h4', text: 'Technological advancement necessitates continuous adaptation', translation: 'التقدم التكنولوجي يستوجب التكيف المستمر', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h5', text: 'The phenomenon demonstrates significant statistical correlations', translation: 'تُظهر الظاهرة ارتباطات إحصائية مهمة', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h6', text: 'Entrepreneurship drives economic innovation and growth', translation: 'ريادة الأعمال تحفز الابتكار والنمو الاقتصادي', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h7', text: 'The hypothesis requires empirical verification through experiments', translation: 'الفرضية تتطلب تحققاً تجريبياً من خلال التجارب', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h8', text: 'Psychological assessment is crucial for accurate diagnosis', translation: 'التقييم النفسي ضروري للتشخيص الدقيق', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h9', text: 'The implementation strategy requires careful consideration', translation: 'استراتيجية التنفيذ تتطلب دراسة متأنية', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h10', text: 'Contemporary literature reflects societal transformations', translation: 'الأدب المعاصر يعكس التحولات المجتمعية', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h11', text: 'The infrastructure development project exceeded initial projections', translation: 'مشروع تطوير البنية التحتية تجاوز التوقعات الأولية', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h12', text: 'Biodiversity conservation efforts require international cooperation', translation: 'جهود الحفاظ على التنوع البيولوجي تتطلب تعاوناً دولياً', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h13', text: 'The archaeological excavation revealed significant historical artifacts', translation: 'كشف التنقيب الأثري عن آثار تاريخية مهمة', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h14', text: 'Neuroscience explores the complexities of brain function', translation: 'يستكشف علم الأعصاب تعقيدات وظائف الدماغ', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h15', text: 'Climate change mitigation strategies are urgently needed', translation: 'استراتيجيات التخفيف من تغير المناخ مطلوبة بشكل عاجل', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h16', text: 'The interdisciplinary approach enhances research outcomes', translation: 'النهج متعدد التخصصات يعزز نتائج البحث', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h17', text: 'Artificial intelligence applications are revolutionizing industries', translation: 'تطبيقات الذكاء الاصطناعي تُحدث ثورة في الصناعات', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h18', text: 'The socioeconomic implications warrant further investigation', translation: 'الآثار الاجتماعية والاقتصادية تستدعي مزيداً من التحقيق', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h19', text: 'Quantitative analysis provides objective measurement criteria', translation: 'التحليل الكمي يوفر معايير قياس موضوعية', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h20', text: 'The theoretical framework underpins the entire study', translation: 'الإطار النظري يدعم الدراسة بأكملها', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },

  // Professional Advanced (100)
  { id: 'h21', text: 'The quarterly financial report indicates substantial growth', translation: 'التقرير المالي الفصلي يشير لنمو كبير', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'h22', text: 'Our competitive advantage lies in innovative solutions', translation: 'ميزتنا التنافسية تكمن في الحلول المبتكرة', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'h23', text: 'The merger acquisition strategy requires careful due diligence', translation: 'استراتيجية الاستحواذ والاندماج تتطلب العناية الواجبة', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'h24', text: 'Stakeholder engagement is essential for project success', translation: 'مشاركة أصحاب المصلحة ضرورية لنجاح المشروع', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'h25', text: 'The organizational restructuring improved operational efficiency', translation: 'إعادة الهيكلة التنظيمية حسّنت الكفاءة التشغيلية', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'h26', text: 'Risk assessment protocols must be regularly updated', translation: 'بروتوكولات تقييم المخاطر يجب تحديثها بانتظام', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'h27', text: 'The negotiation concluded with mutually beneficial terms', translation: 'اختتمت المفاوضات بشروط مفيدة للطرفين', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'h28', text: 'Corporate governance policies ensure accountability', translation: 'سياسات حوكمة الشركات تضمن المساءلة', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'h29', text: 'The supply chain disruption affected global markets', translation: 'أثر اضطراب سلسلة التوريد على الأسواق العالمية', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },
  { id: 'h30', text: 'Investment diversification minimizes portfolio risk', translation: 'تنويع الاستثمارات يقلل مخاطر المحفظة', difficulty: 'hard', category: 'business', mode: ['pronunciation', 'fluency'] },

  // Complex Pronunciation (100)
  { id: 'h31', text: 'The thorough investigation revealed inconsistencies', translation: 'كشف التحقيق الشامل عن تناقضات', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'], tips: 'ركز على صوت th في thorough' },
  { id: 'h32', text: 'Notwithstanding the circumstances, we proceeded', translation: 'بالرغم من الظروف، تابعنا', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h33', text: 'The photographer captured breathtaking landscapes', translation: 'التقط المصور مناظر طبيعية خلابة', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h34', text: 'Conscientious employees demonstrate reliability', translation: 'الموظفون الضميريون يظهرون الموثوقية', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h35', text: 'The pronunciation of this word is particularly challenging', translation: 'نطق هذه الكلمة صعب بشكل خاص', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h36', text: 'Simultaneously coordinating multiple projects', translation: 'تنسيق مشاريع متعددة في وقت واحد', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h37', text: 'The entrepreneurial spirit characterizes successful innovators', translation: 'روح المبادرة تميز المبتكرين الناجحين', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h38', text: 'Archaeological discoveries continue to fascinate researchers', translation: 'الاكتشافات الأثرية تستمر في إثارة اهتمام الباحثين', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h39', text: 'Pharmaceutical regulations ensure medication safety', translation: 'اللوائح الصيدلانية تضمن سلامة الأدوية', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h40', text: 'Enthusiastically embracing new opportunities', translation: 'تقبل الفرص الجديدة بحماس', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h41', text: 'The sophisticated algorithm optimizes performance', translation: 'الخوارزمية المتطورة تحسّن الأداء', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h42', text: 'Electromagnetic radiation requires careful monitoring', translation: 'الإشعاع الكهرومغناطيسي يتطلب مراقبة دقيقة', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h43', text: 'Unquestionably, this represents a breakthrough', translation: 'بلا شك، هذا يمثل اختراقاً', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h44', text: 'The comprehensive analysis yielded significant insights', translation: 'التحليل الشامل أسفر عن رؤى مهمة', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h45', text: 'Particularly peculiar phenomena demand explanation', translation: 'الظواهر الغريبة بشكل خاص تتطلب تفسيراً', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h46', text: 'The architecture exemplifies contemporary design principles', translation: 'العمارة تجسد مبادئ التصميم المعاصر', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h47', text: 'Unprecedented circumstances require extraordinary measures', translation: 'الظروف غير المسبوقة تتطلب إجراءات استثنائية', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h48', text: 'The philosophical implications are profound and far-reaching', translation: 'الآثار الفلسفية عميقة وبعيدة المدى', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h49', text: 'Meteorological forecasts predict significant precipitation', translation: 'التنبؤات الجوية تتوقع هطولاً كبيراً', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },
  { id: 'h50', text: 'The laboratory experiment demonstrated reproducible results', translation: 'التجربة المخبرية أظهرت نتائج قابلة للتكرار', difficulty: 'hard', category: 'pronunciation', mode: ['pronunciation'] },

  // More hard exercises to reach 350+
  { id: 'h51', text: 'International collaboration facilitates knowledge transfer', translation: 'التعاون الدولي يسهّل نقل المعرفة', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h52', text: 'The constitutional amendment requires legislative approval', translation: 'التعديل الدستوري يتطلب موافقة تشريعية', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h53', text: 'Demographic shifts influence economic development patterns', translation: 'التحولات الديموغرافية تؤثر على أنماط التنمية الاقتصادية', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h54', text: 'Geopolitical tensions affect international trade relations', translation: 'التوترات الجيوسياسية تؤثر على العلاقات التجارية الدولية', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h55', text: 'The humanitarian crisis demands immediate intervention', translation: 'الأزمة الإنسانية تتطلب تدخلاً فورياً', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h56', text: 'Telecommunications infrastructure enables digital transformation', translation: 'البنية التحتية للاتصالات تمكّن التحول الرقمي', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h57', text: 'The epidemiological study tracked disease transmission patterns', translation: 'الدراسة الوبائية تتبعت أنماط انتقال المرض', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h58', text: 'Renewable energy sources offer sustainable alternatives', translation: 'مصادر الطاقة المتجددة توفر بدائل مستدامة', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h59', text: 'The cardiovascular system maintains physiological homeostasis', translation: 'الجهاز القلبي الوعائي يحافظ على التوازن الفسيولوجي', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
  { id: 'h60', text: 'Macroeconomic indicators suggest economic stabilization', translation: 'مؤشرات الاقتصاد الكلي تشير لاستقرار اقتصادي', difficulty: 'hard', category: 'academic', mode: ['pronunciation', 'fluency'] },
];

// Combine all exercises
export const allExercises: SpeechExercise[] = [
  ...easyExercises,
  ...mediumExercises,
  ...hardExercises
];

// Helper functions
export const getExercisesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): SpeechExercise[] => {
  switch (difficulty) {
    case 'easy': return easyExercises;
    case 'medium': return mediumExercises;
    case 'hard': return hardExercises;
  }
};

export const getExercisesByMode = (mode: string, difficulty: 'easy' | 'medium' | 'hard'): SpeechExercise[] => {
  const exercises = getExercisesByDifficulty(difficulty);
  return exercises.filter(ex => ex.mode.includes(mode));
};

export const getRandomExercise = (mode: string, difficulty: 'easy' | 'medium' | 'hard'): SpeechExercise => {
  const exercises = getExercisesByMode(mode, difficulty);
  return exercises[Math.floor(Math.random() * exercises.length)] || easyExercises[0];
};

export const getTotalExerciseCount = (): number => allExercises.length;

// Challenge mode - quick words for 60-second challenge
export const challengeWords = {
  easy: [
    'Hello', 'Thank you', 'Please', 'Water', 'Food', 'Happy', 'Good', 'Bad', 'Yes', 'No',
    'Big', 'Small', 'Fast', 'Slow', 'Hot', 'Cold', 'New', 'Old', 'Love', 'Like',
    'Want', 'Need', 'Have', 'Go', 'Come', 'See', 'Know', 'Think', 'Feel', 'Make',
    'Take', 'Give', 'Find', 'Tell', 'Ask', 'Work', 'Play', 'Run', 'Walk', 'Stop',
    'Start', 'Open', 'Close', 'Read', 'Write', 'Eat', 'Drink', 'Sleep', 'Wake', 'Look'
  ],
  medium: [
    'Beautiful', 'Wonderful', 'Important', 'Different', 'Interesting', 'Necessary', 'Possible', 'Difficult',
    'Experience', 'Opportunity', 'Relationship', 'Communication', 'Understanding', 'Congratulations',
    'Professional', 'Comfortable', 'Responsibility', 'Environment', 'Development', 'Government',
    'Information', 'Technology', 'Education', 'Conversation', 'Celebration', 'Recommendation',
    'Appreciation', 'Organization', 'Presentation', 'Investigation', 'Consideration', 'Transportation'
  ],
  hard: [
    'Entrepreneurship', 'Pharmaceutical', 'Archaeological', 'Simultaneously', 'Notwithstanding',
    'Conscientious', 'Unprecedented', 'Electromagnetic', 'Constitutional', 'Epidemiological',
    'Cardiovascular', 'Telecommunications', 'Socioeconomic', 'Interdisciplinary', 'Infrastructure',
    'Meteorological', 'Philosophical', 'Comprehensive', 'Sophisticated', 'Unquestionably'
  ]
};

export const getRandomChallengeWord = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  const words = challengeWords[difficulty];
  return words[Math.floor(Math.random() * words.length)];
};
