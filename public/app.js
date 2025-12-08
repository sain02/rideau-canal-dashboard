async function fetchLatest() {
  const res = await fetch('/api/latest');
  const data = await res.json();
  return data;
}

async function fetchTrend() {
  const res = await fetch('/api/trend');
  const data = await res.json();
  return data;
}

function updateCards(data) {
  const locations = ["Dows Lake", "Fifth Avenue", "NAC"];

  locations.forEach(loc => {
    const item = data.find(d => d.location === loc);
    if (!item) return;

    document.getElementById(`${loc}-ice`).innerText = item.avg_thickness.toFixed(2) + " cm";
    document.getElementById(`${loc}-temp`).innerText = item.avg_surfaceTemp.toFixed(2) + " °C";
    document.getElementById(`${loc}-snow`).innerText = item.avg_snow.toFixed(2) + " cm";

    const status = item.avg_thickness >= 30 ? "Safe" :
                   item.avg_thickness >= 20 ? "Caution" : "Unsafe";

    const badge = document.getElementById(`${loc}-status`);
    badge.innerText = status;

    badge.style.backgroundColor =
      status === "Safe" ? "#b6f5b6" :
      status === "Caution" ? "#f6d98f" :
      "#f58a8a";
  });

  document.getElementById("last-updated").innerText =
    new Date().toLocaleTimeString();
}

let iceChart;
let tempChart;

function updateCharts(trend) {
  const timestamps = trend.map(t => t.windowEnd);
  const dows = trend.map(t => t.DowsLake);
  const fifth = trend.map(t => t.FifthAvenue);
  const nac = trend.map(t => t.NAC);

  // Ice thickness
  if (iceChart) iceChart.destroy();
  iceChart = new Chart(document.getElementById("iceChart"), {
    type: "line",
    data: {
      labels: timestamps,
      datasets: [
        { label: "Dows Lake", borderColor: "#8c52ff", data: dows },
        { label: "Fifth Avenue", borderColor: "#ff66b3", data: fifth },
        { label: "NAC", borderColor: "#6a5acd", data: nac }
      ]
    }
  });

  // Temperature
  if (tempChart) tempChart.destroy();
  tempChart = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
      labels: timestamps,
      datasets: [
        { label: "Dows Lake", borderColor: "#88ccff", data: dows },
        { label: "Fifth Avenue", borderColor: "#8fd19e", data: fifth },
        { label: "NAC", borderColor: "#c2b280", data: nac }
      ]
    }
  });
}

async function refresh() {
  try {
    const latest = await fetchLatest();
    const trend = await fetchTrend();

    updateCards(latest);
    updateCharts(trend);
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

refresh();
setInterval(refresh, 5000);
