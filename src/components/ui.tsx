import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "secondary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-base font-medium transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100";
  const styles: Record<Variant, string> = {
    primary: "bg-teal text-ink font-semibold shadow-[0_0_28px_var(--teal-glow)] hover:brightness-110 disabled:shadow-none",
    secondary: "border border-ivory/60 text-ivory hover:bg-ivory/10",
    ghost: "text-ivory hover:text-teal px-2",
  };
  return (
    <button type="button" className={cn(base, styles[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function Chip({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-sm text-ivory", className)}>
      {children}
    </span>
  );
}

/** Segmented control built on real radio inputs so arrow keys work natively. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="mb-1.5 text-sm font-medium text-ivory">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-lg border border-line p-1">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "relative flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md px-3 text-center text-sm transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal",
              value === o.value ? "bg-teal font-semibold text-ink" : "text-ivory hover:bg-ivory/10"
            )}
          >
            <input type="radio" className="sr-only" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Banner({ tone = "info", title, children }: { tone?: "info" | "hazard"; title: string; children: ReactNode }) {
  return (
    <div
      role={tone === "hazard" ? "alert" : "note"}
      className={cn("rounded-2xl border p-4", tone === "hazard" ? "hatch border-ivory bg-ivory/10" : "border-teal/60 bg-teal/10")}
    >
      <p className="font-semibold text-ivory">{title}</p>
      <div className="mt-1 text-sm text-ivory/90">{children}</div>
    </div>
  );
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-6 text-center">
      <p className="text-muted">{title}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  error,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ivory">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-err`} className="mt-1 text-sm text-ivory" role="alert">
          <span className="font-semibold">Fix: </span>
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls =
  "min-h-11 w-full rounded-lg border border-line bg-ink px-3 text-base text-ivory placeholder:text-muted focus:border-teal aria-[invalid=true]:border-ivory aria-[invalid=true]:border-2";
