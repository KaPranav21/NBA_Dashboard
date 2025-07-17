from datetime import datetime
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
import pandas as pd
import matplotlib.pyplot as plt
import io, base64
from nba_api.stats.endpoints import commonplayerinfo

def get_player_stats(player_name):
    player_id = get_player_id(player_name)
    if not player_id:
        return {"error": f"Player '{player_name}' not found."}

    df = get_career_stats(player_id)
    if df.empty:
        return {"error": f"No NBA stats for {player_name}."}

    physicals = get_player_physicals(player_id)
    plot_base64 = generate_plot(df, player_name)

    return {
        "table": df[["SEASON_ID", "TEAM_ABBREVIATION", "GP", "PTS", "REB", "AST"]].to_dict(orient="records"),
        "plot": plot_base64,
        "physicals": physicals
    }


def get_player_id(name):
    player = players.find_players_by_full_name(name)
    if not player:
        return None
    return player[0]["id"]

def get_career_stats(player_id):
    stats = playercareerstats.PlayerCareerStats(player_id=player_id)
    df = stats.get_data_frames()[0]
    return df[df["LEAGUE_ID"] == "00"]

def get_player_physicals(player_id):
    info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    info_row = info.get_data_frames()[0].iloc[0]
    height = info_row["HEIGHT"]
    weight = info_row["WEIGHT"]
    birthdate = info_row["BIRTHDATE"]
    age = calculate_age(birthdate)
    return {"height": height, "weight": weight, "age": age}

def generate_plot(df, name):
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.plot(df["SEASON_ID"], df["PTS"], marker="o", color="royalblue", linewidth=2)
    ax.set_title(f"{name.title()}: Points Per Season")
    ax.set_xlabel("Season")
    ax.set_ylabel("Total Points")
    plt.xticks(rotation=45)
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return encoded

def calculate_age(birthdate_str):
    birthdate = datetime.strptime(birthdate_str, "%Y-%m-%dT%H:%M:%S")
    today = datetime.today()
    return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))