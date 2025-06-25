const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next(); // user is admin ✅
    } else {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
  };
  
  module.exports = isAdmin;
  