// userVerification.js
const mongoose = require("mongoose");

const userVerificationSchema = mongoose.Schema({
    userEmail: String,
    userOtp: String, // Use String for hashed OTP
    createdAt: Date,
    expiresAt: Date
});

const EmailVerification = mongoose.model('EmailVerification', userVerificationSchema);

module.exports = EmailVerification;