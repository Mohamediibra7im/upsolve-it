import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./seo";

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: "Upsolve",
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#community` },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#application`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: {
        "@type": "Person",
        name: "Mohamed Ibrahim",
        url: "https://mohamediibrahim.dev/",
      },
      publisher: { "@id": `${SITE_URL}/#community` },
      featureList: [
        "Five training modes",
        "Problem rating and topic selection",
        "Upsolve queue synced with Codeforces",
        "Weekly upsolve reminder email",
        "Session reviews and performance tracking",
        "Practice streaks",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#community`,
      name: "HNU - FCSIT ICPC Community",
      url: "https://hnuicpc.tech",
      logo: `${SITE_URL}/brand/icon-512.png`,
      sameAs: [
        "https://github.com/HNU-ICPC-Community",
        "https://www.facebook.com/fcsit.hnu.icpc",
        "https://www.linkedin.com/company/hnu-fcsit-icpc-community",
      ],
    },
  ],
};
