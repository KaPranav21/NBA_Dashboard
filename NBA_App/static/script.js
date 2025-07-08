async function search() {
  const name = document.getElementById("playerInput").value;

  const response = await fetch("/api/player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_name: name })
  });

  const data = await response.json();

  if (data.error) {
    document.getElementById("error").innerText = data.error;
    document.getElementById("statsTable").innerHTML = "";
    document.getElementById("plotImage").src = "";
  } else {
    document.getElementById("error").innerText = "";

    // Build table
    let html = "<table border='1'><tr><th>Season</th><th>Team</th><th>GP</th><th>PTS</th><th>REB</th><th>AST</th></tr>";
    data.table.forEach(row => {
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

    // Set plot image
    document.getElementById("plotImage").src = `data:image/png;base64,${data.plot}`;

    const img = document.getElementById("plotImage");
    img.src = `data:image/png;base64,${data.plot}`;
    img.style.display = "block";  // show image

    // Physicals table
    const phys = data.physicals;
    let physHtml = 
    `
      <h3>Player Physicals</h3>
      <table border="1" style="border-collapse: collapse; width: 300px;">
        <tr><th>Attribute</th><th>Value</th></tr>
        <tr><td>Height</td><td>${phys.height}</td></tr>
        <tr><td>Weight</td><td>${phys.weight} lbs</td></tr>
        <tr><td>Age</td><td>${phys.age}</td></tr>
      </table>
    `;
    document.getElementById("physicalsTable").innerHTML = physHtml;
  }
}
