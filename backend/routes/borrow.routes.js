const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const { borrowBook, returnBook, getUserBorrowHistory } = require("../controllers/borrow.controller");

router.post("/", verifyToken, borrowBook); // Borrow a book
router.put("/:id/return", verifyToken, returnBook); // Return a book
router.get("/history", verifyToken, getUserBorrowHistory); // View user borrow history

module.exports = router;
