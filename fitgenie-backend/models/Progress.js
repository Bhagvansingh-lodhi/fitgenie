// models/Progress.js
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    weightKg: Number,
    workoutCompleted: Boolean,
    mealsFollowedPercent: Number, // 0-100
    notes: String
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
