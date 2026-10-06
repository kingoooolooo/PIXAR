import { useId, type CSSProperties, type ReactNode } from "react";
import { componentsFor, VIEWBOX } from "@/data/components";
import type { ComponentDef, DeviceKind, Status } from "@/data/types";

/** Isometric-style projection shared by every part, so layers read as floating parallel plates. */
const ISO = "matrix(0.9 0.42 -0.9 0.42 0 0)";
const STACK: Record<DeviceKind, { x: number; y: number }> = { phone: { x: 210, y: 250 }, laptop: { x: 260, y: 250 } };

function Glyph({ d }: { d: ComponentDef }) {
  const { w, h } = d.size;
  const x = -w / 2;
  const y = -h / 2;
  switch (d.glyph) {
    case "screen":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} rx={8} />
          <rect x={x + 7} y={y + 12} width={w - 14} height={h - 24} rx={3} />
          <rect x={-8} y={y + 4} width={16} height={3} rx={1.5} />
        </>
      );
    case "battery":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} rx={5} />
          <rect x={w > h ? x + w : -6} y={w > h ? -5 : y - 4} width={w > h ? 4 : 12} height={w > h ? 10 : 4} rx={1} />
          <line x1={w > h ? 0 : x + 8} y1={w > h ? y + 5 : 0} x2={w > h ? 0 : -x - 8} y2={w > h ? -y - 5 : 0} />
          <path d={w > h ? `M ${x + 10} -4 v 8 M ${x + 6} 0 h 8` : `M -4 ${y + 14} h 8 M 0 ${y + 10} v 8`} />
        </>
      );
    case "board":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} rx={4} />
          <rect x={x + w * 0.12} y={y + h * 0.12} width={w * 0.34} height={h * 0.2} rx={2} />
          <rect x={x + w * 0.52} y={y + h * 0.4} width={w * 0.3} height={h * 0.22} rx={2} />
          <rect x={x + w * 0.14} y={y + h * 0.58} width={w * 0.24} height={h * 0.14} rx={2} />
          <rect x={x + w * 0.5} y={y + h * 0.74} width={w * 0.34} height={h * 0.1} rx={2} />
          <path d={`M ${x + w * 0.46} ${y + h * 0.22} h ${w * 0.2} v ${h * 0.18} M ${x + w * 0.3} ${y + h * 0.32} v ${h * 0.26}`} />
        </>
      );
    case "frame":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} rx={12} />
          <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={7} strokeDasharray="3 4" />
          <rect x={-10} y={-y - 6} width={20} height={4} rx={2} />
          <line x1={x} y1={y + h * 0.3} x2={x + 6} y2={y + h * 0.3} />
        </>
      );
    case "camera":
      return (
        <>
          <circle r={w / 2} />
          <circle r={w * 0.32} />
          <circle r={w * 0.12} />
        </>
      );
    case "motor":
      return (
        <>
          <circle r={w / 2} />
          <rect x={-w * 0.12} y={-h * 0.34} width={w * 0.5} height={h * 0.3} rx={3} />
          <circle r={w * 0.1} />
        </>
      );
    case "speaker":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} rx={h / 2} />
          {[-0.28, 0, 0.28].map((k) => (
            <circle key={k} cx={w * k} cy={0} r={h * 0.12} />
          ))}
        </>
      );
    case "keyboard": {
      const cells: ReactNode[] = [];
      const cols = 10;
      const rows = 4;
      const cw = (w - 14) / cols;
      const ch = (h - 30) / rows;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          cells.push(<rect key={`${r}-${c}`} x={x + 7 + c * cw} y={y + 7 + r * ch} width={cw - 2.5} height={ch - 2.5} rx={1.5} />);
      return (
        <>
          <rect x={x} y={y} width={w} height={h} rx={6} />
          {cells}
          <rect x={-w * 0.18} y={y + h - 20} width={w * 0.36} height={13} rx={3} />
        </>
      );
    }
    case "ram":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} rx={2} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={x + 6 + i * (w - 12) / 4} y={y + 3} width={(w - 12) / 4 - 3} height={h - 6} rx={1} />
          ))}
        </>
      );
    case "drive":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} rx={6} />
          <circle r={w * 0.34} />
          <circle r={w * 0.08} />
          <path d={`M ${x + w * 0.85} ${y + 6} L ${w * 0.05} ${h * 0.05}`} />
        </>
      );
    case "fan":
      return (
        <>
          <circle r={w / 2} />
          {[0, 90, 180, 270].map((a) => (
            <ellipse key={a} cx={w * 0.2} cy={0} rx={w * 0.2} ry={w * 0.08} transform={`rotate(${a})`} />
          ))}
          <circle r={w * 0.08} />
        </>
      );
  }
}

