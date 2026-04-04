module.exports = (req, res, next) => {
  try {
    const userHeader = req.headers.user;

    
    if (!userHeader) {
      req.user = { role: "admin" }; 
      return next();
    }

    req.user = JSON.parse(userHeader);
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid user header" });
  }
};
