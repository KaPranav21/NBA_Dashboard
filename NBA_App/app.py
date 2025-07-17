from flask import Flask, request, jsonify, render_template
from python.nba_core import get_player_stats, players

player_list = players.get_players()
player_names = [p["full_name"] for p in player_list]

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/player", methods=["POST"])
def player_api():
    data = request.json
    name = data.get("player_name", "").strip()
    result = get_player_stats(name)

    if "error" in result:
        return jsonify(result), 404

    return jsonify(result)

@app.route("/api/autocomplete")
def autocomplete():
    query = request.args.get("q", "").lower()
    matches = [name for name in player_names if query in name.lower()]
    return jsonify(matches[:25])  # Return top 10 matches

if __name__ == "__main__":
    app.run(debug=True)
