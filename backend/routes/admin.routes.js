const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllBorrowings,
  getActiveBorrowings,
} = require("../controllers/admin.controller");
const verifyToken = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

// ✅ Secure all admin routes with both middlewares
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.get("/borrowings", verifyToken, isAdmin, getAllBorrowings);
router.get("/borrowings/active", verifyToken, isAdmin, getActiveBorrowings);

module.exports = router;
