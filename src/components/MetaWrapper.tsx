
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Meta from "@/components/Meta";
import { PAGE_METADATA } from "@/lib/pageMetadata";

export default function MetaWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  const pageKey = Object.entries(PAGE_METADATA).find(
    ([_, value]) => value.path === path
  )?.[0];

  // This effect checks and logs any heading structure issues
  useEffect(() => {
    // Wait for DOM to be fully rendered
    const timer = setTimeout(() => {
      // Check for heading structure issues
      validateHeadingStructure();
    }, 1000);

    return () => clearTimeout(timer);
  }, [path]);

  // Function to validate heading structure
  const validateHeadingStructure = () => {
    // Check if there's exactly one H1
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length === 0) {
      console.warn('SEO Warning: No H1 heading found on the page.');
    } else if (h1Elements.length > 1) {
      console.warn(`SEO Warning: Multiple H1 headings found (${h1Elements.length}). Should only have one.`);
    }

    // Check for proper hierarchy (H2 should come after H1, H3 after H2, etc.)
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.substring(1));
      
      // If skipping a level (e.g., H1 to H3)
      if (currentLevel > previousLevel + 1 && previousLevel !== 0) {
        console.warn(`SEO Warning: Heading hierarchy skipped from H${previousLevel} to H${currentLevel}`);
      }
      
      previousLevel = currentLevel;
    });
  };

  return (
    <>
      {pageKey && <Meta page={pageKey as keyof typeof PAGE_METADATA} />}
      {children}
    </>
  );
}
