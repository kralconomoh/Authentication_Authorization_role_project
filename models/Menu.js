const mongoose = require('mongoose');

const MenuSchema = mongoose.Schema({
    // PROPERTIES OF A ADMIN USER
    menu_type: {
        type: String,
    },
    menu_items: [{
        name: {
            type: String,
        },
        price: {
            type: Number,
        }
    }]
},{ timestamps: true });

module.exports = mongoose.model('Menu', MenuSchema);