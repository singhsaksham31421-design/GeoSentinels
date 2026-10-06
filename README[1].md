# GeoSentinels Interactive Risk Map

## Run
1. Install Node.js 18+.
2. In this folder run:
   npm install
   npm start
3. Open http://localhost:3000

The app works immediately with demo data. To use PostGIS, set DATABASE_URL and run `sql/schema.sql` in PostgreSQL with PostGIS enabled.

## API
GET /risk-map

Optional query parameters:
- country
- region
- risk_level
- active_alert=true

The production query reads coordinates from PostGIS `GEOMETRY(Point, 4326)`.

## Map
- Leaflet + OpenStreetMap street layer
- Esri satellite layer
- Esri terrain layer
- Dark/light street mode
- Search
- World → India → NER focus
- Risk circles + heat-style visualization
- Historical/demo landslide markers
- Rainfall overlay toggle
- High-risk zone boundaries
- Location popups
- Dashboard and filters

For a production deployment, review tile-provider terms/quotas and replace demo counters/data with your live APIs.
