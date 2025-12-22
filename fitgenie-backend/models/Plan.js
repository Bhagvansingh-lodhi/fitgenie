// models/Plan.js
const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  day: String,
  bodyPart: String,
  items: [String]
});

const mealSchema = new mongoose.Schema({
  day: String,
  mealType: String,
  description: String,
  approxCalories: Number,
  proteinG: Number,
  carbsG: Number,
  fatsG: Number
});

const planSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: Date,
    endDate: Date,
    workouts: [workoutSchema],
    meals: [mealSchema],
    groceryList: [String],
    aiModel: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
