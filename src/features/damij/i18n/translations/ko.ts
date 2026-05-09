import { DamijDict } from '../types';
export const ko: DamijDict = {
  nav: { home: '홈', sign: '수어', sensory: '감각', autism: '자폐', adhd: 'ADHD', braille: '점자', clinical: '랩', carbon: 'Carbon', show: '표시', hide: '숨김' },
  hero: { badge: 'Damij — 포용 교육 및 스마트 진단', title: 'Damij', tagline: '대체 감각, 동등한 기회, 장벽 없는 과학',
    desc: '모든 아이를 위한 6대 통합 기둥: 보편 수어 번역기, 역감각 다리, 게임화된 자폐 및 ADHD 진단, 글로벌 점자 번역기, 임상 시뮬레이션 랩.',
    cta: '시작', chips: ['포용적', '스마트', '근거 기반', '15개 언어'] },
  sections: {
    sign: { title: '수어 번역기', desc: '수어 ↔ 텍스트/음성, 100개 이상 언어.' },
    sensory: { title: '역감각 다리 ⭐', desc: '콘텐츠를 사용 가능한 감각으로 변환.' },
    autism: { title: '자폐 — 놀이 진단', desc: 'DSM-5, M-CHAT-R, ADOS-2 기반.' },
    adhd: { title: 'ADHD — 집중과 통제', desc: 'Stroop/N-Back/CPT 연습.' },
    braille: { title: '보편 점자', desc: '텍스트 ⟷ 점자, OCR 및 학습.' },
    clinical: { title: '임상 시뮬레이션 랩', desc: '연구용 가상 환경.' },
  },
  sources: { title: '신뢰할 수 있는 과학 출처 기반', desc: 'DSM-5-TR · M-CHAT-R · ADOS-2 · Conners-3 · WHO ICF-CY · UNESCO · Unicode Braille · WFD', cta: '참고문헌 보기' },
  loader: { loading: '로딩 중...', preparing: '경험 준비 중...' },
  assistant: { title: 'Damij 스마트 가이드', subtitle: '모든 섹션을 알고 즉시 안내', placeholder: '어떤 기능이든 물어보세요...',
    welcome: '안녕하세요! Damij의 스마트 가이드입니다.',
    send: '보내기', listen: '말하기', open: '가이드 열기', close: '닫기', navigate: '그곳으로 데려가줘', thinking: '생각 중...', error: '가이드에 연결할 수 없습니다.',
    suggestions: ['수어 번역기 사용법?', '역감각 다리란?', '자폐 진단으로 데려가줘', '점자 설명해줘'] },
  langSwitch: { label: '언어', search: '언어 검색...' },
  footer: '이 플랫폼은 Anaba 제2 남자 종합학교가 제작했습니다',
};
