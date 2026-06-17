const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Document = require("../models/Document");

// Decorate a populated document with viewer-specific fields and trim
// the raw upvote user list out of the payload.
const serializeDocument = (doc, viewerId) => {
  const data = doc.toObject();
  data.myUpvote = doc.upvotes.some(
    (u) => u.toString() === viewerId.toString()
  );
  delete data.upvotes;
  return data;
};

/**
 * GET /api/documents
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const {
      search,
      type,
      branch,
      subject,
      semester,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    const safeLimit = Math.min(Number(limit), 50);
    const query = {
      isActive: true,
      university: req.user.university,
    };

    if (type && type !== "All") query.type = type;
    if (branch && branch !== "All") query.branch = branch;
    if (semester && semester !== "All") query.semester = semester;
    if (subject) query.subject = { $regex: subject, $options: "i" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      downloads: { downloadCount: -1 },
      top: { upvoteCount: -1, createdAt: -1 },
      title_asc: { title: 1 },
    };

    const skip = (Number(page) - 1) * safeLimit;

    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate("uploader", "displayName avatarUrl")
        .populate("comments.author", "displayName avatarUrl")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(safeLimit),
      Document.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: documents.map((doc) => serializeDocument(doc, req.user._id)),
      meta: {
        page: Number(page),
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
