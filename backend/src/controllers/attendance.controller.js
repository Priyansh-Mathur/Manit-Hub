const AttendanceSubject = require("../models/AttendanceSubject");
const { success, error } = require("../utils/response");

const ownedByUser = (subject, userId) =>
  subject.user.toString() === userId.toString();

/**
 * GET /api/attendance
 */
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await AttendanceSubject.find({
      user: req.user._id,
      university: req.user.university,
    }).sort({ createdAt: 1 });

    return success(res, subjects);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/attendance
 */
exports.createSubject = async (req, res, next) => {
  try {
    const { name, attended = 0, held = 0, target = 75 } = req.body;

    if (!name || !name.trim()) {
      return error(res, "Subject name is required", 400);
    }

    const attendedNum = Math.max(0, Number(attended) || 0);
    const heldNum = Math.max(0, Number(held) || 0);
    if (attendedNum > heldNum) {
      return error(res, "Attended classes can't exceed classes held", 400);
    }

    const targetNum = Number(target) || 75;
    if (targetNum < 1 || targetNum > 100) {
      return error(res, "Target must be between 1 and 100", 400);
    }

    const subject = await AttendanceSubject.create({
      name: name.trim(),
      attended: attendedNum,
      held: heldNum,
      target: targetNum,
      user: req.user._id,
      university: req.user.university,
    });

    return success(res, subject, "Subject added", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/attendance/:id
 * Either { action: "present" | "absent" | "undo-present" | "undo-absent" }
 * or a direct edit { name?, attended?, held?, target? }.
 */
exports.updateSubject = async (req, res, next) => {
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
};

/**
 * DELETE /api/attendance/:id
 */
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = req.resource;

    if (!ownedByUser(subject, req.user._id)) {
      return error(res, "Subject not found", 404);
    }

    await subject.deleteOne();
    return success(res, null, "Subject removed");
  } catch (err) {
    next(err);
  }
};
