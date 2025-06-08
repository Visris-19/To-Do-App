const authMiddleware = (req, res, next) => {
  console.log('Session:', req.session); // Debug log
  console.log('User:', req.user); // Debug log

  if (!req.session || !req.session.user) {
    return res.status(401).json({ 
      message: 'Unauthorized: No valid session found'
    });
  }

  req.user = req.session.user;
  next();
};

module.exports = authMiddleware;