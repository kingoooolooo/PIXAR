import { create } from "zustand";
import { DEVICES } from "@/data/devices";
import type { BatteryState, Conditions, PowerState, RouteId, SampleId, ScreenState } from "@/data/types";
import { appraise } from "@/engine/appraise";
import { computeImpact, valueKeptInUse } from "@/engine/impact";
import { matchPartners } from "@/engine/match";
import { rankRoutes } from "@/engine/routes";
import { buildSlots, hashStr } from "@/engine/slots";
import { PHASES, phaseRank, stepIndex, STEPS, type Phase, type StepId } from "./steps";

export interface Reservation {
  name: string;
  college: string;
  project: string;
  partIds: string[];
}
export interface BookingInput {
  mode: "pickup" | "dropoff";
  dateISO: string;
  dateLabel: string;
  windowId: string;
  windowLabel: string;
  name: string;
  mobile: string;
  address: string;
  pincode: string;
}
export interface Booking extends BookingInput {
  id: string;
  progress: number;
  createdAt: number;
}
export interface CertificateRecord {
  id: string;
  issuedAt: number;
}
export interface Session {
  completions: number;
  kg: number;
  co2e: number;
  value: number;
  parts: number;
}

interface Persisted {
  phase: Phase;
  sampleId: SampleId | null;
  conditions: Conditions;
  route: RouteId | null;
  partnerId: string | null;
  reservation: Reservation | null;
  dataSafety: "done" | "skipped" | null;
  booking: Booking | null;
  certificate: CertificateRecord | null;
  session: Session;
}

interface DemoState extends Persisted {
  photoUrl: string | null;
  selectSample: (id: SampleId, photoUrl?: string | null) => void;
  setCondition: <K extends keyof Conditions>(key: K, value: Conditions[K]) => void;
  beginScan: () => void;
  finishScan: () => void;
  enterAppraise: () => void;
  chooseRoute: (id: RouteId) => void;
  choosePartner: (id: string) => void;
  reserve: (r: Reservation) => void;
  clearReservation: () => void;
  setDataSafety: (v: "done" | "skipped") => void;
  confirmBooking: (b: BookingInput) => void;
  advanceBooking: () => void;
  skipBooking: () => void;
  issueCertificate: () => void;
  reset: (keepSession?: boolean) => void;
  hydrateTo: (step: StepId) => void;
}

const KEY = "pixar-demo-v1";

/** After a reset, deep-link hydration is paused briefly so Reset really lands on an empty Scan step. */
export const hydrationGuard = { until: 0 };
const EMPTY_SESSION: Session = { completions: 0, kg: 0, co2e: 0, value: 0, parts: 0 };
const BLANK_CONDITIONS: Conditions = { ...DEVICES.A.defaults };

const blank = (session: Session): Persisted => ({
  phase: "idle",
  sampleId: null,
  conditions: { ...BLANK_CONDITIONS },
  route: null,
  partnerId: null,
  reservation: null,
  dataSafety: null,
  booking: null,
  certificate: null,
  session,
});

function load(): Persisted | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Persisted;
    if (!o || typeof o !== "object" || !PHASES.includes(o.phase)) return null;
    if (o.sampleId !== null && !(o.sampleId in DEVICES)) return null;
    if (!o.conditions || !o.session) return null;
    return o;
  } catch {
    return null;
  }
}

function save(s: DemoState) {
  try {
    const data: Persisted = {
      phase: s.phase,
      sampleId: s.sampleId,
      conditions: s.conditions,
      route: s.route,
      partnerId: s.partnerId,
      reservation: s.reservation,
      dataSafety: s.dataSafety,
      booking: s.booking,
      certificate: s.certificate,
      session: s.session,
    };
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable: the demo still works in memory */
  }
}

const downstreamReset = {
  route: null,
  partnerId: null,
  reservation: null,
  dataSafety: null,
  booking: null,
  certificate: null,
} as const;

export const DEFAULT_PARTS: Record<"phone" | "laptop", string[]> = {
  phone: ["vibration", "speaker", "camera-rear"],
  laptop: ["fan", "ram", "speakers"],
};

export function defaultBookingInput(): BookingInput {
  const day = buildSlots()[0];
  return {
    mode: "pickup",
    dateISO: day.iso,
    dateLabel: day.label,
    windowId: "w2",
    windowLabel: day.windows[1].label,
    name: "Demo User",
    mobile: "9876543210",
    address: "Sample address, Vijay Nagar",
    pincode: "452010",
  };
}

const makeId = (prefix: string, seed: number) => `${prefix}-${String(hashStr(String(seed)) % 900000 + 100000)}`;

