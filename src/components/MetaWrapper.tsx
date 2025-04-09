import React from "react";
import { useLocation } from "react-router-dom";
import Meta from "@/components/Meta";
import { PAGE_METADATA } from "@/lib/pageMetadata";

export default function MetaWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  const pageKey = Object.entries(PAGE_METADATA).find(
    ([_, value]) => value.path === path
  )?.[0];

  return (
    <>
      {pageKey && <Meta page={pageKey as keyof typeof PAGE_METADATA} />}
      {children}
    </>
  );
}
