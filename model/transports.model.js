const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({

    transportName: {
        type: String,
        required: true
    },
    
    mobileNumber: {
        type: Number,
        required: true
    },

    mobileNumber2: {
        type: Number,
        required: false
    },

    gst: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    transportCity: {
        type: String,
        required: true
    },
    
},{
    versionKey: false,
    timestamps: true
});

const Transports = mongoose.model('Transports', transportSchema);
module.exports = Transports;