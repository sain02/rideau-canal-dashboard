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

const client = new CosmosClient({ endpoint, key });
const databaseId = "RideauCanalDB";
const containerId = "SensorAggregations";
const container = client.database(databaseId).container(containerId);

// ---------- LATEST DATA ENDPOINT (works with old dashboard) ----------
app.get("/api/latest", async (req, res) => {
  try {
    const query = {
      query: "SELECT * FROM c ORDER BY c.windowEnd DESC"
    };

    const { resources } = await container.items.query(query).fetchAll();

    const latest = {};
    for (const r of resources) {
      if (!latest[r.location]) {
        latest[r.location] = r;
      }
    }

    res.json(Object.values(latest));
  } catch (err) {
    console.error(err);
    res.status(500).send("Cosmos DB error");
  }
});

// ---------- TREND DATA (old version) ----------
app.get("/api/trend", async (req, res) => {
  try {
    const query = {
      query: "SELECT * FROM c ORDER BY c.windowEnd DESC"
    };

    const { resources } = await container.items.query(query).fetchAll();

    // TAKE LAST 12 RECORDS (1 hour)
    const last12 = resources.slice(0, 12).reverse();

    res.json(last12);
  } catch (err) {
    console.error(err);
    res.status(500).send("Trend error");
  }
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
