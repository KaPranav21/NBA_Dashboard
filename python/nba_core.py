from datetime import datetime
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64
from nba_api.stats.endpoints import commonplayerinfo

def get_player_stats(player_name, stat_name="PTS"):
    player_info = players.find_players_by_full_name(player_name)
    if not player_info:
        return {"error": f"Player '{player_name}' not found."}
    
    player_id = player_info[0]["id"]
    official_name = player_info[0]["full_name"]  # This is the official name
    
    df = get_career_stats(player_id)
    if df.empty:
        return {"error": f"No NBA stats found for {official_name}."}
    
    physicals = get_player_physicals(player_id)
    averages = get_career_averages(player_id)
    plot_base64 = generate_plot(df, official_name, stat_name)

    return {
        "name": official_name,  # Return the official name here
        "table": df[["SEASON_ID", "TEAM_ABBREVIATION", "GP", "PTS", "REB", "AST"]].to_dict(orient="records"),
        "plot": plot_base64,
        "physicals": physicals,
        "averages": averages
    }

def get_player_id(name):
    """Return NBA player ID by full name."""
    match = players.find_players_by_full_name(name)
    if not match:
        return None
    return match[0]["id"]

def get_career_stats(player_id):
    """Return regular season career stats as DataFrame."""
    stats = playercareerstats.PlayerCareerStats(player_id=player_id)
    df = stats.get_data_frames()[0]
    return df[df["LEAGUE_ID"] == "00"]

def get_player_physicals(player_id):
    """Return player's height, weight, and age."""
    info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    info_row = info.get_data_frames()[0].iloc[0]
    height = info_row.get("HEIGHT", "N/A")
    weight = info_row.get("WEIGHT", "N/A")
    birthdate = info_row.get("BIRTHDATE")
    age = calculate_age(birthdate)
    return {"height": height, "weight": weight, "age": age}


def generate_plot(df, player_name, stat_name="PTS"):
    """Generate base64-encoded stat plot image."""
    if stat_name not in df.columns:
        stat_name = "PTS"

    fig, ax = plt.subplots(figsize=(8, 4))
    ax.plot(df["SEASON_ID"], df[stat_name], marker="o", color="royalblue", linewidth=2)
    ax.set_title(f"{player_name}: {stat_name} Per Season")
    ax.set_xlabel("Season")
    ax.set_ylabel(stat_name)
    plt.xticks(rotation=45)
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)
    return encoded

def calculate_age(birthdate_str):
    """Calculate age from NBA API birthdate string."""
    birthdate = datetime.strptime(birthdate_str, "%Y-%m-%dT%H:%M:%S")
    today = datetime.today()
    return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))


def get_career_averages(player_id):
    career = playercareerstats.PlayerCareerStats(player_id=player_id)
    df = career.career_totals_regular_season.get_data_frame()
    if df.empty:
        print("EMPTY STATS :)", flush=True)
        return {}

    data = df.iloc[0]
    gp = data['GP'] or 1  # avoid divide by zero or None

    # Use .get with default 0 for missing stats
    pts = data.get('PTS', 0) or 0
    reb = data.get('REB', 0) or 0
    ast = data.get('AST', 0) or 0
    fg_pct = data.get('FG_PCT', None)
    fg3_pct = data.get('FG3_PCT', None)

    print(f"GP: {gp}, PTS: {pts}, REB: {reb}, AST: {ast}, FG%: {fg_pct}, 3P%: {fg3_pct}", flush=True)

    return {
        "PPG": round(pts / gp, 1),
        "RPG": round(reb / gp, 1),
        "APG": round(ast / gp, 1),
        "FG%": round(fg_pct * 100, 1) if fg_pct is not None else "N/A",
        "3P%": round(fg3_pct * 100, 1) if fg3_pct is not None else "N/A"
    }


