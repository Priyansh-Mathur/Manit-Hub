const Document = require("../models/Document");
const { success, error } = require("../utils/response");
const { createNotification } = require("./notifications.controller");
const { awardPoints } = require("../utils/gamification");

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
exports.getDocuments = async (req, res, next) => {
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
};

/**
 * GET /api/documents/me
 */
exports.getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({
      uploader: req.user._id,
      isActive: true,
      university: req.user.university,
    }).sort({ createdAt: -1 });

    return success(res, documents);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/documents
 */
exports.createDocument = async (req, res, next) => {
  try {
    const { title, description, type, branch, subject, semester, year } =
      req.body;

    if (!title || !type) {
      return error(res, "Missing required fields", 400);
    }

    if (!req.file) {
      return error(res, "No file uploaded", 400);
    }

    const originalName = req.file.originalname || "";
    const extension = originalName.includes(".")
      ? originalName.split(".").pop().toLowerCase()
      : "";

    const document = await Document.create({
      title,
      description,
      type,
      branch,
      subject,
      semester,
      year: year ? Number(year) : undefined,
      fileUrl: req.file.path,
      fileName: originalName,
      fileFormat: extension,
      fileSize: req.file.size,
      uploader: req.user._id,
      university: req.user.university,
    });

    await awardPoints(req.user._id, "document_upload");

    return success(res, document, "Document uploaded", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/documents/:id/download
 */
exports.incrementDownload = async (req, res, next) => {
  try {
    const document = req.resource;

    if (!document || !document.isActive) {
      return error(res, "Document not found", 404);
    }

    document.downloadCount += 1;
    await document.save();

    return success(res, {
      fileUrl: document.fileUrl,
      downloadCount: document.downloadCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/documents/:id/upvote — toggle the viewer's upvote.
 */
exports.toggleUpvote = async (req, res, next) => {
  try {
    const document = req.resource;

    if (!document || !document.isActive) {
      return error(res, "Document not found", 404);
    }

    const viewer = req.user._id.toString();
    const hasUpvoted = document.upvotes.some((u) => u.toString() === viewer);

    if (hasUpvoted) {
      document.upvotes = document.upvotes.filter(
        (u) => u.toString() !== viewer
      );
    } else {
      document.upvotes.push(req.user._id);
    }
    document.upvoteCount = document.upvotes.length;
    await document.save();

    return success(res, {
      upvoteCount: document.upvoteCount,
      myUpvote: !hasUpvoted,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/documents/:id/comments
 */
exports.addComment = async (req, res, next) => {
  try {
    const document = req.resource;

    if (!document || !document.isActive) {
      return error(res, "Document not found", 404);
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return error(res, "Comment can't be empty", 400);
    }
    if (content.trim().length > 500) {
      return error(res, "Keep comments under 500 characters", 400);
    }

    document.comments.push({
      author: req.user._id,
      content: content.trim(),
    });
    await document.save();
    await document.populate("comments.author", "displayName avatarUrl");

    if (document.uploader.toString() !== req.user._id.toString()) {
      await createNotification(
        document.uploader,
        "system",
        `New comment on “${document.title}”`,
        `${req.user.displayName} commented on your document.`,
        null,
        null
      );
    }

    return success(
      res,
      document.comments[document.comments.length - 1],
      "Comment posted",
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/documents/:id
 */
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = req.resource;

    if (!document || !document.isActive) {
      return error(res, "Document not found or not authorized", 404);
    }

    if (document.uploader.toString() !== req.user._id.toString()) {
      return error(res, "Document not found or not authorized", 404);
    }

    document.isActive = false;
    await document.save();

    return success(res, null, "Document deleted");
  } catch (err) {
    next(err);
  }
};
