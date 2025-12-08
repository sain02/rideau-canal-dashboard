const locations = ["DowsLake", "FifthAvenue", "NAC"];

// Get DOM elements
const overallStatusEl = document.getElementById("overallStatus");
const lastUpdatedEl = document.getElementById("lastUpdated");

// CHART references
let iceChart, tempChart;

// Load latest data
async function loadLatest() {
  const res = await fetch("/api/latest");
  const data = await res.json();

  let overallStatus = "Safe";
  let overallClass = "status-safe";

  data.forEach(d => {
    // Create card UI
    const card = document.getElementById(`card-${d.location}`);
    card.innerHTML = `
      <h2>${prettyName(d.location)}</h2>
      <span class="status-tag ${tagClass(d.safetyStatus)}">${d.safetyStatus}</span>
      <p><strong>Ice Thickness:</strong> ${d.avgIceThickness} cm</p>
      <p><strong>Surface Temp:</strong> ${d.avgSurfaceTemperature} °C</p>
      <p><strong>Snow:</strong> ${d.maxSnowAccumulation} cm</p>
    `;

    // Determine overall canal status
    if (d.safetyStatus === "Unsafe") {
      overallStatus = "Unsafe";
      overallClass = "status-unsafe";
    } else if (d.safetyStatus === "Caution" && overallStatus !== "Unsafe") {
      overallStatus = "Caution";
      overallClass = "status-caution";
    }

    lastUpdatedEl.textContent = "Last Updated: " + new Date().toLocaleTimeString();
  });

  overallStatusEl.textContent = overallStatus;
  overallStatusEl.className = `status-badge ${overallClass}`;
}

// Convert location to pretty label
function prettyName(loc) {
  if (loc === "DowsLake") return "Dow's Lake";
  if (loc === "FifthAvenue") return "Fifth Avenue";
  return "NAC";
}

// Map color badge classes
function tagClass(status) {
  if (status === "Safe") return "status-safe";
  if (status === "Caution") return "status-caution";
  return "status-unsafe";
}

// Load chart data
async function loadCharts() {
  const datasetsIce = [];
  const datasetsTemp = [];

  for (let loc of locations) {
    const res = await fetch(`/api/history/${loc}`);
    const data = await res.json();

    const labels = data.map(d => d.windowEnd).reverse();
    const ice = data.map(d => d.avgIceThickness).reverse();
    const temp = data.map(d => d.avgSurfaceTemperature).reverse();

    datasetsIce.push({
      label: prettyName(loc),
      data: ice,
      borderWidth: 2,
      borderColor: randomColor(),
      fill: false
    });

    datasetsTemp.push({
      label: prettyName(loc),
      data: temp,
      borderWidth: 2,
      borderColor: randomColor(),
      fill: false
    });

    drawCharts(labels, datasetsIce, datasetsTemp);
  }
}

function randomColor() {
  return "#" + Math.floor(Math.random()*16777215).toString(16);
}

// Draw Charts
function drawCharts(labels, iceData, tempData) {
  const iceCtx = document.getElementById("iceChart");
  const tempCtx = document.getElementById("tempChart");

  if (iceChart) iceChart.destroy();
  if (tempChart) tempChart.destroy();

  iceChart = new Chart(iceCtx, {
    type: "line",
    data: { labels, datasets: iceData }
  });

  tempChart = new Chart(tempCtx, {
    type: "line",
    data: { labels, datasets: tempData }
  });
}

// Auto-refresh
loadLatest();
loadCharts();
setInterval(() => {
  loadLatest();
  loadCharts();
}, 30000);
