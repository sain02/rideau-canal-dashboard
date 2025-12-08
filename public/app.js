const locations = ['DowsLake', 'FifthAvenue', 'NAC'];
const displayNames = {
  DowsLake: "Dow's Lake",
  FifthAvenue: 'Fifth Avenue',
  NAC: 'NAC'
};

let iceChart, tempChart, snowChart;
let currentHours = 1; // 1 or 24

// ------- UI helpers -------

function setBadgeStatus(location, status) {
  const badge = document.getElementById(`badge-${location}`);
  const card = document.getElementById(`card-${location}`);

  badge.textContent = status;

  badge.classList.remove('badge-safe', 'badge-caution', 'badge-unsafe');
  card.classList.remove('status-safe', 'status-caution', 'status-unsafe');

  const statusLower = status.toLowerCase();
  if (statusLower === 'safe') {
    badge.classList.add('badge-safe');
    card.classList.add('status-safe');
  } else if (statusLower === 'caution') {
    badge.classList.add('badge-caution');
    card.classList.add('status-caution');
  } else {
    badge.classList.add('badge-unsafe');
    card.classList.add('status-unsafe');
  }
}

function updateOverallBanner(statuses) {
  const banner = document.getElementById('overall-status');
  const text = document.getElementById('overall-status-text');

  // Worst status wins: Unsafe > Caution > Safe
  let overall = 'Safe';
  if (statuses.includes('Unsafe')) overall = 'Unsafe';
  else if (statuses.includes('Caution')) overall = 'Caution';

  text.textContent = overall;

  banner.classList.remove('status-safe', 'status-caution', 'status-unsafe');
  const lower = overall.toLowerCase();
  if (lower === 'safe') banner.classList.add('status-safe', 'status-banner');
  if (lower === 'caution') banner.classList.add('status-caution', 'status-banner');
  if (lower === 'unsafe') banner.classList.add('status-unsafe', 'status-banner');
}

// ------- Fetch latest -------

async function fetchLatest() {
  const res = await fetch('/api/latest');
  const data = await res.json();

  const statuses = [];
  data.forEach(d => {
    const loc = d.location;

    document.getElementById(`ice-${loc}`).textContent =
      (d.avgIceThickness ?? d.avgIce ?? d.iceThickness ?? 0).toFixed(2);
    document.getElementById(`temp-${loc}`).textContent =
      (d.avgSurfaceTemperature ?? d.surfaceTemperature ?? 0).toFixed(2);
    document.getElementById(`snow-${loc}`).textContent =
      (d.maxSnowAccumulation ?? d.snowAccumulation ?? 0).toFixed(2);

    setBadgeStatus(loc, d.safetyStatus || 'Safe');
    statuses.push(d.safetyStatus || 'Safe');
  });

  updateOverallBanner(statuses);

  const now = new Date();
  document.getElementById('last-updated').textContent =
    `Last Updated: ${now.toLocaleTimeString()}`;
}

// ------- Fetch history & update charts -------

async function fetchHistory(hours) {
  const histories = {};

  for (const loc of locations) {
    const res = await fetch(`/api/history/${loc}?hours=${hours}`);
    histories[loc] = await res.json();
  }

  updateCharts(histories);
}

function createOrUpdateChart(existing, ctx, label, datasets) {
  if (existing) {
    existing.data.labels = datasets.labels;
    existing.data.datasets = datasets.datasets;
    existing.update();
    return existing;
  }

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: datasets.labels,
      datasets: datasets.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { display: true },
        y: { display: true }
      }
    }
  });
}

function buildDatasets(histories, field) {
  const labels =
    histories[locations[0]].map(p =>
      new Date(p.windowEnd || p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );

  const colors = ['#2ecc71', '#e91e63', '#9b59b6'];

  const datasets = locations.map((loc, idx) => ({
    label: displayNames[loc],
    data: histories[loc].map(p => p[field]),
    borderColor: colors[idx],
    backgroundColor: colors[idx],
    fill: false,
    tension: 0.2,
    pointRadius: 2
  }));

  return { labels, datasets };
}

function updateCharts(histories) {
  const iceCtx = document.getElementById('iceChart').getContext('2d');
  const tempCtx = document.getElementById('tempChart').getContext('2d');
  const snowCtx = document.getElementById('snowChart').getContext('2d');

  const iceData = buildDatasets(histories, 'avgIceThickness');
  const tempData = buildDatasets(histories, 'avgSurfaceTemperature');
  const snowData = buildDatasets(histories, 'maxSnowAccumulation');

  iceChart = createOrUpdateChart(iceChart, iceCtx, 'Ice Thickness', iceData);
  tempChart = createOrUpdateChart(tempChart, tempCtx, 'Temperature', tempData);
  snowChart = createOrUpdateChart(snowChart, snowCtx, 'Snow', snowData);
}

// ------- Range buttons -------

function setupRangeButtons() {
  const btn1h = document.getElementById('btn-1h');
  const btn24h = document.getElementById('btn-24h');

  btn1h.addEventListener('click', () => {
    currentHours = 1;
    btn1h.classList.add('active');
    btn24h.classList.remove('active');
    fetchHistory(currentHours);
  });

  btn24h.addEventListener('click', () => {
    currentHours = 24;
    btn24h.classList.add('active');
    btn1h.classList.remove('active');
    fetchHistory(currentHours);
  });
}

// ------- Init + auto refresh -------

async function init() {
  setupRangeButtons();
  await fetchLatest();
  await fetchHistory(currentHours);

  // Auto refresh every 5 seconds
  setInterval(async () => {
    await fetchLatest();
    await fetchHistory(currentHours);
  }, 5000);
}

init();
