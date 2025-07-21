const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Create transporter with error handling
const createTransporter = () => {
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration missing - email functionality will be disabled');
      return null;
    }
    
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return null;
  }
};

const transporter = createTransporter();

function generateVerificationToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

async function sendVerificationEmail(user, token) {
  // Check if transporter is available
  if (!transporter) {
    console.warn('Email transporter not available - skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const verifyUrl = `http://localhost:5173/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: '🔐 Verify Your Email - TaskFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Welcome to Todo App!</h2>
        <p>Hi ${user.username || 'there'},</p>
        <p>Thank you for registering with Todo App. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #3B82F6;">${verifyUrl}</p>
        <p style="margin-top: 30px; color: #666;">
          This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          This is an automated message from Todo App. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
      Welcome to Todo App!
      
      Hi ${user.username || 'there'},
      
      Thank you for registering with Todo App. Please verify your email address by clicking the link below:
      
      ${verifyUrl}
      
      This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
      
      Best regards,
      Todo App Team
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
};
