type Json = Record<string, unknown>;

/**
 * Renders one or more schema.org JSON-LD blocks into the document.
 * Server-rendered, so the structured data is in the initial HTML that
 * crawlers read — which is what drives rich results (price, ★ rating, stock).
 */
export function JsonLd({ data }: { data: Json | Json[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // schema content is built server-side from our own data, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
