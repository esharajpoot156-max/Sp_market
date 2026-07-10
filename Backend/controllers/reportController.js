import Report from "../models/Report.js";

// Any logged-in user can report content
export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: "Please provide targetType, targetId and reason" });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason,
      description,
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};