const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    // PROPERTIES OF A ADMIN USER
    mealname: {
        type: String,
        required:true
    },
    menu_type: {
        type: String,
        required:true
    },
    mealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'meal'
    },
    usermail: {
        type: String
    },
    isActive: {
        type: Boolean,
        default:true
    },
    takenBy: {
        type: String,
        default: 'No One'
    },
},{ timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);