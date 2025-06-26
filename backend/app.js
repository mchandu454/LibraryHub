const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth.routes");
const memberRoutes = require("./routes/member.routes");
const bookRoutes = require("./routes/book.routes");
const borrowRoutes = require("./routes/borrow.routes");
const adminRoutes = require("./routes/admin.routes");
const progressRoutes = require("./routes/progress.routes");

dotenv.config();

const app = express();

// ✅ Middlewares (order matters!)
app.use(cors({
  origin: "http://localhost:5173", // or Postman frontend if using a web UI
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowings", borrowRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.send("LibraryHub API is running 🚀");
});

module.exports = app;
