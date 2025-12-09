# Rideau Canal Real-Time Dashboard

## Overview
The Rideau Canal Dashboard is a web application built to visualize real-time and historical ice conditions for three monitoring locations:

- **Dow's Lake**
- **Fifth Avenue**
- **NAC**

The dashboard retrieves live data processed by Azure Stream Analytics and stored in Azure Cosmos DB. The interface includes:

- **Live safety status** (Safe / Caution / Unsafe)
- **Real-time readings for each location**
- **Line charts for ice thickness**
- **Auto-refresh**
- **Simple clean UI**

---

## Dashboard Features
- ✔ Displays real-time aggregated data  
- ✔ Safety status indicators for each location  
- ✔ Line chart showing ice thickness trends  
- ✔ Auto-refresh every 10–30 seconds  
- ✔ Clean UI using HTML + CSS + Chart.js  
- ✔ Powered by Express backend and Cosmos DB  

---

## Technologies Used
**Frontend**
- HTML
- CSS
- JavaScript
- Chart.js

**Backend**
- Node.js  
- Express.js  
- @azure/cosmos SDK  

**Cloud Services**
- Azure IoT Hub  
- Azure Stream Analytics  
- Azure Cosmos DB  
- Azure App Service  

---

## Prerequisites
Before running the dashboard you must have:

- Node.js installed (v14+ recommended)
- A Cosmos DB account with:
  - Database: `RideauCanalDB`
  - Container: `SensorAggregations`
  - Partition Key: `/location`
- Stream Analytics sending aggregated data to Cosmos DB
- Sensor Simulator running and generating new data

---
## AI Tools Used
- **Tool:** ChatGPT / GitHub Copilot / etc.
- **Purpose:** Code generation, debugging, documentation

## Installation

1. Clone this repository:
```bash
git clone https://github.com/sain02/rideau-canal-dashboard.git
cd rideau-canal-dashboard

Install dependencies:

npm install


Create a .env file by copying .env.example:

cp .env.example .env


Add your Cosmos DB credentials:

COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=your-key-here
PORT=3000

Configuration
Folder Structure
rideau-canal-dashboard/
│── server.js
│── package.json
│── .env.example
│── .env
│── public/
│     ├── index.html
│     ├── styles.css
│     └── app.js
│── docs/
      └── api-documentation.md


Make sure all files are inside the correct folders.

Running the Dashboard

Start the server:

node server.js


Open your browser:

http://localhost:3000


You should now see your dashboard with live readings.

API Endpoints
1. GET /api/latest

Returns latest aggregated data for all three locations.

Example Response:
[
  {
    "location": "DowsLake",
    "windowEnd": "2025-12-08T12:05:00Z",
    "avgIceThickness": 32.1,
    "safetyStatus": "Safe"
  }
]

2. GET /api/history/:location

Returns historical data for charts.

Example:

/api/history/DowsLake


Response:

[
  {
    "location": "DowsLake",
    "windowEnd": "2025-12-08T11:00:00Z",
    "avgIceThickness": 30.2
  }
]

Deployment to Azure App Service
Step 1 — Zip your dashboard folder

Do NOT include node_modules.

Step 2 — Create Azure App Service

Runtime stack: Node.js 18+

Deploy using ZIP upload or GitHub Actions

Step 3 — Configure App Settings

Inside Azure Portal → Web App → Configuration → Application settings:

Add:

COSMOS_ENDPOINT=your-endpoint
COSMOS_KEY=your-key
PORT=3000

Step 4 — Restart App Service

Go to:

https://yourappname.azurewebsites.net


Your dashboard should now load.

Dashboard Features in Detail
1. Real-time updates

Backend fetches latest 3 documents every refresh cycle.

2. Chart Visualization

Line chart uses data from:

/api/history/:location

3. Safety Indicators

Based on Stream Analytics logic:

Condition	Status
Ice ≥ 30 cm AND Temp ≤ -2°C	SAFE
Ice ≥ 25 cm AND Temp ≤ 0°C	CAUTION
Otherwise	UNSAFE
