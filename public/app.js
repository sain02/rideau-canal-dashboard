// --- FRONTEND CONSTANTS ---
const API_BASE = "";
const LOCATIONS = ["DowsLake", "FifthAvenue", "NAC"];
const SAFE_COLOR = "#7DDE92";
const CAUTION_COLOR = "#F4CC70";
const UNSAFE_COLOR = "#F76C5E";

// --- DOM ELEMENTS ---
const statusBanner = document.getElementById("canal-status");
const updatedTime = document.getElementById("updated-time");

// card values
const cardElements = {
    DowsLake: {
        ice: document.getElementById("dl-ice"),
        temp: document.getElementById("dl-temp"),
        snow: document.getElementById("dl-snow"),
        badge: document.getElementById("dl-badge"),
    },
    FifthAvenue: {
        ice: document.getElementById("fa-ice"),
        temp: document.getElementById("fa-temp"),
        snow: document.getElementById("fa-snow"),
        badge: document.getElementById("fa-badge"),
    },
    NAC: {
        ice: document.getElementById("nac-ice"),
        temp: document.getElementById("nac-temp"),
        snow: document.getElementById("nac-snow"),
        badge: document.getElementById("nac-badge"),
    }
};

// Trend chart canvases
let iceChart, tempChart, snowChart;


// ---------------------------------------------------
// Convert raw values → Safety Status
// ---------------------------------------------------
function getSafetyStatus(iceThickness) {
    if (iceThickness >= 30) return "Safe";
    if (iceThickness >= 20) return "Caution";
    return "Unsafe";
}
function getColor(status) {
    if (status === "Safe") return SAFE_COLOR;
    if (status === "Caution") return CAUTION_COLOR;
    return UNSAFE_COLOR;
}


// ---------------------------------------------------
// LOAD LATEST SENSOR AGGREGATION
// ---------------------------------------------------
async function loadLatest() {
    const res = await fetch(`/api/latest`);
    const data = await res.json();

    let globalStatus = "Safe";

    data.forEach((loc) => {
        const name = loc.location;
        const card = cardElements[name];
        if (!card) return;

        card.ice.textContent = loc.avgIceThickness.toFixed(2) + " cm";
        card.temp.textContent = loc.avgSurfaceTemperature.toFixed(2) + " °C";
        card.snow.textContent = loc.avgSnow.toFixed(2) + " cm";

        const status = getSafetyStatus(loc.avgIceThickness);
        card.badge.textContent = status;
        card.badge.style.background = getColor(status);

        if (status === "Unsafe") globalStatus = "Unsafe";
        else if (status === "Caution" && globalStatus !== "Unsafe") globalStatus = "Caution";
    });

    // Update banner
    statusBanner.textContent = globalStatus;
    statusBanner.style.background = getColor(globalStatus);

    updatedTime.textContent = new Date().toLocaleTimeString();
}


// ---------------------------------------------------
// LOAD HISTORY FOR TREND GRAPHS
// ---------------------------------------------------
async function loadTrends() {
    const datasetsIce = [];
    const datasetsTemp = [];
    const datasetsSnow = [];

    for (const loc of LOCATIONS) {
        const res = await fetch(`/api/history/${loc}?hours=1`);
        const rows = await res.json();

        const labels = rows.map(r => r.windowEnd);
        const ice = rows.map(r => r.avgIceThickness);
        const temp = rows.map(r => r.avgSurfaceTemperature);
        const snow = rows.map(r => r.avgSnow);

        const colorMap = {
            DowsLake: "#36A2EB",
            FifthAvenue: "#FF3B8D",
            NAC: "#9B59B6"
        };

        datasetsIce.push({
            label: loc,
            data: ice,
            borderColor: colorMap[loc],
            tension: 0.3
        });
        datasetsTemp.push({
            label: loc,
            data: temp,
            borderColor: colorMap[loc],
            tension: 0.3
        });
        datasetsSnow.push({
            label: loc,
            data: snow,
            borderColor: colorMap[loc],
            tension: 0.3
        });

        window.chartLabels = labels; // Shared
    }

    drawCharts(datasetsIce, datasetsTemp, datasetsSnow);
}


// ---------------------------------------------------
// DRAW CHARTS (with Chart.js)
// ---------------------------------------------------
function drawCharts(iceData, tempData, snowData) {
    const labels = window.chartLabels;

    if (iceChart) iceChart.destroy();
    if (tempChart) tempChart.destroy();
    if (snowChart) snowChart.destroy();

    iceChart = new Chart(document.getElementById("iceChart"), {
        type: "line",
        data: { labels, datasets: iceData },
        options: { responsive: true, plugins: { legend: { position: "bottom" }} }
    });

    tempChart = new Chart(document.getElementById("tempChart"), {
        type: "line",
        data: { labels, datasets: tempData },
        options: { responsive: true, plugins: { legend: { position: "bottom" }} }
    });

    snowChart = new Chart(document.getElementById("snowChart"), {
        type: "line",
        data: { labels, datasets: snowData },
        options: { responsive: true, plugins: { legend: { position: "bottom" }} }
    });
}


// ---------------------------------------------------
//  AUTO-REFRESH (EVERY 5 SECONDS)
// ---------------------------------------------------
async function refreshDashboard() {
    await loadLatest();
    await loadTrends();
}

refreshDashboard();
setInterval(refreshDashboard, 5000);
