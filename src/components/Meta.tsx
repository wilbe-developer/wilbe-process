import { Helmet } from "react-helmet";
import { PAGE_METADATA } from "@/lib/pageMetadata";

export default function Meta({ page }: { page: keyof typeof PAGE_METADATA }) {
  const meta = PAGE_METADATA[page];

  if (!meta) return null;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
    </Helmet>
  );
}
