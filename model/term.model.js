const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
    
    name:{
        type: String,
        required: true
    }

},{
    versionKey:false,
    timestamps:true
})

const termModel = mongoose.model('Term', termSchema)
module.exports = termModel