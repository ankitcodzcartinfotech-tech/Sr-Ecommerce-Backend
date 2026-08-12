const bcrypt = require('bcrypt');
const ADMIN = require('../model/admin.model');
const JWT = require('jsonwebtoken');

exports.register = async(req,res) => {
    try {
        const {name, email, password} = req.body;
        
        const existingAdmin = await ADMIN.findOne({ email });

        if(existingAdmin){
            return res.status(400).json({ message : `Admin is already registered` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await ADMIN.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message : `Admin registered successfully` });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message : `Internal server error` });
    }
};

exports.login = async(req,res) => {
    try {
        const {email, password} = req.body;

        const admin = await ADMIN.findOne({ email });

        if(!admin){
            return res.status(401).json({ message : `Admin not found` });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if(!isPasswordValid){
            return res.status(401).json({ message : `Invalid password` });
        }

        const token = JWT.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message : `Admin logged in successfully`, token });

    } catch (error) {
        console.log(error);
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
        console.log(error);
        res.status(500).json({ message : `Internal server error` });
    }
};

exports.update = async(req,res) => {
    try {
        const adminId = req.user.id;

        if(!adminId){
            return res.status(401).json({ message : `Admin not found` });
        }

        const body = { ...req.body };

        // Hash password if provided and not empty
        if (body.password && body.password.trim() !== "") {
            const bcrypt = require('bcrypt');
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
        console.log(error);
        res.status(500).json({ message : `Internal server error` });
    }
}