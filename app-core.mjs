export const STORAGE_KEY = "learning-commons.entries.v1";
export const MAX_LENGTH = 360;

export function noteString(value) {
  return String(value ?? "");
}

export function noteLength(value) {
  return noteString(value).length;
}

export function normalizeNote(value) {
  return noteString(value).slice(0, MAX_LENGTH).trim();
}

export function canAsk(value) {
  const length = noteLength(value);
  return length >= 10 && length <= MAX_LENGTH;
}

export function canShare(value) {
  return normalizeNote(value).length > 0;
}

export function nextSingleIndex(current, direction, total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const currentIndex = Number.isFinite(current) ? Math.trunc(current) : 0;
  const delta = direction === "next" ? 1 : -1;
  return Math.max(0, Math.min(total - 1, currentIndex + delta));
}

export function routeFromHash(hash) {
  return String(hash ?? "").replace(/^#/, "") === "commons" ? "commons" : "write";
}

export function readingTime(text) {
  return Math.max(1, Math.ceil(noteString(text).trim().split(/\s+/).filter(Boolean).length / 220));
}

const feelingWords = /\b(feel|feeling|felt|makes me|made me|upset|sad|happy|angry|anxious|afraid|lonely|hurt|ashamed|excited|depressed|overwhelmed|frustrated)\b/i;

export function guideResponse(value) {
  const text = noteString(value).trim();
  if (!text) {
    return {
      tone: "open",
      message: "What are you trying to capture here? Something you learned, something you tried, a method you use, an observation, or an idea?",
      prompts: ["What did you notice?", "What did you try?", "What changed?"]
    };
  }
  if (feelingWords.test(text)) {
    return {
      tone: "redirect",
      message: "Can we look at what happened rather than the feeling it produced?",
      prompts: ["What did you notice?", "What did you do?", "What changed?", "What might you try next time?"]
    };
  }
  if (text.length < 90) {
    return {
      tone: "develop",
      message: "You have a useful starting point. Can you add the situation, the action or method, and what changed in your understanding?",
      prompts: ["Where did this happen?", "What was your method?", "What did it reveal?"]
    };
  }
  return {
    tone: "reflect",
    message: "This has the shape of a useful learning trace. What would you want the next reader to notice, try, or test?",
    prompts: ["What is the transferable idea?", "What could another person test?", "What would you try next?"]
  };
}
