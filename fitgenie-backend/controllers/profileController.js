// controllers/profileController.js
const Profile = require("../models/Profile");

exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    res.json(profile || null);
  } catch (err) {
    next(err);
  }
};

exports.upsertMyProfile = async (req, res, next) => {
  try {
    const data = req.body;
    const updated = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { ...data, userId: req.user._id },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
