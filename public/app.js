
// Simple dashboard logic using the backend API:
// - GET /api/latest        -> list latest aggregation per location
// - GET /api/history/:loc  -> last N records (default 60) for chosen location

const API = {
  latest: '/api/latest',
  history: (loc, limit) => `/api/history/${encodeURIComponent(loc)}?limit=${limit}`
};

const els = {
  latestList: document.getElementById('latestList'),
  refreshBtn: document.getElementById('refreshBtn'),
  locationSelect: document.getElementById('locationSelect'),
  limitInput: document.getElementById('limitInput'),
  loadHistoryBtn: document.getElementById('loadHistoryBtn'),
  tempCanvas: document.getElementById('tempChart'),
  humCanvas: document.getElementById('humChart'),
  historyTableBody: document.querySelector('#historyTable tbody')
};

// Helpers
const fmtTime = ts => {
  // Accept epoch seconds or ISO string
  try {
    const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
};

function asNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function createCard(doc) {
  const card = document.createElement('div');
  card.className = 'card';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = doc.location || '(unknown location)';

  const meta = document.createElement('div');
  meta.className = 'meta';
  const winEnd = doc.windowEnd || doc.timestamp || doc._ts; // depending on your aggregator
  meta.textContent = `windowEnd: ${fmtTime(winEnd)}`;

  const metrics = document.createElement('div');
  metrics.className = 'metrics';

  const temp = document.createElement('div');
  temp.className = 'metric';
  temp.innerHTML = `<div class="label">Temperature</div>
                    <div class="value">${doc.temperature ?? '—'} °C</div>`;

  const hum = document.createElement('div');
  hum.className = 'metric';
  hum.innerHTML = `<div class="label">Humidity</div>
                   <div class="value">${doc.humidity ?? '—'} %</div>`;

  metrics.appendChild(temp);
  metrics.appendChild(hum);

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(metrics);
  return card;
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// Render latest list and populate locations dropdown
async function loadLatest() {
  els.latestList.innerHTML = '';
  try {
    const data = await fetchJSON(API.latest);

    // Update cards
    data.forEach(doc => els.latestList.appendChild(createCard(doc)));

    // Populate location select (unique locations)
    const unique = [...new Set(data.map(d => d.location).filter(Boolean))];
    els.locationSelect.innerHTML = '';
    unique.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc;
      opt.textContent = loc;
      els.locationSelect.appendChild(opt);
    });

    // Auto-load history for first location
    if (unique.length > 0) {
      await loadHistory(unique[0], Number(els.limitInput.value || 60));
    }
  } catch (err) {
    console.error('loadLatest failed:', err);
    els.latestList.innerHTML = `<div class="card"><div class="title">Error</div>
      <div class="meta">Failed to fetch latest data: ${err.message}</div></div>`;
  }
}

// Render history (table + simple charts)
async function loadHistory(loc, limit = 60) {
  if (!loc) return;
  try {
    const data = await fetchJSON(API.history(loc, limit));

    // Table
    els.historyTableBody.innerHTML = '';
    data.forEach((d, i) => {
      const tr = document.createElement('tr');
      const winEnd = d.windowEnd || d.timestamp || d._ts;
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${fmtTime(winEnd)}</td>
        <td>${d.temperature ?? '—'}</td>
        <td>${d.humidity ?? '—'}</td>
        <td>${d.location ?? ''}</td>
      `;
      els.historyTableBody.appendChild(tr);
    });

    // Prepare series for charts
    const temps = data.map(d => asNumber(d.temperature)).filter(v => v !== null);
    const hums  = data.map(d => asNumber(d.humidity)).filter(v => v !== null);

    drawLineChart(els.tempCanvas, temps, { color: '#22d3ee', label: 'Temperature (°C)' });
    drawLineChart(els.humCanvas, hums,  { color: '#a78bfa', label: 'Humidity (%)' });
  } catch (err) {
    console.error('loadHistory failed:', err);
    // Clear on error
    els.historyTableBody.innerHTML = '';
    clearCanvas(els.tempCanvas);
    clearCanvas(els.humCanvas);
  }
}

// Minimal canvas line chart (no external libraries)
function clearCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawLineChart(canvas, values, { color = '#22d3ee', label = '' } = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  clearCanvas(canvas);

  // Axes padding
  const pad = 28;
  const ox = pad, oy = H - pad;
  const iw = W - 2 * pad, ih = H - 2 * pad;

  // Draw axes
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - ih); // y axis
  ctx.moveTo(ox, oy); ctx.lineTo(ox + iw, oy); // x axis
  ctx.stroke();

  if (!values || values.length === 0) {
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('No data', ox + 8, oy - ih / 2);
    return;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Plot line
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = ox + (i / (values.length - 1)) * iw;
    const y = oy - ((v - min) / range) * ih;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Label
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '12px system-ui';
  ctx.fillText(label, ox + 8, oy - ih - 8);

  // Min/Max
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(`min: ${min.toFixed(2)}`, ox + iw - 160, oy - ih - 8);
  ctx.fillText(`max: ${max.toFixed(2)}`, ox + iw - 80,  oy - ih - 8);
}

// Wire up events
els.refreshBtn.addEventListener('click', () => loadLatest());
els.loadHistoryBtn.addEventListener('click', async () => {
  const loc = els.locationSelect.value;
  const limit = Number(els.limitInput.value || 60);
  await loadHistory(loc, limit);
});

// Boot
loadLatest();
