export const WINDOWS = [
  { id: "w1", label: "10 am to 12 pm" },
  { id: "w2", label: "12 pm to 2 pm" },
  { id: "w3", label: "2 pm to 4 pm" },
  { id: "w4", label: "4 pm to 6 pm" },
] as const;

export interface SlotWindow {
  id: string;
  label: string;
  available: boolean;
}
export interface DaySlots {
  iso: string;
  weekday: string;
  day: number;
  month: string;
  label: string;
  windows: SlotWindow[];
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Next 7 days starting tomorrow. About one slot in five is unavailable, seeded by date so it never flickers. */
export function buildSlots(from: Date = new Date(), days = 7): DaySlots[] {
  const out: DaySlots[] = [];
  for (let i = 1; i <= days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const weekday = d.toLocaleDateString("en-IN", { weekday: "short" });
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    out.push({
      iso,
      weekday,
      day: d.getDate(),
      month,
      label: i === 1 ? "Tomorrow" : `${weekday} ${d.getDate()} ${month}`,
      windows: WINDOWS.map((w) => ({
        id: w.id,
        label: w.label,
        // tomorrow 12 to 2 is always open so the click path never breaks
        available: i === 1 && w.id === "w2" ? true : hashStr(`${iso}-${w.id}`) % 5 !== 0,
      })),
    });
  }
  return out;
}
