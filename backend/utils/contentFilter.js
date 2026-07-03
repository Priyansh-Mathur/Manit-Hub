// Lightweight profanity / slur filter for user-generated text (confessions,
// forum posts, listings, chat). Self-contained (no external dependency) and
// tuned for this app's audience — English plus common Hindi/Hinglish abuse.
//
// It is deliberately conservative: it matches whole normalized words (so
// "class"/"assignment" are NOT flagged) but also un-obfuscates common evasions
// (leetspeak "fuck→f4ck", spacing "f u c k", repeats "fuuuck"). It is a first
// gate, not a guarantee — the report queue + admin takedown remain the backstop.
//
// Extend the block list at runtime with EXTRA_BLOCKED_WORDS (comma-separated).

const BASE_BLOCKED = [
  // English — sexual / explicit
  "fuck", "fucker", "fucking", "motherfucker", "cock", "cunt", "pussy",
  "dick", "dildo", "blowjob", "handjob", "cum", "jizz", "porn", "porno",
  "nude", "nudes", "boobs", "titties", "whore", "slut", "rape", "rapist",
  // English — slurs / hate
  "nigger", "nigga", "faggot", "retard", "bitch", "bastard", "asshole",
  // Hindi / Hinglish — common abuse
  "madarchod", "madarchoad", "behenchod", "bhenchod", "bhosdike", "bhosdi",
  "chutiya", "chutiye", "chutil", "gaandu", "gandu", "gaand", "lund", "lauda",
  "loda", "randi", "harami", "kutte", "kamine", "chinaal", "chodu",
];

// A subset checked against the whitespace-stripped text to catch spaced-out
// evasions like "f u c k". Kept to unambiguous words to avoid false positives.
const SEVERE = [
  "fuck", "cunt", "nigger", "faggot", "rape", "madarchod", "behenchod",
  "bhenchod", "bhosdike", "chutiya", "gaandu", "randi", "porn",
];

const extra = (process.env.EXTRA_BLOCKED_WORDS || "")
  .split(",")
  .map((w) => w.trim().toLowerCase())
  .filter(Boolean);

const BLOCKED = new Set([...BASE_BLOCKED, ...extra]);

// Map leetspeak/symbol substitutions back to letters so "p0rn"/"pu$$y" match.
function deLeet(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[@]/g, "a")
    .replace(/[$]/g, "s")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/8/g, "b");
}

// Collapse runs of the same letter ("fuuuck" -> "fuck") for dictionary compare.
function collapseRepeats(word) {
  return word.replace(/(.)\1{2,}/g, "$1");
}

/**
 * Returns the first blocked word found, or null if the text is clean.
 */
function findProfanity(text) {
  if (!text) return null;
  const norm = deLeet(text).replace(/[^a-z\s]/g, " ");

  // 1) whole-word match (avoids the "Scunthorpe" false-positive problem)
  for (const raw of norm.split(/\s+/)) {
    if (!raw) continue;
    if (BLOCKED.has(raw) || BLOCKED.has(collapseRepeats(raw))) return raw;
  }

  // 2) spacing-evasion match for the unambiguous severe words
  const collapsed = collapseRepeats(norm.replace(/\s+/g, ""));
  for (const bad of SEVERE) {
    if (collapsed.includes(bad)) return bad;
  }

  return null;
}

function isClean(text) {
  return findProfanity(text) === null;
}

module.exports = { findProfanity, isClean };
