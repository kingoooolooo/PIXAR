import type { DeviceProfile, SampleId } from "./types";

/** Generic labels only: no brand names, logos or real model numbers. */
export const DEVICES: Record<SampleId, DeviceProfile> = {
  A: {
    id: "A",
    kind: "phone",
    label: "Smartphone",
    year: 2015,
    weightKg: 0.16,
    defaults: { power: "off", screen: "fine", battery: "weak" },
    confidence: 0.88,
    expectedRoute: "parts",
    blurb: "Will not turn on. Screen is clean.",
  },
  B: {
    id: "B",
    kind: "laptop",
    label: "Laptop",
    year: 2016,
    weightKg: 2.1,
    defaults: { power: "on", screen: "fine", battery: "weak" },
    confidence: 0.91,
    expectedRoute: "donate",
    blurb: "Powers on. Battery is tired.",
  },
  C: {
    id: "C",
    kind: "phone",
    label: "Smartphone",
    year: 2018,
    weightKg: 0.18,
    defaults: { power: "on", screen: "cracked", battery: "weak" },
    confidence: 0.86,
    expectedRoute: "repair",
    blurb: "Powers on. Glass is cracked.",
  },
};

export const SAMPLE_IDS: SampleId[] = ["A", "B", "C"];

export const sampleName = (p: DeviceProfile): string => `${p.label}, ${p.year}`;
