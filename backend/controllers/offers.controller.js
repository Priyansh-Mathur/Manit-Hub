const Offer = require("../models/Offer");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");
const { createNotification } = require("./notifications.controller");

const POPULATE = [
  { path: "listing", select: "title price images status isActive" },
  { path: "buyer", select: "displayName avatarUrl" },
  { path: "seller", select: "displayName avatarUrl" },
];

const formatINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

/**
 * GET /api/offers?role=buyer|seller
 */
exports.getOffers = async (req, res, next) => {
  try {
    const { role = "buyer", listingId } = req.query;

    const query = { university: req.user.university };
    if (role === "seller") query.seller = req.user._id;
    else query.buyer = req.user._id;
    if (listingId) query.listing = listingId;

    const offers = await Offer.find(query)
      .populate(POPULATE)
      .sort({ updatedAt: -1 });

    return success(res, offers);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/offers  { listingId, amount, message }
 */
exports.createOffer = async (req, res, next) => {
  try {
    const { listingId, amount, message } = req.body;

    const numericAmount = Number(amount);
    if (!listingId || !numericAmount || numericAmount < 1) {
      return error(res, "A valid offer amount is required", 400);
    }

    const listing = await Listing.findById(listingId);
    if (!listing || !listing.isActive || listing.status === "sold") {
      return error(res, "Listing not available", 404);
    }
    if (listing.university.toString() !== req.user.university.toString()) {
      return error(res, "Access denied", 403);
    }
    if (listing.seller.toString() === req.user._id.toString()) {
      return error(res, "You can't make an offer on your own listing", 400);
    }

    const existing = await Offer.findOne({
      listing: listing._id,
      buyer: req.user._id,
      status: { $in: ["pending", "countered"] },
    });
    if (existing) {
      return error(res, "You already have an active offer on this listing", 400);
    }

    const offer = await Offer.create({
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.seller,
      university: req.user.university,
      amount: numericAmount,
      message,
    });
    await offer.populate(POPULATE);

    await createNotification(
      listing.seller,
      "marketplace",
      `New offer: ${formatINR(numericAmount)}`,
      `${req.user.displayName} made an offer on “${listing.title}”.`,
      listing._id,
      "Listing"
    );

    return success(res, offer, "Offer sent", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/offers/:id  { action, counterAmount? }
 * Seller actions: accept | decline | counter
 * Buyer actions:  withdraw | accept-counter | decline-counter
 */
exports.updateOffer = async (req, res, next) => {
  try {
    const offer = req.resource;
    const { action, counterAmount } = req.body;

    const viewer = req.user._id.toString();
    const isSeller = offer.seller.toString() === viewer;
    const isBuyer = offer.buyer.toString() === viewer;

    if (!isSeller && !isBuyer) {
      return error(res, "Offer not found", 404);
    }

    const sellerActions = ["accept", "decline", "counter"];
    const buyerActions = ["withdraw", "accept-counter", "decline-counter"];

    if (isSeller && !sellerActions.includes(action)) {
      return error(res, "Invalid action", 400);
    }
    if (isBuyer && !buyerActions.includes(action)) {
      return error(res, "Invalid action", 400);
    }

    const active = ["pending", "countered"].includes(offer.status);
    if (!active) {
      return error(res, "This offer is already settled", 400);
    }

    let notifyUser = null;
    let notifyTitle = "";
    let notifyBody = "";
    const listing = await Listing.findById(offer.listing);
    const listingTitle = listing?.title || "your listing";

    switch (action) {
      case "accept":
        offer.status = "accepted";
        notifyUser = offer.buyer;
        notifyTitle = "Offer accepted 🎉";
        notifyBody = `Your ${formatINR(offer.amount)} offer on “${listingTitle}” was accepted.`;
        if (listing && listing.status === "available") {
          listing.status = "reserved";
          await listing.save();
        }
        break;

      case "decline":
        offer.status = "declined";
        notifyUser = offer.buyer;
        notifyTitle = "Offer declined";
        notifyBody = `Your ${formatINR(offer.amount)} offer on “${listingTitle}” was declined.`;
        break;

      case "counter": {
        const counter = Number(counterAmount);
        if (!counter || counter < 1) {
          return error(res, "A valid counter amount is required", 400);
        }
        offer.status = "countered";
        offer.counterAmount = counter;
        notifyUser = offer.buyer;
        notifyTitle = `Counter-offer: ${formatINR(counter)}`;
        notifyBody = `The seller countered your offer on “${listingTitle}”.`;
        break;
      }

      case "withdraw":
        offer.status = "withdrawn";
        notifyUser = offer.seller;
        notifyTitle = "Offer withdrawn";
        notifyBody = `${req.user.displayName} withdrew their offer on “${listingTitle}”.`;
        break;

      case "accept-counter":
        if (offer.status !== "countered") {
          return error(res, "There's no counter-offer to accept", 400);
        }
        offer.status = "accepted";
        offer.amount = offer.counterAmount;
        notifyUser = offer.seller;
        notifyTitle = "Counter-offer accepted 🎉";
        notifyBody = `${req.user.displayName} accepted your ${formatINR(offer.counterAmount)} counter on “${listingTitle}”.`;
        if (listing && listing.status === "available") {
          listing.status = "reserved";
          await listing.save();
        }
        break;

      case "decline-counter":
        if (offer.status !== "countered") {
          return error(res, "There's no counter-offer to decline", 400);
        }
        offer.status = "declined";
        notifyUser = offer.seller;
        notifyTitle = "Counter-offer declined";
        notifyBody = `${req.user.displayName} declined your counter on “${listingTitle}”.`;
        break;

      default:
        return error(res, "Invalid action", 400);
    }

    await offer.save();
    await offer.populate(POPULATE);

    if (notifyUser) {
      await createNotification(
        notifyUser,
        "marketplace",
        notifyTitle,
        notifyBody,
        offer.listing._id || offer.listing,
        "Listing"
      );
    }

    return success(res, offer, "Offer updated");
  } catch (err) {
    next(err);
  }
};
