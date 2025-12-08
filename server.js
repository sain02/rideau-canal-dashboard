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

// ---------- API: LATEST VALUES ----------
app.get('/api/latest', async (req, res) => {
    try {
        const query = `
            SELECT * FROM c ORDER BY c.windowEnd DESC
        `;
        const { resources } = await container.items.query(query).fetchAll();

        const latest = {};
        for (const row of resources) {
            if (!latest[row.location]) {
                latest[row.location] = row;
            }
        }

        res.json(Object.values(latest));
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to load latest data");
    }
});

// ---------- API: HISTORY ----------
app.get('/api/history/:location', async (req, res) => {
    const location = req.params.location;

    try {
        const query = `
            SELECT * FROM c
            WHERE c.location = @loc
            ORDER BY c.windowEnd ASC
        `;

        const { resources } = await container.items
            .query({
                query,
                parameters: [{ name: "@loc", value: location }]
            })
            .fetchAll();

        res.json(resources);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to load history");
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
