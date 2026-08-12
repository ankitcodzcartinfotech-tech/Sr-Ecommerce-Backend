const mongoose = require('mongoose');

const cashBankSchema = new mongoose.Schema({

    moneyIn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank',
        required: true
    },

    date: {
        type: String
    },

    amount: {
        type: Number,
    },

    remarks: {
        type: String,
    }
    
},{
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('CashAndBank', cashBankSchema);