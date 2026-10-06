import type { KeyboardEvent } from "react";
import { DEMO_CONFIG } from "@/content/config";
import type { Partner } from "@/data/types";

const W = 640;
const H = 440;
const C = { x: 320, y: 220 };
const PX_PER_KM = 20;
const AREA_POS = [
  { x: 120, y: 64 },
  { x: 530, y: 74 },
  { x: 540, y: 400 },
  { x: 100, y: 396 },
];

const at = (p: Partner) => ({
  x: C.x + p.distanceKm * PX_PER_KM * Math.cos((p.angle * Math.PI) / 180),
  y: C.y + p.distanceKm * PX_PER_KM * Math.sin((p.angle * Math.PI) / 180),
});

/** Stylised, abstract map: distance rings, a few streets and partner pins. No real map tiles. */
export function CityMap({
  partners,
  matchedIds,
  selectedId,
  hoverId,
  onHover,
  onSelect,
}: {
  partners: Partner[];
  matchedIds: string[];
  selectedId: string | null;
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const key = (id: string) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="group" aria-label={`Stylised map of ${DEMO_CONFIG.city} with distance rings and partner pins`}>
      {/* streets */}
      <g stroke="var(--line)" strokeWidth="1" fill="none">
        <path d="M0 150 C 160 130, 300 190, 640 120" />
        <path d="M0 310 C 200 330, 380 270, 640 330" />
        <path d="M200 0 C 220 140, 180 300, 230 440" />
        <path d="M430 0 C 410 120, 470 300, 420 440" />
        <path d="M0 230 H 640" strokeDasharray="2 8" />
        <path d="M320 0 V 440" strokeDasharray="2 8" />
      </g>
      {DEMO_CONFIG.mapAreas.slice(0, 4).map((a, i) => (
        <text key={a} x={AREA_POS[i].x} y={AREA_POS[i].y} textAnchor="middle" fontSize="12" style={{ fill: "var(--text-muted)" }}>
          {a}
        </text>
      ))}
      {/* distance rings */}
      {[3, 6, 9].map((km) => (
        <g key={km}>
          <circle cx={C.x} cy={C.y} r={km * PX_PER_KM} fill="none" stroke="var(--ivory)" strokeOpacity="0.22" strokeDasharray="4 6" />
          <text x={C.x + km * PX_PER_KM + 4} y={C.y - 4} fontSize="11" style={{ fill: "var(--text-muted)" }}>
            {km} km
          </text>
        </g>
      ))}

      {/* partner pins */}
      {partners.map((p) => {
        const { x, y } = at(p);
        const matched = matchedIds.includes(p.id);
        const selected = selectedId === p.id;
        const hot = hoverId === p.id || selected;
        const left = x < C.x;
        if (!matched) {
          return <circle key={p.id} cx={x} cy={y} r={4} fill="none" stroke="var(--ivory)" strokeOpacity="0.35" />;
        }
        return (
          <g
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={`${p.name}, ${p.distanceKm} km`}
            aria-pressed={selected}
            className="il-hot"
            onMouseEnter={() => onHover(p.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(p.id)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(p.id)}
            onKeyDown={key(p.id)}
          >
            <circle cx={x} cy={y} r={20} fill="transparent" />
            {hot && <circle cx={x} cy={y} r={15} fill="none" stroke="var(--teal)" strokeWidth="1.5" />}
            <circle cx={x} cy={y} r={9} style={{ fill: selected ? "var(--teal)" : "var(--ink)", stroke: "var(--teal)", strokeWidth: 2 }} />
            {selected && <path d={`M ${x - 4} ${y} l 3 3 l 5 -6`} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
            <text
              x={x + (left ? -16 : 16)}
              y={y + 4}
              textAnchor={left ? "end" : "start"}
              fontSize="12"
              fontWeight="600"
              style={{ fill: "var(--ivory)", stroke: "var(--ink)", strokeWidth: 3.5, paintOrder: "stroke" }}
            >
              {p.name}
            </text>
          </g>
        );
      })}

      {/* you */}
      <g>
        <circle cx={C.x} cy={C.y} r={16} fill="none" stroke="var(--teal)" strokeWidth="1.5" opacity="0.5" />
        <path d={`M ${C.x - 12} ${C.y - 5} v -7 h 7 M ${C.x + 5} ${C.y - 12} h 7 v 7 M ${C.x + 12} ${C.y + 5} v 7 h -7 M ${C.x - 5} ${C.y + 12} h -7 v -7`} fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" />
        <circle cx={C.x} cy={C.y} r={4} fill="var(--teal)" />
        <text x={C.x} y={C.y + 32} textAnchor="middle" fontSize="12" fontWeight="600" style={{ fill: "var(--ivory)", stroke: "var(--ink)", strokeWidth: 3.5, paintOrder: "stroke" }}>
          You
        </text>
      </g>
    </svg>
  );
}
