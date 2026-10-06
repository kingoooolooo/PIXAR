import { useMemo } from "react";
import { Pause, Play, Square, X } from "lucide-react";
import { Button } from "@/components/ui";
import { Dialog } from "@/components/Dialog";
import { CHAPTERS, DEMO_NOTES, TOTAL_TIME } from "@/content/pitch";
import { chapterIndexOf, gotoChapter, type Route } from "@/lib/nav";
import { hashStr } from "@/engine/slots";
import { stopAutoplay, toggleAutoplayPause } from "@/state/autoplay";
import { usePresenter } from "@/state/presenter";
import { useIsMobile } from "@/lib/hooks";
import { cn } from "@/utils/cn";

const SHORTCUTS: [string, string][] = [
  ["Left, Right, Page Up, Page Down", "Previous or next chapter. Inside the demo use Back and Continue."],
  ["1 to 9, 0", "Jump to chapter 1 to 9, and 10"],
  ["G", "Chapter overview grid"],
  ["N", "Presenter notes"],
  ["D", "Jump to the live demo"],
  ["A", "Autoplay the demo"],
  ["Space", "Pause or resume autoplay"],
  ["R", "Reset the demo"],
  ["F", "Fullscreen"],
  ["?", "Shortcut help"],
  ["Esc", "Close an overlay or stop autoplay"],
];

export function Overlays() {
  const overlay = usePresenter((s) => s.overlay);
  const setOverlay = usePresenter((s) => s.setOverlay);
  const mobile = useIsMobile();
  const close = () => setOverlay(null);
  return (
    <>
      <Dialog open={overlay === "grid"} onClose={() => overlay === "grid" && close()} title="Chapters" wide variant={mobile ? "sheet" : "center"}>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  close();
                  gotoChapter(i);
                }}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-line bg-s1 px-3 text-left hover:border-teal"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-teal text-sm font-semibold text-teal">{i + 1}</span>
                <span>
                  <span className="block font-medium">{c.title}</span>
                  <span className="block text-xs text-muted">{c.time}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </Dialog>

      <Dialog open={overlay === "help"} onClose={() => overlay === "help" && close()} title="Keyboard shortcuts">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Presenter keyboard shortcuts</caption>
          <tbody>
            {SHORTCUTS.map(([k, v]) => (
              <tr key={k} className="border-t border-line">
                <th scope="row" className="whitespace-nowrap py-2 pr-4 align-top font-semibold">
                  <kbd className="rounded-md border border-line bg-s1 px-1.5 py-0.5 font-sans">{k}</kbd>
                </th>
                <td className="py-2 text-muted">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4">
          <Button onClick={() => setOverlay("about")}>About this prototype</Button>
        </div>
      </Dialog>

      <Dialog open={overlay === "about"} onClose={() => overlay === "about" && close()} title="About this prototype">
        <p className="text-base">PIXAR is a student concept prototype. All data is simulated for demonstration.</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>No network requests: fonts, icons and illustrations are bundled.</li>
          <li>Partners are fictional. Estimates are labelled illustrative.</li>
          <li>Verified figures come from the UN Global E-waste Monitor 2024 and are sourced on screen.</li>
        </ul>
      </Dialog>
    </>
  );
}

export function NotesDrawer({ route }: { route: Route }) {
  const open = usePresenter((s) => s.notesOpen);
  const setNotes = usePresenter((s) => s.setNotes);
  if (!open) return null;
  const idx = chapterIndexOf(route);
  const ch = CHAPTERS[idx];
  return (
    <aside aria-label="Presenter notes" className="no-print fixed inset-y-0 right-0 z-40 flex w-[min(92vw,360px)] flex-col border-l border-line bg-s2 shadow-2xl lg:static lg:z-auto lg:shadow-none">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <h2 className="text-base font-semibold">Presenter notes</h2>
        <button type="button" aria-label="Close presenter notes" onClick={() => setNotes(false)} className="grid size-11 place-items-center rounded-lg hover:bg-ivory/10">
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {ch ? (
          <>
            <div>
              <p className="font-display text-xl font-semibold">{ch.title}</p>
              <p className="text-sm text-muted">
                Time budget {ch.time}. Whole talk {TOTAL_TIME}.
              </p>
            </div>
            <ul className="list-disc space-y-2 pl-5">
              {ch.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            {route.kind === "demo" && (
              <div>
                <p className="mb-1 font-semibold">Demo click path</p>
                <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                  {DEMO_NOTES.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ol>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted">The Lean Canvas prints on one A4 landscape page. Use the print button at the top of the sheet.</p>
        )}
      </div>
    </aside>
  );
}

export function AutoplayCaption() {
  const ap = usePresenter((s) => s.autoplay);
  if (ap.status === "off") return null;
  return (
    <div role="status" aria-live="polite" className="no-print pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-3 lg:bottom-6">
      <div className="pointer-events-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-2xl border border-teal bg-s2 px-4 py-3 shadow-[0_0_32px_var(--teal-glow)]">
        <p className="t-body min-w-0 flex-1">{ap.status === "paused" ? "Paused. " : ""}{ap.caption}</p>
        <div className="flex gap-1">
          <button type="button" onClick={toggleAutoplayPause} aria-label={ap.status === "paused" ? "Resume autoplay (Space)" : "Pause autoplay (Space)"} className="grid size-11 place-items-center rounded-lg border border-line hover:bg-ivory/10">
            {ap.status === "paused" ? <Play className="size-5" strokeWidth={1.5} /> : <Pause className="size-5" strokeWidth={1.5} />}
          </button>
          <button type="button" onClick={() => stopAutoplay()} aria-label="Stop autoplay (Esc)" className="grid size-11 place-items-center rounded-lg border border-line hover:bg-ivory/10">
            <Square className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Chapter change: a quick pixel-grid dissolve, a nod to the name. */
export function PixelDissolve({ id }: { id: number }) {
  const cells = useMemo(() => Array.from({ length: 16 * 9 }, (_, i) => ({ delay: hashStr(`px${i}`) % 90, accent: hashStr(`ac${i}`) % 9 === 0 })), []);
  if (id === 0) return null;
  return (
    <div key={id} aria-hidden className="pointer-events-none fixed inset-0 z-50 grid grid-cols-16 grid-rows-9" style={{ gridTemplateColumns: "repeat(16, 1fr)", gridTemplateRows: "repeat(9, 1fr)" }}>
      {cells.map((c, i) => (
        <span key={i} className={cn("opacity-0", c.accent ? "bg-s2" : "bg-ink")} style={{ animation: `pxl 260ms ease-out ${c.delay}ms both` }} />
      ))}
    </div>
  );
}
