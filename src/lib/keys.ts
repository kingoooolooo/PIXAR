import { useEffect } from "react";
import { startAutoplay, stopAutoplay, toggleAutoplayPause } from "@/state/autoplay";
import { consumeArrow, usePresenter } from "@/state/presenter";
import { resetAll, toggleFullscreen } from "./actions";
import { chapterIndexOf, go, gotoChapter, parseHash } from "./nav";

const TEXT_INPUT = new Set(["text", "search", "tel", "email", "url", "password", "number"]);

/** Global presenter shortcuts. Ignored while typing in a field. */
export function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const isInput = t?.tagName === "INPUT" ? (t as HTMLInputElement) : null;
      const typing = !!t && ((isInput && TEXT_INPUT.has(isInput.type)) || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      if (typing) return;
      const p = usePresenter.getState();
      const dialogOpen = !!document.querySelector("dialog[open]");

      if (e.key === "Escape") {
        if (p.autoplay.status !== "off") stopAutoplay();
        else if (!dialogOpen && p.notesOpen) p.setNotes(false);
        return;
      }
      if (dialogOpen) return;

      const route = parseHash(window.location.hash);
      const idx = chapterIndexOf(route);
      const key = e.key.toLowerCase();

      if (e.key === " " && p.autoplay.status !== "off") {
        e.preventDefault();
        toggleAutoplayPause();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (route.kind === "demo" || route.kind === "canvas") return;
        if (isInput && isInput.type === "radio") return;
        const dir = e.key === "ArrowRight" ? 1 : -1;
        if (consumeArrow(dir)) {
          e.preventDefault();
          return;
        }
        gotoChapter(idx + dir);
        return;
      }
      if (e.key === "PageDown" || e.key === "PageUp") {
        if (route.kind === "canvas") return;
        e.preventDefault();
        gotoChapter(idx + (e.key === "PageDown" ? 1 : -1));
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        gotoChapter(e.key === "0" ? 9 : Number(e.key) - 1);
        return;
      }
      switch (key) {
        case "g":
          p.setOverlay(p.overlay === "grid" ? null : "grid");
          break;
        case "n":
          p.setNotes(!p.notesOpen);
          break;
        case "d":
          if (route.kind !== "demo") go("/demo/scan");
          break;
        case "a":
          void startAutoplay();
          break;
        case "r":
          resetAll();
          break;
        case "f":
          void toggleFullscreen();
          break;
        case "?":
          p.setOverlay(p.overlay === "help" ? null : "help");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
