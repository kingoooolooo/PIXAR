import { ChevronLeft, ChevronRight, FileText, Info, Keyboard, List, Maximize, NotebookPen, RotateCcw, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/Logo";
import { CHAPTERS } from "@/content/pitch";
import { resetAll, toggleFullscreen } from "@/lib/actions";
import { chapterIndexOf, go, gotoChapter, type Route } from "@/lib/nav";
import { usePresenter } from "@/state/presenter";
import { cn } from "@/utils/cn";

function IconBtn({ label, onClick, children, className, pressed }: { label: string; onClick: () => void; children: ReactNode; className?: string; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn("grid size-11 shrink-0 place-items-center rounded-lg text-ivory transition-colors duration-200 hover:bg-ivory/10 xl:w-auto xl:grid-flow-col xl:gap-2 xl:px-3", pressed && "bg-ivory/10", className)}
    >
      {children}
    </button>
  );
}

export function TopBar({ route, hidden }: { route: Route; hidden: boolean }) {
  const notesOpen = usePresenter((s) => s.notesOpen);
  const setNotes = usePresenter((s) => s.setNotes);
  const setOverlay = usePresenter((s) => s.setOverlay);
  const idx = chapterIndexOf(route);
  const title = route.kind === "canvas" ? "Lean Canvas" : CHAPTERS[idx]?.title;
  const ic = "size-5";
  return (
    <header className={cn("no-print flex h-14 shrink-0 items-center gap-2 border-b border-line bg-ink/90 px-2 backdrop-blur transition-opacity duration-300 sm:px-4", hidden && "pointer-events-none opacity-0")}>
      <a href="#/cover" aria-label="PIXAR, go to cover" className="grid min-h-11 place-items-center rounded-lg px-1.5">
        <Wordmark className="text-xl" />
      </a>
      <p className="hidden min-w-0 truncate text-sm text-muted md:block" aria-live="polite">
        {title}
      </p>
      <div className="ml-auto flex items-center gap-0.5">
        <IconBtn label="Interactive Hero Page" onClick={() => go("/hero")}>
          <Sparkles className={ic} strokeWidth={1.5} />
          <span className="hidden text-sm xl:inline">Hero</span>
        </IconBtn>
        <span className="mr-1 rounded-md border border-ivory/50 px-2 py-1 text-xs font-medium sm:text-sm">Simulated prototype</span>
        <IconBtn label="Presenter notes (N)" pressed={notesOpen} onClick={() => setNotes(!notesOpen)}>
          <NotebookPen className={ic} strokeWidth={1.5} />
          <span className="hidden text-sm xl:inline">Notes</span>
        </IconBtn>
        <IconBtn label="Lean Canvas" onClick={() => go("/canvas")}>
          <FileText className={ic} strokeWidth={1.5} />
          <span className="hidden text-sm xl:inline">Lean Canvas</span>
        </IconBtn>
        <IconBtn label="Fullscreen (F)" onClick={() => void toggleFullscreen()} className="hidden sm:grid">
          <Maximize className={ic} strokeWidth={1.5} />
          <span className="hidden text-sm xl:inline">Fullscreen</span>
        </IconBtn>
        <IconBtn label="Reset demo (R)" onClick={resetAll}>
          <RotateCcw className={ic} strokeWidth={1.5} />
          <span className="hidden text-sm xl:inline">Reset</span>
        </IconBtn>
        <IconBtn label="Keyboard shortcuts (?)" onClick={() => setOverlay("help")} className="hidden sm:grid">
          <Keyboard className={ic} strokeWidth={1.5} />
        </IconBtn>
        <IconBtn label="About this prototype" onClick={() => setOverlay("about")} className="hidden sm:grid">
          <Info className={ic} strokeWidth={1.5} />
        </IconBtn>
      </div>
    </header>
  );
}

export function Rail({ route, hidden }: { route: Route; hidden: boolean }) {
  const idx = chapterIndexOf(route);
  return (
    <nav aria-label="Chapters" className={cn("no-print relative hidden w-14 shrink-0 transition-opacity duration-300 lg:block", hidden && "pointer-events-none opacity-0")}>
      <div className="group absolute inset-y-0 left-0 z-30 flex w-14 flex-col justify-center overflow-hidden border-r border-line bg-ink/95 transition-[width] duration-200 hover:w-64 focus-within:w-64">
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.route}`} aria-current={i === idx ? "page" : undefined} className="flex h-11 items-center gap-3 px-3.5 text-sm text-ivory/80 hover:text-ivory">
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold", i === idx ? "border-teal bg-teal text-ink" : i < idx ? "border-teal text-teal" : "border-line")}>{i + 1}</span>
                <span className={cn("whitespace-nowrap opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100", i === idx && "font-semibold text-ivory")}>{c.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

export function MobileBar({ route, hidden }: { route: Route; hidden: boolean }) {
  const setOverlay = usePresenter((s) => s.setOverlay);
  const idx = chapterIndexOf(route);
  return (
    <div className={cn("no-print flex h-14 shrink-0 items-center justify-between gap-2 border-t border-line bg-ink px-2 transition-opacity duration-300 lg:hidden", hidden && "pointer-events-none opacity-0")}>
      <button type="button" aria-label="Previous chapter" disabled={route.kind === "canvas" || idx <= 0} onClick={() => gotoChapter(idx - 1)} className="grid size-11 place-items-center rounded-lg border border-line disabled:opacity-30">
        <ChevronLeft className="size-5" strokeWidth={1.5} />
      </button>
      <button type="button" onClick={() => setOverlay("grid")} className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm">
        <List className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
        <span className="truncate">{route.kind === "canvas" ? "Lean Canvas" : `${idx + 1} of ${CHAPTERS.length}: ${CHAPTERS[idx]?.title}`}</span>
      </button>
      <button type="button" aria-label="Next chapter" disabled={route.kind === "canvas" || idx >= CHAPTERS.length - 1} onClick={() => gotoChapter(idx + 1)} className="grid size-11 place-items-center rounded-lg border border-line disabled:opacity-30">
        <ChevronRight className="size-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
