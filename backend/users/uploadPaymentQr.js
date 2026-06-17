const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const uploadPaymentQr = require("../middleware/uploadPaymentQr");
const { success, error } = require("../utils/response");

/**
 * PUT /api/users/payment-qr
 */
router.put("/payment-qr", auth, uploadPaymentQr.single("qr"), async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "No image uploaded", 400);
    }

    req.user.paymentInfo.upiQrUrl = req.file.path;
    await req.user.save();

    return success(
      res,
      { upiQrUrl: req.user.paymentInfo.upiQrUrl },
      "Payment QR updated"
    );
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
