import * as React from "react";
import {
  PlasmicLandingPageOld,
  DefaultLandingPageOldProps,
  pageMetadata
} from "./plasmic/wilbe_com/PlasmicLandingPageOld";
import { HTMLElementRefOf } from "@plasmicapp/react-web";
import { Helmet } from "react-helmet";

export interface LandingPageOldProps extends DefaultLandingPageOldProps {}

function LandingPageOld_(
  props: LandingPageOldProps,
  ref: HTMLElementRefOf<"div">
) {
  return (
    <>
      <Helmet>
        <title>{pageMetadata.title}</title>
        <meta name="description" content={pageMetadata.description} />
        <meta property="og:title" content={pageMetadata.title} />
        <meta property="og:description" content={pageMetadata.description} />
        <meta property="og:image" content={pageMetadata.ogImageSrc} />
        <link rel="canonical" href={pageMetadata.canonical} />
      </Helmet>
      <PlasmicLandingPageOld root={{ ref }} {...props} />
    </>
  );
}

const LandingPageOld = React.forwardRef(LandingPageOld_);
export default LandingPageOld;
