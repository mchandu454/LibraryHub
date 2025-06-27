const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getTrendingBooks,
  rateBook,
  getBookRatings,
  importGoogleBook
} = require("../controllers/book.controller");

// Public routes
router.get("/", getAllBooks);
router.get("/trending", getTrendingBooks); // must be before `/:id`
router.get("/:id", getBookById);
router.get("/:id/ratings", getBookRatings);

// Protected routes (authenticated users only)
router.post("/", authenticateToken, addBook);
router.put("/:id", authenticateToken, updateBook);
router.delete("/:id", authenticateToken, deleteBook);
router.post('/:id/rate', authenticateToken, rateBook);
router.post('/import-google', authenticateToken, importGoogleBook);

module.exports = router;
