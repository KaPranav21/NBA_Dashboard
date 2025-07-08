from flask import Flask, request, jsonify, render_template
from python.nba_core import get_player_stats

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

if __name__ == "__main__":
    app.run(debug=True)
