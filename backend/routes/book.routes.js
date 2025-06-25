const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getTrendingBooks
} = require("../controllers/book.controller");

// Public routes
router.get("/", getAllBooks);
router.get("/trending", getTrendingBooks); // ✅ must be before `/:id`
router.get("/:id", getBookById);

// Protected routes
router.post("/", verifyToken, addBook);
router.put("/:id", verifyToken, updateBook);
router.delete("/:id", verifyToken, deleteBook);

module.exports = router;
