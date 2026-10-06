import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** Chapter wrapper: one h1 per chapter, generous padding. */
export function Stage({
  title,
  lead,
  children,
  className,
}: {
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("stage-pad flex min-h-full flex-col gap-6", className)}>
      <header className="max-w-4xl">
        <h1 className="t-h1">{title}</h1>
        {lead && <p className="t-lead mt-3 text-ivory/90">{lead}</p>}
      </header>
      {children}
    </section>
  );
}

export function Source({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
