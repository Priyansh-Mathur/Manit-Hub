const cron = require("node-cron");
const Event = require("../models/Event");
const { createNotification } = require("../controllers/notifications.controller");

/**
 * Runs every 10 minutes.
 * Reminds RSVP'd students (and the organizer) about events starting within the hour.
 */
const eventReminderJob = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const events = await Event.find({
        isActive: true,
        reminderSent: false,
        startAt: { $gte: now, $lte: oneHourFromNow },
      });

      for (const event of events) {
        const startTime = new Date(event.startAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
        });

        const recipients = [
          event.organizer,
          ...event.attendees,
        ];

        await Promise.all(
          recipients.map((userId) =>
            createNotification(
              userId,
              "system",
              `Starting soon: ${event.title}`,
              [
                `Kicks off at ${startTime}`,
                event.venue && `at ${event.venue}`,
              ]
                .filter(Boolean)
                .join(" ") + ".",
              null,
              null
            )
          )
        );

        event.reminderSent = true;
        await event.save();
        console.log(`🔔 Event reminder sent: "${event.title}"`);
      }
    } catch (err) {
      console.error("Event reminder job failed:", err);
    }
  });
};

module.exports = eventReminderJob;
