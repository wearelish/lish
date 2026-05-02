/**
 * SEO Utilities
 * Dynamic meta tags and structured data
 */

// Update page title
export const updatePageTitle = (title: string) => {
  document.title = `${title} | LISH`;
};

// Update meta description
export const updateMetaDescription = (description: string) => {
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', description);
};

// Update Open Graph tags
export const updateOGTags = (title: string, description: string, image?: string) => {
  const updateOrCreate = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  updateOrCreate('og:title', title);
  updateOrCreate('og:description', description);
  if (image) {
    updateOrCreate('og:image', image);
  }
};

// Add structured data (JSON-LD)
export const addStructuredData = (data: Record<string, any>) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

// Organization structured data
export const addOrganizationData = () => {
  addStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LISH',
    description: 'Digital Workplace for Software & SaaS',
    url: 'https://lish.vercel.app',
    logo: 'https://lish.vercel.app/logo.png',
    sameAs: [],
  });
};

// WebApplication structured data
export const addWebApplicationData = () => {
  addStructuredData({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'LISH Platform',
    description: 'A comprehensive digital workplace platform for managing projects, employees, and client relationships',
    url: 'https://lish.vercel.app',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  });
};
