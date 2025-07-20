require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const { mongoDBURL, PORT, SESSION_SECRET } = require('./config');
const app = express();
const auth = require("./routes/auth");
const list = require("./routes/list");
const validateTask = require('./middleware/taskValidation');
const errorHandler = require('./middleware/errorHandler');
const limiter = require('./middleware/rateLimit');
const passport = require('passport');
require('./config/passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

// Import profile routes
const profileRoutes = require('./routes/profileRoutes');

const corsOptions = {
    origin: [
        'http://localhost:5173', // Vite's default port
        'http://localhost:5000', // Alternative frontend port
        'https://accounts.google.com', // For Google OAuth
        'https://github.com' // For GitHub OAuth
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true, // Required for cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
    // maxAge: 24 * 60 * 60 // 24 hours in seconds
};

// Apply CORS before other middleware
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());
app.use(express.json());

// Make sure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Session configuration
app.use(session({
    secret: SESSION_SECRET, // In production, use an environment variable
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Add this after your session middleware
app.use((req, res, next) => {
  next();
});

// Initialize passport after session middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (request, response) => {
    return response.status(234).send('Welcome to the To-Do list app')
});

app.use("/api/v1", auth);
app.use("/api/v2", list);
app.use("/api/v2", profileRoutes); // Updated profile routes import

// Add email validation to auth routes
const validateEmail = require('./middleware/emailValidation');
app.use("/api/v1/register", validateEmail);
app.use("/api/v1/login", validateEmail);

const settingsRoutes = require('./routes/settings');
app.use('/api/v2', settingsRoutes);

// Apply rate limiting
app.use('/api', limiter);

// Apply validation to task creation and updates
app.use('/api/addTask', validateTask);
app.use('/api/updateTask/:id', validateTask);

// Add a proper error response for profile-related errors
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  next(err);
});

// Error handling should be last
app.use(errorHandler);

mongoose
    .connect(mongoDBURL)
    .then( () => {
        console.log("Database is connected")
        app.listen(PORT, () => {
            console.log(`App is listening to port : ${PORT}`)
        })
    })
    .catch((error) => {
        console.log(error)
    });
