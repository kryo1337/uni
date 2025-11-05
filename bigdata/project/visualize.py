import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 7)

# Find and load CSV
csv_file = list(Path('momentum_results').glob('part-*.csv'))[0]
print(f"Loading: {csv_file.name}")

momentum_stats = pd.read_csv(csv_file)
print(f"Loaded {len(momentum_stats)} rows\n")

primary = momentum_stats[momentum_stats['Momentum_State'] <= 5].copy()

print("Creating visualization 1: Main bar chart...")
fig, ax = plt.subplots(figsize=(12, 7))

bars = ax.bar(
    primary['Momentum_State'].astype(int),
    primary['Win_Probability_Percent'],
    color=['#FF4444', '#FF8844', '#FFBB44', '#BBFF44', '#44FF44', '#44FFBB'],
    edgecolor='black', linewidth=1.5, alpha=0.8
)

for bar in bars:
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'{height:.1f}%', ha='center', va='bottom',
            fontsize=11, fontweight='bold')

ax.axhline(y=50, color='gray', linestyle='--', linewidth=2, alpha=0.5, label='50% (Neutral)')
ax.set_xlabel('Momentum State (Wins out of Last 5 Rounds)', fontsize=13, fontweight='bold')
ax.set_ylabel('Win Probability (%)', fontsize=13, fontweight='bold')
ax.set_title('Valorant Round Momentum Analysis (2021-2025)\nBig Data Analysis using PySpark', 
             fontsize=15, fontweight='bold', pad=20)
ax.set_xticks(range(0, 6))
ax.set_ylim(0, 75)
ax.grid(axis='y', alpha=0.3)
ax.legend(fontsize=11)

plt.tight_layout()
plt.savefig('momentum_visualization_main.png', dpi=300, bbox_inches='tight')
print("Saved: momentum_visualization_main.png")
plt.close()

print("Creating visualization 2: Statistics table...")
fig, ax = plt.subplots(figsize=(12, 7))
ax.axis('tight')
ax.axis('off')

table_data = []
for _, row in primary.iterrows():
    momentum = int(row['Momentum_State'])
    total = int(row['Total_Occurrences'])
    wins = int(row['Rounds_Won_After'])
    prob = row['Win_Probability_Percent']
    
    table_data.append([
        f"{momentum}/5",
        f"{total:,}",
        f"{wins:,}",
        f"{prob:.2f}%"
    ])

columns = ['Momentum\nState', 'Sample\nSize', 'Rounds\nWon', 'Win\nProbability']
table = ax.table(
    cellText=table_data,
    colLabels=columns,
    cellLoc='center',
    loc='center',
    colWidths=[0.2, 0.3, 0.3, 0.2]
)

table.auto_set_font_size(False)
table.set_fontsize(12)
table.scale(1, 3)

for i in range(4):
    table[(0, i)].set_facecolor('#2E75B6')
    table[(0, i)].set_text_props(weight='bold', color='white', fontsize=13)

colors = ['#FF6B6B', '#FFB84D', '#FFEB99', '#A8D5BA', '#52B788', '#2D6A4F']
for i in range(1, len(table_data) + 1):
    for j in range(4):
        table[(i, j)].set_facecolor(colors[i-1])
        table[(i, j)].set_text_props(weight='bold', fontsize=12)

plt.title('Momentum Analysis - Detailed Statistics\n(VCT 2021-2025 Professional Valorant Matches)', 
          fontsize=14, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('momentum_statistics_table.png', dpi=300, bbox_inches='tight')
print("Saved: momentum_statistics_table.png")
plt.close()

print("Creating visualization 3: Trend analysis...")
fig, ax = plt.subplots(figsize=(12, 7))

states = primary['Momentum_State'].astype(int)
probs = primary['Win_Probability_Percent']
samples = primary['Total_Occurrences']
std_errs = (probs * (100 - probs) / samples) ** 0.5

ax.plot(states, probs, 'o-', linewidth=3, markersize=10, color='#2E75B6', label='Win Probability Trend')

ax.fill_between(states, probs - 1.96*std_errs, probs + 1.96*std_errs,
                alpha=0.2, color='#2E75B6', label='95% Confidence Interval')

ax.scatter([0, 5], [probs.iloc[0], probs.iloc[5]], 
          s=300, color=['red', 'green'], zorder=5, edgecolors='black', linewidth=2)

ax.annotate(f'Losing Streak\n{probs.iloc[0]:.1f}%', xy=(0, probs.iloc[0]), xytext=(-0.5, probs.iloc[0]-8),
            fontsize=11, fontweight='bold', bbox=dict(boxstyle='round,pad=0.5', facecolor='#FFB6B6'),
            arrowprops=dict(arrowstyle='->', color='red', lw=2))

ax.annotate(f'Winning Streak\n{probs.iloc[5]:.1f}%', xy=(5, probs.iloc[5]), xytext=(5.3, probs.iloc[5]+5),
            fontsize=11, fontweight='bold', bbox=dict(boxstyle='round,pad=0.5', facecolor='#B6FFB6'),
            arrowprops=dict(arrowstyle='->', color='green', lw=2))

ax.set_xlabel('Consecutive Wins in Last 5 Rounds', fontsize=12, fontweight='bold')
ax.set_ylabel('Win Probability of Next Round (%)', fontsize=12, fontweight='bold')
ax.set_title('Momentum Impact on Next Round Win Probability\nwith 95% Confidence Intervals', 
             fontsize=14, fontweight='bold', pad=20)
ax.set_xticks(range(0, 6))
ax.set_ylim(20, 70)
ax.grid(True, alpha=0.3)
ax.legend(fontsize=11, loc='upper left')

plt.tight_layout()
plt.savefig('momentum_trend_analysis.png', dpi=300, bbox_inches='tight')
print("Saved: momentum_trend_analysis.png")
plt.close()

print("\n" + "="*70)
print("KEY FINDINGS - VALORANT MOMENTUM ANALYSIS")
print("="*70)

worst = primary.loc[primary['Win_Probability_Percent'].idxmin()]
best = primary.loc[primary['Win_Probability_Percent'].idxmax()]
diff = best['Win_Probability_Percent'] - worst['Win_Probability_Percent']

print(f"\nMOMENTUM IMPACT:")
print(f"   Best momentum state:  {int(best['Momentum_State'])}/5 = {best['Win_Probability_Percent']:.2f}% win probability")
print(f"   Worst momentum state: {int(worst['Momentum_State'])}/5 = {worst['Win_Probability_Percent']:.2f}% win probability")
print(f"   Difference: +{diff:.2f} percentage points")

print(f"\nINTERPRETATION:")
print(f"   A team on a {int(best['Momentum_State'])}-round winning streak has {diff:.1f}pp higher")
print(f"   probability of winning the next round compared to a {int(worst['Momentum_State'])}-round losing streak.")

print(f"\nDATA ANALYZED:")
print(f"   • Total rounds: {momentum_stats['Total_Occurrences'].sum():,}")
print(f"   • Unique momentum states: {len(momentum_stats[momentum_stats['Momentum_State'] <= 5])}")
print(f"   • Years covered: 2021-2025 (VCT seasons)")
print(f"   • Technology: Apache Spark + PySpark (Big Data)")

print(f"\nAll visualizations created successfully!")
print("="*70 + "\n")
