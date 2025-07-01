const authMiddleware = (req, res, next) => {
  console.log('Session:', req.session); // Debug log
  console.log('User hu:', req.session.user); // Debug log

  if (!req.session || !req.session.user) {
    return res.status(401).json({ 
      message: 'Unauthorized: Please login again'
    });
  }

  req.user = req.session.user;
  next();
};

module.exports = authMiddleware;