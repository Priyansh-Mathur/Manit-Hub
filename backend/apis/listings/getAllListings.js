const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Listing = require("../../models/Listing");

/**
 * GET /api/listings
 */
router.get("/", auth, async (req, res) => {
  try {
    const {
      search,
      category,
      condition,
      seller,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = "newest",
      status,
    } = req.query;

    const safeLimit = Math.min(Number(limit), 50);
    const query = {
      isActive: true,
      university: req.user.university,
    };

    if (status && status !== "all") {
      query.status = status;
    } else if (!status) {
      query.status = "available";
    }

    if (category && category !== "All") query.category = category;
    if (condition) query.condition = condition;
    if (seller) query.seller = seller;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
      title_asc: { title: 1 },
      title_desc: { title: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate("seller", "displayName avatarUrl")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(safeLimit),
      Listing.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: listings,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
