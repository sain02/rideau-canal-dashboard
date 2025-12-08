async function loadDashboard() {
    try {
        const latestRes = await fetch("/api/latest");
        const latest = await latestRes.json();

        const historyDows = await fetch("/api/history/DowsLake?hours=1").then(r => r.json());
        const historyFifth = await fetch("/api/history/FifthAvenue?hours=1").then(r => r.json());
        const historyNac = await fetch("/api/history/NAC?hours=1").then(r => r.json());

        document.getElementById("lastUpdated").innerHTML =
            "Last Updated: " + new Date().toLocaleTimeString();

        let canalStatus = "Safe";
        document.getElementById("canalStatus").innerHTML = canalStatus;

        latest.forEach(loc => {
            if (loc.location === "DowsLake") {
                updateCard("dows", loc);
            }
            if (loc.location === "FifthAvenue") {
                updateCard("fifth", loc);
            }
            if (loc.location === "NAC") {
                updateCard("nac", loc);
            }
        });

        drawIceChart(historyDows, historyFifth, historyNac);
        drawTempChart(historyDows, historyFifth, historyNac);

    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

function updateCard(prefix, data) {
    document.getElementById(prefix + "Ice").innerHTML = data.iceThickness.toFixed(2);
    document.getElementById(prefix + "Temp").innerHTML = data.surfaceTemp.toFixed(2);
    document.getElementById(prefix + "Snow").innerHTML = data.snow.toFixed(2);

    const badge = document.getElementById("badge" + prefix.charAt(0).toUpperCase() + prefix.slice(1));

    if (data.iceThickness >= 30) {
        badge.innerHTML = "Safe";
        badge.className = "badge safe";
    } else if (data.iceThickness >= 25) {
        badge.innerHTML = "Caution";
        badge.className = "badge caution";
    } else {
        badge.innerHTML = "Unsafe";
        badge.className = "badge unsafe";
    }
}


// ------------------ CHART DRAW FUNCTIONS ---------------------

function drawIceChart(dl, fa, nc) {
    new Chart(document.getElementById("iceChart"), {
        type: "line",
        data: {
            labels: dl.map(x => x.windowEnd),
            datasets: [
                { label: "Dows Lake", borderColor: "#8e5ea2", data: dl.map(x => x.iceThickness) },
                { label: "Fifth Avenue", borderColor: "#e94f37", data: fa.map(x => x.iceThickness) },
                { label: "NAC", borderColor: "#4ea8de", data: nc.map(x => x.iceThickness) }
            ]
        }
    });
}

function drawTempChart(dl, fa, nc) {
    new Chart(document.getElementById("tempChart"), {
        type: "line",
        data: {
            labels: dl.map(x => x.windowEnd),
            datasets: [
                { label: "Dows Lake", borderColor: "#4caf50", data: dl.map(x => x.surfaceTemp) },
                { label: "Fifth Avenue", borderColor: "#777", data: fa.map(x => x.surfaceTemp) },
                { label: "NAC", borderColor: "#6f42c1", data: nc.map(x => x.surfaceTemp) }
            ]
        }
    });
}

loadDashboard();
setInterval(loadDashboard, 5000);
