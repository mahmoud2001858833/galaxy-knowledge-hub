import { DamijDict } from '../types';
export const ja: DamijDict = {
  nav: { home: 'ホーム', sign: '手話', sensory: '感覚', autism: '自閉症', adhd: 'ADHD', braille: '点字', clinical: 'ラボ', show: '表示', hide: '非表示' },
  hero: { badge: 'Damij — インクルーシブ教育とスマート診断', title: 'Damij', tagline: '代替の感覚、平等な機会、障壁のない科学',
    desc: 'すべての子どものための6つの統合柱：ユニバーサル手話翻訳、逆感覚ブリッジ、ゲーム化された自閉症・ADHD 診断、グローバル点字翻訳、臨床シミュレーションラボ。',
    cta: '開始', chips: ['包括的', 'スマート', 'エビデンス', '15言語'] },
  sections: {
    sign: { title: '手話翻訳', desc: '手話 ↔ テキスト/音声、100以上の言語。' },
    sensory: { title: '逆感覚ブリッジ ⭐', desc: '任意のコンテンツを利用可能な感覚へ変換。' },
    autism: { title: '自閉症 — 遊びで診断', desc: 'DSM-5、M-CHAT-R、ADOS-2に基づく。' },
    adhd: { title: 'ADHD — 集中と制御', desc: 'Stroop/N-Back/CPT 演習。' },
    braille: { title: 'ユニバーサル点字', desc: 'テキスト ⟷ 点字、OCR とレッスン。' },
    clinical: { title: '臨床シミュレーションラボ', desc: '研究のための仮想環境。' },
  },
  sources: { title: '信頼できる科学的出典に基づく', desc: 'DSM-5-TR · M-CHAT-R · ADOS-2 · Conners-3 · WHO ICF-CY · UNESCO · Unicode Braille · WFD', cta: '参考文献を見る' },
  loader: { loading: '読み込み中...', preparing: '体験を準備中...' },
  assistant: { title: 'Damij スマートガイド', subtitle: '全セクションを把握し即座に案内', placeholder: '機能について尋ねてください...',
    welcome: 'こんにちは！Damij のスマートガイドです。',
    send: '送信', listen: '話す', open: 'ガイドを開く', close: '閉じる', navigate: 'そこへ連れて行って', thinking: '考え中...', error: 'ガイドに接続できません。',
    suggestions: ['手話翻訳の使い方は？', '逆感覚ブリッジとは？', '自閉症診断へ案内', '点字を説明して'] },
  langSwitch: { label: '言語', search: '言語を検索...' },
  footer: 'このプラットフォームは Anaba 第二男子総合学校によって作成されました',
};
