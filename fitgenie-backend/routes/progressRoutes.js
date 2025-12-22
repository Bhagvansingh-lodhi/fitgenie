// routes/progressRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { logProgress, getProgress } = require("../controllers/progressController");

router.post("/", auth, logProgress);
router.get("/", auth, getProgress);

module.exports = router;
