const express = require('express');
const router = express.Router();
const employeeController = require('../../controller/employee.controller');
const { upload } = require('../../helper/upload');

router.post('/', upload.single('photo'), employeeController.addEmployee);
router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployee);
router.put('/:id', upload.single('photo'), employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
