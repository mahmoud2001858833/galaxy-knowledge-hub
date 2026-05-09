import { DamijDict } from '../types';

export const en: DamijDict = {
  nav: {
    home: 'Home', sign: 'Sign', sensory: 'Sensory', autism: 'Autism',
    adhd: 'ADHD', braille: 'Braille', clinical: 'Lab',
    show: 'Show navigation', hide: 'Hide navigation',
  },
  hero: {
    badge: 'Damij — Inclusive Education & Smart Diagnosis',
    title: 'Damij',
    tagline: 'An alternate sense, an equal chance, science without barriers',
    desc: 'Six integrated pillars for every child: universal sign-language translator, the Reverse Sensory Bridge, gamified Autism & ADHD diagnosis and therapy, a global Braille translator, and a clinical simulation lab.',
    cta: 'Get Started',
    chips: ['Inclusive', 'Smart', 'Evidence-based', '15 languages'],
  },
  sections: {
    sign:     { title: 'Sign Language Translator',  desc: 'Sign ↔ text/speech in 100+ languages and six global sign systems.' },
    sensory:  { title: 'Reverse Sensory Bridge ⭐',  desc: 'Upload any content and convert it to the sense each student can use.' },
    autism:   { title: 'Autism — Diagnosis by Play', desc: 'Interactive assessment and therapy based on DSM-5, M-CHAT-R and ADOS-2.' },
    adhd:     { title: 'ADHD — Focus & Self-Control', desc: 'Differential screening with gamified Stroop/N-Back/CPT exercises.' },
    braille:  { title: 'Universal Braille',          desc: 'Text ⟷ Braille for any language, Braille OCR, and interactive lessons.' },
    clinical: { title: 'Clinical Simulation Lab',    desc: 'A virtual environment to research and test assessment & therapy protocols.' },
  },
  sources: {
    title: 'Built on trusted scientific sources',
    desc: 'DSM-5-TR · M-CHAT-R · ADOS-2 · Conners-3 · WHO ICF-CY · UNESCO · Unicode Braille · WFD',
    cta: 'Browse references',
  },
  loader: { loading: 'Loading...', preparing: 'Preparing your experience...' },
  assistant: {
    title: 'Damij Smart Guide',
    subtitle: 'Knows every section and can take you there instantly',
    placeholder: 'Ask me about any section or feature...',
    welcome: 'Hello! I am your smart guide on Damij. How can I help?',
    send: 'Send',
    listen: 'Speak',
    open: 'Open guide',
    close: 'Close',
    navigate: 'Take me there',
    thinking: 'Thinking...',
    error: 'Could not reach the guide. Please try again.',
    suggestions: [
      'How do I use the sign-language translator?',
      'What is the Reverse Sensory Bridge?',
      'Take me to autism diagnosis games',
      'Explain the Braille section',
    ],
  },
  langSwitch: { label: 'Language', search: 'Search a language...' },
  footer: 'Platform built by Anaba Second Comprehensive Boys School',
};
