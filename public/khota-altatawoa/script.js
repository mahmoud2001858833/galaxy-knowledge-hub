/**
 * منطق منصة «خطى التطوع» التفاعلية
 * يتضمن الدالة المطلوبة getRecommendation(domain, time) ومعالجة تفاعل المستخدم
 */

// حالة التطبيق الحالية (المجال والوقت المختاران)
const state = {
  selectedDomain: null,
  selectedTime: null,
};

// خريطة لتطبيع المدخلات العربية أو الإنجليزية إلى المفاتيح الموحدة
const DOMAIN_MAP = {
  // المفاتيح الإنجليزية
  'education': 'education',
  'environment': 'environment',
  'health_community': 'health_community',
  'health': 'health_community',
  'community': 'health_community',
  'tech': 'tech',
  'technology': 'tech',
  // النصوص العربية
  'تعليم وتدريب': 'education',
  'تعليم': 'education',
  'تدريب': 'education',
  'بيئة وتشجير': 'environment',
  'بيئة': 'environment',
  'تشجير': 'environment',
  'صحة ومجتمع': 'health_community',
  'صحة': 'health_community',
  'مجتمع': 'health_community',
  'دعم تكنولوجي ورقمي': 'tech',
  'دعم تكنولوجي': 'tech',
  'تكنولوجيا': 'tech',
  'تقنية': 'tech'
};

const TIME_MAP = {
  // المفاتيح الإنجليزية
  'hours_1_3': 'hours_1_3',
  '1_3': 'hours_1_3',
  'weekend': 'weekend',
  'remote': 'remote',
  // النصوص العربية
  'من 1 إلى 3 ساعات': 'hours_1_3',
  '1 إلى 3 ساعات': 'hours_1_3',
  '1-3 ساعات': 'hours_1_3',
  'ساعات محددة': 'hours_1_3',
  'عطلة نهاية الأسبوع': 'weekend',
  'نهاية الأسبوع': 'weekend',
  'العطلة الأسبوعية': 'weekend',
  'عطلة': 'weekend',
  'تطوع عن بُعد': 'remote',
  'تطوع عن بعد': 'remote',
  'عن بُعد': 'remote',
  'عن بعد': 'remote'
};

/**
 * دالة getRecommendation(domain, time)
 * تستقبل المجال والوقت وتعيد التوصية المناسبة من ملف البيانات
 * @param {string} domain - اسم المجال أو رمزه البرمجي
 * @param {string} time - الوقت المتاح أو رمزه البرمجي
 * @returns {object|null} كائن التوصية المتطابق مع المجال والوقت
 */
function getRecommendation(domain, time) {
  if (!domain || !time) return null;

  // تنظيف وتطبيع المدخلات
  const cleanDomain = String(domain).trim().toLowerCase();
  const cleanTime = String(time).trim().toLowerCase();

  const normalizedDomain = DOMAIN_MAP[cleanDomain] || DOMAIN_MAP[domain.trim()] || cleanDomain;
  const normalizedTime = TIME_MAP[cleanTime] || TIME_MAP[time.trim()] || cleanTime;

  // استرجاع البيانات من globalThis أو window أو المتغير المعرف محلياً
  const dataset = (typeof globalThis !== 'undefined' && globalThis.recommendationsData)
    ? globalThis.recommendationsData
    : (typeof window !== 'undefined' && window.recommendationsData)
    ? window.recommendationsData
    : (typeof recommendationsData !== 'undefined' ? recommendationsData : []);

  // البحث عن التوصية المطابقة
  const match = dataset.find(item =>
    (item.domain === normalizedDomain || item.domainLabel === domain) &&
    (item.time === normalizedTime || item.timeLabel === time)
  );

  return match || null;
}

// تصدير الدالة لتكون متاحة عالمياً
if (typeof globalThis !== 'undefined') {
  globalThis.getRecommendation = getRecommendation;
}
if (typeof window !== 'undefined') {
  window.getRecommendation = getRecommendation;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getRecommendation, DOMAIN_MAP, TIME_MAP };
}

/**
 * تحديث واجهة المستخدم تلقائياً عند تغيير أي خيار
 */
