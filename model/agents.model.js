const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
    
    profileImage: {
        type: String,
        default: ""
    },

    name: {
        type: String,
        required: true
    },

    panNumber: {
        type: String,
        required: true
    },

    mobileNumber: {
        type: Number,
        required: true
    },

    commission: {
        type: Number,
        required: true
    },

    creditPeriod: {
        type: Number,
        required: true
    },

    creditLimit: {
        type: Number,
        required: true
    },

    address: {
        type: String,
        required: true
    },
    
},{
    versionKey: false,
    timestamps: true
});

const Agent = mongoose.model('Agent', agentSchema);
module.exports = Agent;
