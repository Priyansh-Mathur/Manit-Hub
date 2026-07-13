const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { success, error } = require("../../utils/response");

router.put("/payment-info", auth, async (req, res) => {
  try {
    const { upiId, upiQrUrl } = req.body;

    if (!upiId && !upiQrUrl) {
      return error(res, "Nothing to update", 400);
    }

    if (upiId !== undefined) {
      req.user.paymentInfo.upiId = upiId;
    }

    if (upiQrUrl !== undefined) {
      req.user.paymentInfo.upiQrUrl = upiQrUrl;
    }

    await req.user.save();

    return success(res, req.user.paymentInfo, "Payment info updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
