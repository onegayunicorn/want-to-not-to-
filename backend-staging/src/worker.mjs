import { createHash, randomUUID } from "node:crypto";
import { RateLimiter } from "./abuse/rate-limit.mjs";
import { moderate } from "./moderation/rules.mjs";
import { publicNote, publicNotes, validateSubmitPayload } from "./privacy/contract.mjs";
import { assignIdeaPosition } from "./map/cluster.mjs";

export function createStageBApp({ clock = () => Date.now(), rateLimiter = new RateLimiter({ clock }) } = {}) {
  const notes = new Map();

  async function handle(request) {
    const url = new URL(request.url);
    const headers = {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "content-security-policy": "default-src 'none'"
    };
    const respond = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (url.pathname === "/health" && request.method === "GET") return respond({ ok: true, mode: "simulation" });

    if (url.pathname === "/submit" && request.method === "POST") {
      const bucketKey = request.headers.get("x-simulation-bucket") || "simulation-anonymous-bucket";
      const rate = rateLimiter.check(bucketKey);
      if (!rate.allowed) return respond({ error: "rate_limited" }, 429);
      let payload;
      try { payload = await request.json(); } catch { return respond({ error: "invalid_json" }, 400); }
      const valid = validateSubmitPayload(payload);
      if (!valid.ok) return respond({ error: valid.reason }, 400);
      const contentHash = createHash("sha256").update(valid.note).digest("hex");
      if ([...notes.values()].some((note) => note.content_hash === contentHash)) return respond({ error: "duplicate_note" }, 409);
      const decision = moderate(valid.note);
      const note = {
        id: `sim-${randomUUID()}`,
        content: valid.note,
        content_hash: contentHash,
        moderation_state: decision.state,
        moderation_reason: decision.reason,
        idea_position: assignIdeaPosition(valid.note, Array.isArray(payload.concepts) ? payload.concepts : []),
        created_at: new Date(clock()).toISOString()
      };
      if (decision.state !== "rejected") notes.set(note.id, note);
      return respond({ id: note.id, state: decision.state, note: decision.state === "approved" ? publicNote(note) : undefined }, decision.state === "rejected" ? 422 : 201);
    }

    if (url.pathname === "/notes" && request.method === "GET") {
      return respond(publicNotes([...notes.values()]));
    }

    const match = url.pathname.match(/^\/notes\/([^/]+)$/);
    if (match && request.method === "GET") {
      const note = notes.get(match[1]);
      return note?.moderation_state === "approved" ? respond(publicNote(note)) : respond({ error: "not_found" }, 404);
    }

    return respond({ error: "not_found" }, 404);
  }

  return { handle, notes, rateLimiter };
}

export default {
  fetch(request, env, ctx) {
    return createStageBApp().handle(request);
  }
};
