import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ComponentType, type LazyExoticComponent } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastHost } from "@/components/Toast";
import { CHAPTERS, type ChapterId } from "@/content/pitch";
import Cover from "@/chapters/Cover";
import { useReducedMotion } from "@/lib/hooks";
import { useShortcuts } from "@/lib/keys";
import { parseHash, routeKey, useHash, type Route } from "@/lib/nav";
import { MobileBar, Rail, TopBar } from "@/shell/Chrome";
import { AutoplayCaption, NotesDrawer, Overlays, PixelDissolve } from "@/shell/Overlays";
import { usePresenter } from "@/state/presenter";

const LAZY: Record<Exclude<ChapterId, "cover">, LazyExoticComponent<ComponentType>> = {
  problem: lazy(() => import("@/chapters/Problem")),
  alternatives: lazy(() => import("@/chapters/Alternatives")),
  customers: lazy(() => import("@/chapters/Customers")),
  value: lazy(() => import("@/chapters/Value")),
  solution: lazy(() => import("@/chapters/Solution")),
  channels: lazy(() => import("@/chapters/Channels")),
  revenue: lazy(() => import("@/chapters/Revenue")),
  cost: lazy(() => import("@/chapters/Cost")),
  metrics: lazy(() => import("@/chapters/Metrics")),
  advantage: lazy(() => import("@/chapters/Advantage")),
  sdg: lazy(() => import("@/chapters/Sdg")),
};
const CanvasPage = lazy(() => import("@/chapters/CanvasPage"));
const DemoPage = lazy(() => import("@/demo/DemoPage"));
const HeroPage = lazy(() => import("@/pages/HeroPage"));

const Loading = () => <div className="stage-pad text-muted">Loading…</div>;

function Content({ route }: { route: Route }) {
  if (route.kind === "hero") {
    return (
      <ErrorBoundary name="PIXAR Hero">
        <Suspense fallback={<Loading />}>
          <HeroPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  if (route.kind === "canvas") {
    return (
      <ErrorBoundary name="The Lean Canvas">
        <Suspense fallback={<Loading />}>
          <CanvasPage />
        </Suspense>
      </ErrorBoundary>
    );
  }
  if (route.kind === "demo") {
    return (
      <ErrorBoundary name="The live demo">
        <Suspense fallback={<Loading />}>
          <DemoPage step={route.step} />
        </Suspense>
      </ErrorBoundary>
    );
  }
  const title = CHAPTERS.find((c) => c.id === route.id)?.title ?? "This chapter";
  if (route.id === "cover") {
    return (
      <ErrorBoundary name={title}>
        <Cover />
      </ErrorBoundary>
    );
  }
  const C = LAZY[route.id];
  return (
    <ErrorBoundary name={title}>
      <Suspense fallback={<Loading />}>
        <C />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  useShortcuts();
  const hash = useHash();
  const route = useMemo(() => parseHash(hash), [hash]);
  const key = routeKey(route);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<Route>(route);
  const shownRef = useRef<Route>(route);
  const [dissolve, setDissolve] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const fullscreen = usePresenter((s) => s.fullscreen);
  const setFullscreen = usePresenter((s) => s.setFullscreen);
  const [chromeHidden, setChromeHidden] = useState(false);

  // Chapter change: pixel dissolve (or a plain crossfade under reduced motion). Demo steps swap straight away.
  useEffect(() => {
    const sameChapter = routeKey(shownRef.current) === key;
    if (sameChapter || reduced) {
      shownRef.current = route;
      setShown(route);
      return;
    }
    setDissolve((n) => n + 1);
    const t = window.setTimeout(() => {
      shownRef.current = route;
      setShown(route);
    }, 150);
    return () => window.clearTimeout(t);
  }, [route, key, reduced]);

  const shownStep = shown.kind === "demo" ? shown.step : "";
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.scrollTo(0, 0);
    document.querySelector(".demo-main")?.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [routeKey(shown), shownStep]);

  useEffect(() => {
    const on = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, [setFullscreen]);

  // In fullscreen the chrome hides after 3 seconds without movement.
  useEffect(() => {
    if (!fullscreen) {
      setChromeHidden(false);
      return;
    }
    let t = window.setTimeout(() => setChromeHidden(true), 3000);
    const wake = () => {
      setChromeHidden(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => setChromeHidden(true), 3000);
    };
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", wake);
    window.addEventListener("touchstart", wake);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, [fullscreen]);

  return (
    <div className="app-shell flex h-dvh flex-col">
      <button
        type="button"
        onClick={() => mainRef.current?.focus()}
        className="no-print sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[70] focus:rounded-lg focus:bg-teal focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </button>
      <TopBar route={shown} hidden={chromeHidden || shown.kind === "hero"} />
      <div className="app-body flex min-h-0 flex-1">
        <Rail route={shown} hidden={chromeHidden || shown.kind === "hero"} />
        <main id="stage" ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto outline-none">
          <div key={routeKey(shown)} className="fade-in min-h-full lg:h-full">
            <Content route={shown} />
          </div>
        </main>
        <NotesDrawer route={shown} />
      </div>
      <MobileBar route={shown} hidden={chromeHidden || shown.kind === "hero"} />
      <Overlays />
      <AutoplayCaption />
      <ToastHost />
      <PixelDissolve id={dissolve} />
    </div>
  );
}
