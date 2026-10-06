import type { DeviceKind, RouteId } from "@/data/types";
import type { Appraisal } from "./appraise";

export const CO2E_DISCLAIMER =
  "Illustrative estimate. Replace with sourced life-cycle values before making any real claim.";

/** PLACEHOLDER assumption: embodied carbon per device in kg CO2e. Not a sourced figure. */
export const EMBODIED_CARBON_KG: Record<DeviceKind, number> = { phone: 55, laptop: 250 };

/** PLACEHOLDER assumption: share of embodied carbon kept by each route. Not a sourced figure. */
export const ROUTE_FACTOR: Record<RouteId, number> = {
  repair: 0.35,
  resell: 0.45,
  donate: 0.45,
  parts: 0.15,
  recycle: 0.05,
};

export interface Impact {
  kgDiverted: number;
  embodiedCarbonKg: number;
  routeFactor: number;
  co2eAvoidedKg: number;
}

export function computeImpact(kind: DeviceKind, route: RouteId, weightKg: number): Impact {
  const embodiedCarbonKg = EMBODIED_CARBON_KG[kind];
  const routeFactor = ROUTE_FACTOR[route];
  return { kgDiverted: weightKg, embodiedCarbonKg, routeFactor, co2eAvoidedKg: embodiedCarbonKg * routeFactor };
}

/** Illustrative rupee value kept in use. Whole-device routes keep the mid value; parts keep reserved parts; recycling keeps none. */
export function valueKeptInUse(a: Appraisal, route: RouteId, reservedIds: string[]): number {
  const mid = (v: [number, number]) => (v[0] + v[1]) / 2;
  if (route === "recycle") return 0;
  if (route === "parts") {
    return a.items.filter((i) => reservedIds.includes(i.def.id)).reduce((s, i) => s + mid(i.def.valueINR), 0);
  }
  return mid(a.valueRange);
}
