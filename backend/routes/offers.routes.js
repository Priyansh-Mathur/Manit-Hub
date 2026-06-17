const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const offersController = require("../controllers/offers.controller");
const universityScope = require("../middleware/universityScope");
const Offer = require("../models/Offer");

router.get("/", auth, offersController.getOffers);
router.post("/", auth, offersController.createOffer);
router.patch("/:id", auth, universityScope(Offer), offersController.updateOffer);

module.exports = router;
