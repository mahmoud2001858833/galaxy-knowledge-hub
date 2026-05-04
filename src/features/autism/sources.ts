// Canonical, peer-reviewed/official sources used for grounding the autism
// screening AI prompt and for surfacing citations in the report UI.
// Anything diagnostic in this module must trace back here.

export type Source = { title: string; url: string; org: string };

export const AUTISM_SOURCES: Source[] = [
  {
    org: 'CDC',
    title: 'Diagnosis of Autism Spectrum Disorder (Healthcare Providers)',
    url: 'https://www.cdc.gov/autism/hcp/diagnosis/index.html',
  },
  {
    org: 'CDC',
    title: 'How is Autism Diagnosed?',
    url: 'https://www.cdc.gov/autism/diagnosis/index.html',
  },
  {
    org: 'CDC',
    title: 'Clinical Screening for ASD',
    url: 'https://www.cdc.gov/autism/hcp/screening/index.html',
  },
  {
    org: 'CDC',
    title: 'Treatment and Intervention for ASD',
    url: 'https://www.cdc.gov/autism/treatment/index.html',
  },
  {
    org: 'CDC',
    title: 'Accessing Services for ASD',
    url: 'https://www.cdc.gov/autism/services/index.html',
  },
  {
    org: 'AAP',
    title:
      'Identification, Evaluation, and Management of Children With Autism Spectrum Disorder',
    url: 'https://publications.aap.org/pediatrics/article/145/1/e20193447/36917',
  },
  {
    org: 'NICE',
    title:
      'CG170 — Autism spectrum disorder in under 19s: support and management',
    url: 'https://www.nice.org.uk/guidance/cg170',
  },
  {
    org: 'WHO',
    title: 'Autism — Fact sheet',
    url: 'https://www.who.int/news-room/fact-sheets/detail/autism-spectrum-disorders',
  },
  {
    org: 'WHO',
    title: 'Caregiver Skills Training for families of children with ASD',
    url: 'https://www.who.int/teams/mental-health-and-substance-use/policy-law-rights/caregiver-skills-training',
  },
];

export const SCREENING_DISCLAIMER_AR =
  'هذه الأداة وسيلة فحص أولي (Screening) وفق إرشادات CDC وAAP وNICE وWHO، وليست بديلاً عن التشخيص الطبي. التشخيص النهائي لاضطراب طيف التوحد يتطلب تقييماً سريرياً متعدد التخصصات وفق معايير DSM-5.';
