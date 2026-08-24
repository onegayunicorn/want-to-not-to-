import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { IngestionGateway } from "./gateway/ingestion.mjs";
import { createSnapshot } from "./provenance/merkle.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

app.use(express.json());

const gateway = new IngestionGateway();

// Gateway API routes
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "learning-commons-ingestion" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "learning-commons-ingestion" });
});

app.get("/commons", (req, res) => {
  res.json({ notes: gateway.commons(), stats: gateway.stats() });
});

app.get("/snapshot", (req, res) => {
  res.json(createSnapshot(gateway.commons()));
});

app.post("/ingest", (req, res) => {
  try {
    const result = gateway.ingest(req.body);
    res.json(result);
  } catch {
    res.status(400).json({ accepted: false, code: "invalid_json" });
  }
});

// Serve static files from the project directory
app.use(express.static(__dirname));

// Fallback to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`Learning Commons server running on http://${HOST}:${PORT}`);
});
