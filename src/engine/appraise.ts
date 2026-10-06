import { componentsFor } from "@/data/components";
import type { ComponentDef, Conditions, DeviceKind, Status } from "@/data/types";

/** reuseScore = round(100 * sum(weight * factor(status))) */
export const STATUS_FACTOR: Record<Status, number> = {
  reusable: 1,
  repairable: 0.7,
  recyclable: 0.25,
  hazardous: 0,
};

/** valueRange = sum(valueINR * valueFactor(status)) */
export const VALUE_FACTOR: Record<Status, number> = {
  reusable: 1,
  repairable: 0.6,
  recyclable: 0.1,
  hazardous: 0,
};

export interface AppraisedComponent {
  def: ComponentDef;
  status: Status;
  value: [number, number];
  reason: string;
}

export interface ScoreFactor {
  id: string;
  name: string;
  direction: "adds" | "costs";
  points: number;
  reason: string;
}

export interface Appraisal {
  kind: DeviceKind;
  conditions: Conditions;
  items: AppraisedComponent[];
  score: number;
  valueRange: [number, number];
  weightKg: number;
  materials: string[];
  hazardous: boolean;
  factors: ScoreFactor[];
}

export function statusFor(def: ComponentDef, c: Conditions): Status {
  switch (def.role) {
    case "display":
      if (c.power === "off") return "recyclable";
      return c.screen === "cracked" ? "repairable" : "reusable";
    case "board":
      return c.power === "on" ? "reusable" : "recyclable";
    case "battery":
      if (c.battery === "good") return "reusable";
      return c.battery === "weak" ? "recyclable" : "hazardous";
    default:
      return def.defaultStatus;
  }
}

export function statusReason(def: ComponentDef, c: Conditions, status: Status): string {
  switch (def.role) {
    case "display":
      if (c.power === "off") return "The device does not power on, so the panel cannot be proven. It goes to recycling.";
      if (c.screen === "cracked") return "The glass is cracked. A replacement makes it good again.";
      return "The panel works and is the most valuable single part.";
    case "board":
      return c.power === "on"
        ? "The board powers on, so it can be reused or repaired."
        : "The board does not power on. It goes to recycling for its metals.";
    case "battery":
      if (c.battery === "good") return "The battery holds charge, so it can stay in use.";
      if (c.battery === "weak") return "The battery is weak. Replace it and send the old cell to a certified recycler.";
      return "The battery is swollen or hot. It is a fire risk and needs certified handling.";
    default:
      return status === "recyclable" ? "Not worth reusing. Recycled for its materials." : "Looks reusable as it is.";
  }
}

const roundTo10 = (n: number): number => Math.round(n / 10) * 10;

export function appraise(profile: { kind: DeviceKind; weightKg: number }, c: Conditions): Appraisal {
  const defs = componentsFor(profile.kind);
  const items: AppraisedComponent[] = defs.map((def) => {
    const status = statusFor(def, c);
    const vf = VALUE_FACTOR[status];
    return {
      def,
      status,
      value: [roundTo10(def.valueINR[0] * vf), roundTo10(def.valueINR[1] * vf)],
      reason: statusReason(def, c, status),
    };
  });

  const score = Math.round(100 * items.reduce((sum, i) => sum + i.def.weight * STATUS_FACTOR[i.status], 0));
  const valueRange: [number, number] = [
    roundTo10(items.reduce((s, i) => s + i.def.valueINR[0] * VALUE_FACTOR[i.status], 0)),
    roundTo10(items.reduce((s, i) => s + i.def.valueINR[1] * VALUE_FACTOR[i.status], 0)),
  ];

  const factors: ScoreFactor[] = items
    .map((i) => {
      const f = STATUS_FACTOR[i.status];
      const adds = f >= 0.7;
      const raw = adds ? i.def.weight * f : i.def.weight * (1 - f);
      return {
        id: i.def.id,
        name: i.def.short,
        direction: (adds ? "adds" : "costs") as "adds" | "costs",
        points: Math.round(raw * 100),
        raw,
        reason: i.reason,
      };
    })
    .sort((a, b) => b.raw - a.raw)
    .slice(0, 3)
    .map(({ raw: _raw, ...rest }) => rest);

  const materials = Array.from(new Set(defs.flatMap((d) => d.materials)));

  return {
    kind: profile.kind,
    conditions: c,
    items,
    score,
    valueRange,
    weightKg: profile.weightKg,
    materials,
    hazardous: c.battery === "swollen",
    factors,
  };
}

export const conditionSummary = (c: Conditions): string => {
  const power = c.power === "on" ? "Powers on" : "Does not power on";
  const screen = c.screen === "cracked" ? "cracked screen" : "screen fine";
  const battery = c.battery === "good" ? "battery holds charge" : c.battery === "weak" ? "weak battery" : "swollen or hot battery";
  return `${power}, ${screen}, ${battery}`;
};
