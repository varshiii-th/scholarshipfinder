const User = require('../model/user');
const userverification = require('../model/userVerification');
const bcrypt = require('bcrypt');
const sendVerificationEmail = require('./sendVerificationEmail');

function isPastDate(dateStr) {
    const inputDate = new Date(dateStr);
    const today = new Date();

    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return inputDate < today;
}

const userSignUp = async (req, res) => {
    try {
        let { username, email, password, dateOfBirth, CGPA, Course, Branch, country } = req.body;
        username = username.trim();
        email = email.trim();
        password = password.trim();
        dateOfBirth = dateOfBirth;
        Course = Course.trim();
        Branch = Branch.trim();
        country = country.trim();
        CGPA = Number(CGPA);

        if (!username || !email || !password || !dateOfBirth || !Course || !Branch || !country) {
            return res.json({
                status: "Failed",
                message: "Enter all required input fields",
                entered: { username, email, password, dateOfBirth, Course, Branch, country }
            });
        } else if (!/^[a-zA-Z\s]*$/.test(username)) {
            return res.json({
                status: "Failed",
                message: "Invalid name entered"
            });
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return res.json({
                status: "Failed",
                message: "Invalid email entered"
            });
        } else if (!isPastDate(dateOfBirth)) {
            return res.json({
                status: "Failed",
                message: "Date Of Birth is wrong"
            });
        } else if (CGPA < 0 || CGPA > 10) {
            return res.json({
                status: "Failed",
                message: "CGPA must be between 0 and 10"
            });
        } else if (!/^[a-zA-Z\s]*$/.test(Branch)) {
            return res.json({
                status: "Failed",
                message: "Invalid branch entered"
            });
        } else if (!['Undergraduate', 'Postgraduate', 'PhD'].includes(Course)) {
            return res.json({
                status: "Failed",
                message: "Invalid course selected"
            });
        } else if (!['India', 'Abroad'].includes(country)) {
            return res.json({
                status: "Failed",
                message: "Invalid country selected"
            });
        } else if (password.length < 8) {
            return res.json({
                status: "Failed",
                message: "Password is too short"
            });
        } else {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.json({
                    status: "Failed",
                    message: "User with the provided email already exists"
                });
            } else {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const newUser = new User({
                    username,
                    email,
                    password: hashedPassword,
                    verified: false,
                    dateOfBirth,
                    CGPA,
                    Branch,
                    Course,
                    country
                });
                console.log('New user details before saving:', newUser);
                const result = await newUser.save();
                console.log('User saved:', result);
                res.json({
                    status: "Success",
                    message: "Signup successful! Please verify your email.",
                    result
                });
                sendVerificationEmail(result).catch((err) => {
                    console.error("Email sending failed:", err.message);
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.json({
            status: "Failed_end",
            message: "An error occurred during the sign-up process",
            error: err.message
        });
    }
};

module.exports = userSignUp;