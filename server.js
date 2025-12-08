require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Cosmos DB
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;

const client = new CosmosClient({ endpoint, key });
const database = client.database('RideauCanalDB');
const container = database.container('SensorAggregations');

// GET latest readings ONLY
app.get('/api/latest', async (req, res) => {
  try {
    const query = `SELECT * FROM c ORDER BY c.timestamp DESC`;
    const { resources } = await container.items.query(query).fetchAll();

    const latest = {};
    for (const item of resources) {
      if (!latest[item.location]) latest[item.location] = item;
    }

    res.json(Object.values(latest));
  } catch (err) {
    console.error(err);
    res.status(500).send("Cosmos query failed");
  }
});

app.listen(port, () => console.log(`Running at http://localhost:${port}`));
