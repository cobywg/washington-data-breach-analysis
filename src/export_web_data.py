"""Generate the website's state summary from the Washington breach CSV."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


REPORTING_YEARS = (2022, 2023, 2024, 2025)
PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_CSV = (
    PROJECT_ROOT
    / "data"
    / "Data_Breach_Notifications_Affecting_Washington_Residents_20260813.csv"
)
OUTPUT_JSON = PROJECT_ROOT / "web" / "app" / "breach-summary.json"

STATE_METADATA = {
    "AL": ("Alabama", "01"), "AK": ("Alaska", "02"),
    "AZ": ("Arizona", "04"), "AR": ("Arkansas", "05"),
    "CA": ("California", "06"), "CO": ("Colorado", "08"),
    "CT": ("Connecticut", "09"), "DE": ("Delaware", "10"),
    "DC": ("District of Columbia", "11"), "FL": ("Florida", "12"),
    "GA": ("Georgia", "13"), "HI": ("Hawaii", "15"),
    "ID": ("Idaho", "16"), "IL": ("Illinois", "17"),
    "IN": ("Indiana", "18"), "IA": ("Iowa", "19"),
    "KS": ("Kansas", "20"), "KY": ("Kentucky", "21"),
    "LA": ("Louisiana", "22"), "ME": ("Maine", "23"),
    "MD": ("Maryland", "24"), "MA": ("Massachusetts", "25"),
    "MI": ("Michigan", "26"), "MN": ("Minnesota", "27"),
    "MS": ("Mississippi", "28"), "MO": ("Missouri", "29"),
    "MT": ("Montana", "30"), "NE": ("Nebraska", "31"),
    "NV": ("Nevada", "32"), "NH": ("New Hampshire", "33"),
    "NJ": ("New Jersey", "34"), "NM": ("New Mexico", "35"),
    "NY": ("New York", "36"), "NC": ("North Carolina", "37"),
    "ND": ("North Dakota", "38"), "OH": ("Ohio", "39"),
    "OK": ("Oklahoma", "40"), "OR": ("Oregon", "41"),
    "PA": ("Pennsylvania", "42"), "RI": ("Rhode Island", "44"),
    "SC": ("South Carolina", "45"), "SD": ("South Dakota", "46"),
    "TN": ("Tennessee", "47"), "TX": ("Texas", "48"),
    "UT": ("Utah", "49"), "VT": ("Vermont", "50"),
    "VA": ("Virginia", "51"), "WA": ("Washington", "53"),
    "WV": ("West Virginia", "54"), "WI": ("Wisconsin", "55"),
    "WY": ("Wyoming", "56"),
}


def aggregate_categories(data: pd.DataFrame, column: str) -> list[dict]:
    """Return display-ready breach and affected totals for one category field."""
    categorized = data.assign(
        Category=data[column].astype("string").str.strip().fillna("Not reported")
    )
    categorized.loc[categorized["Category"].eq(""), "Category"] = "Not reported"

    grouped = (
        categorized.groupby("Category")
        .agg(breaches=("Id", "nunique"), affected=("Affected", "sum"))
        .reset_index()
        .sort_values(["breaches", "Category"], ascending=[False, True])
    )

    return [
        {
            "category": str(row.Category),
            "breaches": int(row.breaches),
            "affected": int(row.affected),
        }
        for row in grouped.itertuples(index=False)
    ]


def build_summary(csv_path: Path = SOURCE_CSV) -> dict:
    """Aggregate 2022–2025 notifications for the website's maps and charts."""
    data = pd.read_csv(csv_path)
    required = {
        "Id",
        "YearText",
        "EntityState",
        "WashingtoniansAffected",
        "DataBreachCause",
        "CyberattackType",
        "IndustryType",
    }
    missing = required.difference(data.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")

#conver to number, convert invalid into NAN, check if years only contain wanted years
    data["ReportingYear"] = pd.to_numeric(data["YearText"], errors="coerce")
    filtered = data.loc[data["ReportingYear"].isin(REPORTING_YEARS)].copy()

    #check for duplicates
    if filtered["Id"].duplicated().any():
        raise ValueError("Duplicate notification IDs found in selected years")

    #cleaned up data, created new variable.
    filtered["EntityState"] = (
        filtered["EntityState"].astype("string").str.strip().str.upper()
    )
    filtered["EntityState"] = filtered["EntityState"].replace({"IOWA": "IA"})
    filtered["StateKnown"] = filtered["EntityState"].isin(STATE_METADATA)
    filtered["Affected"] = pd.to_numeric(
        filtered["WashingtoniansAffected"]
        .astype("string")
        .str.replace(",", "", regex=False),
        errors="coerce",
    )
    #only keep valid states, group by state and agg data
    known = filtered.loc[filtered["StateKnown"]]
    grouped = known.groupby("EntityState").agg(
        breaches=("Id", "nunique"),
        affected=("Affected", "sum"),
    )

    states = []
    for abbreviation, (name, fips) in STATE_METADATA.items():
        if abbreviation in grouped.index:
            row = grouped.loc[abbreviation]
            breaches = int(row["breaches"])
            affected = int(row["affected"])
        else:
            breaches = 0
            affected = 0

        states.append(
            {
                "abbreviation": abbreviation,
                "name": name,
                "fips": fips,
                "breaches": breaches,
                "affected": affected,
            }
        )

    unknown = filtered.loc[~filtered["StateKnown"]]
    cyberattacks = filtered.loc[filtered["DataBreachCause"].eq("Cyberattack")]

    return {
        "reportingYears": list(REPORTING_YEARS),
        "totals": {
            "breaches": int(filtered["Id"].nunique()),
            "affected": int(filtered["Affected"].sum()),
            "missingAffected": int(filtered["Affected"].isna().sum()),
        },
        "mapped": {
            "breaches": int(known["Id"].nunique()),
            "affected": int(known["Affected"].sum()),
        },
        "unknownState": {
            "breaches": int(unknown["Id"].nunique()),
            "affected": int(unknown["Affected"].sum()),
        },
        "states": states,
        "charts": {
            "cyberattackTypes": aggregate_categories(
                cyberattacks, "CyberattackType"
            ),
            "industries": aggregate_categories(filtered, "IndustryType"),
        },
    }


def main() -> None:
    summary = build_summary()
    OUTPUT_JSON.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {OUTPUT_JSON.relative_to(PROJECT_ROOT)} from "
        f"{summary['totals']['breaches']:,} notifications."
    )


if __name__ == "__main__":
    main()