function updateUI() {
  const resultCard = document.getElementById('recommendation-card');
  const emptyState = document.getElementById('empty-state');
  const cardTextEl = document.getElementById('card-text');
  const initiativeTypeEl = document.getElementById('initiative-type');
  const nawaLinkEl = document.getElementById('nawa-link');
  const activeTagsEl = document.getElementById('active-tags');
  const cardBadgeEl = document.getElementById('card-badge');

  if (!resultCard || !emptyState) return;

  // إذا تم اختيار المجال والوقت معاً تظهر بطاقة التوجيه تلقائياً
  if (state.selectedDomain && state.selectedTime) {
    const recommendation = getRecommendation(state.selectedDomain, state.selectedTime);

    if (recommendation) {
      // ملء البيانات في البطاقة
      if (cardTextEl) cardTextEl.textContent = recommendation.cardText;
      if (initiativeTypeEl) initiativeTypeEl.textContent = recommendation.initiativeType;
      if (nawaLinkEl) {
        nawaLinkEl.href = recommendation.nawaUrl;
        nawaLinkEl.setAttribute('aria-label', `الانتقال إلى مبادرات ${recommendation.domainLabel} على منصة نوى`);
      }
      if (cardBadgeEl) cardBadgeEl.textContent = recommendation.badge || 'توصية موجهة';

      // تحديث وسوم الاختيار الحالية
      if (activeTagsEl) {
        activeTagsEl.innerHTML = `
          <span class="selection-pill domain-pill">
            <span class="pill-emoji">${recommendation.domainEmoji}</span>
            <span>${recommendation.domainLabel}</span>
          </span>
          <span class="selection-divider">+</span>
          <span class="selection-pill time-pill">
            <span class="pill-emoji">${recommendation.timeEmoji}</span>
            <span>${recommendation.timeLabel}</span>
          </span>
        `;
      }

      // إخفاء الحالة الفارغة وإظهار بطاقة التوجيه بحركة انسيابية
      emptyState.classList.add('hidden');
      resultCard.classList.remove('hidden');
      resultCard.classList.remove('card-animate');
      // إعادة تفعيل الأنيميشن
      void resultCard.offsetWidth;
      resultCard.classList.add('card-animate');

      // تمرير انسيابي خفيف نحو البطاقة على الشاشات الصغيرة
      if (window.innerWidth < 768) {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  } else {
    // لم يكتمل الاختيار بعد
    resultCard.classList.add('hidden');
    emptyState.classList.remove('hidden');

    const emptyHintEl = document.getElementById('empty-hint');
    if (emptyHintEl) {
      if (state.selectedDomain && !state.selectedTime) {
        emptyHintEl.textContent = 'رائع! حددت المجال، الآن أجب عن السؤال: كم من الوقت يمكنك أن تمنح أسبوعياً؟';
      } else if (!state.selectedDomain && state.selectedTime) {
        emptyHintEl.textContent = 'ممتاز! حددت الوقت المتاح، الآن اختر مجال التطوع المفضل لديك.';
      } else {
        emptyHintEl.textContent = 'اختر مجالاً ووقتاً ليظهر لك التوجيه الملائم والمبادرة المقترحة على منصة نوى فوراً.';
      }
    }
  }
}

/**
 * تحديد المجال وتحديث الأزرار
 */
function handleDomainSelect(domainValue, buttonEl) {
  state.selectedDomain = domainValue;

  // تحديث النمط النشط لأزرار المجالات
  document.querySelectorAll('.domain-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });

  if (buttonEl) {
    buttonEl.classList.add('active');
    buttonEl.setAttribute('aria-pressed', 'true');
  }

  // التحديث التلقائي للبطاقة
  updateUI();
}

/**
 * تحديد الوقت وتحديث الأزرار
 */
function handleTimeSelect(timeValue, buttonEl) {
  state.selectedTime = timeValue;

  // تحديث النمط النشط لخيارات الوقت
  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });

  if (buttonEl) {
    buttonEl.classList.add('active');
    buttonEl.setAttribute('aria-pressed', 'true');
  }

  // التحديث التلقائي للبطاقة
  updateUI();
}

/**
 * إعادة تعيين الاختيارات
 */
function resetSelections() {
  state.selectedDomain = null;
  state.selectedTime = null;

  document.querySelectorAll('.domain-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });

  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });

  updateUI();

  // إشعار سريع للمستخدم
  showToast('تمت إعادة التعيين. اختر مجالك ووقتك من جديد.');
}

/**
 * نسخ نص التوجيه إلى الحافظة
 */
function copyRecommendationText() {
  const cardTextEl = document.getElementById('card-text');
  if (!cardTextEl) return;

  const textToCopy = cardTextEl.textContent.trim();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('تم نسخ نص التوجيه بنجاح! 📋');
    }).catch(() => {
      fallbackCopy(textToCopy);
    });
  } else {
    fallbackCopy(textToCopy);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('تم نسخ نص التوجيه بنجاح! 📋');
  } catch (err) {
    showToast('تعذر النسخ التلقائي');
  }
  document.body.removeChild(textarea);
}

/**
 * إظهار رسالة منبثقة (Toast)
 */
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// عند اكتمال تحميل الصفحة، نربط الأحداث
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // ربط أزرار المجالات الأربعة
    const domainButtons = document.querySelectorAll('.domain-btn');
    domainButtons.forEach(btn => {
      const domain = btn.getAttribute('data-domain');
      btn.addEventListener('click', () => handleDomainSelect(domain, btn));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDomainSelect(domain, btn);
        }
      });
    });

    // ربط خيارات الوقت الثلاثة
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(btn => {
      const time = btn.getAttribute('data-time');
      btn.addEventListener('click', () => handleTimeSelect(time, btn));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTimeSelect(time, btn);
        }
      });
    });

    // زر إعادة الاختيار
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetSelections);
    }

    // زر نسخ التوصية
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', copyRecommendationText);
    }

    // التحقق المبدئي للواجهة
    updateUI();
  });
}
