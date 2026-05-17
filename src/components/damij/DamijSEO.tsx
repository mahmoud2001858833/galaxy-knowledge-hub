import { Helmet } from 'react-helmet-async';

interface DamijSEOProps {
  title: string;
  description: string;
  path: string; // e.g. "/damij" or "/damij/sign"
  keywords?: string;
  jsonLd?: object;
}

const BASE = 'https://yoursite.lovable.app';
const DEFAULT_KEYWORDS =
  'منصة دامج, دامج, Damij, منصة دامج التعليمية, دامج للدمج التعليمي, منصة دمج ذوي الإعاقة, تعليم دامج, منصة الدمج الشامل, دامج ذروة العلم, لغة الإشارة, بريل, عين الأعمى, التوحد, ADHD, فرط الحركة, الجسر الحسي, تجارب سريرية, منصة تعليمية لذوي الاحتياجات الخاصة, تعليم شامل, إعاقة بصرية, إعاقة سمعية';

export const DamijSEO = ({ title, description, path, keywords, jsonLd }: DamijSEOProps) => {
  const fullTitle = `${title} | منصة دامج — ذروة العلم`;
  const url = `${BASE}${path}`;
  return (
    <Helmet>
      <html lang="ar" dir="rtl" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="منصة دامج — ذروة العلم" />
      <meta property="og:locale" content="ar_AR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default DamijSEO;
