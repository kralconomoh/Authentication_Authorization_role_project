const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    // PROPERTIES OF A ADMIN USER
    name: {
        type: String,
        required: true,
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

},{ timestamps: true });

module.exports = mongoose.model('CustomerUser', UserSchema);