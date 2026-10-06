import { useId, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/hooks";

/** The signature animation: a teal beam sweeping down the viewBox. Loops on the Cover, plays once in the demo. */
export function ScanBeam({ w, h, running = true, loop = false, duration = 3.6 }: { w: number; h: number; running?: boolean; loop?: boolean; duration?: number }) {
  const reduced = useReducedMotion();
  const gid = `beam${useId().replace(/:/g, "")}`;
  if (reduced) return null;
  const style = {
    "--h": `${h}px`,
    animation: `beam-sweep ${duration}s linear ${loop ? "infinite" : "1 forwards"}`,
    animationPlayState: running ? "running" : "paused",
  } as CSSProperties;
  return (
    <g style={{ pointerEvents: "none" }} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--teal)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--teal)" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      <g style={style}>
        <rect x={0} y={-64} width={w} height={64} fill={`url(#${gid})`} />
        <rect x={0} y={-1.5} width={w} height={3} fill="var(--teal)" style={{ filter: "drop-shadow(0 0 6px var(--teal))" }} />
      </g>
    </g>
  );
}

/** Four corner brackets. They tighten when the scan locks on. */
export function ScanBrackets({ w, h, locked }: { w: number; h: number; locked: boolean }) {
  const L = 28;
  const inset = locked ? 10 : 0;
  const corners = [
    { x: 0, y: 0, sx: 1, sy: 1 },
    { x: w, y: 0, sx: -1, sy: 1 },
    { x: 0, y: h, sx: 1, sy: -1 },
    { x: w, y: h, sx: -1, sy: -1 },
  ];
  return (
    <g aria-hidden fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: locked ? "var(--teal)" : "color-mix(in srgb, var(--ivory) 40%, transparent)" }}>
      {corners.map((c, i) => (
        <path
          key={i}
          d={`M ${c.sx * L} 0 H 0 V ${c.sy * L}`}
          style={{ transform: `translate(${c.x + c.sx * inset}px, ${c.y + c.sy * inset}px)`, transition: "transform 0.6s var(--ease-out)" }}
        />
      ))}
    </g>
  );
}
