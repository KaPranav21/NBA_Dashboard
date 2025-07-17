async function search() {
  const name = getPlayerInput();
  const stat = document.getElementById("statSelect").value;
  const data = await fetchPlayerData(name, stat);

  if (data.error) {
    showError(data.error);
    clearErrors();
  } else {
    clearErrors();
    renderStatsTable(data.table);
    renderPlotImage(data.plot);  // <- use the "plot" key from API response
    renderPhysicalsTable(data.physicals);
  }
}

// Helper: Fetch player data from API
async function fetchPlayerData(name, stat) {
  const response = await fetch("/api/player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({player_name: name, stat_name: stat})
  });
  return await response.json();
}

async function updateSuggestions() {
  const input = document.getElementById("playerInput").value;
  const res = await fetch(`/api/autocomplete?q=${input}`);
  const suggestions = await res.json();

  const datalist = document.getElementById("playerList");
  datalist.innerHTML = "";
  suggestions.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  });
}

// Helper: Get player name from input
function getPlayerInput() {
  return document.getElementById("playerInput").value;
}

// Helper: Show error message
function showError(message) {
  document.getElementById("error").innerText = message;
}

// Helper: Clear error message
function clearErrors() {
  document.getElementById("error").innerText = "";
  document.getElementById("statsTable").innerHTML = "";
  document.getElementById("plotImage").src = "";
  document.getElementById("physicalsTable").innerHTML = "";
}

// Helper: Render stats table
function renderStatsTable(table) {
  let html = "<table border='1'><tr><th>Season</th><th>Team</th><th>GP</th><th>PTS</th><th>REB</th><th>AST</th></tr>";
  table.forEach(row => {
    html += `<tr>
      <td>${row.SEASON_ID}</td>
      <td>${row.TEAM_ABBREVIATION}</td>
      <td>${row.GP}</td>
      <td>${row.PTS}</td>
      <td>${row.REB}</td>
      <td>${row.AST}</td>
    </tr>`;
  });
  html += "</table>";
  document.getElementById("statsTable").innerHTML = html;
}

function renderPlotImage(plotBase64) {
  const img = document.getElementById("plotImage");
  if (!plotBase64) {
    img.style.display = "none";
    return;
  }
  img.src = `data:image/png;base64,${plotBase64}`;
  img.style.display = "block";
}

// Helper: Render physicals table
function renderPhysicalsTable(phys) {
  let physHtml = 
    `<h3>Player Physicals</h3>
    <table border="1" class="physicals-table">
      <tr><th>Attribute</th><th>Value</th></tr>
      <tr><td>Height</td><td>${phys.height}</td></tr>
      <tr><td>Weight</td><td>${phys.weight} lbs</td></tr>
      <tr><td>Age</td><td>${phys.age}</td></tr>
    </table>`;
  document.getElementById("physicalsTable").innerHTML = physHtml;
}


