// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getMyProfile, upsertMyProfile } = require("../controllers/profileController");

router.get("/me", auth, getMyProfile);
router.put("/", auth, upsertMyProfile);

module.exports = router;
