import http from "node:http";
import { IngestionGateway } from "./ingestion.mjs";
import { createSnapshot } from "../provenance/merkle.mjs";

export function createGatewayServer({ gateway = new IngestionGateway() } = {}) {
  return http.createServer(async (request, response) => {
    const send = (status, body) => { response.writeHead(status, { "content-type": "application/json" }); response.end(JSON.stringify(body)); };
    if (request.method === "GET" && request.url === "/health") return send(200, { ok: true, service: "learning-commons-ingestion" });
    if (request.method === "GET" && request.url === "/commons") return send(200, { notes: gateway.commons(), stats: gateway.stats() });
    if (request.method === "GET" && request.url === "/snapshot") return send(200, createSnapshot(gateway.commons()));
    if (request.method === "POST" && request.url === "/ingest") {
      let raw = "";
      for await (const chunk of request) raw += chunk;
      try { return send(200, gateway.ingest(JSON.parse(raw))); } catch { return send(400, { accepted: false, code: "invalid_json" }); }
    }
    return send(404, { error: "not_found" });
  });
}

if (process.argv[1] && process.argv[1].endsWith("server.mjs")) {
  const port = Number(process.env.PORT || 8787);
  createGatewayServer().listen(port, "127.0.0.1", () => console.log(`Learning Commons gateway listening on http://127.0.0.1:${port}`));
}
