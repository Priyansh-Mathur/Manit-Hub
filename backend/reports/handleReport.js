const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const universityScope = require("../middleware/universityScope");
const Report = require("../models/Report");
const { success, error } = require("../utils/response");
const { addStrike } = require("../utils/moderation");
const TARGETS = require("./targets");

// Author field per reportable type (for attributing a strike on removal).
const AUTHOR_FIELD = {
  listing: "seller",
  document: "uploader",
  confession: "author",
  question: "author",
  answer: "author",
  lostfound: "reporter",
  ride: "poster",
  event: "organizer",
};

/**
 * PATCH /api/reports/:id  (admin)  { action: "dismiss" | "remove" }
 * "remove" hides/deactivates the reported content and resolves the report.
 */
router.patch("/:id", auth, isAdmin, universityScope(Report), async (req, res, next) => {
  try {
    const report = req.resource;
    const { action } = req.body;

    if (report.status !== "open") {
      return error(res, "Report already handled", 400);
    }

    if (action === "dismiss") {
      report.status = "dismissed";
    } else if (action === "remove") {
      const target = TARGETS[report.targetType];
      const doc = await target.model().findById(report.targetId);
      if (doc) {
        target.remove(doc);
        await doc.save();

        // Strike the content's author — enough strikes auto-suspends them.
        const authorId = doc[AUTHOR_FIELD[report.targetType]];
        if (authorId) {
          await addStrike(authorId, `${report.targetType} removed by moderator`);
        }
      }
      report.status = "resolved";

      // Resolve every other open report against the same content.
      await Report.updateMany(
        {
          targetType: report.targetType,
          targetId: report.targetId,
          status: "open",
          _id: { $ne: report._id },
        },
        {
          status: "resolved",
          handledBy: req.user._id,
          handledAt: new Date(),
        }
      );
    } else {
      return error(res, "Invalid action", 400);
    }

    report.handledBy = req.user._id;
    report.handledAt = new Date();
    await report.save();
    await report.populate("reporter", "displayName avatarUrl");

    return success(
      res,
      report,
      action === "remove" ? "Content removed" : "Report dismissed"
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
