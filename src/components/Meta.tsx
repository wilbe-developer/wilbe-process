
import { Helmet } from "react-helmet";
import { PAGE_METADATA } from "@/lib/pageMetadata";

export default function Meta({ page }: { page: keyof typeof PAGE_METADATA }) {
  const meta = PAGE_METADATA[page];

  if (!meta) return null;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={meta.canonical} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={meta.canonical} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.ogImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={meta.canonical} />
      
      {/* Schema.org markup */}
      <script type="application/ld+json">
        {JSON.stringify(meta.schema)}
      </script>
    </Helmet>
  );
}
