import { PARTNERS } from "@/data/partners";
import type { Partner, RouteId } from "@/data/types";

export interface MatchedPartner extends Partner {
  matchScore: number;
  role: "primary" | "remainder";
}

/**
 * Match score (0 to 100) = 0.5 * routeFit + 0.3 * distanceScore + 0.2 * replyScore
 * - routeFit: 100 if the route is the partner's primary route, 80 if it is a secondary route
 * - distanceScore: 100 - 9 points per km, floored at 0
 * - replyScore: 100 - 1 point per 1.5 minutes of reply time, floored at 0
 */
export function matchScore(p: Partner, route: RouteId): number {
  const idx = p.routes.indexOf(route);
  if (idx < 0) return 0;
  const fit = idx === 0 ? 100 : 80;
  const distance = Math.max(0, 100 - p.distanceKm * 9);
  const reply = Math.max(0, 100 - p.replyMin / 1.5);
  return Math.round(0.5 * fit + 0.3 * distance + 0.2 * reply);
}

export function matchPartners(route: RouteId): MatchedPartner[] {
  return PARTNERS.filter((p) => p.routes.includes(route))
    .map((p) => ({ ...p, matchScore: matchScore(p, route), role: (p.routes[0] === route ? "primary" : "remainder") as "primary" | "remainder" }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function sortPartners(list: MatchedPartner[], by: "best" | "nearest"): MatchedPartner[] {
  return [...list].sort((a, b) => (by === "best" ? b.matchScore - a.matchScore : a.distanceKm - b.distanceKm));
}
