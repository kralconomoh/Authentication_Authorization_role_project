const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema({
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

    adminId: {
        type: String,
        required: true
    },
    
    type: {
        type: String,
        default: 'isAdmin'
    }
},{ timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);