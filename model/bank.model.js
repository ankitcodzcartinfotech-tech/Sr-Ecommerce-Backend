const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    bankName: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    openingBalance: {
        type: Number
    },
    asOfDate: {
        type: Date
    },

    addBankDetails: {
        bankAccountNumber: {
            type: String
        },
        ifscCode: {
            type: String
        },
        branchName: {
            type: String
        },
        accountHoldersName: {
            type: String
        },
        upiId: {
            type: String
        }
    }

}, {
    versionKey: false,
    timestamps: true
});

const Bank = mongoose.model("Bank", bankSchema);
module.exports = Bank;