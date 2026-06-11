import { Capacitor } from "@capacitor/core";
import { registerPushToken } from "../api/push";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let initialized = false;

/**
 * Register this device for FCM push. Safe to call on every app start:
 * silently no-ops when push isn't configured or permission is denied.
 */
export async function initPush() {
  if (initialized) return;
  initialized = true;

  try {
    if (Capacitor.isNativePlatform()) {
      await initNativePush();
    } else {
      await initWebPush();
    }
  } catch (err) {
    // Push is a progressive enhancement — never break the app over it.
    console.warn("Push setup skipped:", err?.message || err);
  }
}

async function initNativePush() {
  const { PushNotifications } = await import("@capacitor/push-notifications");

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "prompt") {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== "granted") return;

  await PushNotifications.addListener("registration", ({ value }) => {
    registerPushToken(value, "android").catch((err) =>
      console.warn("Push token registration failed:", err?.message)
    );
  });

  await PushNotifications.register();
}

async function initWebPush() {
  if (!firebaseConfig.apiKey || !vapidKey) return; // not configured
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const { initializeApp } = await import("firebase/app");
  const { getMessaging, getToken } = await import("firebase/messaging");

  const app = initializeApp(firebaseConfig);

  // The SW reads the config from its query string.
  const params = new URLSearchParams({ config: JSON.stringify(firebaseConfig) });
  const registration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${params.toString()}`
  );

  const token = await getToken(getMessaging(app), {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (token) {
    await registerPushToken(token, "web");
  }
}
