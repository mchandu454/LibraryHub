const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const { borrowBook, returnBook, returnBookByBookId, getUserBorrowHistory, getOverdueBorrowings } = require("../controllers/borrow.controller");
const isAdmin = require("../middleware/admin.middleware");

router.post("/", verifyToken, borrowBook); // Borrow a book
router.put("/:id/return", verifyToken, returnBook); // Return a book by borrowing ID
router.put("/book/:bookId/return", verifyToken, returnBookByBookId); // Return a book by book ID
router.get("/history", verifyToken, getUserBorrowHistory); // View user borrow history
router.get("/overdue", verifyToken, isAdmin, getOverdueBorrowings);

module.exports = router;
