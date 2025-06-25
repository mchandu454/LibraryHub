const db = require("../models");
const Borrowing = db.Borrowing;
const Book = db.Book;

const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if book exists
    const book = await Book.findByPk(bookId);
    if (!book || !book.available) {
      return res.status(404).json({ message: "Book not available" });
    }

    // Mark book as not available
    book.available = false;
    await book.save();

    // Create borrowing entry
    const borrowing = await Borrowing.create({
      userId,
      bookId,
      borrowedAt: new Date(),
    });

    res.status(201).json({ message: "Book borrowed successfully", borrowing });
  } catch (error) {
    console.error("❌ Borrow error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const returnBook = async (req, res) => {
  try {
    const { id } = req.params; // borrowing ID
    const borrowing = await Borrowing.findByPk(id);
    if (!borrowing || borrowing.returnedAt) {
      return res.status(404).json({ message: "Borrowing record not found or already returned" });
    }

    // Update borrowing record
    borrowing.returnedAt = new Date();
    await borrowing.save();

    // Set book availability back to true
    const book = await Book.findByPk(borrowing.bookId);
    book.available = true;
    await book.save();

    res.status(200).json({ message: "Book returned successfully", borrowing });
  } catch (error) {
    console.error("❌ Return error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserBorrowHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await Borrowing.findAll({
      where: { userId },
      include: [{ model: Book }],
      order: [["borrowedAt", "DESC"]],
    });

    res.status(200).json({ history });
  } catch (error) {
    console.error("❌ History fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { borrowBook, returnBook, getUserBorrowHistory };
