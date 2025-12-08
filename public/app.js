let iceChart, tempChart;

async function fetchLatest() {
    const res = await fetch("/api/latest");
    return res.json();
}

async function fetchHistory(location) {
    const res = await fetch(`/api/history/${location}?hours=1`);
    return res.json();
}

function getStatusColor(status) {
    if (status === "Safe") return "safe";
    if (status === "Caution") return "caution";
    return "unsafe";
}

function createCard(data) {
    return `
        <div class="card">
            <h2>${data.location.replace(/([A-Z])/g, " $1").trim()}</h2>
            <span class="status-badge ${getStatusColor(data.safetyStatus)}">${data.safetyStatus}</span>

            <p><b>Ice Thickness:</b> ${data.avgIceThickness.toFixed(2)} cm</p>
            <p><b>Surface Temp:</b> ${data.avgSurfaceTemperature.toFixed(2)} °C</p>
            <p><b>Snow:</b> ${data.avgSnow.toFixed(2)} cm</p>
        </div>
    `;
}

async function loadDashboard() {
    const latest = await fetchLatest();
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";

    latest.forEach(item => {
        container.innerHTML += createCard(item);
    });

    // Update last updated time
    document.getElementById("lastUpdated").innerText = new Date().toLocaleTimeString();

    // Trends
    await loadCharts(latest.map(x => x.location));
}

async function loadCharts(locations) {
    const iceDatasets = [];
    const tempDatasets = [];
    const labels = [];

    for (const loc of locations) {
        const history = await fetchHistory(loc);

        if (labels.length === 0) {
            history.forEach(h => labels.push(h.windowEnd));
        }

        iceDatasets.push({
            label: loc,
            borderColor: getColorForLocation(loc),
            data: history.map(h => h.avgIceThickness),
            fill: false
        });

        tempDatasets.push({
            label: loc,
            borderColor: getColorForLocation(loc),
            data: history.map(h => h.avgSurfaceTemperature),
            fill: false
        });
    }

    buildLineChart("iceChart", labels, iceDatasets, chart => iceChart = chart);
    buildLineChart("tempChart", labels, tempDatasets, chart => tempChart = chart);
}

function getColorForLocation(loc) {
    return {
        "DowsLake": "#8e44ad",
        "FifthAvenue": "#e91e63",
        "NAC": "#3498db"
    }[loc] || "#000";
}

function buildLineChart(canvasId, labels, datasets, saveChartFn) {
    const ctx = document.getElementById(canvasId);

    if (saveChartFn === iceChart && iceChart) iceChart.destroy();
    if (saveChartFn === tempChart && tempChart) tempChart.destroy();

    const newChart = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            scales: {
                x: { ticks: { maxRotation: 0, minRotation: 0 } }
            }
        }
    });

    saveChartFn(newChart);
}

loadDashboard();
setInterval(loadDashboard, 5000);
