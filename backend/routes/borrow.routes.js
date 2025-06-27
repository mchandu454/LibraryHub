const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const { borrowBook, returnBook, returnBookByBookId, getUserBorrowHistory, getOverdueBorrowings } = require("../controllers/borrow.controller");

// All endpoints require authentication
router.post("/", authenticateToken, borrowBook); // Borrow a book
router.put("/:id/return", authenticateToken, returnBook); // Return a book by borrowing ID
router.put("/book/:bookId/return", authenticateToken, returnBookByBookId); // Return a book by book ID
router.get("/history", authenticateToken, getUserBorrowHistory); // View user borrow history
router.get("/overdue", authenticateToken, getOverdueBorrowings); // View overdue borrowings for user

module.exports = router;
