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
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', // Development
      'http://localhost:3000', // Alternative dev port
      'https://your-frontend-domain.vercel.app', // Replace with your actual frontend domain
      'https://libraryhub.vercel.app', // Example domain
      'https://libraryhub-git-main-yourusername.vercel.app' // Vercel preview domains
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Server startup for Vercel
const PORT = process.env.PORT || 5000;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  const db = require("./models");
  const sequelize = db.sequelize;

  sequelize.authenticate().then(() => {
    console.log("Connected to PostgreSQL ✅");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("DB connection error ❌", err);
  });
}

module.exports = app;
