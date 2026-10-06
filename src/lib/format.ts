const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const num = (n: number): string => nf.format(Math.round(n));

export const dec = (n: number, digits = 1): string =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);

/** Rupee amount, en-IN grouping. */
export const inr = (n: number): string => `\u20B9${nf.format(Math.round(n))}`;

export const roundTo = (n: number, step: number): number => Math.round(n / step) * step;

export const inrRange = (r: [number, number]): string => `${inr(r[0])} to ${inr(r[1])}`;

export const kg = (n: number): string => `${dec(n, n < 1 ? 2 : 1)} kg`;

export const pct = (n: number): string => `${Math.round(n * 100)}%`;
