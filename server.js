require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { CosmosClient } = require("@azure/cosmos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ---- Cosmos DB ----
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = "RideauCanalDB";
const containerId = "SensorAggregations";

const client = new CosmosClient({ endpoint, key });
const container = client.database(databaseId).container(containerId);

// Return latest 1 record per location
app.get("/api/latest", async (req, res) => {
  try {
    const query = `SELECT * FROM c ORDER BY c.windowEnd DESC`;
    const { resources } = await container.items.query(query).fetchAll();

    const latest = {};
    resources.forEach((r) => {
      if (!latest[r.location]) latest[r.location] = r;
    });

    res.json(Object.values(latest));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching latest data");
  }
});

// History – last hour
app.get("/api/history/:location", async (req, res) => {
  try {
    const location = req.params.location;

    const query = {
      query:
        "SELECT * FROM c WHERE c.location = @loc ORDER BY c.windowEnd DESC",
      parameters: [{ name: "@loc", value: location }],
    };

    const { resources } = await container.items.query(query).fetchAll();

    res.json(resources.slice(0, 12).reverse()); // 12 × 5-min = 1 hour
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching history");
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
