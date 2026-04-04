module.exports = (req, res, next) => {
  try {
    const userHeader = req.headers.user;

    // If no header → assign default role (for testing)
    if (!userHeader) {
      req.user = { role: "admin" }; // fallback
      return next();
    }

    req.user = JSON.parse(userHeader);
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid user header" });
  }
};