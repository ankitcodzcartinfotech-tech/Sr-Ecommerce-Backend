const Address = require('../model/address.model');

exports.addAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, phone: reqPhone, mobileNumber, addressLine1, addressLine2 = '', city, state, pincode, country = 'India', addressType = 'Home', isDefault = false } = req.body;
        const phone = reqPhone || mobileNumber;

        if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: 'fullName, phone, addressLine1, city, state and pincode are required' });
        }

        if (isDefault) {
            await Address.updateMany({ user: userId }, { isDefault: false });
        }

        const existingCount = await Address.countDocuments({ user: userId });

        // Check for existing identical address to prevent duplicates
        const existingAddress = await Address.findOne({
            user: userId,
            fullName,
            phone,
            addressLine1,
            addressLine2: addressLine2 || '',
            city,
            state,
            pincode,
            country
        });

        if (existingAddress) {
            if (isDefault && !existingAddress.isDefault) {
                existingAddress.isDefault = true;
                await existingAddress.save();
            }
            return res.status(200).json({
                success: true,
                message: 'Address already exists',
                address: existingAddress
            });
        }

        const address = await Address.create({
            user: userId,
            fullName,
            phone,
            addressLine1,
            addressLine2: addressLine2 || '',
            city,
            state,
            pincode,
            country,
            addressType,
            isDefault: existingCount === 0 ? true : isDefault
        });

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user._id;

        const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Addresses fetched successfully',
            addresses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getAddressById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;

        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Address fetched successfully',
            address
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;
        const { fullName, phone: reqPhone, mobileNumber, addressLine1, addressLine2, city, state, pincode, country, addressType, isDefault } = req.body;
        const phone = reqPhone || mobileNumber;

        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        if (isDefault) {
            await Address.updateMany({ user: userId, _id: { $ne: addressId } }, { isDefault: false });
        }

        if (fullName !== undefined) address.fullName = fullName;
        if (phone !== undefined) address.phone = phone;
        if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (pincode !== undefined) address.pincode = pincode;
        if (country !== undefined) address.country = country;
        if (addressType !== undefined) address.addressType = addressType;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await address.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            address
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;

        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        await Address.updateMany({ user: userId }, { isDefault: false });

        address.isDefault = true;
        await address.save();

        res.status(200).json({
            success: true,
            message: 'Default address set successfully',
            address
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId } = req.params;

        const address = await Address.findOneAndDelete({ _id: addressId, user: userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        if (address.isDefault) {
            const nextAddress = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.validatePincode = async (req, res) => {
    try {
        const { pincode } = req.params;

        if (!pincode || pincode.length !== 6) {
            return res.status(400).json({ success: false, message: 'Invalid pincode length' });
        }

        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            return res.status(200).json({
                success: true,
                message: 'Pincode validated successfully',
                data: {
                    city: postOffice.District || postOffice.Block,
                    state: postOffice.State,
                    country: postOffice.Country
                }
            });
        } else {
            return res.status(404).json({ success: false, message: 'Invalid pincode' });
        }
    } catch (error) {
        console.error('Error validating pincode:', error);
        res.status(500).json({ success: false, message: 'Internal server error while validating pincode' });
    }
};