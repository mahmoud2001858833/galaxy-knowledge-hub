import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  author?: string;
  type?: string;
  locale?: string;
  siteName?: string;
}

export const SEO = ({ 
  title, 
  description, 
  keywords = "ذروة العلم, تعليم, منصة تعليمية",
  canonicalUrl,
  ogImage = "/logo.png",
  author = "منصة ذروة العلم",
  type = "website",
  locale = "ar_SA",
  siteName = "ذروة العلم - منصة تعليمية تفاعلية"
}: SEOProps) => {
  const fullTitle = `${title} | ذروة العلم`;
  const currentUrl = canonicalUrl || window.location.href;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="ar" dir="rtl" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Additional SEO */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="application-name" content="ذروة العلم" />
      <meta name="apple-mobile-web-app-title" content="ذروة العلم" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "ذروة العلم",
          "alternateName": "Peak Science Platform",
          "url": "https://yoursite.lovable.app",
          "logo": ogImage,
          "description": "منصة تعليمية تفاعلية شاملة لتعلم العلوم والرياضيات واللغات مع مساعد ذكي وأدوات تعليمية متطورة",
          "sameAs": [],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "availableLanguage": ["ar", "en"]
          }
        })}
      </script>
      
      {/* Structured Data - WebSite */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "ذروة العلم",
          "url": "https://yoursite.lovable.app",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://yoursite.lovable.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};
