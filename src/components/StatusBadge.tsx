import { Check, Recycle, TriangleAlert, Wrench } from "lucide-react";
import type { Status } from "@/data/types";
import { cn } from "@/utils/cn";

const META: Record<Status, { label: string; full: string; cls: string; Icon: typeof Check }> = {
  reusable: { label: "Reusable", full: "Reusable", cls: "bg-teal text-ink border-teal", Icon: Check },
  repairable: { label: "Repairable", full: "Repairable", cls: "border-teal text-ivory", Icon: Wrench },
  recyclable: { label: "Recyclable", full: "Recyclable", cls: "border-ivory text-ivory", Icon: Recycle },
  hazardous: { label: "Hazardous", full: "Hazardous: certified handling only", cls: "hatch bg-ivory text-ink border-ivory", Icon: TriangleAlert },
};

export const statusLabel = (s: Status): string => META[s].full;

/** Status is encoded by fill, outline, hatching, icon and label, never colour alone. */
export function StatusBadge({ status, compact, className }: { status: Status; compact?: boolean; className?: string }) {
  const m = META[status];
  return (
    <span
      title={m.full}
      className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium", m.cls, className)}
    >
      <m.Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      <span className={status === "hazardous" ? "rounded-sm bg-ivory/90 px-1" : ""}>{compact ? m.label : m.full}</span>
    </span>
  );
}
