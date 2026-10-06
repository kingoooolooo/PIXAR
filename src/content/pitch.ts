/** All deck copy lives here. Reorder CHAPTERS to match the final PPT. */

export type ChapterId =
  | "cover"
  | "problem"
  | "alternatives"
  | "customers"
  | "value"
  | "solution"
  | "channels"
  | "revenue"
  | "cost"
  | "metrics"
  | "advantage"
  | "sdg";

export interface Chapter {
  id: ChapterId;
  title: string;
  route: string;
  time: string;
  notes: string[];
}

export const CHAPTERS: Chapter[] = [
  { id: "cover", title: "Cover", route: "/cover", time: "0:20", notes: ["Let the beam run while you introduce the team.", "Hover a hotspot to show that every part has a story.", "Promise: scan, route, prove, reuse."] },
  { id: "problem", title: "Problem", route: "/problem", time: "0:45", notes: ["Each square is 1% of e-waste mass, not one device.", "Only 22 of 100 squares are documented as formally recycled.", "Open problem 6: students bin the motors they need."] },
  { id: "alternatives", title: "Alternatives", route: "/alternatives", time: "0:40", notes: ["This is our assessment, not a benchmark study.", "Hover the PIXAR column for each reason.", "No alternative covers student parts."] },
  { id: "customers", title: "Customers", route: "/customers", time: "0:25", notes: ["Start with households and students.", "Campuses and hostels are the early adopters.", "Partners are the supply side."] },
  { id: "value", title: "Value proposition", route: "/value", time: "0:20", notes: ["Press the right arrow to light each beat.", "Google Lens for old gadgets, plus pickup, plus a certificate.", "Know it, route it, prove it, reuse it."] },
  { id: "solution", title: "Solution and demo", route: "/solution", time: "2:10", notes: ["Introduce the seven agents in one breath.", "Launch the live demo. Press A for autoplay if a click goes wrong.", "Finish on the certificate, then show Key metrics."] },
  { id: "channels", title: "Channels", route: "/channels", time: "0:20", notes: ["Campuses and hostels give us the first scans.", "Hover an item to see how it reaches users.", "Partner dashboards close the loop."] },
  { id: "revenue", title: "Revenue", route: "/revenue", time: "0:25", notes: ["Individuals never pay.", "Partners, campuses, producers and sponsors do.", "EPR support is the long-term anchor."] },
  { id: "cost", title: "Cost", route: "/cost", time: "0:10", notes: ["Block sizes are illustrative.", "Operations is the biggest block.", "Expand a block to see its items."] },
  { id: "metrics", title: "Key metrics", route: "/metrics", time: "0:30", notes: ["All figures are 90-day pilot targets, not results.", "Point at the live session counter. It moved when we ran the demo.", "Toggle weekly and monthly."] },
  { id: "advantage", title: "Unfair advantage", route: "/advantage", time: "0:25", notes: ["Step through the flywheel with the arrow keys.", "Outcome data improves routing over time.", "Campus loop supplies devices and demand for parts."] },
  { id: "sdg", title: "SDG and roadmap", route: "/sdg", time: "0:30", notes: ["Be honest about simulated today versus real in v1.", "Three phases: campus, city, multi-city.", "Close with the Lean Canvas page."] },
];

export const TOTAL_TIME = "about 7 minutes";

export const DEMO_NOTES: string[] = [
  "Pick Smartphone 2015, then Start scan.",
  "Hover the battery in the appraisal.",
  "Accept Student parts and choose Campus Maker Lab.",
  "In the Parts Lab reserve the vibration motor, speaker and a camera module. Point at one project idea.",
  "Book tomorrow, 12 pm to 2 pm.",
  "Show the certificate with the reserved parts, then open Key metrics to show the session counter move.",
  "If there is time, scan again, switch the battery to swollen or hot, and show every route except certified recycling disabled.",
];

export const TAGLINE = "Scan it. Give it a second life.";

export interface AgentInfo {
  id: "scout" | "appraiser" | "router" | "matchmaker" | "mentor" | "scheduler" | "certifier";
  name: string;
  job: string;
  step: "scan" | "appraise" | "route" | "parts" | "pickup" | "certificate";
}

