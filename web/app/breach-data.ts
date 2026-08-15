import summary from "./breach-summary.json";

export type MapMetric = "breaches" | "affected";

export type StateBreachData = {
  abbreviation: string;
  name: string;
  fips: string;
  breaches: number;
  affected: number;
};

export const breachSummary = summary;
export const breachCounts = summary.states as StateBreachData[];
export const countsByFips = Object.fromEntries(
  breachCounts.map((state) => [state.fips, state]),
) as Record<string, StateBreachData>;
