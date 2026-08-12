const EMPLOYEE = require('../model/employee.model');
const { addEmployeeSchema, updateEmployeeSchema, validateBodyData } = require('../helper/validator');
const { getProfileImage } = require('../helper/image');

const parseEmployeeBody = (body) => {
    const parsed = { ...body };
    const numberFields = ['mobileNumber1', 'mobileNumber2', 'mobileNumber3', 'salary'];

    numberFields.forEach((field) => {
        if (parsed[field] !== undefined && parsed[field] !== '') {
            parsed[field] = Number(parsed[field]);
        } else if (parsed[field] === '') {
            delete parsed[field];
        }
    });

    return parsed;
};


exports.addEmployee = async (req, res) => {
    try {
        const photo = await getProfileImage(req, 'photo', 'employees');
        const { error, value } = validateBodyData(addEmployeeSchema, {
            ...parseEmployeeBody(req.body),
            photo
        });

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const employee = await EMPLOYEE.create(value);

        res.status(201).json({ message: `Employee create successfully....`, employee });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getEmployees = async (req, res) => {
    try {
        const employees = await EMPLOYEE.find().sort({ createdAt: -1 });

        res.status(200).json({ message: `Employees fetched successfully....`, employees });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await EMPLOYEE.findById(id);

        if (!employee) {
            return res.status(404).json({ message: `Employee not found` });
        }

        res.status(200).json({ message: `Employee fetched successfully....`, employee });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const body = parseEmployeeBody(req.body);
        const uploadedPhoto = await getProfileImage(req, 'photo', 'employees');
        if (uploadedPhoto) {
            body.photo = uploadedPhoto;
        }

        const { error, value } = validateBodyData(updateEmployeeSchema, body);

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const employee = await EMPLOYEE.findById(id);

        if (!employee) {
            return res.status(404).json({ message: `Employee not found` });
        }

        const updatedEmployee = await EMPLOYEE.findByIdAndUpdate(
            id,
            value,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ message: `Employee updated successfully....`, employee: updatedEmployee });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await EMPLOYEE.findByIdAndDelete(id);

        if (!employee) {
            return res.status(404).json({ message: `Employee not found` });
        }

        res.status(200).json({ message: `Employee deleted successfully....` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};
