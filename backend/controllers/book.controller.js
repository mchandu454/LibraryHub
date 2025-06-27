const db = require("../models");
const Book = db.Book;
const Rating = db.Rating;
const { Op } = require("sequelize");

// ➕ Add a new book (admin only)
const addBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ message: "Book added", book });
  } catch (error) {
    console.error("❌ Add Book Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📚 Get all books (with optional search)
const getAllBooks = async (req, res) => {
  try {
    const { title, genre, limit = 10, offset = 0 } = req.query;
    const where = {};

    if (title) where.title = { [db.Sequelize.Op.iLike]: `%${title}%` };
    if (genre) where.genre = { [db.Sequelize.Op.iLike]: `%${genre}%` };

    const books = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });
    res.json({
      books: books.rows,
      total: books.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error("❌ Get All Books Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📘 Get book by ID
const getBookById = async (req, res) => {
  const id = req.params.id;
  if (isNaN(Number(id))) {
    return res.status(400).json({ message: 'Invalid book ID' });
  }
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    // Get average rating
    const ratings = await Rating.findAll({ where: { bookId: book.id } });
    const avg = ratings.length ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) : 0;
    res.json({ book: { ...book.toJSON(), rating: avg } });
  } catch (error) {
    console.error("❌ Get Book Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Update book
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    await book.update(req.body);
    res.json({ message: "Book updated", book });
  } catch (error) {
    console.error("❌ Update Book Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🗑️ Delete book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    await book.destroy();
    res.json({ message: "Book deleted" });
  } catch (error) {
    console.error("❌ Delete Book Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const Borrowing = db.Borrowing;
const { Sequelize } = require("sequelize");

const getTrendingBooks = async (req, res) => {
    try {
      const trending = await Borrowing.findAll({
        attributes: [
          "bookId",
          [Sequelize.fn("COUNT", Sequelize.col("bookId")), "borrowCount"]
        ],
        group: ["bookId", "book.id"], // Use alias 'book'
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "author", "genre", "description", "image", "available", "createdAt", "updatedAt"]
          }
        ],
        order: [[Sequelize.literal('"borrowCount"'), "DESC"]],
        limit: 5
      });
      // Filter out any where Book is null
      const filtered = trending.filter(item => item.book);
      res.status(200).json({ trending: filtered });
    } catch (error) {
      console.error("Trending error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  

// POST /api/books/:id/rate
const rateBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = Number(req.params.id);
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    // Upsert: one rating per user per book
    const [userRating, created] = await Rating.findOrCreate({
      where: { userId, bookId },
      defaults: { rating }
    });
    if (!created) {
      userRating.rating = rating;
      await userRating.save();
    }
    res.status(200).json({ message: 'Rating submitted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/books/:id/ratings
const getBookRatings = async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const ratings = await Rating.findAll({ where: { bookId } });
    const avg = ratings.length ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) : 0;
    res.status(200).json({ average: avg, count: ratings.length, ratings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/books/import-google
const importGoogleBook = async (req, res) => {
  try {
    const { googleId, title, author, genre, description, image } = req.body;
    if (!googleId || !title || !author) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Check if book already exists
    let book = await Book.findOne({ where: { googleBookId: googleId } });
    if (book) {
      return res.json({ book });
    }
    // Create new book
    book = await Book.create({
      googleBookId: googleId,
      title,
      author,
      genre,
      description,
      image,
      available: true,
      isGoogleBook: true
    });
    res.json({ book });
  } catch (err) {
    console.error('Import Google Book Error:', err);
    res.status(500).json({ message: 'Failed to import Google Book.' });
  }
};

const addGoogleBook = async (req, res) => {
  try {
    const {
      googleBookId,
      title,
      author,
      description,
      image,
      genre,
      pageCount,
      publishedDate,
      publisher,
      isbn
    } = req.body;

    // Check if this Google Book is already in our system
    let book = await Book.findOne({
      where: {
        googleBookId: googleBookId
      }
    });

    if (book) {
      // Book exists, return it
      return res.status(200).json({
        message: "Book already exists in library",
        book
      });
    }

    // Create new book
    book = await Book.create({
      googleBookId,
      title,
      author,
      description,
      image: image,
      genre,
      pageCount,
      publishedDate,
      publisher,
      isbn,
      available: true,
      isGoogleBook: true
    });

    res.status(201).json({
      message: "Google Book added to library successfully",
      book
    });
  } catch (error) {
    console.error("❌ Add Google Book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getTrendingBooks,
  rateBook,
  getBookRatings,
  importGoogleBook,
  addGoogleBook
};
