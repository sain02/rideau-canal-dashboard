let latestUrl = "/api/latest";
let historyUrl = "/api/history/";

async function loadData() {
    const res = await fetch(latestUrl);
    const data = await res.json();

    const lastUpdated = document.getElementById("lastUpdated");
    lastUpdated.textContent = new Date().toLocaleTimeString();

    data.forEach(item => {
        updateCard(item);
    });

    loadCharts();
}

function updateCard(item) {
    const id = item.location.replace(/\s/g, "");
    document.getElementById(id + "-ice").textContent = item.avgIceThickness.toFixed(2);
    document.getElementById(id + "-temp").textContent = item.avgSurfaceTemp.toFixed(2);
    document.getElementById(id + "-snow").textContent = item.avgSnow.toFixed(2);

    // status color
    const badge = document.getElementById(id + "-status");
    badge.textContent = item.safetyStatus;

    if (item.safetyStatus === "Safe") badge.className = "badge safe";
    else if (item.safetyStatus === "Caution") badge.className = "badge caution";
    else badge.className = "badge danger";
}

async function loadCharts() {
    await drawChart("DowsLake");
    await drawChart("FifthAvenue");
    await drawChart("NAC");
}

async function drawChart(location) {
    const res = await fetch(historyUrl + location);
    const data = await res.json();

    const labels = data.map(d => d.windowEnd);
    const ice = data.map(d => d.avgIceThickness);
    const temp = data.map(d => d.avgSurfaceTemp);

    // ICE CHART
    new Chart(document.getElementById(location + "-ice-chart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: location,
                data: ice,
                borderColor: "#7d5fff",
                fill: false
            }]
        }
    });

    // TEMP CHART
    new Chart(document.getElementById(location + "-temp-chart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: location,
                data: temp,
                borderColor: "#1dd1a1",
                fill: false
            }]
        }
    });
}

loadData();
setInterval(loadData, 10000); // refresh every 10 sec
