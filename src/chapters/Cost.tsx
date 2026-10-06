import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Stage } from "@/components/Stage";
import { COSTS } from "@/content/pitch";
import { cn } from "@/utils/cn";

export default function Cost() {
  const [open, setOpen] = useState<string | null>(null);
  const block = (c: (typeof COSTS)[number], cls: string) => {
    const isOpen = open === c.name;
    return (
      <div key={c.name} className={cn("panel flex flex-col p-4", cls)} style={{ flexGrow: c.weight }}>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setOpen(isOpen ? null : c.name)}
          className="flex min-h-11 w-full items-start justify-between gap-3 text-left"
        >
          <span>
            <span className="t-h2 block">{c.name}</span>
            <span className="text-sm text-muted">About {c.weight}% of spend (illustrative)</span>
          </span>
          <ChevronDown className={cn("mt-1 size-5 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} strokeWidth={1.5} aria-hidden />
        </button>
        {isOpen && (
          <ul className="pop-in mt-3 list-disc space-y-1 pl-5 text-base">
            {c.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  const [big, ...rest] = COSTS;
  return (
    <Stage title="People and partners cost more than software" lead="Four blocks, sized relatively. Block sizes are illustrative, not a budget.">
      <div className="flex flex-col gap-3 lg:h-[min(56vh,480px)] lg:flex-row">
        {block(big, "lg:basis-0")}
        <div className="flex flex-col gap-3 lg:basis-0" style={{ flexGrow: 100 - big.weight }}>
          {rest.map((c) => block(c, "lg:basis-0"))}
        </div>
      </div>
      <p className="text-sm text-muted">Select a block to see what it includes.</p>
    </Stage>
  );
}
