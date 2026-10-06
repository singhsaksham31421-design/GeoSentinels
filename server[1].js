import express from "express";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

const demoRisk = [
  {id:1,location:"Guwahati",country:"India",region:"Assam",lat:26.1445,lng:91.7362,risk_score:86,risk_level:"Critical",confidence:94,rainfall:182,soil_moisture:78,slope:32,elevation:55,updated:"2026-10-06T17:45:00Z",active_warning:true},
  {id:2,location:"Tawang",country:"India",region:"Arunachal Pradesh",lat:27.5860,lng:91.8590,risk_score:79,risk_level:"High",confidence:91,rainfall:145,soil_moisture:71,slope:41,elevation:3048,updated:"2026-10-06T17:30:00Z",active_warning:true},
  {id:3,location:"Shillong",country:"India",region:"Meghalaya",lat:25.5788,lng:91.8933,risk_score:68,risk_level:"High",confidence:88,rainfall:124,soil_moisture:65,slope:27,elevation:1496,updated:"2026-10-06T16:50:00Z",active_warning:false},
  {id:4,location:"Imphal",country:"India",region:"Manipur",lat:24.8170,lng:93.9368,risk_score:54,risk_level:"Moderate",confidence:84,rainfall:98,soil_moisture:59,slope:19,elevation:786,updated:"2026-10-06T16:20:00Z",active_warning:false},
  {id:5,location:"Aizawl",country:"India",region:"Mizoram",lat:23.7271,lng:92.7176,risk_score:73,risk_level:"High",confidence:90,rainfall:137,soil_moisture:73,slope:36,elevation:1132,updated:"2026-10-06T17:10:00Z",active_warning:true},
  {id:6,location:"Kohima",country:"India",region:"Nagaland",lat:25.6751,lng:94.1086,risk_score:61,risk_level:"Moderate",confidence:86,rainfall:112,soil_moisture:61,slope:29,elevation:1444,updated:"2026-10-06T15:55:00Z",active_warning:false},
  {id:7,location:"Agartala",country:"India",region:"Tripura",lat:23.8315,lng:91.2868,risk_score:43,risk_level:"Moderate",confidence:82,rainfall:91,soil_moisture:54,slope:13,elevation:12,updated:"2026-10-06T15:30:00Z",active_warning:false},
  {id:8,location:"Gangtok",country:"India",region:"Sikkim",lat:27.3389,lng:88.6065,risk_score:76,risk_level:"High",confidence:92,rainfall:129,soil_moisture:69,slope:44,elevation:1650,updated:"2026-10-06T17:05:00Z",active_warning:true},
  {id:9,location:"Darjeeling",country:"India",region:"West Bengal",lat:27.0360,lng:88.2627,risk_score:72,risk_level:"High",confidence:89,rainfall:118,soil_moisture:67,slope:39,elevation:2050,updated:"2026-10-06T16:40:00Z",active_warning:false},
  {id:10,location:"Kathmandu",country:"Nepal",region:"Bagmati",lat:27.7172,lng:85.3240,risk_score:48,risk_level:"Moderate",confidence:79,rainfall:76,soil_moisture:48,slope:22,elevation:1400,updated:"2026-10-06T14:40:00Z",active_warning:false}
];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/risk-map", async (req, res) => {
  if (!pool) return res.json({ source: "demo", data: demoRisk });

  try {
    const { country, region, risk_level, active_alert } = req.query;
    const params = [];
    const where = [];
    if (country) { params.push(country); where.push(`country = $${params.length}`); }
    if (region) { params.push(region); where.push(`region = $${params.length}`); }
    if (risk_level) { params.push(risk_level); where.push(`risk_level = $${params.length}`); }
    if (active_alert === "true") { where.push(`active_warning = true`); }

    const sql = `
      SELECT id, location, country, region,
             ST_Y(geom)::float AS lat, ST_X(geom)::float AS lng,
             risk_score, risk_level, confidence, rainfall,
             soil_moisture, slope, elevation, updated, active_warning
      FROM risk_locations
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY risk_score DESC
      LIMIT 5000
    `;
    const result = await pool.query(sql, params);
    res.json({ source: "postgis", data: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not load risk map data." });
  }
});

app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`GeoSentinels running at http://localhost:${PORT}`));
