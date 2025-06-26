const db = require("../models");
const Borrowing = db.Borrowing;
const Book = db.Book;
const Progress = db.Progress;

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

    // Create initial progress record
    await Progress.create({
      borrowingId: borrowing.id,
      progress: 0,
      lastReadAt: new Date()
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
    if (book) {
      book.available = true;
      await book.save();
    }

    res.status(200).json({ message: "Book returned successfully", borrowing });
  } catch (error) {
    console.error("❌ Return error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const returnBookByBookId = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    // Find the active borrowing for this book and user
    const borrowing = await Borrowing.findOne({
      where: { 
        bookId: bookId,
        userId: userId,
        returnedAt: null // Not yet returned
      }
    });

    if (!borrowing) {
      return res.status(404).json({ message: "No active borrowing found for this book" });
    }

    // Update borrowing record
    borrowing.returnedAt = new Date();
    await borrowing.save();

    // Set book availability back to true
    const book = await Book.findByPk(bookId);
    if (book) {
      book.available = true;
      await book.save();
    }

    res.status(200).json({ message: "Book returned successfully", borrowing });
  } catch (error) {
    console.error("❌ Return by book ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserBorrowHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const borrowings = await Borrowing.findAll({
      where: { userId },
      include: [
        { model: Book, as: 'book' },
        { model: Progress, attributes: ['progress', 'lastReadAt'] }
      ],
      order: [["borrowedAt", "DESC"]],
    });

    // Transform the data to match frontend expectations
    const transformedBorrowings = (borrowings || []).map(borrowing => {
      try {
        const borrowDate = new Date(borrowing.borrowedAt);
        const dueDate = new Date(borrowDate);
        dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

        let status = 'borrowed';
        if (borrowing.returnedAt) {
          status = 'returned';
        } else if (new Date() > dueDate) {
          status = 'overdue';
        }

        return {
          id: borrowing.id,
          userId: borrowing.userId,
          bookId: borrowing.bookId,
          borrowDate: borrowing.borrowedAt,
          dueDate: dueDate,
          returnDate: borrowing.returnedAt,
          status: status,
          book: borrowing.book || null, // Safe fallback
          progress: borrowing.Progress?.progress || 0,
          lastReadAt: borrowing.Progress?.lastReadAt || null,
        };
      } catch (err) {
        console.error('Error transforming borrowing record:', err, borrowing);
        return null;
      }
    }).filter(Boolean);

    res.status(200).json({ borrowings: transformedBorrowings });
  } catch (error) {
    console.error("❌ History fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getOverdueBorrowings = async (req, res) => {
  try {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const overdue = await Borrowing.findAll({
      where: {
        returnedAt: null,
        borrowedAt: { [db.Sequelize.Op.lt]: fourteenDaysAgo }
      },
      include: [
        { model: Book, as: 'book' },
        { model: db.User, attributes: ['id', 'name', 'email'] }
      ],
      order: [['borrowedAt', 'ASC']]
    });
    res.status(200).json({ overdue });
  } catch (error) {
    console.error('❌ Overdue fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { borrowBook, returnBook, returnBookByBookId, getUserBorrowHistory, getOverdueBorrowings };
