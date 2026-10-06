import { cn } from "@/utils/cn";

/** The X of the wordmark is a scan reticle: four corner brackets and a centre point. */
export function Reticle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6" />
      <circle cx="12" cy="12" r="2" fill="var(--teal)" stroke="none" />
    </svg>
  );
}

export function Wordmark({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span role="img" aria-label="PIXAR" className={cn("inline-flex items-center font-display font-bold leading-none tracking-tight", dark ? "text-ink" : "text-ivory", className)}>
      <span aria-hidden>PI</span>
      <Reticle className={cn("mx-[0.04em] h-[0.82em] w-[0.82em]", dark ? "text-ink" : "text-ivory")} />
      <span aria-hidden>AR</span>
    </span>
  );
}
