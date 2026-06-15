const HANDLE_PATTERN = /^[a-z0-9_.]{3,20}$/;

const isValidHandle = (handle) =>
  typeof handle === "string" && HANDLE_PATTERN.test(handle);

// Sanitize an arbitrary string (e.g. email local-part) into a handle base.
const sanitizeBase = (raw) => {
  let base = String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "")
    .replace(/^[._]+|[._]+$/g, "");
  if (base.length < 3) base = `${base}user`.slice(0, 20);
  return base.slice(0, 20);
};

/**
 * Generate a unique handle from a seed (email/displayName), appending a
 * numeric suffix until free. Requires the User model to avoid a circular
 * require at module load, so it's passed in.
 */
const generateUniqueHandle = async (User, seed) => {
  const base = sanitizeBase(seed);
  // Try the bare base first, then base1, base2, … trimming to fit 20 chars.
  for (let i = 0; i < 1000; i += 1) {
    const suffix = i === 0 ? "" : String(i);
    const candidate = `${base.slice(0, 20 - suffix.length)}${suffix}`;
    // eslint-disable-next-line no-await-in-loop
    const taken = await User.exists({ handle: candidate });
    if (!taken) return candidate;
  }
  // Extremely unlikely fallback.
  return `${base.slice(0, 13)}${Date.now().toString(36).slice(-6)}`;
};

module.exports = { HANDLE_PATTERN, isValidHandle, sanitizeBase, generateUniqueHandle };
