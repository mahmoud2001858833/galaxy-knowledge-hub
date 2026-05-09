import { DamijDict } from '../types';
export const zh: DamijDict = {
  nav: { home: '首页', sign: '手语', sensory: '感官', autism: '自闭症', adhd: 'ADHD', braille: '盲文', clinical: '实验室', show: '显示', hide: '隐藏' },
  hero: { badge: 'Damij — 包容教育与智能诊断', title: 'Damij', tagline: '替代感官，平等机会，无障碍科学',
    desc: '面向每个孩子的六大综合支柱：通用手语翻译器、反向感官桥、游戏化自闭症与 ADHD 诊断、全球盲文翻译器和临床模拟实验室。',
    cta: '开始', chips: ['包容', '智能', '循证', '15 种语言'] },
  sections: {
    sign: { title: '手语翻译器', desc: '手语 ↔ 文字/语音，支持 100+ 种语言。' },
    sensory: { title: '反向感官桥 ⭐', desc: '上传内容并转换为可用感官。' },
    autism: { title: '自闭症 — 游戏诊断', desc: '基于 DSM-5、M-CHAT-R 和 ADOS-2。' },
    adhd: { title: 'ADHD — 专注与自控', desc: 'Stroop/N-Back/CPT 训练。' },
    braille: { title: '通用盲文', desc: '文字 ⟷ 盲文，OCR 和课程。' },
    clinical: { title: '临床模拟实验室', desc: '研究用虚拟环境。' },
  },
  sources: { title: '基于可信的科学来源', desc: 'DSM-5-TR · M-CHAT-R · ADOS-2 · Conners-3 · WHO ICF-CY · UNESCO · Unicode Braille · WFD', cta: '查看参考文献' },
  loader: { loading: '加载中...', preparing: '正在准备体验...' },
  assistant: { title: 'Damij 智能向导', subtitle: '熟悉每个部分并即刻带您前往', placeholder: '询问任意功能...',
    welcome: '您好！我是 Damij 上的智能向导。',
    send: '发送', listen: '说话', open: '打开向导', close: '关闭', navigate: '带我去那里', thinking: '思考中...', error: '无法连接向导。',
    suggestions: ['如何使用手语翻译器？', '什么是反向感官桥？', '带我去自闭症诊断', '介绍一下盲文'] },
  langSwitch: { label: '语言', search: '搜索语言...' },
  footer: '此平台由 Anaba 第二男子综合学校创建',
};
