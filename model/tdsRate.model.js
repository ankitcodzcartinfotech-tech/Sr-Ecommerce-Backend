const mongoose = require('mongoose');

const tdsRateSchema = new mongoose.Schema({

    taxName: {
        type: String,
        required: true
    },

    sectionName: {
        type: String,
        required: true
    },

    rate: {
        type: Number, // rate provide in percentage
        required: true
    }

},{
    versionKey:false,
    timestamps:true
})

const tdsRateModel = mongoose.model('TdsRate', tdsRateSchema)
module.exports = tdsRateModel