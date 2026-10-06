export type Phase = "idle" | "scanning" | "scanned" | "appraised" | "routed" | "partnerChosen" | "booked" | "certified";
export const PHASES: Phase[] = ["idle", "scanning", "scanned", "appraised", "routed", "partnerChosen", "booked", "certified"];
export const phaseRank = (p: Phase): number => PHASES.indexOf(p);

export type StepId = "scan" | "appraise" | "route" | "parts" | "pickup" | "certificate";

export interface StepDef {
  id: StepId;
  label: string;
  optional?: boolean;
  /** Minimum phase needed to open this step. */
  needs: Phase;
}

export const STEPS: StepDef[] = [
  { id: "scan", label: "Scan", needs: "idle" },
  { id: "appraise", label: "Appraise", needs: "scanned" },
  { id: "route", label: "Route", needs: "appraised" },
  { id: "parts", label: "Parts", optional: true, needs: "partnerChosen" },
  { id: "pickup", label: "Pickup", needs: "partnerChosen" },
  { id: "certificate", label: "Certificate", needs: "booked" },
];

export const STEP_IDS: StepId[] = STEPS.map((s) => s.id);
export const stepIndex = (id: StepId): number => STEP_IDS.indexOf(id);
