const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const serverless = require("serverless-http");

const authRoutes = require("./routes/auth.routes");
const memberRoutes = require("./routes/member.routes");
const bookRoutes = require("./routes/book.routes");
const borrowRoutes = require("./routes/borrow.routes");
const adminRoutes = require("./routes/admin.routes");
const progressRoutes = require("./routes/progress.routes");

dotenv.config();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://your-frontend-domain.vercel.app',
      'https://libraryhub.vercel.app',
      'https://libraryhub-git-main-yourusername.vercel.app'
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowings", borrowRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.send("LibraryHub API is running 🚀");
});

// ✅ Local server start
if (require.main === module) {
  const db = require("./models");
  const sequelize = db.sequelize;

  sequelize.authenticate().then(() => {
    console.log("Connected to PostgreSQL ✅");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running at http://localhost:${process.env.PORT || 5000}`);
    });
  }).catch(err => {
    console.error("DB connection error ❌", err);
  });
}

// ✅ Export for Vercel
module.exports = serverless(app);
