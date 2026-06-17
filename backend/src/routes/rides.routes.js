const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ridesController = require("../controllers/rides.controller");
const universityScope = require("../middleware/universityScope");
const Ride = require("../models/Ride");

router.get("/", auth, ridesController.getRides);
router.post("/", auth, ridesController.createRide);
router.post("/:id/join", auth, universityScope(Ride), ridesController.joinRide);
router.post("/:id/leave", auth, universityScope(Ride), ridesController.leaveRide);
router.delete("/:id", auth, universityScope(Ride), ridesController.deleteRide);

module.exports = router;
