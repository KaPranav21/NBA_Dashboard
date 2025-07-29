async function search() {
  const container = document.getElementById('container');
  
  if (container) {
    // Add fade-out class, remove fade-in
    container.classList.remove('fade-in');
    container.classList.add('fade-out');
  }

  const name = getPlayerInput();
  const stat = document.getElementById("statSelect").value;
  const data = await fetchPlayerData(name, stat);

  if (data.error) {
    showError(data.error);
    clearErrors();
    
    // fade back in even on error so container is visible
    if (container) {
      container.classList.remove('fade-out');
      container.classList.add('fade-in');
    }
  } else {
    clearErrors();
    renderStatsTable(data.table);
    renderPlotImage(data.plot);
    renderPhysicalsTable(data.physicals, data.name);
    renderAveragesTable(data.averages);

    // Wait a short moment to allow fade-out animation before fade-in
    if (container) {
      setTimeout(() => {
        container.classList.remove('fade-out');
        container.classList.add('fade-in');
      }, 300); // match your CSS transition duration (1s), can tweak timing here
    }
  }
}



// Fetch player data from backend API
async function fetchPlayerData(name, stat) {
  const response = await fetch("/api/player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_name: name, stat_name: stat })
  });

  return await response.json();
}

// Autocomplete suggestions update for player input
async function updateSuggestions() {
  const input = document.getElementById("playerInput").value;
  if (!input) {
    clearAutocomplete();
    return;
  }
  const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(input)}`);
  const suggestions = await res.json();

  const datalist = document.getElementById("playerList");
  datalist.innerHTML = "";
  suggestions.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  });
}

// Clear autocomplete datalist
function clearAutocomplete() {
  const datalist = document.getElementById("playerList");
  if (datalist) {
    datalist.innerHTML = "";
  }
}

// Get player name from input box
function getPlayerInput() {
  return document.getElementById("playerInput").value.trim();
}

// Display error message
function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.innerText = message;
}

// Clear error message and result displays
function clearErrors() {
  document.getElementById("error").innerText = "";
  document.getElementById("statsTable").innerHTML = "";
  
  const plotImg = document.getElementById("plotImage");
  if (plotImg) {
    plotImg.src = "";
    plotImg.style.display = "none";
  }

  const physTable = document.getElementById("physicalsTable");
  if (physTable) physTable.innerHTML = "";

  const avgTable = document.getElementById("averagesTable");
  if (avgTable) avgTable.innerHTML = "";
}

// Render season stats table
function renderStatsTable(table) {
  if (!table || table.length === 0) {
    document.getElementById("statsTable").innerHTML = "<p>No stats available.</p>";
    return;
  }

  let html = `
    <table border='1'>
      <thead>
        <tr>
          <th>Season</th>
          <th>Team</th>
          <th>GP</th>
          <th>MIN</th>
          <th>PTS</th>
          <th>REB</th>
          <th>AST</th>
          <th>STL</th>
          <th>BLK</th>
          <th>TOV</th>
          <th>FG%</th>
          <th>3P%</th>
          <th>FT%</th>
        </tr>
      </thead>
      <tbody>
  `;

  table.forEach(row => {
    html += `
      <tr>
        <td>${row.SEASON_ID}</td>
        <td>${row.TEAM_ABBREVIATION}</td>
        <td>${row.GP}</td>
        <td>${row.MIN}</td>
        <td>${row.PTS}</td>
        <td>${row.REB}</td>
        <td>${row.AST}</td>
        <td>${row.STL}</td>
        <td>${row.BLK}</td>
        <td>${row.TOV}</td>
        <td>${row.FG_PCT != null ? (row.FG_PCT * 100).toFixed(1) + "%" : "N/A"}</td>
        <td>${row.FG3_PCT != null ? (row.FG3_PCT * 100).toFixed(1) + "%" : "N/A"}</td>
        <td>${row.FT_PCT != null ? (row.FT_PCT * 100).toFixed(1) + "%" : "N/A"}</td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  document.getElementById("statsTable").innerHTML = html;
}

// Render base64 plot image
function renderPlotImage(plotBase64) {
  const img = document.getElementById("plotImage");
  if (!plotBase64) {
    img.style.display = "none";
    img.src = "";
    return;
  }
  img.src = `data:image/png;base64,${plotBase64}`;
  img.style.display = "block";
}

// Render player physical attributes table
function renderPhysicalsTable(phys, player_name) {
  if (!phys) {
    document.getElementById("physicalsTable").innerHTML = "<p>No physical data available.</p>";
    return;
  }
  let physHtml = 
    `<h3>${player_name}</h3>
    <table border="1" class="physicals-table">
      <tr><td>Height</td><td>${phys.height || "N/A"}</td></tr>
      <tr><td>Weight</td><td>${phys.weight ? phys.weight + " lbs" : "N/A"}</td></tr>
      <tr><td>Age</td><td>${phys.age || "N/A"}</td></tr>
    </table>`;
  document.getElementById("physicalsTable").innerHTML = physHtml;
}

// Render player career averages table with null safety
function renderAveragesTable(averages) {
  if (!averages) {
    document.getElementById("averagesTable").innerHTML = "<p>No averages data available.</p>";
    return;
  }

  const fgPct = averages["FG%"] != null ? averages["FG%"].toFixed(1) + "%" : "N/A";
  const fg3Pct = averages["3P%"] != null ? averages["3P%"].toFixed(1) + "%" : "N/A";

  let avgHtml = 
    `<h3>Career Averages</h3>
    <table border="1" class="averages-table">
      <tr>
        <th>Points Per Game (PPG)</th>
        <th>Rebounds Per Game (RPG)</th>
        <th>Assists Per Game (APG)</th>
        <th>FG%</th>
        <th>3P FG%</th>
      </tr>
      <tr>
        <td>${averages.PPG != null ? averages.PPG : "N/A"}</td>
        <td>${averages.RPG != null ? averages.RPG : "N/A"}</td>
        <td>${averages.APG != null ? averages.APG : "N/A"}</td>
        <td>${fgPct}</td>
        <td>${fg3Pct}</td>
      </tr>
    </table>`;
  document.getElementById("averagesTable").innerHTML = avgHtml;
}
  window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    if (container) {
      // Delay slightly if you want a smoother effect
      setTimeout(() => {
        container.classList.add('fade-in');
      }, 100);
    }
  });