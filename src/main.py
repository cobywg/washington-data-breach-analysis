import pandas as pd
import matplotlib.pyplot as plt

# Read in csv data, print first 10 rows, 

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

