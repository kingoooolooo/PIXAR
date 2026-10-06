import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { go } from "@/lib/nav";
import type { StepId } from "@/state/steps";

export function StepHeader({ title, lead }: { title: string; lead: ReactNode }) {
  return (
    <header className="cert-hide mb-5 max-w-3xl">
      <h1 className="t-h1" style={{ fontSize: "clamp(1.75rem, 1rem + 2vw, 3rem)" }}>
        {title}
      </h1>
      <p className="mt-2 text-base text-muted sm:text-lg">{lead}</p>
    </header>
  );
}

export function StepFooter({
  back,
  next,
  nextLabel,
  nextDisabled,
  onNext,
  children,
}: {
  back?: StepId;
  next?: StepId;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="cert-hide mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <div className="flex flex-wrap items-center gap-2">
        {back && (
          <Button variant="ghost" onClick={() => go(`/demo/${back}`)}>
            Back
          </Button>
        )}
        {children}
      </div>
      {next && (
        <Button
          variant="primary"
          disabled={nextDisabled}
          onClick={() => {
            onNext?.();
            go(`/demo/${next}`);
          }}
        >
          {nextLabel ?? "Continue"}
        </Button>
      )}
    </div>
  );
}
