import { Helmet } from "react-helmet";
import { pageMetadata } from "@/lib/pageMetadata";

export default function Meta({ page }: { page: keyof typeof pageMetadata }) {
  const meta = pageMetadata[page];

  if (!meta) return null;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
    </Helmet>
  );
}
