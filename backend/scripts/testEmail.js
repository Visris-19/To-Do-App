const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sendVerificationEmail, generateVerificationToken } = require('../utils/emailService');

async function testEmailSetup() {
    console.log('🧪 Testing Email Configuration...\n');
    
    // Check if environment variables are loaded
    console.log('🔧 Environment Check:');
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}\n`);
    
    // Check if email environment variables are set
    console.log('📧 Email Configuration:');
    console.log(`HOST: ${process.env.EMAIL_HOST || 'Not set'}`);
    console.log(`PORT: ${process.env.EMAIL_PORT || 'Not set'}`);
    console.log(`USER: ${process.env.EMAIL_USER || 'Not set'}`);
    console.log(`PASS: ${process.env.EMAIL_PASS ? '***Hidden***' : 'Not set'}`);
    console.log(`FROM: ${process.env.EMAIL_FROM || 'Not set'}\n`);
    
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('❌ Email configuration incomplete!');
        console.log('💡 Please update your .env file with:');
        console.log('   EMAIL_USER=your-gmail@gmail.com');
        console.log('   EMAIL_PASS=your-16-character-app-password');
        console.log('   EMAIL_FROM=your-gmail@gmail.com');
        return;
    }
    
    if (!process.env.JWT_SECRET) {
        console.log('❌ JWT_SECRET not found in environment variables!');
        return;
    }
    
    // Test email sending
    const testUser = {
        email: process.env.EMAIL_FROM, // Use the FROM address as test recipient
        username: 'Test User'
    };
    
    try {
        const testToken = generateVerificationToken('test-user-id');
        console.log('📤 Sending test verification email...');
        
        const result = await sendVerificationEmail(testUser, testToken);
        
        if (result.success) {
            console.log('✅ Email sent successfully!');
            console.log(`Message ID: ${result.messageId}`);
            console.log('\n🎉 Email configuration is working correctly!');
            console.log(`Check your inbox at: ${testUser.email}`);
        } else {
            console.log('❌ Email failed to send');
            console.log(`Error: ${result.error}`);
        }
    } catch (error) {
        console.log('❌ Email test failed');
        console.log(`Error: ${error.message}`);
        console.log('\n💡 Common fixes:');
        console.log('- Check if Gmail App Password is correctly set');
        console.log('- Ensure 2FA is enabled on your Gmail account');
        console.log('- Verify EMAIL_USER and EMAIL_PASS in .env file');
    }
}

// Run the test
testEmailSetup();
