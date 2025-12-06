
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- Cosmos DB config via environment ---
const endpoint = process.env.COSMOS_ENDPOINT;   // e.g. https://rideaucanalcosmos.documents.azure.com:443/
const key = process.env.COSMOS_KEY;             
const databaseId = process.env.COSMOS_DB || 'RideauCanalDB';
const containerId = process.env.COSMOS_CONTAINER || 'SensorAggregations';

// Fail fast if env vars are missing
if (!endpoint || !key) {
  console.error(
    'Missing COSMOS_ENDPOINT or COSMOS_KEY in environment.\n' +
    'Set them in .env (not committed) or OS env variables.'
  );
  process.exit(1);
}

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

// Optional: verify DB/container exist
async function ensureCosmos() {
  try {
    await database.read();        // throws if missing
    await container.read();
    console.log(`Cosmos ready: db='${databaseId}' container='${containerId}'`);
  } catch (err) {
    console.error('Cosmos check failed. Ensure DB/container exist in the account.');
    console.error(err.message);
  }
}

// Latest aggregation per location
app.get('/api/latest', async (_req, res) => {
  const query = 'SELECT * FROM c ORDER BY c.windowEnd DESC';
  try {
    const { resources } = await container.items.query(query).fetchAll();
    const latestByLocation = {};
    for (const d of resources) {
      if (!latestByLocation[d.location]) latestByLocation[d.location] = d;
    }
    res.json(Object.values(latestByLocation));
  } catch (err) {
    console.error('Error querying /api/latest:', err);
    res.status(500).json({ error: 'Error querying Cosmos DB' });
  }
});

// Historical data for last N (default 60) items by location
app.get('/api/history/:location', async (req, res) => {
  const loc = req.params.location;
  const limit = Number(req.query.limit || 60);
  const querySpec = {
    query: 'SELECT TOP @limit * FROM c WHERE c.location = @loc ORDER BY c.windowEnd DESC',
    parameters: [
      { name: '@loc', value: loc },
      { name: '@limit', value: limit }
    ]
  };
  try {
    const { resources } = await container.items.query(querySpec).fetchAll();
    res.json(resources);
  } catch (err) {
    console.error('Error querying /api/history:', err);
    res.status(500).json({ error: 'Error querying history' });
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Start server
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  await ensureCosmos();
});
