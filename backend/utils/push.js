const { messaging } = require("../config/firebase");
const DeviceToken = require("../models/DeviceToken");

/**
 * Send an FCM push to all of a user's registered devices.
 * Fire-and-forget: never throws, no-ops when FCM isn't configured.
 */
const sendPushToUser = async (userId, title, body) => {
  try {
    if (!messaging || !userId) return;

    const devices = await DeviceToken.find({ user: userId });
    if (!devices.length) return;

    const response = await messaging.sendEachForMulticast({
      tokens: devices.map((d) => d.token),
      notification: { title, body },
      data: { url: "/notifications" },
    });

    // Prune tokens FCM says are dead.
    const deadTokens = [];
    response.responses.forEach((r, i) => {
      const code = r.error?.code || "";
      if (
        code.includes("registration-token-not-registered") ||
        code.includes("invalid-argument")
      ) {
        deadTokens.push(devices[i].token);
      }
    });
    if (deadTokens.length) {
      await DeviceToken.deleteMany({ token: { $in: deadTokens } });
    }
  } catch (err) {
    console.error("sendPushToUser failed:", err.message);
  }
};

module.exports = { sendPushToUser };
