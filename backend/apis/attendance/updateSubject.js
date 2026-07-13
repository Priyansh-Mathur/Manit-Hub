const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const universityScope = require("../../middleware/universityScope");
const AttendanceSubject = require("../../models/AttendanceSubject");
const { success, error } = require("../../utils/response");
const ownedByUser = require("./ownedByUser");

/**
 * PATCH /api/attendance/:id
 * Either { action: "present" | "absent" | "undo-present" | "undo-absent" }
 * or a direct edit { name?, attended?, held?, target? }.
 */
router.patch("/:id", auth, universityScope(AttendanceSubject), async (req, res, next) => {
  try {
    const subject = req.resource;

    if (!ownedByUser(subject, req.user._id)) {
      return error(res, "Subject not found", 404);
    }

    const { action } = req.body;

    if (action) {
      if (action === "present") {
        subject.attended += 1;
        subject.held += 1;
      } else if (action === "absent") {
        subject.held += 1;
      } else if (action === "undo-present") {
        if (subject.attended < 1) return error(res, "Nothing to undo", 400);
        subject.attended -= 1;
        subject.held -= 1;
      } else if (action === "undo-absent") {
        if (subject.held <= subject.attended) {
          return error(res, "Nothing to undo", 400);
        }
        subject.held -= 1;
      } else {
        return error(res, "Unknown action", 400);
      }
    } else {
      const { name, attended, held, target } = req.body;

      if (name !== undefined) {
        if (!name.trim()) return error(res, "Subject name is required", 400);
        subject.name = name.trim();
      }
      if (attended !== undefined) subject.attended = Math.max(0, Number(attended) || 0);
      if (held !== undefined) subject.held = Math.max(0, Number(held) || 0);
      if (target !== undefined) {
        const targetNum = Number(target);
        if (!targetNum || targetNum < 1 || targetNum > 100) {
          return error(res, "Target must be between 1 and 100", 400);
        }
        subject.target = targetNum;
      }

      if (subject.attended > subject.held) {
        return error(res, "Attended classes can't exceed classes held", 400);
      }
    }

    await subject.save();
    return success(res, subject, "Attendance updated");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
