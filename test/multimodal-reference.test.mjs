import test from "node:test";
import assert from "node:assert/strict";
import { createMultimodalReference, summarizeMultimodalReference, REFERENCE_MODALITIES } from "../simulator/multimodal-reference.mjs";

test("multimodal reference exposes the expected simulator modalities", () => {
  const reference = createMultimodalReference({ available: ["face", "iris", "unknown"] });
  assert.deepEqual(REFERENCE_MODALITIES, ["face", "thermal", "vein", "iris", "fingerprint"]);
  assert.equal(reference.simulated, true);
  assert.deepEqual(reference.modalities.filter((item) => item.available).map((item) => item.name), ["face", "iris"]);
  assert.match(summarizeMultimodalReference(reference), /2\/5 modalities simulated-ready/);
});

test("multimodal reference has no sensor or identity data access", () => {
  const reference = createMultimodalReference();
  assert.deepEqual(reference.safety, {
    captures_sensor_data: false,
    stores_biometric_templates: false,
    performs_identity_matching: false,
    uses_reference_models: false,
  });
  for (const modality of reference.modalities) {
    assert.equal(modality.data_access, "none");
  }
});
