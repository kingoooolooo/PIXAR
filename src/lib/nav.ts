import { useSyncExternalStore } from "react";
import { CHAPTERS, type ChapterId } from "@/content/pitch";
import { STEP_IDS, type StepId } from "@/state/steps";

export type Route = { kind: "hero" } | { kind: "chapter"; id: ChapterId } | { kind: "demo"; step: StepId } | { kind: "canvas" };

export function parseHash(hash: string): Route {
  const p = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (p.length === 0 || p[0] === "hero" || p[0] === "landing") return { kind: "hero" };
  if (p[0] === "canvas") return { kind: "canvas" };
  if (p[0] === "demo") {
    const s = STEP_IDS.find((x) => x === p[1]);
    return { kind: "demo", step: s ?? "scan" };
  }
  const ch = CHAPTERS.find((c) => c.route === `/${p[0]}`);
  return ch ? { kind: "chapter", id: ch.id } : { kind: "hero" };
}

export const go = (path: string) => {
  window.location.hash = `#${path}`;
};

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
export const useHash = (): string => useSyncExternalStore(subscribe, () => window.location.hash, () => "");

export const routeKey = (r: Route): string => (r.kind === "hero" ? "hero" : r.kind === "demo" ? "solution" : r.kind === "canvas" ? "canvas" : r.id);
export const chapterIndexOf = (r: Route): number => (r.kind === "hero" ? -1 : CHAPTERS.findIndex((c) => c.id === routeKey(r)));

export const gotoChapter = (i: number) => {
  const c = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, i))];
  go(c.route);
};
