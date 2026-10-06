import type { RouteId } from "@/data/types";
import type { Appraisal } from "./appraise";

export const ROUTE_ORDER: RouteId[] = ["repair", "resell", "donate", "parts", "recycle"];

export const ROUTE_META: Record<RouteId, { name: string; blurb: string }> = {
  repair: { name: "Repair", blurb: "Fix the fault and keep the whole device in use." },
  resell: { name: "Refurbish and resell", blurb: "Clean, test and sell it on to a new owner." },
  donate: { name: "Donate", blurb: "Give it to a school lab or learning programme." },
  parts: { name: "Student parts", blurb: "Salvage motors, sensors and speakers for college projects." },
  recycle: { name: "Certified recycling", blurb: "Recover materials safely through a certified recycler." },
};

export interface RouteScore {
  id: RouteId;
  score: number;
  reason: string;
  enabled: boolean;
  disabledReason?: string;
}

export const NEEDS_WORKING = "Needs a working device";
export const SWOLLEN_RULE = "Swollen batteries are a fire risk. Only a certified recycler should handle this device.";

/**
 * Route decision table (all four rows are covered by tests):
 * - swollen or hot battery: recycle only, all others disabled
 * - does not power on: parts first, recycle second, repair/resell/donate disabled
 * - powers on, screen cracked: repair first, resell second
 * - powers on, screen fine: donate (laptop) or resell (phone) first, then repair, parts, recycle
 */
export function rankRoutes(a: Appraisal): RouteScore[] {
  const c = a.conditions;
  const laptop = a.kind === "laptop";
  const bonus = c.battery === "good" ? 4 : 0;
  const out: Record<RouteId, RouteScore> = {
    repair: { id: "repair", score: 0, reason: "", enabled: true },
    resell: { id: "resell", score: 0, reason: "", enabled: true },
    donate: { id: "donate", score: 0, reason: "", enabled: true },
    parts: { id: "parts", score: 0, reason: "", enabled: true },
    recycle: { id: "recycle", score: 0, reason: "", enabled: true },
  };
  const set = (id: RouteId, score: number, reason: string) => {
    out[id] = { id, score: Math.min(99, score), reason, enabled: true };
  };
  const disable = (id: RouteId, why: string) => {
    out[id] = { id, score: 0, reason: why, enabled: false, disabledReason: why };
  };

  if (c.battery === "swollen") {
    set("recycle", 95, "A swollen or hot battery is a fire risk. Only a certified recycler handles it safely.");
    (["repair", "resell", "donate", "parts"] as RouteId[]).forEach((id) => disable(id, SWOLLEN_RULE));
  } else if (c.power === "off") {
    set("parts", 90, "It will not power on, so its motors, sensors and speakers are worth more as parts.");
    set("recycle", 70, "The remainder can be recovered safely by a certified recycler.");
    (["repair", "resell", "donate"] as RouteId[]).forEach((id) => disable(id, NEEDS_WORKING));
  } else if (c.screen === "cracked") {
    set("repair", 90 + Math.min(bonus, 4), "Only the glass is broken. A screen swap restores the whole device.");
    set("resell", 78 + bonus, "After repair it can be refurbished and sold.");
    set("donate", laptop ? 66 : 58, "A cracked screen makes it a poor fit for a school lab.");
    set("parts", 55, "Working parts could go to students, but the device is worth more repaired.");
    set("recycle", 35, "Recycling wastes a device that still works.");
  } else {
    set(
      "donate",
      (laptop ? 92 : 66) + (laptop ? bonus : 0),
      laptop ? "A working laptop is exactly what school labs need." : "A working phone can reach a learner who needs one."
    );
    set("resell", (laptop ? 74 : 92) + (laptop ? 0 : bonus), laptop ? "It still has resale value after a clean and test." : "A working phone has strong resale value after a clean and test.");
    set("repair", 80, "A tired battery or small fault can be fixed to extend its life.");
    set("parts", 52, "Parts can go to students, but whole-device reuse keeps more value.");
    set("recycle", 30, "Recycling is the last resort for a device that works.");
  }

  return ROUTE_ORDER.map((id) => out[id]).sort((x, y) => {
    if (x.enabled !== y.enabled) return x.enabled ? -1 : 1;
    if (y.score !== x.score) return y.score - x.score;
    return ROUTE_ORDER.indexOf(x.id) - ROUTE_ORDER.indexOf(y.id);
  });
}

export function whyRoute(a: Appraisal, route: RouteId): string[] {
  const reusable = a.items.filter((i) => i.status === "reusable").length;
  const student = a.items.filter((i) => i.def.studentUse && i.status !== "hazardous").length;
  const c = a.conditions;
  switch (route) {
    case "parts":
      return [
        c.power === "off" ? "The device does not power on, so whole-device routes are closed." : "The device is still worth more as a whole, so this is a choice, not a default.",
        `${student} components have a clear use in student projects.`,
        "A certified recycler takes the non-reusable remainder, so nothing is wasted.",
      ];
    case "recycle":
      return [
        c.battery === "swollen" ? "A swollen or hot battery is a fire risk, so this is the only safe route." : "Recycling recovers metals and keeps hazardous parts out of landfill.",
        "A certified recycler provides documented handling.",
        "You receive a Second-Life Certificate for the device.",
      ];
    case "repair":
      return [
        c.screen === "cracked" ? "Only the screen is damaged, which is a routine repair." : "A small fault is cheaper to fix than to replace.",
        `${reusable} of ${a.items.length} components are already reusable.`,
        "Repair keeps the most embodied carbon in use among the working routes.",
      ];
    case "resell":
      return [
        `Reuse score of ${a.score} means strong resale value.`,
        "A refurbisher cleans, tests and warranties it for the next owner.",
        "Value stays in use instead of leaving as scrap.",
      ];
    case "donate":
      return [
        "The device powers on and works for everyday school tasks.",
        "School labs and NGOs can put it in front of learners quickly.",
        "Data is wiped before the handover.",
      ];
  }
}
