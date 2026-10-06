import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

/** Native dialog: focus is trapped while open and restored to the opener on close. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  variant = "center",
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: "center" | "sheet";
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={cn(variant === "sheet" && "sheet", wide && "w-[min(94vw,960px)] max-w-none")}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="t-h2">{title}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => ref.current?.close()}
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-line hover:bg-ivory/10"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}
