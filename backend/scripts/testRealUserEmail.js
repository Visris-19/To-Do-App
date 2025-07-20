const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sendVerificationEmail, generateVerificationToken } = require('../utils/emailService');

async function testRealUserEmail() {
    console.log('🧪 Testing Real User Email Flow...\n');
    
    // Simulate a real user registration
    const realUser = {
        email: 'testuser@example.com',  // This would be the user's actual email
        username: 'TestUser123',
        _id: 'test-user-id-12345'
    };
    
    console.log('👤 Simulating registration for user:');
    console.log(`   Email: ${realUser.email}`);
    console.log(`   Username: ${realUser.username}\n`);
    
    try {
        const token = generateVerificationToken(realUser._id);
        console.log('📤 Sending verification email to user\'s email address...');
        
        const result = await sendVerificationEmail(realUser, token);
        
        if (result.success) {
            console.log('✅ Email sent successfully!');
            console.log(`📧 Email was sent to: ${realUser.email}`);
            console.log(`📨 Message ID: ${result.messageId}`);
            console.log('\n🎉 The user will receive the email in their inbox!');
            console.log(`🔗 Verification URL: http://localhost:3000/verify-email?token=${token}`);
        } else {
            console.log('❌ Email failed to send');
            console.log(`Error: ${result.error}`);
        }
    } catch (error) {
        console.log('❌ Email test failed');
        console.log(`Error: ${error.message}`);
    }
}

// Run the test
testRealUserEmail();
