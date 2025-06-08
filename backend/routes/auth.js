const express = require('express')
const router = express.Router()
require('dotenv').config();
const User = require("../dbmodel/user");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const jwt = require('jsonwebtoken');
const validateEmail = require('../middleware/emailValidation');
const { JWT_SECRET } = require('../config');


//Sign UP...
router.post("/register", validateEmail, async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const hashPassword = bcrypt.hashSync(password);
        const user = new User({ email, username, password: hashPassword });
        await user.save().then(() => res.status(201).json({ user: user }));
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "User Already Exist" });
    }
});

// Sign in ...
router.post('/signin', validateEmail, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        message: 'email_not_found',
        details: 'Email not registered in our system'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();

      // Check if account should be locked
      if (user.failedLoginAttempts >= 5) {
        return res.status(403).json({
          message: 'account_locked',
          details: 'Too many failed attempts'
        });
      }

      return res.status(401).json({ 
        message: 'invalid_password',
        details: 'Incorrect password provided'
      });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        email: user.email,
        username: user.username
      },
      sessionId: req.sessionId
    });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth-token');
  return res.status(200).json({ message: 'Logged out successfully' });
})

// Google Authentication
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.redirect('http://localhost:5173/dashboard');
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect('http://localhost:5173/login');
    }
  }
);

// GitHub Authentication
router.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.redirect('http://localhost:5173/dashboard');
    } catch (error) {
      console.error('GitHub auth callback error:', error);
      res.redirect('http://localhost:5173/login');
    }
  }
);

router.get('/check-auth', async (req, res) => {
  try {
    const token = req.cookies['auth-token']
    if (!token) {
      return res.status(401).json({ message: 'No token found' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    res.json({ 
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    res.status(401).json({ message: 'Invalid token' })
  }
})

module.exports = router;