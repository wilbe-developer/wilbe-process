import { Helmet } from "react-helmet";
import { PAGE_METADATA } from "@/lib/pageMetadata";

export const Meta = ({ path }: { path: string }) => {
  const meta = PAGE_METADATA[path];
  if (!meta) return null;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
    </Helmet>
  );
};
