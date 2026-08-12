const jwt = require('jsonwebtoken');
const USER = require('../model/user.model');

exports.userVerifyToken = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authorization denied: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await USER.findById(decoded.id).select('-password').lean();
            if (!user) {
                return res.status(401).json({ success: false, message: 'Authorization denied: User not found' });
            }
            req.user = user;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token expired' });
            }
            return res.status(401).json({ success: false, message: 'Token is not valid' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
