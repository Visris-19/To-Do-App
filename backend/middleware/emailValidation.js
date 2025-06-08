const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Please provide a valid email address'
    });
  }
  
  next();
};

module.exports = validateEmail;