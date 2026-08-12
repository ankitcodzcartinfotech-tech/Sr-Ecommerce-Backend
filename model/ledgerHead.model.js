const { required } = require('joi');
const mongoose = require('mongoose');

const ledgerHeadSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },

    accountHeadName: {
        type: String,
        required: true
    },

    accountType: {
        type: String,
        enum: ['Expence','Liability','Income','Asset'],
        required: true
    }

},{
    versionKey: false,
    timestamps: true
});

const LedgerHead = mongoose.model('LedgerHead', ledgerHeadSchema);
module.exports = LedgerHead;