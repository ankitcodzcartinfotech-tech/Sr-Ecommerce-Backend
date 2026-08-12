const jwt = require('jsonwebtoken');
const ADMIN = require('../model/admin.model');

exports.adminVerifyToken = async(req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization denied: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await ADMIN.findById(decoded.id).select('-password').lean();
            if (!admin) {
                return res.status(401).json({ message: 'Authorization denied: Admin not found' });
            }
            req.user = admin;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Token is not valid' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message : `Internal server error` });
    }
}
