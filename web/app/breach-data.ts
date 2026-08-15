type StateBreachCount = {
  abbreviation: string;
  name: string;
  fips: string;
  count: number;
};

export const breachCounts: StateBreachCount[] = [
  ["AL", "Alabama", "01", 2], ["AK", "Alaska", "02", 2],
  ["AZ", "Arizona", "04", 13], ["AR", "Arkansas", "05", 1],
  ["CA", "California", "06", 82], ["CO", "Colorado", "08", 13],
  ["CT", "Connecticut", "09", 9], ["DE", "Delaware", "10", 4],
  ["DC", "District of Columbia", "11", 0], ["FL", "Florida", "12", 26],
  ["GA", "Georgia", "13", 25], ["HI", "Hawaii", "15", 1],
  ["ID", "Idaho", "16", 8], ["IL", "Illinois", "17", 35],
  ["IN", "Indiana", "18", 5], ["IA", "Iowa", "19", 7],
  ["KS", "Kansas", "20", 4], ["KY", "Kentucky", "21", 5],
  ["LA", "Louisiana", "22", 0], ["ME", "Maine", "23", 4],
  ["MD", "Maryland", "24", 7], ["MA", "Massachusetts", "25", 18],
  ["MI", "Michigan", "26", 14], ["MN", "Minnesota", "27", 7],
  ["MS", "Mississippi", "28", 1], ["MO", "Missouri", "29", 10],
  ["MT", "Montana", "30", 4], ["NE", "Nebraska", "31", 5],
  ["NV", "Nevada", "32", 12], ["NH", "New Hampshire", "33", 0],
  ["NJ", "New Jersey", "34", 18], ["NM", "New Mexico", "35", 2],
  ["NY", "New York", "36", 30], ["NC", "North Carolina", "37", 11],
  ["ND", "North Dakota", "38", 2], ["OH", "Ohio", "39", 16],
  ["OK", "Oklahoma", "40", 3], ["OR", "Oregon", "41", 22],
  ["PA", "Pennsylvania", "42", 38], ["RI", "Rhode Island", "44", 1],
  ["SC", "South Carolina", "45", 2], ["SD", "South Dakota", "46", 1],
  ["TN", "Tennessee", "47", 15], ["TX", "Texas", "48", 37],
  ["UT", "Utah", "49", 6], ["VT", "Vermont", "50", 4],
  ["VA", "Virginia", "51", 8], ["WA", "Washington", "53", 236],
  ["WV", "West Virginia", "54", 0], ["WI", "Wisconsin", "55", 10],
  ["WY", "Wyoming", "56", 0],
].map(([abbreviation, name, fips, count]) => ({
  abbreviation: abbreviation as string,
  name: name as string,
  fips: fips as string,
  count: count as number,
}));

export const countsByFips = Object.fromEntries(
  breachCounts.map((state) => [state.fips, state]),
) as Record<string, StateBreachCount>;
