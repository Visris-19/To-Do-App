# Email Setup Guide

## Current Status
✅ **Mailtrap Sandbox**: Emails are captured for testing (not sent to real users)
🚀 **Gmail SMTP**: Real emails sent to actual user inboxes

## Option 1: Keep Mailtrap for Testing (Current Setup)
- Emails appear in Mailtrap sandbox only
- No real emails sent to users
- Perfect for development and testing

## Option 2: Switch to Gmail SMTP for Real Emails

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password
1. Go to **Security** → **2-Step Verification**
2. Scroll down to **App passwords**
3. Select **Mail** and **Windows Computer**
4. Generate password (16-character code)
5. Save this password securely

### Step 3: Update .env File
Replace the email configuration in `.env`:

```properties
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_actual_gmail@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=your_actual_gmail@gmail.com
```

### Step 4: Restart Backend
```bash
# Stop the backend (Ctrl+C in terminal)
# Start it again
npm run dev
```

## Option 3: Other Email Services

### SendGrid (Recommended for Production)
```properties
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
EMAIL_FROM=verified_sender@yourdomain.com
```

### Mailgun
```properties
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your_domain.mailgun.org
EMAIL_PASS=your_mailgun_password
EMAIL_FROM=noreply@your_domain.com
```

## Security Notes
⚠️ **Never commit real email credentials to Git**
⚠️ **Use App Passwords, not your regular Gmail password**
⚠️ **Consider using environment variables in production**

## Testing
After switching to real SMTP:
1. Register a new user with YOUR real email address
2. Check your actual email inbox
3. Click the verification link
4. Complete the email verification flow

## Switching Back to Sandbox
To switch back to testing mode, uncomment the Mailtrap lines and comment out the Gmail lines in `.env`.
