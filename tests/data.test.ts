import { describe, expect, it } from "vitest";
import { LAPTOP_COMPONENTS, PHONE_COMPONENTS } from "../src/data/components";
import { PARTNERS } from "../src/data/partners";
import { PROJECTS } from "../src/data/projects";
import { ROUTE_MIX, WEEKLY_SCANS, PILOT } from "../src/data/dashboard";
import { STATS } from "../src/content/stats";
import { CHAPTERS } from "../src/content/pitch";
import { appraise, STATUS_FACTOR } from "../src/engine/appraise";
import { ROUTE_META } from "../src/engine/routes";

describe("data integrity", () => {
  it("component weights sum to 1 for each device type", () => {
    for (const list of [PHONE_COMPONENTS, LAPTOP_COMPONENTS]) {
      expect(list.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1, 10);
    }
  });
  it("component ids are unique and batteries are never student parts", () => {
    for (const list of [PHONE_COMPONENTS, LAPTOP_COMPONENTS]) {
      expect(new Set(list.map((c) => c.id)).size).toBe(list.length);
      expect(list.find((c) => c.role === "battery")?.studentUse).toBeUndefined();
    }
  });
  it("every partner route exists", () => {
    for (const p of PARTNERS) for (const r of p.routes) expect(Object.keys(ROUTE_META)).toContain(r);
  });
  it("every status is valid", () => {
    for (const list of [PHONE_COMPONENTS, LAPTOP_COMPONENTS]) for (const c of list) expect(Object.keys(STATUS_FACTOR)).toContain(c.defaultStatus);
    const a = appraise({ kind: "phone", weightKg: 0.16 }, { power: "off", screen: "cracked", battery: "swollen" });
    for (const i of a.items) expect(Object.keys(STATUS_FACTOR)).toContain(i.status);
  });
  it("route mix sums to 1 and weekly scans sum to the pilot target", () => {
    expect(Object.values(ROUTE_MIX).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(WEEKLY_SCANS.reduce((a, b) => a + b, 0)).toBe(PILOT.devicesScanned);
  });
  it("projects only need known tags and there are 6 to 8 of them", () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(6);
    expect(PROJECTS.length).toBeLessThanOrEqual(8);
    for (const p of PROJECTS) expect(p.needs.length).toBeGreaterThan(0);
  });
  it("verified stats carry a source and year, and the India figure is flagged", () => {
    for (const s of Object.values(STATS)) {
      expect(s.source.length).toBeGreaterThan(0);
      expect(String(s.year).length).toBeGreaterThan(0);
    }
    expect(STATS.indiaGenerated.verify).toBe(true);
  });
  it("has twelve chapters with at most three notes each", () => {
    expect(CHAPTERS).toHaveLength(12);
    for (const c of CHAPTERS) expect(c.notes.length).toBeLessThanOrEqual(3);
  });
});
