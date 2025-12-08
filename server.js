require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Cosmos DB setup
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = 'RideauCanalDB';
const containerId = 'SensorAggregations';

const client = new CosmosClient({ endpoint, key });
const container = client.database(databaseId).container(containerId);

/**
 * Helper: get N hours of data for a single location
 * 5-minute windows → 12 points per hour
 */
async function getHistoryForLocation(location, hours) {
  const safeHours = Math.max(1, Math.min(hours, 24)); // clamp 1–24
  const maxPoints = safeHours * 12;

  const querySpec = {
    query: 'SELECT * FROM c WHERE c.location = @loc ORDER BY c.windowEnd DESC',
    parameters: [{ name: '@loc', value: location }]
  };

  const { resources } = await container.items.query(querySpec).fetchAll();
  // latest first → keep only needed and reverse so oldest→newest
  return resources.slice(0, maxPoints).reverse();
}

// -------- API ENDPOINTS --------

// Latest aggregation for each location
app.get('/api/latest', async (req, res) => {
  try {
    const query = 'SELECT * FROM c ORDER BY c.windowEnd DESC';
    const { resources } = await container.items.query(query).fetchAll();

    const latestByLocation = {};
    for (const d of resources) {
      if (!latestByLocation[d.location]) {
        latestByLocation[d.location] = d;
      }
    }
    res.json(Object.values(latestByLocation));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error querying Cosmos DB');
  }
});

// History for a single location
// /api/history/DowsLake?hours=1  or ?hours=24
app.get('/api/history/:location', async (req, res) => {
  const loc = req.params.location;
  const hours = parseInt(req.query.hours || '1', 10);

  try {
    const data = await getHistoryForLocation(loc, hours);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error querying history');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
