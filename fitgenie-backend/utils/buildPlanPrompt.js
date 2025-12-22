// utils/buildPlanPrompt.js
const buildPlanPrompt = (profile) => {
  return `
You are a professional fitness and nutrition coach.

Generate a 7-day workout plan and meal plan for this user.

User profile:
- Age: ${profile.age || "N/A"}
- Gender: ${profile.gender || "N/A"}
- Height: ${profile.heightCm || "N/A"} cm
- Weight: ${profile.weightKg || "N/A"} kg
- Activity level: ${profile.activityLevel || "N/A"}
- Goal: ${profile.goal || "N/A"}
- Diet type: ${profile.dietType || "N/A"}
- Allergies: ${(profile.allergies || []).join(", ") || "none"}
- Wake time: ${profile.wakeTime || "N/A"}
- Sleep time: ${profile.sleepTime || "N/A"}

Constraints:
- 4 workout days per week and 3 lighter / active rest days.
- Each workout day: 45–60 minutes.
- Daily calories adapted to goal and profile.
- Respect the user's diet type and allergies.

Return ONLY valid JSON in this exact shape, no extra text:

{
  "workouts": [
    {
      "day": "Monday",
      "bodyPart": "Full body",
      "items": [
        "Exercise 1 with sets and reps",
        "Exercise 2 with sets and reps"
      ]
    }
  ],
  "meals": [
    {
      "day": "Monday",
      "mealType": "breakfast",
      "description": "Short meal description",
      "approxCalories": 350,
      "proteinG": 20,
      "carbsG": 40,
      "fatsG": 10
    }
  ],
  "groceryList": [
    "item 1",
    "item 2"
  ]
}
`;
};

module.exports = buildPlanPrompt;
