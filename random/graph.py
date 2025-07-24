from datetime import datetime
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio
import io, base64
from nba_api.stats.endpoints import commonplayerinfo

def generate_plot(df, name):
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=df["SEASON_ID"],
        y=df["PTS"],
        mode="lines+markers",
        name="Points",
        line=dict(color="royalblue", width=2),
        marker=dict(size=8)
    ))

    fig.update_layout(
        title=f"{name.title()}: Points Per Season",
        xaxis_title="Season",
        yaxis_title="Total Points",
        template="plotly_white",
        margin=dict(t=40, b=40, l=40, r=40)
    )

    # Convert the Plotly figure to HTML div
    return pio.to_html(fig, full_html=False)

if __name__ == "__main__":
    data = {
        "SEASON_ID": ["2018-19", "2019-20", "2020-21", "2021-22", "2022-23"],
        "PTS": [1200, 1500, 1400, 1600, 1800]
    }
    df = pd.DataFrame(data)
    html_str = generate_plot(df, "Test Player")

    # Save to file
    with open("test_plot.html", "w", encoding="utf-8") as f:
        f.write(html_str)

    print("✅ Plot saved to test_plot.html")