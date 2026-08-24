export const REFERENCE_MODALITIES = Object.freeze(["face", "thermal", "vein", "iris", "fingerprint"]);

export function createMultimodalReference({ available = REFERENCE_MODALITIES, clock = () => new Date().toISOString() } = {}) {
  const supported = new Set(available.filter((name) => REFERENCE_MODALITIES.includes(name)));
  return {
    generated_at: clock(),
    simulated: true,
    source: "biometric_cam_identifier-reference",
    modalities: REFERENCE_MODALITIES.map((name) => ({
      name,
      available: supported.has(name),
      status: supported.has(name) ? "simulated-ready" : "not-configured",
      data_access: "none",
    })),
    safety: {
      captures_sensor_data: false,
      stores_biometric_templates: false,
      performs_identity_matching: false,
      uses_reference_models: false,
    },
  };
}

export function summarizeMultimodalReference(reference) {
  const ready = reference.modalities.filter((modality) => modality.available).map((modality) => modality.name);
  return `${ready.length}/${reference.modalities.length} modalities simulated-ready; no sensor data or biometric templates are accessed.`;
}
