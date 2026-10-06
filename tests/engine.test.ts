import { describe, expect, it } from "vitest";
import { DEVICES } from "../src/data/devices";
import type { BatteryState, Conditions, DeviceKind, RouteId } from "../src/data/types";
import { appraise } from "../src/engine/appraise";
import { computeImpact } from "../src/engine/impact";
import { matchPartners, matchScore } from "../src/engine/match";
import { NEEDS_WORKING, rankRoutes, SWOLLEN_RULE } from "../src/engine/routes";
import { buildSlots } from "../src/engine/slots";
import { PARTNERS } from "../src/data/partners";

const KINDS: DeviceKind[] = ["phone", "laptop"];
const weight = (k: DeviceKind) => (k === "phone" ? 0.16 : 2.1);
const rank = (kind: DeviceKind, c: Conditions) => rankRoutes(appraise({ kind, weightKg: weight(kind) }, c));
const enabledIds = (kind: DeviceKind, c: Conditions): RouteId[] =>
  rank(kind, c)
    .filter((r) => r.enabled)
    .map((r) => r.id);

describe("reuse score and value", () => {
  it("scores a working phone with a good battery at 94", () => {
    const a = appraise({ kind: "phone", weightKg: 0.16 }, { power: "on", screen: "fine", battery: "good" });
    expect(a.score).toBe(94);
  });
  it("a swollen battery removes its share of the score", () => {
    const a = appraise({ kind: "phone", weightKg: 0.16 }, { power: "on", screen: "fine", battery: "swollen" });
    expect(a.score).toBe(82);
    expect(a.hazardous).toBe(true);
    expect(a.items.find((i) => i.def.role === "battery")?.status).toBe("hazardous");
  });
  it("applies display, board and battery status rules", () => {
    const off = appraise({ kind: "laptop", weightKg: 2.1 }, { power: "off", screen: "fine", battery: "weak" });
    expect(off.items.find((i) => i.def.role === "display")?.status).toBe("recyclable");
    expect(off.items.find((i) => i.def.role === "board")?.status).toBe("recyclable");
    const cracked = appraise({ kind: "phone", weightKg: 0.18 }, { power: "on", screen: "cracked", battery: "good" });
    expect(cracked.items.find((i) => i.def.role === "display")?.status).toBe("repairable");
    expect(cracked.items.find((i) => i.def.role === "battery")?.status).toBe("reusable");
  });
  it("hazardous parts carry no value", () => {
    const a = appraise({ kind: "phone", weightKg: 0.16 }, { power: "on", screen: "fine", battery: "swollen" });
    expect(a.items.find((i) => i.def.role === "battery")?.value).toEqual([0, 0]);
  });
});

describe("route decision table", () => {
  const batteries: BatteryState[] = ["good", "weak"];
  for (const kind of KINDS) {
    for (const battery of batteries) {
      it(`${kind}, powers on, screen fine, battery ${battery}`, () => {
        const ids = enabledIds(kind, { power: "on", screen: "fine", battery });
        expect(ids[0]).toBe(kind === "laptop" ? "donate" : "resell");
        expect(ids[1]).toBe("repair");
        expect(ids.indexOf("repair")).toBeLessThan(ids.indexOf("parts"));
        expect(ids.indexOf("parts")).toBeLessThan(ids.indexOf("recycle"));
        expect(ids).toHaveLength(5);
      });
      it(`${kind}, powers on, screen cracked, battery ${battery}`, () => {
        const ids = enabledIds(kind, { power: "on", screen: "cracked", battery });
        expect(ids[0]).toBe("repair");
        expect(ids[1]).toBe("resell");
      });
      it(`${kind}, does not power on, battery ${battery}`, () => {
        const r = rank(kind, { power: "off", screen: "fine", battery });
        expect(r[0].id).toBe("parts");
        expect(r[1].id).toBe("recycle");
        for (const id of ["repair", "resell", "donate"] as RouteId[]) {
          const x = r.find((y) => y.id === id)!;
          expect(x.enabled).toBe(false);
          expect(x.disabledReason).toBe(NEEDS_WORKING);
        }
      });
    }
    for (const power of ["on", "off"] as const) {
      for (const screen of ["fine", "cracked"] as const) {
        it(`${kind}, swollen battery override (${power}, ${screen})`, () => {
          const r = rank(kind, { power, screen, battery: "swollen" });
          expect(r[0].id).toBe("recycle");
          expect(r.filter((x) => x.enabled)).toHaveLength(1);
          for (const x of r.filter((y) => y.id !== "recycle")) {
            expect(x.enabled).toBe(false);
            expect(x.disabledReason).toBe(SWOLLEN_RULE);
          }
        });
      }
    }
  }
  it("matches the expected top route for each sample", () => {
    for (const p of Object.values(DEVICES)) {
      expect(rank(p.kind, p.defaults)[0].id).toBe(p.expectedRoute);
    }
  });
  it("scores stay within 0 to 100", () => {
    for (const kind of KINDS) for (const r of rank(kind, { power: "on", screen: "fine", battery: "good" })) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
});

describe("impact model", () => {
  it("multiplies embodied carbon by the route factor", () => {
    expect(computeImpact("phone", "repair", 0.18).co2eAvoidedKg).toBeCloseTo(55 * 0.35);
    expect(computeImpact("laptop", "recycle", 2.1).co2eAvoidedKg).toBeCloseTo(250 * 0.05);
    expect(computeImpact("laptop", "parts", 2.1).kgDiverted).toBe(2.1);
  });
});

describe("partners and slots", () => {
  it("every route has at least two matched partners, sorted by score", () => {
    for (const r of ["repair", "resell", "donate", "parts", "recycle"] as RouteId[]) {
      const m = matchPartners(r);
      expect(m.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < m.length; i++) expect(m[i - 1].matchScore).toBeGreaterThanOrEqual(m[i].matchScore);
    }
  });
  it("match score stays within 0 to 100 and is zero for unrelated routes", () => {
    for (const p of PARTNERS) {
      for (const r of p.routes) {
        const s = matchScore(p, r);
        expect(s).toBeGreaterThan(0);
        expect(s).toBeLessThanOrEqual(100);
      }
      expect(matchScore(p, p.routes.includes("repair") ? "donate" : "repair")).toBe(0);
    }
  });
  it("builds seven deterministic days of four windows", () => {
    const d = new Date(2026, 0, 10);
    const a = buildSlots(d);
    const b = buildSlots(d);
    expect(a).toEqual(b);
    expect(a).toHaveLength(7);
    for (const day of a) expect(day.windows).toHaveLength(4);
    expect(a[0].windows[1].available).toBe(true);
  });
});
