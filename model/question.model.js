const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

const questionSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    answers: [answerSchema]
}, {
    versionKey: false,
    timestamps: true
});

questionSchema.index({ product: 1 });
questionSchema.index({ user: 1 });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
