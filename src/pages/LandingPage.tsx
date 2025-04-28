
import * as React from "react";
import PlasmicLandingPage from "@/components/plasmic/wilbe_com/PlasmicLandingPageOld";
import { Helmet } from "react-helmet";

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <PlasmicLandingPage />
    </>
  );
}
