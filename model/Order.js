const mongoose = require('mongoose');

let OrderSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    },  
    curryType: {
        type: String,
        required: true
    } 
});

let Order = module. exports = mongoose.model('Order', OrderSchema);

// module.exports = Order;