export const AGENTS: AgentInfo[] = [
  { id: "scout", name: "Scout", job: "Identifies the device and its condition from the scan", step: "scan" },
  { id: "appraiser", name: "Appraiser", job: "Estimates what is reusable, repairable, recyclable or hazardous, plus value and weight", step: "appraise" },
  { id: "router", name: "Router", job: "Picks the best second life", step: "route" },
  { id: "matchmaker", name: "Matchmaker", job: "Finds nearby repair shops, recyclers, donation partners and maker labs", step: "route" },
  { id: "mentor", name: "Maker Mentor", job: "Shows which parts suit college projects", step: "parts" },
  { id: "scheduler", name: "Scheduler", job: "Books a pickup or drop-off slot and tracks it", step: "pickup" },
  { id: "certifier", name: "Certifier", job: "Issues a Second-Life Certificate with impact numbers", step: "certificate" },
];

export const CAPABILITIES = [
  "Scan and identify",
  "Reuse score and component breakdown",
  "Best second-life routing",
  "Nearby verified partners",
  "Doorstep pickup booking and tracking",
  "Data-safety checklist",
  "Second-Life Certificate with a QR code",
  "Student Parts Lab",
  "Impact dashboard",
  "Seven-agent orchestration",
];

export const PROBLEM_INTRO = "Old devices pile up in drawers or go to informal scrap dealers, and few reach documented recycling.";

export const PROBLEMS: { quote: string; detail: string }[] = [
  { quote: "I don't know what is still good inside my old phone.", detail: "A phone that will not turn on can still hold a working camera, motor and speaker." },
  { quote: "I don't know who I can trust with it.", detail: "Dealers, shops and drives all look alike. There is no easy way to check who is certified." },
  { quote: "What if my data leaks?", detail: "Photos, messages and accounts can stay on a device long after it leaves your hands." },
  { quote: "Informal dismantling is unsafe, and batteries catch fire.", detail: "Open-air burning and acid recovery harm workers, and a punctured battery can ignite." },
  { quote: "I have no proof it was disposed of properly.", detail: "A scrap dealer's receipt does not show where the device finally ended up." },
  { quote: "My project needs a motor, and working ones are being thrown away.", detail: "Students buy new sensors while working ones from old phones and laptops are discarded." },
];

export type Mark = "yes" | "partly" | "no";
export interface GapCell {
  mark: Mark;
  why: string;
}
export const GAP_PLAYERS = ["Scrap dealers", "Brand take-back", "Resale apps", "Municipal and NGO drives", "Repair shops", "PIXAR"];
export const GAP_ROWS: { criterion: string; cells: GapCell[] }[] = [
  {
    criterion: "Tells you what is reusable inside",
    cells: [
      { mark: "no", why: "Dealers pay by weight or metal content and do not itemise parts." },
      { mark: "partly", why: "A trade-in quotes the whole device, not a part breakdown." },
      { mark: "partly", why: "Apps grade the device overall, not component by component." },
      { mark: "no", why: "Drives collect everything and sort it later." },
      { mark: "partly", why: "A technician can diagnose, but only at the shop counter." },
      { mark: "yes", why: "The scan returns a status, value and note for every component." },
    ],
  },
  {
    criterion: "Matches the best second life",
    cells: [
      { mark: "no", why: "Everything goes one way: strip it or melt it." },
      { mark: "no", why: "Offers exchange credit or recycling, nothing in between." },
      { mark: "partly", why: "Only offers resale, so dead devices are turned away." },
      { mark: "no", why: "Collects for recycling only." },
      { mark: "partly", why: "Offers repair, and rarely suggests donating or parts reuse." },
      { mark: "yes", why: "Ranks five routes and disables unsafe ones with a reason." },
    ],
  },
  {
    criterion: "Doorstep pickup",
    cells: [
      { mark: "partly", why: "Some dealers collect, usually on their own schedule." },
      { mark: "partly", why: "Pickup depends on the brand and the city." },
      { mark: "yes", why: "Most resale apps book a pickup at your door." },
      { mark: "no", why: "You bring the device on the day of the drive." },
      { mark: "no", why: "You carry the device to the shop." },
      { mark: "yes", why: "The Scheduler books a slot and tracks it to the end." },
    ],
  },
  {
    criterion: "Proof of responsible handling",
    cells: [
      { mark: "no", why: "No paperwork on where the device ends up." },
      { mark: "partly", why: "Some brands share a recycling confirmation." },
      { mark: "no", why: "A receipt shows the sale, not the end of life." },
      { mark: "partly", why: "Organisers may report totals, rarely per device." },
      { mark: "no", why: "A repair bill is not a disposal record." },
      { mark: "yes", why: "The Certifier issues a certificate with a verification QR code." },
    ],
  },
  {
    criterion: "Parts reused in student projects",
    cells: [
      { mark: "no", why: "Parts are melted or stripped for metal." },
      { mark: "no", why: "Parts return to the brand's own streams." },
      { mark: "no", why: "Resale needs whole working devices." },
      { mark: "no", why: "Parts are not set aside for makers." },
      { mark: "no", why: "Shops keep spares for repairs, not for projects." },
      { mark: "yes", why: "The Student Parts Lab reserves motors, sensors and speakers for projects." },
    ],
  },
];

