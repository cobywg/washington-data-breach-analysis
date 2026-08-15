# Washington Data Breach Analysis

## Project overview

This project combines geographic information systems (GIS) and cybersecurity analysis to examine the prevalence of reported data breaches affecting Washington residents. The project uses breach notifications submitted to the Washington State Attorney General's Office (AGO) and presents the results through an interactive state-level choropleth map.

The analysis addresses these questions:

1. What types of cyberattacks have increased in frequency?
2. In which states are breached entities affecting Washington residents located?
3. What industries are most frequently associated with reported cyberattacks?

## Data source and reporting years

The project uses the AGO's *Data Breach Notifications Affecting Washington Residents* dataset. In this dataset, `Year` is the reporting year in which a notice was submitted to the AGO. Because of the effective date of Washington's notification law, an AGO reporting year begins on July 24 and ends on July 23 of the following calendar year.

For example, a notice submitted on July 23, 2020, belongs to reporting year 2020, while a notice submitted on July 24, 2020, belongs to reporting year 2021.

The initial geographic analysis uses reporting years 2022 through 2025. These four complete reporting years were selected because state-location data is substantially more complete beginning in 2022. They also provide a recent period that is more useful for examining the current geographic distribution of breach notifications. The selected period contains 846 unique notifications, representing slightly more than half of the records in the full dataset.

## Data preparation

The Python cleaning process performs the following steps:

- Converts `YearText` into a numeric reporting-year field.
- Retains records from reporting years 2022-2025.
- Removes extra whitespace and standardizes entity-state values to uppercase postal abbreviations.
- Converts the inconsistent value `Iowa` to `IA`.
- Validates state abbreviations and Washington, D.C.
- Labels missing or invalid state values as `Unknown` instead of silently deleting them.
- Preserves each notification's unique `Id` for counting.

The cleaning and state-aggregation functions are located in [`src/main.py`](src/main.py).

## Geographic method

The choropleth represents the location of the **breached entity**, not the residence of the affected individuals. All notifications in the dataset involve Washington residents, but the breached organizations may be located in Washington or another state.

Records are grouped using the cleaned `EntityState` field. The number of distinct notification IDs within each state is then calculated. Counting unique IDs ensures that a breach would not be counted more than once if duplicate rows were introduced into the data. In the current dataset, all IDs in the selected period are unique, so the unique-ID count is also equal to the number of notification records.

The cleaned state abbreviations are matched to state boundaries using state FIPS codes. Map colors are assigned using breach-count categories:

- 0 breaches
- 1-9 breaches
- 10-24 breaches
- 25-49 breaches
- 50-99 breaches
- 100 or more breaches

Darker and brighter colors represent states associated with more reported breaches. The interactive map is implemented with React and Mapbox in the [`web`](web) directory.

## Missing-data limitation

Of the 846 notifications from reporting years 2022-2025, 60 records have an unknown entity state. These records represent approximately 7.1% of the selected data and are retained in the analysis but excluded from the choropleth.

Missing locations may bias the geographic results. States with more complete location reporting can appear more prominent than states with incomplete reporting. Therefore, the map should be interpreted as the distribution of breaches with a known entity state, not a complete measurement of every breach affecting Washington residents.

Future filters - for reporting year, industry, attack type, or selected states - may substantially change the visible pattern and the conclusions drawn from the map. Each filtered view will need to report its record count and missing-state percentage.

## Current status

The project currently includes:

- A reproducible Python cleaning function.
- Unique breach counts aggregated by state.
- A React and Mapbox choropleth for reporting years 2022-2025.
- Hover details, a breach-count legend, and a missing-data disclosure.

The next data-development step is to export the results from Python into a map-ready JSON file so that the website reads directly from the cleaned analysis rather than maintaining a separate copy of the state totals.
