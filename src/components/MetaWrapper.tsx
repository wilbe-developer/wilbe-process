import React from "react";
import { useLocation } from "react-router-dom";
import Meta from "@/components/Meta";
import { pageMetadata } from "@/lib/pageMetadata";

export default function MetaWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  const pageKey = Object.entries(pageMetadata).find(
    ([_, value]) => value.path === path
  )?.[0];

  return (
    <>
      {pageKey && <Meta page={pageKey as keyof typeof pageMetadata} />}
      {children}
    </>
  );
}
