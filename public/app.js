const locations = ['DowsLake', 'FifthAvenue', 'NAC'];
const cardsDiv = document.getElementById('cards');

locations.forEach(loc => {
  const card = document.createElement('div');
  card.id = `card-${loc}`;
  card.innerHTML = `<h3>${loc}</h3><p id="${loc}-status">Loading...</p><pre id="${loc}-data"></pre>`;
  cardsDiv.appendChild(card);
});

async function fetchLatest() {
  const res = await fetch('/api/latest');
  const data = await res.json();
  data.forEach(d => {
    document.getElementById(`${d.location}-status`).textContent = `Status: ${d.safetyStatus}`;
    document.getElementById(`${d.location}-data`).textContent = JSON.stringify(d, null, 2);
  });
}

setInterval(fetchLatest, 30000);
fetchLatest();
