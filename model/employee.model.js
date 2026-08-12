const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },

    mobileNumber1: {
        type: Number,
        required: true
    },

    mobileNumber2: {
        type: Number
    },

    mobileNumber3: {
        type: Number
    },

    address: {
        type: String,
        required: true
    },

    aadharCardNumber: {
        type: String,
        required: true
    },

    panCardNumber: {
        type: String,
        required: true
    },

    salary: {
        type: Number,
        required: true
    },

    photo: {
        type: String,
        default: ""
    }
    
},{
    versionKey: false,
    timestamps: true
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;