export const useDemo = create<DemoState>((set, get) => ({
  ...(load() ?? blank({ ...EMPTY_SESSION })),
  photoUrl: null,

  selectSample: (id, photoUrl = null) => {
    const prev = get().photoUrl;
    if (prev && prev !== photoUrl) URL.revokeObjectURL(prev);
    set({ sampleId: id, conditions: { ...DEVICES[id].defaults }, phase: "idle", ...downstreamReset, photoUrl });
  },

  setCondition: (key, value) => {
    const s = get();
    const conditions = { ...s.conditions, [key]: value } as Conditions;
    if (phaseRank(s.phase) >= phaseRank("scanned")) set({ conditions, phase: "scanned", ...downstreamReset });
    else set({ conditions });
  },

  beginScan: () => {
    if (!get().sampleId) return;
    set({ phase: "scanning", ...downstreamReset });
  },
  finishScan: () => {
    if (get().phase === "scanning") set({ phase: "scanned" });
  },
  enterAppraise: () => {
    if (get().phase === "scanned") set({ phase: "appraised" });
  },

  chooseRoute: (id) => {
    const s = get();
    if (s.route === id && phaseRank(s.phase) >= phaseRank("routed")) return;
    set({ route: id, partnerId: null, reservation: null, booking: null, certificate: null, dataSafety: null, phase: "routed" });
  },
  choosePartner: (id) => {
    const s = get();
    if (s.partnerId === id && phaseRank(s.phase) >= phaseRank("partnerChosen")) return;
    set({ partnerId: id, booking: null, certificate: null, phase: "partnerChosen" });
  },

  reserve: (r) => set({ reservation: r }),
  clearReservation: () => set({ reservation: null }),
  setDataSafety: (v) => set({ dataSafety: v }),

  confirmBooking: (b) => {
    const createdAt = Date.now();
    set({ booking: { ...b, id: makeId("PXB", createdAt), progress: 0, createdAt }, phase: "booked", certificate: null });
  },
  advanceBooking: () => {
    const b = get().booking;
    if (b && b.progress < 4) set({ booking: { ...b, progress: b.progress + 1 } });
  },
  skipBooking: () => {
    const b = get().booking;
    if (b) set({ booking: { ...b, progress: 4 } });
  },

  issueCertificate: () => {
    const s = get();
    if (s.certificate || !s.sampleId || !s.route) return;
    const profile = DEVICES[s.sampleId];
    const appraisal = appraise(profile, s.conditions);
    const impact = computeImpact(profile.kind, s.route, profile.weightKg);
    const reserved = s.reservation?.partIds ?? [];
    const issuedAt = Date.now();
    set({
      certificate: { id: makeId("PXC", issuedAt), issuedAt },
      phase: "certified",
      session: {
        completions: s.session.completions + 1,
        kg: s.session.kg + impact.kgDiverted,
        co2e: s.session.co2e + impact.co2eAvoidedKg,
        value: s.session.value + valueKeptInUse(appraisal, s.route, reserved),
        parts: s.session.parts + reserved.length,
      },
    });
  },

  reset: (keepSession = false) => {
    const prev = get().photoUrl;
    if (prev) URL.revokeObjectURL(prev);
    hydrationGuard.until = Date.now() + 600;
    const session = keepSession ? get().session : { ...EMPTY_SESSION };
    set({ ...blank(session), photoUrl: null });
    try {
      if (!keepSession) sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },

  /** Deep links: if state is missing, hydrate sample A fast-forwarded to the step. */
  hydrateTo: (step) => {
    const need = phaseRank(STEPS[stepIndex(step)].needs);
    const profile = DEVICES.A;
    const conditions = { ...profile.defaults };
    const appraisal = appraise(profile, conditions);
    const top = rankRoutes(appraisal)[0].id;
    const partner = matchPartners(top)[0];
    const next: Partial<Persisted> = { sampleId: "A", conditions, phase: "scanned", ...downstreamReset };
    if (need >= phaseRank("appraised")) next.phase = "appraised";
    if (need >= phaseRank("routed")) {
      next.phase = "routed";
      next.route = top;
    }
    if (need >= phaseRank("partnerChosen")) {
      next.phase = "partnerChosen";
      next.partnerId = partner.id;
      next.reservation = { name: "Demo Student", college: "Demo College of Engineering", project: "Vibration alert band", partIds: DEFAULT_PARTS.phone };
    }
    if (need >= phaseRank("booked")) {
      const createdAt = Date.now();
      next.phase = "booked";
      next.dataSafety = "done";
      next.booking = { ...defaultBookingInput(), id: makeId("PXB", createdAt), progress: 4, createdAt };
    }
    set(next);
  },
}));

useDemo.subscribe(save);

export type { PowerState, ScreenState, BatteryState };
