const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true
    }
    
},{
    versionKey:false,
    timestamps:true
})

const expenseModel = mongoose.model('ExpenseCategories', expenseSchema)
module.exports = expenseModel