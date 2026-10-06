import { Button } from "@/components/ui";
import { Stage } from "@/components/Stage";
import { ROADMAP, SDG, SIM_VS_REAL } from "@/content/pitch";
import { go } from "@/lib/nav";

export default function Sdg() {
  return (
    <Stage title={SDG.headline} lead="PIXAR targets waste prevention, reuse and safe management of e-waste.">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <div className="flex items-stretch gap-3">
            <div className="grid min-w-24 place-items-center rounded-2xl border-2 border-ivory bg-ivory px-3 py-2 text-ink">
              <span className="font-display text-5xl font-bold leading-none">12</span>
            </div>
            <p className="t-body self-center font-semibold">Responsible consumption and production</p>
          </div>
          <ul className="space-y-2">
            {SDG.targets.map((t) => (
              <li key={t.id} className="t-body">
                <span className="font-semibold">Target {t.id}. </span>
                {t.text}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {SDG.supporting.map((s) => (
              <div key={s.id} className="panel p-3 text-sm">
                <p className="font-semibold">Supports {s.id}</p>
                <p className="text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          <h2 className="t-h2 mb-2">Simulated today, real in v1</h2>
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full border-collapse text-left text-sm sm:text-base">
              <thead className="bg-s2">
                <tr>
                  <th scope="col" className="p-2.5 font-semibold">Capability</th>
                  <th scope="col" className="p-2.5 font-semibold">Prototype today</th>
                  <th scope="col" className="p-2.5 font-semibold">Real v1</th>
                </tr>
              </thead>
              <tbody>
                {SIM_VS_REAL.map((r) => (
                  <tr key={r[0]} className="border-t border-line align-top">
                    <th scope="row" className="p-2.5 font-medium">{r[0]}</th>
                    <td className="p-2.5 text-muted">{r[1]}</td>
                    <td className="p-2.5">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="t-h2 mb-3">Roadmap (indicative)</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {ROADMAP.map((p, i) => (
            <li key={p.phase} className="relative">
              <div aria-hidden className="mb-2 flex items-center gap-2">
                <span className="size-3 rounded-full bg-teal" />
                {i < ROADMAP.length - 1 && <span className="hidden h-px flex-1 bg-teal/50 md:block" />}
              </div>
              <p className="text-sm text-muted">{p.phase}</p>
              <p className="t-h2">{p.name}</p>
              <p className="t-body mt-1 text-ivory/90">{p.line}</p>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <Button variant="primary" onClick={() => go("/canvas")}>
          Open the Lean Canvas
        </Button>
      </div>
    </Stage>
  );
}
