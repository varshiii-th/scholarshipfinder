const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique:true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    CGPA: {
        type: Number,
        required: true
    },
    Course: {
        type: String,
        required: true,
        enum: ['Undergraduate', 'Postgraduate','Doctoral']

    },
    Branch: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        enum: ['India', 'Abroad']
    },
    verified: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;