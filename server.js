// ---- Rideau Canal Dashboard Server (OLD WORKING VERSION) ----
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { CosmosClient } = require("@azure/cosmos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Cosmos DB
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

const databaseId = "RideauCanalDB";
const containerId = "SensorAggregations";

const container = client.database(databaseId).container(containerId);

// -------- GET LATEST VALUES (OLD VERSION) --------------------
app.get("/api/latest", async (req, res) => {
    try {
        const query = "SELECT * FROM c ORDER BY c._ts DESC";
        const { resources } = await container.items.query(query).fetchAll();

        const latest = {};
        for (let row of resources) {
            if (!latest[row.location]) latest[row.location] = row;
        }

        res.json(Object.values(latest));
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching latest data");
    }
});

// -------- GET 1 HOUR TREND -----------------------
app.get("/api/trend", async (req, res) => {
    try {
        const query = `
            SELECT * FROM c
            WHERE c.windowEnd > DateTimeAdd('hh', -1, GetCurrentDateTime())
            ORDER BY c.windowEnd ASC
        `;
        const { resources } = await container.items.query(query).fetchAll();
        res.json(resources);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching trend");
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
