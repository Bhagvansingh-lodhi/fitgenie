// models/Profile.js
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
    heightCm: Number,
    weightKg: Number,
    activityLevel: String, // sedentary, light, moderate, high
    goal: String, // fat_loss, muscle_gain, maintain
    dietType: String, // veg, non-veg, egg, vegan
    allergies: [String],
    wakeTime: String,
    sleepTime: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
