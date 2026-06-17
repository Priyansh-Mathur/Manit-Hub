const cron = require("node-cron");
const TimetableEntry = require("../models/TimetableEntry");
const { createNotification } = require("../controllers/notifications.controller");

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Campus-local (IST) "now" regardless of server timezone (Vercel runs UTC).
const istNow = () => new Date(Date.now() + IST_OFFSET_MS);

const pad = (n) => String(n).padStart(2, "0");

/**
 * Runs every 10 minutes.
 * Reminds students about classes starting within the next 30 minutes (IST).
 */
const classReminderJob = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = istNow();
      const today = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
      const dayOfWeek = now.getUTCDay();
      const current = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;

      const windowEnd = new Date(now.getTime() + 30 * 60 * 1000);
      const windowEndTime = `${pad(windowEnd.getUTCHours())}:${pad(windowEnd.getUTCMinutes())}`;

      // Window crossing midnight is ignored — no classes start around 23:30+.
      if (windowEndTime < current) return;

      const entries = await TimetableEntry.find({
        dayOfWeek,
        startTime: { $gte: current, $lte: windowEndTime },
        lastReminderDay: { $ne: today },
      });

      for (const entry of entries) {
        await createNotification(
          entry.user,
          "system",
          `Upcoming class: ${entry.subject}`,
          [
            `Starts at ${entry.startTime}`,
            entry.room && `in ${entry.room}`,
            entry.professor && `with ${entry.professor}`,
          ]
            .filter(Boolean)
            .join(" ") + ".",
          null,
          null
        );

        entry.lastReminderDay = today;
        await entry.save();
      }

      if (entries.length) {
        console.log(`🔔 Sent ${entries.length} class reminder(s)`);
      }
    } catch (err) {
      console.error("Class reminder job failed:", err);
    }
  });
};

module.exports = classReminderJob;
