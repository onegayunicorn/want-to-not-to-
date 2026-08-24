import { createHash } from "node:crypto";

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }

export function merkleRoot(ids) {
  const leaves = [...new Set(ids)].sort();
  if (leaves.length === 0) return null;
  let layer = leaves.map((id) => sha256(id));
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const right = layer[i + 1] ?? layer[i];
      next.push(sha256(`${layer[i]}${right}`));
    }
    layer = next;
  }
  return `sha256:${layer[0]}`;
}

export function createSnapshot(notes, { snapshotNumber = 1, created_at = new Date().toISOString(), protocol = "learning-commons" } = {}) {
  const note_ids = notes.map((note) => note.note_id ?? note.id).filter(Boolean);
  return { snapshot_id: `ROOT-${String(snapshotNumber).padStart(3, "0")}`, protocol, created_at, note_count: new Set(note_ids).size, note_ids: [...new Set(note_ids)].sort(), merkle_root: merkleRoot(note_ids) };
}
