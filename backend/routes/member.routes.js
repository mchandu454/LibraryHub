const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const db = require("../models");

router.get("/me", verifyToken, async (req, res) => {
  console.log("🔐 Authenticated user ID:", req.user?.id);

  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "isAdmin", "createdAt"],
    });

    if (!user) {
      console.log("❌ User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("❌ /me ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
