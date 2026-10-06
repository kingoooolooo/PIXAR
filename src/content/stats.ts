export interface Stat {
  id: string;
  label: string;
  value: number;
  display: string;
  unit: string;
  year: number | string;
  source: string;
  /** true means the figure should be re-checked against the latest publication before a real claim. */
  verify: boolean;
}

const GEM = "UN Global E-waste Monitor 2024 (UNITAR and ITU)";

export const STATS: Record<string, Stat> = {
  generated: {
    id: "generated",
    label: "E-waste generated worldwide, about 7.8 kg per person",
    value: 62,
    display: "62",
    unit: "million tonnes",
    year: 2022,
    source: GEM,
    verify: false,
  },
  formalShare: {
    id: "formalShare",
    label: "Documented as formally collected and recycled (13.8 million tonnes)",
    value: 22.3,
    display: "22.3",
    unit: "%",
    year: 2022,
    source: GEM,
    verify: false,
  },
  resources: {
    id: "resources",
    label: "Recoverable natural resources unaccounted for",
    value: 62,
    display: "US$ 62",
    unit: "billion",
    year: 2022,
    source: GEM,
    verify: false,
  },
  projection: {
    id: "projection",
    label: "Projected e-waste by 2030, up 33%. Generation grows about five times faster than documented recycling",
    value: 82,
    display: "82",
    unit: "million tonnes",
    year: 2030,
    source: `${GEM}, UNITAR press release`,
    verify: false,
  },
  indiaRules: {
    id: "indiaRules",
    label:
      "India's E-Waste (Management) Rules, 2022: notified 2 November 2022, in force since 1 April 2023, with registration and certificates through a central CPCB online EPR portal",
    value: 2022,
    display: "2022",
    unit: "Rules",
    year: 2022,
    source: "MoEFCC and CPCB",
    verify: false,
  },
  indiaGenerated: {
    id: "indiaGenerated",
    label: "E-waste generated in India, CPCB estimate (newer CPCB figures use a different scope and method)",
    value: 1601155,
    display: "16.0 lakh",
    unit: "tonnes",
    year: "FY 2021 to 22",
    source: "CPCB estimate, reply in Parliament",
    verify: true,
  },
};
