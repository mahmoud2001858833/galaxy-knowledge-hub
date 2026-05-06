import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, BookMarked } from 'lucide-react';

const REFS = [
  { cat: 'تشخيص', name: 'DSM-5-TR — APA 2022', url: 'https://www.psychiatry.org/psychiatrists/practice/dsm' },
  { cat: 'تشخيص', name: 'NICHQ Vanderbilt Assessment Scales', url: 'https://www.nichq.org/sites/default/files/resource-file/NICHQ_Vanderbilt_Assessment_Scales.pdf' },
  { cat: 'تشخيص', name: 'WHO ASRS-v1.1', url: 'https://add.org/wp-content/uploads/2015/03/adhd-questionnaire-ASRS111.pdf' },
  { cat: 'تشخيص', name: 'SNAP-IV Scoring Guide', url: 'https://www.shared-care.ca/files/Scoring_for_SNAP_IV_Guide_26-item.pdf' },
  { cat: 'إرشادات', name: 'AAP Clinical Practice Guideline 2019', url: 'https://publications.aap.org/pediatrics/article/144/4/e20192528' },
  { cat: 'إرشادات', name: 'NICE Guideline NG87', url: 'https://www.nice.org.uk/guidance/ng87' },
  { cat: 'إرشادات', name: 'CDC — ADHD', url: 'https://www.cdc.gov/adhd/' },
  { cat: 'علاج سلوكي', name: 'CHADD', url: 'https://chadd.org/' },
  { cat: 'كتب', name: 'Russell A. Barkley — Taking Charge of ADHD', url: 'https://www.guilford.com/books/Taking-Charge-of-ADHD/Russell-Barkley/9781462542673' },
  { cat: 'تقييم', name: 'Conners CPT-3', url: 'https://www.mhs.com/MHS-Assessment?prodname=cpt3' },
  { cat: 'تقييم', name: 'TOVA Test', url: 'https://www.tovatest.com/' },
  { cat: 'تقييم', name: 'Kirchner (1958) — Age differences in short-term retention (N-Back)', url: 'https://psycnet.apa.org/record/1959-06769-001' },
  { cat: 'تقييم', name: 'Jaeggi et al. (2008) — Improving fluid intelligence with training on working memory', url: 'https://www.pnas.org/doi/10.1073/pnas.0801268105' },
  { cat: 'تقييم', name: 'Stroop (1935) — Studies of interference in serial verbal reactions', url: 'https://psychclassics.yorku.ca/Stroop/' },
  { cat: 'تقييم', name: 'Newman et al. (1985) — Passive avoidance learning (Go/No-Go)', url: 'https://pubmed.ncbi.nlm.nih.gov/4031228/' },
];

const ADHDResources: React.FC = () => {
  const nav = useNavigate();
  const cats = Array.from(new Set(REFS.map((r) => r.cat)));
  return (
    <div className="px-6 pt-12 pb-12 max-w-3xl mx-auto" dir="rtl">
      <button onClick={() => nav('/damij/adhd')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookMarked className="w-7 h-7 text-[hsl(var(--damij-warm))]" />
          <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))]">المكتبة العلمية</h1>
        </div>
        <p className="text-[hsl(var(--damij-text))]/70">المراجع المعتمدة المستخدمة في بناء النظام.</p>
      </header>
      <div className="space-y-6">
        {cats.map((c) => (
          <div key={c}>
            <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2">{c}</h3>
            <ul className="space-y-2">
              {REFS.filter((r) => r.cat === c).map((r) => (
                <li key={r.url} className="p-3 rounded-xl bg-white border border-[hsl(var(--damij-primary))]/10">
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-[hsl(var(--damij-warm))] hover:underline flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" /> {r.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ADHDResources;
