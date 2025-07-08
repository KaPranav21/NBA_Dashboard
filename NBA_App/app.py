from flask import Flask, render_template, request
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
import pandas as pd
import matplotlib.pyplot as plt
import io, base64

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    plot_url = None
    table_html = None
    error = None

    if request.method == "POST":
        name = request.form["player_name"]
        player = players.find_players_by_full_name(name)

        if not player:
            error = f"Player '{name}' not found."
        else:
            player_id = player[0]["id"]
            stats = playercareerstats.PlayerCareerStats(player_id=player_id)
            df = stats.get_data_frames()[0]
            df = df[df["LEAGUE_ID"] == "00"]  # NBA only

            if df.empty:
                error = f"No NBA stats for {name}."
            else:
                table_html = df[["SEASON_ID", "TEAM_ABBREVIATION", "GP", "PTS", "REB", "AST"]].to_html(index=False)

                # Plot points per season
                fig, ax = plt.subplots(figsize=(8,4))
                ax.plot(df["SEASON_ID"], df["PTS"], marker="o")
                ax.set_title(f"{name.title()}: Points Per Season")
                ax.set_xlabel("Season")
                ax.set_ylabel("Total Points")
                plt.xticks(rotation=45)
                plt.tight_layout()

                buf = io.BytesIO()
                plt.savefig(buf, format="png")
                buf.seek(0)
                plot_url = base64.b64encode(buf.read()).decode("utf8")
                plt.close()

    return render_template("index.html", table=table_html, plot_url=plot_url, error=error)

if __name__ == "__main__":
    app.run(debug=True)
