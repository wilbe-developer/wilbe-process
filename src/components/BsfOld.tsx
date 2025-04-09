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
      <PlasmicBsfOld root={{ ref }} {...props} />
    </>
  );
}

const BsfOld = React.forwardRef(BsfOld_);
export default BsfOld;
