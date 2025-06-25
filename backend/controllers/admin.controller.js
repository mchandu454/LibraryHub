const db = require("../models");
const User = db.User;
const Book = db.Book;
const Borrowing = db.Borrowing;

// 🧑‍💼 Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "isAdmin", "createdAt"]
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📚 Get all borrowings
const getAllBorrowings = async (req, res) => {
  try {
    const borrowings = await Borrowing.findAll({
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Book, attributes: ["id", "title", "author"] }
      ],
      order: [["borrowedAt", "DESC"]]
    });
    res.status(200).json({ borrowings });
  } catch (error) {
    console.error("Admin Borrowings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 View currently borrowed books
const getActiveBorrowings = async (req, res) => {
  try {
    const active = await Borrowing.findAll({
      where: { returnedAt: null },
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Book, attributes: ["id", "title", "author"] }
      ]
    });
    res.status(200).json({ active });
  } catch (error) {
    console.error("Active Borrowings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  getAllBorrowings,
  getActiveBorrowings
};
