
// Define default image and website URL
const DEFAULT_IMAGE = "https://process.wilbe.com/og-image.png";
const WEBSITE_URL = "https://wilbe.com";

export const PAGE_METADATA = {
  "/knowledge-center": {
    path: "/knowledge-center",
    title: "Knowledge Center | Wilbe",
    description: "Curated talks, guides, and insights for scientists building startups.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/knowledge-center`,
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Knowledge Center | Wilbe",
      "description": "Curated talks, guides, and insights for scientists building startups.",
      "url": `${WEBSITE_URL}/knowledge-center`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
  "/member-directory": {
    path: "/member-directory",
    title: "Member Directory | Wilbe",
    description: "Meet the scientist-founders and researchers driving change with Wilbe.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/member-directory`,
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Member Directory | Wilbe",
      "description": "Meet the scientist-founders and researchers driving change with Wilbe.",
      "url": `${WEBSITE_URL}/member-directory`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
  "/video": {
    path: "/video",
    title: "Video Library | Wilbe",
    description: "Learn from top founders, operators, and scientists.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/video`,
    schema: {
      "@context": "https://schema.org",
      "@type": "VideoGallery",
      "name": "Video Library | Wilbe",
      "description": "Learn from top founders, operators, and scientists.",
      "url": `${WEBSITE_URL}/video`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
  "/build-your-deck": {
    path: "/build-your-deck",
    title: "Build Your Deck | Wilbe",
    description: "Coming soon: a tool to create your science startup deck.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/build-your-deck`,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Build Your Deck | Wilbe",
      "description": "Coming soon: a tool to create your science startup deck.",
      "url": `${WEBSITE_URL}/build-your-deck`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
  "/lab-search": {
    path: "/lab-search",
    title: "Lab Search | Wilbe",
    description: "Coming soon: find and access leading labs and facilities.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/lab-search`,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Lab Search | Wilbe",
      "description": "Coming soon: find and access leading labs and facilities.",
      "url": `${WEBSITE_URL}/lab-search`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
  "/events": {
    path: "/events",
    title: "Events | Wilbe",
    description: "Coming soon: join events for scientists building companies.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/events`,
    schema: {
      "@context": "https://schema.org",
      "@type": "EventSeries",
      "name": "Events | Wilbe",
      "description": "Coming soon: join events for scientists building companies.",
      "url": `${WEBSITE_URL}/events`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
  "/ask": {
    path: "/ask",
    title: "Ask & Invite | Wilbe",
    description: "Coming soon: ask for help or invite others to join Wilbe.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/ask`,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Ask & Invite | Wilbe",
      "description": "Coming soon: ask for help or invite others to join Wilbe.",
      "url": `${WEBSITE_URL}/ask`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
  "/profile": {
    path: "/profile",
    title: "Your Profile | Wilbe",
    description: "Manage your scientist-founder profile and application.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/profile`,
    schema: {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "name": "Your Profile | Wilbe",
      "description": "Manage your scientist-founder profile and application.",
      "url": `${WEBSITE_URL}/profile`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
  "/landing-page": {
    path: "/landing-page",
    title: "Join Wilbe.com | The Ultimate Hub for Science Entrepreneurship",
    description: "Join Wilbe.com, the ultimate hub for science entrepreneurship. Access resources, funding, and labs. Science entrepreneurship with Wilbe, putting scientists in control.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/landing-page`,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Join Wilbe.com | The Ultimate Hub for Science Entrepreneurship",
      "description": "Join Wilbe.com, the ultimate hub for science entrepreneurship. Access resources, funding, and labs. Science entrepreneurship with Wilbe, putting scientists in control.",
      "url": `${WEBSITE_URL}/landing-page`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
  "/bsf": {
    path: "/bsf",
    title: "Building Science Funding | Wilbe",
    description: "Access resources and funding for your science startup with Wilbe's Building Science Funding program.",
    ogImage: DEFAULT_IMAGE,
    canonical: `${WEBSITE_URL}/bsf`,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Building Science Funding | Wilbe",
      "description": "Access resources and funding for your science startup with Wilbe's Building Science Funding program.",
      "url": `${WEBSITE_URL}/bsf`,
      "publisher": {
        "@type": "Organization",
        "name": "Wilbe",
        "logo": {
          "@type": "ImageObject",
          "url": `${WEBSITE_URL}/lovable-uploads/wilbeLogoNewPng.png`
        }
      }
    }
  },
};
