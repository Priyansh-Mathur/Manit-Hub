const Notification = require("../models/Notification");
const { sendPushToUser } = require("./push");

// Shared helper (formerly notifications.controller.createNotification): create an
// in-app notification and mirror it as an FCM push. Used across many features.
async function createNotification(
  userId,
  type,
  title,
  description,
  relatedId = null,
  relatedModel = null
) {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      description,
      relatedId,
      relatedModel,
    });

    // Mirror every in-app notification as an FCM push (no-op if unconfigured).
    sendPushToUser(userId, title, description);

    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    return null;
  }
}

module.exports = { createNotification };
