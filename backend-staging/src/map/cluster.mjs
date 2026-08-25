const CONCEPTS = [
  "learning from mistakes",
  "want vs need",
  "self-checking",
  "trying again",
  "asking for help"
];

function hash(text) {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

export function assignIdeaPosition(note, conceptHints = []) {
  const source = `${note}|${conceptHints.join("|")}`.toLowerCase();
  const concept = conceptHints.find((hint) => CONCEPTS.includes(String(hint).toLowerCase())) ?? CONCEPTS[hash(source) % CONCEPTS.length];
  const seed = hash(source);
  return {
    concept,
    x: Number((((seed % 2000) / 1000) - 1).toFixed(3)),
    y: Number(((((seed >>> 11) % 2000) / 1000) - 1).toFixed(3))
  };
}