export const SEGMENTS = [
  {
    id: "households",
    name: "Households",
    need: "A drawer of old phones and laptops, and no idea what to do with them safely.",
    gives: "A scan, a clear best route, a pickup at the door and a certificate.",
    pays: "Nobody. PIXAR is free for individuals.",
  },
  {
    id: "students",
    name: "Students and maker labs",
    need: "Cheap motors, sensors and speakers for coursework and club projects.",
    gives: "The Student Parts Lab: reserve salvaged parts and see project ideas that fit them.",
    pays: "Nobody. Maker labs may pay a small fee on a parts marketplace later.",
  },
  {
    id: "campuses",
    name: "Campuses and hostels",
    need: "A tidy, trusted way to clear e-waste and show progress on sustainability goals.",
    gives: "Drop boxes with QR codes, a leaderboard and impact reports.",
    pays: "The campus pays for a programme with impact reports.",
  },
  {
    id: "partners",
    name: "Partners: repair, recycle, donate",
    need: "A steady, qualified stream of devices matched to what they handle.",
    gives: "Matched leads, scheduled pickups and a partner dashboard.",
    pays: "Partners pay lead and pickup fees and share margin on refurbished resale.",
  },
];

export const EARLY_ADOPTERS = ["Eco clubs", "Hostels", "Maker labs", "Residential societies", "Small offices on an IT refresh"];

export const PROMISE = "Scan any old device. PIXAR tells you what it is worth, where it should go, and proves it got there.";
export const ONE_LINER = "Google Lens for old gadgets, plus doorstep pickup, plus a verified green certificate.";
export const BEATS = [
  { word: "Know it.", line: "Scan the device and see what is still good inside, with a reuse score." },
  { word: "Route it.", line: "The best second life, from five options, with a partner nearby." },
  { word: "Prove it.", line: "A Second-Life Certificate with a QR code and impact numbers." },
  { word: "Reuse it.", line: "Motors, sensors and speakers go to students for real projects." },
];

export const ACQUISITION = [
  "Colleges and hostels",
  "Student ambassadors",
  "Eco and maker clubs",
  "Residential societies",
  "Repair-shop partners",
  "Instagram and LinkedIn",
  "CSR drives",
];
export const DISTRIBUTION = ["Web app (PWA)", "WhatsApp photo scans", "Campus drop boxes with QR codes", "Partner dashboards"];
/** acquisition index -> distribution indices */
export const CHANNEL_LINKS: number[][] = [[0, 2], [0, 1], [0, 2], [0, 1], [3], [0], [2, 3]];

export const REVENUE = [
  { name: "Individuals", tag: "Free", how: "Scanning, routing, pickup and the certificate are free for individuals." },
  { name: "Partners", tag: "Pay", how: "Lead and pickup fees, plus a margin share on refurbished resale." },
  { name: "Campuses", tag: "Pay", how: "A programme fee that includes drop boxes and impact reports." },
  { name: "CSR and ESG sponsors", tag: "Pay", how: "Sponsors fund collection drives and receive verified impact." },
  { name: "Producers", tag: "Pay", how: "Collection and verification support under India's EPR framework." },
  { name: "Maker parts marketplace", tag: "Pay", how: "A small fee when salvaged parts are reserved by students." },
];

export const COSTS = [
  { name: "Operations and team", weight: 42, items: ["Partner onboarding and verification", "Pickup coordination", "Support", "Core team"] },
  { name: "Technology", weight: 26, items: ["Vision and language model APIs", "Hosting", "Maps"] },
  { name: "Growth", weight: 18, items: ["Campus ambassadors", "Events", "Content on Instagram and LinkedIn"] },
  { name: "Compliance and audits", weight: 14, items: ["Partner audits", "Certificate records", "EPR documentation"] },
];

