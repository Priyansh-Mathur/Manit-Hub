const LostFoundItem = require("../models/LostFoundItem");
const { success, error } = require("../utils/response");

/**
 * GET /api/lost-found
 */
exports.getItems = async (req, res, next) => {
  try {
    const {
      search,
      kind,
      category,
      status,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    const safeLimit = Math.min(Number(limit), 50);
    const query = {
      isActive: true,
      university: req.user.university,
    };

    if (kind && kind !== "all") query.kind = kind;
    if (category && category !== "All") query.category = category;
    if (status && status !== "all") query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };

    const skip = (Number(page) - 1) * safeLimit;

    const [items, total] = await Promise.all([
      LostFoundItem.find(query)
        .populate("reporter", "displayName avatarUrl")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(safeLimit),
      LostFoundItem.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
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
 * POST /api/lost-found
 */
exports.createItem = async (req, res, next) => {
  try {
    const { title, description, kind, category, location } = req.body;

    if (!title || !kind || !category) {
      return error(res, "Missing required fields", 400);
    }

    if (!["lost", "found"].includes(kind)) {
      return error(res, "Kind must be lost or found", 400);
    }

    const images = (req.files || []).map((file) => file.path);

    const item = await LostFoundItem.create({
      title,
      description,
      kind,
      category,
      location,
      images,
      reporter: req.user._id,
      university: req.user.university,
    });

    await item.populate("reporter", "displayName avatarUrl");

    return success(res, item, "Item posted", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/lost-found/:id/status
 * Reporter marks their item as returned (or reopens it).
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const item = req.resource;

    if (!item || !item.isActive) {
      return error(res, "Item not found", 404);
    }

    if (item.reporter.toString() !== req.user._id.toString()) {
      return error(res, "Item not found or not authorized", 404);
    }

    const { status } = req.body;
    if (!["open", "returned"].includes(status)) {
      return error(res, "Invalid status", 400);
    }

    item.status = status;
    await item.save();
    await item.populate("reporter", "displayName avatarUrl");

    return success(res, item, "Status updated");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/lost-found/:id
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const item = req.resource;

    if (!item || !item.isActive) {
      return error(res, "Item not found or not authorized", 404);
    }

    if (item.reporter.toString() !== req.user._id.toString()) {
      return error(res, "Item not found or not authorized", 404);
    }

    item.isActive = false;
    await item.save();

    return success(res, null, "Item removed");
  } catch (err) {
    next(err);
  }
};
