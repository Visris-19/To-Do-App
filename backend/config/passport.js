require('dotenv').config();
const passport = require('passport');
const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, BASE_URL} = require('../config.js');
const express = require('express');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../dbmodel/user');

// Validation with better error messages
const validateConfig = () => {
    const missing = [];
    if (!GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
    if (!GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
    if (!GITHUB_CLIENT_ID) missing.push('GITHUB_CLIENT_ID');
    if (!GITHUB_CLIENT_SECRET) missing.push('GITHUB_CLIENT_SECRET');
    
    if (missing.length > 0) {
        console.warn('OAuth credentials missing - social auth will be disabled:', missing.join(', '));
        return false;
    }
    return true;
}

const hasOAuthCredentials = validateConfig();

// Google Strategy - only if credentials are available
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:5000/api/v1/auth/google/callback`,
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });
            
            if (!user) {
                user = await User.create({
                    email: profile.emails[0].value,
                    username: profile.displayName || profile.emails[0].value.split('@')[0],
                    password: `google-oauth-${Date.now()}`, // More unique password
                    authProvider: 'google',
                    authProviderId: profile.id
                });
            }

            // Update user info if needed
            if (user.authProvider !== 'google') {
                user.authProvider = 'google';
                user.authProviderId = profile.id;
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            console.error('Google auth error:', error);
            return done(error, null);
        }
    }));
}

// GitHub Strategy - only if credentials are available
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `http://localhost:5000/api/v1/auth/github/callback`,
        scope: ['user:email'] // Request email scope explicitly
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
            let user = await User.findOne({ 
                $or: [
                    { email },
                    { authProviderId: profile.id, authProvider: 'github' }
                ]
            });
            
            if (!user) {
                user = await User.create({
                    email,
                    username: profile.username || email.split('@')[0],
                    password: `github-oauth-${Date.now()}`, // More unique password
                    authProvider: 'github',
                    authProviderId: profile.id
                });
            }

            // Update user info if needed
            if (user.authProvider !== 'github') {
                user.authProvider = 'github';
                user.authProviderId = profile.id;
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            console.error('GitHub auth error:', error);
            return done(error, null);
        }
    }));
}

// Session handling
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;