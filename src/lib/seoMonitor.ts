
/**
 * SEO Monitor Utility
 * 
 * This utility helps detect and report common SEO issues on the site.
 * It can be imported and used in development to catch issues early.
 */

export const checkSeoHealth = () => {
  if (typeof document === 'undefined') return;
  
  // Check title
  const title = document.title;
  if (!title || title.length < 10) {
    console.warn('SEO Warning: Page title is missing or too short (less than 10 characters)');
  } else if (title.length > 60) {
    console.warn('SEO Warning: Page title is too long (more than 60 characters)');
  }
  
  // Check meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription || !metaDescription.getAttribute('content')) {
    console.warn('SEO Warning: Meta description is missing');
  } else {
    const descriptionContent = metaDescription.getAttribute('content') || '';
    if (descriptionContent.length < 50) {
      console.warn('SEO Warning: Meta description is too short (less than 50 characters)');
    } else if (descriptionContent.length > 160) {
      console.warn('SEO Warning: Meta description is too long (more than 160 characters)');
    }
  }
  
  // Check canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical || !canonical.getAttribute('href')) {
    console.warn('SEO Warning: Canonical URL is missing');
  }
  
  // Check for alt text on images
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
  if (imagesWithoutAlt.length > 0) {
    console.warn(`SEO Warning: ${imagesWithoutAlt.length} images missing alt text`);
  }
  
  // Check heading structure
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const h1Elements = document.querySelectorAll('h1');
  
  if (h1Elements.length === 0) {
    console.warn('SEO Warning: No H1 heading found on the page');
  } else if (h1Elements.length > 1) {
    console.warn(`SEO Warning: Multiple H1 headings found (${h1Elements.length}). Should only have one.`);
  }
  
  // Check for empty headings
  const emptyHeadings = Array.from(headings).filter(h => h.textContent?.trim() === '');
  if (emptyHeadings.length > 0) {
    console.warn(`SEO Warning: ${emptyHeadings.length} empty headings found`);
  }
  
  // Check for schema.org markup
  const schemaScript = document.querySelector('script[type="application/ld+json"]');
  if (!schemaScript) {
    console.warn('SEO Warning: No schema.org JSON-LD markup found');
  }
  
  // Check for og:image
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage || !ogImage.getAttribute('content')) {
    console.warn('SEO Warning: OG image is missing');
  }
  
  // Check for mobile viewport
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    console.warn('SEO Warning: Viewport meta tag is missing for mobile optimization');
  }
  
  console.log('SEO health check completed');
};

export default checkSeoHealth;
