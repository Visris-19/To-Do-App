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
        console.log('Registration attempt:', req.body);
        const { email, username, password } = req.body;
        
        if (!email || !username || !password) {
            console.log('Missing fields:', { email: !!email, username: !!username, password: !!password });
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Check if user already exists
        console.log('Checking for existing user with email:', email, 'or username:', username);
        const existingUser = await User.findOne({ 
          $or: [{ email }, { username }] 
        });
        console.log('Existing user found:', existingUser ? 'YES' : 'NO');
        
        if (existingUser) {
          console.log('User already exists - Email match:', existingUser.email === email, 'Username match:', existingUser.username === username);
          return res.status(400).json({ 
            message: "User already exists",
            details: existingUser.email === email ? "Email already registered" : "Username already taken"
          });
        }
        
        const hashPassword = bcrypt.hashSync(password);
        const user = new User({ email, username, password: hashPassword });
        await user.save();

        // Generate verification token and save to user
        const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');
        const token = generateVerificationToken(user._id);
        user.verificationToken = token;
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        // Send verification email (don't fail registration if email fails)
        try {
          await sendVerificationEmail(user, token);
          console.log('Verification email sent successfully');
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
          // Don't fail registration if email fails
        }

        res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
          // Duplicate key error
          const field = Object.keys(error.keyPattern)[0];
          return res.status(400).json({ 
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
          });
        }
        res.status(500).json({ message: "Registration failed", error: error.message });
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

    if (!user.verified) {
      return res.status(403).json({
        message: 'email_not_verified',
        details: 'Please verify your email before logging in.'
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
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }

      // Clear all cookies
      res.clearCookie('connect.sid', { path: '/' });
      res.clearCookie('token', { path: '/' });
      
      // Send success response
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

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

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  const User = require('../dbmodel/user');
  const jwt = require('jsonwebtoken');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(400).send('Invalid link');
    if (user.verified) return res.send('Already verified');
    if (user.verificationToken !== token || user.verificationTokenExpires < Date.now()) {
      return res.status(400).send('Token expired or invalid');
    }
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.send('Email verified successfully!');
  } catch (err) {
    res.status(400).send('Invalid or expired token');
  }
});

// Resend verification email endpoint
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  const User = require('../dbmodel/user');
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }
    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification token
    const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');
    const token = generateVerificationToken(user._id);
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, token);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check verification status endpoint
router.get('/check-verification', async (req, res) => {
  const { email } = req.query;
  const User = require('../dbmodel/user');
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    res.json({ verified: user.verified });
  } catch (error) {
    console.error('Check verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;