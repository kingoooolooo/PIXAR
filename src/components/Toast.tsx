import { usePresenter } from "@/state/presenter";

export function ToastHost() {
  const toasts = usePresenter((s) => s.toasts);
  return (
    <div role="status" aria-live="polite" className="no-print pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6">
      {toasts.map((t) => (
        <div key={t.id} className="pop-in rounded-xl border border-teal bg-s2 px-4 py-2.5 text-base text-ivory shadow-[0_0_28px_var(--teal-glow)]">
          {t.msg}
        </div>
      ))}
    </div>
  );
}