interface Props {
  kind: DeviceKind;
  /** 0 = parts stacked together, 1 = fully exploded. */
  explode?: number;
  activeId?: string | null;
  onActive?: (id: string | null) => void;
  /** Number of hotspots to show, or "all". */
  hotspots?: number | "all";
  labels?: boolean;
  /** Hotspots become focusable buttons. */
  interactive?: boolean;
  statuses?: Record<string, Status>;
  className?: string;
  label: string;
  children?: ReactNode;
}

export function DeviceIllustration({
  kind,
  explode = 1,
  activeId = null,
  onActive,
  hotspots = 0,
  labels = false,
  interactive = false,
  statuses,
  className,
  label,
  children,
}: Props) {
  const defs = componentsFor(kind);
  const vb = VIEWBOX[kind];
  const stack = STACK[kind];
  const e = Math.max(0, Math.min(1, explode));
  const hatchId = `hatch${useId().replace(/:/g, "")}`;
  const pos = (d: ComponentDef) => ({ x: stack.x + (d.hotspot.x - stack.x) * e, y: stack.y + (d.hotspot.y - stack.y) * e });
  const board = defs.find((d) => d.role === "board");
  const boardPos = board ? pos(board) : stack;
  const shown = hotspots === "all" ? defs.length : hotspots;

  return (
    <svg viewBox={`0 0 ${vb.w} ${vb.h}`} className={`il ${className ?? ""}`} role="img" aria-label={label}>
      <defs>
        <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ivory)" strokeWidth="2" opacity="0.7" />
        </pattern>
      </defs>

      {/* leader lines for small parts */}
      <g stroke="var(--ivory)" strokeWidth="1" strokeDasharray="2 5" opacity={0.35 * e} fill="none">
        {defs
          .filter((d) => d.role === "other" && d.size.w <= 64)
          .map((d) => {
            const p = pos(d);
            return <line key={d.id} x1={p.x} y1={p.y} x2={boardPos.x} y2={boardPos.y} />;
          })}
      </g>

      {[...defs].reverse().map((d) => {
        const p = pos(d);
        const active = activeId === d.id;
        const dim = activeId !== null && !active;
        const hazard = statuses?.[d.id] === "hazardous";
        const style: CSSProperties = {
          transform: `translate(${p.x}px, ${p.y}px)`,
          opacity: dim ? 0.4 : 1,
        };
        return (
          <g key={d.id} className="il-part" style={style} onMouseEnter={() => onActive?.(d.id)} onMouseLeave={() => onActive?.(null)}>
            <g
              transform={ISO}
              strokeWidth={active ? 2 : 1.25}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                fill: hazard ? `url(#${hatchId})` : active ? "color-mix(in srgb, var(--surface-1) 75%, var(--teal) 25%)" : "var(--surface-1)",
                stroke: active ? "var(--teal)" : "var(--ivory)",
              }}
            >
              <Glyph d={d} />
            </g>
          </g>
        );
      })}

      {defs.slice(0, shown).map((d) => {
        const p = pos(d);
        const active = activeId === d.id;
        // keep labels inside the viewBox: parts near an edge label toward the centre
        const left = p.x < 110 ? false : p.x > vb.w - 110 ? true : p.x < vb.w / 2;
        return (
          <g
            key={d.id}
            className={interactive ? "il-hot" : undefined}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? "button" : undefined}
            aria-label={interactive ? d.name : undefined}
            onFocus={interactive ? () => onActive?.(d.id) : undefined}
            onBlur={interactive ? () => onActive?.(null) : undefined}
            onMouseEnter={interactive ? () => onActive?.(d.id) : undefined}
            onMouseLeave={interactive ? () => onActive?.(null) : undefined}
          >
            <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
            <circle className="hs-ring" cx={p.x} cy={p.y} r={5} fill="none" stroke="var(--teal)" strokeWidth={1.5} />
            <circle cx={p.x} cy={p.y} r={active ? 6.5 : 4.5} fill="var(--teal)" stroke="var(--ink)" strokeWidth={1.5} />
            {labels && (
              <text
                x={p.x + (left ? -12 : 12)}
                y={p.y + 4}
                textAnchor={left ? "end" : "start"}
                fontSize={12}
                fontWeight={500}
                style={{ fill: "var(--ivory)", stroke: "var(--ink)", strokeWidth: 3, paintOrder: "stroke" }}
              >
                {d.short}
              </text>
            )}
          </g>
        );
      })}
      {children}
    </svg>
  );
}
