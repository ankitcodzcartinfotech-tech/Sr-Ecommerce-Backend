const express = require('express');
const router = express.Router();
const roleController = require('../../controller/role.controller');
const { validateBody, addRoleSchema, updateRoleSchema } = require('../../helper/validator');

router.post('/', validateBody(addRoleSchema), roleController.addRole);
router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRole);
router.put('/:id', validateBody(updateRoleSchema), roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;
