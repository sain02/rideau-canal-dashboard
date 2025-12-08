require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

const container = client
    .database("RideauCanalDB")
    .container("SensorAggregations");

app.get("/api/latest", async (req, res) => {
    const query = "SELECT * FROM c ORDER BY c.windowEnd DESC";
    const { resources } = await container.items.query(query).fetchAll();

    const latest = {};
    resources.forEach(item => {
        if (!latest[item.location]) latest[item.location] = item;
    });

    res.json(Object.values(latest));
});

app.get("/api/history/:loc", async (req, res) => {
    const loc = req.params.loc;
    const query = {
        query: "SELECT * FROM c WHERE c.location=@loc ORDER BY c.windowEnd DESC",
        parameters: [{ name: "@loc", value: loc }]
    };

    const { resources } = await container.items.query(query).fetchAll();
    res.json(resources.slice(0, 12).reverse());
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
