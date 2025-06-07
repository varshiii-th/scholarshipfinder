const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const EmailVerification = require('../model/userVerification');
const nodemailer = require('nodemailer');
const User = require('../model/user');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// node mailer transporter
let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.NODE_MAILER_PASS
    }
});

const sendVerificationEmail = async ({ username, email }) => {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        console.log('=== NEW VERIFICATION PROCESS ===');
        console.log('Email:', normalizedEmail);

        // Check if user exists
        const userData = await User.findOne({ email: normalizedEmail });
        if (!userData) {
            throw new Error("User not found");
        }

        // Clean up existing records
        await EmailVerification.deleteMany({ userEmail: normalizedEmail });
        console.log('Cleaned up existing records');

        const otp = getRandomInt(1000, 9999);
        const hashedOtp = await bcrypt.hash(otp.toString(), 10);

        console.log('Generated OTP:', otp);

        const verificationData = {
            userEmail: normalizedEmail,
            userOtp: hashedOtp,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 3600000)
        };
        console.log("Sanity Check - verificationData:", verificationData);

        const savedRecord = await EmailVerification.create(verificationData);
        console.log('✅ New verification record created:', {
            id: savedRecord._id,
            userEmail: savedRecord.userEmail,
            hasUserOtp: !!savedRecord.userOtp,
            createdAt: savedRecord.createdAt,
            expiresAt: savedRecord.expiresAt
        });

        // Send email
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Verify Your Email Address to Complete Signup',
            html: `
                <p>Verify your email address to complete the signup process. This OTP expires in <b>1 hour</b>.</p>
                <p>Your username: ${username}</p>
                <p>Email: ${email}</p>
                <p>OTP: <b>${otp}</b></p>
            `,
        };

        const emailResult = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', emailResult);

        return { status: "Success", message: "Verification email sent successfully." };
    } catch (error) {
        console.error('❌ Error in sendVerificationEmail:', error);
        throw error;
    }
};

module.exports = sendVerificationEmail;
