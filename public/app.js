const API_LATEST = "/api/latest";
const API_HISTORY = "/api/history";

let iceChart, tempChart;

async function fetchData() {
    const latest = await fetch(API_LATEST).then(r => r.json());
    const history = await fetch(API_HISTORY).then(r => r.json());

    updateCards(latest);
    updateCharts(history);
}

function updateCards(data) {
    const locations = ["DowsLake", "FifthAvenue", "NAC"];

    document.getElementById("lastUpdated").textContent = new Date().toLocaleTimeString();

    let overallStatus = "Safe";

    locations.forEach(loc => {
        const cardId = loc.toLowerCase().replace("avenue", "").replace("dowslake", "dows");

        document.getElementById(`ice-${cardId}`).textContent = data[loc].iceThickness.toFixed(2);
        document.getElementById(`temp-${cardId}`).textContent = data[loc].surfaceTemp.toFixed(2);
        document.getElementById(`snow-${cardId}`).textContent = data[loc].snow.toFixed(2);

        let badge = document.getElementById(`badge-${cardId}`);
        let status = data[loc].status;

        badge.textContent = status;

        badge.className = "badge " + status.toLowerCase();

        if (status === "Unsafe") overallStatus = "Unsafe";
        else if (status === "Caution" && overallStatus !== "Unsafe") overallStatus = "Caution";
    });

    updateBanner(overallStatus);
}

function updateBanner(status) {
    let banner = document.getElementById("canalStatusBanner");

    banner.textContent = status;

    if (status === "Safe") banner.style.background = "#b0ffb0";
    else if (status === "Caution") banner.style.background = "#ffe28a";
    else banner.style.background = "#ff9a9a";
}

function updateCharts(history) {
    const times = history.timestamps;

    const dowsIce = history.DowsLake.ice;
    const fifthIce = history.FifthAvenue.ice;
    const nacIce = history.NAC.ice;

    const dowsTemp = history.DowsLake.temp;
    const fifthTemp = history.FifthAvenue.temp;
    const nacTemp = history.NAC.temp;

    // Colors same as professor dashboard
    const colors = {
        dows: "#4CAF50",
        fifth: "#FF4081",
        nac: "#8E44AD"
    };

    // Create Ice Chart
    if (iceChart) iceChart.destroy();
    iceChart = new Chart(document.getElementById("iceChart"), {
        type: "line",
        data: {
            labels: times,
            datasets: [
                { label: "Dow's Lake", data: dowsIce, borderColor: colors.dows, fill: false },
                { label: "Fifth Avenue", data: fifthIce, borderColor: colors.fifth, fill: false },
                { label: "NAC", data: nacIce, borderColor: colors.nac, fill: false }
            ]
        }
    });

    // Create Temp Chart
    if (tempChart) tempChart.destroy();
    tempChart = new Chart(document.getElementById("tempChart"), {
        type: "line",
        data: {
            labels: times,
            datasets: [
                { label: "Dow's Lake", data: dowsTemp, borderColor: colors.dows, fill: false },
                { label: "Fifth Avenue", data: fifthTemp, borderColor: colors.fifth, fill: false },
                { label: "NAC", data: nacTemp, borderColor: colors.nac, fill: false }
            ]
        }
    });
}

// Auto refresh every 5 seconds
fetchData();
setInterval(fetchData, 5000);
