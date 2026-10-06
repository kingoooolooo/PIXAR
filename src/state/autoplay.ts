import { go } from "@/lib/nav";
import { DEFAULT_PARTS, defaultBookingInput, useDemo } from "./demo";
import { toast, usePresenter } from "./presenter";

let token = 0;

const sleep = (ms: number, t: number) =>
  new Promise<void>((resolve) => {
    let left = ms;
    const tick = () => {
      if (t !== token) return resolve();
      if (usePresenter.getState().autoplay.status === "paused") {
        window.setTimeout(tick, 100);
        return;
      }
      left -= 100;
      if (left <= 0) return resolve();
      window.setTimeout(tick, 100);
    };
    window.setTimeout(tick, 100);
  });

const until = async (cond: () => boolean, t: number, maxMs = 12000) => {
  let waited = 0;
  while (!cond() && t === token && waited < maxMs) {
    await sleep(100, t);
    waited += 100;
  }
};

const caption = (text: string) => usePresenter.getState().setAutoplay("running", text);

export function stopAutoplay(announce = true) {
  token++;
  const p = usePresenter.getState();
  if (p.autoplay.status !== "off") {
    p.setAutoplay("off", null);
    p.setForced(null);
    if (announce) toast("Autoplay stopped");
  }
}

export function toggleAutoplayPause() {
  const p = usePresenter.getState();
  if (p.autoplay.status === "running") p.setAutoplay("paused");
  else if (p.autoplay.status === "paused") p.setAutoplay("running");
}

/** Plays sample A through all six steps with captions and sensible defaults. */
export async function startAutoplay() {
  stopAutoplay(false);
  const t = ++token;
  const ok = () => t === token;
  const demo = () => useDemo.getState();
  const presenter = usePresenter.getState();

  demo().reset(true);
  presenter.setOverlay(null);
  presenter.setAutoplay("running", "Starting the demo with Smartphone, 2015");
  go("/demo/scan");
  await sleep(1100, t);
  if (!ok()) return;

  caption("Scout: choosing Smartphone, 2015. It does not power on.");
  demo().selectSample("A");
  await sleep(1800, t);
  if (!ok()) return;
  caption("Scout: scanning the device");
  demo().beginScan();
  await until(() => demo().phase === "scanned", t);
  await sleep(1400, t);
  if (!ok()) return;

  go("/demo/appraise");
  caption("Appraiser: what is still good inside");
  await sleep(2200, t);
  if (!ok()) return;
  usePresenter.getState().setForced("battery");
  caption("Battery: weak, so the old cell goes to a certified recycler");
  await sleep(2800, t);
  usePresenter.getState().setForced(null);
  if (!ok()) return;

  go("/demo/route");
  caption("Router: Student parts fits a phone that no longer powers on");
  await sleep(2600, t);
  if (!ok()) return;
  demo().chooseRoute("parts");
  demo().choosePartner("campus-maker-lab");
  caption("Matchmaker: Campus Maker Lab, 0.9 km away");
  await sleep(2800, t);
  if (!ok()) return;

  go("/demo/parts");
  caption("Maker Mentor: reserving a vibration motor, speaker and camera module");
  await sleep(2600, t);
  if (!ok()) return;
  demo().reserve({ name: "Demo Student", college: "Demo College of Engineering", project: "Vibration alert band", partIds: DEFAULT_PARTS.phone });
  await sleep(2400, t);
  if (!ok()) return;

  go("/demo/pickup");
  caption("Scheduler: data-safety checklist, then tomorrow 12 pm to 2 pm");
  await sleep(2200, t);
  if (!ok()) return;
  demo().setDataSafety("done");
  await sleep(1200, t);
  if (!ok()) return;
  demo().confirmBooking(defaultBookingInput());
  toast("Pickup booked");
  caption("Scheduler: booked. Tracking the pickup");
  await sleep(3200, t);
  if (!ok()) return;
  demo().skipBooking();
  await sleep(1200, t);
  if (!ok()) return;

  go("/demo/certificate");
  caption("Certifier: Second-Life Certificate issued");
  await sleep(4500, t);
  if (!ok()) return;

  usePresenter.getState().setAutoplay("off", null);
  toast("Demo complete");
}
