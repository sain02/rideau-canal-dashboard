async function loadData() {
  const res = await fetch("/api/latest");
  const data = await res.json();

  document.getElementById("updatedTime").textContent =
    "Last Updated: " + new Date().toLocaleTimeString();

  const dl = data.find(x => x.location === "DowsLake");
  const fa = data.find(x => x.location === "FifthAvenue");
  const nc = data.find(x => x.location === "NAC");

  renderCard("card-dows", dl);
  renderCard("card-fifth", fa);
  renderCard("card-nac", nc);

  updateCharts(dl, fa, nc);
}

function renderCard(id, d) {
  const badge = d.iceThickness >= 30 ? "badge-safe" : "badge-caution";
  const status = d.iceThickness >= 30 ? "Safe" : "Caution";

  document.getElementById(id).innerHTML = `
    <h2>${d.location.replace(/([A-Z])/g, ' $1')}</h2>
    <span class="${badge}">${status}</span>
    <p><b>Ice Thickness:</b> ${d.iceThickness.toFixed(2)} cm</p>
    <p><b>Surface Temp:</b> ${d.surfaceTemp.toFixed(2)} °C</p>
    <p><b>Snow:</b> ${d.snow.toFixed(2)} cm</p>
  `;
}

let iceChart, tempChart;

function updateCharts(dl, fa, nc) {
  const labels = [new Date().toISOString()];

  const iceData = {
    "Dow's Lake": dl.iceThickness,
    "Fifth Avenue": fa.iceThickness,
    "NAC": nc.iceThickness,
  };

  const tempData = {
    "Dow's Lake": dl.surfaceTemp,
    "Fifth Avenue": fa.surfaceTemp,
    "NAC": nc.surfaceTemp,
  };

  if (!iceChart) {
    iceChart = new Chart(document.getElementById("iceChart"), {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Dow's Lake", data: [iceData["Dow's Lake"]], borderColor: "purple" },
          { label: "Fifth Avenue", data: [iceData["Fifth Avenue"]], borderColor: "red" },
          { label: "NAC", data: [iceData["NAC"]], borderColor: "blue" },
        ]
      }
    });
  }

  if (!tempChart) {
    tempChart = new Chart(document.getElementById("tempChart"), {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Dow's Lake", data: [tempData["Dow's Lake"]], borderColor: "green" },
          { label: "Fifth Avenue", data: [tempData["Fifth Avenue"]], borderColor: "gray" },
          { label: "NAC", data: [tempData["NAC"]], borderColor: "orange" },
        ]
      }
    });
  }
}

setInterval(loadData, 5000);
loadData();
