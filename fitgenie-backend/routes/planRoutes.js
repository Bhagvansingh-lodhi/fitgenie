// routes/planRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { generatePlan, getCurrentPlan } = require("../controllers/planController");

router.post("/generate", auth, generatePlan);
router.get("/current", auth, getCurrentPlan);

module.exports = router;
