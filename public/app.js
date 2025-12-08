// ---------------------------
// UI ELEMENTS
// ---------------------------
const statusBanner = document.getElementById("statusBanner");
const lastUpdatedEl = document.getElementById("lastUpdated");

const cards = {
  "Dows Lake": document.getElementById("card-dows"),
  "Fifth Avenue": document.getElementById("card-fifth"),
  "NAC": document.getElementById("card-nac")
};

const charts = {
  ice: null,
  temp: null,
  snow: null
};

// Colors matching professor screenshot
const COLORS = {
  dows: "#1abc9c",
  fifth: "#e74c3c",
  nac: "#9b59b6"
};

// ---------------------------
// Fetch latest readings
// ---------------------------
async function loadLatest() {
  const res = await fetch("/api/latest");
  const data = await res.json();

  lastUpdatedEl.textContent = new Date().toLocaleTimeString();

  // Determine overall canal status
  let canalStatus = "Safe";
  for (let row of data) {
    if (row.safetyStatus === "Unsafe") canalStatus = "Unsafe";
    else if (row.safetyStatus === "Caution" && canalStatus !== "Unsafe")
      canalStatus = "Caution";
  }
  setBannerStatus(canalStatus);

  // Update each card
  data.forEach(updateCard);
}

// ---------------------------
// Update safety banner
// ---------------------------
function setBannerStatus(status) {
  statusBanner.textContent = status;

  if (status === "Safe") {
    statusBanner.style.background = "#b9f6ca";
  } else if (status === "Caution") {
    statusBanner.style.background = "#ffe082";
  } else {
    statusBanner.style.background = "#ff8a80";
  }
}

// ---------------------------
// Update a location card
// ---------------------------
function updateCard(row) {
  const card = cards[row.location];
  if (!card) return;

  card.querySelector(".safety").textContent = row.safetyStatus;
  card.querySelector(".ice").textContent = row.avgIceThickness.toFixed(2);
  card.querySelector(".temp").textContent = row.avgSurfaceTemperature.toFixed(2);
  card.querySelector(".snow").textContent = row.avgSnow.toFixed(2);

  // Color badge
  const badge = card.querySelector(".safety");
  if (row.safetyStatus === "Safe") badge.style.background = "#b9f6ca";
  else if (row.safetyStatus === "Caution") badge.style.background = "#ffe082";
  else badge.style.background = "#ff8a80";
}

// ---------------------------
// Fetch history for trend charts
// ---------------------------
async function loadHistory() {
  const locations = ["Dows Lake", "Fifth Avenue", "NAC"];
  let history = {};

  for (let loc of locations) {
    const res = await fetch(`/api/history/${encodeURIComponent(loc)}?hours=1`);
    history[loc] = await res.json();
  }

  buildCharts(history);
}

// ---------------------------
// Chart builder
// ---------------------------
function buildCharts(history) {
  const labels = history["Dows Lake"].map(r => r.windowEnd.split("T")[1].substring(0,5));

  // Extract trend lines
  const datasetsIce = [
    {
      label: "Dow's Lake",
      data: history["Dows Lake"].map(r => r.avgIceThickness),
      borderColor: COLORS.dows,
      tension: 0.3
    },
    {
      label: "Fifth Avenue",
      data: history["Fifth Avenue"].map(r => r.avgIceThickness),
      borderColor: COLORS.fifth,
      tension: 0.3
    },
    {
      label: "NAC",
      data: history["NAC"].map(r => r.avgIceThickness),
      borderColor: COLORS.nac,
      tension: 0.3
    }
  ];

  const datasetsTemp = [
    {
      label: "Dow's Lake",
      data: history["Dows Lake"].map(r => r.avgSurfaceTemperature),
      borderColor: COLORS.dows,
      tension: 0.3
    },
    {
      label: "Fifth Avenue",
      data: history["Fifth Avenue"].map(r => r.avgSurfaceTemperature),
      borderColor: COLORS.fifth,
      tension: 0.3
    },
    {
      label: "NAC",
      data: history["NAC"].map(r => r.avgSurfaceTemperature),
      borderColor: COLORS.nac,
      tension: 0.3
    }
  ];

  const datasetsSnow = [
    {
      label: "Dow's Lake",
      data: history["Dows Lake"].map(r => r.avgSnow),
      borderColor: COLORS.dows,
      tension: 0.3
    },
    {
      label: "Fifth Avenue",
      data: history["Fifth Avenue"].map(r => r.avgSnow),
      borderColor: COLORS.fifth,
      tension: 0.3
    },
    {
      label: "NAC",
      data: history["NAC"].map(r => r.avgSnow),
      borderColor: COLORS.nac,
      tension: 0.3
    }
  ];

  // Build charts
  makeChart("chart-ice", labels, datasetsIce, "Ice Thickness");
  makeChart("chart-temp", labels, datasetsTemp, "Surface Temperature");
  makeChart("chart-snow", labels, datasetsSnow, "Snow Depth");
}

// ---------------------------
// Helper to create chart
// ---------------------------
function makeChart(id, labels, datasets, title) {
  const ctx = document.getElementById(id).getContext("2d");

  if (charts[id]) charts[id].destroy();

  charts[id] = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: false }
      },
      scales: {
        x: { ticks: { maxTicksLimit: 6 }},
        y: { beginAtZero: false }
      }
    }
  });
}

// ---------------------------
// MAIN LOOP
// ---------------------------
async function refresh() {
  await loadLatest();
  await loadHistory();
}

// Load immediately
refresh();

// Refresh every 5 seconds
setInterval(refresh, 5000);
