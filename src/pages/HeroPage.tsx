import { useEffect, useRef, useState, useCallback } from "react";
import {
  Sparkles,
  Compass,
  Play,
  BookOpen,
  Layers,
  ArrowDown,
  RotateCcw,
  Activity,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Eye,
  Wrench,
  Award,
  Maximize2
} from "lucide-react";
import {
  HERO_ILLUSTRATION_WEBP,
  PIXAR_SUBSTRATE_ART,
  PIXAR_MAKER_ART,
  PIXAR_SEAL_ART,
} from "@/assets/heroIllustration";
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

export default function HeroPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const floatRef = useRef<HTMLDivElement | null>(null);

  const [particleCount, setParticleCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [headlineMode, setHeadlineMode] = useState<"pixar" | "poetic">("pixar");

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
    R: 110,
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

  const triggerBurst = useCallback((count = 280, power = 4.8) => {
    const s = stateRef.current;
    if (!s.ready || !s.W) return;
    const cx = s.W / 2;
    const cy = s.H / 2;
    spawnParticles(cx, cy, count, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, power * s.dpr);
  }, []);

  const resetCoalesce = useCallback(() => {
    const s = stateRef.current;
    s.parts.forEach((p) => {
      p.vx = 0;
      p.vy = 0;
      p.l = 0.98;
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
    g.addColorStop(0, "rgba(7,9,10,0.55)");
    g.addColorStop(0.6, "rgba(7,9,10,0.28)");
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

      const dark = cr * 0.3 + cg * 0.6 + cb * 0.1 < 68;
      if (dark) {
        if (Math.random() < 0.5) continue;
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
        s: (1.3 + Math.random() * 2.5) * s.dpr,
        l: 1,
        d: 0.005 + Math.random() * 0.009,
        a: dark ? 0.7 : 1,
        c: `rgb(${cr},${cg},${cb})`,
      });
    }

    if (s.parts.length > 5500) {
      s.parts.splice(0, s.parts.length - 5500);
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
      s.R = Math.max(90, Math.min(s.W, s.H) * 0.15);
      s.hole.width = Math.ceil(s.W / 3);
      s.hole.height = Math.ceil(s.H / 3);

      if (!s.ready || !s.img) return;
      const scale = Math.max(s.W / s.img.naturalWidth, s.H / s.img.naturalHeight) * 1.15;
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

      if (++frameCounter % 15 === 0) {
        setParticleCount(s.parts.length);
      }

      const stageEl = document.getElementById("stage");
      const sy = stageEl ? stageEl.scrollTop : window.scrollY || 0;
      if (sy > (s.H / s.dpr) * 1.25) return;

      const tx = s.m.on ? s.m.nx : reduce ? 0 : Math.sin(now / 2800) * 0.28;
      const ty = s.m.on ? s.m.ny : reduce ? 0 : Math.cos(now / 3400) * 0.2;
      const e = 1 - Math.pow(0.9, dt);

      s.m.sx += (tx - s.m.sx) * e;
      s.m.sy += (ty - s.m.sy) * e;

      // Parallax image displacement based on mouse movement & scroll
      s.X0 = Math.min(0, Math.max(s.W - s.dw, s.dx - s.m.sx * 38 * s.dpr));
      s.Y0 = Math.min(0, Math.max(s.H - s.dh, s.dy - s.m.sy * 26 * s.dpr + sy * 0.16 * s.dpr));

      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;

      // Render high-res user image with subtle warm contrast tone
      ctx!.drawImage(s.img, s.X0, s.Y0, s.dw, s.dh);

      if (s.hx) {
        s.hx.globalCompositeOperation = "destination-out";
        s.hx.fillStyle = `rgba(0,0,0,${1 - Math.pow(0.955, dt)})`;
        s.hx.fillRect(0, 0, s.hole.width, s.hole.height);
        s.hx.globalCompositeOperation = "source-over";
      }

      // Where the cursor is, distort the image into scattered stardust particles!
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
        spawnParticles(s.m.x, s.m.y, Math.min(95, 14 + dist * 0.55) | 0, ddx, ddy, 2.4 * s.dpr);
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

      // Parallax coordinate movements on typography and geometry
      if (copy) {
        copy.style.transform = `translate3d(${s.m.sx * 18}px, ${s.m.sy * 14 - sy * 0.16}px, 0)`;
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
      spawnParticles(s.m.x, s.m.y, 260, 0, 0, 4.8 * s.dpr);
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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#07090a] text-[#efe6cf] selection:bg-[#efe6cf] selection:text-[#07090a]">
      {/* ===================== HERO SECTION ===================== */}
      <section
        id="hero"
        ref={heroRef}
        aria-label="PIXAR Hero Section"
        className="relative min-h-[94svh] lg:min-h-[100svh] w-full overflow-hidden bg-[#07090a] text-[#efe6cf] isolation-isolate touch-pan-y cursor-crosshair select-none flex flex-col justify-between"
      >
        {/* Interactive Canvas with Parallax & Particle Distortion */}
        <canvas
          id="c"
          ref={canvasRef}
          aria-label="Celestial sleeping face and mountains art canvas with interactive particle scatter"
          className="absolute inset-0 block h-full w-full opacity-0 transition-opacity duration-1000 ease-out"
        />

        {/* Ink Black Scrims - Strictly Ink Black & Warm Ivory */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(90deg, rgba(7,9,10,0.92) 0%, rgba(7,9,10,0.68) 36%, rgba(7,9,10,0.18) 64%, transparent 84%), linear-gradient(0deg, rgba(7,9,10,0.97) 0%, rgba(7,9,10,0.45) 32%, transparent 64%)",
          }}
        />

        {/* Radial Depth Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: "radial-gradient(ellipse at 72% 44%, transparent 34%, rgba(7,9,10,0.85) 86%)",
          }}
        />

        {/* Parallax Floating Astral Rings & Warm Ivory Dots */}
        <div ref={floatRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
          {/* Ring 1 - Device Substrate Orbit */}
          <div
            className="f absolute rounded-full border border-[#efe6cf]/35 will-change-transform"
            data-d="42"
            style={{ left: "10%", top: "18%", width: "116px", height: "116px" }}
          >
            <div className="absolute inset-2.5 rounded-full border border-dashed border-[#efe6cf]/20" />
            <span className="absolute -top-5 left-1 font-mono text-[9px] tracking-widest text-[#efe6cf]/40">
              SDG 12.5 • CIRCULARITY
            </span>
          </div>

          {/* Warm Ivory Dot */}
          <div
            className="f absolute rounded-full bg-[#efe6cf] shadow-[0_0_12px_rgba(239,230,207,0.8)] will-change-transform"
            data-d="66"
            style={{ left: "47%", top: "14%", width: "9px", height: "9px" }}
          />

          {/* Ring 2 - E-waste Recovery Rate Ring */}
          <div
            className="f absolute rounded-full border border-[#efe6cf]/25 will-change-transform"
            data-d="-34"
            style={{ right: "7%", top: "12%", width: "180px", height: "180px" }}
          >
            <span className="absolute -bottom-5 right-2 font-mono text-[10px] tracking-widest text-[#efe6cf]/40">
              16.0L TONNES E-WASTE / YR
            </span>
          </div>

          {/* Warm Ivory Nova Point */}
          <div
            className="f absolute rounded-full bg-[#f4ede0] shadow-[0_0_18px_rgba(239,230,207,0.9)] will-change-transform"
            data-d="-54"
            style={{ left: "80%", top: "68%", width: "14px", height: "14px" }}
          >
            <span className="absolute -top-4 -right-1 font-mono text-[9px] tracking-widest text-[#efe6cf]/50">
              AUDITED EPR
            </span>
          </div>

          {/* Ring 3 */}
          <div
            className="f absolute rounded-full border border-[#efe6cf]/30 will-change-transform"
            data-d="52"
            style={{ left: "28%", top: "56%", width: "52px", height: "52px" }}
          />

          {/* Recovery Metric Marking */}
          <div
            className="f absolute font-mono text-[10px] tracking-widest text-[#efe6cf]/35 will-change-transform"
            data-d="20"
            style={{ right: "16%", top: "35%" }}
          >
            [ REUSE SCORE : 94% ]
          </div>
        </div>

        {/* ===================== PIXAR HERO NAVIGATION ===================== */}
        <header className="relative z-[4] flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16 border-b border-[#efe6cf]/10 bg-[#07090a]/50 backdrop-blur-md">
          {/* Wordmark & Brand Identity */}
          <div className="flex items-center gap-3">
            <a
              href="#hero"
              className="group flex items-center gap-2.5 text-decoration-none focus:outline-none"
            >
              <span
                style={{ fontFamily: "var(--serif)" }}
                className="text-2xl sm:text-3xl tracking-tight text-[#efe6cf] transition-opacity duration-200 group-hover:opacity-85"
              >
                PIXAR
              </span>
              <span className="hidden sm:inline-block rounded-full border border-[#efe6cf]/25 px-2.5 py-0.5 font-sans text-[11px] font-medium tracking-wide text-[#efe6cf]/70">
                AI REUSE PLATFORM
              </span>
            </a>
          </div>

          {/* Navigation Links Adjusted to PIXAR Context */}
          <nav className="flex items-center gap-5 sm:gap-8 font-sans text-sm font-medium text-[#efe6cf]/80">
            <a
              href="#next"
              onClick={(e) => {
                e.preventDefault();
                scrollToNext();
              }}
              className="hidden md:inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#efe6cf] hover:underline underline-offset-8"
            >
              <Compass className="size-3.5 opacity-70" />
              <span>Blueprint</span>
            </a>
            <button
              type="button"
              onClick={() => go("/demo/scan")}
              className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#efe6cf] hover:underline underline-offset-8"
            >
              <Play className="size-3.5 opacity-70" />
              <span>AI Scanner</span>
            </button>
            <button
              type="button"
              onClick={() => go("/cover")}
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

        {/* ===================== PIXAR HERO COPY ===================== */}
        <div
          ref={copyRef}
          className="copy relative z-[3] px-6 sm:px-10 lg:px-16 pt-10 pb-12 max-w-[860px] will-change-transform"
        >
          {/* Eyebrow & Mode Pill */}
          <div className="mb-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#efe6cf]/30 bg-[#07090a]/60 px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-[#efe6cf]/90 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-[#efe6cf] animate-pulse" />
              SDG 12 • Reclaiming Dormant Silicon
            </span>

            {/* Context Mode Toggle */}
            <div className="inline-flex rounded-full border border-[#efe6cf]/20 bg-[#07090a]/80 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setHeadlineMode("pixar")}
                className={`rounded-full px-3 py-1 transition-all duration-200 ${
                  headlineMode === "pixar"
                    ? "bg-[#efe6cf] text-[#07090a] font-semibold"
                    : "text-[#efe6cf]/60 hover:text-[#efe6cf]"
                }`}
              >
                PIXAR Substrate
              </button>
              <button
                type="button"
                onClick={() => setHeadlineMode("poetic")}
                className={`rounded-full px-3 py-1 transition-all duration-200 ${
                  headlineMode === "poetic"
                    ? "bg-[#efe6cf] text-[#07090a] font-semibold"
                    : "text-[#efe6cf]/60 hover:text-[#efe6cf]"
                }`}
              >
                Dream Map
              </button>
            </div>
          </div>

          {/* Colossal Display Title in Instrument Serif */}
          <h1
            style={{ fontFamily: "var(--serif)" }}
            className="text-balance text-[clamp(3.6rem,8.4vw,9.2rem)] font-normal leading-[0.92] tracking-[-0.025em] text-[#efe6cf]"
          >
            {headlineMode === "pixar" ? (
              <>
                <span>Scan it. Give it a</span>
                <span className="italic block font-serif">second life.</span>
              </>
            ) : (
              <>
                <span>Sleep between</span>
                <span className="italic block font-serif">worlds</span>
              </>
            )}
          </h1>

          {/* Context Subtitle */}
          <p className="mt-6 mb-10 max-w-[44ch] font-sans text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-[#efe6cf]/85">
            {headlineMode === "pixar"
              ? "PIXAR is an agentic AI assistant that appraises old electronics, routes recoverable motors, cameras, and rare metals into student maker labs, and certifies zero-landfill recycling."
              : "A slow map of the dreaming mind, drawn in ink, grain and warm ivory light. Touch the substrate to scatter memory into particles."}
          </p>

          {/* Call to Actions (Warm Ivory & Ink Black Only) */}
          <div className="flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={() => go("/demo/scan")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#efe6cf] bg-[#efe6cf] px-7 py-3.5 font-sans text-sm sm:text-base font-semibold text-[#07090a] shadow-[0_0_24px_rgba(239,230,207,0.25)] transition-all duration-200 hover:bg-[#faf5eb] hover:shadow-[0_0_32px_rgba(239,230,207,0.45)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Cpu className="size-4" />
              <span>Launch AI Device Scan</span>
            </button>

            <button
              type="button"
              onClick={() => go("/cover")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#efe6cf]/40 bg-[#07090a]/50 px-6 py-3.5 font-sans text-sm sm:text-base font-medium text-[#efe6cf] backdrop-blur-md transition-all duration-200 hover:border-[#efe6cf] hover:bg-[#efe6cf]/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="size-4" />
              <span>Open Pitch Deck (12 Chapters)</span>
            </button>

            <button
              type="button"
              onClick={scrollToNext}
              className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full border border-[#efe6cf]/25 bg-transparent px-5 py-3.5 font-sans text-sm font-medium text-[#efe6cf]/75 transition-all duration-200 hover:border-[#efe6cf]/60 hover:text-[#efe6cf]"
            >
              <span>Explore The Blueprint</span>
              <ArrowDown className="size-3.5" />
            </button>
          </div>
        </div>

        {/* ===================== INTERACTIVE BOTTOM HUD ===================== */}
        <div className="relative z-[3] flex flex-wrap items-center justify-between gap-4 border-t border-[#efe6cf]/10 bg-[#07090a]/80 px-6 py-3.5 sm:px-10 lg:px-16 backdrop-blur-md">
          {/* Interaction Guidance */}
          <div className="flex items-center gap-2 font-sans text-xs sm:text-sm text-[#efe6cf]/80">
            <Sparkles className="size-3.5 text-[#efe6cf]" />
            <span className="hidden sm:inline">
              Move cursor over the artwork to distort into particles • Drag to scatter • Click for burst
            </span>
            <span className="sm:hidden">Touch artwork to scatter into particles</span>
          </div>

          {/* Interactive Controls & Telemetry */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#efe6cf]/15 px-2.5 py-1 font-mono text-[11px] text-[#efe6cf]/70">
              <Activity className="size-3 text-[#efe6cf]/80" />
              <span>{isReady ? `Substrate Particles: ${particleCount.toLocaleString()} pts` : "Calibrating..."}</span>
            </div>

            <button
              type="button"
              onClick={() => triggerBurst(320, 5)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#efe6cf]/35 bg-[#07090a] px-3 py-1 font-sans text-xs font-medium text-[#efe6cf] transition-all hover:border-[#efe6cf] hover:bg-[#efe6cf]/10"
              title="Spawn an explosion of warm ivory particles"
            >
              <span>✦ Burst</span>
            </button>

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

      {/* ===================== LANDING PAGE NARRATIVE WITH COMPANION ART ===================== */}
      <div id="next" className="relative z-[10] border-t border-[#efe6cf]/15 bg-[#07090a] text-[#efe6cf]">
        {/* Section 1: The Circular Substrate (Illustrated with Companion Art 1) */}
        <section className="px-6 py-24 sm:px-10 lg:px-16 border-b border-[#efe6cf]/10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efe6cf]/20 bg-[#16181b] px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-[#efe6cf]/70">
              <span>I. THE PHYSICAL SUBSTRATE</span>
            </div>

            <div className="grid gap-12 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6">
                <h2
                  style={{ fontFamily: "var(--serif)" }}
                  className="text-balance text-[clamp(2.4rem,4.5vw,4.4rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#efe6cf]"
                >
                  Nothing is e-waste until attention is abandoned.
                </h2>
                <p className="mt-6 font-sans text-base sm:text-lg leading-relaxed text-[#efe6cf]/80">
                  India produces 16.0 lakh tonnes of e-waste every year. Discarded phones and laptops are not trash—they are compressed geologies of gold, silicon, lithium, and copper etched into circuit paths.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs text-[#efe6cf]/70">
                  <span className="rounded-lg border border-[#efe6cf]/15 bg-[#101214] px-3 py-1.5">
                    16.0L Tonnes/Yr
                  </span>
                  <span className="rounded-lg border border-[#efe6cf]/15 bg-[#101214] px-3 py-1.5">
                    78% Unaccounted
                  </span>
                  <span className="rounded-lg border border-[#efe6cf]/15 bg-[#101214] px-3 py-1.5">
                    94% Recoverable
                  </span>
                </div>
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => gotoChapter(1)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#efe6cf] hover:underline underline-offset-4"
                  >
                    <span>Read Problem Chapter</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Companion Artwork 1: Circuit Board Mountain Valley in Matching Linocut Style */}
              <div className="lg:col-span-6">
                <div className="group relative overflow-hidden rounded-2xl border border-[#efe6cf]/20 bg-[#101214] shadow-[0_0_30px_rgba(239,230,207,0.06)]">
                  <img
                    src={PIXAR_SUBSTRATE_ART}
                    alt="Cosmic linocut woodcut etching of circuit boards forming mountains and rivers under celestial moons"
                    className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090a]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#efe6cf]/70 backdrop-blur-sm bg-[#07090a]/60 px-3 py-1.5 rounded-lg border border-[#efe6cf]/15">
                    <span>CIRCUIT VALLEY SUBSTRATE</span>
                    <span>FIG 1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: The Campus Maker Loop (Illustrated with Companion Art 2) */}
        <section className="px-6 py-24 sm:px-10 lg:px-16 border-b border-[#efe6cf]/10 bg-[#07090a]/90">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efe6cf]/20 bg-[#16181b] px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-[#efe6cf]/70">
              <span>II. THE MAKER ECOSYSTEM</span>
            </div>

            <div className="grid gap-12 lg:grid-cols-12 items-center">
              {/* Companion Artwork 2: Mechanical Artisan Hands Assembling Micro-Motors */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="group relative overflow-hidden rounded-2xl border border-[#efe6cf]/20 bg-[#101214] shadow-[0_0_30px_rgba(239,230,207,0.06)]">
                  <img
                    src={PIXAR_MAKER_ART}
                    alt="Linocut etching of mechanical hands assembling electronic micro-components and motors under starry celestial skies"
                    className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090a]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#efe6cf]/70 backdrop-blur-sm bg-[#07090a]/60 px-3 py-1.5 rounded-lg border border-[#efe6cf]/15">
                    <span>CAMPUS MAKER LAB APPARATUS</span>
                    <span>FIG 2.0</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2">
                <h2
                  style={{ fontFamily: "var(--serif)" }}
                  className="text-balance text-[clamp(2.4rem,4.5vw,4.4rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#efe6cf]"
                >
                  Salvaged parts power
                  <span className="italic block font-serif">student inventions.</span>
                </h2>
                <p className="mt-6 font-sans text-base sm:text-lg leading-relaxed text-[#efe6cf]/80">
                  Engineering students buy expensive toy motors and camera modules online while functional parts sit trapped in discarded phones on the same campus. PIXAR unlocks them directly for maker labs.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => go("/demo/scan")}
                    className="rounded-full bg-[#efe6cf] px-6 py-3 font-sans text-sm font-semibold text-[#07090a] transition-all hover:bg-[#faf6ee] hover:scale-[1.02]"
                  >
                    Simulate Live Appraisal
                  </button>
                  <button
                    type="button"
                    onClick={() => gotoChapter(4)}
                    className="rounded-full border border-[#efe6cf]/30 px-6 py-3 font-sans text-sm font-medium text-[#efe6cf] transition-all hover:border-[#efe6cf]"
                  >
                    Explore Value Prop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Circular Verification Seal (Illustrated with Companion Art 3) */}
        <section className="px-6 py-24 sm:px-10 lg:px-16 border-b border-[#efe6cf]/10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#efe6cf]/20 bg-[#16181b] px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-[#efe6cf]/70">
              <span>III. VERIFIED PROOF OF CIRCULARITY</span>
            </div>

            <div className="grid gap-12 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6">
                <h2
                  style={{ fontFamily: "var(--serif)" }}
                  className="text-balance text-[clamp(2.4rem,4.5vw,4.4rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[#efe6cf]"
                >
                  Certified logistics.
                  <span className="italic block font-serif">Tamper-proof accountability.</span>
                </h2>
                <p className="mt-6 font-sans text-base sm:text-lg leading-relaxed text-[#efe6cf]/80">
                  Doorstep pickups are booked with certified recycling partners. Users and institutions receive an immutable QR-sealed certificate documenting avoided carbon and EPR compliance.
                </p>
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => go("/demo/certificate")}
                    className="inline-flex items-center gap-2 rounded-full border border-[#efe6cf] bg-[#efe6cf] px-6 py-3 font-sans text-sm font-semibold text-[#07090a] transition-all hover:bg-[#faf5eb]"
                  >
                    <ShieldCheck className="size-4" />
                    <span>View Sample Certificate</span>
                  </button>
                </div>
              </div>

              {/* Companion Artwork 3: Sacred Circular Mandala & Certificate Seal */}
              <div className="lg:col-span-6">
                <div className="group relative overflow-hidden rounded-2xl border border-[#efe6cf]/20 bg-[#101214] shadow-[0_0_30px_rgba(239,230,207,0.06)]">
                  <img
                    src={PIXAR_SEAL_ART}
                    alt="Sacred circular mandala of electronic circularity and sustainability seal in cosmic woodcut style"
                    className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090a]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#efe6cf]/70 backdrop-blur-sm bg-[#07090a]/60 px-3 py-1.5 rounded-lg border border-[#efe6cf]/15">
                    <span>EPR VERIFICATION SEAL</span>
                    <span>FIG 3.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Blueprint & Complete Deck Directory */}
        <section className="px-6 py-20 sm:px-10 lg:px-16 bg-[#07090a]">
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#efe6cf]/20 bg-[#101214] p-8 sm:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#efe6cf]/10 pb-8">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#efe6cf]/60">
                  SYSTEM BLUEPRINT
                </span>
                <h3 style={{ fontFamily: "var(--serif)" }} className="mt-2 text-3xl font-normal text-[#efe6cf]">
                  Deployable Offline Pitch Deck
                </h3>
                <p className="mt-2 text-sm text-[#efe6cf]/70 max-w-xl font-sans">
                  Built for the IBM SkillsBuild Masterclass pitch. Jump directly into any slide, launch the live camera simulation, or view the Lean Canvas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => go("/cover")}
                  className="rounded-full bg-[#efe6cf] px-6 py-2.5 text-xs font-semibold text-[#07090a] transition-all hover:bg-[#faf5eb]"
                >
                  Cover Presentation Slide
                </button>
                <button
                  type="button"
                  onClick={() => go("/canvas")}
                  className="rounded-full border border-[#efe6cf]/30 px-6 py-2.5 text-xs font-medium text-[#efe6cf] transition-all hover:border-[#efe6cf]"
                >
                  Lean Canvas (1-Page)
                </button>
              </div>
            </div>

            {/* Fast chapter tiles */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { num: "01", label: "Cover Slide", path: "/cover" },
                { num: "02", label: "Problem Size", route: 1 },
                { num: "03", label: "Alternatives", route: 2 },
                { num: "04", label: "Customer Segments", route: 3 },
                { num: "05", label: "Value Proposition", route: 4 },
                { num: "06", label: "Solution & Demo", route: 5 },
                { num: "07", label: "Distribution Channels", route: 6 },
                { num: "08", label: "Revenue Model", route: 7 },
                { num: "09", label: "Cost Structure", route: 8 },
                { num: "10", label: "Key Metrics", route: 9 },
                { num: "11", label: "Unfair Advantage", route: 10 },
                { num: "12", label: "SDG 12 Roadmap", route: 11 },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => (item.path ? go(item.path) : gotoChapter(item.route!))}
                  className="group rounded-xl border border-[#efe6cf]/10 bg-[#07090a] p-3.5 text-left transition-all hover:border-[#efe6cf]/40 hover:bg-[#16181b]"
                >
                  <p className="font-mono text-[10px] text-[#efe6cf]/40 group-hover:text-[#efe6cf]/70">
                    {item.num}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#efe6cf]/80 group-hover:text-[#efe6cf]">
                    {item.label}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-[#efe6cf]/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#efe6cf]/50">
              <p>PIXAR • College Pitch Prototype • SDG 12 Responsible Consumption</p>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-[#efe6cf] transition-colors"
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
