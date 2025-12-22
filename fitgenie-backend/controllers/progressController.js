// controllers/progressController.js
const Progress = require("../models/Progress");

exports.logProgress = async (req, res, next) => {
  try {
    const { date, weightKg, workoutCompleted, mealsFollowedPercent, notes } = req.body;

    const progressDate = date ? new Date(date) : new Date();
    progressDate.setHours(0, 0, 0, 0);

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, date: progressDate },
      { userId: req.user._id, date: progressDate, weightKg, workoutCompleted, mealsFollowedPercent, notes },
      { upsert: true, new: true }
    );

    res.status(201).json(progress);
  } catch (err) {
    next(err);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const query = { userId: req.user._id };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const list = await Progress.find(query).sort({ date: 1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
};
