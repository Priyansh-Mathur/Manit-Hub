// Inline SVG fallbacks so the UI never depends on a flaky external placeholder host.

const listingSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="none">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eef3fa"/>
      <stop offset="1" stop-color="#dbe6f4"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#g)"/>
  <g stroke="#9db4d6" stroke-width="3" stroke-linejoin="round" fill="none" opacity="0.8">
    <rect x="244" y="150" width="112" height="86" rx="10"/>
    <path d="M244 178 h112"/>
    <path d="M286 150 v-14 a14 14 0 0 1 28 0 v14"/>
  </g>
  <text x="300" y="286" text-anchor="middle" font-family="Inter, Segoe UI, sans-serif" font-size="20" font-weight="600" fill="#7188a8">Manit Hub</text>
</svg>`;

export const PLACEHOLDER_LISTING = `data:image/svg+xml,${encodeURIComponent(
  listingSvg.trim()
)}`;

const avatarColors = [
  ["#1e4f92", "#2a66ae"],
  ["#bb2735", "#d2434f"],
  ["#996b18", "#bd8a1e"],
  ["#17345d", "#2a66ae"],
  ["#7a5217", "#d6a32b"],
];

/** Deterministic gradient avatar (data URI) for a given seed string. */
export function avatarFor(seed = "?", initial = "?") {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const [a, b] = avatarColors[hash % avatarColors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="120" height="120" fill="url(#a)"/><text x="60" y="76" text-anchor="middle" font-family="Inter, sans-serif" font-size="52" font-weight="700" fill="#ffffff">${(
    initial || "?"
  )
    .slice(0, 1)
    .toUpperCase()}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
