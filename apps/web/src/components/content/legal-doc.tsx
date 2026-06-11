export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export function LegalDoc({ updated, intro, sections }: { updated: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
        <p className="mt-4 text-muted-foreground">{intro}</p>

        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={s.heading}>
              <h2 className="font-display text-lg font-bold">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          This document is provided for general information about how HamroPasal operates and does not
          constitute legal advice. Questions? Reach us via the{' '}
          <a href="/contact" className="font-medium text-brand hover:underline">
            contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
