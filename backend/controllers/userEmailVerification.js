const User = require('../model/user');
const bcrypt = require('bcrypt');
const EmailVerification = require('../model/userVerification');

const userEmailVerification = async (req, res) => {
    try {
        let { email, otp } = req.body;
        email = email.trim().toLowerCase();
        otp = otp.trim();

        console.log('=== NEW VERIFICATION ATTEMPT ===');
        console.log('Request body:', req.body);

        if (!email || !otp) {
            return res.status(400).json({
                status: "Failed",
                message: "Empty credentials supplied."
            });
        }

        const verificationRecords = await EmailVerification.find({ userEmail: email });
        console.log('Records found with new schema:', verificationRecords.length);

        if (verificationRecords.length === 0) {
            const allRecords = await EmailVerification.find({});
            console.log('All verification records:', allRecords.length);
            allRecords.forEach((record, index) => {
                console.log(`Record ${index + 1}:`, {
                    userEmail: record.userEmail,
                    hasUserOtp: !!record.userOtp,
                    createdAt: record.createdAt,
                    expiresAt: record.expiresAt
                });
            });

            return res.status(404).json({
                status: "Failed",
                message: "No verification record found. Please signup again."
            });
        }

        const record = verificationRecords[0];
        console.log('Found record:', {
            userEmail: record.userEmail,
            hasUserOtp: !!record.userOtp,
            userOtpLength: record.userOtp?.length,
            expiresAt: record.expiresAt
        });

        if (new Date(record.expiresAt) < new Date()) {
            console.log('Record expired');
            await EmailVerification.deleteOne({ userEmail: email });
            return res.status(410).json({
                status: "Failed",
                message: "OTP expired. Please signup again."
            });
        }

        const isValidOtp = await bcrypt.compare(otp, record.userOtp);
        console.log('OTP valid:', isValidOtp);

        if (!isValidOtp) {
            return res.status(401).json({
                status: "Failed",
                message: "Invalid OTP. Please check your email."
            });
        }

        await User.updateOne({ email }, { verified: true });
        await EmailVerification.deleteOne({ userEmail: email });
        
        console.log('✅ Verification successful');

        return res.status(200).json({
            status: "Success",
            message: "Email verified successfully."
        });
    } catch (error) {
        console.error('❌ Verification error:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                status: "Failed",
                message: "Verification failed.",
                error: error.message
            });
        }
    }
};
module.exports = { userEmailVerification };