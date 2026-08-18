const bcrypt = require('bcrypt');
const ADMIN = require('../model/admin.model');
const JWT = require('jsonwebtoken');
const { adminLoginSchema, adminRegisterSchema, updateAdminProfileSchema, validateBodyData } = require('../helper/validator');

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+=\-\[\]{};':"\\|,.<>~`])[A-Za-z\d@$!%*?&^#()_+=\-\[\]{};':"\\|,.<>~`]{8,}$/;

exports.register = async(req,res) => {
    try {
        const { error, value } = validateBodyData(adminRegisterSchema, req.body);
        if (error) {
            return res.status(400).json({ message: error.errors?.[0] || error.message, errors: error.errors });
        }

        const { name, email, password } = value;
        const normalizedEmail = email.trim().toLowerCase();
        
        const existingAdmin = await ADMIN.findOne({ email: normalizedEmail });

        if(existingAdmin){
            return res.status(400).json({ message : `Admin is already registered with this email` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await ADMIN.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({ message : `Admin registered successfully` });
        
    } catch (error) {
        console.error("Admin register error:", error);
        res.status(500).json({ message : `Internal server error` });
    }
};

exports.login = async(req,res) => {
    try {
        let { email, password } = req.body;

        // Validation for email
        if (!email || typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ message : `Email is required` });
        }

        email = email.trim().toLowerCase();

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message : `Please enter a valid email address` });
        }

        // Validation for password
        if (!password || typeof password !== 'string' || !password.trim()) {
            return res.status(400).json({ message : `Password is required` });
        }

        if (password.length < 8) {
            return res.status(400).json({ message : `Password must be at least 8 characters long` });
        }

        const admin = await ADMIN.findOne({ email });

        if(!admin){
            return res.status(401).json({ message : `Invalid email or password` });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if(!isPasswordValid){
            return res.status(401).json({ message : `Invalid email or password` });
        }

        const token = JWT.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message : `Admin logged in successfully`,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                image: admin.image || ""
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message : `Internal server error` });
    }
};

exports.get = async(req,res)=>{
    try {
        const admin = req.user;

        if(!admin){
            return res.status(401).json({ message : `Admin not found` });
        }

        const adminData = typeof admin.toObject === 'function' ? admin.toObject() : { ...admin };
        delete adminData.password;

        res.status(200).json({ message : `Admin fetched successfully`, admin: adminData });

    } catch (error) {
        console.error("Admin get profile error:", error);
        res.status(500).json({ message : `Internal server error` });
    }
};

exports.update = async(req,res) => {
    try {
        const adminId = req.user?.id || req.user?._id;

        if(!adminId){
            return res.status(401).json({ message : `Admin not found` });
        }

        const body = { ...req.body };

        // Validate email if provided
        if (body.email) {
            body.email = body.email.trim().toLowerCase();
            if (!emailRegex.test(body.email)) {
                return res.status(400).json({ message: 'Please enter a valid email address' });
            }

            // Check if email already taken by another admin
            const duplicate = await ADMIN.findOne({ email: body.email, _id: { $ne: adminId } });
            if (duplicate) {
                return res.status(400).json({ message: 'This email is already in use by another admin' });
            }
        }

        // Validate and hash password if provided and not empty
        if (body.password && body.password.trim() !== "") {
            if (body.password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long' });
            }
            if (!strongPasswordPattern.test(body.password)) {
                return res.status(400).json({
                    message: 'Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character'
                });
            }
            body.password = await bcrypt.hash(body.password, 10);
        } else {
            delete body.password;
        }

        // Handle uploaded image
        const { getProfileImage } = require('../helper/image');
        const uploadedImage = await getProfileImage(req, 'image', 'admins');
        if (uploadedImage) {
            body.image = uploadedImage;
        }

        const updatedAdmin = await ADMIN.findByIdAndUpdate(adminId, body, { returnDocument: 'after', runValidators: true }).select("-password");
        
        res.status(200).json({ message : `Admin updated successfully`, admin: updatedAdmin });
        
    } catch (error) {
        console.error("Admin update profile error:", error);
        res.status(500).json({ message : `Internal server error` });
    }
};