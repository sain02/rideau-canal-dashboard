async function loadLatest() {
    const res = await fetch('/api/latest');
    const data = await res.json();

    if (!data.length) {
        console.log("No latest data");
        return;
    }

    document.getElementById("statusText").innerText = getStatus(data);

    const now = new Date().toLocaleTimeString();
    document.getElementById("lastUpdated").innerText = now;

    updateCard("DowsLake", data.find(d => d.location === "DowsLake"));
    updateCard("FifthAvenue", data.find(d => d.location === "FifthAvenue"));
    updateCard("NAC", data.find(d => d.location === "NAC"));
}

function getStatus(arr) {
    const bad = arr.some(a => a.iceThickness < 25);
    const caution = arr.some(a => a.iceThickness < 30);
    if (bad) return "Unsafe";
    if (caution) return "Caution";
    return "Safe";
}

function updateCard(id, d) {
    if (!d) return;
    document.getElementById(id + "_thick").innerText = d.iceThickness + " cm";
    document.getElementById(id + "_temp").innerText = d.surfaceTemp + " °C";
    document.getElementById(id + "_snow").innerText = d.snow + " cm";
}

async function loadTrends() {
    const locations = ["DowsLake","FifthAvenue","NAC"];
    const result = {};

    for (const loc of locations) {
        const res = await fetch(`/api/history/${loc}?hours=1`);
        result[loc] = await res.json();
    }

    drawIceChart(result);
    drawTempChart(result);
}

// ---- CHART.JS ----

function drawIceChart(data) {
    const ctx = document.getElementById("iceChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: data["DowsLake"].map(x => x.windowEnd),
            datasets: [
                {
                    label: "Dows Lake",
                    borderColor: "#90EE90",
                    data: data["DowsLake"].map(x => x.avgIceThickness),
                    borderWidth: 2
                },
                {
                    label: "Fifth Avenue",
                    borderColor: "#FF69B4",
                    data: data["FifthAvenue"].map(x => x.avgIceThickness),
                    borderWidth: 2
                },
                {
                    label: "NAC",
                    borderColor: "#9370DB",
                    data: data["NAC"].map(x => x.avgIceThickness),
                    borderWidth: 2
                }
            ]
        }
    });
}

function drawTempChart(data) {
    const ctx = document.getElementById("tempChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: data["DowsLake"].map(x => x.windowEnd),
            datasets: [
                {
                    label: "Dows Lake",
                    borderColor: "#87CEEB",
                    data: data["DowsLake"].map(x => x.avgSurfaceTemp),
                    borderWidth: 2
                },
                {
                    label: "Fifth Avenue",
                    borderColor: "#98FB98",
                    data: data["FifthAvenue"].map(x => x.avgSurfaceTemp),
                    borderWidth: 2
                },
                {
                    label: "NAC",
                    borderColor: "#BDB76B",
                    data: data["NAC"].map(x => x.avgSurfaceTemp),
                    borderWidth: 2
                }
            ]
        }
    });
}

setInterval(() => {
    loadLatest();
    loadTrends();
}, 5000);

loadLatest();
loadTrends();
