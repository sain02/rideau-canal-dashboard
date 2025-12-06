# API Documentation

## GET /api/latest
- Returns latest sensor aggregation for all locations
- Response example:
```json
[
  {
    "location": "DowsLake",
    "windowEnd": "2025-12-06T12:05:00Z",
    "avgIceThickness": 32.5,
    "safetyStatus": "Safe"
  },
  ...
]
