async function loadDashboard() {
    try {
        const res = await fetch("/api/latest");
        const latest = await res.json();

        updateCards(latest);
        updateCharts();
        document.getElementById("updatedTime").textContent = new Date().toLocaleTimeString();

    } catch (err) {
        console.error("Dashboard load error:", err);
    }
}

function updateCards(data) {
    data.forEach(loc => {
        const id = loc.location.replace(/ /g, "") + "Card";

        const status = loc.iceThickness > 30 ? "Safe"
                     : loc.iceThickness > 25 ? "Caution"
                     : "Unsafe";

        const badgeClass =
            status === "Safe" ? "badge-safe" :
            status === "Caution" ? "badge-caution" : "badge-unsafe";

        document.getElementById(id).innerHTML = `
            <h2>${loc.location}</h2>
            <span class="${badgeClass}">${status}</span>
            <p><b>Ice Thickness:</b> ${loc.iceThickness.toFixed(2)} cm</p>
            <p><b>Surface Temp:</b> ${loc.surfaceTemp.toFixed(2)} °C</p>
            <p><b>Snow:</b> ${loc.snow.toFixed(2)} cm</p>
        `;
    });
}

// --------------------- CHART SETUP -----------------------------

let iceChart, tempChart;

async function updateCharts() {
    const locations = ["Dows Lake", "Fifth Avenue", "NAC"];
    const iceData = {};
    const tempData = {};

    for (let loc of locations) {
        const res = await fetch(`/api/history/${loc}?hours=1`);
        const hist = await res.json();

        iceData[loc] = hist.map(h => h.iceThickness);
        tempData[loc] = hist.map(h => h.surfaceTemp);
    }

    renderIceChart(iceData);
    renderTempChart(tempData);
}

function renderIceChart(data) {
    const ctx = document.getElementById("iceChart");

    if (iceChart) iceChart.destroy();

    iceChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [...Array(data["Dows Lake"].length).keys()],
            datasets: [
                { label: "Dows Lake", borderColor: "#8E44AD", data: data["Dows Lake"] },
                { label: "Fifth Avenue", borderColor: "#E74C3C", data: data["Fifth Avenue"] },
                { label: "NAC", borderColor: "#3498DB", data: data["NAC"] }
            ]
        }
    });
}

function renderTempChart(data) {
    const ctx = document.getElementById("tempChart");

    if (tempChart) tempChart.destroy();

    tempChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [...Array(data["Dows Lake"].length).keys()],
            datasets: [
                { label: "Dows Lake", borderColor: "#16A085", data: data["Dows Lake"] },
                { label: "Fifth Avenue", borderColor: "#F5B041", data: data["Fifth Avenue"] },
                { label: "NAC", borderColor: "#9B59B6", data: data["NAC"] }
            ]
        }
    });
}

// Auto refresh every 5 seconds
setInterval(loadDashboard, 5000);

// Load on startup
loadDashboard();
