const mongoose = require('mongoose');

const StaffSchema = mongoose.Schema({
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

    isActive: {
        type: Boolean,
        default: true
    },
    
    isManager: {
        type: Boolean,
        default: false
    }

    // isManager: {
    //     type: Boolean,
    //     default: 0
    // },
    // isStaff: {
    //     type: Boolean,
    //     default: 0
    // }
},{ timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);