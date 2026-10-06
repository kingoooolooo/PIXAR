import { EMBODIED_CARBON_KG, ROUTE_FACTOR } from "@/engine/impact";
import type { RouteId } from "@/data/types";

/** 90-day pilot targets. Illustrative, not results. */
export const PILOT = {
  devicesScanned: 1200,
  conversion: 0.45,
  studentParts: 300,
  onTime: 0.9,
  institutions: 6,
  repeat: 0.3,
  nps: 50,
  replyMinutes: 30,
};

export const ROUTE_MIX: Record<RouteId, number> = {
  repair: 0.28,
  resell: 0.14,
  donate: 0.17,
  parts: 0.12,
  recycle: 0.29,
};

/** 12-week scans curve. Sums to the 1,200 device target. */
export const WEEKLY_SCANS = [30, 45, 60, 75, 90, 100, 110, 120, 130, 140, 150, 150];

export const LEADERBOARD = [
  { name: "Block C Hostel", devices: 96 },
  { name: "Eco Club", devices: 81 },
  { name: "Maker Society", devices: 74 },
  { name: "Sunrise Residents Society", devices: 63 },
  { name: "Block A Hostel", devices: 52 },
];

/** Assumption for deriving kg and CO2e: 70% phones, 30% laptops. */
const PHONE_SHARE = 0.7;
const PHONE_KG = 0.17;
const LAPTOP_KG = 2.1;

export function pilotDerived() {
  const pickups = Math.round(PILOT.devicesScanned * PILOT.conversion);
  const avgKg = PHONE_SHARE * PHONE_KG + (1 - PHONE_SHARE) * LAPTOP_KG;
  const avgCarbon = PHONE_SHARE * EMBODIED_CARBON_KG.phone + (1 - PHONE_SHARE) * EMBODIED_CARBON_KG.laptop;
  const mixFactor = (Object.keys(ROUTE_MIX) as RouteId[]).reduce((s, r) => s + ROUTE_MIX[r] * ROUTE_FACTOR[r], 0);
  return {
    pickups,
    kgDiverted: Math.round(pickups * avgKg),
    co2eKg: Math.round(pickups * avgCarbon * mixFactor),
    reuseRate: ROUTE_MIX.repair + ROUTE_MIX.resell + ROUTE_MIX.donate,
  };
}
