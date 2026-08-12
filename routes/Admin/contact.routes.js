const express = require('express');
const router = express.Router();
const adminContactController = require('../../controller/Admin/admin-contact.controller');

router.get('/', adminContactController.getAllContacts);
router.put('/:id/status', adminContactController.updateContactStatus);
router.delete('/:id', adminContactController.deleteContact);

module.exports = router;