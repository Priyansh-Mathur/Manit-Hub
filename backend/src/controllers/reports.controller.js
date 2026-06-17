const Report = require("../models/Report");
const { success, error } = require("../utils/response");

// How each reportable type is loaded, summarized and (if needed) removed.
const TARGETS = {
  listing: {
    model: () => require("../models/Listing"),
    snapshot: (doc) => ({ title: doc.title, content: doc.description }),
    remove: (doc) => (doc.isActive = false),
  },
  document: {
    model: () => require("../models/Document"),
    snapshot: (doc) => ({ title: doc.title, content: doc.description }),
    remove: (doc) => (doc.isActive = false),
  },
  confession: {
    model: () => require("../models/Confession"),
    snapshot: (doc) => ({ title: "Confession", content: doc.content }),
    remove: (doc) => (doc.isHidden = true),
  },
  question: {
    model: () => require("../models/Question"),
    snapshot: (doc) => ({ title: doc.title, content: doc.body }),
    remove: (doc) => (doc.isActive = false),
  },
  answer: {
    model: () => require("../models/Answer"),
    snapshot: (doc) => ({ title: "Answer", content: doc.body }),
    remove: (doc) => (doc.isActive = false),
  },
  lostfound: {
    model: () => require("../models/LostFoundItem"),
    snapshot: (doc) => ({ title: doc.title, content: doc.description }),
    remove: (doc) => (doc.isActive = false),
  },
  ride: {
    model: () => require("../models/Ride"),
    snapshot: (doc) => ({ title: `${doc.from} → ${doc.to}`, content: doc.note }),
    remove: (doc) => (doc.isActive = false),
  },
  event: {
    model: () => require("../models/Event"),
    snapshot: (doc) => ({ title: doc.title, content: doc.description }),
    remove: (doc) => (doc.isActive = false),
  },
};

/**
 * POST /api/reports  { targetType, targetId, reason }
 */
exports.createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body;

    const target = TARGETS[targetType];
    if (!target || !targetId) {
      return error(res, "Invalid report target", 400);
    }
    if (!reason || !reason.trim()) {
      return error(res, "A reason is required", 400);
    }

    const doc = await target.model().findById(targetId);
    if (!doc) {
      return error(res, "Content not found", 404);
    }
    if (doc.university.toString() !== req.user.university.toString()) {
      return error(res, "Access denied", 403);
    }

    const existing = await Report.findOne({
      reporter: req.user._id,
      targetType,
      targetId,
    });
    if (existing) {
      return error(res, "You already reported this content", 400);
    }

    const report = await Report.create({
      reporter: req.user._id,
      university: req.user.university,
      targetType,
      targetId,
      reason: reason.trim(),
      snapshot: target.snapshot(doc),
    });

    return success(res, report, "Reported — a moderator will review it", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports?status=open  (admin)
 */
exports.getReports = async (req, res, next) => {
  try {
    const { status = "open", page = 1, limit = 20 } = req.query;
    const safeLimit = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * safeLimit;

    const query = { university: req.user.university };
    if (status !== "all") query.status = status;

    const [reports, total, openCount] = await Promise.all([
      Report.find(query)
        .populate("reporter", "displayName avatarUrl")
        .populate("handledBy", "displayName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Report.countDocuments(query),
      Report.countDocuments({ university: req.user.university, status: "open" }),
    ]);

    res.json({
      success: true,
      data: reports,
      meta: {
        page: Number(page),
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
        openCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/reports/:id  (admin)  { action: "dismiss" | "remove" }
 * "remove" hides/deactivates the reported content and resolves the report.
 */
exports.handleReport = async (req, res, next) => {
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
};
