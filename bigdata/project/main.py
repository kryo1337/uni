from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.window import Window
import os
from pathlib import Path

os.environ['SPARK_LOCAL_IP'] = '127.0.0.1'
os.environ['_JAVA_OPTIONS'] = '-Duser.name=spark_user'

spark = SparkSession.builder \
    .appName("Valorant Momentum Analysis") \
    .config("spark.driver.host", "127.0.0.1") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.driver.memory", "4g") \
    .config("spark.executor.memory", "2g") \
    .getOrCreate()

print("Spark session initialized successfully!")

# Function to load all round data from 2021-2025
def load_all_round_data(base_path):
    dfs = []
    for year in range(2021, 2026):
        year_path = f"{base_path}/vct_{year}/matches/win_loss_methods_round_number.csv"
        if os.path.exists(year_path):
            print(f"Loading: {year_path}")
            df = spark.read.csv(year_path, header=True, inferSchema=True)
            dfs.append(df)
    
    # Combine all years
    combined_df = dfs[0]
    for df in dfs[1:]:
        combined_df = combined_df.union(df)
    
    return combined_df

# Load data
rounds_df = load_all_round_data("valodata")
print(f"Total records loaded: {rounds_df.count()}")

# Create unique key for each match on each map
rounds_df = rounds_df.withColumn(
    "Match_Map_Key",
    concat_ws("_", col("Match Name"), col("Map"))
)

# Get all rounds and their outcomes (both teams per round)
all_rounds = rounds_df.select("Match Name", "Map", "Round Number", "Team", "Outcome")

# Create column for round win (1 if won, 0 if lost)
all_rounds_with_win = all_rounds.withColumn(
    "Round_Won",
    when(col("Outcome") == "Win", 1).otherwise(0)
)

# Define window function: for each team in each match, order by round number
window_for_momentum = Window.partitionBy("Match Name", "Map", "Team") \
    .orderBy("Round Number") \
    .rangeBetween(-4, 0)  # Last 5 rounds (current + 4 previous)

# Calculate momentum state (how many of last 5 rounds team won)
with_momentum = all_rounds_with_win.withColumn(
    "Momentum_State",
    sum("Round_Won").over(window_for_momentum)
).withColumn(
    "Next_Round_Won",
    lead("Round_Won", 1).over(
        Window.partitionBy("Match Name", "Map", "Team").orderBy("Round Number")
    )
)

# Filter only rounds where we know the outcome of the next round (exclude last round)
valid_data = with_momentum.filter(
    (col("Next_Round_Won").isNotNull()) & 
    (col("Round Number") < 25)  # Before overtime
)

print(f"\nValid rounds for analysis: {valid_data.count()}")

# Calculate win probability for each momentum state
momentum_stats = valid_data.groupBy("Momentum_State") \
    .agg(
        count("*").alias("Total_Occurrences"),
        sum("Next_Round_Won").alias("Rounds_Won_After"),
        (sum("Next_Round_Won") / count("*") * 100).alias("Win_Probability_Percent")
    ) \
    .orderBy("Momentum_State")

print("\n=== MOMENTUM ANALYSIS RESULTS ===")
momentum_stats.show()

# Calculate statistics
print("\n=== DETAILED STATISTICS ===")
summary = valid_data.groupBy("Momentum_State") \
    .agg(
        count("*").alias("Sample_Size"),
        round(sum("Next_Round_Won") / count("*") * 100, 2).alias("Win_Probability_%")
    ) \
    .orderBy("Momentum_State")

summary.show()

# Save results to CSV
momentum_stats.coalesce(1).write \
    .mode("overwrite") \
    .option("header", "true") \
    .csv("momentum_results")

print("Results saved to: momentum_results/")

spark.stop()
print("\nAnalysis complete!")
