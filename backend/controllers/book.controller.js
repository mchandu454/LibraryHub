const db = require("../models");
const Book = db.Book;

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
    const { title, genre } = req.query;
    const where = {};

    if (title) where.title = { [db.Sequelize.Op.iLike]: `%${title}%` };
    if (genre) where.genre = { [db.Sequelize.Op.iLike]: `%${genre}%` };

    const books = await Book.findAll({ where });
    res.json({ books });
  } catch (error) {
    console.error("❌ Get All Books Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📘 Get book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ book });
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
        group: ["bookId", "Book.id"], // 👈 must include Book.id too
        include: [
          {
            model: Book,
            attributes: ["id", "title", "author", "genre", "description", "image", "available", "createdAt", "updatedAt"]
          }
        ],
        order: [[Sequelize.literal('"borrowCount"'), "DESC"]], // 👈 correct usage
        limit: 5
      });
  
      res.status(200).json({ trending });
    } catch (error) {
      console.error("Trending error:", error);
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
};
