const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth.routes");
const memberRoutes = require("./routes/member.routes");
const bookRoutes = require("./routes/book.routes");
const borrowRoutes = require("./routes/borrow.routes");
const progressRoutes = require("./routes/progress.routes");

dotenv.config();

const app = express();

const allowedOrigins = [
  'https://library-hub-five.vercel.app',
  'https://library-hub-git-main-mchandu454s-projects.vercel.app',
  'https://library-77wtpd9zv-mchandu454s-projects.vercel.app',
  'https://library-oiwiai0kh-mchandu454s-projects.vercel.app',
  'https://library-gvgn2w04n-mchandu454s-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowings", borrowRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.send("LibraryHub API is running 🚀");
});

// Add global error handler middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ✅ Export for Render/Node
module.exports = app;
