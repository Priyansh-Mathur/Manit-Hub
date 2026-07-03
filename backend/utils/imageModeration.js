// Image moderation gate for user uploads (avatars, listing/lost-found photos,
// QR, covers). Env-gated so it is a no-op until you configure a provider —
// nothing breaks in local dev or before you sign up for an API.
//
// Enable by setting:
//   IMAGE_MODERATION_PROVIDER=google
//   GOOGLE_VISION_API_KEY=<your key>          (Cloud Vision SafeSearch)
// or
//   IMAGE_MODERATION_PROVIDER=sightengine
//   SIGHTENGINE_USER=<id>  SIGHTENGINE_SECRET=<secret>
//
// Threshold: reject if adult/racy content is "LIKELY" or "VERY_LIKELY"
// (Google) or nudity/sexual probability >= 0.6 (Sightengine).
//
// Failure policy: if the provider errors or times out we FAIL OPEN (allow the
// upload) so a provider outage can't block the whole app — the report queue is
// the backstop. Flip FAIL_OPEN to false to fail closed instead.

const FAIL_OPEN = true;

const provider = (process.env.IMAGE_MODERATION_PROVIDER || "").toLowerCase();

function isEnabled() {
  if (provider === "google") return Boolean(process.env.GOOGLE_VISION_API_KEY);
  if (provider === "sightengine") {
    return Boolean(process.env.SIGHTENGINE_USER && process.env.SIGHTENGINE_SECRET);
  }
  return false;
}

// data:<mime>;base64,<data>  ->  { mime, base64 }
function parseDataUrl(dataUrl) {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(String(dataUrl || ""));
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
}

const BLOCKING_LIKELIHOODS = new Set(["LIKELY", "VERY_LIKELY"]);

async function checkGoogle(base64) {
  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "SAFE_SEARCH_DETECTION" }],
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) throw new Error(`Vision API ${res.status}`);
  const json = await res.json();
  const s = json?.responses?.[0]?.safeSearchAnnotation;
  if (!s) return { allowed: true };
  if (BLOCKING_LIKELIHOODS.has(s.adult) || BLOCKING_LIKELIHOODS.has(s.racy)) {
    return { allowed: false, reason: "adult/explicit imagery" };
  }
  return { allowed: true };
}

async function checkSightengine(base64, mime) {
  const form = new FormData();
  const bytes = Buffer.from(base64, "base64");
  form.append("media", new Blob([bytes], { type: mime }), "upload");
  form.append("models", "nudity-2.0");
  form.append("api_user", process.env.SIGHTENGINE_USER);
  form.append("api_secret", process.env.SIGHTENGINE_SECRET);

  const res = await fetch("https://api.sightengine.com/1.0/check.json", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Sightengine ${res.status}`);
  const json = await res.json();
  const n = json?.nudity || {};
  const sexual = Math.max(n.sexual_activity || 0, n.sexual_display || 0, n.erotica || 0);
  if (sexual >= 0.6) return { allowed: false, reason: "adult/explicit imagery" };
  return { allowed: true };
}

/**
 * Moderate a single base64 data URL.
 * Returns { allowed: boolean, reason?: string }.
 */
async function moderateImageDataUrl(dataUrl) {
  if (!isEnabled()) return { allowed: true };

  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return { allowed: true }; // not a data URL (e.g. Cloudinary URL)

  try {
    if (provider === "google") return await checkGoogle(parsed.base64);
    if (provider === "sightengine") {
      return await checkSightengine(parsed.base64, parsed.mime);
    }
    return { allowed: true };
  } catch (e) {
    console.error("image moderation failed:", e.message);
    return FAIL_OPEN
      ? { allowed: true }
      : { allowed: false, reason: "moderation unavailable" };
  }
}

/**
 * Moderate many data URLs; resolves to the first rejection, or allowed.
 */
async function moderateImageDataUrls(dataUrls = []) {
  for (const url of dataUrls) {
    // eslint-disable-next-line no-await-in-loop
    const result = await moderateImageDataUrl(url);
    if (!result.allowed) return result;
  }
  return { allowed: true };
}

module.exports = { moderateImageDataUrl, moderateImageDataUrls, isEnabled };
