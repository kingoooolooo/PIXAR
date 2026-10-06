export type DeviceKind = "phone" | "laptop";
export type SampleId = "A" | "B" | "C";
export type Status = "reusable" | "repairable" | "recyclable" | "hazardous";
export type RouteId = "repair" | "resell" | "donate" | "parts" | "recycle";
export type PowerState = "on" | "off";
export type ScreenState = "fine" | "cracked";
export type BatteryState = "good" | "weak" | "swollen";
export type Difficulty = "Easy" | "Moderate" | "Advanced";
export type PartTag = "motor" | "sensor" | "audio" | "camera" | "storage" | "fan" | "display" | "memory" | "input" | "board";
export type ComponentRole = "display" | "battery" | "board" | "structure" | "other";
export type Glyph = "screen" | "battery" | "board" | "frame" | "camera" | "motor" | "speaker" | "keyboard" | "ram" | "drive" | "fan";

export interface Conditions {
  power: PowerState;
  screen: ScreenState;
  battery: BatteryState;
}

export interface StudentUse {
  difficulty: Difficulty;
  tags: PartTag[];
  what: string;
  tools: string[];
  safety: string;
}

export interface ComponentDef {
  id: string;
  name: string;
  short: string;
  weight: number;
  valueINR: [number, number];
  note: string;
  role: ComponentRole;
  defaultStatus: Status;
  materials: string[];
  studentUse?: StudentUse;
  /** Centre of the part in the exploded illustration (viewBox units). */
  hotspot: { x: number; y: number };
  glyph: Glyph;
  size: { w: number; h: number };
}

export interface DeviceProfile {
  id: SampleId;
  kind: DeviceKind;
  label: string;
  year: number;
  weightKg: number;
  defaults: Conditions;
  confidence: number;
  expectedRoute: RouteId;
  blurb: string;
}

export interface Partner {
  id: string;
  name: string;
  typeLabel: string;
  /** First entry is the primary route. */
  routes: RouteId[];
  distanceKm: number;
  services: string;
  replyMin: number;
  replyLabel: string;
  certified: boolean;
  /** Map bearing in degrees (0 = east, clockwise). */
  angle: number;
}

export interface Project {
  id: string;
  name: string;
  interest: "Robotics" | "IoT" | "Wearables" | "Audio";
  difficulty: Difficulty;
  time: string;
  skills: string[];
  needs: PartTag[];
  blurb: string;
}
