const express = require("express");
const router = express.Router();
const { authenticateToken, isAdmin } = require("../middleware/auth.middleware");
const db = require("../models");
const { getUserBorrowHistory } = require("../controllers/borrow.controller");

router.get("/me", authenticateToken, async (req, res) => {
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

// GET /api/members/:id/history - Only the user themselves or an admin can access
router.get('/:id/history', authenticateToken, async (req, res, next) => {
  try {
    const requestedId = parseInt(req.params.id, 10);
    if (req.user.id !== requestedId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. You can only view your own history.' });
    }
    // Attach user id to req for controller
    req.user.id = requestedId;
    return getUserBorrowHistory(req, res, next);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