export const FLYWHEEL = [
  { name: "More scans", line: "Every scan teaches the system what real devices look like." },
  { name: "Better routing", line: "Outcome data from condition to best route sharpens each recommendation." },
  { name: "More trusted partners", line: "Reliable routing sends partners better leads, so more of them join." },
  { name: "More pickups", line: "Nearby verified partners make doorstep pickup quick and dependable." },
  { name: "More data", line: "Each completed pickup returns a verified outcome that feeds the next scan." },
];
export const ADVANTAGES = [
  "One scan triggers the whole chain through agents.",
  "A verified local partner network.",
  "Outcome data from condition to best route that improves routing.",
  "A campus and maker community loop that supplies devices and demand for parts.",
  "Traceable certificates designed around India's EPR framework.",
  "SDG 12 alignment that attracts CSR and institutions.",
];

export const SDG = {
  headline: "SDG 12: Responsible consumption and production",
  targets: [
    { id: "12.5", text: "Reduce waste through prevention, reduction, recycling and reuse." },
    { id: "12.4", text: "Environmentally sound management of wastes." },
  ],
  supporting: [
    { id: "SDG 4", text: "Maker-lab reuse puts hardware in students' hands." },
    { id: "SDG 13", text: "Climate action through avoided embodied carbon." },
  ],
};

export const SIM_VS_REAL = [
  ["Scan and identify", "Scripted per sample", "Vision model on photos, with a human check"],
  ["Reuse appraisal", "Rules engine on mock data", "Model plus partner price feedback"],
  ["Partner search", "Fictional partners, abstract map", "Verified partner onboarding, maps API"],
  ["Pickup booking", "In-browser form", "Partner scheduling and logistics"],
  ["Certificate", "Simulated, QR to a placeholder", "Verifiable record tied to recycler documentation and India's EPR portal"],
  ["Impact numbers", "Illustrative factors", "Sourced life-cycle values"],
];

export const ROADMAP = [
  { phase: "Phase 1", name: "Campus pilot", line: "Hostels and a maker lab prove the loop from scan to certificate." },
  { phase: "Phase 2", name: "City rollout", line: "Residential societies and CSR partners widen supply and demand." },
  { phase: "Phase 3", name: "Multi-city scale", line: "Producer partnerships and verified certificates at scale." },
];

export const METRIC_DEFS = [
  "Devices scanned",
  "Scan-to-pickup conversion",
  "Pickups completed",
  "kg diverted from informal channels",
  "Repair and reuse rate",
  "CO\u2082e avoided (illustrative until validated)",
  "Student parts reserved and projects built",
  "Partner reply time and on-time pickup rate",
  "Repeat users and NPS",
  "Institutions onboarded",
];

export const CANVAS = {
  problem: ["Do not know what is still good inside", "Do not know whom to trust", "Data leaks and no proof of disposal", "Unsafe informal dismantling", "Students lack cheap sensors and motors"],
  alternatives: ["Scrap dealers", "Brand take-back", "Resale apps", "Municipal and NGO drives", "Repair shops"],
  segments: ["Urban households with old devices", "College students and maker clubs", "Campuses and hostels", "Early adopters: eco clubs, hostels, maker labs, residential societies, small offices"],
  uvp: [PROMISE],
  concept: ONE_LINER,
  solution: ["Scan and identify", "Reuse score by component", "Best second-life routing", "Verified nearby partners", "Pickup booking and tracking", "Data-safety checklist", "Certificate with QR code", "Student Parts Lab"],
  channels: ["Colleges, hostels, ambassadors, clubs", "Residential societies, CSR drives", "Web app, WhatsApp scans", "Campus drop boxes, partner dashboards"],
  revenue: ["Free for individuals", "Partner lead and pickup fees, resale margin share", "Campus programmes with impact reports", "CSR and ESG sponsors", "Producer EPR support", "Maker parts marketplace fee"],
  cost: ["Technology: model APIs, hosting, maps", "Operations: onboarding, pickups, support", "Growth: ambassadors, events", "Compliance and audits", "Team"],
  metrics: ["Devices scanned", "Scan-to-pickup conversion", "Pickups completed", "kg diverted", "Repair and reuse rate", "CO\u2082e avoided (illustrative)", "Student parts reserved", "Reply time and on-time rate", "Repeat users and NPS", "Institutions onboarded"],
  advantage: ADVANTAGES,
};
