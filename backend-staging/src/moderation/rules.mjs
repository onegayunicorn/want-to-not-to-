const LINK_PATTERN = /https?:\/\/|www\./i;
const REPEAT_PATTERN = /(.)\1{7,}/;
const ABUSE_TERMS = /\b(?:dox|kill yourself|credit card|seed phrase)\b/i;

export function moderate(note) {
  if (LINK_PATTERN.test(note) || REPEAT_PATTERN.test(note)) {
    return { state: "rejected", reason: "spam_signal" };
  }
  if (ABUSE_TERMS.test(note)) {
    return { state: "flagged", reason: "safety_review_required" };
  }
  return { state: "approved", reason: "passed_basic_rules" };
}
