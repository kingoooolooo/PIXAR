import { useMemo } from "react";
import { DEVICES } from "@/data/devices";
import { partnerById } from "@/data/partners";
import { appraise, type Appraisal } from "@/engine/appraise";
import { matchPartners } from "@/engine/match";
import { rankRoutes, type RouteScore } from "@/engine/routes";
import type { DeviceProfile, Partner } from "@/data/types";
import { useDemo } from "./demo";

export interface Derived {
  profile: DeviceProfile | null;
  appraisal: Appraisal | null;
  ranking: RouteScore[] | null;
  partner: Partner | undefined;
  partnerCount: number;
}

export function useDerived(): Derived {
  const sampleId = useDemo((s) => s.sampleId);
  const conditions = useDemo((s) => s.conditions);
  const route = useDemo((s) => s.route);
  const partnerId = useDemo((s) => s.partnerId);
  return useMemo(() => {
    const partner = partnerById(partnerId);
    const partnerCount = route ? matchPartners(route).length : 0;
    if (!sampleId) return { profile: null, appraisal: null, ranking: null, partner, partnerCount };
    const profile = DEVICES[sampleId];
    const appraisal = appraise(profile, conditions);
    return { profile, appraisal, ranking: rankRoutes(appraisal), partner, partnerCount };
  }, [sampleId, conditions, route, partnerId]);
}
