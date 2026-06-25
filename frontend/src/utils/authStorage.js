import { Preferences } from "@capacitor/preferences";

// The session (token + user) is kept in two places on purpose:
//
//  - Capacitor Preferences: native SharedPreferences (Android) / UserDefaults
//    (iOS). This is the DURABLE store and is the reason users now stay logged
//    in. Plain WebView localStorage is flushed to disk lazily and Android wipes
//    it whenever it kills the app process (swipe-close, low memory), which is
//    what logged everyone out on every restart.
//  - localStorage: a synchronous mirror so the axios request interceptor and
//    the socket auth (which read the token synchronously) keep working without
//    awaiting an async plugin call.
//
// All writes go through here so the two stay in sync.
const KEYS = ["token", "user"];

// Write-through. The localStorage writes run synchronously (before the first
// await) so callers that don't await still get an immediately-usable token.
export async function persistAuth({ user, token }) {
  try {
    if (token != null) {
      localStorage.setItem("token", token);
      await Preferences.set({ key: "token", value: token });
    }
    if (user != null) {
      const serialized = typeof user === "string" ? user : JSON.stringify(user);
      localStorage.setItem("user", serialized);
      await Preferences.set({ key: "user", value: serialized });
    }
    // [DIAG] temporary device diagnostics — remove after debugging.
    console.log(`[authStorage] persist OK token=${token ? "yes" : "no"} user=${user ? "yes" : "no"}`);
  } catch (err) {
    // [DIAG] surface a failing native write instead of an unhandled rejection.
    console.warn("[authStorage] persist FAILED:", err);
  }
}

export async function clearAuth() {
  for (const key of KEYS) {
    localStorage.removeItem(key);
    try {
      await Preferences.remove({ key });
    } catch {
      // Web / plugin unavailable — localStorage removal above is enough.
    }
  }
}

// Run once before React renders. Makes Preferences the source of truth by
// copying its values into localStorage so the synchronous readers see them.
// If Preferences is empty but localStorage still has a session (a user who
// upgrades to this build while logged in), migrate it the other way so it
// survives the next time the OS kills the app.
export async function bootstrapAuthStorage() {
  try {
    for (const key of KEYS) {
      const { value } = await Preferences.get({ key });
      // [DIAG] temporary device diagnostics — remove after debugging.
      console.log(
        `[authStorage] bootstrap ${key}: prefs=${value ? "PRESENT" : "null"} local=${localStorage.getItem(key) ? "PRESENT" : "null"}`
      );
      if (value != null) {
        localStorage.setItem(key, value);
      } else {
        const local = localStorage.getItem(key);
        if (local != null && local !== "undefined" && local !== "null") {
          await Preferences.set({ key, value: local });
        }
      }
    }
  } catch (err) {
    // On the web (or if the plugin isn't available) Preferences may throw;
    // localStorage already holds the session there, so just carry on.
    console.warn("Auth storage bootstrap skipped:", err);
  }
}
