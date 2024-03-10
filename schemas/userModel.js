const mongoose = require('mongoose');

// Define schema
const signUpSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        // Validate email format using regular expression
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
    },
    accountBalance: {
        type: Number,
        default: 0,
    }
});

// Create model from schema
const SignUp = mongoose.model('SignUp', signUpSchema);

module.exports = SignUp;
