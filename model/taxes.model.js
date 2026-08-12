const mongoose = require('mongoose');

const taxTypeSchema = new mongoose.Schema({

    taxName: {
        type: String,
        required: true
    },

    taxValue: {
        type: String,
        required: true
    }

},{
    versionKey: false,
    timestamps: true
})

const taxesModel = mongoose.model('TaxType', taxTypeSchema)
module.exports = taxesModel