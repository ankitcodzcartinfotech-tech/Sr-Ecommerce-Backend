const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({

    categoryType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseCategories',
        required: true
    },

    expenseName: {
        type: String,
        required: true
    },

    expenseAmount: {
        type: Number,
        required: true
    },

    date: {
        type: String
    },

    image: {
        type: String
    },

    remarks: {
        type: String,
    },
    
},{
    versionKey:false,
    timestamps:true
})

const expenseModel = mongoose.model('Expense', expenseSchema)
module.exports = expenseModel