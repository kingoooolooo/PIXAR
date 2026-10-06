import { DEMO_CONFIG } from "@/content/config";
import type { AgentInfo } from "@/content/pitch";
import type { DeviceProfile, Partner, RouteId } from "@/data/types";
import { conditionSummary, type Appraisal } from "@/engine/appraise";
import { computeImpact } from "@/engine/impact";
import { ROUTE_META, type RouteScore } from "@/engine/routes";
import { dec, inrRange } from "@/lib/format";
import type { Booking, CertificateRecord } from "@/state/demo";
import type { StepId } from "@/state/steps";

export interface LogLine {
  agent: AgentInfo["id"];
  text: string;
  tool?: string;
}
export interface StepScript {
  lines: LogLine[];
  result: string;
}
export interface ScriptCtx {
  profile: DeviceProfile | null;
  appraisal: Appraisal | null;
  ranking: RouteScore[] | null;
  route: RouteId | null;
  partner: Partner | undefined;
  partnerCount: number;
  booking: Booking | null;
  certificate: CertificateRecord | null;
  reservedCount: number;
}

export function buildScript(step: StepId, c: ScriptCtx): StepScript {
  const p = c.profile;
  const a = c.appraisal;
  const name = p ? `${p.label.toLowerCase()}, ${p.year}` : "device";
  const kind = p?.kind ?? "phone";

  switch (step) {
    case "scan": {
      const summary = a ? conditionSummary(a.conditions).toLowerCase() : "condition unknown";
      return {
        lines: [
          { agent: "scout", tool: "vision.detect", text: "Finding the device outline and screen area" },
          { agent: "scout", tool: "vision.detect", text: `Object class: ${kind}, estimated year ${p?.year ?? "unknown"}` },
          { agent: "scout", tool: "condition.score", text: `Reading your answers: ${summary}` },
          { agent: "scout", tool: "vision.detect", text: `${a?.items.length ?? 0} components located` },
          { agent: "scout", tool: "condition.score", text: `Confidence ${p ? dec(p.confidence, 2) : "0.00"} (simulated)` },
        ],
        result: `Scan complete: ${name}. ${a ? conditionSummary(a.conditions) : ""}. Confidence ${p ? dec(p.confidence, 2) : ""}, simulated.`,
      };
    }
    case "appraise": {
      const battery = a?.items.find((i) => i.def.role === "battery");
      return {
        lines: [
          { agent: "appraiser", tool: "components.list", text: `Loading the ${kind} component map` },
          { agent: "appraiser", tool: "status.classify", text: "Applying status rules to each component" },
          { agent: "appraiser", tool: "status.classify", text: `Battery: ${battery?.status ?? "unknown"}` },
          { agent: "appraiser", tool: "value.estimate", text: `Value ${a ? inrRange(a.valueRange) : ""} (illustrative)` },
          { agent: "appraiser", tool: "score.reuse", text: `Reuse score ${a?.score ?? 0} out of 100` },
          { agent: "appraiser", tool: "materials.list", text: `Recoverable: ${a ? a.materials.slice(0, 4).join(", ") : ""}` },
        ],
        result: `Appraisal complete. Reuse score ${a?.score ?? 0} out of 100. Estimated value ${a ? inrRange(a.valueRange) : ""}, illustrative. Weight ${a ? dec(a.weightKg, 2) : ""} kg.`,
      };
    }
    case "route": {
      const top = c.ranking?.find((r) => r.enabled);
      const topName = top ? ROUTE_META[top.id].name : "none";
      const off = c.ranking?.filter((r) => !r.enabled).length ?? 0;
      return {
        lines: [
          { agent: "router", tool: "route.rank", text: "Ranking five routes against condition and reuse score" },
          { agent: "router", tool: "route.rank", text: `Top fit: ${topName}, score ${top?.score ?? 0}` },
          { agent: "router", tool: "safety.check", text: off ? `${off} routes disabled by safety and working-device rules` : "No routes disabled" },
          { agent: "matchmaker", tool: "partners.search", text: `Searching partners within 10 km in ${DEMO_CONFIG.city}` },
          { agent: "matchmaker", tool: "match.score", text: `${c.partnerCount} partners matched. Best: ${c.partner?.name ?? "pending"}` },
        ],
        result: `Best route: ${topName}. ${c.partnerCount} fictional partners matched.`,
      };
    }
    case "parts":
      return {
        lines: [
          { agent: "mentor", tool: "parts.catalog", text: "Listing parts that could be salvaged for projects" },
          { agent: "mentor", tool: "projects.match", text: "Matching parts to project ideas by tag" },
          { agent: "mentor", tool: "safety.check", text: "Batteries and screens are never opened at home" },
          { agent: "mentor", tool: "reserve.check", text: c.route === "parts" ? "Reservation open: route is Student parts" : "Reservation closed: route is not Student parts" },
        ],
        result: c.route === "parts" ? "Parts Lab ready. You can reserve parts." : "Parts Lab is a preview for this route.",
      };
    case "pickup":
      return {
        lines: [
          { agent: "scheduler", tool: "checklist.verify", text: "Data-safety checklist before handover" },
          { agent: "scheduler", tool: "slots.search", text: "Checking the next 7 days of slots" },
          { agent: "scheduler", tool: "slots.reserve", text: c.booking ? `Reserved ${c.booking.dateLabel}, ${c.booking.windowLabel}` : "Waiting for you to choose a slot" },
          { agent: "scheduler", tool: "tracking.start", text: c.booking ? `Tracking booking ${c.booking.id}` : "Tracking starts after booking" },
        ],
        result: c.booking ? `Booked ${c.booking.dateLabel}, ${c.booking.windowLabel}. Booking ${c.booking.id}.` : "Choose a day and a time window to book.",
      };
    case "certificate": {
      const impact = p && c.route ? computeImpact(p.kind, c.route, p.weightKg) : null;
      return {
        lines: [
          { agent: "certifier", tool: "impact.calc", text: impact ? `CO2e avoided ${dec(impact.co2eAvoidedKg, 1)} kg (illustrative)` : "Calculating impact" },
          { agent: "certifier", tool: "sanitise.log", text: "Recording the data-sanitisation line (simulated)" },
          { agent: "certifier", tool: "qr.encode", text: "Encoding a verification link on pixar.example" },
          { agent: "certifier", tool: "certificate.issue", text: c.certificate ? `Issued ${c.certificate.id}` : "Issuing certificate" },
        ],
        result: c.certificate ? `Certificate ${c.certificate.id} issued. ${c.reservedCount} parts reserved.` : "Certificate is being issued.",
      };
    }
  }
}
