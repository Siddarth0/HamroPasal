'use client';

import { useEffect, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

/**
 * Free-tier APIs (e.g. Render) sleep when idle and take ~30s to wake. If queries
 * stay in flight for a few seconds, show a small, non-blocking notice so users
 * know data is on the way rather than thinking the site is broken.
 */
export function BackendStatus() {
  const fetching = useIsFetching();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (fetching > 0) {
      const t = setTimeout(() => setShow(true), 4000); // only if it's actually slow
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [fetching]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex max-w-[260px] items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground shadow-lg md:bottom-4">
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand" />
      <span>
        Waking up our server… the first load can take up to ~30s on free hosting.
      </span>
    </div>
  );
}
