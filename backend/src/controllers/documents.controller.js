const Document = require("../models/Document");
const { success, error } = require("../utils/response");

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
      title_asc: { title: 1 },
    };

    const skip = (Number(page) - 1) * safeLimit;

    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate("uploader", "displayName avatarUrl")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(safeLimit),
      Document.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: documents,
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
