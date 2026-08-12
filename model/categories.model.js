const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    hsnCode: {
        type: String,
        required: true
    },

    categoryLogo: {
        type: String,
        default: ""
    }

},{
    versionKey: false,
    timestamps: true
});

const Categories = mongoose.model('Categories', categoriesSchema);
module.exports = Categories;