import pandas as pd
import matplotlib.pyplot as plt

US_STATE_CODES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC",
}

# def read ():
#read.cvslink
#print.cvlink(10rows)
#print all column names
#print number of rowss






def inspect_data(csv_path):
    df = pd.read_csv(csv_path)

    print(df.head(10))

    for column in df.columns:
        print(column)

    print("Number of rows:", len(df))

    return df

def plot_cyberattack_types(df):
    attack_counts = (
        df["IndustryType"]
        .fillna("Not reported")
        .value_counts()
        .sort_values()
    )

    attack_counts.plot(kind="barh")

    plt.title("Reported Breaches by Cyberattack Type")
    plt.xlabel("Number of breach notifications")
    plt.ylabel("Cyberattack type")
    plt.tight_layout()
    plt.show()

data = inspect_data(
    "data/Data_Breach_Notifications_Affecting_Washington_Residents_20260813.csv"
)

plot_cyberattack_types(data)

#barchart function:
#pass data into function
#access the Cyberattack type variable and use a toll to create the chart
#Also Data breach Cause variable
# Maybe other chart would be better? want to get a idea of data before cleaning.


def clean_breach_data(
    breach_data: pandas.DataFrame,
    start_year: int = 2022,
    end_year: int = 2025,
) -> pandas.DataFrame:
    """Prepare complete AGO reporting years for state-level mapping.

    AGO reporting years run from July 24 through July 23. The default range
    therefore selects the four reporting years 2022, 2023, 2024, and 2025.
    Unknown entity locations are retained so they can be disclosed separately
    rather than silently omitted from the analysis.
    """
    required_columns = {"Id", "YearText", "EntityState"}
    missing_columns = required_columns.difference(breach_data.columns)
    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise ValueError(f"Missing required columns: {missing}")

    if start_year > end_year:
        raise ValueError("start_year must be less than or equal to end_year")

    cleaned = breach_data.copy()
    cleaned["ReportingYear"] = pandas.to_numeric(
        cleaned["YearText"], errors="coerce"
    ).astype("Int64")
    cleaned = cleaned.loc[
        cleaned["ReportingYear"].between(start_year, end_year)
    ].copy()

    states = cleaned["EntityState"].astype("string").str.strip().str.upper()
    states = states.replace({"IOWA": "IA", "": pandas.NA})
    cleaned["EntityState"] = states.where(states.isin(US_STATE_CODES), "Unknown")
    cleaned["StateKnown"] = cleaned["EntityState"].ne("Unknown")

    return cleaned.reset_index(drop=True)


def aggregate_breaches_by_state(
        cleaned_data: pandas.DataFrame,
) -> pandas.DataFrame:
    """Count unique breach notifications for every state and DC."""
    required_columns = {"Id", "EntityState"}
    missing_columns = required_columns.difference(cleaned_data.columns)
    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise ValueError(f"Missing required columns: {missing}")

    known_states = cleaned_data.loc[
        cleaned_data["EntityState"].isin(US_STATE_CODES)
    ]
    breach_counts = known_states.groupby("EntityState")["Id"].nunique()

    return (
        breach_counts.reindex(sorted(US_STATE_CODES), fill_value=0)
        .rename("BreachCount")
        .reset_index()
    )
