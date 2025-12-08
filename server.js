require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { CosmosClient } = require("@azure/cosmos");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = "RideauCanalDB";
const containerId = "SensorAggregations";

const client = new CosmosClient({ endpoint, key });
const container = client.database(databaseId).container(containerId);

// ------------------- GET LATEST -------------------
app.get("/api/latest", async (req, res) => {
    try {
        const query = "SELECT * FROM c ORDER BY c.windowEnd DESC";

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
        res.status(500).send("Error fetching latest data");
    }
});

// ------------------- HISTORY (1 hour default) -------------------
app.get("/api/history/:location", async (req, res) => {
    const location = req.params.location;

    try {
        const query = {
            query: "SELECT * FROM c WHERE c.location = @loc ORDER BY c.windowEnd DESC",
            parameters: [{ name: "@loc", value: location }]
        };

        const { resources } = await container.items.query(query).fetchAll();
        res.json(resources.reverse());  // oldest → newest
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching history");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
