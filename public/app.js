async function loadDashboard() {
    document.getElementById("lastUpdated").innerHTML = new Date().toLocaleTimeString();

    const latestRes = await fetch("/api/latest");
    const latest = await latestRes.json();

    const trendRes = await fetch("/api/trend");
    const trend = await trendRes.json();

    // Locations
    const locations = ["Dows Lake", "Fifth Avenue", "NAC"];

    // Fill cards
    locations.forEach(loc => {
        const item = latest.find(x => x.location === loc);
        if (!item) return;

        document.getElementById(`${loc.replace(" ", "")}-ice`).innerHTML = item.iceThickness.toFixed(2);
        document.getElementById(`${loc.replace(" ", "")}-temp`).innerHTML = item.surfaceTemp.toFixed(2);
        document.getElementById(`${loc.replace(" ", "")}-snow`).innerHTML = item.snow.toFixed(2);

        // Status
        let status = "Safe", color = "#b2f2a2";
        if (item.iceThickness < 25) { status = "Caution"; color = "#ffda77"; }
        if (item.iceThickness < 15) { status = "Unsafe"; color = "#ff8a80"; }

        document.getElementById(`${loc.replace(" ", "")}-status`).innerHTML = status;
        document.getElementById(`${loc.replace(" ", "")}-status`).style.background = color;
    });

    // -------- TREND CHARTS ----------
    const times = trend.map(x => x.windowEnd);

    const datasetsIce = [
        {
            label: "Dows Lake",
            borderColor: "#7b2cbf",
            data: trend.filter(x => x.location === "Dows Lake").map(x => x.iceThickness)
        },
        {
            label: "Fifth Avenue",
            borderColor: "#ff6b6b",
            data: trend.filter(x => x.location === "Fifth Avenue").map(x => x.iceThickness)
        },
        {
            label: "NAC",
            borderColor: "#4dabf7",
            data: trend.filter(x => x.location === "NAC").map(x => x.iceThickness)
        }
    ];

    new Chart(document.getElementById("iceChart"), {
        type: "line",
        data: { labels: times, datasets: datasetsIce },
        options: { responsive: true }
    });

    const datasetsTemp = [
        {
            label: "Dows Lake",
            borderColor: "#2b9348",
            data: trend.filter(x => x.location === "Dows Lake").map(x => x.surfaceTemp)
        },
        {
            label: "Fifth Avenue",
            borderColor: "#adb5bd",
            data: trend.filter(x => x.location === "Fifth Avenue").map(x => x.surfaceTemp)
        },
        {
            label: "NAC",
            borderColor: "#5e60ce",
            data: trend.filter(x => x.location === "NAC").map(x => x.surfaceTemp)
        }
    ];

    new Chart(document.getElementById("tempChart"), {
        type: "line",
        data: { labels: times, datasets: datasetsTemp },
        options: { responsive: true }
    });
}

loadDashboard();
setInterval(loadDashboard, 5000);
