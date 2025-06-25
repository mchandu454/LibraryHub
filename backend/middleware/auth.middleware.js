const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token || // ✅ from cookie
    (req.headers.authorization && req.headers.authorization.split(" ")[1]); // ✅ from header

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
