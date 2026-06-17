const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const universityScope = require("../middleware/universityScope");
const Offer = require("../models/Offer");
const Listing = require("../models/Listing");
const { success, error } = require("../utils/response");
const { createNotification } = require("../utils/notifications");
const POPULATE = require("./populate");
const formatINR = require("./formatINR");

/**
 * PATCH /api/offers/:id  { action, counterAmount? }
 * Seller actions: accept | decline | counter
 * Buyer actions:  withdraw | accept-counter | decline-counter
 */
router.patch("/:id", auth, universityScope(Offer), async (req, res, next) => {
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
});

module.exports = router;
