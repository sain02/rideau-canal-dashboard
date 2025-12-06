# Rideau Canal Skateway Dashboard

## Overview
This web dashboard displays real-time and historical data from IoT sensors monitoring the Rideau Canal Skateway.

**Features:**
- Live data display for 3 locations (Dow's Lake, Fifth Avenue, NAC)
- Safety status indicators (Safe, Caution, Unsafe)
- Historical charts (last hour)
- Auto-refresh every 30 seconds

**Technologies Used:** Node.js, Express, Azure Cosmos DB SDK, HTML/CSS, Chart.js

---

## Prerequisites
- Node.js v16+ installed
- Azure Cosmos DB account with `RideauCanalDB` and `SensorAggregations` container
- IoT sensor simulator sending data to Azure IoT Hub

---

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rideau-canal-dashboard.git
cd rideau-canal-dashboard
