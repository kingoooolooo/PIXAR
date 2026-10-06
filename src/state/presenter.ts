import { create } from "zustand";
import type { StepId } from "./steps";

export type Overlay = "grid" | "help" | "about" | null;
export interface ToastItem {
  id: number;
  msg: string;
}

interface PresenterState {
  notesOpen: boolean;
  overlay: Overlay;
  consoleOpen: boolean;
  speed: 1 | 2;
  run: { step: StepId | null; runId: number };
  autoplay: { status: "off" | "running" | "paused"; caption: string | null };
  forced: string | null;
  toasts: ToastItem[];
  fullscreen: boolean;
  setNotes: (v: boolean) => void;
  setOverlay: (o: Overlay) => void;
  setConsoleOpen: (v: boolean) => void;
  setSpeed: (s: 1 | 2) => void;
  playConsole: (step: StepId) => void;
  setAutoplay: (status: "off" | "running" | "paused", caption?: string | null) => void;
  setForced: (id: string | null) => void;
  dropToast: (id: number) => void;
  setFullscreen: (v: boolean) => void;
}

let toastId = 0;

export const usePresenter = create<PresenterState>((set, get) => ({
  notesOpen: false,
  overlay: null,
  consoleOpen: typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  speed: 1,
  run: { step: null, runId: 0 },
  autoplay: { status: "off", caption: null },
  forced: null,
  toasts: [],
  fullscreen: false,
  setNotes: (v) => set({ notesOpen: v }),
  setOverlay: (o) => set({ overlay: o }),
  setConsoleOpen: (v) => set({ consoleOpen: v }),
  setSpeed: (s) => set({ speed: s }),
  playConsole: (step) => set({ run: { step, runId: get().run.runId + 1 } }),
  setAutoplay: (status, caption) => set({ autoplay: { status, caption: caption === undefined ? get().autoplay.caption : caption } }),
  setForced: (id) => set({ forced: id }),
  dropToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  setFullscreen: (v) => set({ fullscreen: v }),
}));

export function toast(msg: string) {
  const id = ++toastId;
  usePresenter.setState({ toasts: [...usePresenter.getState().toasts, { id, msg }] });
  window.setTimeout(() => usePresenter.getState().dropToast(id), 2800);
}

/** Chapters such as Value proposition and the flywheel can consume arrow keys before chapter navigation. */
type ArrowHandler = (dir: 1 | -1) => boolean;
let arrowHandler: ArrowHandler | null = null;
export const setArrowHandler = (h: ArrowHandler | null) => {
  arrowHandler = h;
};
export const consumeArrow = (dir: 1 | -1): boolean => (arrowHandler ? arrowHandler(dir) : false);
