const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
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
router.get("/trending", getTrendingBooks); // ✅ must be before `/:id`
router.get("/:id", getBookById);

// Protected routes
router.post("/", verifyToken, addBook);
router.put("/:id", verifyToken, updateBook);
router.delete("/:id", verifyToken, deleteBook);
router.post('/:id/rate', verifyToken, rateBook);
router.get('/:id/ratings', getBookRatings);
router.post('/import-google', verifyToken, importGoogleBook);

module.exports = router;
