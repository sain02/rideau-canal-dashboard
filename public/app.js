async function loadDashboard() {
    const latest = await fetch("/api/latest").then(r => r.json());

    document.getElementById("updatedTime").innerText =
        "Last Updated: " + new Date().toLocaleTimeString();

    let overallStatus = "Safe";

    latest.forEach(data => {
        let loc = data.location.replace(/\s/g, "");
        
        document.getElementById("ice" + loc).innerText = data.iceThickness.toFixed(2);
        document.getElementById("temp" + loc).innerText = data.surfaceTemp.toFixed(2);
        document.getElementById("snow" + loc).innerText = data.snow.toFixed(2);

        let badge = document.getElementById("badge" + loc);

        if (data.iceThickness > 30) {
            badge.innerText = "Safe";
            badge.className = "badge safe";
        } else if (data.iceThickness >= 20) {
            badge.innerText = "Caution";
            badge.className = "badge caution";
            overallStatus = "Caution";
        } else {
            badge.innerText = "Unsafe";
            badge.className = "badge danger";
            overallStatus = "Unsafe";
        }
    });

    document.getElementById("statusBadge").innerText = overallStatus;

    loadCharts();
}

async function loadCharts() {
    const locs = ["DowsLake", "FifthAvenue", "NAC"];
    const datasetsIce = [];
    const datasetsTemp = [];

    for (let loc of locs) {
        let hist = await fetch(`/api/history/${loc}?hours=1`).then(r => r.json());
        let times = hist.map(d => d.windowEnd);

        datasetsIce.push({
            label: loc,
            borderColor: getColor(loc),
            data: hist.map(d => d.iceThickness),
            fill: false
        });

        datasetsTemp.push({
            label: loc,
            borderColor: getColor(loc),
            data: hist.map(d => d.surfaceTemp),
            fill: false
        });
    }

    new Chart(document.getElementById("iceChart"), {
        type: "line",
        data: { labels: Array(12).fill(""), datasets: datasetsIce }
    });

    new Chart(document.getElementById("tempChart"), {
        type: "line",
        data: { labels: Array(12).fill(""), datasets: datasetsTemp }
    });
}

function getColor(loc) {
    return {
        "DowsLake": "#7b2cbf",
        "FifthAvenue": "#ff6bcd",
        "NAC": "#63daf2"
    }[loc];
}

loadDashboard();
setInterval(loadDashboard, 5000);
