const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    stateName:{
        type:String,
        required:true
    },

    stateCode:{
        type:String,
        required:true
    },

    alphaCode:{
        type:String,
        required:true
    }
},{
    versionKey:false,
    timestamps:true
});

const States = mongoose.model('States', stateSchema);
module.exports = States;
