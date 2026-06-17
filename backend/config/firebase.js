const admin = require("firebase-admin");

/**
 * Firebase Admin bootstrap for FCM push.
 * Configure with FIREBASE_SERVICE_ACCOUNT — the service-account JSON,
 * either raw or base64-encoded. When unset, push is silently disabled
 * (in-app notifications keep working).
 */
let messaging = null;

try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const serviceAccount = JSON.parse(json);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    messaging = admin.messaging();
    console.log("✅ FCM push enabled");
  } else {
    console.log("ℹ️ FIREBASE_SERVICE_ACCOUNT not set — push disabled");
  }
} catch (err) {
  console.error("Firebase init failed — push disabled:", err.message);
  messaging = null;
}

module.exports = { messaging };
