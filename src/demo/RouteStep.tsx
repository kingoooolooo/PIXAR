import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Lock } from "lucide-react";
import { Banner, Button } from "@/components/ui";
import { DEMO_CONFIG } from "@/content/config";
import { PARTNERS } from "@/data/partners";
import { matchPartners, sortPartners } from "@/engine/match";
import { ROUTE_META, whyRoute } from "@/engine/routes";
import { useDemo } from "@/state/demo";
import { useDerived } from "@/state/derived";
import { cn } from "@/utils/cn";
import { CityMap } from "./CityMap";
import { StepFooter, StepHeader } from "./parts";

export function RouteStep() {
  const route = useDemo((s) => s.route);
  const partnerId = useDemo((s) => s.partnerId);
  const chooseRoute = useDemo((s) => s.chooseRoute);
  const choosePartner = useDemo((s) => s.choosePartner);
  const d = useDerived();
  const [sort, setSort] = useState<"best" | "nearest">("best");
  const [hover, setHover] = useState<string | null>(null);
  const ranking = d.ranking;

  useEffect(() => {
    if (!ranking) return;
    const current = route ? ranking.find((r) => r.id === route) : undefined;
    if (!current || !current.enabled) {
      const top = ranking.find((r) => r.enabled);
      if (top) chooseRoute(top.id);
    }
  }, [ranking, route, chooseRoute]);

  const matched = useMemo(() => (route ? sortPartners(matchPartners(route), sort) : []), [route, sort]);
  if (!ranking || !d.appraisal || !route) return null;
  const topId = ranking.find((r) => r.enabled)?.id;
  const swollen = d.appraisal.hazardous;

  return (
    <div>
      <StepHeader title="Best second life" lead="Router ranks five routes by fit. Matchmaker then finds partners near you." />
      {swollen && (
        <div className="mb-5">
          <Banner tone="hazard" title="Safety rule applied">
            Swollen batteries are a fire risk. Only a certified recycler should handle this device.
          </Banner>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-12">
        <fieldset className="lg:col-span-5">
          <legend className="mb-2 text-sm font-medium">Routes ranked by fit</legend>
          <div className="space-y-2">
            {ranking.map((r) => {
              const checked = route === r.id;
              return (
                <label
                  key={r.id}
                  className={cn(
                    "block rounded-2xl border p-3 transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal",
                    r.enabled ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                    checked ? "border-teal bg-teal/10" : "border-line bg-s1",
                    r.enabled && !checked && "hover:border-ivory/40"
                  )}
                >
                  <input type="radio" name="route" className="sr-only" checked={checked} disabled={!r.enabled} onChange={() => chooseRoute(r.id)} />
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-semibold">
                      {!r.enabled && <Lock className="size-4" strokeWidth={1.5} aria-hidden />}
                      {ROUTE_META[r.id].name}
                      {r.id === topId && <span className="rounded-md bg-teal px-1.5 py-0.5 text-xs font-semibold text-ink">Top pick</span>}
                    </span>
                    <span className="text-sm">{r.enabled ? `Score ${r.score}` : "Unavailable"}</span>
                  </span>
                  {r.enabled && (
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ivory/10">
                      <span className="block h-full rounded-full bg-teal transition-[width] duration-500" style={{ width: `${r.score}%` }} />
                    </span>
                  )}
                  <span className="mt-1.5 block text-sm text-muted">{r.enabled ? r.reason : r.disabledReason}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-4 lg:col-span-7">
          <div className="panel p-4">
            <h2 className="text-base font-semibold">Why this route: {ROUTE_META[route].name}</h2>
            <p className="mt-1 text-sm text-muted">{ROUTE_META[route].blurb}</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-base">
              {whyRoute(d.appraisal, route).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <Banner title="Partners shown are fictional">Every partner in this demo is invented for the prototype. Distances are on an abstract map of {DEMO_CONFIG.city}.</Banner>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="frame p-3">
          <CityMap partners={PARTNERS} matchedIds={matched.map((m) => m.id)} selectedId={partnerId} hoverId={hover} onHover={setHover} onSelect={choosePartner} />
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Matched partners</h2>
            <div role="group" aria-label="Sort partners" className="flex gap-1">
              {(["best", "nearest"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={sort === k}
                  onClick={() => setSort(k)}
                  className={cn("min-h-11 rounded-lg border px-3 text-sm", sort === k ? "border-teal bg-teal font-semibold text-ink" : "border-line hover:bg-ivory/10")}
                >
                  {k === "best" ? "Best match" : "Nearest"}
                </button>
              ))}
            </div>
          </div>
          <ul className="space-y-2">
            {matched.map((p) => {
              const chosen = partnerId === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => choosePartner(p.id)}
                    onMouseEnter={() => setHover(p.id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(p.id)}
                    onBlur={() => setHover(null)}
                    className={cn("w-full rounded-2xl border p-3 text-left transition-colors duration-200", chosen ? "border-teal bg-teal/10" : hover === p.id ? "border-ivory/50 bg-s2" : "border-line bg-s1")}
                  >
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-sm font-semibold">Match {p.matchScore}</span>
                    </span>
                    <span className="block text-sm text-muted">
                      {p.typeLabel}. {p.distanceKm} km away.
                    </span>
                    <span className="mt-1 block text-sm">{p.services}</span>
                    {p.role === "remainder" && <span className="block text-sm text-muted">Takes the non-reusable remainder.</span>}
                    <span className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted">
                      <span>Replies {p.replyLabel}</span>
                      <span className="inline-flex items-center gap-1 text-ivory">
                        <BadgeCheck className="size-4 text-teal" strokeWidth={1.5} aria-hidden />
                        Verified (demo)
                      </span>
                      {chosen && <span className="font-semibold text-teal">Chosen</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {!partnerId && (
            <p className="mt-2 text-sm text-muted">Choose a partner to continue.</p>
          )}
          {matched.length > 0 && !partnerId && (
            <Button className="mt-2" onClick={() => choosePartner(matched[0].id)}>
              Choose best match
            </Button>
          )}
        </div>
      </div>
      <StepFooter back="appraise" next="parts" nextLabel="Continue to Parts Lab" nextDisabled={!partnerId} />
    </div>
  );
}
