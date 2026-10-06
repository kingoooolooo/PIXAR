import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, Compass, Play, BookOpen, Layers, ArrowDown, RotateCcw, Activity } from "lucide-react";
import { HERO_ILLUSTRATION_WEBP } from "@/assets/heroIllustration";
import { go, gotoChapter } from "@/lib/nav";

interface Particle {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  s: number;
  l: number;
  d: number;
  a: number;
  c: string;
}

export default function AtlasHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const floatRef = useRef<HTMLDivElement | null>(null);

  const [particleCount, setParticleCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [headlineMode, setHeadlineMode] = useState<"dream" | "pixar">("dream");

  // Keep references for animation frame loop to avoid recreating closures
  const stateRef = useRef<{
    W: number;
    H: number;
    dpr: number;
    R: number;
    dw: number;
    dh: number;
    dx: number;
    dy: number;
    X0: number;
    Y0: number;
    SH: number;
    sd: Uint8ClampedArray | null;
    ready: boolean;
    parts: Particle[];
    idle: number;
    img: HTMLImageElement | null;
    hole: HTMLCanvasElement;
    hx: CanvasRenderingContext2D | null;
    sm: HTMLCanvasElement;
    sx: CanvasRenderingContext2D | null;
    m: {
      x: number;
      y: number;
      lx: number | null;
      ly: number | null;
      nx: number;
      ny: number;
      sx: number;
      sy: number;
      on: boolean;
    };
    animId: number;
  }>({
    W: 0,
    H: 0,
    dpr: 1,
    R: 100,
    dw: 0,
    dh: 0,
    dx: 0,
    dy: 0,
    X0: 0,
    Y0: 0,
    SH: 0,
    sd: null,
    ready: false,
    parts: [],
    idle: 0,
    img: null,
    hole: document.createElement("canvas"),
    hx: null,
    sm: document.createElement("canvas"),
    sx: null,
    m: { x: 0, y: 0, lx: null, ly: null, nx: 0, ny: 0, sx: 0, sy: 0, on: false },
    animId: 0,
  });

  const triggerBurst = useCallback((count = 240, power = 4.2) => {
    const s = stateRef.current;
    if (!s.ready || !s.W) return;
    const cx = s.W / 2;
    const cy = s.H / 2;
    spawnParticles(cx, cy, count, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, power * s.dpr);
  }, []);

  const resetCoalesce = useCallback(() => {
    const s = stateRef.current;
    s.parts.forEach((p) => {
      p.vx = 0;
      p.vy = 0;
      p.l = 0.95;
    });
  }, []);

  function sampleWarmIvoryInkColor(x: number, y: number): [number, number, number] {
    const s = stateRef.current;
    const u = (x - s.X0) / s.dw;
    const v = (y - s.Y0) / s.dh;
    if (u < 0 || u >= 1 || v < 0 || v >= 1 || !s.sd) {
      return [239, 230, 207]; // Warm Ivory
    }
    const SW = 480;
    const i = (((v * s.SH) | 0) * SW + ((u * SW) | 0)) * 4;
    const r = s.sd[i];
    const g = s.sd[i + 1];
    const b = s.sd[i + 2];

    // Compute luminance and strictly project to Ink Black & Warm Ivory duotone palette
    const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const inkR = 7, inkG = 9, inkB = 10;
    const ivoryR = 239, ivoryG = 230, ivoryB = 207;

    return [
      Math.round(inkR + (ivoryR - inkR) * lum),
      Math.round(inkG + (ivoryG - inkG) * lum),
      Math.round(inkB + (ivoryB - inkB) * lum),
    ];
  }

  function brush(x: number, y: number) {
    const s = stateRef.current;
    if (!s.hx) return;
    const X = x / 3;
    const Y = y / 3;
    const g = s.hx.createRadialGradient(X, Y, 0, X, Y, (s.R * 0.95) / 3);
    g.addColorStop(0, "rgba(7,9,10,0.5)");
    g.addColorStop(0.6, "rgba(7,9,10,0.26)");
    g.addColorStop(1, "rgba(7,9,10,0)");
    s.hx.fillStyle = g;
    s.hx.beginPath();
    s.hx.arc(X, Y, s.R / 3, 0, Math.PI * 2);
    s.hx.fill();
  }

  function spawnParticles(x: number, y: number, n: number, vx: number, vy: number, power: number) {
    const s = stateRef.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * s.R;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      let [cr, cg, cb] = sampleWarmIvoryInkColor(px, py);

      // Dark threshold: exclusively spawn shimmering warm ivory stardust (NO teal!)
      const dark = cr * 0.3 + cg * 0.6 + cb * 0.1 < 65;
      if (dark) {
        if (Math.random() < 0.55) continue;
        [cr, cg, cb] = Math.random() < 0.6 ? [246, 239, 224] : [239, 230, 207];
      }

      const k = (0.4 + r / s.R) * power * (1 + Math.random() * 1.6);
      s.parts.push({
        x: px,
        y: py,
        ox: px - s.X0,
        oy: py - s.Y0,
        vx: Math.cos(a) * k + vx * 0.15 + (Math.random() - 0.5) * 2,
        vy: Math.sin(a) * k + vy * 0.15 + (Math.random() - 0.5) * 2 - 0.3,
        s: (1.2 + Math.random() * 2.4) * s.dpr,
        l: 1,
        d: 0.006 + Math.random() * 0.01,
        a: dark ? 0.65 : 1,
        c: `rgb(${cr},${cg},${cb})`,
      });
    }

    if (s.parts.length > 5000) {
      s.parts.splice(0, s.parts.length - 5000);
    }
  }

  useEffect(() => {
    const cv = canvasRef.current;
    const hero = heroRef.current;
    const copy = copyRef.current;
    if (!cv || !hero) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    s.hx = s.hole.getContext("2d");
    s.sx = s.sm.getContext("2d", { willReadFrequently: true });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function handleResize() {
      s.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = hero!.getBoundingClientRect();
      s.W = cv!.width = Math.round(r.width * s.dpr);
      s.H = cv!.height = Math.round(r.height * s.dpr);
      s.R = Math.max(80, Math.min(s.W, s.H) * 0.14);
      s.hole.width = Math.ceil(s.W / 3);
      s.hole.height = Math.ceil(s.H / 3);

      if (!s.ready || !s.img) return;
      const scale = Math.max(s.W / s.img.naturalWidth, s.H / s.img.naturalHeight) * 1.14;
      s.dw = s.img.naturalWidth * scale;
      s.dh = s.img.naturalHeight * scale;
      s.dx = (s.W - s.dw) * 0.6;
      s.dy = (s.H - s.dh) * 0.5;
    }

    let t = performance.now();
    let frameCounter = 0;

    function loop(now: number) {
      s.animId = requestAnimationFrame(loop);
      if (!s.ready || !s.W || !s.img) return;

      const dt = Math.min(2.5, (now - t) / 16.667 || 1);
      t = now;

      // Update particle count telemetry periodically
      if (++frameCounter % 15 === 0) {
        setParticleCount(s.parts.length);
      }

      const stageEl = document.getElementById("stage");
      const sy = stageEl ? stageEl.scrollTop : window.scrollY || 0;
      if (sy > (s.H / s.dpr) * 1.2) return;

      const tx = s.m.on ? s.m.nx : reduce ? 0 : Math.sin(now / 2800) * 0.28;
      const ty = s.m.on ? s.m.ny : reduce ? 0 : Math.cos(now / 3400) * 0.2;
      const e = 1 - Math.pow(0.9, dt);

      s.m.sx += (tx - s.m.sx) * e;
      s.m.sy += (ty - s.m.sy) * e;

      s.X0 = Math.min(0, Math.max(s.W - s.dw, s.dx - s.m.sx * 34 * s.dpr));
      s.Y0 = Math.min(0, Math.max(s.H - s.dh, s.dy - s.m.sy * 22 * s.dpr + sy * 0.14 * s.dpr));

      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;

      // Draw background artwork with monochromatic duotone sepia-ink treatment
      ctx!.filter = "contrast(1.08) brightness(0.98) sepia(0.18)";
      ctx!.drawImage(s.img, s.X0, s.Y0, s.dw, s.dh);
      ctx!.filter = "none";

      if (s.hx) {
        s.hx.globalCompositeOperation = "destination-out";
        s.hx.fillStyle = `rgba(0,0,0,${1 - Math.pow(0.955, dt)})`;
        s.hx.fillRect(0, 0, s.hole.width, s.hole.height);
        s.hx.globalCompositeOperation = "source-over";
      }

      if (s.m.on && !reduce) {
        s.idle = 0;
        const px = s.m.lx === null ? s.m.x : s.m.lx;
        const py = s.m.ly === null ? s.m.y : s.m.ly;
        const ddx = s.m.x - px;
        const ddy = s.m.y - py;
        const dist = Math.hypot(ddx, ddy);
        const steps = Math.max(1, Math.ceil(dist / (s.R * 0.3)));

        for (let i = 1; i <= steps; i++) {
          brush(px + (ddx * i) / steps, py + (ddy * i) / steps);
        }
        spawnParticles(s.m.x, s.m.y, Math.min(90, 12 + dist * 0.5) | 0, ddx, ddy, 2.2 * s.dpr);
        s.m.lx = s.m.x;
        s.m.ly = s.m.y;
      } else if (++s.idle > 180 && s.hx) {
        s.hx.clearRect(0, 0, s.hole.width, s.hole.height);
      }

      ctx!.drawImage(s.hole, 0, 0, s.W, s.H);

      const fr = Math.pow(0.955, dt);
      const tm = now * 0.0015;

      for (let i = s.parts.length - 1; i >= 0; i--) {
        const p = s.parts[i];
        p.l -= p.d * dt;
        if (p.l <= 0) {
          s.parts[i] = s.parts[s.parts.length - 1];
          s.parts.pop();
          continue;
        }

        const k = (1 - p.l) * (1 - p.l) * 0.05 * dt;
        p.vx = (p.vx + (s.X0 + p.ox - p.x) * k + Math.sin(p.y * 0.01 + tm) * 0.06 * dt * s.dpr) * fr;
        p.vy = (p.vy + (s.Y0 + p.oy - p.y) * k + Math.cos(p.x * 0.01 + tm) * 0.06 * dt * s.dpr) * fr;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        ctx!.globalAlpha = p.a * (p.l < 0.25 ? p.l * 4 : 1);
        ctx!.fillStyle = p.c;
        ctx!.fillRect(p.x, p.y, p.s, p.s);
      }

      ctx!.globalAlpha = 1;

      // Parallax shifts on copy & floating glyphs
      if (copy) {
        copy.style.transform = `translate3d(${s.m.sx * 16}px, ${s.m.sy * 12 - sy * 0.16}px, 0)`;
      }

      if (floatRef.current) {
        const flElements = floatRef.current.querySelectorAll<HTMLElement>(".f");
        flElements.forEach((f) => {
          const d = +(f.dataset.d || 40);
          f.style.transform = `translate3d(${s.m.sx * d}px, ${s.m.sy * d - sy * d * 0.006}px, 0)`;
        });
      }
    }

    const img = new Image();
    s.img = img;
    const SW = 480;

    img.onload = () => {
      s.SH = Math.round((img.naturalHeight * SW) / img.naturalWidth);
      s.sm.width = SW;
      s.sm.height = s.SH;
      s.sx!.drawImage(img, 0, 0, SW, s.SH);
      s.sd = s.sx!.getImageData(0, 0, SW, s.SH).data;
      s.ready = true;
      setIsReady(true);
      handleResize();
      cv!.style.opacity = "1";
    };
    img.src = HERO_ILLUSTRATION_WEBP;

    handleResize();
    s.animId = requestAnimationFrame(loop);

    const onPointerMove = (e: PointerEvent) => {
      if (reduce) return;
      const r = hero!.getBoundingClientRect();
      s.m.x = (e.clientX - r.left) * s.dpr;
      s.m.y = (e.clientY - r.top) * s.dpr;
      s.m.nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      s.m.ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      s.m.on = true;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reduce || !s.ready) return;
      const r = hero!.getBoundingClientRect();
      s.m.x = (e.clientX - r.left) * s.dpr;
      s.m.y = (e.clientY - r.top) * s.dpr;
      s.m.on = true;
      spawnParticles(s.m.x, s.m.y, 240, 0, 0, 4.5 * s.dpr);
    };

    const off = () => {
      s.m.on = false;
      s.m.lx = null;
      s.m.ly = null;
    };

    hero.addEventListener("pointermove", onPointerMove);
    hero.addEventListener("pointerdown", onPointerDown);
    hero.addEventListener("pointerleave", off);
    hero.addEventListener("pointercancel", off);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(s.animId);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerdown", onPointerDown);
      hero.removeEventListener("pointerleave", off);
      hero.removeEventListener("pointercancel", off);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollToNext = () => {
    const nextEl = document.getElementById("next");
    if (nextEl) {
      nextEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full overflow-x-hidden bg-[#07090a] text-[#efe6cf] selection:bg-[#efe6cf] selection:text-[#07090a]">
      {/* ===================== HERO SECTION ===================== */}
      <section
        id="hero"
        ref={heroRef}
        aria-label="Lucid Atlas Hero"
        className="relative min-h-[92svh] lg:min-h-[100svh] w-full overflow-hidden bg-[#07090a] text-[#efe6cf] isolation-isolate touch-pan-y cursor-crosshair select-none flex flex-col justify-between"
      >
        {/* Interactive Canvas */}
        <canvas
          id="c"
          ref={canvasRef}
          aria-label="Celestial dream map illustration with interactive particle dispersion"
          className="absolute inset-0 block h-full w-full opacity-0 transition-opacity duration-1000 ease-out"
        />

        {/* Ink Black Scrims - Strictly Ink Black to Transparent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(90deg, rgba(7,9,10,0.92) 0%, rgba(7,9,10,0.68) 32%, rgba(7,9,10,0.2) 60%, transparent 80%), linear-gradient(0deg, rgba(7,9,10,0.95) 0%, rgba(7,9,10,0.4) 30%, transparent 60%)",
          }}
        />

        {/* Ambient Radial Depth Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: "radial-gradient(ellipse at 75% 40%, transparent 35%, rgba(7,9,10,0.85) 85%)",
          }}
        />

        {/* Parallax Floating Astral Rings & Warm Ivory Dots (100% teal-free) */}
        <div ref={floatRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
          {/* Ring 1 - Top Left Orbit */}
          <div
            className="f absolute rounded-full border border-[#efe6cf]/35 will-change-transform"
            data-d="38"
            style={{ left: "11%", top: "18%", width: "110px", height: "110px" }}
          >
            <div className="absolute inset-2 rounded-full border border-dashed border-[#efe6cf]/20" />
          </div>

          {/* Warm Ivory Star Dot */}
          <div
            className="f absolute rounded-full bg-[#efe6cf] shadow-[0_0_12px_rgba(239,230,207,0.8)] will-change-transform"
            data-d="66"
            style={{ left: "47%", top: "14%", width: "9px", height: "9px" }}
          />

          {/* Ring 2 - Top Right Astral Ring */}
          <div
            className="f absolute rounded-full border border-[#efe6cf]/25 will-change-transform"
            data-d="-32"
            style={{ right: "7%", top: "12%", width: "170px", height: "170px" }}
          >
            <span className="absolute -bottom-5 right-2 font-mono text-[10px] tracking-widest text-[#efe6cf]/40">
              42° 18' N
            </span>
          </div>

          {/* Warm Ivory Nova Point (formerly teal dot) */}
          <div
            className="f absolute rounded-full bg-[#f4ede0] shadow-[0_0_18px_rgba(239,230,207,0.9)] will-change-transform"
            data-d="-54"
            style={{ left: "79%", top: "68%", width: "14px", height: "14px" }}
          >
            <span className="absolute -top-4 -right-1 font-mono text-[9px] tracking-widest text-[#efe6cf]/50">
              19.4k LY
            </span>
          </div>

          {/* Ring 3 - Center Orbit */}
          <div
            className="f absolute rounded-full border border-[#efe6cf]/30 will-change-transform"
            data-d="52"
            style={{ left: "28%", top: "56%", width: "52px", height: "52px" }}
          />

          {/* Celestial Grid Coordinate Markings */}
          <div
            className="f absolute font-mono text-[10px] tracking-widest text-[#efe6cf]/30 will-change-transform"
            data-d="20"
            style={{ right: "18%", top: "35%" }}
          >
            [ COALESCENCE : 0.98 ]
          </div>
        </div>

        {/* ===================== HERO NAVIGATION ===================== */}
        <header className="relative z-[4] flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16 border-b border-[#efe6cf]/10 bg-[#07090a]/50 backdrop-blur-md">
          {/* Wordmark & Brand Badge */}
          <div className="flex items-center gap-3">
            <a
              href="#hero"
              className="group flex items-center gap-2 text-decoration-none focus:outline-none"
            >
              <span
                style={{ fontFamily: "var(--serif)" }}
                className="text-2xl sm:text-3xl tracking-tight text-[#efe6cf] transition-opacity duration-200 group-hover:opacity-80"
              >
                Lucid Atlas
              </span>
              <span className="hidden sm:inline-block rounded-full border border-[#efe6cf]/25 px-2.5 py-0.5 font-sans text-[11px] font-medium tracking-wide text-[#efe6cf]/70">
                PIXAR EDITION
              </span>
            </a>
          </div>

          {/* Nav Links & Chapter Jumps */}
          <nav className="flex items-center gap-6 sm:gap-8 font-sans text-sm font-medium text-[#efe6cf]/80">
            <a
              href="#next"
              onClick={(e) => {
                e.preventDefault();
                scrollToNext();
              }}
              className="hidden md:inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#efe6cf] hover:underline underline-offset-8"
            >
              <Compass className="size-3.5 opacity-70" />
              <span>Field Notes</span>
            </a>
            <button
              type="button"
              onClick={() => go("/demo/scan")}
              className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#efe6cf] hover:underline underline-offset-8"
            >
              <Play className="size-3.5 opacity-70" />
              <span>Live Demo</span>
            </button>
            <button
              type="button"
              onClick={() => gotoChapter(1)}
              className="hidden sm:inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#efe6cf] hover:underline underline-offset-8"
            >
              <BookOpen className="size-3.5 opacity-70" />
              <span>Pitch Deck</span>
            </button>
            <button
              type="button"
              onClick={() => go("/canvas")}
              className="hidden lg:inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#efe6cf] hover:underline underline-offset-8"
            >
              <Layers className="size-3.5 opacity-70" />
              <span>Lean Canvas</span>
            </button>
          </nav>
        </header>

        {/* ===================== HERO MAIN COPY ===================== */}
        <div
          ref={copyRef}
          className="copy relative z-[3] px-6 sm:px-10 lg:px-16 pt-12 pb-14 max-w-[860px] will-change-transform"
        >
          {/* Eyebrow & Mode Pill */}
          <div className="mb-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#efe6cf]/30 bg-[#07090a]/60 px-3 py-1 text-xs font-medium tracking-widest uppercase text-[#efe6cf]/85 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-[#efe6cf] animate-pulse" />
              Cartography of Attention & Material Memory
            </span>

            {/* Narrative Toggle: Dream Map vs PIXAR Second Life */}
            <div className="inline-flex rounded-full border border-[#efe6cf]/20 bg-[#07090a]/80 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setHeadlineMode("dream")}
                className={`rounded-full px-2.5 py-0.5 transition-all duration-200 ${
                  headlineMode === "dream"
                    ? "bg-[#efe6cf] text-[#07090a] font-semibold"
                    : "text-[#efe6cf]/60 hover:text-[#efe6cf]"
                }`}
              >
                Dream Map
              </button>
              <button
                type="button"
                onClick={() => setHeadlineMode("pixar")}
                className={`rounded-full px-2.5 py-0.5 transition-all duration-200 ${
                  headlineMode === "pixar"
                    ? "bg-[#efe6cf] text-[#07090a] font-semibold"
                    : "text-[#efe6cf]/60 hover:text-[#efe6cf]"
                }`}
              >
                PIXAR Rebirth
              </button>
            </div>
          </div>

          {/* Colossal Display Title in Instrument Serif */}
          <h1
            style={{ fontFamily: "var(--serif)" }}
            className="text-balance text-[clamp(3.8rem,9vw,9.6rem)] font-normal leading-[0.9] tracking-[-0.025em] text-[#efe6cf]"
          >
            {headlineMode === "dream" ? (
              <>
                <span>Sleep between</span>
                <span className="italic block font-serif">worlds</span>
              </>
            ) : (
              <>
                <span>Scan it. Give it a</span>
                <span className="italic block font-serif">second life.</span>
              </>
            )}
          </h1>

          {/* Subtitle strictly in Warm Ivory & Ink Black context */}
          <p className="mt-7 mb-10 max-w-[42ch] font-sans text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-[#efe6cf]/85">
            {headlineMode === "dream"
              ? "A slow map of the dreaming mind, drawn in ink, grain and warm ivory light."
              : "An agentic AI assistant that appraises old electronics, routes their components into student labs and certified recovery, and seals each second life with verifiable proof."}
          </p>

          {/* Call to Actions (Warm Ivory & Ink Black Only) */}
          <div className="flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={scrollToNext}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#efe6cf] bg-[#efe6cf] px-7 py-3.5 font-sans text-sm sm:text-base font-semibold text-[#07090a] shadow-[0_0_24px_rgba(239,230,207,0.25)] transition-all duration-200 hover:bg-[#faf5eb] hover:shadow-[0_0_32px_rgba(239,230,207,0.45)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Enter the dream</span>
              <ArrowDown className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => go("/demo/scan")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#efe6cf]/40 bg-[#07090a]/50 px-6 py-3.5 font-sans text-sm sm:text-base font-medium text-[#efe6cf] backdrop-blur-md transition-all duration-200 hover:border-[#efe6cf] hover:bg-[#efe6cf]/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="size-4" />
              <span>Explore Live Demo</span>
            </button>

            <button
              type="button"
              onClick={() => gotoChapter(1)}
              className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full border border-[#efe6cf]/25 bg-transparent px-5 py-3.5 font-sans text-sm font-medium text-[#efe6cf]/70 transition-all duration-200 hover:border-[#efe6cf]/60 hover:text-[#efe6cf]"
            >
              <BookOpen className="size-4" />
              <span>Start Pitch (1/12)</span>
            </button>
          </div>
        </div>

        {/* ===================== INTERACTIVE BOTTOM HUD ===================== */}
        <div className="relative z-[3] flex flex-wrap items-center justify-between gap-4 border-t border-[#efe6cf]/10 bg-[#07090a]/75 px-6 py-3.5 sm:px-10 lg:px-16 backdrop-blur-md">
          {/* Scatter Hint */}
          <div className="flex items-center gap-2 font-sans text-xs sm:text-sm text-[#efe6cf]/75">
            <Sparkles className="size-3.5 text-[#efe6cf]/90" />
            <span className="hidden sm:inline">Move cursor or drag to scatter image into stardust particles</span>
            <span className="sm:hidden">Drag across image to scatter</span>
          </div>

          {/* Interactive Controls & Telemetry */}
          <div className="flex items-center gap-3">
            {/* Live particle counter */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#efe6cf]/15 px-2.5 py-1 font-mono text-[11px] text-[#efe6cf]/60">
              <Activity className="size-3 text-[#efe6cf]/70" />
              <span>{isReady ? `${particleCount.toLocaleString()} pts` : "Loading image..."}</span>
            </div>

            {/* Trigger burst button */}
            <button
              type="button"
              onClick={() => triggerBurst(320, 5)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#efe6cf]/35 bg-[#07090a] px-3 py-1 font-sans text-xs font-medium text-[#efe6cf] transition-all hover:border-[#efe6cf] hover:bg-[#efe6cf]/10"
              title="Spawn an explosion of warm ivory particles"
            >
              <span>✦ Burst</span>
            </button>

            {/* Recoalesce button */}
            <button
              type="button"
              onClick={resetCoalesce}
              className="inline-flex items-center gap-1 rounded-full border border-[#efe6cf]/20 bg-[#07090a] px-2.5 py-1 font-sans text-xs text-[#efe6cf]/70 transition-all hover:text-[#efe6cf] hover:border-[#efe6cf]/50"
              title="Pull particles back to image origin"
            >
              <RotateCcw className="size-3" />
              <span className="hidden md:inline">Coalesce</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================== NEXT SECTION (#next) ===================== */}
      <section
        id="next"
        className="relative z-[10] border-t border-[#efe6cf]/15 bg-[#07090a] px-6 py-24 sm:px-10 lg:px-16 text-[#efe6cf]"
      >
        <div className="mx-auto max-w-5xl">
          {/* Subtle Section Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efe6cf]/20 bg-[#16181b] px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-[#efe6cf]/70">
            <span>II. THE DRIFT & ATTENTION</span>
          </div>

          <h2
            style={{ fontFamily: "var(--serif)" }}
            className="text-balance text-[clamp(2.5rem,5.6vw,5.2rem)] font-normal leading-[1.02] tracking-[-0.02em] text-[#efe6cf]"
          >
            Everything you see is held together by attention.
          </h2>

          <p className="mt-6 max-w-2xl font-sans text-lg sm:text-xl font-normal leading-relaxed text-[#efe6cf]/75">
            Look away for a moment and the edges loosen. In Lucid Atlas, the particles drift with your gaze; in PIXAR, neglected devices shed their value unless given attention and a verified second life.
          </p>

          {/* Three Editorial Pillar Cards in Pure Warm Ivory and Ink Black */}
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="group relative flex flex-col justify-between rounded-2xl border border-[#efe6cf]/15 bg-[#101214] p-7 transition-all duration-300 hover:border-[#efe6cf]/40 hover:bg-[#14171a]">
              <div>
                <span className="font-mono text-xs text-[#efe6cf]/50">01 / DISPERSION</span>
                <h3 style={{ fontFamily: "var(--serif)" }} className="mt-3 text-2xl font-normal text-[#efe6cf]">
                  Ink & Grain Physics
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#efe6cf]/70 font-sans">
                  Interactive canvas sampled directly from high-resolution micro-pixels. Move across the face to scatter memories into ivory stardust.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#efe6cf]/80">
                <button
                  type="button"
                  onClick={() => {
                    const hero = document.getElementById("hero");
                    hero?.scrollIntoView({ behavior: "smooth" });
                    setTimeout(() => triggerBurst(300, 4.8), 600);
                  }}
                  className="inline-flex items-center gap-1 hover:underline underline-offset-4"
                >
                  <span>Interact with canvas</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative flex flex-col justify-between rounded-2xl border border-[#efe6cf]/15 bg-[#101214] p-7 transition-all duration-300 hover:border-[#efe6cf]/40 hover:bg-[#14171a]">
              <div>
                <span className="font-mono text-xs text-[#efe6cf]/50">02 / SILICON REBIRTH</span>
                <h3 style={{ fontFamily: "var(--serif)" }} className="mt-3 text-2xl font-normal text-[#efe6cf]">
                  The PIXAR Agent
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#efe6cf]/70 font-sans">
                  India generates 16.0 lakh tonnes of e-waste annually. PIXAR appraises components on-device and connects them to campus labs before disposal.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#efe6cf]/80">
                <button
                  type="button"
                  onClick={() => go("/demo/scan")}
                  className="inline-flex items-center gap-1 hover:underline underline-offset-4"
                >
                  <span>Launch AI Scanner</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative flex flex-col justify-between rounded-2xl border border-[#efe6cf]/15 bg-[#101214] p-7 transition-all duration-300 hover:border-[#efe6cf]/40 hover:bg-[#14171a]">
              <div>
                <span className="font-mono text-xs text-[#efe6cf]/50">03 / THE LEAN CANVAS</span>
                <h3 style={{ fontFamily: "var(--serif)" }} className="mt-3 text-2xl font-normal text-[#efe6cf]">
                  Strategic Model
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#efe6cf]/70 font-sans">
                  Full 1-page business architecture: problem definition, student part loops, EPR integration, and measurable sustainability targets.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#efe6cf]/80">
                <button
                  type="button"
                  onClick={() => go("/canvas")}
                  className="inline-flex items-center gap-1 hover:underline underline-offset-4"
                >
                  <span>View Lean Canvas</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Deck Chapter Navigator */}
          <div className="mt-16 rounded-3xl border border-[#efe6cf]/15 bg-[#101214]/80 p-8 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#efe6cf]/10 pb-6">
              <div>
                <h4 style={{ fontFamily: "var(--serif)" }} className="text-2xl font-normal text-[#efe6cf]">
                  Explore the Complete Project Deck
                </h4>
                <p className="text-sm text-[#efe6cf]/70 mt-1">
                  12 masterclass chapters designed for offline presentation & interactive exploration.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => gotoChapter(1)}
                  className="rounded-full bg-[#efe6cf] px-5 py-2 text-xs font-semibold text-[#07090a] transition-all hover:bg-[#faf5eb]"
                >
                  Start Pitch (1/12)
                </button>
                <button
                  type="button"
                  onClick={() => go("/demo/scan")}
                  className="rounded-full border border-[#efe6cf]/30 px-5 py-2 text-xs font-medium text-[#efe6cf] transition-all hover:border-[#efe6cf]"
                >
                  Direct Demo Jump
                </button>
              </div>
            </div>

            {/* Fast chapter tiles */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {[
                { label: "1. Problem", route: 1 },
                { label: "2. Alternatives", route: 2 },
                { label: "3. Customers", route: 3 },
                { label: "4. Value Prop", route: 4 },
                { label: "5. Live Demo", path: "/demo/scan" },
                { label: "6. Lean Canvas", path: "/canvas" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => (item.path ? go(item.path) : gotoChapter(item.route!))}
                  className="rounded-xl border border-[#efe6cf]/10 bg-[#07090a] p-3 text-left transition-all hover:border-[#efe6cf]/30 hover:bg-[#16181b]"
                >
                  <p className="text-xs font-medium text-[#efe6cf]/80">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
