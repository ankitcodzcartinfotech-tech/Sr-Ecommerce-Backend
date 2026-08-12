const Question = require('../model/question.model');
const Product = require('../model/product.model');

exports.askQuestion = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const userId = req.user._id;
        const { question } = req.body;

        if (!question || question.trim() === '') {
            return res.status(400).json({ success: false, message: 'Question cannot be empty' });
        }

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const newQuestion = await Question.create({
            product: productId,
            user: userId,
            question
        });

        // Populate user so frontend shows name immediately
        const populated = await Question.findById(newQuestion._id)
            .populate('user', 'name profileImage');

        res.status(201).json({
            success: true,
            message: 'Question posted successfully',
            data: populated
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error while posting question' });
    }
};

exports.getQuestionsForProduct = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const questions = await Question.find({ product: productId })
            .populate('user', 'name profileImage')
            .populate('answers.user', 'name profileImage')
            .populate('answers.admin', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Question.countDocuments({ product: productId });

        res.status(200).json({
            success: true,
            message: 'Questions fetched successfully',
            data: questions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching questions' });
    }
};

exports.answerQuestion = async (req, res) => {
    try {
        const { id: questionId } = req.params;
        const { answer } = req.body;
        
        // This controller can be used by both User and Admin depending on the route.
        // req.user might be an Admin or a User.
        const userId = req.user ? req.user._id : null;
        
        // Let's assume if role is not present or it is admin route, we identify admin.
        // The project has distinct admin and user models, but normally we would know from the token.
        // Since we are creating this primarily for users but admins could also answer.
        // For now, we will associate it with 'user' if it comes from the user route.
        
        if (!answer || answer.trim() === '') {
            return res.status(400).json({ success: false, message: 'Answer cannot be empty' });
        }

        const question = await Question.findById(questionId).populate('user', 'name');
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const newAnswer = {
            answer,
            // If the route was protected by user auth, use `user`. If protected by admin auth, use `admin`
            // For simplicity, we just use user since this is under /api/user.
            user: userId
        };

        question.answers.push(newAnswer);
        await question.save();

        // Re-fetch with full population so frontend gets user names on answers
        const populated = await Question.findById(questionId)
            .populate('user', 'name profileImage')
            .populate('answers.user', 'name profileImage')
            .populate('answers.admin', 'name image');

        res.status(201).json({
            success: true,
            message: 'Answer posted successfully',
            data: populated
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error while posting answer' });
    }
};

exports.upvoteAnswer = async (req, res) => {
    try {
        const { id: answerId } = req.params;
        const userId = req.user._id;

        const question = await Question.findOne({ 'answers._id': answerId });
        
        if (!question) {
            return res.status(404).json({ success: false, message: 'Answer not found' });
        }

        const answer = question.answers.id(answerId);
        
        const upvoteIndex = answer.upvotes.indexOf(userId);
        
        if (upvoteIndex === -1) {
            // Not upvoted yet, add upvote
            answer.upvotes.push(userId);
        } else {
            // Already upvoted, remove upvote
            answer.upvotes.splice(upvoteIndex, 1);
        }

        await question.save();

        // Re-fetch with population so upvote count reflects correctly
        const populated = await Question.findOne({ 'answers._id': answerId })
            .populate('user', 'name profileImage')
            .populate('answers.user', 'name profileImage');

        res.status(200).json({
            success: true,
            message: upvoteIndex === -1 ? 'Answer upvoted successfully' : 'Upvote removed',
            data: populated
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error while upvoting answer' });
    }
};
