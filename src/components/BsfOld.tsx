
import * as React from "react";
import {
  PlasmicBsfOld,
  DefaultBsfOldProps
} from "./plasmic/wilbe_com/PlasmicBsfOld";
import { HTMLElementRefOf } from "@plasmicapp/react-web";
import { Helmet } from "react-helmet";

export interface BsfOldProps extends DefaultBsfOldProps {}

function BsfOld_(props: BsfOldProps, ref: HTMLElementRefOf<"div">) {
  const { pageMetadata } = PlasmicBsfOld;
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageMetadata.title,
    "description": pageMetadata.description,
    "url": pageMetadata.canonical,
    "publisher": {
      "@type": "Organization",
      "name": "Wilbe",
      "logo": {
        "@type": "ImageObject",
        "url": "https://wilbe.com/lovable-uploads/wilbeLogoNewPng.png"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageMetadata.title}</title>
        <meta name="description" content={pageMetadata.description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageMetadata.canonical} />
        <meta property="og:title" content={pageMetadata.title} />
        <meta property="og:description" content={pageMetadata.description} />
        <meta property="og:image" content={pageMetadata.ogImageSrc} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageMetadata.canonical} />
        <meta name="twitter:title" content={pageMetadata.title} />
        <meta name="twitter:description" content={pageMetadata.description} />
        <meta name="twitter:image" content={pageMetadata.ogImageSrc} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={pageMetadata.canonical} />
        
        {/* Schema.org markup */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <PlasmicBsfOld root={{ ref }} {...props} />
    </>
  );
}

const BsfOld = React.forwardRef(BsfOld_);
export default BsfOld;
