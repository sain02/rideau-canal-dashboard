// === DASHBOARD CONFIG ===

// Safety color rules
const STATUS_COLORS = {
    Safe: "#8EE894",
    Caution: "#F4D06F",
    Unsafe: "#E57373"
};

// Refresh dashboard every 5 seconds
setInterval(fetchDashboardData, 5000);

// On load
fetchDashboardData();

// === MAIN FUNCTION ===
async function fetchDashboardData() {
    try {
        const res = await fetch("/api/latest");
        const data = await res.json();

        updateLocationCards(data.locations);
        updateStatusBanner(data.overallStatus);

        // Trend graphs
        renderLineGraph("iceTrendChart", data.trends.ice, "Ice Thickness (cm)");
        renderLineGraph("tempTrendChart", data.trends.temp, "Surface Temp (°C)");
        renderLineGraph("snowTrendChart", data.trends.snow, "Snow (cm)");

        document.getElementById("lastUpdated").innerText =
            new Date().toLocaleTimeString();

    } catch (err) {
        console.error("Dashboard Error:", err);
    }
}

// === UPDATE TOP STATUS BANNER ===
function updateStatusBanner(status) {
    const bar = document.getElementById("statusBanner");
    bar.innerText = status;
    bar.style.background = STATUS_COLORS[status] || "#ccc";
}

// === UPDATE LOCATION CARDS ===
function updateLocationCards(locations) {
    ["DowsLake", "FifthAvenue", "NAC"].forEach(loc => {
        const d = locations[loc];

        document.querySelector(`.${loc}-status`).innerText = d.status;
        document.querySelector(`.${loc}-status`).style.background =
            STATUS_COLORS[d.status];

        document.querySelector(`.${loc}-ice`).innerText =
            d.iceThickness.toFixed(2);

        document.querySelector(`.${loc}-temp`).innerText =
            d.surfaceTemp.toFixed(2);

        document.querySelector(`.${loc}-snow`).innerText =
            d.snow.toFixed(2);
    });
}

// === RENDER SIMPLE LINE GRAPH (Chart.js) ===
function renderLineGraph(canvasId, trendData, labelTitle) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = trendData.timestamps;

    const dataset = [
        {
            label: "Dow's Lake",
            data: trendData.DowsLake,
            borderColor: "#4CAF50",
            fill: false,
            tension: 0.4
        },
        {
            label: "Fifth Avenue",
            data: trendData.FifthAvenue,
            borderColor: "#F72585",
            fill: false,
            tension: 0.4
        },
        {
            label: "NAC",
            data: trendData.NAC,
            borderColor: "#7B2CBF",
            fill: false,
            tension: 0.4
        }
    ];

    // Destroy old charts to prevent duplicates
    if (window[canvasId]) window[canvasId].destroy();

    window[canvasId] = new Chart(ctx, {
        type: "line",
        data: { labels, datasets: dataset },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top"
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: labelTitle }
                }
            }
        }
    });
}
