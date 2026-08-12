const { required } = require('joi');
const mongoose = require('mongoose');

const partiesSchema = new mongoose.Schema({

    generalDetails: {
        profileImage: {
            type: String,
            default: ""
        },

        partyType: {
            type: Number,
            enum: [1, 2, 3] //  1 = Customer, 2 = Supplier, 3 = Job Work
        },

        partyName: {
            type: String,
            required: true
        },

        legalName: {
            type: String,
            default: ""
        },

        ledgerHead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LedgerHead'
        },

        email: {
            type: String,
            required: true
        },

        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            required: true
        },

        mobileNumber: {
            type: Number,
            required: true
        },
    },
    
    bankDetail: {
        gstNo: {
            type: String,
            required: true
        },

        panNumber: {
            type : String,
            required:true
        },

        openingBalance: {
            type: Number,
            default: 0
        },

        balanceStatus: {
            type: String,
            enum: [1, 2], // 1- To Collect, 2- To pay
            required: true
        },

        creditPeriod: {
            type: Number,
            default: 0
        },

        creditLimit: {
            type: Number,
            default: 0
        },
        
        bankName: {
            type: String,
            default: ""
        },

        bankAccountNumber: {
            type: String
        },
        
        bankBranchName: {
            type: String
        },

        bankIFSC: {
            type: String,   
            required: true
        }
    },

    billingAddress : {
        streetAddress: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String
        },
        city: {
            type: String,
            required: true
        }
    },

    shippingAddress : {
        streetAddress: {
            type: String
        },
        state: {
            type: String
        },
        pincode: {
            type: String
        },
        city: {
            type: String
        }
    }


},{
    versionKey : false,
    timestamps : true
});

const Parties = mongoose.model('Parties',partiesSchema);
module.exports = Parties;