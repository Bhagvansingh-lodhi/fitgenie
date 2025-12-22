// controllers/planController.js
const Profile = require("../models/Profile");
const Plan = require("../models/Plan");
const buildPlanPrompt = require("../utils/buildPlanPrompt");
const { callChatCompletion } = require("../config/openaiClient");

exports.generatePlan = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({ message: "Profile not found. Complete onboarding first." });
    }

    const prompt = buildPlanPrompt(profile);
    const aiResponse = await callChatCompletion(prompt);

    let planData;
    try {
      // try to extract JSON only (in case AI adds junk)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      planData = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("AI JSON parse error:", parseErr);
      console.log("AI raw:", aiResponse);
      return res.status(500).json({
        message: "Failed to parse AI response. Try again."
      });
    }

    const today = new Date();
    const endDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);

    const plan = await Plan.create({
      userId: req.user._id,
      startDate: today,
      endDate,
      workouts: planData.workouts || [],
      meals: planData.meals || [],
      groceryList: planData.groceryList || [],
      aiModel: "gpt-4o-mini"
    });

    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

exports.getCurrentPlan = async (req, res, next) => {
  try {
    const today = new Date();
    const plan = await Plan.findOne({
      userId: req.user._id,
      startDate: { $lte: today },
      endDate: { $gte: today }
    }).sort({ createdAt: -1 });

    res.json(plan || null);
  } catch (err) {
    next(err);
  }
};
