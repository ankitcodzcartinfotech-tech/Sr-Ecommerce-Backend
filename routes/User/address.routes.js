const express = require('express');
const router = express.Router();
const addressController = require('../../controller/address.controller');

router.post('/add', addressController.addAddress);
router.post('/', addressController.addAddress);

router.get('/', addressController.getAddresses);

router.get('/pincode/:pincode', addressController.validatePincode);
router.get('/validate-pincode/:pincode', addressController.validatePincode);

router.get('/:addressId', addressController.getAddressById);
router.put('/:addressId', addressController.updateAddress);

router.put('/:addressId/set-default', addressController.setDefaultAddress);
router.put('/:addressId/default', addressController.setDefaultAddress);
router.patch('/:addressId/default', addressController.setDefaultAddress);

router.delete('/:addressId', addressController.deleteAddress);

module.exports = router;
