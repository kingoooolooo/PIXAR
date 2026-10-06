import { startAutoplay, stopAutoplay } from "@/state/autoplay";
import { useDemo } from "@/state/demo";
import { toast } from "@/state/presenter";
import { go, parseHash } from "./nav";

export function resetAll() {
  stopAutoplay(false);
  useDemo.getState().reset(false);
  toast("Demo reset");
  if (parseHash(window.location.hash).kind === "demo") go("/demo/scan");
}

export async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    toast("Fullscreen is not available in this browser.");
  }
}

export const playAutoplay = () => void startAutoplay();
